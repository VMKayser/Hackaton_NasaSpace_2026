# Fuentes Oficiales de Datos Satelitales Crudos (NASA / ESA)

Los datasets crudos de gran tamaño (>100 MB cada uno) de NASA ADC, LRO Diviner y LOLA se procesaron y destilaron en `data/cleaned_planetary_dataset.csv` y `data/stations.json`. Por restricciones técnicas de tamaño de archivo de GitHub (límite de 100 MB por archivo), los binarios raster crudos originales se descargan directamente desde los repositorios oficiales de la misión:

## 1. Candidato de Aterrizaje Artemis III: de Gerlache Rim 2 (Luna)
- **Topografía y Pendientes (NASA ADC FY23 Matrices 4000x4000):**
  - Matriz de Longitud, Latitud, Pendiente y Cota: [NASA Planetary Data System (PDS) LOLA CDR](https://pds-geosciences.wustl.edu/missions/lro/lola.htm)
- **Temperatura y Ambiente Térmico LRO Diviner:**
  - `PCP_AVG_TBOL_POLS_SUM_LTIM01_240.TAB`: [LRO Diviner RDR Archive](https://pds-geosciences.wustl.edu/lro/lro-l-dlre-4-rdr-v1/lrodlr_1001/)

## 2. Mons Mouton Plateau (Luna - Artemis III & VIPER)
- **GeoTIFFs LOLA Topografía y Pendiente (80 m/px):**
  - `LDSM_80S_80MPP_ADJ.tiff` y `LDEM_80S`: [NASA Goddard LOLA Data Products](https://lunar.gsfc.nasa.gov/)
- **Rugosidad Decamétrica (LDRM):**
  - `LDRM_80S_1000MPP_ADJ_ROUGH_400M.tiff`: [PDS Geosciences LOLA Gridded Data](https://pds-geosciences.wustl.edu/)
- **Recursos Polares Diviner (DLRE PRP):**
  - `DLRE_PRP_SOUTH.TAB`: [LRO Diviner Polar Resource Products](https://pds-geosciences.wustl.edu/missions/lro/diviner.htm)
- **Iluminación Solar Polar (75°S a 85°S):**
  - `AVGVISIB_75S_120M_201608.tiff`

## 3. Malapert Massif (Sitio 23 Artemis III)
- **Modelos LOLA 5m/px y Mapas de Iluminación Quasicontinua:**
  - LOLA Site 23 High Resolution DEM & Slope Error Products: [NASA PDS LOLA Lunar South Pole Atlas](https://www.lpi.usra.edu/lunar/lunar-south-pole-atlas/)

## 4. Marte: Cráter Jezero, Meridiani Planum, Columbia Hills, Deuteronilus Mensae
- **MOLA MEGDR Topografía Global (128 px/deg):** [NASA PDS Geosciences MOLA](https://pds-geosciences.wustl.edu/missions/mgs/megdr.html)
- **HiRISE Jezero Fan DTM (1 m/px):** [University of Arizona HiRISE Jezero](https://www.uahirise.org/dtm/dtm.php?ID=PSP_002387_1985)
- **MRO SHARAD Radares de Permafrost y Glaciares LDA:** [Zenodo DOI:10.5281/zenodo.7753745 / Baker & Carter 2023](https://doi.org/10.5281/zenodo.7753745)
