"""
Mission Recommendation & Gap Analysis Engine (Ficha de Brechas).
Provides operational engineering recommendations for hardware testing 
and delineates physical planetary boundaries that Earth analogs cannot simulate.
"""
from typing import Dict, Any, List
from pipeline.targets import PlanetaryTarget
from pipeline.analogs_db import TerrestrialAnalog

class MissionRecommender:
    """
    Evaluates hardware subsystem testing suitability and generates 
    scientific gap analysis for flight mission planners.
    """

    @staticmethod
    def recommend_payload_and_subsystems(analog: TerrestrialAnalog, target: PlanetaryTarget) -> Dict[str, Any]:
        """
        Determines which rover and mission payloads can be certified at this site.
        """
        recommended_tests = []
        subsystems_scored = {}

        # 1. Mobility & Chassis Traction
        if analog.mean_slope_deg < 5.0 and analog.roughness_std_m < 2.0:
            subsystems_scored["mobility_traction"] = {
                "score": 92,
                "readiness_verdict": "OPTIMAL FOR LONG-RANGE AUTONOMOUS SPEED TRIALS",
                "focus": "Testing long-distance waypoint driving, wheel odometry slip in salt crusts, and zero-turn maneuvers."
            }
        elif 5.0 <= analog.mean_slope_deg <= 18.0:
            subsystems_scored["mobility_traction"] = {
                "score": 88,
                "readiness_verdict": "OPTIMAL FOR MODERATE CRATER TRAVERSE",
                "focus": "Testing rock-bogie articulation, obstacle climbing up to 35cm, and slope stability on granular scree."
            }
        else: # Steep > 18 deg
            subsystems_scored["mobility_traction"] = {
                "score": 95 if target.body == "Moon" else 65,
                "readiness_verdict": "OPTIMAL FOR EXTREME CRATER WALL CLIMBING & RAPPELLING",
                "focus": "Tethered rover winching systems, micro-spine gripper anchoring, and steep talus slope mobility."
            }

        # 2. Drill & Subsurface Sampling
        if analog.sulfates_evaporites > 0.40 or "permafrost" in analog.scientific_summary.lower():
            subsystems_scored["subsurface_drilling"] = {
                "score": 94,
                "readiness_verdict": "HIGH PRIORITY TESTBED FOR DRILL HEAD INTEGRITY",
                "focus": "Rotary-percussive coring in brittle salt crusts/cryogenic permafrost without melting volatile hydrates."
            }
        elif analog.basalt_fraction > 0.50:
            subsystems_scored["subsurface_drilling"] = {
                "score": 90,
                "readiness_verdict": "HARD ROCK CORING VALIDATION",
                "focus": "Diamond coring bit wear, thermal dissipation in dense basalt, and sample caching seals."
            }
        else:
            subsystems_scored["subsurface_drilling"] = {
                "score": 75,
                "readiness_verdict": "CLAY/SEDIMENT CORE TUBE RETRIEVAL",
                "focus": "Testing sample tube ejection and clay clogging mitigation."
            }

        # 3. Spectroscopy & Astrobiological Life Detection
        if analog.uv_flux_index > 0.90 and (analog.sulfates_evaporites > 0.30 or analog.clays_phyllosilicates > 0.30):
            subsystems_scored["astrobiology_spectroscopy"] = {
                "score": 96,
                "readiness_verdict": "GOLD STANDARD ASTROBIOLOGY TESTBED",
                "focus": "In-situ Raman and UV fluorescence detection of extremophilic pigments, amino acids, and polycyclic aromatics."
            }
        else:
            subsystems_scored["astrobiology_spectroscopy"] = {
                "score": 78,
                "readiness_verdict": "MINERALOGICAL SPECTROMETRY BENCHMARK",
                "focus": "Visible-Near-Infrared (VNIR) reflectance spectroscopy for iron and silicate classification."
            }

        # 4. Aerodynamic Rotorcraft / Mars Drones (Bolivia Altiplano Special Capability)
        if analog.elevation_m > 3500.0:
            subsystems_scored["rotorcraft_flight"] = {
                "score": 98,
                "readiness_verdict": "PREMIER GLOBAL SITE FOR LOW-DENSITY ROTORCRAFT",
                "focus": "Atmospheric density is reduced by 35%-55%, providing natural low Reynolds number conditions for Mars helicopter blades."
            }
        else:
            subsystems_scored["rotorcraft_flight"] = {
                "score": 40,
                "readiness_verdict": "NOT SUITABLE FOR MARS ROTORCRAFT (ATMOSPHERE TOO DENSE)",
                "focus": "Requires pressurized vacuum chamber to simulate thin Martian atmosphere."
            }

        # 5. Autonomous SLAM & Terrain Relative Navigation (TRN)
        subsystems_scored["autonomous_navigation"] = {
            "score": 89,
            "readiness_verdict": "EXCELLENT FOR VISUAL ODOMETRY & LIDAR SLAM",
            "focus": "Testing high-contrast illumination, shadow navigation, and hazard avoidance in unstructured rocky terrain."
        }

        # Curated recommendations summary
        for key, details in subsystems_scored.items():
            if details["score"] >= 85:
                recommended_tests.append(f"{key.replace('_', ' ').title()}: {details['focus']}")

        return {
            "recommended_test_payloads": recommended_tests,
            "subsystems_suitability": subsystems_scored
        }

    @staticmethod
    def generate_gap_analysis(analog: TerrestrialAnalog, target: PlanetaryTarget) -> Dict[str, Any]:
        """
        Creates the 'Ficha de Brechas' highlighting physical constraints Earth cannot simulate.
        """
        # Gravity mismatch
        gravity_delta = round(1.0 - target.gravity_g, 3)
        gravity_ratio = round(1.0 / target.gravity_g, 2)
        
        # Atmospheric mismatch
        target_atm = target.atm_pressure_kpa
        analog_atm = analog.atm_pressure_kpa
        atm_ratio = round(analog_atm / max(target_atm, 0.001), 1)

        gaps = [
            {
                "parameter": "Surface Gravity",
                "earth_analog_value": "1.00 g (9.81 m/s²)",
                "planetary_target_value": f"{target.gravity_g:.3f} g ({target.gravity_g * 9.81:.2f} m/s²)",
                "gap_impact": (
                    f"Earth gravity is {gravity_ratio}x higher. Wheels experience higher normal force, "
                    f"artificially increasing traction and ground compaction while damping rover wheel bouncing."
                ),
                "engineering_mitigation": (
                    "Deploy gravity offloading suspension rigs, counterweights, or construct lightweight "
                    "mockups with mass reduced by the exact gravity ratio."
                )
            },
            {
                "parameter": "Atmospheric Pressure & Composition",
                "earth_analog_value": f"{analog_atm:.1f} kPa (N2/O2 mix)",
                "planetary_target_value": f"{target_atm:.2f} kPa ({'CO2 dominant' if target.body == 'Mars' else 'Ultra-high vacuum'})",
                "gap_impact": (
                    f"Ambient pressure at analog is {atm_ratio}x higher than target. "
                    "Aerodynamic drag, convective thermal cooling, and acoustic sensor propagation do not match space vacuum or Martian thin air."
                ),
                "engineering_mitigation": (
                    "Qualify thermal dissipation subsystems and vacuum-lubricated bearings inside environmental thermal-vacuum chambers (TVAC) prior to field trials."
                )
            },
            {
                "parameter": "Cosmic & Solar Particle Radiation",
                "earth_analog_value": "Shielded by Earth magnetosphere and atmospheric column",
                "planetary_target_value": "Unshielded Solar Energetic Particles (SEP) & Galactic Cosmic Rays (GCR)",
                "gap_impact": (
                    "Analog sites cannot replicate the radiation-induced single-event upsets (SEUs) in electronics or surface radiolytic breakdown of organic molecules."
                ),
                "engineering_mitigation": (
                    "Use radiation-hardened electronic components (Rad-Hard) and conduct beamline radiation testing at accelerator facilities."
                )
            },
            {
                "parameter": "Cryogenic Temperature Floor",
                "earth_analog_value": f"Minimum {analog.min_temp_c:.1f} °C",
                "planetary_target_value": f"Minimum {target.min_temp_c:.1f} °C (down to {target.min_temp_c + 273.15:.1f} K)",
                "gap_impact": (
                    f"Target minimum temperature ({target.min_temp_c}°C) is far colder than the analog's minimum ({analog.min_temp_c}°C). "
                    "Cryogenic embrittlement of seals and lubricants cannot be fully tested outdoors."
                ),
                "engineering_mitigation": (
                    "Combine field mobility trials with cryogenic freezer soak tests for drive-train actuators."
                )
            }
        ]

        return {
            "target_body": target.body,
            "target_name": target.name,
            "analog_name": analog.name,
            "total_critical_gaps": len(gaps),
            "gaps": gaps
        }

