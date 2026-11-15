#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import math
import numpy as np
import pandas as pd

def test():
    # Coordenadas de Santa Cruz
    lat = -17.935
    lon = -63.155
    area = 30.0
    
    # Supongamos que añadimos santa-cruz-control
    st_sc = {
        'id': 'santa-cruz-control',
        'name': 'Santa Cruz de la Sierra (Llanos del Oriente - Control Negativo)',
        'lat': -17.78,
        'lon': -63.18,
        'elevation': 416.0,
        'geology': 'humid_lowland',
        'precip': 1350.0,
        'temp': 25.0,
        'temp_swing': 14.0,
        'solar_flux': 19.5,
        'atm_pressure': 96.5,
        'terrain': 1.2,
        'relief': 12.0,
        'roughness': 1.1,
        'body': 'earth'
    }
    
    # Inferencia de geología
    # Regla: lat en [-22.5, -9.5], lon en [-64.2, -57.4] y elev < 800
    elev = 408.5
    is_bolivia_lowland = (-22.5 <= lat <= -9.5) and (-64.2 <= lon <= -57.4) and (elev < 800)
    geology = 'humid_lowland' if is_bolivia_lowland else 'other'
    print(f"Geología detectada: {geology} (is_bolivia_lowland={is_bolivia_lowland})")
    
    # Topografía escalada
    area_factor = (area / 25.0) ** 0.15
    terrain = 1.2
    relief = round(12.0 * area_factor, 1)
    roughness = 1.1
    print(f"Topografía: pendiente={terrain}°, relieve={relief}m, rugosidad={roughness}")
    
    # Clima
    temp = 25.2
    temp_swing = 14.0
    precip = 1320.0
    solar_flux = 19.5
    atm_pressure = 96.5
    print(f"Clima: temp={temp}°C, swing={temp_swing}°C, precip={precip}mm, sol={solar_flux}, press={atm_pressure}kPa")
    
    # Minerales
    minerals = ['Arenas de cuarzo aluvial fluvial', 'Caolinita (meteorización húmeda tropical)', 'Materia orgánica / Humus fértil', 'Óxidos férricos secundarios (Limonita/Goethita)']
    
    # Comparar contra Gusev Crater y Elysium Planitia
    targets = [
        {
            'name': 'Cráter Gusev',
            'body': 'Marte',
            'terrain': 6.5, 'relief': 150.0, 'roughness': 5.2,
            'temp': -58.0, 'temp_swing': 88.0, 'precip': 0.0, 'solar_flux': 9.9, 'atm_pressure': 0.64,
            'geology': 'volcanic_basalt',
            'minerals': ['Basalto vesicular', 'Piroxeno', 'Olivino', 'Hematita']
        },
        {
            'name': 'Elysium Planitia',
            'body': 'Marte',
            'terrain': 4.2, 'relief': 45.0, 'roughness': 2.0,
            'temp': -55.0, 'temp_swing': 78.0, 'precip': 0.0, 'solar_flux': 10.5, 'atm_pressure': 0.65,
            'geology': 'volcanic_basalt',
            'minerals': ['Basalto olivínico', 'Piroxeno', 'Plagioclasa', 'Magnetita']
        },
        {
            'name': 'Base Tranquilidad (Luna)',
            'body': 'Luna',
            'terrain': 3.8, 'relief': 25.0, 'roughness': 3.5,
            'temp': -20.0, 'temp_swing': 290.0, 'precip': 0.0, 'solar_flux': 15.0, 'atm_pressure': 0.0,
            'geology': 'mare_basalt',
            'minerals': ['Basalto de mar lunar', 'Ilmenita', 'Piroxeno', 'Plagioclasa']
        }
    ]
    
    for t in targets:
        # S_topo
        d_slope = abs(terrain - t['terrain']) / 14.0
        s_slope = math.exp(-d_slope)
        d_rough = abs(roughness - t['roughness']) / 8.0
        s_rough = math.exp(-d_rough)
        
        log_e = math.log10(max(relief, 0.1) + 5.0)
        log_t = math.log10(max(t['relief'], 0.1) + 5.0)
        d_relief_log = abs(log_e - log_t) / 0.85
        s_relief_log = math.exp(-d_relief_log)
        s_relief_abs = math.exp(-abs(relief - t['relief']) / 1200.0)
        s_relief = 0.5 * s_relief_log + 0.5 * s_relief_abs
        s_topo = round((0.35 * s_slope + 0.35 * s_relief + 0.30 * s_rough) * 100.0, 1)
        
        # S_clim
        d_temp = abs(temp - t['temp']) / 65.0
        d_swing = abs(temp_swing - t['temp_swing']) / 75.0
        log_pe = math.log10(max(atm_pressure, 0.001) + 0.01)
        log_pt = math.log10(max(t['atm_pressure'], 0.001) + 0.01)
        d_press = abs(log_pe - log_pt) / 2.2
        d_uv = abs(solar_flux - t['solar_flux']) / 22.0
        d_precip = precip / 250.0 # 1320 / 250 = 5.28 -> exp(-5.28) = 0.0051
        
        if t['body'] == 'Luna':
            s_clim_val = (0.25 * math.exp(-d_temp) + 0.20 * math.exp(-d_swing) + 0.35 * 0.02 + 0.20 * math.exp(-d_uv)) * 100.0 * 0.85
        else:
            s_clim_val = (0.25 * math.exp(-d_temp) + 0.20 * math.exp(-d_swing) + 0.25 * math.exp(-d_press) + 0.15 * math.exp(-d_uv) + 0.15 * math.exp(-d_precip)) * 100.0
        s_clim = round(max(5.0, min(95.0, s_clim_val)), 1)
        
        # S_min
        # Como es llanura tropical con suelo húmico y cuarzo, afinidad con basaltos lunares/marcianos es residual
        s_min = 12.0
        
        psi = round(0.35 * s_topo + 0.35 * s_clim + 0.30 * s_min, 1)
        tier = "Tier 4: Non-Analog (Control Negativo / Límite de Habitabilidad)" if psi < 45.0 else "Tier 3: Moderate"
        print(f"Target: {t['name']:25} | S_topo: {s_topo}% | S_clim: {s_clim}% | S_min: {s_min}% | PSI: {psi}% | {tier}")

if __name__ == '__main__':
    test()
