import pathlib,sys,csv,json,struct,zipfile,gzip,hashlib,math
import numpy as np
sys.path.insert(0,str(pathlib.Path(__file__).parent/'geolibs'))
from shapely.geometry import shape,Point
from shapely.prepared import prep
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'originales'
poly=prep(shape(json.loads((ROOT/'contorno_Deuteronilus_MDIM21_Mars.geojson').read_text())['features'][0]['geometry']))
def inside(x,y):return poly.contains(Point(x,y))
def write(name,rows,fields=None):
    with (ROOT/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows)
def read(name):
    with (ROOT/name).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def dbf(data):
    count=struct.unpack_from('<I',data,4)[0];hl,rl=struct.unpack_from('<HH',data,8);fields=[];p=32
    while data[p]!=13:
        d=data[p:p+32];fields.append((d[:11].split(b'\0')[0].decode(),chr(d[11]),d[16]));p+=32
    for i in range(count):
        row=data[hl+i*rl:hl+(i+1)*rl]
        if row[:1]==b'*':continue
        out={};off=1
        for name,typ,width in fields:
            s=row[off:off+width].decode('ascii').strip();off+=width
            out[name]=float(s) if s and typ in 'NF' else s
        yield out
radar=[];radar_counts={}
for ds,kind in [('ds02','MANTLE_REFLECTOR'),('ds03','LDA_BASAL_REFLECTOR')]:
    with zipfile.ZipFile(RAW/f'SHARAD_{ds}.zip') as z:
        fn=next(n for n in z.namelist() if n.endswith('.dbf') and '__MACOSX' not in n)
        allrows=list(dbf(z.read(fn)))
    selected=[]
    for k,r in enumerate(allrows):
        x,y=r['LONGITUDE'],r['LATITUDE']
        if not inside(x,y):continue
        assert abs(r['TIME_DEL']-.0375*r['DIFF_PIX'])<1e-4 # rounded DBF values
        rr={'radar_point_id':f'DMSHARAD_{ds}_{k+1:05d}','latitude_deg':y,'longitude_east_deg':x,
            'reflector_class':kind,'source_dataset':ds,'time_delay_us':r['TIME_DEL']}
        rr.update(r);selected.append(rr);radar.append(rr)
    write(f'radar_SHARAD_{ds}.csv',selected)
    radar_counts[ds]={'original_records':len(allrows),'within_region':len(selected)}
print('RADAR',radar_counts,flush=True)

names=['quartz','K_feldspar','plagioclase','amphibole','low_Ca_pyroxene','high_Ca_pyroxene','olivine','hematite','sulfates','carbonates','sheet_silicates_high_Si_glass','surface_dust','spectral_RMS_error']
a=np.loadtxt(gzip.open(RAW/'TES_mineral_maps_2_ppd.ascii.gz')).reshape(13,360,720)
# Provider's labeled global map: north up, equator at middle row, longitude 0 at middle column.
# ASCII orientation independently checked against the provider's plagioclase map.
rgb=np.array(Image.open(RAW/'plagioclase_4_ppd_mola.tif').resize((720,360))).astype(float)
visible=(rgb.max(2)-rgb.min(2))>30;valid=a[2]>=0
orient={f'flip_{flip}_roll_{roll}':float(np.mean(visible==np.roll(valid[::-1] if flip else valid,roll,axis=1))) for flip in (0,1) for roll in (0,360)}
assert max(orient,key=orient.get)=='flip_0_roll_0'
minerals=[]
for i in range(360):
    y=90-(i+.5)/2
    if not 39<y<51:continue
    for j in range(720):
        x=-180+(j+.5)/2
        if not inside(x,y):continue
        r={'mineral_cell_id':f'DMMIN2_{i}_{j}','latitude_deg':y,'longitude_east_deg':x}
        for b,name in enumerate(names):r[name+('_source_fraction' if b<12 else '')]=float(a[b,i,j]) if a[b,i,j]>=0 else ''
        r['any_missing']=int(np.any(a[:,i,j]<0));r['any_abundance_gt_1']=int(np.any(a[:12,i,j]>1));minerals.append(r)
write('minerales_TES.csv',minerals)
print('MINERALES',len(minerals),flush=True)

climate=read('clima_MCD_resumen_muestreo.csv');terrain={r['cell_id']:r for r in read('terreno_MOLA_variables.csv')}
inertia={r['tes_cell_id']:r for r in read('inercia_termica_TES.csv')};dust=read('polvo_MY36_resumen.csv')
lda=[r for r in radar if r['source_dataset']=='ds03'];lla=np.array([r['latitude_deg'] for r in lda]);llo=np.array([r['longitude_east_deg'] for r in lda])
def dist(lat,lon,ys,xs):
    p=np.deg2rad(lat);q=np.deg2rad(np.asarray(ys,dtype=float));dl=np.deg2rad(np.asarray(xs,dtype=float)-lon)
    h=np.sin((q-p)/2)**2+np.cos(p)*np.cos(q)*np.sin(dl/2)**2
    return 2*3396*np.arcsin(np.sqrt(np.clip(h,0,1)))
