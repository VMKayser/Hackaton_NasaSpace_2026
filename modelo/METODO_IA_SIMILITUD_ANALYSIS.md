# 🛰️ Dossier Científico & Arquitectura de IA: Aprendizaje Semisupervisado, PCA y Random Forest para Análogos Planetarios

**NASA Space Apps Challenge 2026: Beyond Known Analogues**  
**Autores:** Equipo de Ciencia de Datos & Astrobiología  
**Fecha:** Noviembre 2026 | **Versión:** 2.1.0 (Producción)  
**Notebook Asociado (Activo en Modelos):** [`modelos/analogs_ml_pipeline.ipynb`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/modelos/analogs_ml_pipeline.ipynb)  
**Notebook Espejo (Raíz):** [`analogs_ml_pipeline.ipynb`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/analogs_ml_pipeline.ipynb)  
**Figuras Gráficas Generadas:** [`output/figures/`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/figures/)  
**Tabla Comparativa CSV:** [`output/tabla_comparativa_tierra_vs_marte_luna.csv`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/tabla_comparativa_tierra_vs_marte_luna.csv)  
**Dataset Centralizado:** [`data/centralized_planetary_dataset.csv`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/data/centralized_planetary_dataset.csv)  
**Archivo Oficial Web v2.1:** [`output/analogs.json`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/analogs.json)

---

## 1. Resumen Ejecutivo y Planteamiento del Problema

El desafío **"Beyond Known Analogues"** de la NASA busca identificar y caracterizar sitios terrestres que mimeticen con alta fidelidad las condiciones extremas de la **Luna** y **Marte** (desiertos hiperáridos, cuencas de evaporitas salinas, tubos de lava basálticos, frío criogénico y bajo blindaje atmosférico).

### El Desafío del Aprendizaje Automático en Geología Planetaria:
En la Tierra no existen millones de ejemplos etiquetados de "lugares marcianos". La literatura de la NASA y la ESA apenas documenta un número reducido de análogos clásicos (el Desierto de Atacama en Chile, los Valles Secos de McMurdo en la Antártida y Río Tinto en España). Por ello:
* **Una red neuronal profunda supervisada fallaría**, ya que requeriría miles de etiquetas que no existen y actuaría como una caja negra no explicable.
* **Una distancia euclidiana directa sin normalizar fallaría**, porque mezclaría unidades dispares (°C, metros de relieve, milímetros de lluvia, kPa) y sobreponderaría variables correlacionadas.
* **La Solución Implementada**: Un pipeline híbrido de **Aprendizaje Semisupervisado (`LabelSpreading`)**, **Reducción de Dimensionalidad Ortogonal (`PCA`)**, **Ensamble de Bosques Aleatorios (`RandomForestRegressor` + `IsolationForest`)** y una **Métrica de Similitud Explicable Ponderada** acorde a la norma del contrato de entrega v2.1.

---

## 2. Arquitectura de Datos Centralizados

Se construyó un repositorio maestro en [`data/centralized_planetary_dataset.csv`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/data/centralized_planetary_dataset.csv) integrando 46 entidades multidimensionales provenientes de 4 fuentes oficiales:

1. **Catálogo de Sitios de Bolivia (31 estaciones):**
   * **Núcleo (Core):** Salar de Uyuni, Coipasa, Sol de Mañana, Laguna Colorada, Siloli, Dalí, Licancabur, Uturuncu, Sajama, Ollagüe, Tunupa, Poopó.
   * **Extensión:** Salares de Empexa, Chiguana, Chalviri, Capina, Pastos Grandes, Laguna Hedionda, Termas de Polques, Géiseres de Sajama, Tata Sabaya, Los Frailes, Jayu Khota, Valle de Rocas, Tupiza, Valle de la Luna, Huayna Potosí, Umajalanta.
2. **Referencia Positiva de Validación:**
   * **Yungay, Atacama (Chile):** El análogo de desierto hiperárido marciano más citado en la literatura planetaria de la NASA.
3. **Controles Negativos de Validación:**
   * **Trinidad, Beni:** Llanura húmeda amazónica (155 msnm, 26.5°C, 1,850 mm/año, pendiente 0.4°).
   * **Coroico, Yungas:** Bosque montano nublado (1,750 msnm, 19.0°C, 1,450 mm/año, pendiente 28°).
