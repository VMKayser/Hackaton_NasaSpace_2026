# Modelo exploratorio (rol 4)

Primera entrega del rol 4 (PR #1). Es un análisis exploratorio: **la app no usa estos archivos**.

Los datos de la app están medidos con fuentes abiertas en [`docs/valores/`](../docs/valores/README.md)
(`tools/measure_values.py`), y `web/public/data/analogs.json` se genera con `tools/build_analogs.py`
según [`docs/metodo-similitud.md`](../docs/metodo-similitud.md). La revisión de esta entrega está en el
[PR #1](https://github.com/VMKayser/Hackaton_NasaSpace_2026/pull/1).

## Qué hay

| Archivo | Qué es |
|---|---|
| `analogs_ml_pipeline.ipynb` | Notebook con PCA, agrupamiento, `LabelSpreading`, Random Forest y prueba de estabilidad. Sin celdas ejecutadas. |
| `clean_and_curate_planetary_dataset.py` y `scripts/` | Scripts que arman el CSV, el modelo PCA y un `analogs.json` propio. `clean_and_curate_planetary_dataset.py` está repetido en la raíz y en `scripts/`. |
| `predict_planetary_analog.py` | Estima valores para un punto cualquiera a partir del tipo de terreno y de una interpolación entre estaciones. |
| `data/centralized_planetary_dataset.csv` | 76 filas: 58 lugares de la Tierra y 18 objetivos de Marte y la Luna. `cleaned_planetary_dataset.csv` es el mismo archivo. |
| `data/analogs.json`, `data/stations.json` | Salidas de los scripts. |
| `modelos/calibrated_pca_model.json` | Modelo PCA. |
| `ensayo.html`, `ensayo_marte_luna.html` | Páginas sueltas con los resultados. |
| `METODO_IA_SIMILITUD_ANALYSIS.md` | Descripción del método y de los resultados. |

## Límites conocidos

- **Los valores no son mediciones.** Pendiente, relieve, rugosidad, clima y presión de sitios y objetivos
  están escritos a mano en los scripts; en `predict_planetary_analog.py`, el relieve se asigna por tipo de
  terreno (todo salar recibe 0,8°, 1,5 m y 0,35 m) y el clima se interpola entre esas mismas estaciones.
  Las fuentes que se citan no se consultan desde el código.
- El Random Forest aprende a predecir la similitud coseno con Jezero calculada con las mismas variables:
  su importancia de variables repite la fórmula. `LabelSpreading` usa Uyuni, un análogo ya conocido, como
  ejemplo positivo.
- El notebook rellena los datos que faltan con `KNNImputer`; el contrato pide dejarlos en `null`.
- No se puede reproducir tal como está:
  - el notebook lee `data/sitios_valores.csv`, `data/objetivos_valores.csv` y `ayudas/catalogo-sitios.csv`,
    que no están (los equivalentes medidos son `docs/valores/*.csv` y `docs/catalogo-sitios.csv`, con
    otras columnas);
  - `predict_planetary_analog.py` importa `data.bolivia_dem`, que no está;
  - `ensayo_marte_luna.html` carga `data/dem/bolivia_dem_embedded.js`, que no está;
  - los scripts escriben en `output/`, que no está en el repositorio.

## Requisitos

Python 3.10+ con `numpy`, `pandas`, `scipy`, `scikit-learn` y `matplotlib`.
