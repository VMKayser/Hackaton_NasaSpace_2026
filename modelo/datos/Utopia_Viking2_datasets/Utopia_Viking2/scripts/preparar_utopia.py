import csv, json, re, math, hashlib, urllib.request, pathlib
from collections import Counter, defaultdict
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'outputs' / 'Utopia_Viking2'
RAW = ROOT / 'originales'
BASE = 'https://atmos.nmsu.edu/PDS/data/vl_1001/data/'
LAT, LON = 47.64, 134.29

def write_csv(name, rows, fields=None):
    rows = list(rows)
    with (ROOT / name).open('w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=fields or list(rows[0]))
        w.writeheader(); w.writerows(rows)

def parse(stem):
    label = (RAW / (stem + '.lbl')).read_text('ascii')
    cols = []
    for block in re.findall(r'OBJECT\s*=\s*COLUMN\b(.*?)END_OBJECT', label, re.S):
        name = re.search(r'NAME\s*=\s*"([^"]+)"', block).group(1)
        start = int(re.search(r'START_BYTE\s*=\s*(\d+)', block).group(1)) - 1
        size = int(re.search(r'\bBYTES\s*=\s*(\d+)', block).group(1))
        typ = re.search(r'DATA_TYPE\s*=\s*(\w+)', block).group(1)
        cols.append((name, start, size, typ))
    data = (RAW / (stem + '.dat')).read_text('ascii').splitlines()
    expected = int(re.search(r'FILE_RECORDS\s*=\s*(\d+)', label).group(1))
    assert len(data) == expected, (stem, len(data), expected)
    rows = []
    for lineno, line in enumerate(data, 1):
        row = {'source_row': lineno}
        for name, start, size, typ in cols:
            value = line[start:start+size].strip()
            row[name] = value if typ == 'CHARACTER' else (int(value) if typ == 'ASCII_INTEGER' else float(value))
        if row['SC_ID'] == 'VL2': rows.append(row)
    write_csv(stem + '_VL2_original.csv', rows)
    return rows

tbin, avep, opac = [parse(stem) for stem in ('vl_tbin', 'vl_avep', 'vl_opac')]
processed = []
for r in tbin:
    good_t = not r['T_NLI_FLAG'] and r['TAMB_NLI_MN'] > 0 and r['WND_TMP_NLI'] > 0
    good_p = not r['PRESS_FLAG'] and r['PRESS_MEAN'] > 0 and r['PRESS_TOT'] > 0
    good_w = not r['WIND_FLG'] and r['WND_SPD_MEAN'] >= 0 and r['WND_TMP_NLI'] > 0
    processed.append(dict(site_id='UTOPIA_VIKING2', sol=r['MARTIAN_DAY'], bin_1_25=r['LOCAL_HR_BIN'],
        viking_year=r['VIKING_YEAR'], ls_deg=r['SOL_LON'],
        air_temperature_C=round(r['TAMB_NLI_MN']-273.15, 2) if good_t else '',
        pressure_Pa=round(r['PRESS_MEAN']*100, 2) if good_p else '',
        wind_speed_m_s=r['WND_SPD_MEAN'] if good_w else '',
        temperature_flag=r['T_NLI_FLAG'], pressure_flag=r['PRESS_FLAG'], wind_flag=r['WIND_FLG'],
        temperature_accepted=int(good_t), pressure_accepted=int(good_p), wind_accepted=int(good_w),
        source_row=r['source_row']))
write_csv('meteorologia_VL2_SI.csv', processed)
by_sol = defaultdict(list)
for r in processed: by_sol[r['sol']].append(r)
daily = []
for sol, rows in sorted(by_sol.items()):
    row = dict(site_id='UTOPIA_VIKING2', sol=sol, bins_present=len(rows))
    for key, prefix in [('air_temperature_C','air_temperature_C'),('pressure_Pa','pressure_Pa'),('wind_speed_m_s','wind_speed_m_s')]:
        vals = [r[key] for r in rows if r[key] != '']
        row[prefix+'_n_valid_bins'] = len(vals)
        for stat, fun in [('min',min),('mean',lambda x: sum(x)/len(x)),('max',max)]:
            row[prefix+'_'+stat] = round(fun(vals),4) if vals else ''
    daily.append(row)
write_csv('resumen_por_sol_VL2.csv', daily)

# These files are archival numeric text; no interpolation is added here.
write_csv('presion_diaria_VL2_SI.csv', [dict(sol=r['MARTIAN_DAY'],viking_year=r['VIKING_YEAR'],ls_deg=r['SOL_LON'],
    pressure_mean_Pa=round(r['PRESS_MEAN']*100,3) if r['PRESS_MEAN']>0 else '',
    pressure_min_Pa=round(r['PRESS_MIN']*100,3) if r['PRESS_MIN']>0 else '',
    pressure_max_Pa=round((r['PRESS_MIN']+r['PRESS_RANGE'])*100,3) if r['PRESS_MIN']>0 and r['PRESS_RANGE']>=0 else '',
    warning_flag=r['WARNING_FLAG'],source_row=r['source_row']) for r in avep])

manifest = {'site':{'name':'Viking 2, Utopia Planitia','latitude_planetocentric_deg_approx':LAT,
    'longitude_east_deg_approx':LON,'coordinate_source':'https://science.nasa.gov/mission/viking/',
    'coordinate_note':'Coordenadas publicadas aproximadas; no sustituir por latitud planetografica de otras fuentes.'},
    'tables':{}, 'sources':[]}
for stem,rows in zip(('vl_tbin','vl_avep','vl_opac'),(tbin,avep,opac)):
    manifest['tables'][stem]={'rows_VL2':len(rows),'sol_min':min(r['MARTIAN_DAY'] for r in rows),'sol_max':max(r['MARTIAN_DAY'] for r in rows)}
    for ext in ('dat','lbl','xml'):
        path = RAW/(stem+'.'+ext)
        manifest['sources'].append({'file':str(path.relative_to(ROOT)),'url':BASE+path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
manifest['accepted_bins']={k:sum(r[k] for r in processed) for k in ('temperature_accepted','pressure_accepted','wind_accepted')}

def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Scientific-data-download/1.0'})
    with urllib.request.urlopen(req,timeout=60) as response: return response.read()

def subset_image(url, dtype, ncols, r0, r1, c0, c1, label_url):
    # Preserve an exact consecutive-row binary extract plus request metadata.
    itemsize=np.dtype(dtype).itemsize
    begin=r0*ncols*itemsize; end=(r1+1)*ncols*itemsize-1
    req=urllib.request.Request(url,headers={'Range':'bytes=%d-%d'%(begin,end),'User-Agent':'Scientific-data-download/1.0'})
    with urllib.request.urlopen(req,timeout=90) as response:
        status=response.status
        if status==206:
            content_range=response.headers.get('Content-Range','')
            assert content_range.startswith('bytes %d-'%begin),content_range
            data=response.read()
        else:
            remaining=begin
            while remaining:
                chunk=response.read(min(1048576,remaining))
                if not chunk: raise ValueError('Truncated response')
                remaining-=len(chunk)
            data=response.read(end-begin+1)
    assert len(data)==end-begin+1,(len(data),end-begin+1)
    filename=url.rsplit('/',1)[-1]
    (RAW/(filename+'.rows_%d_%d.bin'%(r0,r1))).write_bytes(data)
    (RAW/filename.replace('.img','.lbl')).write_bytes(get(label_url))
    manifest['sources'].append({'url':url,'label_url':label_url,'zero_based_row_range':[r0,r1],
        'zero_based_column_range':[c0,c1],'http_status':status,'byte_range':[begin,end],
        'sha256_rows':hashlib.sha256(data).hexdigest()})
    return np.frombuffer(data,dtype=dtype).reshape(r1-r0+1,ncols)[:,c0:c1+1].copy()

try:
    base='https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg128/'
    res=128; radius=5000; R=3396000
    r0=int((88-(LAT+.13))*res); r1=int((88-(LAT-.13))*res)
    c0=int((LON-.20-90)*res); c1=int((LON+.20-90)*res)
    z=subset_image(base+'megt88n090hb.img','>i2',11520,r0,r1,c0,c1,base+'megt88n090hb.lbl').astype(float)
    counts=subset_image(base+'megc88n090hb.img','>i1',11520,r0,r1,c0,c1,base+'megc88n090hb.lbl') if False else None
    # Pixel centres follow the geographic bounds in the PDS label.
    latitudes=88-(np.arange(r0,r1+1)+.5)/res
    longitudes=90+(np.arange(c0,c1+1)+.5)/res
    lon,lat=np.meshgrid(longitudes,latitudes)
    x=R*np.cos(np.deg2rad(LAT))*np.deg2rad(lon-LON); y=R*np.deg2rad(lat-LAT)
    mask=x*x+y*y<=radius**2
    dy=R*math.pi/180/res
    dzdy,dzdx_idx=np.gradient(z,dy,1)
    dx=R*np.cos(np.deg2rad(lat))*math.pi/180/res
    slopes=np.rad2deg(np.arctan(np.hypot(dzdy,dzdx_idx/dx)))
    A=np.column_stack([x[mask],y[mask],np.ones(mask.sum())])
    residual=z[mask]-A.dot(np.linalg.lstsq(A,z[mask],rcond=None)[0])
    write_csv('terreno_MOLA_radio5km.csv',[dict(latitude_deg=round(float(lat[i,j]),8),longitude_east_deg=round(float(lon[i,j]),8),
        elevation_m=float(z[i,j]),regional_slope_deg=round(float(slopes[i,j]),5)) for i,j in zip(*np.where(mask))])
    terrain={'site_id':'UTOPIA_VIKING2','latitude_deg_approx':LAT,'longitude_east_deg_approx':LON,'radius_m':radius,
        'n_mola_pixels':int(mask.sum()),'elevation_mean_m':round(float(z[mask].mean()),3),
        'elevation_min_m':float(z[mask].min()),'elevation_max_m':float(z[mask].max()),
        'regional_slope_mean_deg':round(float(slopes[mask].mean()),5),'regional_slope_max_deg':round(float(slopes[mask].max()),5),
        'detrended_relief_rms_5km_m':round(float(np.sqrt(np.mean(residual**2))),3)}
    write_csv('resumen_terreno_MOLA.csv',[terrain]); manifest['terrain']=terrain
except Exception as e:
    manifest['terrain_error']=repr(e)

try:
    base='https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data/'
    r0=int((90-LAT-.18)*20);r1=int((90-LAT+.18)*20)
    c0=int((LON+180-.25)*20);c1=int((LON+180+.25)*20)
    ti=subset_image(base+'global_ti_night_2007.img','>i2',7200,r0,r1,c0,c1,base+'global_ti_night_2007.lbl')
    msk=subset_image(base+'global_ti_msk_night_2007.img','u1',7200,r0,r1,c0,c1,base+'global_ti_msk_night_2007.lbl')
    rows=[]
    for i,j in np.ndindex(ti.shape):
        plat=90-(r0+i+.5)/20; plon=-180+(c0+j+.5)/20
        distance=R*math.hypot(math.radians(plat-LAT),math.cos(math.radians(LAT))*math.radians(plon-LON))
        if distance<=5000:
            rows.append(dict(latitude_deg=round(plat,5),longitude_east_deg=round(plon,5),
                thermal_inertia_J_m2_K_s05=int(ti[i,j]) if ti[i,j]>0 else '',interpolation_mask=int(msk[i,j]),
                interpolation_mask_note='0=interpolado; otros valores: consultar etiqueta'))
    write_csv('inercia_TES_radio5km.csv',rows)
    manifest['tes_rows']=len(rows)
except Exception as e:
    manifest['tes_error']=repr(e)

(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False,indent=2))
