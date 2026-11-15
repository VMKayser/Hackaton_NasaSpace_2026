import urllib.request, json, time

start = time.time()
for batch in range(5):
    lats = [-16.5 + (batch*100 + i)*0.005 for i in range(100)]
    lons = [-68.15 + (batch*100 + i)*0.005 for i in range(100)]
    lat_str = ','.join(f'{x:.4f}' for x in lats)
    lon_str = ','.join(f'{x:.4f}' for x in lons)
    url = f'https://api.open-meteo.com/v1/elevation?latitude={lat_str}&longitude={lon_str}'
    req = urllib.request.urlopen(url, timeout=10)
    data = json.loads(req.read().decode('utf-8'))
    print(f'Batch {batch+1}/5: {len(data["elevation"])} points fetched in {time.time()-start:.2f}s.')
    time.sleep(0.05)

print(f'Total 500 points fetched in {time.time() - start:.2f} seconds.')