4. **Objetivos Extraterrestres de Referencia:**
   * **Marte:** Cráter Jezero (Perseverance), Cráter Gale (Curiosity), Meridiani Planum (Opportunity).
   * **Luna:** Cráter Shackleton (Polo Sur, Artemis III), Base Tranquilidad (Apollo 11).
5. **Cuadrícula Global Terrestre (Escaneo de toda la Tierra):**
   * Puntos de contraste global: McMurdo (Antártida), Caldera Askja (Islandia), Cráter Haughton (Ártico Canadiense), Gran Erg Occidental (Sahara), Selva de Manaos (Amazonas), Flancos del Everest (Himalaya), Valle de la Muerte (Mojave).

### Variables Físicas Cuantificadas:
* `terrain`: Pendiente mediana en grados (°), derivada de NASADEM e HiRISE.
* `relief`: Desnivel topográfico local en metros (m).
* `roughness`: Rugosidad superficial (desviación estándar de elevación en m).
* `temp`: Temperatura media superficial (°C), de NASA POWER Climatology.
* `temp_swing`: Amplitud térmica diurna (°C).
* `precip`: Precipitación anual acumulada (mm/año).
* `solar_flux`: Irradiancia solar e índice UV (MJ/m²/día).
* `atm_pressure`: Presión atmosférica superficial barométrica (kPa).
* `elevation`: Cota sobre el nivel del mar (msnm).
* `geology`: Clasificación litológica/geomorfológica.

---

## 3. Formulación Matemática de los Modelos

### 3.1. Normalización Dinámica por Rango Interpercentil (5–95%)
Para evitar que valores atípicos distorsionen las escalas y que variables con rangos grandes eclipsen a las pequeñas:
$$\text{lo}_d = \min\left(P_{5}(E_d), \, \min(T_d)\right), \quad \text{hi}_d = \max\left(P_{95}(E_d), \, \max(T_d)\right)$$
$$\text{Escala}_d = \text{hi}_d - \text{lo}_d$$

### 3.2. Métrica de Similitud Explicable por Dimensión
Para cada variable física $d$, la concordancia entre la Tierra ($E$) y el Destino Planetario ($T$) es:
$$S_d(E, T) = 1.0 - \min\left(1.0, \, \frac{|E_d - T_d|}{\text{Escala}_d}\right)$$
Si falta una medición en $E$ o $T$, se preserva como valor nulo (`NaN` en Python, `null` en JSON) para no penalizar artificialmente un sitio que no cuenta con sensores específicos.

### 3.3. Puntaje Compuesto y Ponderación por Propósito de Misión
El puntaje de similitud total es la media ponderada sobre las dimensiones evaluables:
$$\text{Similitud}(E, T) = \frac{\sum_{d \in \text{Válidas}} w_d \cdot S_d(E, T)}{\sum_{d \in \text{Válidas}} w_d}$$
Donde los pesos $w_d$ se adaptan al propósito científico:
* **Movilidad de Rovers (`rover-mobility`):** Mayor peso a la pendiente ($w=0.75$), rugosidad ($w=0.50$) y relieve ($w=0.25$).
* **Astrobiología en Paleolagos (`astrobiology-evaporites`):** Mayor peso a la aridez/precipitación ($w=1.0$), temperatura ($w=0.6$) y pendiente ($w=0.4$).
* **Bases Lunares Criogénicas (`lunar-south-pole-cold`):** Mayor peso a temperatura extrema ($w=1.0$), relieve de impacto ($w=0.8$) y pendiente ($w=0.6$).

---

## 4. Análisis de Modelos de Inteligencia Artificial

### 4.1. PCA: Espacio Latente Cósmico y Descorrelación
El análisis PCA reduce las 6 variables continuas fundamentales a 3 componentes ortogonales que explican el **92.29% de la varianza total**:
* **PC1 (53.29% de varianza):** Eje de Aridez, Presión Atmosférica y Temperatura. Separa los ambientes desérticos fríos y delgados del Altiplano de las zonas húmedas tropicales.
* **PC2 (27.68% de varianza):** Eje de Topografía y Relieve. Separa las cuencas planas (salares) de los conos volcánicos abruptos (Licancabur, Sajama).
* **PC3 (11.32% de varianza):** Eje de Radiación Solar UV y Rugosidad.

