# Deuteronilus Mensae — datos multivariable de Marte

## Qué entregar y qué abrir

Este paquete contiene datos públicos reales extraídos y convertidos a CSV, cálculos de terreno y salidas de un modelo climático científico. Los CSV son una preparación nueva del proyecto: no son archivos CSV publicados originalmente por NASA y no constituyen una validación del modelo de similitud.

Empiecen por **Deuteronilus_modelo.csv**: 469 ubicaciones y 64 columnas. Incluye coordenadas, terreno, clima, inercia térmica, polvo, composición espectral y un indicador local de evidencia radar. Cada fila corresponde a una ubicación de consulta climática, no a un aterrizaje elegido ni a una medición de todos los instrumentos en ese punto. Los identificadores de fuente permiten consultar los CSV detallados.

Formato: UTF-8 con BOM, separador coma, punto decimal, primera fila con nombres de columna. Vacío = dato ausente/no calculado, NUNCA cero. En Excel, importar como texto/CSV con UTF-8 y coma si no separa las columnas. Los archivos se pueden leer directamente con pandas.read_csv; no hace falta QGIS. Las columnas de estado e identificadores son texto.

## Región y coordenadas

Se recortó el contorno aproximado MDIM 2.1 del nombre Deuteronilus Mensae publicado por USGS/IAU (Feature 1509, control 25363). Extremos del polígono: 39.573938–49.862211° N y 13.677599–35.371340° E. Centro del nombre: 45.11° N, 23.92° E. No se mezcló con el rectángulo antiguo MDIM 2.0 disponible en la misma ficha. Es un límite de nomenclatura, no una cartografía geológica exacta.

`latitude_deg` = latitud planetocéntrica; `longitude_east_deg` = longitud positiva hacia el este. Son coordenadas de MARTE. El GeoJSON incluido transporta estas coordenadas marcianas y NO debe declararse EPSG:4326/WGS84 terrestre. Las distancias de unión se calcularon mediante distancia angular y radio esférico marciano de 3396 km; son aproximadas.

## Archivos y significado

| Archivo | Filas | Qué contiene |
|---|---:|---|
| Deuteronilus_modelo.csv | 469 | Tabla conjunta para explorar comparaciones, conservando resolución y tipo de fuente. |
| terreno_MOLA_variables.csv | 492291 | Coordenadas, altura, pendiente, media/máxima local y rugosidad de cada celda MOLA. |
| inercia_termica_TES.csv | 48082 | Respuesta térmica inferida con TES y bandera de interpolación. |
| clima_MCD_muestreo_estacional.csv | 15008 | 32 condiciones por ubicación: temperatura, presión, viento y flujo solar. |
| clima_MCD_resumen_muestreo.csv | 469 | Mínimo, media aritmética y máximo de esas 32 condiciones. |
| polvo_MY36_diario.csv | 10035 | 669 soles en 15 celdas de 3°, año marciano 36, con opacidad y confiabilidad original. |
| polvo_MY36_resumen.csv | 15 | Resumen temporal por celda de polvo. |
| minerales_TES.csv | 480 | 12 componentes espectrales y error RMS, rejilla de 0.5°. |
| radar_SHARAD_ds02.csv | 2613 | Reflectores de mantos dentro del polígono. |
| radar_SHARAD_ds03.csv | 23226 | Reflectores basales LDA dentro del polígono. |

También se incluyen fuentes.csv, diccionario_variables.csv, contorno, manifiestos, verificación y originales seleccionados. El ZIP incluye TODOS estos CSV, incluido el de terreno completo. No incluye los mosaicos planetarios completos de MOLA, TES-inercia o polvo; sus URLs están documentadas. Sí conserva el recorte numérico MOLA, productos minerales, originales de radar y respuestas MCD para comprobar valores y métodos.

### Elevación y relieve

