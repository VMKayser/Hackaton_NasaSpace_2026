"""
Builds the comprehensive multi-planetary dataset with cross-planetary PSI matrix.
Exports to output/comprehensive_mission_dataset.json and data/mission_dataset.js
"""
import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.comprehensive_db import MARS_SITES, MOON_SITES
from pipeline.analogs_db import TERRESTRIAL_ANALOGS
from pipeline.psi_engine import PlanetarySimilarityEngine
from pipeline.targets import PlanetaryTarget

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
DATA_DIR = BASE_DIR / "data"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

def build_full_dataset():
    psi_engine = PlanetarySimilarityEngine(weight_profile="balanced")

    # Adapt Mars and Moon sites into evaluation targets
    eval_targets = {}
    for sid, sdata in MARS_SITES.items():
        eval_targets[sid] = PlanetaryTarget(
            id=sid,
            name=sdata["name"],
            body="Mars",
            mission_context=sdata["mission"],
            coordinates=f"{sdata['coordinates']['lat']}°, {sdata['coordinates']['lng']}°",
            diameter_km=sdata.get("diameter_km", 50.0),
            depth_m=abs(sdata.get("elevation_m", 1000.0)),
            gravity_g=0.38,
            atm_pressure_kpa=sdata["gases_atmosphere"]["pressure_kpa"],
            mean_slope_deg=sdata["surface_roughness"]["mean_slope_deg"],
            roughness_std_m=sdata["surface_roughness"]["roughness_std_m"],
            peak_valley_relief_m=300.0,
            crater_density_index=0.6,
            basalt_fraction=0.35,
            sulfates_evaporites=0.30 if "sulfat" in str(sdata["mineralogy"]).lower() else 0.10,
            clays_phyllosilicates=0.25 if "arcill" in str(sdata["mineralogy"]).lower() else 0.05,
            iron_oxides=0.15 if "hematit" in str(sdata["mineralogy"]).lower() or "hierro" in str(sdata["mineralogy"]).lower() else 0.05,
            silica_regolith=0.20 if "sílice" in str(sdata["mineralogy"]).lower() else 0.05,
            carbonates=0.10 if "carbonat" in str(sdata["mineralogy"]).lower() else 0.0,
            aridity_index=1.0,
            uv_flux_index=0.90,
            thermal_amplitude_c=sdata["climate_radiation"]["diurnal_swing_c"],
            min_temp_c=sdata["climate_radiation"]["temp_min_c"],
            max_temp_c=sdata["climate_radiation"]["temp_max_c"],
            key_scientific_questions=[sdata["summary"]],
            critical_analog_requirements=sdata["mission_equipment_needed"][:3]
        )

    for sid, sdata in MOON_SITES.items():
        eval_targets[sid] = PlanetaryTarget(
            id=sid,
            name=sdata["name"],
            body="Moon",
            mission_context=sdata["mission"],
            coordinates=f"{sdata['coordinates']['lat']}°, {sdata['coordinates']['lng']}°",
            diameter_km=sdata.get("diameter_km", 20.0),
            depth_m=abs(sdata.get("elevation_m", 1500.0)),
            gravity_g=0.166,
            atm_pressure_kpa=0.0,
            mean_slope_deg=sdata["surface_roughness"]["mean_slope_deg"],
            roughness_std_m=sdata["surface_roughness"]["roughness_std_m"],
            peak_valley_relief_m=1000.0,
            crater_density_index=0.9,
            basalt_fraction=0.60 if "tranquil" in sid or "marius" in sid else 0.15,
            sulfates_evaporites=0.0,
            clays_phyllosilicates=0.0,
            iron_oxides=0.10 if "ilmenit" in str(sdata["mineralogy"]).lower() else 0.02,
            silica_regolith=0.75 if "shackleton" in sid else 0.30,
            carbonates=0.0,
            aridity_index=1.0,
            uv_flux_index=0.98,
            thermal_amplitude_c=sdata["climate_radiation"]["diurnal_swing_c"],
            min_temp_c=sdata["climate_radiation"]["temp_min_c"],
            max_temp_c=sdata["climate_radiation"]["temp_max_c"],
            key_scientific_questions=[sdata["summary"]],
            critical_analog_requirements=sdata["mission_equipment_needed"][:3]
        )

    # Process all Earth analogs and compute matrix
    earth_analogs_processed = []
    cross_similarity_matrix = {}

    for a_id, analog in TERRESTRIAL_ANALOGS.items():
        sim_scores = {}
        for target_id, target_obj in eval_targets.items():
            res = psi_engine.evaluate_analog_against_target(analog, target_obj)
            sim_scores[target_id] = {
                "overall_psi": res["overall_psi"],
                "match_tier": res["match_tier"],
                "subscores": res["subscores"]
            }
            if target_id not in cross_similarity_matrix:
                cross_similarity_matrix[target_id] = []
            cross_similarity_matrix[target_id].append({
                "analog_id": analog.id,
                "analog_name": analog.name,
                "country": analog.country,
                "is_bolivian_gem": analog.is_bolivian_gem,
                "overall_psi": res["overall_psi"],
                "subscores": res["subscores"]
            })

        # Sort targets for this analog descending
        sorted_targets = sorted(sim_scores.items(), key=lambda x: x[1]["overall_psi"], reverse=True)

        record = {
            "id": analog.id,
            "name": analog.name,
            "country": analog.country,
            "region": analog.region,
            "is_bolivian_gem": analog.is_bolivian_gem,
            "coordinates": {
                "lat": analog.lat,
                "lng": analog.lng,
                "elevation_m": analog.elevation_m
            },
            "scientific_summary": analog.scientific_summary,
            "geological_context": analog.geological_context,
            "gases_atmosphere": {
                "pressure_kpa": analog.atm_pressure_kpa,
                "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
                "density_comparison": f"Presión de {analog.atm_pressure_kpa} kPa ({'~45-65% del nivel del mar' if analog.elevation_m > 3000 else 'nivel estándar'})."
            },
            "mineralogy": {
                "predominant": analog.predominant_minerals,
                "composition_vector": {
                    "basalto": round(analog.basalt_fraction * 100, 1),
                    "sulfatos_evaporitas": round(analog.sulfates_evaporites * 100, 1),
                    "arcillas": round(analog.clays_phyllosilicates * 100, 1),
                    "oxidos_hierro": round(analog.iron_oxides * 100, 1),
                    "silice_regolito": round(analog.silica_regolith * 100, 1)
                }
            },
            "climate_radiation": {
                "temp_min_c": analog.min_temp_c,
                "temp_max_c": analog.max_temp_c,
                "thermal_amplitude_c": analog.thermal_amplitude_c,
                "uv_index": f"{analog.uv_flux_index * 100:.0f}% (Índice UV extremo en alta altitud)",
                "aridity": f"{analog.aridity_index * 100:.0f}%"
            },
            "surface_roughness": {
                "mean_slope_deg": analog.mean_slope_deg,
                "roughness_std_m": analog.roughness_std_m,
                "peak_valley_relief_m": analog.peak_valley_relief_m
            },
            "mission_equipment_needed": analog.operational_testing_roles,
            "habitat_conditioning": analog.key_advantages,
            "gap_analysis": analog.unreplicable_gaps,
            "target_similarity_scores": sim_scores,
            "top_matching_destinations": [
                {"target_id": t[0], "overall_psi": t[1]["overall_psi"]} for t in sorted_targets[:4]
            ]
        }
        earth_analogs_processed.append(record)

    # Sort cross-matrix
    for tid in cross_similarity_matrix:
        cross_similarity_matrix[tid].sort(key=lambda x: x["overall_psi"], reverse=True)

    full_payload = {
        "metadata": {
            "title": "NASA Space Apps 2026 - Comprehensive Planetary Mission & Analog Explorer",
            "version": "2.0.0",
            "total_earth_analogs": len(earth_analogs_processed),
            "total_mars_sites": len(MARS_SITES),
            "total_moon_sites": len(MOON_SITES),
            "bolivian_gems_count": sum(1 for a in earth_analogs_processed if a["is_bolivian_gem"])
        },
        "earth_analogs": earth_analogs_processed,
        "mars_sites": MARS_SITES,
        "moon_sites": MOON_SITES,
        "cross_rankings_by_target": cross_similarity_matrix
    }

    # Save to JSON
    json_path = OUTPUT_DIR / "comprehensive_mission_dataset.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(full_payload, f, indent=2, ensure_ascii=False)

    # Save to JS file for direct HTML import
    js_path = DATA_DIR / "mission_dataset.js"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("window.PLANETARY_MISSION_DATA = " + json.dumps(full_payload, indent=2, ensure_ascii=False) + ";\n")

    print(f"✅ Dataset guardado en: {json_path}")
    print(f"✅ Archivo JS embebible guardado en: {js_path}")
    return full_payload

if __name__ == "__main__":
    build_full_dataset()
