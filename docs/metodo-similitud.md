# Método de similitud y clasificación de sitios

Guía para el rol 4. Explica cómo calcular los puntajes que la web muestra y cómo agrupar los sitios.
Complementa a la [guía de entrega](contrato-rol-4.md), que define el formato del archivo.

## Resumen

- **No se entrena ningún modelo.** No hay ejemplos etiquetados: son unos 30 sitios y 2 o 3 objetivos.
- Cada sitio y cada objetivo es un **vector de características**: un valor por dimensión.
- Se calcula una **similitud de 0 a 1 por dimensión** y luego una **media ponderada**.
- El aprendizaje automático entra sin etiquetas: agrupamiento de sitios, detección de dimensiones
  redundantes y prueba de estabilidad del ranking.

## Por qué no otras opciones

| Opción | Problema |
|---|---|
| Red neuronal | Necesita cientos de ejemplos etiquetados. Tampoco explica en qué se parece cada sitio |
| Distancia euclidiana directa | Mezcla unidades (°C, m, mm), da un solo número y cuenta doble las variables correlacionadas |
| Distancia de Mahalanobis o componentes principales | Corrigen la correlación, pero se pierde el puntaje por dimensión que pide la web |

## Entradas

| Archivo | Quién lo entrega | Contenido |
|---|---|---|
| `catalogo-sitios.csv` | Ya está en `docs/` | `id`, nombre, coordenadas, radio y marcas de cada sitio |
| `sitios_valores.csv` | Rol 2 | Una fila por sitio: `id` y una columna por dimensión |
| `objetivos_valores.csv` | Rol 3 | Una fila por objetivo: `id` y las mismas columnas |

Hay una primera versión medida de los dos archivos en [`valores/`](valores/README.md): relieve con el
mismo paso en los dos cuerpos y clima, con sus fuentes y sus límites.

Cada valor es la media o la mediana de la variable dentro del radio del sitio. Un dato que falta se
deja vacío, no en cero.

## Cálculo

### 1. Escala de cada dimensión

La diferencia entre la Tierra y el objetivo se divide entre una escala, para que todas las
dimensiones queden entre 0 y 1 sin importar su unidad.

- Escala por defecto: rango entre los percentiles 5 y 95 de la variable en la muestra de
  referencia, ampliado para incluir el valor de los objetivos.
- Muestra de referencia: lo ideal son todos los píxeles de Bolivia; como mínimo, los sitios del catálogo.
- El rol 1 puede fijar una escala a mano si tiene una razón física. En ese caso se documenta.

La similitud es relativa a esa escala. Por eso la web muestra también los valores reales con su
unidad: un sitio a −5 °C puede ser el más parecido de Bolivia a un objetivo a −60 °C y aun así
estar lejos.

### 2. Similitud por dimensión

| Tipo | Fórmula |
|---|---|
| Numérica | `1 − min(1, |tierra − objetivo| / escala)` |
| Categoría | `1` si coinciden, `0` si no |
| Falta un dato | Sin puntaje (`null`), nunca `0` |

### 3. Puntaje total

`total = Σ(peso × similitud) / Σ(peso)`, solo sobre las dimensiones con dato y peso positivo.

- Con los pesos por defecto (`meta.dimensions[].weight`) se obtiene `similarity`.
- Con los pesos de cada propósito (`meta.purposes[].weights`) se obtiene `purposeScores`.
- Si ninguna dimensión tiene dato, la pareja queda sin puntaje y se omite de `scores`.

### 4. Qué va en cada campo de `analogs.json`

| Resultado | Campo |
|---|---|
| Valor medido y unidad | `values.<dimensión>` en `sites` y `targets` |
| Similitud por dimensión | `sites[].scores[].dimensions` |
| Total con pesos por defecto | `sites[].scores[].similarity` |
| Total por propósito | `sites[].purposeScores` |
| Descripción de este método, escalas y faltantes | `meta.scoring` |

## Código de referencia

Probado con datos inventados (Python 3, `numpy` y `pandas`). Hay que cambiar `DIMS` y `PURPOSES`
por los que confirme el rol 1. Genera la parte `sites` del archivo; `meta` y `targets` se completan aparte.