`elevation_m` es la topografía MOLA respecto al areoide marciano GMM3 (mgm1025), no la distancia al centro del planeta ni una altura respecto al nivel del mar terrestre. Hay valores negativos: no es un error. En este recorte se obtienen −5075 a −1233 m. No comparar esas cifras con Bolivia como si ambos ceros fueran equivalentes; para buscar formas de terreno usar relieve relativo y descriptores calculados a escala comparable.

Rejilla MOLA: 64 píxeles/grado; aproximadamente 926 m norte-sur y 597–714 m este-oeste en esta región. `mola_observation_count` conserva el conteo del producto: 278034 celdas tienen conteo positivo y 214257 tienen cero (interpoladas). `interpolated=1` señala estas últimas; no son mediciones láser directas en cada centro de celda.

`slope_deg` se calcula con gradientes de elevación y distancias físicas ajustadas por latitud. `slope_mean_5x5_deg` y `slope_max_5x5_deg` son media/máximo de pendientes en una ventana de 5×5 píxeles, NO la media/máximo de toda Deuteronilus. `detrended_roughness_rms_5x5_m` es el RMS de las alturas residuales tras ajustar un plano en esa ventana. Describe relieve de kilómetros, no piedras o obstáculos pequeños. La ventana abarca aproximadamente 4.63 km N-S y 3.0–3.6 km E-O. `interpolated_cells_in_5x5` cuenta las celdas interpoladas de la ventana, útil para filtrar calidad. Se usó un halo externo para completar las ventanas en el borde.

### Temperatura, presión, viento y energía solar

Proceden de **MCD 6.2, SIMULACIÓN**, escenario climatológico con actividad solar media; no son una estación meteorológica ni una serie medida por un rover. La temperatura es de SUPERFICIE (K originales convertidos mediante °C=K−273.15), no temperatura del aire. Presión en Pa. Velocidad horizontal del viento en m/s a 10 m sobre el suelo: no es una ráfaga máxima ni una medición al nivel de un vehículo.

Se consultaron Ls=0°,90°,180°,270° y hora solar local=0,3,6,9,12,15,18,21. Ls identifica estaciones marcianas, no meses terrestres. Hay 32 muestras por ubicación, en una rejilla de consulta interpolada de 1° de longitud y ~0.2553° de latitud. Esta densidad NO es la resolución nativa del modelo. Se desactivó la corrección topográfica de alta resolución (`hrkey=0`); no presentar presión/viento como estimaciones detalladas de cada valle.

Los sufijos `_min_sampled`, `_mean_sampled`, `_max_sampled` significan mínimo/media/máximo DEL MUESTREO; no son extremos anuales, promedios anuales ponderados ni pronósticos. El modelo también suaviza variabilidad. Los archivos originales y los parámetros de cada consulta están en originales/MCD y manifest_MCD.json.

`solar_flux_horizontal_W_m2` es radiación solar descendente sobre una superficie horizontal según MCD. `solar_positive_sample_pct` es el porcentaje de las 32 muestras cuyo flujo es positivo. Es SOLO un indicador del muestreo, no el porcentaje continuo de tiempo iluminado. La iluminación real con sombras del relieve durante un período definido NO se calculó: `solar_illumination_percent_continuous_period` está vacía intencionadamente. Para energía, no sustituir horas iluminadas por este indicador sin un cálculo adicional del horizonte y del período.

### Inercia térmica

`thermal_inertia_J_m2_K_s05`, en J m⁻² K⁻¹ s⁻½, expresa cuánto se resiste el suelo a cambiar de temperatura. Es una inferencia TES nocturna del producto de 2007, de 20 píxeles/grado (~2.96 km N-S). No representa una medición de temperatura. `interpolated=1` en su propio CSV o `thermal_inertia_interpolated=1` en el conjunto indica interpolación nativa. No convertirla directamente en tamaño de roca o cantidad de hielo.

### Polvo atmosférico