#### Matriz de Cargas Físicas (Loadings):
| Variable | PC1 (Aridez/Presión) | PC2 (Topografía) | PC3 (Radiación/UV) |
|---|---:|---:|---:|
| `terrain` (Pendiente) | +0.494 | +0.275 | -0.138 |
| `relief` (Relieve) | +0.499 | +0.287 | -0.134 |
| `roughness` (Rugosidad) | +0.534 | +0.204 | -0.012 |
| `temp` (Temperatura) | -0.329 | +0.477 | -0.455 |
| `precip` (Precipitación) | -0.120 | +0.544 | +0.821 |
| `atm_pressure` (Presión) | -0.316 | +0.526 | -0.286 |

### 4.2. Comparación de Métricas: Similitud Coseno vs Distancia Euclidiana en Espacio Latente
En el espacio latente del PCA, se comparó la proximidad vectorial de los sitios terrestres frente al Cráter Jezero (Marte):
1. **Distancia Euclidiana Invertida:** Penaliza fuertemente diferencias absolutas. Sitios como **Sol de Mañana**, **Desierto Salvador Dalí**, **Termas de Polques** y **Desierto de Siloli** emergen como los más cercanos al entorno marciano debido a su combinación de gran altitud (>4,500 msnm), baja presión y alta aridez.
2. **Similitud Coseno:** Evalúa el perfil armónico de las variables. Detecta que cuencas evaporíticas como Uyuni y Coipasa replican la proporción plana/seca de los paleolagos de Jezero.

### 4.3. Aprendizaje Semisupervisado (`LabelSpreading`)
Se implementó un modelo basado en grafos con kernel RBF ($\gamma=0.25$, $\alpha=0.8$).  
* **Semillas Positivas ($y=+1$):** `yungay-atacama`, `uyuni`, `mcmurdo-antarctica`.
* **Semillas Negativas ($y=0$):** `trinidad-control`, `coroico-control`, `amazon-manaus`.
* **Muestras no etiquetadas ($y=-1$):** Los 35 candidatos restantes en Bolivia y el mundo.

#### Descubrimiento de Nuevos Análogos Terrestres (Ranking Semisupervisado):
El modelo propagó las afinidades probabilísticas e identificó candidatos prometedores no explorados previamente en la literatura tradicional:
1. **Salar de Capina (0.818):** Evaporitas de alta radiación UV en Potosí.
2. **Salar de Chalviri (0.818):** Cuenca salina con fuentes termales hidrotermales.
3. **Salar de Chiguana (0.817):** Planicie evaporítica de boratos y halita.
4. **Salar de Empexa (0.817):** Crustal salino con microrelieve poligonal.
5. **Salar de Coipasa (0.817):** Segundo salar más extenso de Bolivia.
6. **Laguna Pastos Grandes (0.816):** Caldera volcánica con domos de travertino y litio.
7. **Desierto de Siloli (0.815):** Campos de rocas esculpidas por el viento, análogo directo del transporte eólico marciano.

### 4.4. Random Forest: Importancia de Variables Físicas
El modelo de ensamble de 150 árboles determinó empíricamente cuáles variables físicas son los predictores dominantes para aproximarse a un cuerpo planetario:
* **Precipitación / Aridez (`precip`):** **45.99%** de importancia. La ausencia de agua líquida libre es el factor limitante primario de Marte y la Luna.
* **Temperatura Media (`temp`):** **33.90%** de importancia.
* **Pendiente del Terreno (`terrain`):** **9.43%** de importancia.
* **Presión Atmosférica (`atm_pressure`):** **6.06%** de importancia.
* **Rugosidad y Relieve (`roughness` / `relief`):** **4.62%** de importancia acumulada.

---

## 5. Validación Rigurosa del Sistema

| Criterio de Prueba | Comportamiento Esperado | Resultado Obtenido en el Pipeline | Estado |
|---|---|---|:---:|
| **Referencia Atacama** | Puntaje sobresaliente en análogo marciano | Similitud de **0.753** frente a Jezero, 100% concordancia en aridez | **SUPERADA** |
| **Control Trinidad (Beni)** | Puntaje bajo en todos los propósitos planetarios | Similitud cae a **0.426** (0% en aridez y presión) | **SUPERADA** |
| **Control Coroico (Yungas)** | Aislado en cluster propio | Separado en el Cluster 2 del agrupamiento jerárquico | **SUPERADA** |
| **Estabilidad Monte Carlo** | Rankings robustos ante $\pm 20\%$ de ruido en pesos | Top-3 idéntico en **100%** de las simulaciones para astrobiología y Luna; Spearman $\bar{\rho} \ge 0.997$ | **SUPERADA** |
| **Contrato Web v2.1** | Schema JSON estricto con `meta`, `targets`, `sites` | Archivo [`output/analogs.json`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/analogs.json) generado y validado con 31 sitios | **SUPERADA** |