```python
import json
import numpy as np
import pandas as pd

# 1. Configuración: la definen los roles 1 y 4 -------------------------------
DIMS = {  # id: tipo, unidad y peso por defecto
    "slope":     {"kind": "number",   "unit": "°",  "weight": 1.0},
    "roughness": {"kind": "number",   "unit": "m",  "weight": 0.5},
    "temp":      {"kind": "number",   "unit": "°C", "weight": 1.0},
    "precip":    {"kind": "number",   "unit": "mm", "weight": 1.0},
    "geology":   {"kind": "category", "unit": None, "weight": 1.0},
}
PURPOSES = {  # id: objetivo y peso por dimensión
    "rover-mobility": {"targetId": "jezero", "weights": {"slope": 3, "roughness": 2, "temp": 1}},
    "salt-lakes":     {"targetId": "jezero", "weights": {"geology": 3, "precip": 2, "temp": 1}},
}

# 2. Funciones ---------------------------------------------------------------
def scales(sites, targets):
    """Escala de cada dimensión numérica: rango entre los percentiles 5 y 95 de
    la muestra de referencia, ampliado para incluir los objetivos."""
    out = {}
    for d, cfg in DIMS.items():
        if cfg["kind"] != "number":
            continue
        lo, hi = np.nanpercentile(sites[d], [5, 95])
        lo, hi = min(lo, targets[d].min()), max(hi, targets[d].max())
        out[d] = hi - lo if hi > lo else np.nan
    return out

def dim_score(earth, target, kind, scale):
    """Similitud de 0 a 1 en una dimensión. NaN si falta un dato."""
    if pd.isna(earth) or pd.isna(target):
        return np.nan
    if kind == "category":
        return 1.0 if earth == target else 0.0
    return float(1 - min(1.0, abs(earth - target) / scale))

def total(scores, weights):
    """Media ponderada de las dimensiones con dato y peso positivo."""
    num = den = 0.0
    for d, s in scores.items():
        w = weights.get(d, 0)
        if w > 0 and not pd.isna(s):
            num, den = num + w * s, den + w
    return num / den if den > 0 else np.nan

def clean(x, nd=3):
    """NaN pasa a null; los números se redondean."""
    if isinstance(x, str):
        return x
    return None if pd.isna(x) else round(float(x), nd)

# 3. Cálculo -----------------------------------------------------------------
def build(sites, targets, catalog):
    sc = scales(sites, targets)
    default_w = {d: cfg["weight"] for d, cfg in DIMS.items()}
    out = []
    for sid, row in sites.iterrows():
        cat = catalog.loc[sid]
        per_target, scores = {}, []
        for tid, trow in targets.iterrows():
            dims = {d: dim_score(row[d], trow[d], cfg["kind"], sc.get(d)) for d, cfg in DIMS.items()}
            per_target[tid] = dims
            sim = total(dims, default_w)
            if not pd.isna(sim):  # sin puntaje total: se omite la pareja
                scores.append({"targetId": tid, "similarity": clean(sim),
                               "dimensions": {d: clean(v) for d, v in dims.items()}})
        out.append({
            "id": sid, "name": cat["name"], "lat": float(cat["lat"]), "lon": float(cat["lon"]),
            "known": bool(cat["known"]), "reference": bool(cat["reference"]), "control": bool(cat["control"]),
            "radiusKm": float(cat["radius_km"]),
            "values": {d: {"value": clean(row[d]), "unit": cfg["unit"]} for d, cfg in DIMS.items()},
            "scores": scores,
            "purposeScores": {p: clean(total(per_target[cfg["targetId"]], cfg["weights"]))
                              for p, cfg in PURPOSES.items()},
        })
    return out

# 4. Estabilidad del ranking ---------------------------------------------------
def stability(sites_json, purpose, n=500, noise=0.2, seed=0):
    """Mueve los pesos ±20 % al azar y mide cuánto cambia el orden."""
    rng = np.random.default_rng(seed)
    cfg = PURPOSES[purpose]
    dims = {s["id"]: next((x["dimensions"] for x in s["scores"] if x["targetId"] == cfg["targetId"]), {})
            for s in sites_json}
    to_nan = lambda d: {k: (np.nan if v is None else v) for k, v in d.items()}
    base = pd.Series({i: total(to_nan(d), cfg["weights"]) for i, d in dims.items()}).dropna()
    top3, rho = 0, []
    for _ in range(n):
        w = {d: v * rng.uniform(1 - noise, 1 + noise) for d, v in cfg["weights"].items()}
        r = pd.Series({i: total(to_nan(dims[i]), w) for i in base.index})
        top3 += set(r.nlargest(3).index) == set(base.nlargest(3).index)
        rho.append(base.corr(r, method="spearman"))
    return {"top3_igual": top3 / n, "spearman_medio": float(np.mean(rho))}

if __name__ == "__main__":
    bool_cols = ["known", "reference", "control"]
    catalog = pd.read_csv("catalogo-sitios.csv", index_col="id")
    catalog[bool_cols] = catalog[bool_cols].astype(str).apply(lambda c: c.str.lower() == "true")
    sites = pd.read_csv("sitios_valores.csv", index_col="id")        # del rol 2
    targets = pd.read_csv("objetivos_valores.csv", index_col="id")   # del rol 3
    result = build(sites, targets, catalog)
    json.dump({"sites": result}, open("sites_scores.json", "w"), ensure_ascii=False, indent=2)
    for p in PURPOSES:
        print(p, stability(result, p))
```