Reconstrucción global LMD, MY36 v2.5, basada en MRO/MCS v5.2. Rejilla 3° y 669 soles del año marciano 36. `optical_depth_9p3um` es opacidad de absorción de columna a 9.3 µm, adimensional; no es masa de polvo, número de partículas ni opacidad visible. `optical_depth_9p3um_normalized_610Pa` es la versión normalizada a 610 Pa; no mezclar ambas. Se conservó `reliability_source_value` sin inventar umbrales. Los resúmenes corresponden a MY36, diferente del escenario climatológico de MCD. Licencia del archivo: CC BY-SA 3.0; conservar atribución LMD y bibliografía indicada por el producto.

### Composición mineral

Mapas TES de ASU/PDS: mezcla espectral con 36 componentes de referencia, no muestras de laboratorio. Se preservan 12 fracciones fuente y el error RMS. Incluyen cuarzo, feldespatos, piroxenos, olivino, hematita, sulfatos, carbonatos y otros componentes. `sheet_silicates_high_Si_glass` es una categoría combinada; `surface_dust` es polvo SUPERFICIAL, distinto del polvo atmosférico. No son porcentajes en masa y no se normalizó su suma a 100%. Ceros o valores pequeños no prueban ausencia; el mapa ilustrativo indica un límite de detección típico ~0.1 de fracción.

Se eligió ASCII de 2 píxeles/grado (~29.6 km N-S). Los TIFF coloreados del proveedor son ilustraciones con sombreado/interpolación y NO se usaron como valores numéricos. El ASCII carece de coordenadas y la cabecera ENVI no trae georreferencia útil: la orientación se RECONSTRUYÓ del mapa global rotulado (norte arriba, 0° en el centro; −180° a +180° E) y se contrastó su máscara de validez con las alternativas de inversión/rotación; resultados en manifest_integracion.json. Centros reconstruidos a 0.5°. Conservar esta procedencia y tratar el posicionamiento como una reconstrucción, no como georreferencia certificada en el archivo.

−1 fuente se convirtió a vacío (28 de 480 celdas tienen algún faltante). Se preservaron valores mayores de 1 con bandera `any_abundance_gt_1`, sin recortarlos ni interpretarlos como porcentajes físicos válidos. Usar los indicadores de calidad y error RMS. Referencia del método: Bandfield (2002), DOI 10.1029/2001JE001510.

### Evidencia de hielo: radar, no un porcentaje inventado

Los CSV de radar son conversiones de las tablas DBF de Baker y Carter (2023; DOI 10.1029/2022JE007549), publicadas por los autores con DOI 10.5281/zenodo.7753745. Autores afiliados a NASA Goddard y University of Arizona. Se recortaron por coordenadas originales sin transformar a un sistema terrestre.

ds02 describe reflectores en mantos de llanuras superiores: NO etiquetar automáticamente todos como hielo puro. ds03 describe reflectores basales de LDA (depósitos lobulados interpretados como glaciares cubiertos). `THK_3p15` es una profundidad estimada asumiendo permitividad 3.15, no una perforación. `DEPTH_5p75` usa 5.75 para el otro conjunto. Se conservan las columnas originales y el README fuente.

Hay una discrepancia de unidades en el README original: llama `TIME_DEL` milisegundos, pero el artículo y la relación DIFF_PIX×0.0375 indican MICROSEGUNDOS. Se conserva `TIME_DEL` intacto y se añade `time_delay_us`. Se verificó esa relación dentro de la precisión de redondeo del DBF (tolerancia 0.0001 µs).

En la tabla conjunta, `LDA_RADAR_WITHIN_2KM` significa que hay un punto ds03 a ≤2 km del centro consultado (45 de 469 filas). El radio de 2 km es un criterio operativo del proyecto, NO la resolución/huella radar. Tampoco demuestra hielo directamente bajo ese centro. `NO_LOCAL_MEASUREMENT_WITHIN_2KM` significa falta de una medición cercana en este conjunto; no significa ausencia de hielo. No existe aquí una probabilidad global de hielo ni un mapa de hielo de toda la región. ds01 solo inventaría radargramas y presencia de cierto reflector; N no equivale a ausencia de hielo.

## Cómo se unieron y cómo usarlo en ML

