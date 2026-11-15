import pathlib,csv,json,re,zipfile,shutil,math
from collections import Counter
ROOT=pathlib.Path(__file__).resolve().parents[1]/'outputs'/'Utopia_Viking2'
def read(name):
    with (ROOT/name).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def write(name,rows):
    with (ROOT/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
m=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
assert 'terrain_error' not in m and 'tes_error' not in m,m
opacity=read('vl_opac_VL2_original.csv')
write('opacidad_VL2.csv',[dict(site_id='UTOPIA_VIKING2',sol=r['MARTIAN_DAY'],
    local_hour_earth_units=r['LOCAL_HOUR'],local_minute=r['LOCAL_MINUTE'],ls_deg=r['SOL_LON'],
    optical_depth_067um=r['OPACITY'],opacity_limitation_flag=r['OPACITY_FLAG'],
    total_uncertainty=r['ERR_TOTAL'] if float(r['ERR_TOTAL'])>=0 else '',source_row=r['source_row']) for r in opacity])
dictionary=[]
for stem in ('vl_tbin','vl_avep','vl_opac'):
    label=(ROOT/'originales'/(stem+'.lbl')).read_text('ascii')
    for block in re.findall(r'OBJECT\s*=\s*COLUMN\b(.*?)END_OBJECT',label,re.S):
        name=re.search(r'NAME\s*=\s*"([^"]+)"',block).group(1)
        desc=re.search(r'DESCRIPTION\s*=\s*"(.*?)"',block,re.S).group(1)
        dictionary.append(dict(dataset=stem,column=name,description_PDS=' '.join(desc.split()),
            source_label='https://atmos.nmsu.edu/PDS/data/vl_1001/data/'+stem+'.lbl'))
write('diccionario_columnas_PDS.csv',dictionary)

rows=read('meteorologia_VL2_SI.csv'); raw=read('vl_tbin_VL2_original.csv')
assert len(rows)==len(raw)==24750
assert len(read('terreno_MOLA_radio5km.csv'))==549
assert len(opacity)==452 and len(read('presion_diaria_VL2_SI.csv'))==1051
for a,b in zip(rows,raw):
    assert a['source_row']==b['source_row'] and b['SC_ID']=='VL2'
    if a['air_temperature_C']:
        assert abs(float(a['air_temperature_C'])-(float(b['TAMB_NLI_MN'])-273.15))<1e-7
        assert b['T_NLI_FLAG']=='' and float(b['WND_TMP_NLI'])>0
    if a['pressure_Pa']:assert abs(float(a['pressure_Pa'])-float(b['PRESS_MEAN'])*100)<1e-7
    if a['wind_speed_m_s']:assert float(a['wind_speed_m_s'])==float(b['WND_SPD_MEAN']) and b['WIND_FLG']==''
assert len({(r['sol'],r['bin_1_25']) for r in rows})==len(rows)
validation={'rows_met':len(rows),'rows_opacity':len(opacity),'rows_pressure_daily':1051,'terrain_pixels':549,
    'unique_met_sol_bin':True,'all_met_conversions_checked':True,
    'temperature_valid_range_C':[min(float(r['air_temperature_C']) for r in rows if r['air_temperature_C']),max(float(r['air_temperature_C']) for r in rows if r['air_temperature_C'])],
    'pressure_valid_range_Pa':[min(float(r['pressure_Pa']) for r in rows if r['pressure_Pa']),max(float(r['pressure_Pa']) for r in rows if r['pressure_Pa'])],
    'wind_valid_range_m_s':[min(float(r['wind_speed_m_s']) for r in rows if r['wind_speed_m_s']),max(float(r['wind_speed_m_s']) for r in rows if r['wind_speed_m_s'])],
    'temperature_flag_counts':dict(Counter(r['T_NLI_FLAG'] for r in raw)),
    'wind_flag_counts':dict(Counter(r['WIND_FLG'] for r in raw)),
    'opacity_flag_counts':dict(Counter(r['OPACITY_FLAG'] for r in opacity))}
(ROOT/'validacion.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2),encoding='utf-8')

readme='''# Utopia Planitia: sitio Viking 2

Datos oficiales NASA PDS, descargados y convertidos a CSV para el proyecto de analogos terrestres.
Preparacion: 14 noviembre 2026. No son observaciones actuales ni un dataset global de Utopia.

## Punto de referencia
Viking 2, Utopia Planitia. Coordenadas planetocentricas aproximadas publicadas por NASA:
47.64 N, 134.29 E. Fuente: https://science.nasa.gov/mission/viking/
No mezclar con latitudes planetograficas antiguas cercanas a 47.97 N.
El entorno orbital se centra en estas coordenadas publicadas; no implica una geolocalizacion precisa del modulo.
Radio de extraccion propuesto para el proyecto: 5 km. No es una elipse oficial de aterrizaje.

## Archivos para empezar
- meteorologia_VL2_SI.csv: 24750 intervalos temporales, sols 1 a 1050. Hasta 25 bins por sol; faltan algunos sols.
  Temperatura DEL AIRE en C, presion en Pa y rapidez del viento en m/s. Son promedios por intervalo, no valores instantaneos.
  Se convirtio temperatura K-273.15 y presion mbar*100. Rapidez tomada de WND_SPD_MEAN, no recalculada desde componentes medias.
  Se aceptaron solamente flags vacios, valores fisicamente validos y conteos positivos de mediciones aplicables.
  Flags conservados: M=ausente, n=sin datos, I=interferencia del modulo, S=interpolado con spline,
  $=interpolacion por interferencia. Las columnas accepted indican el filtro aplicado.
  Valores rechazados quedan vacios, nunca se sustituyen por cero. Los originales permanecen en los CSV *_original.csv.
  Esta es una seleccion conservadora, no una certificacion nueva ni garantia de eliminar todos los sesgos instrumentales.
  Viento medido en el montaje instrumental Viking: no se normalizo a 10 m ni a la altura de estaciones terrestres.
- resumen_por_sol_VL2.csv: min/media/max de los promedios de bins aceptados; incluye cantidad de bins validos.
  NO son extremos instantaneos diarios. Revisar cobertura antes de comparar dias; no se impuso un umbral minimo de cobertura.
- presion_diaria_VL2_SI.csv: 1051 registros diarios archivados, sols 0 a 1050. Conserva warning_flag.
  Esta tabla NO usa el filtro de calidad de meteorologia_VL2_SI.csv. Min y media vienen del archivo vl_avep;
  maxima se calcula como PRESS_MIN+PRESS_RANGE. Valores negativos de ausencia se dejan vacios.
- opacidad_VL2.csv: 452 mediciones, sols 6 a 872; profundidad optica atmosferica a 0.67 micrometros,
  adimensional, con incertidumbre total y flag de limitacion. No se filtro OPACITY_FLAG: revisar su interpretacion
  en la documentacion antes de usarlo para entrenar. No equivale a concentracion de polvo ni polvo depositado.
- terreno_MOLA_radio5km.csv: 549 centros de pixel dentro de radio 5 km, con latitud, longitud,
  elevacion respecto al areoide (m) y pendiente regional derivada (grados).
- resumen_terreno_MOLA.csv: resumen del entorno. Pendiente de gradientes por diferencias finitas
  sobre rejilla de 1/128 grado; se uso radio de Marte 3396000 m y separacion este-oeste corregida por cos(lat).
  Rugosidad definida aqui como RMS de residuos tras ajustar un plano al conjunto del entorno de 5 km,
  llamada detrended_relief_rms_5km_m: relieve residual a escala regional, NO rugosidad de rocas/ruedas.
  Los valores MOLA pueden contener interpolacion. No se extrajo el mapa de conteos de observaciones.
  No utilizar para seguridad de aterrizaje ni deteccion de obstaculos pequenos.
- inercia_TES_radio5km.csv: 12 centros de pixel dentro del entorno; inercia termica nocturna derivada
  de TES en J m^-2 K^-1 s^-1/2. Es un mapa de 20 pixeles/grado, no una temperatura ni una medicion Viking.
  Mascara 0 indica relleno por interpolacion. Se conserva la mascara y se dejan vacios valores de inercia <=0.
- diccionario_columnas_PDS.csv: descripciones originales de las columnas PDS, en ingles.
- manifest.json: fuentes, hashes SHA256 y rangos exactos de extraccion orbital.
- validacion.json: comprobaciones estructurales y conversiones.

## Originales y reproduccion
originales/ conserva DAT, LBL y XML de Viking 1/2 sin modificar. Los CSV se filtraron a SC_ID=VL2.
Los archivos *.img.rows_*_*.bin son EXTRACTOS BINARIOS de filas completas del IMG orbital,
no imagenes completas. No abrirlos como si tuvieran las dimensiones globales de sus LBL.
Los rangos de bytes y filas estan en manifest.json y el script explica la extraccion.
Scripts en scripts/ permiten reproducir el procesamiento con Python 3 y numpy.
Ejecutar desde una carpeta donde los scripts esten en work/ y los datos en outputs/Utopia_Viking2/,
o adaptar ROOT a la carpeta de datos; el script principal espera las tablas Viking ya descargadas.

## Fuentes
Meteorologia: https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/viking/surface_met.html
Presion diaria: https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/viking/sol_avg_sur_press_data.html
Opacidad: https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/viking/atm_opacity.html
Tablas originales: https://atmos.nmsu.edu/PDS/data/vl_1001/data/
MOLA: https://pds-geosciences.wustl.edu/missions/mgs/megdr.html
TES: https://pds-geosciences.wustl.edu/missions/mgs/tes-timap.html
El manifiesto contiene las URL de cada archivo utilizado.

## Que falta
Temperatura superficial del suelo (el sensor meteorologico mide aire), iluminacion porcentual,
evidencia cuantitativa de hielo y mineralogia NO estan incluidas. No rellenarlas con valores regionales
supuestos ni con cero. SWIM no se ha descargado para este sitio. La escarcha fotografiada por Viking
no sustituye una cuantificacion de hielo enterrado. Temperatura del suelo puede abordarse mediante
productos orbitales THEMIS o MCD claramente identificado como simulacion, con otra temporalidad.

## Uso para el modelo
Son registros temporales de UN sitio, no 24750 lugares independientes. No hacer train/test aleatorio
por filas y afirmar generalizacion geografica. Separar por bloques temporales para prediccion temporal
y por sitios para comparacion geografica. No repetir elevacion/inercia en cada instante como si fueran
observaciones independientes. Elegir estaciones y horas comparables con la Tierra; no mezclar aire y suelo.
Latitud/longitud son identificadores espaciales, no una semejanza fisica entre planetas.
La escala de las pendientes terrestres debe armonizarse con MOLA; el terreno rocoso local no queda resuelto.
Los periodos Viking y los mapas MOLA/TES son distintos y NO forman una campana simultanea.
Para comparar con salar de Coipasa, validar primero semejanza de terreno; no asumir similitud de sal/hielo.

## Abrir en Excel o Python
CSV UTF-8 con BOM, separador coma y punto decimal. Excel: Datos > Desde texto/CSV, elegir coma
y tipo decimal con punto si fuera necesario. Python: pandas.read_csv(...).
'''
(ROOT/'README.md').write_text(readme,encoding='utf-8')
(ROOT/'scripts').mkdir(exist_ok=True)
for name in ('preparar_utopia.py','finalizar_utopia.py'):
    shutil.copyfile(pathlib.Path(__file__).parent/name,ROOT/'scripts'/name)
zip_path=ROOT.parent/'Utopia_Viking2_datasets.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in ROOT.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(ROOT.parent))
with zipfile.ZipFile(zip_path) as z:assert z.testzip() is None
print(json.dumps(validation,ensure_ascii=False,indent=2))
print('ZIP',zip_path.stat().st_size)