master=[]
for c in climate:
    y,x=float(c['latitude_deg']),float(c['longitude_east_deg']);r=dict(c)
    r['climate_data_type']=r.pop('data_type')
    r['solar_illumination_percent_continuous_period']=''
    r['solar_illumination_status']='NOT_CALCULATED_SAMPLE_PROXY_AVAILABLE'
    rr,cc=int((90-y)*64),int(x*64);key=f'DM64_{rr:04d}_{cc:05d}';t=terrain.get(key)
    r['terrain_cell_id']=key if t else '';r['terrain_match_distance_km']=''
    for f in list(next(iter(terrain.values())))[3:]:r[f]=t[f] if t else ''
    if t:r['terrain_match_distance_km']=round(float(dist(y,x,float(t['latitude_deg']),float(t['longitude_east_deg']))),5)
    tr,tc=int((90-y)*20),int(x*20);key=f'DMTES20_{tr}_{tc}';t=inertia.get(key)
    r['tes_cell_id']=key if t else '';r['thermal_inertia_J_m2_K_s05']=t['thermal_inertia_J_m2_K_s05'] if t else '';r['thermal_inertia_interpolated']=t['interpolated'] if t else ''
    r['thermal_inertia_match_distance_km']=round(float(dist(y,x,float(t['latitude_deg']),float(t['longitude_east_deg']))),5) if t else ''
    d=dist(y,x,[v['latitude_deg'] for v in dust],[v['longitude_east_deg'] for v in dust]);k=int(np.argmin(d));t=dust[k]
    r['dust_cell_id']=t['dust_cell_id'];r['dust_match_distance_km']=round(float(d[k]),3)
    for f in list(t)[3:]:r['dust_'+f]=t[f]
    d=dist(y,x,[v['latitude_deg'] for v in minerals],[v['longitude_east_deg'] for v in minerals]);k=int(np.argmin(d));t=minerals[k]
    r['mineral_cell_id']=t['mineral_cell_id'];r['mineral_match_distance_km']=round(float(d[k]),3)
    for f in list(t)[3:]:r['mineral_'+f]=t[f]
    d=dist(y,x,lla,llo);k=int(np.argmin(d));near=d[k]<=2
    r['nearest_LDA_distance_km']=round(float(d[k]),4)
    r['local_ice_evidence_status']='LDA_RADAR_WITHIN_2KM' if near else 'NO_LOCAL_MEASUREMENT_WITHIN_2KM'
    r['local_LDA_radar_point_id']=lda[k]['radar_point_id'] if near else ''
    r['local_LDA_conditional_depth_m_epsilon3p15']=lda[k]['THK_3p15'] if near else ''
    r['terrain_data_type']='MOLA_GRID_AND_DERIVED';r['thermal_inertia_data_type']='TES_RETRIEVAL';r['mineral_data_type']='TES_SPECTRAL_UNMIXING';r['dust_data_type']='MCS_MY36_RECONSTRUCTION';r['ice_data_type']='SHARAD_PUBLISHED_INTERPRETATION'
    master.append(r)
write('Deuteronilus_modelo.csv',master)
assert len(master)==469 and len({r['climate_point_id'] for r in master})==469
for r in master:
    for key in ('surface_temperature_C','surface_pressure_Pa','wind_speed_10m_m_s'):
        assert float(r[key+'_min_sampled'])<=float(r[key+'_mean_sampled'])<=float(r[key+'_max_sampled'])
    assert 0<=float(r['solar_positive_sample_pct'])<=100
    if r['local_LDA_radar_point_id']:assert r['nearest_LDA_distance_km']<=2
meta={'radar':radar_counts,'radar_time_units_note':'Source README says ms; paper Table 1 and DIFF_PIX*0.0375 confirm microseconds. Original TIME_DEL retained; time_delay_us added.',
 'mineral_rows':len(minerals),'mineral_coordinate_method':'0.5 degree cell centers, north-to-south, -180 to +180 east; reconstructed from source labeled global map, not embedded in ASCII/header.',
 'mineral_orientation_validity_mask_agreement':orient,'mineral_nodata':-1,'mineral_missing_rows':sum(r['any_missing'] for r in minerals),
 'master_rows':len(master),'master_columns':len(master[0]),'master_local_LDA_2km_rows':sum(bool(r['local_LDA_radar_point_id']) for r in master),
 'master_missing_terrain_rows':sum(not r['terrain_cell_id'] for r in master),'master_missing_inertia_rows':sum(not r['tes_cell_id'] for r in master),
 'master_max_mineral_join_km':max(r['mineral_match_distance_km'] for r in master),'master_max_dust_join_km':max(r['dust_match_distance_km'] for r in master),
 'validation':{'radar_pixel_to_time_delay_all_consistent':True,'master_ids_unique':True,'master_climate_min_mean_max_ordered':True,'mineral_orientation_checked_against_provider_map':True}}
(ROOT/'manifest_integracion.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
print('INTEGRACION',json.dumps(meta),flush=True)