Para terreno e inercia se asignó la celda nativa que contiene cada centro MCD y se conservan sus identificadores/distancias. Dos ubicaciones cerca del borde no tienen centro de celda correspondiente dentro del recorte: sus campos quedan vacíos, no se rellenan. Minerales y polvo usan el centro disponible más cercano dentro del polígono; se guardan distancias. Máximos de estas uniones: 27.434 km minerales y 125.647 km polvo. NO supone que estos productos tengan precisión de metros ni que sean observaciones simultáneas.

1. Elegir dimensiones comparables y filtrar calidad/faltantes antes de entrenar.
2. Usar latitud/longitud para localizar y dividir espacialmente; no como prueba de semejanza física Tierra-Marte. Excluir identificadores, flags textuales y distancias de unión de las características físicas del modelo.
3. Recalcular pendiente/rugosidad de Bolivia a resolución y ventanas físicas comparables. No comparar rugosidad de ~4 km con rugosidad de 30 m. Para altitud absoluta, definir primero qué comparación tiene sentido entre datums planetarios; el relieve relativo suele ser más interpretable.
4. Evitar duplicar clima/polvo grueso en miles de píxeles y tratarlos como mediciones independientes. Separar entrenamiento/validación por bloques espaciales y producto. El conjunto no contiene etiquetas verificadas de “análogo” ni de aptitud para aterrizar.
5. Conservar dimensiones por separado y explicar incompatibilidades de atmósfera, gravedad y radiación. Estas variables no prueban seguridad de un emplazamiento.

## Fuentes, descargas y reproducción

**Todos los enlaces literales y qué descargar están en fuentes.csv.** Los enlaces principales se listan abajo. Si un IMG se abre como descarga binaria, es correcto: es una matriz numérica, no una fotografía. Descargar también su etiqueta .lbl o .xml. No hace falta volver a descargar originales para usar los CSV preparados.

- USGS_REGION: https://planetarynames.wr.usgs.gov/Feature/1509
  Contorno MDIM 2.1, red de control 25363. Coordenadas de Marte; no WGS84.
- MOLA: https://pds-geosciences.wustl.edu/missions/mgs/megdr.html
  Topografía MOLA MEGDR 64 píxeles/grado.
- MOLA_ALT: https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg064/megt90n000gb.img
  megt90n000gb.img más .lbl/.xml del mismo nombre. Entero de 16 bits big endian; alturas en m.
- MOLA_COUNT: https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg064/megc90n000gb.img
  megc90n000gb.img más .lbl/.xml. Conteo por celda; cero indica interpolación.
- TES_TI: https://pds-geosciences.wustl.edu/missions/mgs/tes-timap.html
  Inercia térmica nocturna TES: producto de 2007, no temperatura de 2007.
- TES_TI_VALUES: https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data/global_ti_night_2007.img
  global_ti_night_2007.img y .lbl. Entero big endian de 16 bits.
- TES_TI_MASK: https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data/global_ti_msk_night_2007.img
  global_ti_msk_night_2007.img y .lbl; máscara nativa 0=interpolado, 1=observado.
- MCD: https://www-mars.lmd.jussieu.fr/mcd_python/
  MCD 6.2: temperatura superficial, presión, viento a 10 m y flujo solar; ASCII de 32 consultas archivados.
- MCD_METHOD_RIGHTS: https://www-mars.lmd.jussieu.fr/mars/access.html
  Descripción de interpolación, condiciones de uso y registro para versión completa.
- DUST: https://www-mars.lmd.jussieu.fr/mars/dust_climatology/dataset_v2/dustscenario_MY36_v2-5.nc
  Descargar dustscenario_MY36_v2-5.nc. Producto global NetCDF MY36 reconstruido a partir de MRO/MCS.
- TES_MINERALS: https://tes.mars.asu.edu/products/
  Apartado TES Mineral Maps: datos numéricos ASCII y no el TIFF coloreado.
- TES_MINERALS_VALUES: https://tes.mars.asu.edu/mineral_map/TES_mineral_maps_2_ppd.ascii.gz
  13 bandas en secuencia: 12 componentes y error RMS; rejilla global de 2 píxeles/grado.