## Clasificación: familias de sitios y dimensiones redundantes

Sirve para dos cosas: mostrar qué sitios se parecen entre sí y evitar que dos dimensiones casi
iguales cuenten doble. No cambia el formato del archivo; el resultado va a la nota de método y a la demo.

```python
import pandas as pd
from scipy.cluster.hierarchy import linkage, fcluster

sites = pd.read_csv("sitios_valores.csv", index_col="id")
num = sites.select_dtypes("number")

# Dimensiones redundantes: correlación de Spearman alta entre dos columnas
corr = num.corr(method="spearman")
pairs = [(a, b, round(corr.loc[a, b], 2)) for i, a in enumerate(corr) for b in corr.columns[i + 1:]
         if abs(corr.loc[a, b]) > 0.8]
print("Pares redundantes:", pairs)

# Familias de sitios: agrupamiento jerárquico sobre valores estandarizados
z = (num - num.mean()) / num.std()
z = z.fillna(0)                      # un dato faltante cuenta como valor medio
groups = fcluster(linkage(z, method="ward"), t=4, criterion="maxclust")
print(pd.Series(groups, index=num.index, name="grupo").sort_values().to_string())
```

- **Pares redundantes:** si dos dimensiones tienen correlación mayor que 0,8, repartir el peso
  entre las dos o quedarse con una.
- **Familias:** probar entre 3 y 5 grupos y quedarse con el que tenga sentido geológico. Los
  controles deberían caer en un grupo aparte; si no, falta alguna dimensión que los distinga.

## Validación

| Prueba | Qué se espera | Qué hacer si falla |
|---|---|---|
| Referencia de Atacama | Puntaje alto en los propósitos para los que está documentada como análogo | Revisar escalas y pesos; contarlo tal cual si persiste |
| Controles negativos | Puntaje bajo en todos los propósitos | Falta una dimensión que los separe (lluvia, vegetación) |
| Estabilidad | Con pesos movidos un 20 %, los tres primeros se mantienen casi siempre | Presentar el ranking como aproximado y decirlo |
| Cobertura | La mayoría de sitios tiene dato en las dimensiones con más peso | Bajar el peso de la dimensión incompleta |

El resultado se reporta aunque no sea el esperado: la web muestra lo que pasó con Atacama y con los controles.

## Capa continua de similitud

Es la misma fórmula aplicada a cada píxel de Bolivia en vez de a cada sitio.

1. Para cada dimensión numérica con ráster, calcular `1 − min(1, |ráster − objetivo| / escala)`
   con la misma escala que en los sitios.
2. Combinar con la media ponderada del propósito. Las dimensiones de categoría quedan fuera.
3. Enmascarar las zonas sin dato.
4. Exportar un PNG con color y transparencia en **Web Mercator (EPSG:3857)**, con sus cuatro
   esquinas (`[oeste, sur, este, norte]`), para `meta.overlays`.

En Google Earth Engine se hace con operaciones de imagen y una exportación con `crs: "EPSG:3857"`.

## Qué decir ante el jurado

- Es una **métrica de similitud explicable**, con análisis no supervisado para agrupar sitios y
  comprobar la estabilidad. No es un modelo entrenado, y no hay que presentarlo como tal.
- El reto menciona las métricas de similitud como enfoque válido.
- Tres pruebas la respaldan: la referencia de Atacama, los controles negativos y la estabilidad del ranking.
- Los puntajes son relativos a la escala elegida, y por eso se muestran junto a los valores reales.
