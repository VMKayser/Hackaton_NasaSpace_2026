"""
Planetary Similarity Index (PSI) Multi-Criteria Calculation Engine.
Calculates multidimensional similarity scores between Terrestrial Analogs 
and extraterrestrial targets (Moon & Mars) based on physical, mineralogical, 
and environmental parameters.
"""
import numpy as np
from typing import Dict, Any, Tuple
from pipeline.targets import PlanetaryTarget
from pipeline.analogs_db import TerrestrialAnalog
from pipeline.config import WEIGHT_PROFILES

class PlanetarySimilarityEngine:
    """
    Computes rigorous Planetary Similarity Indexes across 3 orthogonal dimensions:
    1. Topography & Surface Roughness (S_topo)
    2. Mineralogy & Lithology (S_mineral)
    3. Climate & Environmental Radiation (S_env)
    """

    def __init__(self, weight_profile: str = "balanced"):
        if weight_profile not in WEIGHT_PROFILES:
            raise ValueError(f"Unknown weight profile '{weight_profile}'. Options: {list(WEIGHT_PROFILES.keys())}")
        self.weights = WEIGHT_PROFILES[weight_profile]
        self.profile_name = weight_profile

    def _normalize_metric_diff(self, val_a: float, val_b: float, max_scale: float) -> float:
        """Normalized similarity metric between 0.0 and 1.0 using an exponential decay distance."""
        diff = abs(val_a - val_b)
        # Using Gaussian-like decay: exp(-0.5 * (diff / (max_scale * 0.4))^2)
        scale = max(max_scale * 0.45, 1e-6)
        similarity = np.exp(-0.5 * (diff / scale) ** 2)
        return float(np.clip(similarity, 0.0, 1.0))

    def compute_topography_similarity(self, analog: TerrestrialAnalog, target: PlanetaryTarget) -> Tuple[float, Dict[str, float]]:
        """
        Calculates topographical similarity based on mean slope, surface roughness, 
        and structural/crater density.
        """
        # Slope similarity (characteristic scale = 25 degrees)
        s_slope = self._normalize_metric_diff(analog.mean_slope_deg, target.mean_slope_deg, max_scale=30.0)
        
        # Roughness std similarity (scale = 30 meters)
        s_roughness = self._normalize_metric_diff(analog.roughness_std_m, target.roughness_std_m, max_scale=35.0)
        
        # Structural density similarity (crater/fissure index 0..1)
        s_structure = self._normalize_metric_diff(analog.crater_or_structure_density, target.crater_density_index, max_scale=1.0)
        
        # Relief range similarity
        s_relief = self._normalize_metric_diff(analog.peak_valley_relief_m, target.peak_valley_relief_m, max_scale=2000.0)

        # Rover mobility critical constraint penalty:
        # If target has low slope (e.g., Jezero floor ~6°) but analog is extremely steep (>25°),
        # apply a traction mismatch penalty.
        mobility_penalty = 1.0
        if target.mean_slope_deg < 15.0 and analog.mean_slope_deg > 20.0:
            excess = analog.mean_slope_deg - 20.0
            mobility_penalty = max(0.65, 1.0 - (excess * 0.03))

        composite_topo = (0.35 * s_slope + 0.35 * s_roughness + 0.15 * s_structure + 0.15 * s_relief) * mobility_penalty
        composite_topo = float(np.clip(composite_topo, 0.0, 1.0))

        breakdown = {
            "slope_similarity": round(s_slope * 100, 2),
            "roughness_similarity": round(s_roughness * 100, 2),
            "structure_similarity": round(s_structure * 100, 2),
            "relief_similarity": round(s_relief * 100, 2),
            "mobility_penalty_factor": round(mobility_penalty, 3)
        }
        return composite_topo, breakdown

    def compute_mineralogy_similarity(self, analog: TerrestrialAnalog, target: PlanetaryTarget) -> Tuple[float, Dict[str, float]]:
        """
        Calculates mineralogical similarity using vector cosine similarity 
        and Euclidean component distance over 6 key planetary mineral fractions.
        """
        vec_a = np.array([
            analog.basalt_fraction,
            analog.sulfates_evaporites,
            analog.clays_phyllosilicates,
            analog.iron_oxides,
            analog.silica_regolith,
            analog.carbonates
        ], dtype=float)

        vec_t = np.array([
            target.basalt_fraction,
            target.sulfates_evaporites,
            target.clays_phyllosilicates,
            target.iron_oxides,
            target.silica_regolith,
            target.carbonates
        ], dtype=float)

        # Cosine similarity
        norm_a = np.linalg.norm(vec_a)
        norm_t = np.linalg.norm(vec_t)
        
        if norm_a == 0 or norm_t == 0:
            cosine_sim = 0.0
        else:
            cosine_sim = float(np.dot(vec_a, vec_t) / (norm_a * norm_t))
            cosine_sim = np.clip(cosine_sim, 0.0, 1.0)

        # Euclidean abundance similarity: 1 - (dist / sqrt(2))
        euclidean_dist = np.linalg.norm(vec_a - vec_t)
        euclidean_sim = float(np.clip(1.0 - (euclidean_dist / np.sqrt(2.0)), 0.0, 1.0))

        # Composite mineral similarity
        composite_mineral = 0.60 * cosine_sim + 0.40 * euclidean_sim
        composite_mineral = float(np.clip(composite_mineral, 0.0, 1.0))

        breakdown = {
            "cosine_similarity": round(cosine_sim * 100, 2),
            "abundance_similarity": round(euclidean_sim * 100, 2),
            "key_matching_phases": [
                m for m in analog.predominant_minerals 
                if any(k.lower() in m.lower() for k in ["halite", "gypsum", "sulfate", "basalt", "andesite", "clay", "jarosite", "silica", "pyroxene"])
            ]
        }
        return composite_mineral, breakdown

    def compute_environment_similarity(self, analog: TerrestrialAnalog, target: PlanetaryTarget) -> Tuple[float, Dict[str, float]]:
        """
        Calculates environmental similarity based on aridity, extreme solar UV flux, 
        thermal swings, and atmospheric thinning.
        """
        # Aridity similarity (both target and analog close to 1.0)
        s_aridity = self._normalize_metric_diff(analog.aridity_index, target.aridity_index, max_scale=0.5)

        # UV flux similarity (high altitude Andes receives peak UV)
        s_uv = self._normalize_metric_diff(analog.uv_flux_index, target.uv_flux_index, max_scale=0.5)

        # Thermal swing similarity
        s_thermal = self._normalize_metric_diff(analog.thermal_amplitude_c, target.thermal_amplitude_c, max_scale=80.0)

        # Atmospheric pressure proxy:
        # Standard Earth sea-level is 101.3 kPa.
        # High altitude Bolivian sites (e.g. Sajama at 46 kPa, Sol de Mañana at 56 kPa, Uyuni at 65 kPa)
        # receive an 'Altiplano Thin Atmosphere Bonus' because lower atmospheric density is closer
        # to Martian conditions (0.6 kPa) than standard sea-level sites.
        altiplano_altitude_bonus = 0.0
        if analog.elevation_m > 3000.0:
            # Bonus scales up to +0.15 for elevations between 3000m and 6500m
            altiplano_altitude_bonus = min(0.15, (analog.elevation_m - 3000.0) / 25000.0)

        composite_env = (0.40 * s_aridity + 0.35 * s_uv + 0.25 * s_thermal) + altiplano_altitude_bonus
        composite_env = float(np.clip(composite_env, 0.0, 1.0))

        breakdown = {
            "aridity_similarity": round(s_aridity * 100, 2),
            "uv_radiation_match": round(s_uv * 100, 2),
            "thermal_swing_match": round(s_thermal * 100, 2),
            "thin_atmosphere_bonus": round(altiplano_altitude_bonus * 100, 2),
            "ambient_pressure_kpa": analog.atm_pressure_kpa
        }
        return composite_env, breakdown

    def evaluate_analog_against_target(self, analog: TerrestrialAnalog, target: PlanetaryTarget) -> Dict[str, Any]:
        """
        Runs full multi-criteria evaluation and calculates composite Planetary Similarity Index (PSI).
        """
        s_topo, b_topo = self.compute_topography_similarity(analog, target)
        s_mineral, b_mineral = self.compute_mineralogy_similarity(analog, target)
        s_env, b_env = self.compute_environment_similarity(analog, target)

        w_topo = self.weights["topography"]
        w_min = self.weights["mineralogy"]
        w_env = self.weights["environment"]

        overall_psi = (w_topo * s_topo + w_min * s_mineral + w_env * s_env) * 100.0
        overall_psi = float(np.clip(overall_psi, 0.0, 100.0))

        # Scientific classification label
        if overall_psi >= 85.0:
            match_tier = "Tier 1: Exceptional Analog (Direct Mission Qualification)"
        elif overall_psi >= 70.0:
            match_tier = "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)"
        elif overall_psi >= 55.0:
            match_tier = "Tier 3: Moderate Analog (Morphological / Specialized Case)"
        else:
            match_tier = "Tier 4: Low Similarity"

        return {
            "overall_psi": round(overall_psi, 1),
            "match_tier": match_tier,
            "weights_used": self.weights,
            "subscores": {
                "topography": round(s_topo * 100, 1),
                "mineralogy": round(s_mineral * 100, 1),
                "environment": round(s_env * 100, 1)
            },
            "topography_details": b_topo,
            "mineralogy_details": b_mineral,
            "environment_details": b_env
        }