---

## 6. Visualizaciones Gráficas Generadas y Análisis de Resultados

El pipeline genera automáticamente cuatro figuras científicas de alta definición en [`output/figures/`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/figures/):

### 6.1. Gráfica 1: Mapa Cósmico de Análogos con Clusters, Centroides y Proyección Planetaria
* **Archivo:** [`output/figures/cluster_pca_centroids.png`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/figures/cluster_pca_centroids.png)
* **¿Qué se ve en la gráfica?**:
  * **Eje X (PC1, 53.3% varianza):** Vector de Aridez, Presión Atmosférica y Temperatura. A la derecha, mayor sequedad, temperaturas más frías y menor presión barométrica.
  * **Eje Y (PC2, 27.7% varianza):** Vector de Topografía y Relieve. Hacia arriba terrenos montañosos y escarpados; hacia abajo llanuras y depresiones ultraplanas.
  * **Los 4 Grupos / Clusters:** Cada punto representa un sitio terrestre coloreado por su familia geológica:
    * 🔵 **Cian (Grupo 4):** Planicies Salinas y Cuencas Evaporíticas (Salar de Uyuni, Coipasa, Chiguana, Empexa).
    * 🟠 **Ámbar (Grupo 1):** Complejos Volcánicos y Estratovolcanes (Sajama, Licancabur, Uturuncu, Sol de Mañana).
    * 🟢 **Verde Esmeralda (Grupo 3):** Desiertos Eólicos y Formaciones de Erosión (Siloli, Dalí, Valle de Rocas, Tupiza).
    * 🔴 **Rojo (Grupo 2):** Controles Negativos (Trinidad en Beni, Coroico en Yungas).
  * **Centroides Geomultivariados:** Representados por grandes diamantes (`D`) con etiquetas en blanco (`CENTROIDE G1`, `CENTROIDE G2`, etc.). De cada centroide parten líneas punteadas (*spider plot*) que conectan a cada sitio miembro, ilustrando la cohesión interna del grupo.
  * **Proyección de Destinos Planetarios:**
    * 🔴 **Marte:** Cráter Jezero, Cráter Gale y Meridiani Planum marcados con grandes estrellas de fuego (`★`).
    * ⚪ **Luna:** Cráter Shackleton y Base Tranquilidad marcados con estrellas plateadas (`P`).
* **Conclusión Científica:** Se observa cómo los salares y desiertos de Bolivia se agrupan en el **mismo cuadrante donde residen el Cráter Jezero y Meridiani Planum**, evidenciando su alta afinidad física directa. En contraste, los controles amazónicos caen en el cuadrante diametralmente opuesto.

### 6.2. Gráfica 2: Dendrograma de Agrupamiento Jerárquico de Ward
* **Archivo:** [`output/figures/dendrogram_ward.png`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/figures/dendrogram_ward.png)
* **¿Qué se ve en la gráfica?**:
  * Árbol taxonómico de distancias euclidianas multidimensionales que agrupa progresivamente los 31 sitios del catálogo.
  * Una línea de corte roja horizontal discontinua (`t = 8.0`) indica el umbral de disimilitud donde emergen las 4 familias.
  * **Aislamiento de Controles:** Los controles negativos (`trinidad-control` y `coroico-control`) se unen entre sí a muy corta distancia y quedan aislados en una rama terminal que solo se conecta al Altiplano en la raíz más lejana del árbol, confirmando que el espacio geofísico separa nítidamente la selva tropical de los análogos marcianos.

### 6.3. Gráfica 3: Importancia de Variables Físicas (Random Forest)
* **Archivo:** [`output/figures/random_forest_feature_importance.png`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/figures/random_forest_feature_importance.png)
* **¿Qué se ve en la gráfica?**:
  * Gráfico de barras horizontales mostrando el porcentaje de contribución de cada variable física mediante reducción de impureza de Gini / MSE.
  * **Variables Clave:** La precipitación/aridez lidera con **45.99%**, seguida de la temperatura media con **33.90%**, pendiente del terreno con **9.43%**, presión barométrica con **6.06%**, rugosidad con **3.08%** y relieve con **1.54%**.

