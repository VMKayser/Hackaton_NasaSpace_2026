"""
Master Pipeline Runner for NASA Space Apps Planetary Analogs Project.
Executes end-to-end data processing, PSI calculation, 3D terrain asset synthesis, 
and produces the master JSON for the React / Three.js frontend.
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.config import OUTPUT_DIR, WEIGHT_PROFILES
from pipeline.targets import PLANETARY_TARGETS, PlanetaryTarget
from pipeline.analogs_db import TERRESTRIAL_ANALOGS, TerrestrialAnalog
from pipeline.psi_engine import PlanetarySimilarityEngine
from pipeline.terrain_generator import TerrainGenerator
from pipeline.mission_recommender import MissionRecommender
from pipeline.fetcher import NASADataFetcher

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MasterPipeline")

def run_pipeline(
    weight_profile: str = "balanced",
    generate_terrain_assets: bool = True,
    query_nasa_api: bool = True
) -> Dict[str, Any]:
    """
    Executes the full pipeline and writes artifacts to output/
    """
    logger.info("=================================================================")
    logger.info("STARTING NASA SPACE APPS PLANETARY ANALOG DATA PROCESSING PIPELINE")
    logger.info(f"Active Weight Profile: '{weight_profile}'")
    logger.info("=================================================================")

    psi_engine = PlanetarySimilarityEngine(weight_profile=weight_profile)
    terrain_gen = TerrainGenerator()
    data_fetcher = NASADataFetcher()

    analogs_output_list = []
    comparison_matrix: Dict[str, List[Dict[str, Any]]] = {
        target_id: [] for target_id in PLANETARY_TARGETS.keys()
    }

    total_analogs = len(TERRESTRIAL_ANALOGS)
    logger.info(f"Processing {total_analogs} terrestrial analog candidates...")

    for idx, (analog_id, analog) in enumerate(TERRESTRIAL_ANALOGS.items(), 1):
        logger.info(f"[{idx}/{total_analogs}] Processing '{analog.name}' ({analog.country})...")

        # 1. 3D Terrain & Slope Asset Generation
        terrain_metrics = {}
        if generate_terrain_assets:
            terrain_metrics = terrain_gen.generate_all_terrain_assets(
                analog_id=analog.id,
                relief_m=analog.peak_valley_relief_m,
                roughness=analog.roughness_std_m
            )

        # 2. Climate & Radiation via NASA POWER / Curated Fallback
        nasa_power_raw = None
        if query_nasa_api:
            nasa_power_raw = data_fetcher.fetch_nasa_power_climatology(
                analog_id=analog.id,
                lat=analog.lat,
                lng=analog.lng
            )
        climate_summary = data_fetcher.extract_climate_summary(
            api_data=nasa_power_raw,
            fallback_min_temp=analog.min_temp_c,
            fallback_max_temp=analog.max_temp_c
        )

        # 3. Multi-Criteria Planetary Similarity Index (PSI) against all targets
        target_evaluations: Dict[str, Any] = {}
        target_gap_analyses: Dict[str, Any] = {}
        subsystem_suitabilities: Dict[str, Any] = {}

        for target_id, target in PLANETARY_TARGETS.items():
            eval_result = psi_engine.evaluate_analog_against_target(analog, target)
            target_evaluations[target_id] = eval_result

            # Operational Suitability & Gaps
            payload_rec = MissionRecommender.recommend_payload_and_subsystems(analog, target)
            gap_analysis = MissionRecommender.generate_gap_analysis(analog, target)

            target_gap_analyses[target_id] = gap_analysis
            subsystem_suitabilities[target_id] = payload_rec

            # Append to comparison ranking matrix
            comparison_matrix[target_id].append({
                "analog_id": analog.id,
                "analog_name": analog.name,
                "country": analog.country,
                "is_bolivian_gem": analog.is_bolivian_gem,
                "overall_psi": eval_result["overall_psi"],
                "topography_score": eval_result["subscores"]["topography"],
                "mineralogy_score": eval_result["subscores"]["mineralogy"],
                "environment_score": eval_result["subscores"]["environment"],
                "match_tier": eval_result["match_tier"]
            })

        # 4. Construct unified analog data record
        analog_record = {
            "id": analog.id,
            "name": analog.name,
            "country": analog.country,
            "region": analog.region,
            "is_bolivian_gem": analog.is_bolivian_gem,
            "coordinates": {
                "latitude": analog.lat,
                "longitude": analog.lng,
                "elevation_m": analog.elevation_m
            },
            "scientific_summary": analog.scientific_summary,
            "geological_context": analog.geological_context,
            "primary_target_id": analog.primary_target_id,
            "physical_parameters": {
                "mean_slope_deg": analog.mean_slope_deg,
                "roughness_std_m": analog.roughness_std_m,
                "peak_valley_relief_m": analog.peak_valley_relief_m,
                "crater_density_index": analog.crater_or_structure_density,
                "aridity_index": analog.aridity_index,
                "uv_flux_index": analog.uv_flux_index,
                "thermal_amplitude_c": analog.thermal_amplitude_c,
                "atm_pressure_kpa": analog.atm_pressure_kpa,
                "predominant_minerals": analog.predominant_minerals
            },
            "climate_measurements": climate_summary,
            "terrain_analysis": terrain_metrics,
            "similarity_scores": target_evaluations,
            "mission_suitability": subsystem_suitabilities,
            "gap_analyses": target_gap_analyses,
            "operational_testing_roles": analog.operational_testing_roles,
            "key_advantages": analog.key_advantages,
            "unreplicable_gaps": analog.unreplicable_gaps,
            "assets": {
                "heightmap": f"/assets/terrain/heightmap_{analog.id}.png",
                "slopemap": f"/assets/terrain/slopemap_{analog.id}.png",
                "texture": f"/assets/terrain/texture_{analog.id}.png"
            }
        }

        analogs_output_list.append(analog_record)

    # Sort comparison matrices by PSI score descending
    for target_id in comparison_matrix:
        comparison_matrix[target_id].sort(key=lambda x: x["overall_psi"], reverse=True)

    # Build Master JSON Dataset
    targets_metadata = {}
    for t_id, t_obj in PLANETARY_TARGETS.items():
        targets_metadata[t_id] = {
            "id": t_obj.id,
            "name": t_obj.name,
            "body": t_obj.body,
            "mission_context": t_obj.mission_context,
            "coordinates": t_obj.coordinates,
            "gravity_g": t_obj.gravity_g,
            "atm_pressure_kpa": t_obj.atm_pressure_kpa,
            "mean_slope_deg": t_obj.mean_slope_deg,
            "roughness_std_m": t_obj.roughness_std_m,
            "key_scientific_questions": t_obj.key_scientific_questions
        }

    master_dataset = {
        "metadata": {
            "project": "NASA Space Apps Challenge 2026 - Beyond Known Analogues",
            "version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "weight_profile": weight_profile,
            "weights": WEIGHT_PROFILES[weight_profile],
            "total_analogs_indexed": len(analogs_output_list),
            "bolivian_analogs_count": sum(1 for a in analogs_output_list if a["is_bolivian_gem"]),
            "targets_count": len(PLANETARY_TARGETS)
        },
        "targets": targets_metadata,
        "ranking_leaderboards": comparison_matrix,
        "analogs": analogs_output_list
    }

    # Save Master JSON
    master_json_path = OUTPUT_DIR / "analogs_dataset.json"
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(master_dataset, f, indent=2, ensure_ascii=False)
    logger.info(f"Master dataset successfully exported to: {master_json_path}")

    # Generate Scientific Markdown Validation Report
    generate_markdown_report(master_dataset, comparison_matrix)

    logger.info("PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    return master_dataset

def generate_markdown_report(dataset: Dict[str, Any], rankings: Dict[str, List[Dict[str, Any]]]):
    """
    Generates a high-impact scientific validation report ready for the hackathon pitch.
    """
    report_path = OUTPUT_DIR / "scientific_validation_report.md"
    weights = dataset["metadata"]["weights"]

    lines = []
    lines.append("# Planetary Similarity Index (PSI) & Terrestrial Analog Validation Report")
    lines.append(f"**NASA Space Apps Challenge** | Generated: `{dataset['metadata']['generated_at']}`\n")
    lines.append("> **Objective**: Identifying high-fidelity planetary analogs beyond conventional sites, spotlighting the high-altitude Bolivian Altiplano as premier testbeds for Lunar and Martian missions.\n")
    
    lines.append("## 1. Mathematical Formulation of the Planetary Similarity Index (PSI)")
    lines.append("The PSI multi-criteria model computes a weighted composite similarity score across three orthogonal domains:")
    lines.append("")
    lines.append("$$PSI = w_{topo} \\cdot S_{topo} + w_{mineral} \\cdot S_{mineral} + w_{env} \\cdot S_{env}$$")
    lines.append("")
    lines.append(f"- **Topography (weight = {weights['topography']})**: Mean slope Gaussian decay, elevation standard deviation (surface roughness $\\sigma_z$), relief difference, and vehicle rollover safety penalties.")
    lines.append(f"- **Mineralogy (weight = {weights['mineralogy']})**: Vector Cosine Similarity $\\cos(\\vec{{M}}_E, \\vec{{M}}_T)$ over 6-phase lithological compositions (basalt, sulfates/evaporites, phyllosilicates/clays, iron oxides, silica/anorthosite regolith, and carbonates) combined with Euclidean abundance matching.")
    lines.append(f"- **Environment (weight = {weights['environment']})**: Aridity index ($1 - \\text{{NDVI}}$), extreme solar UV flux, diurnal temperature swings, and an Altiplano thin-atmosphere pressure gradient bonus.")
    lines.append("\n---\n")

    lines.append("## 2. Comparative Rankings for Target Planetary Missions\n")

    for target_id, target_info in dataset["targets"].items():
        lines.append(f"### Target: {target_info['name']} ({target_info['body']})")
        lines.append(f"- **Mission Context**: {target_info['mission_context']}")
        lines.append(f"- **Coordinates**: {target_info['coordinates']} | **Gravity**: {target_info['gravity_g']} g | **Surface Pressure**: {target_info['atm_pressure_kpa']} kPa\n")
        
        lines.append("| Rank | Terrestrial Analog | Country | Bolivian Gem? | Overall PSI | Topo Score | Mineral Score | Env Score | Classification Tier |")
        lines.append("|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|")

        ranked_list = rankings.get(target_id, [])
        for rank, item in enumerate(ranked_list, 1):
            bolivia_badge = "🇧🇴 **YES**" if item["is_bolivian_gem"] else "No"
            lines.append(
                f"| **#{rank}** | **{item['analog_name']}** | {item['country']} | {bolivia_badge} | "
                f"**{item['overall_psi']:.1f}%** | {item['topography_score']:.1f}% | {item['mineralogy_score']:.1f}% | "
                f"{item['environment_score']:.1f}% | {item['match_tier'].split(':')[0]} |"
            )
        lines.append("\n")

    lines.append("## 3. Bolivian Hidden Gems: Scientific Highlights & Mission Suitability\n")
    
    for analog in dataset["analogs"]:
        if not analog["is_bolivian_gem"]:
            continue
        lines.append(f"### 🇧🇴 {analog['name']} ({analog['region']}) - Elevation: {analog['coordinates']['elevation_m']}m")
        lines.append(f"*{analog['scientific_summary']}*\n")
        lines.append(f"- **Geological Context**: {analog['geological_context']}")
        lines.append(f"- **Key Mineral Phases**: {', '.join(analog['physical_parameters']['predominant_minerals'])}")
        lines.append(f"- **Ambient Atmospheric Pressure**: `{analog['physical_parameters']['atm_pressure_kpa']} kPa` (Natural low-density testbed)")
        lines.append("- **Recommended Operational Tests**:")
        for role in analog["operational_testing_roles"]:
            lines.append(f"  - {role}")
        lines.append("- **Unreplicable Terrestrial Gaps (Ficha de Brechas)**:")
        for gap in analog["unreplicable_gaps"]:
            lines.append(f"  - ⚠️ {gap}")
        lines.append("\n")

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    logger.info(f"Scientific validation report exported to: {report_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Planetary Analog Data Processing Pipeline")
    parser.add_argument("--profile", default="balanced", choices=list(WEIGHT_PROFILES.keys()), help="Weight profile")
    parser.add_argument("--skip-terrain", action="store_true", help="Skip 3D terrain heightmap PNG generation")
    parser.add_argument("--skip-api", action="store_true", help="Skip live NASA POWER API querying")

    args = parser.parse_args()
    run_pipeline(
        weight_profile=args.profile,
        generate_terrain_assets=not args.skip_terrain,
        query_nasa_api=not args.skip_api
    )
