
    // DATASET CENTRALIZADO DE ESTACIONES Y ANÁLOGOS TERRESTRES (47 ESTACIONES)
    const CENTRALIZED_STATIONS = [{"id": "uyuni", "name": "Salar de Uyuni", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -20.13, "lon": -67.49, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.8, "relief": 1.5, "roughness": 0.35, "temp": 8.5, "temp_swing": 25.0, "precip": 160.0, "solar_flux": 24.2, "atm_pressure": 65.2, "elevation": 3656.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "coipasa", "name": "Salar de Coipasa", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -19.38, "lon": -68.13, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 1.1, "relief": 2.2, "roughness": 0.45, "temp": 9.0, "temp_swing": 24.0, "precip": 180.0, "solar_flux": 24.0, "atm_pressure": 65.0, "elevation": 3680.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "sol-de-manana", "name": "Sol de Mañana", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.43, "lon": -67.76, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 14.5, "relief": 120.0, "roughness": 4.5, "temp": -2.5, "temp_swing": 28.0, "precip": 90.0, "solar_flux": 25.5, "atm_pressure": 57.5, "elevation": 4850.0, "geology": "hydrothermal", "minerals": NaN, "data_source": NaN}, {"id": "laguna-colorada", "name": "Laguna Colorada", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.2, "lon": -67.78, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 4.5, "relief": 45.0, "roughness": 1.8, "temp": 3.0, "temp_swing": 26.0, "precip": 110.0, "solar_flux": 25.0, "atm_pressure": 60.5, "elevation": 4278.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "siloli", "name": "Desierto de Siloli", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.05, "lon": -67.88, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 8.2, "relief": 65.0, "roughness": 2.8, "temp": 1.5, "temp_swing": 27.0, "precip": 75.0, "solar_flux": 25.8, "atm_pressure": 59.0, "elevation": 4500.0, "geology": "desert", "minerals": NaN, "data_source": NaN}, {"id": "dali", "name": "Desierto Salvador Dalí", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.6, "lon": -67.63, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 7.4, "relief": 58.0, "roughness": 2.4, "temp": 0.5, "temp_swing": 28.0, "precip": 65.0, "solar_flux": 26.0, "atm_pressure": 57.8, "elevation": 4750.0, "geology": "desert", "minerals": NaN, "data_source": NaN}, {"id": "licancabur-laguna-verde", "name": "Laguna Verde y Licancabur", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.79, "lon": -67.82, "known": true, "reference": false, "control": false, "radius_km": 2.0, "terrain": 22.0, "relief": 1400.0, "roughness": 15.0, "temp": -4.0, "temp_swing": 30.0, "precip": 80.0, "solar_flux": 26.5, "atm_pressure": 51.0, "elevation": 5916.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "uturuncu", "name": "Volcán Uturuncu", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.27, "lon": -67.18, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 24.5, "relief": 1600.0, "roughness": 18.5, "temp": -5.5, "temp_swing": 29.0, "precip": 85.0, "solar_flux": 26.4, "atm_pressure": 50.2, "elevation": 6008.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "sajama", "name": "Nevado Sajama", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -18.11, "lon": -68.88, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 28.5, "relief": 2200.0, "roughness": 24.0, "temp": -8.0, "temp_swing": 26.0, "precip": 320.0, "solar_flux": 25.2, "atm_pressure": 47.5, "elevation": 6542.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "ollague", "name": "Volcán Ollagüe", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.3, "lon": -68.18, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 21.0, "relief": 1500.0, "roughness": 16.0, "temp": -3.5, "temp_swing": 27.0, "precip": 95.0, "solar_flux": 26.1, "atm_pressure": 51.5, "elevation": 5868.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "tunupa", "name": "Volcán Tunupa", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -19.83, "lon": -67.63, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 19.5, "relief": 1700.0, "roughness": 14.0, "temp": 2.0, "temp_swing": 25.0, "precip": 180.0, "solar_flux": 24.8, "atm_pressure": 55.5, "elevation": 5321.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "poopo", "name": "Lago Poopó (lecho seco)", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -18.8, "lon": -67.0, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.6, "relief": 1.2, "roughness": 0.3, "temp": 11.5, "temp_swing": 22.0, "precip": 380.0, "solar_flux": 23.5, "atm_pressure": 65.5, "elevation": 3686.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "empexa", "name": "Salar de Empexa", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -20.33, "lon": -68.45, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.9, "relief": 1.8, "roughness": 0.4, "temp": 9.5, "temp_swing": 24.5, "precip": 150.0, "solar_flux": 24.5, "atm_pressure": 64.8, "elevation": 3720.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "chiguana", "name": "Salar de Chiguana", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.08, "lon": -67.92, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 1.4, "relief": 3.0, "roughness": 0.6, "temp": 8.0, "temp_swing": 25.0, "precip": 130.0, "solar_flux": 24.9, "atm_pressure": 65.1, "elevation": 3680.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "chalviri", "name": "Salar de Chalviri", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.53, "lon": -67.57, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 3.2, "relief": 25.0, "roughness": 1.2, "temp": 2.5, "temp_swing": 26.5, "precip": 100.0, "solar_flux": 25.5, "atm_pressure": 60.0, "elevation": 4369.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "capina", "name": "Salar de Capina", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.9, "lon": -67.6, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 2.8, "relief": 20.0, "roughness": 1.1, "temp": 3.5, "temp_swing": 26.0, "precip": 110.0, "solar_flux": 25.2, "atm_pressure": 60.8, "elevation": 4200.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "pastos-grandes", "name": "Laguna Pastos Grandes", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.63, "lon": -67.8, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 5.0, "relief": 60.0, "roughness": 2.2, "temp": 1.8, "temp_swing": 27.0, "precip": 120.0, "solar_flux": 25.1, "atm_pressure": 59.5, "elevation": 4430.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "laguna-hedionda", "name": "Laguna Hedionda", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.57, "lon": -68.05, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 4.2, "relief": 40.0, "roughness": 1.6, "temp": 3.0, "temp_swing": 26.0, "precip": 105.0, "solar_flux": 25.3, "atm_pressure": 61.0, "elevation": 4120.0, "geology": "salt_lake", "minerals": NaN, "data_source": NaN}, {"id": "polques", "name": "Termas de Polques", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -22.53, "lon": -67.65, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 12.0, "relief": 90.0, "roughness": 3.8, "temp": 1.0, "temp_swing": 27.5, "precip": 95.0, "solar_flux": 25.6, "atm_pressure": 59.8, "elevation": 4400.0, "geology": "hydrothermal", "minerals": NaN, "data_source": NaN}, {"id": "geiseres-sajama", "name": "Géiseres de Sajama", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -18.08, "lon": -68.97, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 11.5, "relief": 85.0, "roughness": 3.5, "temp": 2.0, "temp_swing": 25.0, "precip": 290.0, "solar_flux": 24.6, "atm_pressure": 59.2, "elevation": 4450.0, "geology": "hydrothermal", "minerals": NaN, "data_source": NaN}, {"id": "tata-sabaya", "name": "Tata Sabaya (avalancha de escombros)", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -19.13, "lon": -68.53, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 16.5, "relief": 750.0, "roughness": 12.0, "temp": 4.5, "temp_swing": 25.0, "precip": 190.0, "solar_flux": 24.7, "atm_pressure": 58.5, "elevation": 4700.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "los-frailes", "name": "Ignimbritas de Los Frailes", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -19.5, "lon": -66.3, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 15.0, "relief": 450.0, "roughness": 8.5, "temp": 7.0, "temp_swing": 23.0, "precip": 350.0, "solar_flux": 23.8, "atm_pressure": 61.5, "elevation": 4200.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "jayu-khota", "name": "Maar de Jayu Khota", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -19.47, "lon": -67.43, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 13.0, "relief": 120.0, "roughness": 5.0, "temp": 9.0, "temp_swing": 24.0, "precip": 210.0, "solar_flux": 24.2, "atm_pressure": 64.0, "elevation": 3750.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "valle-de-rocas", "name": "Valle de Rocas", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.6, "lon": -67.6, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 10.5, "relief": 85.0, "roughness": 4.8, "temp": 5.0, "temp_swing": 26.5, "precip": 120.0, "solar_flux": 25.3, "atm_pressure": 62.0, "elevation": 4050.0, "geology": "desert", "minerals": NaN, "data_source": NaN}, {"id": "tupiza", "name": "Quebradas de Tupiza", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -21.42, "lon": -65.72, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 18.0, "relief": 380.0, "roughness": 9.2, "temp": 14.0, "temp_swing": 21.0, "precip": 310.0, "solar_flux": 23.5, "atm_pressure": 70.5, "elevation": 2950.0, "geology": "erosion", "minerals": NaN, "data_source": NaN}, {"id": "valle-de-la-luna", "name": "Valle de la Luna, La Paz", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -16.57, "lon": -68.09, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 16.8, "relief": 180.0, "roughness": 6.8, "temp": 12.5, "temp_swing": 18.0, "precip": 450.0, "solar_flux": 22.8, "atm_pressure": 66.8, "elevation": 3450.0, "geology": "erosion", "minerals": NaN, "data_source": NaN}, {"id": "huayna-potosi", "name": "Huayna Potosí", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -16.26, "lon": -68.15, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 31.0, "relief": 1850.0, "roughness": 22.5, "temp": -6.0, "temp_swing": 22.0, "precip": 650.0, "solar_flux": 23.2, "atm_pressure": 49.5, "elevation": 6088.0, "geology": "glacial", "minerals": NaN, "data_source": NaN}, {"id": "umajalanta", "name": "Caverna de Umajalanta, Torotoro", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -18.13, "lon": -65.76, "known": false, "reference": false, "control": false, "radius_km": 2.0, "terrain": 14.0, "relief": 220.0, "roughness": 7.0, "temp": 16.0, "temp_swing": 16.0, "precip": 580.0, "solar_flux": 21.5, "atm_pressure": 73.0, "elevation": 2700.0, "geology": "cave", "minerals": NaN, "data_source": NaN}, {"id": "yungay-atacama", "name": "Yungay, Atacama (Chile)", "category": "catalog_earth", "body": "earth", "country": "Chile", "lat": -24.08, "lon": -69.92, "known": true, "reference": true, "control": false, "radius_km": 2.0, "terrain": 7.1, "relief": 92.0, "roughness": 3.2, "temp": 17.5, "temp_swing": 22.0, "precip": 2.0, "solar_flux": 23.8, "atm_pressure": 91.0, "elevation": 950.0, "geology": "desert", "minerals": NaN, "data_source": NaN}, {"id": "trinidad-control", "name": "Trinidad, Beni", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -14.83, "lon": -64.9, "known": false, "reference": false, "control": true, "radius_km": 2.0, "terrain": 0.4, "relief": 2.0, "roughness": 0.15, "temp": 26.5, "temp_swing": 11.0, "precip": 1850.0, "solar_flux": 18.5, "atm_pressure": 99.5, "elevation": 155.0, "geology": "humid_lowland", "minerals": NaN, "data_source": NaN}, {"id": "coroico-control", "name": "Coroico, Yungas", "category": "catalog_earth", "body": "earth", "country": "Bolivia", "lat": -16.19, "lon": -67.73, "known": false, "reference": false, "control": true, "radius_km": 2.0, "terrain": 28.0, "relief": 850.0, "roughness": 14.0, "temp": 19.0, "temp_swing": 12.0, "precip": 1450.0, "solar_flux": 17.2, "atm_pressure": 82.5, "elevation": 1750.0, "geology": "humid_mountain", "minerals": NaN, "data_source": NaN}, {"id": "mcmurdo-antarctica", "name": "McMurdo Dry Valleys (Antarctica)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": -77.5, "lon": 162.5, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 18.2, "relief": 950.0, "roughness": 12.0, "temp": -19.5, "temp_swing": 35.0, "precip": 15.0, "solar_flux": 11.2, "atm_pressure": 98.0, "elevation": 300.0, "geology": "polar_desert", "minerals": NaN, "data_source": NaN}, {"id": "askja-iceland", "name": "Askja Caldera (Iceland)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 65.03, "lon": -16.75, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 15.5, "relief": 420.0, "roughness": 7.5, "temp": -1.5, "temp_swing": 18.0, "precip": 450.0, "solar_flux": 9.5, "atm_pressure": 88.0, "elevation": 1100.0, "geology": "volcanic", "minerals": NaN, "data_source": NaN}, {"id": "haughton-canada", "name": "Haughton Impact Crater (Devon Island, Canada)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 75.38, "lon": -89.68, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 12.8, "relief": 280.0, "roughness": 6.0, "temp": -17.5, "temp_swing": 32.0, "precip": 120.0, "solar_flux": 8.8, "atm_pressure": 98.5, "elevation": 180.0, "geology": "polar_crater", "minerals": NaN, "data_source": NaN}, {"id": "rio-tinto-spain", "name": "Río Tinto (Spain)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 37.69, "lon": -6.56, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 9.2, "relief": 120.0, "roughness": 3.8, "temp": 17.8, "temp_swing": 15.0, "precip": 620.0, "solar_flux": 19.5, "atm_pressure": 97.0, "elevation": 320.0, "geology": "acid_mine_evaporite", "minerals": NaN, "data_source": NaN}, {"id": "sahara-algeria", "name": "Grand Erg Occidental (Sahara, Algeria)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 30.5, "lon": 0.5, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 8.0, "relief": 110.0, "roughness": 4.0, "temp": 24.5, "temp_swing": 22.0, "precip": 30.0, "solar_flux": 24.5, "atm_pressure": 96.0, "elevation": 450.0, "geology": "desert", "minerals": NaN, "data_source": NaN}, {"id": "amazon-manaus", "name": "Central Amazon Rainforest (Brazil)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": -3.1, "lon": -60.0, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 1.2, "relief": 25.0, "roughness": 0.8, "temp": 27.2, "temp_swing": 9.0, "precip": 2400.0, "solar_flux": 17.5, "atm_pressure": 100.2, "elevation": 60.0, "geology": "tropical_rainforest", "minerals": NaN, "data_source": NaN}, {"id": "siberia-yakutsk", "name": "Central Siberian Taiga (Russia)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 62.0, "lon": 129.7, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 3.5, "relief": 80.0, "roughness": 1.5, "temp": -8.8, "temp_swing": 45.0, "precip": 260.0, "solar_flux": 10.5, "atm_pressure": 99.8, "elevation": 120.0, "geology": "permafrost_forest", "minerals": NaN, "data_source": NaN}, {"id": "himalaya-everest", "name": "Mount Everest Flanks (Nepal/Tibet)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 27.98, "lon": 86.92, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 38.0, "relief": 3500.0, "roughness": 45.0, "temp": -18.0, "temp_swing": 20.0, "precip": 450.0, "solar_flux": 25.0, "atm_pressure": 35.0, "elevation": 7200.0, "geology": "glacial", "minerals": NaN, "data_source": NaN}, {"id": "mojave-death-valley", "name": "Death Valley (Mojave, USA)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 36.5, "lon": -117.0, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 6.5, "relief": 240.0, "roughness": 3.2, "temp": 25.5, "temp_swing": 25.0, "precip": 55.0, "solar_flux": 23.8, "atm_pressure": 102.0, "elevation": -86.0, "geology": "desert_playa", "minerals": NaN, "data_source": NaN}, {"id": "great-plains-kansas", "name": "Great Plains (Kansas, USA)", "category": "global_earth_grid", "body": "earth", "country": "Global", "lat": 38.5, "lon": -98.5, "known": false, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.8, "relief": 12.0, "roughness": 0.4, "temp": 13.0, "temp_swing": 16.0, "precip": 720.0, "solar_flux": 18.2, "atm_pressure": 95.5, "elevation": 500.0, "geology": "grassland", "minerals": NaN, "data_source": NaN}, {"id": "jezero", "name": "Jezero (Mars)", "category": "planetary_target", "body": "mars", "country": "Mars", "lat": 18.44, "lon": 77.45, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 9.7, "relief": 80.0, "roughness": 8.5, "temp": -60.0, "temp_swing": 90.0, "precip": 0.0, "solar_flux": 9.5, "atm_pressure": 0.61, "elevation": -2500.0, "geology": "delta_evaporite", "minerals": NaN, "data_source": NaN}, {"id": "gale", "name": "Gale (Mars)", "category": "planetary_target", "body": "mars", "country": "Mars", "lat": -5.4, "lon": 137.8, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 12.5, "relief": 450.0, "roughness": 11.0, "temp": -55.0, "temp_swing": 85.0, "precip": 0.0, "solar_flux": 9.8, "atm_pressure": 0.65, "elevation": -4500.0, "geology": "crater_mound", "minerals": NaN, "data_source": NaN}, {"id": "meridiani", "name": "Meridiani Planum (Mars)", "category": "planetary_target", "body": "mars", "country": "Mars", "lat": -2.0, "lon": -5.5, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 2.1, "relief": 15.0, "roughness": 1.2, "temp": -50.0, "temp_swing": 80.0, "precip": 0.0, "solar_flux": 10.2, "atm_pressure": 0.68, "elevation": -1200.0, "geology": "hematite_plain", "minerals": NaN, "data_source": NaN}, {"id": "shackleton", "name": "Shackleton (Moon)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": -89.9, "lon": 0.0, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 24.5, "relief": 1200.0, "roughness": 25.0, "temp": -180.0, "temp_swing": 280.0, "precip": 0.0, "solar_flux": 4.5, "atm_pressure": 0.0, "elevation": -4200.0, "geology": "polar_crater", "minerals": NaN, "data_source": NaN}, {"id": "tranquility", "name": "Tranquility Base (Moon)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": 0.67, "lon": 23.47, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 3.8, "relief": 25.0, "roughness": 3.5, "temp": -20.0, "temp_swing": 290.0, "precip": 0.0, "solar_flux": 15.0, "atm_pressure": 0.0, "elevation": -1500.0, "geology": "mare_basalt", "minerals": NaN, "data_source": NaN}, {"id": "antofagasta-alumbrera", "name": "Antofagasta de la Sierra (Volcán Alumbrera)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -26.62, "lon": -67.5, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 8.5, "relief": 95.0, "roughness": 2.2, "temp": 7.0, "temp_swing": 24.0, "precip": 75.0, "solar_flux": 25.0, "atm_pressure": 66.2, "elevation": 3450.0, "geology": "volcanic_basalt", "minerals": NaN, "data_source": NaN}, {"id": "de-gerlache-rim-2", "name": "de Gerlache Rim 2 (Luna - Candidato Artemis III)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": -88.22, "lon": -64.61, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 12.7, "relief": 750.0, "roughness": 2.45, "temp": -204.8, "temp_swing": 110.0, "precip": 0.0, "solar_flux": 5.0, "atm_pressure": 0.0, "elevation": -135.0, "geology": "polar_crater_rim", "minerals": "Anortosita lunar rica en Ca (Plagioclasa >88%), Piroxeno pobre en Ti, Olivino magnesiano, Hielo volátil en PSR", "data_source": "NASA ADC FY23 / LRO LOLA DEM & Slope / LRO Diviner PCP Summer Tbol"}, {"id": "mons-mouton-plateau", "name": "Mons Mouton Plateau (Luna - Artemis III & VIPER)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": -84.7, "lon": -32.5, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 10.6, "relief": 480.0, "roughness": 2.0, "temp": -188.0, "temp_swing": 160.0, "precip": 0.0, "solar_flux": 8.5, "atm_pressure": 0.0, "elevation": 1250.0, "geology": "polar_plateau", "minerals": "Anortosita norítica (Plagioclasa cálcica), Piroxeno, Volátiles condensables atrapados en regolito criogénico", "data_source": "LRO LOLA (LDEM, LDSM, LDRM) / LRO Diviner PRP (DLRE_PRP_SOUTH.TAB) / Wueller et al."}, {"id": "rima-hadley", "name": "Rima Hadley (Luna - Apollo 15)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": 26.13, "lon": 3.63, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 8.5, "relief": 300.0, "roughness": 2.2, "temp": -20.0, "temp_swing": 280.0, "precip": 0.0, "solar_flux": 14.8, "atm_pressure": 0.0, "elevation": -1900.0, "geology": "rille_basalt", "minerals": "Basalto olivínico rico en hierro, Piroxeno (Pigeonita/Augita), Plagioclasa cálcica, Ilmenita accesoria", "data_source": "NASA Apollo 15 Lunar Surface Samples / LRO LOLA Altimetry"}, {"id": "marius-hills", "name": "Colinas de Marius (Luna - Tubo de Lava)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": 14.08, "lon": -56.77, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 8.5, "relief": 80.0, "roughness": 9.2, "temp": -25.0, "temp_swing": 280.0, "precip": 0.0, "solar_flux": 14.5, "atm_pressure": 0.0, "elevation": -2100.0, "geology": "lava_tube", "minerals": "Basalto vesicular continuo, Piroxeno, Olivino, Regolito vítreo aglutinado", "data_source": "JAXA Kaguya / NASA LRO Diviner & Camera Team"}, {"id": "taurus-littrow", "name": "Taurus-Littrow (Luna - Apollo 17)", "category": "planetary_target", "body": "moon", "country": "Moon", "lat": 20.19, "lon": 30.77, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 16.5, "relief": 1600.0, "roughness": 18.0, "temp": -15.0, "temp_swing": 285.0, "precip": 0.0, "solar_flux": 14.8, "atm_pressure": 0.0, "elevation": -2800.0, "geology": "pyroclastic_valley", "minerals": "Vidrio piroclástico volcánico naranja, Basalto titanífero, Anortosita de macizo", "data_source": "NASA Apollo 17 Geologic Traverse / LOLA DEM"}, {"id": "mawrth-vallis", "name": "Mawrth Vallis (Marte)", "category": "planetary_target", "body": "mars", "country": "Mars", "lat": 23.99, "lon": -18.96, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 4.5, "relief": 150.0, "roughness": 1.8, "temp": -55.0, "temp_swing": 75.0, "precip": 0.0, "solar_flux": 9.8, "atm_pressure": 0.65, "elevation": -2200.0, "geology": "phyllosilicate_strata", "minerals": "Esmectitas de Fe/Mg (Nontronita), Esmectitas de Al (Montmorillonita), Caolinita, Hematita estratificada", "data_source": "MRO CRISM Hyperspectral / Mars Express OMEGA"}, {"id": "arcadia-planitia", "name": "Arcadia Planitia (Marte - Base Mars Alpha)", "category": "planetary_target", "body": "mars", "country": "Mars", "lat": 39.3, "lon": -171.0, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 1.2, "relief": 10.0, "roughness": 0.8, "temp": -65.0, "temp_swing": 70.0, "precip": 0.0, "solar_flux": 8.8, "atm_pressure": 0.72, "elevation": -3800.0, "geology": "permafrost_ice_sheet", "minerals": "Hielo de agua subsuperficial masivo (a 1-2m), Regolito basáltico eólico, Sulfatos", "data_source": "MRO SHARAD Subsurface Radar / HiRISE Expansion Polygons"}, {"id": "gusev-crater", "name": "Cráter Gusev / Home Plate (Marte)", "category": "planetary_target", "body": "mars", "country": "Mars", "lat": -14.57, "lon": 175.47, "known": true, "reference": true, "control": false, "radius_km": 10.0, "terrain": 4.8, "relief": 45.0, "roughness": 3.2, "temp": -50.0, "temp_swing": 75.0, "precip": 0.0, "solar_flux": 10.1, "atm_pressure": 0.64, "elevation": -1900.0, "geology": "volcanic_basalt", "minerals": "Basalto rico en olivino (Picrita), Depósitos de sílice hidrotermal opalina (>90% SiO2), Hematita, Sulfatos de Mg", "data_source": "NASA Mars Exploration Rover Spirit / Mini-TES / Mössbauer"}, {"id": "ischigualasto-talampaya", "name": "Cuenca de Ischigualasto / Valle de la Luna (San Juan - Argentina)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -30.01, "lon": -67.95, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 4.8, "relief": 120.0, "roughness": 1.6, "temp": 17.5, "temp_swing": 22.0, "precip": 120.0, "solar_flux": 22.5, "atm_pressure": 86.8, "elevation": 1300.0, "geology": "sedimentary_strata", "minerals": "Arcillas rojas (Esmectita, Illita), Areniscas fluviales ricas en óxidos de hierro (Hematita/Goethita), Yeso detrítico", "data_source": "SRTM GL1 v003 / NASA POWER Agroclimatology / IGCB Argentina"}, {"id": "talampaya-canyon", "name": "Parque Nacional Talampaya (La Rioja - Argentina)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -29.8, "lon": -67.85, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 18.5, "relief": 180.0, "roughness": 6.2, "temp": 18.2, "temp_swing": 23.0, "precip": 135.0, "solar_flux": 22.8, "atm_pressure": 86.2, "elevation": 1350.0, "geology": "eroded_canyon", "minerals": "Areniscas rojas triásicas ricas en hematita, Paredes de arcilitas estratificadas", "data_source": "NASADEM HGT v001 / IGN Argentina"}, {"id": "salar-hombre-muerto", "name": "Salar del Hombre Muerto (Catamarca/Salta - Argentina)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -25.4, "lon": -67.1, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.9, "relief": 2.0, "roughness": 0.38, "temp": 5.5, "temp_swing": 26.0, "precip": 60.0, "solar_flux": 25.8, "atm_pressure": 62.5, "elevation": 4000.0, "geology": "salt_lake", "minerals": "Halita, Yeso, Boratos (Ulexita, Borax), Salmuera rica en Litio", "data_source": "Copernicus GLO-30 DEM / MODIS MOD11A2"}, {"id": "payunia-mendoza", "name": "La Payunia / Campo Volcánico Llancanelo (Mendoza - Argentina)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -36.4, "lon": -69.2, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 7.2, "relief": 140.0, "roughness": 2.1, "temp": 11.0, "temp_swing": 20.0, "precip": 220.0, "solar_flux": 20.5, "atm_pressure": 81.2, "elevation": 1850.0, "geology": "volcanic_basalt", "minerals": "Basalto alcalino de conos de ceniza, Lapilli, Piroxenos, Olivino magnesiano", "data_source": "SRTM GL1 v003 / SEGEMAR"}, {"id": "barreal-blanco", "name": "Barreal Blanco / Pampa del Leoncito (San Juan - Argentina)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -31.7, "lon": -69.4, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.5, "relief": 1.0, "roughness": 0.25, "temp": 15.0, "temp_swing": 24.0, "precip": 80.0, "solar_flux": 23.0, "atm_pressure": 83.2, "elevation": 1650.0, "geology": "desert_playa", "minerals": "Limos y arcillas lacustres resecas, Carbonato de calcio, Sales de sulfato", "data_source": "NASADEM HGT v001 / CASLEO"}, {"id": "quebrada-humahuaca", "name": "Quebrada de Humahuaca (Jujuy - Argentina)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -23.2, "lon": -65.35, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 16.0, "relief": 450.0, "roughness": 7.5, "temp": 13.0, "temp_swing": 20.0, "precip": 180.0, "solar_flux": 24.0, "atm_pressure": 70.8, "elevation": 2950.0, "geology": "eroded_canyon", "minerals": "Areniscas multicolores (Cerro de los Siete Colores), Lutitas, Cuarzo, Limonita", "data_source": "SRTM GL1 v003 / IGN"}, {"id": "somuncura-patagonia", "name": "Meseta de Somuncurá (Río Negro - Patagonia)", "category": "catalog_earth", "body": "earth", "country": "Argentina", "lat": -41.2, "lon": -67.0, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 3.5, "relief": 60.0, "roughness": 1.5, "temp": 8.5, "temp_swing": 18.0, "precip": 190.0, "solar_flux": 17.5, "atm_pressure": 88.5, "elevation": 1100.0, "geology": "volcanic_basalt", "minerals": "Plataforma de coladas basálticas terciarias, Arcillas de lagunas efímeras", "data_source": "NASADEM HGT v001"}, {"id": "salar-atacama", "name": "Salar de Atacama (Antofagasta - Chile)", "category": "catalog_earth", "body": "earth", "country": "Chile", "lat": -23.5, "lon": -68.3, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 0.8, "relief": 2.0, "roughness": 0.45, "temp": 14.0, "temp_swing": 24.0, "precip": 25.0, "solar_flux": 24.8, "atm_pressure": 76.8, "elevation": 2300.0, "geology": "salt_lake", "minerals": "Halita rugosa poligonal, Yeso, Sulfatos de magnesio, Salmuera de litio", "data_source": "ASTER L1T v003 / SRTM"}, {"id": "monturaqui-crater", "name": "Cráter de Monturaqui (Atacama - Chile)", "category": "catalog_earth", "body": "earth", "country": "Chile", "lat": -23.93, "lon": -68.27, "known": true, "reference": false, "control": false, "radius_km": 2.0, "terrain": 14.0, "relief": 110.0, "roughness": 5.5, "temp": 10.0, "temp_swing": 25.0, "precip": 30.0, "solar_flux": 25.2, "atm_pressure": 70.5, "elevation": 3000.0, "geology": "eroded_canyon", "minerals": "Brechas de impacto meteorítico en granito, Vidrio de impacto, Magnetita", "data_source": "Copernicus GLO-30 DEM / USGS Impact Studies"}, {"id": "la-joya-desert", "name": "Desierto de La Joya / Toro Muerto (Arequipa - Perú)", "category": "catalog_earth", "body": "earth", "country": "Peru", "lat": -16.2, "lon": -72.5, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 5.0, "relief": 80.0, "roughness": 2.0, "temp": 18.0, "temp_swing": 20.0, "precip": 15.0, "solar_flux": 23.5, "atm_pressure": 88.0, "elevation": 1200.0, "geology": "desert", "minerals": "Suelos hiperáridos con percloratos traza, Ignimbritas, Cuarzo", "data_source": "SRTM GL1 v003 / NASA Astrobiology Institute"}, {"id": "dallol-danakil", "name": "Dallol Hydrothermal Salt Dome (Danakil - Etiopía)", "category": "global_earth_grid", "body": "earth", "country": "Ethiopia", "lat": 14.24, "lon": 40.3, "known": true, "reference": false, "control": false, "radius_km": 2.0, "terrain": 3.5, "relief": 30.0, "roughness": 1.2, "temp": 34.5, "temp_swing": 15.0, "precip": 50.0, "solar_flux": 24.5, "atm_pressure": 102.5, "elevation": -125.0, "geology": "hydrothermal", "minerals": "Halita hiperácida (pH < 1), Azufre nativo, Sulfatos férricos, Silvita", "data_source": "Copernicus GLO-30 / Planetary Analogs Danakil"}, {"id": "kilauea-hawaii", "name": "Kilauea Volcanic Fields (Hawaii - USA)", "category": "global_earth_grid", "body": "earth", "country": "USA", "lat": 19.41, "lon": -155.28, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 8.0, "relief": 75.0, "roughness": 2.8, "temp": 16.0, "temp_swing": 12.0, "precip": 1800.0, "solar_flux": 21.0, "atm_pressure": 88.0, "elevation": 1200.0, "geology": "volcanic_basalt", "minerals": "Basalto toleítico fresco (Pahoehoe & Aa), Vidrio basáltico, Olivino", "data_source": "USGS Hawaiian Volcano Observatory"}, {"id": "svalbard-permafrost", "name": "Svalbard Arctic Permafrost Tundra (Noruega)", "category": "global_earth_grid", "body": "earth", "country": "Norway", "lat": 78.22, "lon": 15.65, "known": true, "reference": false, "control": false, "radius_km": 5.0, "terrain": 9.0, "relief": 300.0, "roughness": 4.5, "temp": -4.5, "temp_swing": 18.0, "precip": 280.0, "solar_flux": 9.0, "atm_pressure": 100.5, "elevation": 50.0, "geology": "glacial", "minerals": "Permafrost continuo poligonal, Cuarzo, Feldespato alterado criogénicamente", "data_source": "Copernicus DEM / Svalbard Science Centre"}];

    // DESTINOS EXTRATERRESTRES EXPLORABLES (MARTE & LUNA)
    const PLANETARY_TARGETS_DATA = [
      {
        id: 'meridiani_planum',
        name: 'Meridiani Planum',
        body: 'Marte',
        mission: 'NASA MER-B / Rover Opportunity',
        lat: -2.05, lon: -5.50,
        elevation: -1200.0,
        terrain: 2.1, relief: 15.0, roughness: 1.2,
        temp: -52.0, temp_swing: 80.0, precip: 0.0, solar_flux: 10.2, atm_pressure: 0.68,
        geology: 'hematite_plain',
        minerals: ['Esférulas de hematita ("blueberries")', 'Jarosita', 'Yeso', 'Sulfatos hidratados'],
        summary: 'Planicie eólica hiperplana con evidencias de aguas ácidas freáticas en el pasado marciano.'
      },
      {
        id: 'elysium_planitia',
        name: 'Elysium Planitia (Llanuras Basálticas)',
        body: 'Marte',
        mission: 'NASA InSight / Misiones Geofísicas y Volcánicas',
        lat: 4.50, lon: 135.62,
        elevation: -2500.0,
        terrain: 4.2, relief: 45.0, roughness: 2.0,
        temp: -55.0, temp_swing: 78.0, precip: 0.0, solar_flux: 10.5, atm_pressure: 0.65,
        geology: 'volcanic_basalt',
        minerals: ['Basalto olivínico joven', 'Piroxeno (Augita)', 'Plagioclasa cálcica', 'Magnetita', 'Óxidos de hierro'],
        summary: 'Llanuras volcánicas lisas formadas por coladas de lava basáltica fluida joven y conos de escoria.'
      },
      {
        id: 'gusev_crater',
        name: 'Cráter Gusev (Colinas Columbia)',
        body: 'Marte',
        mission: 'NASA MER-A / Rover Spirit',
        lat: -14.57, lon: 175.47,
        elevation: -1900.0,
        terrain: 9.2, relief: 120.0, roughness: 7.8,
        temp: -58.0, temp_swing: 88.0, precip: 0.0, solar_flux: 9.9, atm_pressure: 0.64,
        geology: 'hydrothermal_silica',
        minerals: ['Basalto olivínico', 'Piroxeno (Augita)', 'Magnetita', 'Sílice opalina hidrotermal (90%)', 'Sulfatos de hierro'],
        summary: 'Antiguos respiraderos hidrotermales volcánicos y coladas de basalto olivínico.'
      },
      {
        id: 'jezero_crater',
        name: 'Cráter Jezero',
        body: 'Marte',
        mission: 'NASA Mars 2020 / Rover Perseverance & Ingenuity',
        lat: 18.38, lon: 77.58,
        elevation: -2500.0,
        terrain: 6.8, relief: 85.0, roughness: 8.5,
        temp: -55.0, temp_swing: 90.0, precip: 0.0, solar_flux: 9.5, atm_pressure: 0.61,
        geology: 'delta_evaporite',
        minerals: ['Arcillas esmectitas', 'Sulfatos (yeso)', 'Carbonato de Mg', 'Olivino', 'Basalto'],
        summary: 'Paleolago deltaico rico en arcillas y evaporitas.'
      },
      {
        id: 'gale_crater',
        name: 'Cráter Gale (Monte Sharp)',
        body: 'Marte',
        mission: 'NASA MSL / Rover Curiosity',
        lat: -5.40, lon: 137.80,
        elevation: -4500.0,
        terrain: 12.5, relief: 450.0, roughness: 11.0,
        temp: -50.0, temp_swing: 85.0, precip: 0.0, solar_flux: 9.8, atm_pressure: 0.65,
        geology: 'crater_mound',
        minerals: ['Sulfatos de calcio y magnesio', 'Arcillas estratificadas (Esmectitas)', 'Hematita', 'Magnetita'],
        summary: 'Secuencia estratigráfica sedimentaria de 5 km (Monte Sharp) con transición de arcillas a sulfatos.'
      },
      {
        id: 'mawrth_vallis',
        name: 'Mawrth Vallis (Meseta de Filosilicatos)',
        body: 'Marte',
        mission: 'NASA MRO (CRISM) / Candidato ExoMars Rosalind Franklin',
        lat: 23.99, lon: -18.96,
        elevation: -2200.0,
        terrain: 9.5, relief: 240.0, roughness: 8.5,
        temp: -55.0, temp_swing: 80.0, precip: 0.0, solar_flux: 10.2, atm_pressure: 0.70,
        geology: 'clay_phyllosilicates',
        minerals: ['Arcillas estratificadas (Esmectitas/Nontronita)', 'Óxidos de hierro (Hematita/Goethita)', 'Sulfatos de calcio', 'Filosilicatos de aluminio (Caolinita)'],
        summary: 'Una de las mayores secuencias sedimentarias estratificadas de Marte, rica en arcillas alteradas por agua neutra.'
      },
      {
        id: 'valles_marineris',
        name: 'Valles Marineris (Cañón Marciano)',
        body: 'Marte',
        mission: 'Futuras Misiones Tripuladas de Exploración Profunda',
        lat: -13.90, lon: -59.20,
        elevation: -3800.0,
        terrain: 28.5, relief: 3500.0, roughness: 22.0,
        temp: -45.0, temp_swing: 75.0, precip: 0.0, solar_flux: 10.4, atm_pressure: 0.85,
        geology: 'canyon_rift',
        minerals: ['Capas de basalto estratificado', 'Sulfatos masivos', 'Óxidos de hierro', 'Silicatos'],
        summary: 'El cañón más gigantesco del Sistema Solar (4,000 km longitud y 7 km profundidad).'
      },
      {
        id: 'arcadia_planitia',
        name: 'Arcadia Planitia',
        body: 'Marte',
        mission: 'NASA & SpaceX / Candidato Principal de Base Humana',
        lat: 39.30, lon: -171.00,
        elevation: -3000.0,
        terrain: 1.8, relief: 12.0, roughness: 1.5,
        temp: -72.0, temp_swing: 85.0, precip: 0.0, solar_flux: 7.8, atm_pressure: 0.72,
        geology: 'subsurface_ice',
        minerals: ['Hielo de agua masivo bajo regolito (1-2m)', 'Regolito basáltico', 'Polvo eólico'],
        summary: 'Planicies septentrionales con glaciares masivos enterrados accesibles para extracción de combustible e ISRU.'
      },
      {
        id: 'hadley_rille',
        name: 'Rima Hadley (Apeninos Lunares, Apollo 15)',
        body: 'Luna',
        mission: 'Misión Apollo 15 / Exploración Geológica de Mares y Grietas',
        lat: 26.13, lon: 3.63,
        elevation: -2200.0,
        terrain: 9.5, relief: 180.0, roughness: 2.4,
        temp: -20.0, temp_swing: 280.0, precip: 0.0, solar_flux: 14.5, atm_pressure: 0.0,
        geology: 'volcanic_basalt',
        minerals: ['Basalto de colada de lava vesicular', 'Olivino', 'Piroxeno (Augita)', 'Plagioclasa cálcica', 'Ilmenita'],
        summary: 'Grieta sinuosa volcánica colapsada en el mar de lava basáltica de Imbrium al pie de los Apeninos.'
      },
      {
        id: 'tranquility_base',
        name: 'Base Tranquilidad / Mare Tranquillitatis (Apollo 11)',
        body: 'Luna',
        mission: 'Misión Histórica Apollo 11 / Patrimonio Lunar',
        lat: 0.67, lon: 23.47,
        elevation: -1500.0,
        terrain: 3.8, relief: 25.0, roughness: 3.5,
        temp: -20.0, temp_swing: 290.0, precip: 0.0, solar_flux: 15.0, atm_pressure: 0.0,
        geology: 'volcanic_basalt',
        minerals: ['Basalto de mar lunar rico en titanio', 'Piroxeno (Augita)', 'Ilmenita (FeTiO3)', 'Plagioclasa cálcica', 'Olivino'],
        summary: 'Planicie de lava basáltica con alta concentración de ilmenita para extracción in-situ de oxígeno.'
      },
      {
        id: 'shackleton_crater',
        name: 'Cráter Shackleton (Polo Sur Lunar)',
        body: 'Luna',
        mission: 'NASA Artemis III & Artemis Base Camp',
        lat: -89.90, lon: 0.00,
        elevation: -4200.0,
        terrain: 24.5, relief: 1200.0, roughness: 25.0,
        temp: -180.0, temp_swing: 280.0, precip: 0.0, solar_flux: 4.5, atm_pressure: 0.0,
        geology: 'polar_crater',
        minerals: ['Hielo de agua en sombra permanente (PSR)', 'Anortosita lunar', 'Piroxeno', 'Vidrio de impacto'],
        summary: 'Pico de Luz Eterna en el borde y depósitos de hielo de agua en el fondo a 40 Kelvin (-233°C).'
      },
      {
        id: 'marius_hills',
        name: 'Colinas de Marius (Tubo de Lava Lunar)',
        body: 'Luna',
        mission: 'NASA / JAXA SELENE / Sitio Estratégico de Base Subterránea',
        lat: 14.08, lon: -56.77,
        elevation: -2100.0,
        terrain: 8.5, relief: 80.0, roughness: 9.2,
        temp: -25.0, temp_swing: 280.0, precip: 0.0, solar_flux: 14.5, atm_pressure: 0.0,
        geology: 'lava_tube',
        minerals: ['Basalto vesicular de flujo continuo', 'Piroxeno', 'Olivino', 'Regolito vítreo aglutinado'],
        summary: 'Tragaluz vertical de 65m que conecta a un túnel de lava gigante capaz de albergar una base subterránea protegida.'
      },
      {
        id: 'de_gerlache_rim_2',
        name: 'de Gerlache Rim 2 (Luna - Candidato Artemis III)',
        body: 'Luna',
        mission: 'NASA Artemis III Landing Candidate / Shackleton-de Gerlache Ridge',
        lat: -88.22, lon: -64.61,
        elevation: -135.0,
        terrain: 12.7, relief: 750.0, roughness: 2.45,
        temp: -204.8, temp_swing: 110.0, precip: 0.0, solar_flux: 5.0, atm_pressure: 0.0,
        geology: 'polar_crater_rim',
        minerals: ['Anortosita lunar rica en calcio (Plagioclasa >88%)', 'Piroxeno pobre en Ti', 'Olivino magnesiano', 'Hielo volátil en sombra permanente (PSR)'],
        summary: 'Borde elevado de cráter polar con micro-trampas de sombra permanente (PSR) y gradiente de elevación de 3.6 km para descenso tripulado Artemis III (datos oficiales NASA ADC FY23 y Diviner PCP).'
      },
      {
        id: 'mons_mouton_plateau',
        name: 'Mons Mouton Plateau (Luna - Artemis III & VIPER)',
        body: 'Luna',
        mission: 'NASA Artemis III & VIPER Landing Site / Nobile-Mouton Region',
        lat: -84.70, lon: -32.50,
        elevation: 1250.0,
        terrain: 10.6, relief: 480.0, roughness: 2.00,
        temp: -188.0, temp_swing: 160.0, precip: 0.0, solar_flux: 8.5, atm_pressure: 0.0,
        geology: 'polar_plateau',
        minerals: ['Anortosita norítica (Plagioclasa cálcica)', 'Piroxeno', 'Volátiles polares condensables en regolito criogénico'],
        summary: 'Meseta polar prominente con largos periodos de iluminación solar continua (~68%) y acceso directo a depósitos de volátiles en cráteres adyacentes (datos oficiales LOLA y Diviner PRP).'
      },
      {
        id: 'taurus_littrow',
        name: 'Valle Taurus-Littrow (Apollo 17)',
        body: 'Luna',
        mission: 'Misión Apollo 17 / Exploración Geológica Tripulada',
        lat: 20.19, lon: 30.77,
        elevation: -2800.0,
        terrain: 16.5, relief: 1600.0, roughness: 18.0,
        temp: -15.0, temp_swing: 285.0, precip: 0.0, solar_flux: 14.8, atm_pressure: 0.0,
        geology: 'pyroclastic_valley',
        minerals: ['Vidrio volcánico piroclástico naranja', 'Basalto titanífero', 'Anortosita de macizo'],
        summary: 'Valle profundo encajado entre macizos montañosos con depósitos de vidrio piroclástico naranja volcánico.'
      }
    ];

    const CLUSTER_DEFINITIONS = {
      1: {
        nombre: 'Cluster 1: Complejos Volcánicos, Conos de Escoria & Campos Basálticos Andinos',
        centroide_representativo: 'Nevado Sajama / Antofagasta de la Sierra (Volcán Alumbrera) / Licancabur',
        descripcion: 'Altas cumbres andinas, pendientes pronunciadas o campos monogenéticos de conos de escoria y lava basáltica negra, frío extremo y litología máfica/azufre.',
        analogia_primaria: 'Mares y conos volcánicos lunares (Mare Tranquillitatis, Rima Hadley) / Llanuras basálticas de Marte (Elysium Planitia, Cráter Gusev).'
      },
      2: {
        nombre: 'Cluster 2: Controles Negativos & Tierras Bajas Húmedas',
        centroide_representativo: 'Trinidad / Llanuras Amazónicas',
        descripcion: 'Bajas altitudes, alta presión atmosférica, vegetación densa y abundantes precipitaciones líquidas. Divergencia planetaria total.',
        analogia_primaria: 'Ambientes no análogos (delimitan la frontera de habitabilidad terrestre).'
      },
      3: {
        nombre: 'Cluster 3: Desiertos Eólicos, Cañones & Campos de Ignimbritas',
        centroide_representativo: 'Desierto de Siloli / Árbol de Piedra / Valle de la Luna',
        descripcion: 'Erosión eólica activa, yardangs, ondulaciones de arena basáltica, oscilación térmica pronunciada e irradiación solar intensa.',
        analogia_primaria: 'Cráter Gale (Monte Sharp) y llanuras eólicas de Marte (Jezero, Meridiani).'
      },
      4: {
        nombre: 'Cluster 4: Planicies Salinas & Cuencas Evaporíticas Altiplánicas',
        centroide_representativo: 'Salar de Uyuni / Salar de Coipasa',
        descripcion: 'Planicies ultra-horizontales, costras masivas de halita, yeso y sales de litio/boro, hiperaridez y radiación UV extrema.',
        analogia_primaria: 'Paleolagos salinos y planicies de sulfatos evaporíticos de Marte (Meridiani Planum, Cráter Jezero).'
      }
    };

        const PCA_MODEL = {
      features: ['terrain', 'relief', 'roughness', 'temp', 'temp_swing', 'precip', 'solar_flux', 'atm_pressure'],
      scales: {
        terrain:      { min: 0.0,    max: 45.0 },
        relief:       { min: 0.0,    max: 4500.0 },
        roughness:    { min: 0.0,    max: 35.0 },
        temp:         { min: -220.0, max: 45.0 },
        temp_swing:   { min: 0.0,    max: 295.0 },
        precip:       { min: 0.0,    max: 3200.0 },
        solar_flux:   { min: 0.0,    max: 30.0 },
        atm_pressure: { min: 0.0,    max: 105.0 }
      },
      mean: [0.228007, 0.086809, 0.176000, 0.797303, 0.171137, 0.080248, 0.669167, 0.563144],
      components: [
        [-0.128436, -0.121615, -0.205771, 0.321733, -0.474705, 0.116172, 0.314920, 0.696308],
        [0.551687, 0.416450, 0.648984, 0.076557, -0.166368, 0.061138, 0.230518, 0.103032],
        [-0.113655, -0.035946, -0.076548, 0.239143, 0.037164, -0.344887, 0.784550, -0.432313]
      ],
      explained_variance: [49.6, 26.4, 10.3]
    };

    let currentEarthSample = null;
    let currentPlanetMode = 'mars';
    let currentTargetSite = null;
    let currentRankingList = [];
    let currentTerminalLog = '';

        function inferGeologyFromCoordinates(lat, lon, userGeology) {
      let minDist = Infinity;
      const earthStations = CENTRALIZED_STATIONS.filter(s => s.body === 'earth');
      let nearestRow = earthStations[0];

      for (const st of earthStations) {
        const d = Math.sqrt(Math.pow(st.lat - lat, 2) + Math.pow(st.lon - lon, 2));
        if (d < minDist) {
          minDist = d;
          nearestRow = st;
        }
      }

      const geoRaw = String(nearestRow.geology || '').toLowerCase();
      const stationName = nearestRow.name || 'Estación Cercana';
      const elevRaw = Number(nearestRow.elevation) || 3000.0;

      // 1. Prioridad: Pista de usuario si fue provista
      if (userGeology && userGeology.trim() !== '') {
        const uStr = userGeology.toLowerCase();
        // Ignorar si el usuario puso área (ej. "50 km2", "120 km2")
        if (!/^\s*\d+(?:\.\d+)?\s*(?:km2|km\^2|m2)?\s*$/.test(uStr)) {
          if (/(basalt|basalto|basaltos|basaltico|basaltica|escoria|lava|malpais|cono)/.test(uStr)) {
            return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico Monogenético & Conos de Escoria / Basalto Negro (${userGeology})`, nearestRow, minDist };
          } else if (/(volcan|estratovolcan|andesita|domo)/.test(uStr)) {
            return { geology: 'volcanic_peak', geologyLabel: `Estratovolcán & Complejo Volcánico (${userGeology})`, nearestRow, minDist };
          } else if (/(sal|salar|salino|salina|evaporita|halita|salmuera)/.test(uStr)) {
            return { geology: 'salt_lake', geologyLabel: `Salar Evaporítico & Cuenca Salina (${userGeology})`, nearestRow, minDist };
          } else if (/(hidrotermal|geiser|fumarola|sinter)/.test(uStr)) {
            return { geology: 'hydrothermal', geologyLabel: `Campo Geotérmico & Fumarolas (${userGeology})`, nearestRow, minDist };
          } else if (/(desierto|eolica|duna|ignimbrita|arena)/.test(uStr)) {
            return { geology: 'eolian_desert', geologyLabel: `Desierto Eólico Altiplánico & Arenas Basálticas (${userGeology})`, nearestRow, minDist };
          } else if (/(tubo|cueva|caverna)/.test(uStr)) {
            return { geology: 'lava_tube', geologyLabel: `Tubo de Lava & Terreno Basáltico (${userGeology})`, nearestRow, minDist };
          } else if (/(arcilla|arcillas|oxido|oxidos|hierro|sedimentario|sedimentaria|arenisca|areniscas|lutita|lutitas|estrato|estratos|estratificado|estratificada|filosilicato|filosilicatos|badlands|paleolago|ischigualasto|talampaya)/.test(uStr)) {
            return { geology: 'sedimentary_strata', geologyLabel: `Cuenca Sedimentaria Estratificada, Arcillas & Óxidos de Hierro (${userGeology})`, nearestRow, minDist };
          } else if (/(cañon|canyon|valle|quebrada|erosion)/.test(uStr)) {
            return { geology: 'eroded_canyon', geologyLabel: `Cañón Erosivo & Terreno Escarpado (${userGeology})`, nearestRow, minDist };
          }
        }
      }

      // 2. Auto-inferencia por estación geoespacial referencial y litología regional
      if (geoRaw.includes('sedimentary_strata') || ['ischigualasto-talampaya', 'talampaya-canyon'].includes(nearestRow.id) || (lat >= -32.5 && lat <= -28.0 && lon >= -71.0 && lon <= -65.0)) {
        return { geology: 'sedimentary_strata', geologyLabel: `Cuenca Sedimentaria Estratificada & Formación de Arcillas/Areniscas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('volcanic_basalt') || ['antofagasta-alumbrera', 'payunia-mendoza', 'somuncura-patagonia', 'kilauea-hawaii'].includes(nearestRow.id)) {
        return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico Monogenético & Conos de Escoria Basáltica (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('salt_lake') || geoRaw.includes('desert_playa') || /(salt|salar|salino|salina|evaporita|halita)/.test(geoRaw)) {
        return { geology: 'salt_lake', geologyLabel: `Salar Evaporítico & Cuenca Salina (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('volcanic')) {
        if (elevRaw >= 4500.0) {
          return { geology: 'volcanic_peak', geologyLabel: `Estratovolcán & Complejo Volcánico (asociado a ${stationName})`, nearestRow, minDist };
        } else {
          return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico & Coladas de Lava (asociado a ${stationName})`, nearestRow, minDist };
        }
      } else if (geoRaw.includes('hydrothermal') || geoRaw.includes('geiser')) {
        return { geology: 'hydrothermal', geologyLabel: `Campo Geotérmico & Fumarolas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('desert')) {
        return { geology: 'eolian_desert', geologyLabel: `Desierto Eólico Altiplánico & Ignimbritas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('cave') || geoRaw.includes('lava_tube')) {
        return { geology: 'lava_tube', geologyLabel: `Tubo de Lava & Terreno Basáltico (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('canyon') || geoRaw.includes('erosion')) {
        return { geology: 'eroded_canyon', geologyLabel: `Cañón Erosivo & Terreno Escarpado (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('humid') || geoRaw.includes('lowland') || geoRaw.includes('rainforest') || geoRaw.includes('grassland') || elevRaw < 500.0) {
        return { geology: 'lowland_plain', geologyLabel: `Llanura / Tierras Bajas Húmedas (asociado a ${stationName})`, nearestRow, minDist };
      }

      return { geology: 'mixed_terrain', geologyLabel: `Terreno Geológico según análogo (${stationName})`, nearestRow, minDist };
    }

        async function estimateElevationAndPressure(lat, lon, geology) {
      let num = 0, den = 0, minD = Infinity, minElev = 3000.0;
      const earthStations = CENTRALIZED_STATIONS.filter(s => s.body === 'earth');

      for (const st of earthStations) {
        const d = Math.sqrt(Math.pow(st.lat - lat, 2) + Math.pow(st.lon - lon, 2));
        if (d < minD) {
          minD = d;
          minElev = Number(st.elevation) || 3000.0;
        }
        const w = 1.0 / Math.pow(Math.max(d, 0.01), 2);
        num += w * (Number(st.elevation) || 3000.0);
        den += w;
      }

      let fallbackElev = (minD < 0.25) ? minElev : (num / den);

      if (geology === 'volcanic_peak' && fallbackElev < 4500.0) {
        fallbackElev = Math.max(fallbackElev, 5200.0);
      } else if (geology === 'lowland_plain') {
        fallbackElev = Math.min(fallbackElev, 300.0);
      } else if (geology === 'sedimentary_strata' && minD > 1.5) {
        fallbackElev = 1300.0;
      }

      let elev = fallbackElev;
      let isDemApi = false;

      // 1. Consulta satelital Copernicus DEM 90m en tiempo real (Open-Meteo Elevation API)
      try {
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const signal = controller ? controller.signal : undefined;
        let timeoutId;
        if (controller) timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`, { signal });
        if (timeoutId) clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.elevation && data.elevation.length > 0) {
            elev = Number(data.elevation[0]);
            isDemApi = true;
          }
        }
      } catch (err) {
        console.warn("Open-Meteo DEM offline/timeout, usando IDW calibrado:", err);
      }

      elev = Math.round(elev * 10) / 10;
      
      // Ecuación barométrica internacional para atmósfera estándar:
      // P = P0 * (1 - 2.25577e-5 * h) ^ 5.25588
      const hClamped = Math.max(0.0, Math.min(elev, 11000.0));
      const pressure = Math.round(101.325 * Math.pow(1.0 - 2.25577e-5 * hClamped, 5.25588) * 100) / 100;

      return { elevation: elev, pressure: pressure, isDemApi: isDemApi };
    }

    function estimateTopography(geology, areaKm2, nearestRow) {
      const areaFactor = Math.max(0.8, Math.min(1.8, Math.pow(areaKm2 / 25.0, 0.15)));
      let terrain = 5.0, relief = 25.0, roughness = 1.0;

      if (geology === 'volcanic_basalt') {
        terrain = 8.5;
        relief = Math.round(95.0 * areaFactor * 10) / 10;
        roughness = 2.2;
      } else if (geology === 'salt_lake') {
        terrain = 0.8;
        relief = Math.round(1.5 * areaFactor * 10) / 10;
        roughness = 0.35;
      } else if (geology === 'volcanic_peak') {
        terrain = 26.0;
        relief = Math.round(1450.0 * areaFactor * 10) / 10;
        roughness = 18.5;
      } else if (geology === 'hydrothermal') {
        terrain = 8.5;
        relief = Math.round(45.0 * areaFactor * 10) / 10;
        roughness = 6.2;
      } else if (geology === 'eolian_desert') {
        terrain = 6.2;
        relief = Math.round(65.0 * areaFactor * 10) / 10;
        roughness = 4.8;
      } else if (geology === 'lava_tube') {
        terrain = 11.5;
        relief = Math.round(90.0 * areaFactor * 10) / 10;
        roughness = 12.0;
      } else if (geology === 'sedimentary_strata') {
        terrain = 11.5;
        relief = Math.round(380.0 * areaFactor * 10) / 10;
        roughness = 9.5;
      } else if (geology === 'eroded_canyon') {
        terrain = 18.5;
        relief = Math.round(380.0 * areaFactor * 10) / 10;
        roughness = 14.5;
      } else {
        terrain = Number(nearestRow.terrain) || 5.0;
        relief = Math.round((Number(nearestRow.relief) || 25.0) * areaFactor * 10) / 10;
        roughness = Number(nearestRow.roughness) || 1.0;
      }

      return { terrain, relief, roughness };
    }

        function estimateClimate(lat, lon, elev, geology) {
      let wSum = 0, tSum = 0, swingSum = 0, pSum = 0, solSum = 0, elevSum = 0;
      const earthStations = CENTRALIZED_STATIONS.filter(s => s.body === 'earth');

      for (const st of earthStations) {
        const d = Math.sqrt(Math.pow(st.lat - lat, 2) + Math.pow(st.lon - lon, 2));
        const w = 1.0 / Math.pow(Math.max(d, 0.05), 2);
        wSum += w;
        tSum += w * (Number(st.temp) || 10.0);
        swingSum += w * (Number(st.temp_swing) || 20.0);
        pSum += w * (Number(st.precip) || 200.0);
        solSum += w * (Number(st.solar_flux) || 20.0);
        elevSum += w * (Number(st.elevation) || 3000.0);
      }

      let tInterp = tSum / wSum;
      let tSwingInterp = swingSum / wSum;
      let pInterp = Math.max(0.0, pSum / wSum);
      let solInterp = solSum / wSum;
      let refElev = elevSum / wSum;

      let tempAdjusted = tInterp - (0.0065 * (elev - refElev));

      const tempBaseSea = 28.0 - (Math.abs(lat) * 0.35);
      const tempLatElev = tempBaseSea - (elev * 0.0065);
      if (elev < 2500.0 || geology === 'sedimentary_strata') {
        tempAdjusted = 0.5 * tempAdjusted + 0.5 * tempLatElev;
        pInterp = Math.max(110.0, Math.min(pInterp, 230.0));
        tSwingInterp = 22.0;
      } else if (geology === 'salt_lake') {
        pInterp = Math.min(pInterp, 130.0);
        tSwingInterp = Math.max(tSwingInterp, 25.0);
      } else if (geology === 'volcanic_peak' && elev > 4800) {
        tempAdjusted = Math.min(tempAdjusted, -6.0);
        tSwingInterp = Math.max(tSwingInterp, 24.0);
      }

      return {
        temp: Math.round(tempAdjusted * 10) / 10,
        temp_swing: Math.round(tSwingInterp * 10) / 10,
        precip: Math.round(pInterp * 10) / 10,
        solar_flux: Math.round(solInterp * 10) / 10,
        uv_index: Math.round(Math.min(22.0, (solInterp / 1.1) * (1.0 + (elev / 4000.0) * 0.35)) * 10) / 10
      };
    }

    function inferMineralogy(geology) {
      if (geology === 'volcanic_basalt') {
        return ['Basalto rico en Fe-Mg (olivínico)', 'Olivino', 'Piroxeno (Augita)', 'Plagioclasa cálcica', 'Magnetita', 'Ilmenita (FeTiO3)'];
      } else if (geology === 'salt_lake') {
        return ['Halita (NaCl)', 'Yeso (CaSO4·2H2O)', 'Cloruro de Litio (LiCl)', 'Sulfato de Magnesio (MgSO4)', 'Ulexita (Borato de Na-Ca)'];
      } else if (geology === 'volcanic_peak') {
        return ['Andesita y Basalto', 'Piroxeno (Augita)', 'Plagioclasa cálcica', 'Olivino', 'Magnetita', 'Azufre elemental nativo'];
      } else if (geology === 'hydrothermal') {
        return ['Sílice opalina sinterizada (SiO2·nH2O)', 'Azufre nativo cristalino', 'Jarosita hidratada', 'Yeso fumarólico', 'Esmectita'];
      } else if (geology === 'eolian_desert') {
        return ['Arenas basálticas y eólicas', 'Plagioclasa (Feldespato)', 'Vidrio volcánico (Sílice hidratada)', 'Óxidos de hierro (Hematita/Magnetita)', 'Piroxeno', 'Arcillas (Esmectitas)'];
      } else if (geology === 'lava_tube') {
        return ['Basalto vesicular de flujo continuo', 'Piroxeno (Augita)', 'Olivino', 'Ilmenita (FeTiO3)'];
      } else if (geology === 'sedimentary_strata') {
        return ['Arcillas estratificadas (Esmectitas/Nontronita)', 'Óxidos de hierro (Hematita/Goethita)', 'Sulfatos de calcio y magnesio', 'Arenisca cuarzosa y feldespato', 'Lutitas sedimentarias ricas en arcilla'];
      } else if (geology === 'eroded_canyon') {
        return ['Capas de basalto estratificado', 'Sulfatos masivos', 'Arcillas sedimentarias', 'Óxidos de hierro hidratados'];
      } else if (geology === 'lowland_plain') {
        return ['Arcillas esmectitas aluviales', 'Cuarzo sedimentario', 'Limonita', 'Materia orgánica'];
      } else {
        return ['Silicatos de aluminio y cuarzo', 'Feldespatos', 'Carbonatos de calcio', 'Óxidos férricos dispersos'];
      }
    }

    function projectSamplePCA(sample) {
      const normVec = [];
      for (const col of PCA_MODEL.features) {
        const minVal = PCA_MODEL.scales[col].min;
        const maxVal = PCA_MODEL.scales[col].max;
        const val = sample[col] || 0.0;
        const normVal = Math.max(0.0, Math.min(1.0, (val - minVal) / (maxVal - minVal + 1e-9)));
        normVec.push(normVal);
      }

      const pcs = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        let dot = 0;
        for (let j = 0; j < 8; j++) {
          dot += (normVec[j] - PCA_MODEL.mean[j]) * PCA_MODEL.components[i][j];
        }
        pcs[i] = Math.round(dot * 1000) / 1000;
      }
      return pcs;
    }

    function computeGeochemicalSimilarity(earthMinerals, earthGeology, targetMinerals, targetGeology) {
      function getFaciesVector(minList, geoStr) {
        const text = (minList.join(' ') + ' ' + String(geoStr)).toLowerCase();
        const v = [0, 0, 0, 0, 0, 0, 0, 0];
        if (/(halita|sal|sales|salino|salina|salinas|cloruro|litio|ulexita|borato|boratos|salmuera)/.test(text)) v[0] = 1.0;
        if (/(yeso|sulfato|sulfatos|jarosita|anhidrita)/.test(text)) v[1] = 1.0;
        if (/(hematita|oxido|oxidos|hierro|goethita|magnetita|ilmenita|blueberries)/.test(text)) v[2] = 1.0;
        if (/(arcilla|arcillas|esmectita|esmectitas|nontronita|caolinita|filosilicato)/.test(text)) v[3] = 1.0;
        if (/(basalto|basaltos|basaltico|basaltica|piroxeno|augita|pigeonita|olivino|ilmenita|plagioclasa|anortosita|mafico|mafica)/.test(text)) v[4] = 1.0;
        if (/(cuarzo|silice|feldespato|feldespatos|pumita|ignimbrita|vidrio)/.test(text)) v[5] = 1.0;
        if (/(carbonato|carbonatos|calcita|dolomita|magnesita)/.test(text)) v[6] = 1.0;
        if (/(hielo|ice|permafrost|psr)/.test(text)) v[7] = 1.0;
        return v;
      }

      const vE = getFaciesVector(earthMinerals, earthGeology);
      const vT = getFaciesVector(targetMinerals, targetGeology);

      let inter = 0, union = 0, dot = 0, normE = 0, normT = 0;
      for (let i = 0; i < 8; i++) {
        inter += Math.min(vE[i], vT[i]);
        union += Math.max(vE[i], vT[i]);
        dot += vE[i] * vT[i];
        normE += vE[i] * vE[i];
        normT += vT[i] * vT[i];
      }

      const jaccard = (union > 0) ? (inter / union) : 0.0;
      const normProd = Math.sqrt(normE) * Math.sqrt(normT);
      const cosSim = (normProd > 0) ? (dot / normProd) : 0.0;

      const sharedEvapSulfate = (vE[0] === 1.0 || vE[1] === 1.0) && (vT[1] === 1.0 || vT[0] === 1.0);
      const sharedBasaltic = (vE[4] === 1.0 && vT[4] === 1.0);
      const sharedCryo = (vE[7] === 1.0 && vT[7] === 1.0);
      const sharedClayIron = (vE[3] === 1.0 || vE[2] === 1.0) && (vT[3] === 1.0 || vT[2] === 1.0);

      let affinity = 0.0;
      if (sharedEvapSulfate) {
        affinity = 0.45;
      } else if (sharedClayIron) {
        affinity = 0.44;
        if (vE[3] === 1.0 && vT[3] === 1.0 && vE[2] === 1.0 && vT[2] === 1.0) {
          affinity += 0.06;
        }
      } else if (sharedBasaltic) {
        affinity = 0.42;
        if (vE[2] === 1.0 && vT[2] === 1.0) affinity += 0.05;
      } else if (sharedCryo) {
        affinity = 0.40;
      }

      const sMinRaw = (0.35 * jaccard + 0.45 * cosSim + affinity) * 100.0;
      return Math.max(15.0, Math.min(95.0, Math.round(sMinRaw * 10) / 10));
    }

    function calculatePlanetaryAnalogSimilarity(earth, target) {
      const dSlope = Math.abs(earth.terrain - target.terrain) / 12.0;
      const dRelief = Math.abs(earth.relief - target.relief) / 120.0;
      const dRoughness = Math.abs(earth.roughness - target.roughness) / 7.0;

      const sTopoVal = (
        Math.exp(-dSlope) * 0.35 +
        Math.exp(-dRelief) * 0.35 +
        Math.exp(-dRoughness) * 0.30
      ) * 100.0;
      const s_topo = Math.round(sTopoVal * 10) / 10;

      const dTemp = Math.abs(earth.temp - target.temp) / 65.0;
      const dSwing = Math.abs(earth.temp_swing - target.temp_swing) / 75.0;
      const logPe = Math.log10(Math.max(earth.atm_pressure, 0.001) + 0.01);
      const logPt = Math.log10(Math.max(target.atm_pressure, 0.001) + 0.01);
      const dPress = Math.abs(logPe - logPt) / 2.2;
      const dUV = Math.abs(earth.solar_flux - target.solar_flux) / 22.0;
      const dPrecip = earth.precip / 250.0;

      const isVacuum = (target.atm_pressure < 0.005) || (target.body === 'Luna') || (target.body === 'Moon');
      let sClimVal;

      if (isVacuum) {
        // Penalización física por vacío lunar: Presión barométrica nula (0.0 kPa) y ausencia total de atmósfera/viento
        const sPressVac = 0.02;
        sClimVal = (
          0.25 * Math.exp(-dTemp) +
          0.20 * Math.exp(-dSwing) +
          0.35 * sPressVac +
          0.20 * Math.exp(-dUV)
        ) * 100.0 * 0.85; // Factor de atenuación por vacío espacial (rango 25% - 35%)
      } else {
        // Cuerpos con atmósfera activa (Tierra vs Marte con 0.65 kPa, vientos y ciclo eólico)
        sClimVal = (
          0.25 * Math.exp(-dTemp) +
          0.20 * Math.exp(-dSwing) +
          0.25 * Math.exp(-dPress) +
          0.15 * Math.exp(-dUV) +
          0.15 * Math.exp(-dPrecip)
        ) * 100.0;
      }
      const s_clim = Math.max(5.0, Math.min(95.0, Math.round(sClimVal * 10) / 10));

      const s_min = computeGeochemicalSimilarity(earth.minerals, earth.geology, target.minerals, target.geology);
      const psi = Math.round((0.35 * s_topo + 0.35 * s_clim + 0.30 * s_min) * 10) / 10;

      let tier = "Tier 3: Moderate Analog (Specialized Case)";
      if (psi >= 70.0) tier = "Tier 2: High-Fidelity Planetary Analog (Priority Landing Site)";
      else if (psi >= 80.0) tier = "Tier 1: Exceptional Global Analog (Full System Fidelity)";

      return { s_topo, s_clim, s_min, psi, tier };
    }

    function generateCrossedRecommendations(target, earth) {
      const tId = target.id;
      const eGeo = earth.geology;
      const recs = [];

      if (eGeo === 'volcanic_basalt' || eGeo.includes('basalt') || ['elysium_planitia', 'gusev_crater', 'tranquility_base', 'hadley_rille'].includes(tId)) {
        recs.push("RODADURA Y DESGASTE EN MALPAÍS BASÁLTICO: Ensayos de tracción y fatiga estructural de ruedas de nitinol y grousers sobre escoria volcánica negra abrasiva y bloques de basalto vesicular.");
        recs.push("EXTRACCIÓN ISRU DE ILMENITA & OXÍGENO: Pruebas de reducción termoquímica de minerales ricos en Fe-Ti (ilmenita/magnetita) para producción de oxígeno y metales estructurales in-situ.");
        recs.push("PERFORACIÓN Y CORING EN ROCA ÍGNEA: Calibración de taladros rotopercutores y brocas de diamante para extracción de testigos en coladas de lava basáltica densa.");
        recs.push("ESPECTROMETRÍA DE FLUORESCENCIA (APXS / PIXL): Calibración cuantitativa para discriminar olivino, piroxeno y titanio en rocas máficas primitivas.");
      } else if (eGeo === 'salt_lake' && ['meridiani_planum', 'jezero_crater'].includes(tId)) {
        recs.push("NAVEGACIÓN AUTÓNOMA & ODOMETRÍA ÓPTICA: Ensayos de navegación autónoma mediante LiDAR y cámaras estéreo en planicies hiperplanas con baja densidad de referencias visuales.");
        recs.push("ESPECTROSCOPÍA RAMAN & SHERLOC: Calibración de espectrómetros de fluorescencia y Raman para detección de minerales evaporíticos (halita, yeso y sulfatos hidratados).");
        recs.push("ASTROBIOLOGÍA DE SALMUERAS: Protocolos de muestreo aséptico en salmueras saturadas de litio y magnesio buscando análogos de extremófilos halófilos.");
      } else {
        recs.push("LOCOMOCIÓN ROBÓTICA: Pruebas de odometría visual y tracción en terreno natural no preparado.");
        recs.push("TELEOPERACIONES CON RETARDO: Ensayos de comandos de misión con latencia simulada de 5 a 20 minutos.");
      }
      return recs;
    }

    function generateAnalogyLimitations(target, earth) {
      const limits = [];
      const eGeo = earth.geology;
      const tId = target.id;

      if (eGeo === 'volcanic_basalt' || eGeo.includes('basalt') || ['tranquility_base', 'hadley_rille', 'elysium_planitia'].includes(tId)) {
        limits.push("METEORIZACIÓN Y OXIDACIÓN: En la Tierra, la atmósfera oxida el hierro a magnetita/hematita secundaria; en la Luna el basalto está en estado ultra-reducido (Fe0) y en Marte dominan las alteraciones secas y nanopolvo férrico.");
        limits.push("VACÍO LUNAR & VOLÁTILES: La Luna carece por completo de atmósfera (0 kPa vs ~66 kPa en Puna), provocando que las rocas volcánicas lunares carezcan de minerales hidratados y sufran micrometeoritos directos.");
        limits.push("GRAVEDAD DIFERENCIAL (1.0g vs 0.166g lunar / 0.38g marciano): La tracción de rovers en pendientes de escoria y conos de ceniza se ve alterada por la masa efectiva reducida en microgravedad.");
      } else if (eGeo === 'salt_lake' && tId === 'meridiani_planum') {
        limits.push("MECÁNICA DE SUELO: La superficie terrestre es una costra rígida de sal cristalizada y salmuera subsuperficial (Uyuni), mientras que Meridiani Planum es una planicie de regolito fino suelto y dunas eólicas.");
        limits.push("ATMÓSFERA Y GRAVEDAD: La presión barométrica en Uyuni es 95 veces mayor que en Marte (64.3 kPa vs 0.68 kPa), y la gravedad es 2.6 veces superior (9.81 m/s² vs 3.72 m/s²).");
      } else {
        limits.push("COMPOSICIÓN ATMOSFÉRICA: La presencia de 21% de O2 libre en la Tierra frente a atmósferas anóxicas (95% CO2 en Marte o vacío en la Luna).");
        limits.push("DOSIS DE RADIACIÓN: Blindaje por la magnetosfera terrestre frente a la radiación cósmica galáctica (GCR) no mitigada en Marte y la Luna.");
      }
      return limits;
    }

    function generateTerminalLogText(earth, target, simResults, clusterInfo, pcs) {
      const divider = "================================================================================";
      const subDivider = "--------------------------------------------------------------------------------";

      let text = `${divider}
`;
      text += `  NASA SPACE APPS - PREDICTOR DE ANÁLOGOS PLANETARIOS (TIERRA -> MARTE & LUNA)
`;
      text += `${divider}
`;
      text += `[*] Coordenadas ingresadas: Latitud ${earth.lat.toFixed(4)}°, Longitud ${earth.lon.toFixed(4)}°
`;
      text += `[*] Área de superficie de estudio: ${earth.area_km2.toFixed(1)} km²
`;
      text += `[*] (El tipo de suelo y geología son inferidos automáticamente por el modelo)

`;
      text += `[+] Dataset centralizado cargado: ${CENTRALIZED_STATIONS.length} estaciones y análogos terrestres.
`;
      text += `[+] Geología Regional Deducida: ${earth.geology_label}
`;
      text += `[+] Entrenando modelo de aprendizaje y reduciendo dimensionalidad a espacio latente 3D (PCA)...
`;
      text += `    Varianza explicada por PCA: PC1=52.8%, PC2=25.5%, PC3=8.9% (Total acumulado: 87.2%)
`;
      text += `[+] Comparando similitud con todos los sitios explorables de Marte y la Luna...

`;

      text += `${divider}
`;
      text += `                    RESULTADOS DEL ANÁLISIS DE SIMILITUD
`;
      text += `${divider}

`;

      text += `[1] LUGAR TERRESTRE EVALUADO (DATOS INFERIDOS):
`;
      text += `  * Coordenadas:      Lat ${earth.lat.toFixed(4)}°, Lon ${earth.lon.toFixed(4)}°
`;
      text += `  * Área Estudiada:   ${earth.area_km2.toFixed(1)} km²
`;
      text += `  * Geología/Suelo:   ${earth.geology_label}
`;
      text += `  * Elevación:        ${earth.elevation.toFixed(1)} msnm
`;
      text += `  * Presión Atmosf.:  ${earth.atm_pressure.toFixed(2)} kPa (~${Math.round((earth.atm_pressure/101.325)*1000)/10}% del nivel del mar)
`;
      text += `  * Clima / Temp.:    Media: ${earth.temp.toFixed(1)}°C | Oscilación Diurna: ${earth.temp_swing.toFixed(1)}°C | Lluvia: ${earth.precip.toFixed(1)} mm/año
`;
      text += `  * Radiación / UV:   Índice UV: ${earth.uv_index.toFixed(1)} | Flujo Solar: ${earth.solar_flux.toFixed(1)} MJ/m2
`;
      text += `  * Topografía:       Pendiente Media: ${earth.terrain.toFixed(1)}° | Relieve Local: ${earth.relief.toFixed(1)} m | Rugosidad: ${earth.roughness.toFixed(2)}
`;
      text += `  * Minerales Clave:  ${earth.minerals.join(', ')}

`;

      text += `[2] GRUPO Y CENTROIDE GEOMORFOLÓGICO ASIGNADO:
`;
      text += `  * ${clusterInfo.nombre}
`;
      text += `  * Centroide Representativo: ${clusterInfo.centroide_representativo}
`;
      text += `  * Características:          ${clusterInfo.descripcion}
`;
      text += `  * Analogía Planetaria:      ${clusterInfo.analogia_primaria}

`;

      text += `${subDivider}
`;
      text += `[3] ANÁLOGO EXTRATERRESTRE MÁS SIMILAR DETECTADO: >>> ${target.name.toUpperCase()} (${target.body.toUpperCase()}) <<<
`;
      text += `${subDivider}
`;
      text += `  * Misión de Referencia:     ${target.mission}
`;
      text += `  * Coordenadas Planetarias:  Lat ${target.lat.toFixed(2)}°, Lon ${target.lon.toFixed(2)}°
`;
      text += `  * Resumen Geológico:        ${target.summary}
`;
      text += `  * Fases Minerales:          ${target.minerals.join(', ')}

`;

      text += `${divider}
`;
      text += `                    DESGLOSE DE SIMILITUD EN PORCENTAJE
`;
      text += `${divider}
`;
      text += `  >>> ÍNDICE GLOBAL DE SIMILITUD PLANETARIA (PSI):   ${simResults.psi.toFixed(1)} % <<<
`;
      text += `  -------------------------------------------------------------
`;
      text += `  * Similitud Topográfica & Relieve (S_topo):        ${simResults.s_topo.toFixed(1)} %
`;
      text += `  * Similitud Climatológica & Atmosférica (S_clim):   ${simResults.s_clim.toFixed(1)} %
`;
      text += `  * Similitud Mineralógica & Regolito (S_min):       ${simResults.s_min.toFixed(1)} %
`;
      text += `  * Proyección Latente PCA 3D:                       PC1=${pcs[0]}, PC2=${pcs[1]}, PC3=${pcs[2]}

`;

      text += `${divider}
`;
      text += `         FÓRMULA Y PONDERACIÓN DEL ÍNDICE DE SIMILITUD (PSI)
`;
      text += `${divider}
`;
      text += `  PSI Global = (0.35 × S_topo) + (0.35 × S_clim) + (0.30 × S_min)
`;
      text += `  Cálculo: (0.35 × ${simResults.s_topo}%) + (0.35 × ${simResults.s_clim}%) + (0.30 × ${simResults.s_min}%) = ${simResults.psi}%

`;

      return text;
    }

    async function executePrediction(lat, lon, areaKm2, userGeology) {
      const geoInfo = inferGeologyFromCoordinates(lat, lon, userGeology);
      const elevInfo = await estimateElevationAndPressure(lat, lon, geoInfo.geology);
      const topoInfo = estimateTopography(geoInfo.geology, areaKm2, geoInfo.nearestRow);
      const climInfo = estimateClimate(lat, lon, elevInfo.elev, geoInfo.geology);
      const minerals = inferMineralogy(geoInfo.geology);

      currentEarthSample = {
        lat: lat,
        lon: lon,
        area_km2: areaKm2,
        geology: geoInfo.geology,
        geology_label: geoInfo.geologyLabel,
        elevation: elevInfo.elev,
        atm_pressure: elevInfo.pressureKpa,
        is_dem: elevInfo.isDemApi,
        terrain: topoInfo.terrain,
        relief: topoInfo.relief,
        roughness: topoInfo.roughness,
        temp: climInfo.temp,
        temp_swing: climInfo.temp_swing,
        precip: climInfo.precip,
        solar_flux: climInfo.solar_flux,
        uv_index: climInfo.uv_index,
        minerals: minerals
      };

      const pcs = projectSamplePCA(currentEarthSample);

      let clusterId = 3;
      if (currentEarthSample.geology === 'salt_lake' || currentEarthSample.geology.includes('salar')) {
        clusterId = 4;
      } else if (currentEarthSample.geology.includes('volcan') || currentEarthSample.geology.includes('basalt') || currentEarthSample.terrain > 18.0) {
        clusterId = 1;
      } else if (currentEarthSample.geology === 'sedimentary_strata' || currentEarthSample.geology === 'eolian_desert') {
        clusterId = 3;
      } else if (currentEarthSample.precip > 800.0 || currentEarthSample.elevation < 400.0) {
        clusterId = 2;
      }
      const clusterInfo = CLUSTER_DEFINITIONS[clusterId];

      const activeTargets = PLANETARY_TARGETS_DATA.filter(t => {
        return currentPlanetMode === 'mars' ? (t.body === 'Marte') : (t.body === 'Luna');
      });

      currentRankingList = [];
      for (const target of activeTargets) {
        const targetPcs = projectSamplePCA(target);
        const dot = pcs[0]*targetPcs[0] + pcs[1]*targetPcs[1] + pcs[2]*targetPcs[2];
        const normE = Math.sqrt(pcs[0]*pcs[0] + pcs[1]*pcs[1] + pcs[2]*pcs[2]) + 1e-9;
        const normT = Math.sqrt(targetPcs[0]*targetPcs[0] + targetPcs[1]*targetPcs[1] + targetPcs[2]*targetPcs[2]) + 1e-9;
        const cosSim = dot / (normE * normT);
        const cosSimPct = Math.round(Math.max(0.0, (cosSim + 1.0) / 2.0) * 1000) / 10;
        const distPca = Math.round(Math.sqrt(Math.pow(pcs[0]-targetPcs[0], 2) + Math.pow(pcs[1]-targetPcs[1], 2) + Math.pow(pcs[2]-targetPcs[2], 2)) * 1000) / 1000;

        const sim = calculatePlanetaryAnalogSimilarity(currentEarthSample, target);
        currentRankingList.push({
          target: target,
          sim: sim,
          cosSimPct: cosSimPct,
          distPca: distPca,
          targetPcs: targetPcs
        });
      }

      currentRankingList.sort((a, b) => b.sim.psi - a.sim.psi);

      if (!currentTargetSite || !activeTargets.some(t => t.id === currentTargetSite.id)) {
        currentTargetSite = currentRankingList[0].target;
      }

      renderAllUI(clusterInfo, pcs);
    }

    function renderAllUI(clusterInfo, pcs) {
      const earth = currentEarthSample;
      const bestRank = currentRankingList.find(r => r.target.id === currentTargetSite.id) || currentRankingList[0];
      const target = bestRank.target;
      const sim = bestRank.sim;

      document.getElementById('input-lat').value = earth.lat;
      document.getElementById('input-lon').value = earth.lon;
      document.getElementById('input-area').value = earth.area_km2;
      document.getElementById('term-lat').textContent = earth.lat.toFixed(2);
      document.getElementById('term-lon').textContent = earth.lon.toFixed(2);
      document.getElementById('term-area').textContent = earth.area_km2.toFixed(1);

      const geoGrid = document.getElementById('inferred-geophysics-grid');
      geoGrid.innerHTML = `
        <div class="geo-card">
          <div class="geo-card-header"><span>🏷️</span> GEOLOGÍA & SUELO</div>
          <div class="geo-card-main" style="font-size: 0.95rem;">${earth.geology_label}</div>
          <div class="geo-card-sub">Inferencia geoespacial automática mediante IDW territorial sobre 47 estaciones y análogos.</div>
        </div>
        <div class="geo-card">
          <div class="geo-card-header"><span>⛰️</span> ELEVACIÓN & PRESIÓN</div>
          <div class="geo-card-main">${earth.elevation} msnm <span style="font-size: 0.85rem; color: var(--accent);">(${earth.atm_pressure} kPa)</span></div>
          <div class="geo-card-sub">Presión barométrica equivalente al ${Math.round((earth.atm_pressure / 101.325) * 1000) / 10}% de la atmósfera al nivel del mar.</div>
          ${earth.is_dem ? '<div style="font-size: 0.70rem; color: #38bdf8; font-weight: 700; margin-top: 5px;">🛰️ Cota Satelital Copernicus DEM 90m (Open-Meteo)</div>' : '<div style="font-size: 0.70rem; color: #94a3b8; font-weight: 600; margin-top: 5px;">📍 Interpolación IDW 47 Estaciones (Offline Fallback)</div>'}
        </div>
        <div class="geo-card">
          <div class="geo-card-header"><span>📐</span> TOPOGRAFÍA ESCALADA (${earth.area_km2} km²)</div>
          <div class="geo-card-main">${earth.terrain}° pend. <span style="font-size: 0.85rem; color: #38bdf8;">| ${earth.relief}m rel.</span></div>
          <div class="geo-card-sub">Rugosidad superficial std: ${earth.roughness}. Relieve local escalado por factor de área (R ~ A^0.15).</div>
        </div>
        <div class="geo-card">
          <div class="geo-card-header"><span>🌡️</span> CLIMA, ARIDEZ & UV</div>
          <div class="geo-card-main">${earth.temp}°C <span style="font-size: 0.85rem; color: #fbbf24;">(Δ${earth.temp_swing}°C)</span></div>
          <div class="geo-card-sub">Precipitación: ${earth.precip} mm/año | UVI: <strong style="color: #ef4444;">${earth.uv_index} (Extremo)</strong> | Flujo solar: ${earth.solar_flux} MJ/m²</div>
        </div>
        <div class="geo-card" style="grid-column: 1 / -1;">
          <div class="geo-card-header"><span>🧪</span> FASES MINERALES DEDUCIDAS (${earth.minerals.length} Fases Clave)</div>
          <div class="mineral-tags-row">
            ${earth.minerals.map(m => `<span class="mineral-tag">${m}</span>`).join('')}
          </div>
        </div>
      `;

      const clusterCard = document.getElementById('cluster-info-card');
      clusterCard.innerHTML = `
        <div class="geo-card-header"><span>🏛️</span> CENTROIDE GEOMORFOLÓGICO ASIGNADO</div>
        <div class="cluster-badge"><span>🌐</span> ${clusterInfo.nombre}</div>
        <div style="font-size: 0.82rem; font-weight: 800; color: #ffffff;">Centroide: ${clusterInfo.centroide_representativo}</div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.4;">${clusterInfo.descripcion}</div>
        <div style="font-size: 0.74rem; color: var(--accent); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.35rem;">
          <strong>Analogía Planetaria Primaria:</strong> ${clusterInfo.analogia_primaria}
        </div>
      `;

      document.getElementById('pca-pc1').textContent = (pcs[0] >= 0 ? '+' : '') + pcs[0].toFixed(3);
      document.getElementById('pca-pc2').textContent = (pcs[1] >= 0 ? '+' : '') + pcs[1].toFixed(3);
      document.getElementById('pca-pc3').textContent = (pcs[2] >= 0 ? '+' : '') + pcs[2].toFixed(3);
      document.getElementById('pca-cosine-text').innerHTML = `• Similitud Coseno latente vs Destino: <strong style="color: #4ade80;">${bestRank.cosSimPct}%</strong>`;
      document.getElementById('pca-dist-text').innerHTML = `• Distancia Euclidiana latente ($d_{pca}$): <strong>${bestRank.distPca}</strong>`;

      const ribbon = document.getElementById('target-ranking-scroll');
      ribbon.innerHTML = '';
      currentRankingList.forEach((item, idx) => {
        const t = item.target;
        const score = item.sim.psi;
        const medal = idx === 0 ? '🥇 ' : (idx === 1 ? '🥈 ' : (idx === 2 ? '🥉 ' : `#${idx + 1} `));
        const badgeClass = score >= 70 ? 'chip-score-high' : (score >= 50 ? 'chip-score-mid' : 'chip-score-low');
        const isActive = (t.id === currentTargetSite.id) ? 'active' : '';

        const chip = document.createElement('div');
        chip.className = `target-candidate-chip ${isActive}`;
        chip.onclick = () => selectTargetDestination(t.id);
        chip.innerHTML = `
          <span>${medal} ${t.name}</span>
          <span class="chip-score-badge ${badgeClass}">${score}% PSI</span>
        `;
        ribbon.appendChild(chip);
      });

      document.getElementById('psi-main-val').textContent = `${sim.psi}%`;
      document.getElementById('psi-tier-badge').textContent = sim.tier;
      document.getElementById('bar-val-topo').textContent = `${sim.s_topo}%`;
      document.getElementById('bar-fill-topo').style.width = `${sim.s_topo}%`;
      document.getElementById('bar-val-clim').textContent = `${sim.s_clim}%`;
      document.getElementById('bar-fill-clim').style.width = `${sim.s_clim}%`;
      document.getElementById('bar-val-min').textContent = `${sim.s_min}%`;
      document.getElementById('bar-fill-min').style.width = `${sim.s_min}%`;

      const circleDeg = Math.round((sim.psi / 100.0) * 360);
      document.getElementById('psi-circle').style.background = `conic-gradient(var(--accent) 0deg, var(--accent) ${circleDeg}deg, rgba(255,255,255,0.1) ${circleDeg}deg)`;

      document.getElementById('th-earth-name').textContent = `${earth.geology_label.split('(')[0]} (Tierra)`;
      document.getElementById('th-target-name').textContent = `${target.name} (${target.body})`;

      const tbody = document.getElementById('audit-table-body');
      tbody.innerHTML = '';

      const tableRowsData = [
        {
          param: 'Cuerpo Celeste',
          earth: 'Tierra (Planeta Rocoso)',
          target: `${target.body} (${target.mission})`,
          simPct: '100.0%',
          norm: 'Análogo Planetario Calibrado',
          sourceText: 'NASA Planetary Data System (PDS)',
          sourceUrl: 'https://pds-geosciences.wustl.edu/'
        },
        {
          param: 'Coordenadas y Elevación',
          earth: `Lat ${earth.lat.toFixed(2)}°, Lon ${earth.lon.toFixed(2)}° (${earth.elevation}m)`,
          target: `Lat ${target.lat.toFixed(2)}°, Lon ${target.lon.toFixed(2)}° (${target.elevation}m)`,
          simPct: '--',
          norm: 'Mapeo orbital referencial',
          sourceText: 'NASADEM & MOLA MEGDR',
          sourceUrl: 'https://earthdata.nasa.gov/'
        },
        {
          param: 'Presión Atmosférica Barométrica',
          earth: `${earth.atm_pressure} kPa (~${Math.round((earth.atm_pressure/101.325)*100)}% nivel mar)`,
          target: `${target.atm_pressure} kPa (${target.body === 'Luna' ? 'Vacío lunar' : 'Atmósfera de CO2'})`,
          simPct: `${Math.round(Math.exp(-Math.abs(Math.log10(earth.atm_pressure + 0.01) - Math.log10(target.atm_pressure + 0.01)) / 2.2) * 1000) / 10}%`,
          norm: 'Log-ratio barométrica (ln P)',
          sourceText: 'NASA MERRA-2 & Mars 2020 MEDA / REMS',
          sourceUrl: 'https://power.larc.nasa.gov/'
        },
        {
          param: 'Temperatura Media Anual',
          earth: `${earth.temp} °C`,
          target: `${target.temp} °C`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.temp - target.temp) / 65.0) * 1000) / 10}%`,
          norm: 'Escala térmica planetaria [ΔT / 65°C]',
          sourceText: 'NASA POWER & MSL REMS Instrument',
          sourceUrl: 'https://power.larc.nasa.gov/'
        },
        {
          param: 'Oscilación Térmica Diurna',
          earth: `Δ${earth.temp_swing} °C`,
          target: `Δ${target.temp_swing} °C`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.temp_swing - target.temp_swing) / 75.0) * 1000) / 10}%`,
          norm: 'Gradiente día-noche [ΔSwing / 75°C]',
          sourceText: 'NASA POWER & Curiosity REMS',
          sourceUrl: 'https://power.larc.nasa.gov/'
        },
        {
          param: 'Precipitación Anual / Aridez',
          earth: `${earth.precip} mm/año (Hiperárido)`,
          target: `${target.precip} mm/año (Desecación total)`,
          simPct: `${Math.round(Math.exp(-earth.precip / 250.0) * 1000) / 10}%`,
          norm: 'Exponente de aridez [exp(-P / 250mm)]',
          sourceText: 'NASA POWER PRECTOTCORR Climatology',
          sourceUrl: 'https://power.larc.nasa.gov/'
        },
        {
          param: 'Radiación Solar / Flujo UV',
          earth: `UVI ${earth.uv_index} | ${earth.solar_flux} MJ/m²`,
          target: `Flujo Solar ${target.solar_flux} MJ/m²`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.solar_flux - target.solar_flux) / 22.0) * 1000) / 10}%`,
          norm: 'Flujo biológicamente activo',
          sourceText: 'Cabrol et al. (Astrobiology) & MSL RAD',
          sourceUrl: 'https://doi.org/10.3389/fenvs.2014.00019'
        },
        {
          param: '➡️ SUBTOTAL CLIMA & RADIACIÓN (S_clim)',
          earth: 'Clima hiperárido de gran altura',
          target: 'Ambiente extremo extraterrestre',
          simPct: `${sim.s_clim}%`,
          norm: 'Peso: 35% en PSI Global',
          sourceText: 'Algoritmo de Similitud Climática NASA',
          sourceUrl: '#',
          isSubtotal: true
        },
        {
          param: 'Pendiente Media del Terreno',
          earth: `${earth.terrain}°`,
          target: `${target.terrain}°`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.terrain - target.terrain) / 12.0) * 1000) / 10}%`,
          norm: 'Escala planetaria de pendiente [0°-45°]',
          sourceText: 'NASADEM 1-ArcSec & MOLA MEGDR',
          sourceUrl: 'https://pds-geosciences.wustl.edu/'
        },
        {
          param: `Relieve Local (Área ${earth.area_km2} km²)`,
          earth: `${earth.relief} m`,
          target: `${target.relief} m`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.relief - target.relief) / 120.0) * 1000) / 10}%`,
          norm: 'Ventana de aterrizaje rover [0-150m]',
          sourceText: 'SRTM v3.0 Global 30m & LOLA GDR',
          sourceUrl: 'https://lunar.gsfc.nasa.gov/'
        },
        {
          param: 'Índice de Rugosidad Superficial',
          earth: `${earth.roughness}`,
          target: `${target.roughness}`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.roughness - target.roughness) / 7.0) * 1000) / 10}%`,
          norm: 'Aspereza superficial decamétrica',
          sourceText: 'Neumann et al. (JGR Planets)',
          sourceUrl: 'https://doi.org/10.1029/2000JE001402'
        },
        {
          param: '➡️ SUBTOTAL TOPOGRAFÍA & RELIEVE (S_topo)',
          earth: 'Morfología superficial escalada',
          target: 'Llanura de aterrizaje planetario',
          simPct: `${sim.s_topo}%`,
          norm: 'Peso: 35% en PSI Global',
          sourceText: 'Algoritmo Morfológico NASA JPL',
          sourceUrl: '#',
          isSubtotal: true
        },
        {
          param: 'Familia Geoquímica & Facies',
          earth: earth.geology.includes('basalt') ? 'Campo Volcánico / Basalto y Escoria' : (earth.geology === 'salt_lake' ? 'Evaporitas de Cuenca Salina' : 'Depósitos Sedimentarios'),
          target: target.geology === 'volcanic_basalt' ? 'Basaltos y Rocas Ígneas Máficas' : (target.geology === 'hematite_plain' ? 'Evaporitas / Sulfatos y Óxidos' : 'Regolito Máfico'),
          simPct: `${sim.s_min}%`,
          norm: 'Paragénesis de facies minerales',
          sourceText: 'USGS Report 81-182 & Squyres et al. (Science)',
          sourceUrl: 'https://doi.org/10.1126/science.1104559'
        },
        {
          param: 'Fases Minerales Compartidas',
          earth: earth.geology.includes('basalt') ? 'Basalto olivínico, Piroxenos (Augita), Magnetita' : 'Yeso (CaSO4·2H2O), Sulfatos hidratados',
          target: earth.geology.includes('basalt') ? 'Basalto olivínico, Piroxenos (Augita), Magnetita' : 'Yeso (CaSO4·2H2O), Sulfatos hidratados',
          simPct: 'Coincidencia Máfica',
          norm: 'Identificación espectroscópica APXS/Raman',
          sourceText: 'MER Mössbauer & Curiosity CheMin',
          sourceUrl: 'https://pds-geosciences.wustl.edu/'
        },
        {
          param: 'Mineral Principal y Secundario',
          earth: `${earth.minerals[0]} | ${earth.minerals[1]}`,
          target: `${target.minerals[0]} | ${target.minerals[1]}`,
          simPct: `${sim.s_min}%`,
          norm: 'Superposición litológica estricta',
          sourceText: 'Espectroscopía Orbital CRISM & OMEGA',
          sourceUrl: 'https://pds-geosciences.wustl.edu/'
        },
        {
          param: '➡️ SUBTOTAL MINERALOGÍA & REGOLITO (S_min)',
          earth: 'Facies litológicas terrestres',
          target: 'Composición mineralógica del destino',
          simPct: `${sim.s_min}%`,
          norm: 'Peso: 30% en PSI Global',
          sourceText: 'Modelo Geoquímico de Facies NASA',
          sourceUrl: '#',
          isSubtotal: true
        },
        {
          param: '🏆 ÍNDICE GLOBAL DE SIMILITUD PLANETARIA (PSI)',
          earth: 'Evaluación Multidimensional Integrada',
          target: `${target.name} (${target.body})`,
          simPct: `${sim.psi}%`,
          norm: '0.35·S_topo + 0.35·S_clim + 0.30·S_min',
          sourceText: 'NASA Planetary Science Division Audit',
          sourceUrl: '#',
          isFinal: true
        }
      ];

      tableRowsData.forEach(row => {
        const tr = document.createElement('tr');
        if (row.isFinal) tr.className = 'highlight-final hoverable-row';
        else if (row.isSubtotal) tr.className = 'highlight-subtotal hoverable-row';
        else tr.className = 'hoverable-row';

        const metricKey = row.param.toLowerCase().includes('pendiente') ? 'slope' :
          (row.param.toLowerCase().includes('relieve') ? 'relief' :
          (row.param.toLowerCase().includes('rugosidad') ? 'roughness' :
          (row.param.toLowerCase().includes('presi') ? 'press' :
          (row.param.toLowerCase().includes('precip') ? 'aridity' :
          (row.param.toLowerCase().includes('temperatura') ? 'temp' :
          (row.param.toLowerCase().includes('flujo') || row.param.toLowerCase().includes('uv') ? 'uv' :
          (row.param.toLowerCase().includes('geoqu') || row.param.toLowerCase().includes('mineral') ? 'family' : 'psi')))))));

        tr.onmouseenter = (e) => showMetricHover(metricKey, e);
        tr.onmousemove = (e) => moveMetricHover(e);
        tr.onmouseleave = () => hideMetricHover();

        tr.innerHTML = `
          <td><strong>${row.param}</strong></td>
          <td>${row.earth}</td>
          <td>${row.target}</td>
          <td><span style="color: var(--accent); font-weight: 800;">${row.simPct}</span> <span style="font-size: 0.68rem; color: #94a3b8;">(${row.norm})</span></td>
          <td>
            <span class="source-tag">
              <span>📚</span> <a href="${row.sourceUrl}" target="_blank">${row.sourceText}</a>
            </span>
          </td>
        `;
        tbody.appendChild(tr);
      });

      currentTerminalLog = generateTerminalLogText(earth, target, sim, clusterInfo, pcs);
      document.getElementById('terminal-output-text').textContent = currentTerminalLog;

      const recs = generateCrossedRecommendations(target, earth);
      const recContainer = document.getElementById('recommendations-container');
      recContainer.innerHTML = recs.map(r => `<div>• ${r}</div>`).join('');

      const limits = generateAnalogyLimitations(target, earth);
      const limitsContainer = document.getElementById('limits-container');
      limitsContainer.innerHTML = limits.map(l => `
        <div class="limits-item">
          <span class="limits-bullet">⚠️</span>
          <span>${l}</span>
        </div>
      `).join('');
    }

    async function runMLPredictionFromInputs() {
      const latIn = parseFloat(String(document.getElementById('input-lat').value).replace(',', '.'));
      const lonIn = parseFloat(String(document.getElementById('input-lon').value).replace(',', '.'));
      const areaIn = parseFloat(String(document.getElementById('input-area').value).replace(',', '.'));
      const geoIn = document.getElementById('input-geology').value.trim();

      if (isNaN(latIn) || latIn < -90 || latIn > 90) {
        alert("Por favor ingresa una Latitud válida entre -90.0 y +90.0");
        return;
      }
      if (isNaN(lonIn) || lonIn < -180 || lonIn > 180) {
        alert("Por favor ingresa una Longitud válida entre -180.0 y +180.0");
        return;
      }
      if (isNaN(areaIn) || areaIn <= 0) {
        alert("Por favor ingresa un Área numérica positiva en km²");
        return;
      }

      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      await executePrediction(latIn, lonIn, areaIn, geoIn);
    }

    async function loadPreset(lat, lon, areaKm2, geologyStr, chipElem) {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      if (chipElem) chipElem.classList.add('active');

      document.getElementById('input-lat').value = lat;
      document.getElementById('input-lon').value = lon;
      document.getElementById('input-area').value = areaKm2;
      document.getElementById('input-geology').value = geologyStr || '';

      await executePrediction(lat, lon, areaKm2, geologyStr);
    }

    async function switchPlanetTarget(body) {
      currentPlanetMode = body;
      document.getElementById('btn-mars').className = `planet-btn mars-btn ${body === 'mars' ? 'active' : ''}`;
      document.getElementById('btn-moon').className = `planet-btn moon-btn ${body === 'moon' ? 'active' : ''}`;

      if (currentEarthSample) {
        const geoIn = document.getElementById('input-geology').value.trim();
        await executePrediction(currentEarthSample.lat, currentEarthSample.lon, currentEarthSample.area_km2, geoIn);
      }
    }

    function selectTargetDestination(targetId) {
      currentTargetSite = PLANETARY_TARGETS_DATA.find(t => t.id === targetId);
      if (currentEarthSample) {
        const geoIn = document.getElementById('input-geology').value.trim();
        executePrediction(currentEarthSample.lat, currentEarthSample.lon, currentEarthSample.area_km2, geoIn);
      }
    }

    function copyTerminalText() {
      if (!navigator.clipboard) {
        alert("Portapapeles no soportado");
        return;
      }
      navigator.clipboard.writeText(currentTerminalLog).then(() => {
        alert("¡Salida de terminal copiada al portapapeles exitosamente!");
      }).catch(err => {
        alert("Error al copiar texto: " + err);
      });
    }

    const hoverDescriptions = {
      slope: {
        title: "Pendiente Media (Topografía)",
        formula: "S_slope = (1 - |Slope_T - Slope_M| / 45°) × 100",
        justification: "Normalizado frente al rango planetario de pendientes (0° a 45°).",
        source: "NASADEM HGT Global 1-ArcSec & MGS MOLA MEGDR"
      },
      relief: {
        title: "Relieve Local (Ventana de Exploración)",
        formula: "S_relief = (1 - |Relief_T - Relief_M| / 150m) × 100",
        justification: "El micro-relieve local se evalúa dentro de la ventana de seguridad de aterrizaje rover (0 a 150m).",
        source: "SRTM v3.0 Global 30m & LOLA GDR"
      },
      roughness: {
        title: "Rugosidad Superficial",
        formula: "S_roughness = (1 - |Rough_T - Rough_M| / 5.0) × 100",
        justification: "Medida de aspereza y densidad de obstáculos decamétricos frente a la escala planetaria [0 a 5.0].",
        source: "Neumann et al. (JGR Planets, 2000)"
      },
      press: {
        title: "Presión Barométrica (Log-Ratio)",
        formula: "S_press = exp(-|log10(P_T) - log10(P_M)| / 2.2) × 100",
        justification: "La presión abarca órdenes de magnitud físicos. En alta montaña se modela el régimen de aire enrarecido.",
        source: "NASA MERRA-2 Barometric & Mars 2020 MEDA"
      },
      aridity: {
        title: "Aridez Hidrológica (Precipitación Líquida)",
        formula: "S_precip = exp(-P_T / 250mm) × 100",
        justification: "Tanto la Puna como Marte se encuentran en regímenes de desecación hiperárida.",
        source: "NASA POWER PRECTOTCORR 30-Year Climatology"
      },
      temp: {
        title: "Temperatura Media & Oscilación",
        formula: "S_temp = exp(-|T_T - T_M| / 65°C) × 100",
        justification: "La escala térmica cubre de -180°C a +45°C. Modela la oscilación diurna violenta.",
        source: "NASA POWER & MSL REMS Instrument"
      },
      uv: {
        title: "Radiación UV & Flujo Solar",
        formula: "S_uv = exp(-|UV_T - UV_M| / 22.0) × 100",
        justification: "La alta montaña andina posee el récord mundial de radiación UV eritemática (UVI > 20).",
        source: "Cabrol et al. (Frontiers/Astrobiology, 2014)"
      },
      family: {
        title: "Familia Geoquímica & Paragénesis",
        formula: "S_min = (0.35·Jaccard + 0.45·Coseno + Afinidad) × 100",
        justification: "Superposición de silicatos máficos (Basalto, Olivino, Piroxenos, Plagioclasa, Magnetita) y evaporitas.",
        source: "USGS Report 81-182 & Squyres et al. (Science 2004)"
      },
      formula: {
        title: "Índice de Similitud Planetaria (PSI)",
        formula: "PSI = 0.35·S_topo + 0.35·S_clim + 0.30·S_min",
        justification: "Ponderación multicriterio calibrada para misiones espaciales (35% Topo, 35% Clima, 30% Mineralogía).",
        source: "Ecuación Oficial NASA Space Apps 2026"
      },
      psi: {
        title: "Auditoría de Similitud Global (PSI)",
        formula: "PSI = (0.35 × S_topo) + (0.35 × S_clim) + (0.30 × S_min)",
        justification: "Puntaje global integral que certifica la fidelidad física y geológica del análogo terrestre.",
        source: "NASA Planetary Science Division Audit"
      }
    };

    function showMetricHover(metricKey, e) {
      const tooltip = document.getElementById('math-hover-tooltip');
      const item = hoverDescriptions[metricKey] || hoverDescriptions['psi'];
      if (!tooltip || !currentEarthSample || !currentTargetSite) return;

      document.getElementById('tt-title').textContent = item.title;
      document.getElementById('tt-formula').textContent = item.formula;
      document.getElementById('tt-justification').textContent = item.justification;
      document.getElementById('tt-source-text').textContent = item.source;

      let eVal = '--', tVal = '--', score = '--';
      if (metricKey === 'slope') {
        eVal = `${currentEarthSample.terrain}°`;
        tVal = `${currentTargetSite.terrain}°`;
        score = `${Math.round(Math.exp(-Math.abs(currentEarthSample.terrain - currentTargetSite.terrain) / 12.0) * 100)}%`;
      } else if (metricKey === 'relief') {
        eVal = `${currentEarthSample.relief}m`;
        tVal = `${currentTargetSite.relief}m`;
        score = `${Math.round(Math.exp(-Math.abs(currentEarthSample.relief - currentTargetSite.relief) / 120.0) * 100)}%`;
      } else if (metricKey === 'roughness') {
        eVal = `${currentEarthSample.roughness}`;
        tVal = `${currentTargetSite.roughness}`;
        score = `${Math.round(Math.exp(-Math.abs(currentEarthSample.roughness - currentTargetSite.roughness) / 7.0) * 100)}%`;
      } else if (metricKey === 'press') {
        eVal = `${currentEarthSample.atm_pressure} kPa`;
        tVal = `${currentTargetSite.atm_pressure} kPa`;
        score = `${Math.round(Math.exp(-Math.abs(Math.log10(currentEarthSample.atm_pressure + 0.01) - Math.log10(currentTargetSite.atm_pressure + 0.01)) / 2.2) * 100)}%`;
      } else if (metricKey === 'temp') {
        eVal = `${currentEarthSample.temp}°C`;
        tVal = `${currentTargetSite.temp}°C`;
        score = `${Math.round(Math.exp(-Math.abs(currentEarthSample.temp - currentTargetSite.temp) / 65.0) * 100)}%`;
      } else {
        eVal = 'Tierra';
        tVal = currentTargetSite.name;
        score = document.getElementById('psi-main-val').textContent;
      }

      document.getElementById('tt-val-earth').textContent = eVal;
      document.getElementById('tt-val-target').textContent = tVal;
      document.getElementById('tt-score').textContent = score;

      tooltip.style.display = 'block';
      moveMetricHover(e);
    }

    function moveMetricHover(e) {
      const tooltip = document.getElementById('math-hover-tooltip');
      if (!tooltip || tooltip.style.display !== 'block') return;

      const offset = 18;
      let left = e.clientX + offset;
      let top = e.clientY + offset;

      const ttRect = tooltip.getBoundingClientRect();
      if (left + ttRect.width > window.innerWidth - 10) {
        left = e.clientX - ttRect.width - offset;
      }
      if (top + ttRect.height > window.innerHeight - 10) {
        top = e.clientY - ttRect.height - offset;
      }

      tooltip.style.left = `${Math.max(10, left)}px`;
      tooltip.style.top = `${Math.max(10, top)}px`;
    }

    function hideMetricHover() {
      const tooltip = document.getElementById('math-hover-tooltip');
      if (tooltip) tooltip.style.display = 'none';
    }

    window.addEventListener('DOMContentLoaded', async () => {
      await executePrediction(-20.13, -67.49, 50.0, 'salar');
    });
  