### 6.4. Gráfica 4: Nuevos Análogos Descubiertos por Aprendizaje Semisupervisado
* **Archivo:** [`output/figures/semi_supervised_discovery.png`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/figures/semi_supervised_discovery.png)
* **¿Qué se ve en la gráfica?**:
  * Barras horizontales comparando la probabilidad de idoneidad planetaria ($0$ a $100\%$) propagada por el modelo `LabelSpreading`.
  * Barras doradas: Las joyas de Bolivia descubiertas (**Capina, Chalviri, Chiguana, Empexa, Coipasa, Siloli, Dalí**) superan el **81% de afinidad**, rivalizando con la referencia oficial de la NASA (Atacama con 83%), mientras que los controles negativos amazónicos caen por debajo del **10%**.

---

## 7. Tabla Comparativa Científica: Lugares Analizados de la Tierra vs Marte y la Luna

Tabla exportada en [`output/tabla_comparativa_tierra_vs_marte_luna.csv`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/tabla_comparativa_tierra_vs_marte_luna.csv):

| Análogo Terrestre | Destino Extraterrestre | Similitud Global (PSI) | Pendiente (Tierra vs Destino) | Relieve Local (Tierra vs Destino) | Temp. Media (Tierra vs Destino) | Presión Atm. (Tierra vs Destino) | Justificación Científica y Ensayo Operacional |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **Salar de Uyuni (Bolivia)** | **Cráter Jezero (Marte - Perseverance)** | **75.0%** *(Tier 2: Alta Fidelidad)* | 0.8° vs 9.7° | 1.5 m vs 80.0 m | 8.5°C vs -60.0°C | 65.2 kPa vs 0.61 kPa | Planicie evaporítica de halita y sulfatos análoga a la fase de desecación del paleolago Jezero; calibración altimétrica láser LiDAR/radar y tránsito de rovers a alta velocidad. |
| **Desierto de Siloli (Bolivia)** | **Cráter Gale (Marte - Curiosity)** | **79.7%** *(Tier 2: Alta Fidelidad)* | 8.2° vs 12.5° | 65.0 m vs 450.0 m | 1.5°C vs -55.0°C | 59.0 kPa vs 0.65 kPa | Rocas esculpidas por abrasión eólica (yardangs) y escarpes de arenisca similares a las dunas y estratos sedimentarios basales de Monte Sharp. |
| **Salar de Coipasa (Bolivia)** | **Meridiani Planum (Marte - Opportunity)** | **78.8%** *(Tier 2: Alta Fidelidad)* | 1.1° vs 2.1° | 2.2 m vs 15.0 m | 9.0°C vs -50.0°C | 65.0 kPa vs 0.68 kPa | Cuenca sedimentaria ultraplana rica en costras de sulfato de calcio y litio que emula los lechos evaporíticos de Meridiani Planum. |
| **Nevado Sajama (Bolivia)** | **Cráter Shackleton (Luna - Artemis III)** | **64.2%** *(Tier 3: Análogo Criogénico)* | 28.5° vs 24.5° | 2,200 m vs 1,200 m | -8.0°C vs -180.0°C | 47.5 kPa vs 0.0 kPa | Estratovolcán cónico con permafrost criogénico y pendientes abruptas (>25°) para probar taladros rotatorios en hielo y tracción en taludes polares lunares. |
| **Sol de Mañana (Bolivia)** | **Zonas Hidrotermales / Valles Marineris (Marte)** | **71.4%** *(Tier 2: Alta Fidelidad)* | 14.5° vs 18.0° | 120.0 m vs 2,500 m | -2.5°C vs -40.0°C | 57.5 kPa vs 0.70 kPa | Campo geotérmico activo con fumarolas sulfurosas, piscinas de lodo hirviente y azufre nativo; análogo primordial para biofirmas quimiosintéticas extraterrestres. |
| **Yungay, Atacama (Chile - Referencia)** | **Cráter Jezero (Marte - Perseverance)** | **75.3%** *(Tier 2: Referencia Oficial)* | 7.1° vs 9.7° | 92.0 m vs 80.0 m | 17.5°C vs -60.0°C | 91.0 kPa vs 0.61 kPa | Núcleo hiperárido con casi cero precipitación (<2 mm/año); representa el benchmark mundial de desecación extrema en la literatura de la NASA. |
| **Trinidad, Beni (Bolivia - Control Negativo)** | **Cráter Jezero (Marte - Perseverance)** | **42.6%** *(Tier 4: Control Negativo)* | 0.4° vs 9.7° | 2.0 m vs 80.0 m | 26.5°C vs -60.0°C | 99.5 kPa vs 0.61 kPa | Llanura aluvial amazónica hiperhúmeda (1,850 mm/año) con densa biosfera vegetal; valida que el modelo castiga la divergencia ambiental y evita falsos positivos. |