- TES_MINERALS_HEADER: https://tes.mars.asu.edu/mineral_map/TES_mineral_maps_2_ppd.envi.hdr
  Dimensiones y orden BSQ. Cabecera genérica sin georreferencia útil.
- TES_MINERALS_ORIENTATION: https://tes.mars.asu.edu/mineral_map/plagioclase_4_ppd_mola_label.tif
  Mapa rotulado usado para reconstruir orientación del ASCII; no se extrajeron abundancias de colores.
- TES_MINERALS_REFERENCE: https://doi.org/10.1029/2001JE001510
  Referencia del método de composición mineral.
- SHARAD_DATA: https://doi.org/10.5281/zenodo.7753745
  Dataset de autores con DOI; origen científico, no un CSV creado por NASA.
- SHARAD_DS01: https://zenodo.org/records/7753745/files/ds01.txt?download=1
  Inventario de radargramas; N no significa ausencia de hielo.
- SHARAD_DS02: https://zenodo.org/records/7753745/files/ds02.zip?download=1
  Reflectores de mantos en llanuras superiores. Original shapefile y tabla DBF.
- SHARAD_DS03: https://zenodo.org/records/7753745/files/ds03.zip?download=1
  Reflectores basales de depósitos lobulados LDA. Original shapefile y DBF.
- SHARAD_README: https://zenodo.org/records/7753745/files/readme.txt?download=1
  Definición original de columnas, conservada en originales/SHARAD_readme.txt.
- SHARAD_REFERENCE: https://doi.org/10.1029/2022JE007549
  Ice Content of Mantling Materials in Deuteronilus Mensae, Mars; referencia de interpretación y tiempo en microsegundos.

## Trazabilidad, validación y uso

Preparación en la sesión del 14 de noviembre de 2026, hora Bolivia; algunas respuestas MCD indican 15 de noviembre UTC. Se verificaron todas las alturas y conteos CSV contra las matrices MOLA originales, coordenadas, 30 ajustes de plano independientes para la rugosidad, identificadores únicos y orden mínimo ≤ media ≤ máximo. Los MD5 de los archivos radar se contrastaron con los publicados por Zenodo. verificacion.json y SHA256SUMS.txt documentan integridad, conteos y controles. Estos controles no certifican exactitud científica de las fuentes ni la validez de un modelo entrenado con ellas.

`scripts/integrar_y_validar.py` reconstruye radar/minerales y la tabla conjunta desde los archivos incluidos (Python 3; numpy, shapely y Pillow). No requiere los otros paquetes de Bolivia/Arcadia. Los CSV detallados de terreno, clima, polvo e inercia ya vienen calculados; sus algoritmos y parámetros se describen aquí y en los manifiestos. El recorte MOLA se extrajo del mismo mosaico global público usado antes para Arcadia, seleccionando otras filas/columnas: NO se reutilizaron valores del sitio Arcadia como valores de Deuteronilus.

Conservar atribución y condiciones de cada fuente; el paquete no otorga una licencia universal nueva sobre datos ajenos. MCD permite uso científico con atribución y solicita informar usos; su uso comercial requiere autorización según la página oficial de acceso. Conservar metadatos de polvo y las citas de Baker/Carter y Bandfield. No se verificó una licencia independiente para redistribuir cada producto de ASU/Zenodo: consultar el registro original si se publican por separado.

Texto corto para acompañar la entrega:

> Datos de Deuteronilus Mensae, Marte, preparados a partir de MOLA/TES (NASA PDS/ASU), MCD/LMD y radar SHARAD publicado por Baker y Carter. Se entregan CSV con coordenadas, terreno, clima simulado, inercia térmica, minerales, polvo y evidencia radar localizada. Las escalas y los períodos son diferentes; los vacíos no significan cero. La iluminación continua y un porcentaje global de hielo no están disponibles en este paquete. Consultar README y fuentes.csv antes de entrenar.