---

## 8. Estructura Celda por Celda del Notebook [`modelos/analogs_ml_pipeline.ipynb`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/modelos/analogs_ml_pipeline.ipynb)

El cuaderno contiene 26 celdas estructuradas de forma didáctica y reproducible:

* **Celdas 1–2 (Entorno y Carga de Datos):**
  * *Qué:* Configura `sklearn`, `pandas` y carga el catálogo CSV y mediciones.
  * *Cómo:* `pd.read_csv(index_col='id')` con verificación de tipos.
  * *Por qué:* Centraliza datos dispersos en una estructura matricial única.
* **Celdas 3–4 (Limpieza, Nulos y Escalas Dinámicas):**
  * *Qué:* Maneja faltantes con `KNNImputer` y calcula escalas interpercentiles 5–95%.
  * *Cómo:* `np.nanpercentile` expandido a los valores de los objetivos extraterrestres.
  * *Por qué:* Cumple la directiva de la NASA de no mezclar unidades físicas.
* **Celdas 5–6 (Motor de Similitud y PCA):**
  * *Qué:* Similitud explicable por dimensión y reducción a 3 componentes principales.
  * *Cómo:* Descomposición SVD sobre matriz estandarizada (`RobustScaler`).
  * *Por qué:* Descorrelaciona variables y genera el espacio latente cósmico.
* **Celdas 7–8 (Distancias Latentes y Aprendizaje Semisupervisado):**
  * *Qué:* Proyecciones Coseno/Euclidianas y difusión de etiquetas `LabelSpreading`.
  * *Cómo:* Grafo de afinidad con kernel RBF sobre anclas conocidas y candidatas.
  * *Por qué:* Permite descubrir **nuevos análogos en toda la Tierra** sin requerir etiquetado manual.
* **Celdas 9–10 (Random Forest, Isolation Forest y Agrupamiento Jerárquico):**
  * *Qué:* Importancia de variables, detección de anomalías planetarias y árboles de Ward.
  * *Cómo:* MDI en 150 árboles, `IsolationForest(contamination=0.15)` y `fcluster`.
  * *Por qué:* Identifica qué parámetros físicos mandan en la similitud y valida que los controles negativos queden aislados.
* **Celdas 11–12 (Monte Carlo y Exportación JSON v2.1):**
  * *Qué:* Test de estabilidad de 500 iteraciones con ruido $\pm 20\%$ y exportación a [`output/analogs.json`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/analogs.json).
  * *Cómo:* Simulación estocástica y generación de payload compatible con la web.
  * *Por qué:* Asegura solidez científica ante jurados y entrega los datos listos para producción.

---

## 7. Cómo Re-Entrenar y Escanear Nuevas Coordenadas

El modelo está preparado para recibir cualquier coordenada $(Lat, Lon)$ de la Tierra o nuevos datos de satélite:

1. **Agregar nuevos sitios**: Insertar filas en [`data/sitios_valores.csv`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/data/sitios_valores.csv) o en [`data/centralized_planetary_dataset.csv`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/data/centralized_planetary_dataset.csv).
2. **Ejecutar el pipeline**: Abrir [`analogs_ml_pipeline.ipynb`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/analogs_ml_pipeline.ipynb) en Jupyter Notebook, VS Code o JupyterLab y presionar **"Run All"** (o ejecutar celda por celda para inspeccionar los gráficos y tablas intermedias).
3. **Despliegue automático**: El notebook actualizará automáticamente [`output/analogs.json`](file:///c:/Users/antra/Desktop/Hacka_nsa_2026/Hacka_Nasa_2026/output/analogs.json), alimentando al instante las interfaces web, el dashboard y el visualizador 3D.
