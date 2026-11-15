#!/usr/bin/env python3
"""
Interactive Data Inspector & Scientific Veracity Dossier for NASA Space Apps.
Allows full inspection of planetary metrics, PSI score breakdowns, 
and verification of scientific references (NASA missions, PDS datasets, peer-reviewed DOIs).

Usage:
  python inspect_data.py                  # Opens interactive CLI dashboard
  python inspect_data.py --rankings       # Shows planetary target rankings
  python inspect_data.py --site uyuni     # Inspects a specific analog
  python inspect_data.py --sources        # Shows full academic & NASA source citations
  python inspect_data.py --html           # Generates & launches interactive HTML dossier
"""

import sys
import json
import webbrowser
from pathlib import Path
from typing import Dict, Any, List

# Add workspace to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.references_db import SCIENTIFIC_SOURCES, SITE_VERIFICATION_MAP, ScientificSource

DATASET_FILE = BASE_DIR / "output" / "analogs_dataset.json"
HTML_OUTPUT_FILE = BASE_DIR / "output" / "verificacion_cientifica.html"
DEMO_HTML_FILE = BASE_DIR / "demo_mission_control.html"

def load_dataset() -> Dict[str, Any]:
    """Loads the master dataset from output/analogs_dataset.json."""
    if not DATASET_FILE.exists():
        print(f"\n❌ Error: No se encontró '{DATASET_FILE}'.")
        print("Ejecuta primero: python pipeline/run_pipeline.py\n")
        sys.exit(1)
    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def print_banner():
    print("=" * 80)
    print("  🚀 NASA SPACE APPS CHALLENGE: BEYOND KNOWN ANALOGUES")
    print("  VISOR DE DATOS CIENTÍFICOS Y AUDITORÍA DE VERACIDAD (BOLIVIA & GLOBAL)")
    print("=" * 80)

def display_rankings(dataset: Dict[str, Any]):
    """Displays leaderboards for all planetary targets."""
    print("\n" + "=" * 80)
    print("🏆 CLASIFICACIÓN DE ANÁLOGOS TERRESTRES POR OBJETIVO PLANETARIO (PSI)")
    print("=" * 80)

    rankings = dataset.get("ranking_leaderboards", {})
    targets = dataset.get("targets", {})

    for target_id, target_info in targets.items():
        print(f"\n🎯 OBJETIVO: {target_info['name'].upper()} ({target_info['body'].upper()})")
        print(f"   Contexto Misión: {target_info['mission_context']}")
        print(f"   Gravedad: {target_info['gravity_g']}g | Presión: {target_info['atm_pressure_kpa']} kPa")
        print("-" * 80)
        print(f"{'#':<3} | {'ANÁLOGO TERRESTRE':<35} | {'PAÍS':<10} | {'PSI TOTAL':<10} | {'TIER':<15}")
        print("-" * 80)

        for rank, entry in enumerate(rankings.get(target_id, []), 1):
            bolivia_mark = "🇧🇴 " if entry["is_bolivian_gem"] else "   "
            name_display = f"{bolivia_mark}{entry['analog_name'][:30]}"
            print(f"{rank:<3} | {name_display:<35} | {entry['country']:<10} | {entry['overall_psi']:>6.1f}%    | {entry['match_tier'].split(':')[0]}")
    print("\n" + "=" * 80)

def display_analog_detail(analog: Dict[str, Any]):
    """Prints a comprehensive technical report for a single analog."""
    bolivia_badge = "🇧🇴 [JOYA OCULTA DE BOLIVIA]" if analog["is_bolivian_gem"] else "[ANÁLOGO GLOBAL]"
    print("\n" + "=" * 80)
    print(f"🔍 FICHA TÉCNICA: {analog['name'].upper()} {bolivia_badge}")
    print(f"   Ubicación: {analog['region']}, {analog['country']}")
    print(f"   Coordenadas: Lat {analog['coordinates']['latitude']}, Lng {analog['coordinates']['longitude']} | Elevación: {analog['coordinates']['elevation_m']} msnm")
    print("=" * 80)

    print("\n📖 RESUMEN CIENTÍFICO:")
    print(f"   {analog['scientific_summary']}")
    print(f"\n🏛️ CONTEXTO GEOLÓGICO:\n   {analog['geological_context']}")

    print("\n📊 PARÁMETROS FÍSICOS Y MEDICIONES:")
    phys = analog["physical_parameters"]
    print(f"   • Pendiente Media: {phys['mean_slope_deg']}°")
    print(f"   • Rugosidad Superficial (std elevación): {phys['roughness_std_m']} m")
    print(f"   • Desnivel Relieve Máximo: {phys['peak_valley_relief_m']} m")
    print(f"   • Índice de Aridez (1 - NDVI): {phys['aridity_index'] * 100:.0f}%")
    print(f"   • Índice de Radiación Solar UV: {phys['uv_flux_index'] * 100:.0f}%")
    print(f"   • Presión Atmosférica Superficial: {phys['atm_pressure_kpa']} kPa (vs 101.3 kPa nivel del mar)")
    print(f"   • Minerales Clave: {', '.join(phys['predominant_minerals'])}")

    print("\n🌡️ CLIMA Y CONDICIONES (NASA POWER / SATÉLITE):")
    clim = analog["climate_measurements"]
    print(f"   • Fuente de datos: {clim['source']}")
    print(f"   • Rango Térmico Diario: Mín {clim['min_temp_c']}°C | Máx {clim['max_temp_c']}°C (Amplitud: {clim['thermal_amplitude_c']}°C)")

    print("\n🪐 SCORES DEL ÍNDICE DE SIMILITUD PLANETARIA (PSI):")
    for t_id, t_eval in analog["similarity_scores"].items():
        sub = t_eval["subscores"]
        print(f"   ► {t_id.replace('_', ' ').title()}:")
        print(f"     Score General: {t_eval['overall_psi']}% | Topografía: {sub['topography']}% | Mineralogía: {sub['mineralogy']}% | Clima: {sub['environment']}%")
        print(f"     Clasificación: {t_eval['match_tier']}")

    print("\n🛠️ PRUEBAS DE HARDWARE RECOMENDADAS:")
    for role in analog["operational_testing_roles"]:
        print(f"   • {role}")

    print("\n⚠️ FICHA DE BRECHAS (LÍMITES QUE LA TIERRA NO PUEDE SIMULAR):")
    for gap in analog["unreplicable_gaps"]:
        print(f"   • {gap}")

    # Display scientific verification sources
    sources_keys = SITE_VERIFICATION_MAP.get(analog["id"], [])
    print("\n📚 FUENTES Y REFERENCIAS DE VERACIDAD CIENTÍFICA PARA ESTE SITIO:")
    for sk in sources_keys:
        src = SCIENTIFIC_SOURCES.get(sk)
        if src:
            print(f"   [ {src.category} ] {src.title}")
            print(f"     Autores / Misión: {src.authors_or_organization} ({src.year_or_mission})")
            print(f"     DOI / URL: {src.doi_or_url}")
            print(f"     Dato validado: {src.data_extracted}")
            print()
    print("=" * 80)

def display_sources():
    """Displays the comprehensive scientific bibliography backing the whole project."""
    print("\n" + "=" * 80)
    print("📚 DOSSIER DE VERACIDAD CIENTÍFICA Y FUENTES OFICIALES DE DATOS (NASA/PDS/DOIs)")
    print("=" * 80)
    print("Cada valor numérico del modelo proviene de fuentes aeroespaciales y publicaciones revisadas por pares:\n")

    for idx, (source_id, src) in enumerate(SCIENTIFIC_SOURCES.items(), 1):
        print(f"[{idx}] {src.title}")
        print(f"    Categoría: {src.category}")
        print(f"    Autores / Entidad: {src.authors_or_organization}")
        print(f"    Misión / Año: {src.year_or_mission}")
        print(f"    Enlace / DOI: {src.doi_or_url}")
        print(f"    Variables extraídas: {src.data_extracted}")
        print(f"    Verificación: {src.verification_notes}")
        print("-" * 80)
    print("=" * 80)

def generate_interactive_html(dataset: Dict[str, Any]) -> str:
    """
    Generates a high-impact, standalone HTML dashboard with styling, tables,
    and clickable references to NASA PDS and peer-reviewed journals.
    """
    analogs = dataset.get("analogs", [])
    rankings = dataset.get("ranking_leaderboards", {})

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NASA Space Apps - Dossier de Veracidad Científica de Análogos Planetarios</title>
  <style>
    :root {{
      --bg: #0b0f19;
      --card-bg: #151d30;
      --border: #23314f;
      --accent: #38bdf8;
      --accent-alt: #f59e0b;
      --bolivia-red: #ef4444;
      --bolivia-green: #10b981;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
    }}
    .container {{
      max-width: 1280px;
      margin: 0 auto;
    }}
    header {{
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }}
    h1 {{
      font-size: 2.2rem;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.5px;
    }}
    .badge {{
      display: inline-block;
      padding: 0.25rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .badge-bolivia {{
      background: linear-gradient(135deg, #ef4444, #f59e0b, #10b981);
      color: white;
    }}
    .badge-nasa {{
      background: #0284c7;
      color: white;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }}
    .card h2 {{
      margin-top: 0;
      color: var(--accent);
      font-size: 1.3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.9rem;
    }}
    th, td {{
      padding: 0.65rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }}
    th {{
      background: rgba(35, 49, 79, 0.6);
      color: var(--accent);
      font-weight: 600;
    }}
    tr:hover {{
      background: rgba(56, 189, 248, 0.05);
    }}
    .source-box {{
      background: #0d1527;
      border-left: 4px solid var(--accent);
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.85rem;
    }}
    a {{
      color: var(--accent);
      text-decoration: none;
    }}
    a:hover {{
      text-decoration: underline;
    }}
    .metric-pill {{
      display: inline-block;
      background: #1e293b;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin: 0.2rem;
      font-family: monospace;
      font-size: 0.85rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1>🚀 NASA Space Apps Challenge 2026</h1>
          <p style="color: var(--text-muted); margin: 0;">Dossier de Auditoría y Veracidad Científica: <strong>Análogos Planetarios del Altiplano Boliviano y el Mundo</strong></p>
        </div>
        <span class="badge badge-nasa">Misiones NASA / PDS Auditadas</span>
      </div>
    </header>

    <section>
      <h2>🏆 Rankings de Similitud Planetaria (PSI)</h2>
      <div class="grid">
"""
    # Rankings cards
    for target_id, target_name in [("jezero_crater_mars", "Marte: Cráter Jezero (Mars 2020)"), 
                                   ("gale_crater_mars", "Marte: Cráter Gale (Curiosity)"), 
                                   ("shackleton_crater_moon", "Luna: Cráter Shackleton (Artemis III)")]:
        html += f"""
        <div class="card">
          <h2>{target_name}</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Análogo</th>
                <th>País</th>
                <th>Score PSI</th>
              </tr>
            </thead>
            <tbody>
        """
        for rank, item in enumerate(rankings.get(target_id, [])[:5], 1):
            bolivia_flag = "🇧🇴 " if item["is_bolivian_gem"] else ""
            bold_style = "font-weight: 700; color: #38bdf8;" if rank == 1 else ""
            html += f"""
              <tr style="{bold_style}">
                <td>{rank}</td>
                <td>{bolivia_flag}{item['analog_name']}</td>
                <td>{item['country']}</td>
                <td><strong>{item['overall_psi']:.1f}%</strong></td>
              </tr>
            """
        html += """
            </tbody>
          </table>
        </div>
        """

    html += """
      </div>
    </section>

    <section>
      <h2>🇧🇴 Detalle de las Gemas Ocultas de Bolivia y Fuentes Auditadas</h2>
      <div class="grid">
    """

    for analog in analogs:
        if not analog["is_bolivian_gem"]:
            continue
        p = analog["physical_parameters"]
        sources_keys = SITE_VERIFICATION_MAP.get(analog["id"], [])
        
        html += f"""
        <div class="card">
          <h2>
            <span>{analog['name']}</span>
            <span class="badge badge-bolivia">Bolivia • {analog['coordinates']['elevation_m']}m</span>
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">{analog['scientific_summary']}</p>
          
          <div style="margin: 1rem 0;">
            <span class="metric-pill">Pendiente: {p['mean_slope_deg']}°</span>
            <span class="metric-pill">Rugosidad: {p['roughness_std_m']}m</span>
            <span class="metric-pill">Presión: {p['atm_pressure_kpa']} kPa</span>
            <span class="metric-pill">Aridez: {p['aridity_index']*100:.0f}%</span>
            <span class="metric-pill">UV: {p['uv_flux_index']*100:.0f}%</span>
          </div>

          <div style="font-size: 0.85rem; margin-top: 0.5rem;">
            <strong>Minerales Predominantes:</strong> {', '.join(p['predominant_minerals'])}
          </div>

          <div class="source-box">
            <strong>📚 Verificación Científica (NASA / Papers):</strong>
            <ul style="padding-left: 1.2rem; margin: 0.4rem 0 0 0;">
        """
        for sk in sources_keys:
            src = SCIENTIFIC_SOURCES.get(sk)
            if src:
                html += f"""
                <li>
                  <a href="{src.doi_or_url}" target="_blank"><strong>{src.title}</strong></a><br>
                  <span style="color: var(--text-muted); font-size: 0.78rem;">{src.authors_or_organization} ({src.year_or_mission}) — <em>{src.data_extracted}</em></span>
                </li>
                """
        html += """
            </ul>
          </div>
        </div>
        """

    html += """
      </div>
    </section>

    <section>
      <h2>🏛️ Bibliografía Completa y Repositorios Oficiales</h2>
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Fuente / Misión</th>
              <th>Entidad / Autores</th>
              <th>Datos Extraídos y Validación</th>
              <th>Enlace / DOI</th>
            </tr>
          </thead>
          <tbody>
    """
    for s_id, src in SCIENTIFIC_SOURCES.items():
        html += f"""
            <tr>
              <td><strong>{src.title}</strong><br><span style="color: var(--accent); font-size: 0.8rem;">{src.category}</span></td>
              <td>{src.authors_or_organization}<br><small style="color: var(--text-muted);">{src.year_or_mission}</small></td>
              <td>{src.data_extracted}<br><small style="color: var(--text-muted);">{src.verification_notes}</small></td>
              <td><a href="{src.doi_or_url}" target="_blank">🔗 Ver Recurso Oficial</a></td>
            </tr>
        """
    html += """
          </tbody>
        </table>
      </div>
    </section>

    <footer style="margin-top: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
      NASA Space Apps Challenge 2026 • Planetary Analog Data Verification Engine • Sucre, Bolivia
    </footer>
  </div>
</body>
</html>
    """

    with open(HTML_OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html)
    return str(HTML_OUTPUT_FILE)

def interactive_menu(dataset: Dict[str, Any]):
    """Runs interactive terminal menu."""
    analogs = dataset.get("analogs", [])
    analog_map = {a["id"]: a for a in analogs}

    while True:
        print_banner()
        print("\n¿Qué deseas consultar para verificar los datos?")
        print("  1. 🌍 Abrir DEMO 3D Interactivo de Globos Duales (Tierra ◄► Marte/Luna)")
        print("  2. 🏆 Ver Clasificación y Rankings de Similitud (PSI) [Jezero, Gale, Shackleton]")
        print("  3. 🔍 Inspeccionar un Análogo Terrestre en Detalle (Uyuni, Laguna Colorada, Sol de Mañana, Sajama, etc.)")
        print("  4. 📚 Ver Fuentes de Veracidad Científica (NASA PDS, ICESat, LRO, Papers revisados por pares)")
        print("  5. 🌐 Abrir Dossier de Veracidad Científica (HTML)")
        print("  6. ❌ Salir")
        
        choice = input("\nElige una opción (1-6): ").strip()

        if choice == "1":
            if DEMO_HTML_FILE.exists():
                print(f"\n🚀 Lanzando Demo 3D Dual-Globe en el navegador:\n   {DEMO_HTML_FILE}")
                webbrowser.open(f"file://{DEMO_HTML_FILE}")
            else:
                print("\n⚠️ No se encontró el archivo demo_mission_control.html")
            input("\nPresiona ENTER para volver al menú...")

        elif choice == "2":
            display_rankings(dataset)
            input("\nPresiona ENTER para volver al menú...")

        elif choice == "3":
            print("\nLista de Análogos Disponibles:")
            for idx, a in enumerate(analogs, 1):
                flag = "🇧🇴 " if a["is_bolivian_gem"] else "   "
                print(f"  {idx}. {flag}{a['name']} ({a['country']})")
            
            sub_choice = input(f"\nSelecciona el número (1-{len(analogs)}) o escribe el ID/nombre: ").strip()
            selected = None
            if sub_choice.isdigit():
                val = int(sub_choice)
                if 1 <= val <= len(analogs):
                    selected = analogs[val - 1]
            else:
                for a in analogs:
                    if sub_choice.lower() in a["id"].lower() or sub_choice.lower() in a["name"].lower():
                        selected = a
                        break

            if selected:
                display_analog_detail(selected)
            else:
                print("\n⚠️ Análogo no encontrado.")
            input("\nPresiona ENTER para volver al menú...")

        elif choice == "3":
            display_sources()
            input("\nPresiona ENTER para volver al menú...")

        elif choice == "4":
            html_path = generate_interactive_html(dataset)
            print(f"\n✅ Dossier interactivo generado con éxito en:\n   {html_path}")
            try:
                webbrowser.open(f"file://{html_path}")
                print("🌐 Se ha abierto en tu navegador predeterminado.")
            except Exception as e:
                print(f"Nota: Puedes abrir manualmente: file://{html_path}")
            input("\nPresiona ENTER para volver al menú...")

        elif choice == "5":
            print("\n¡Éxito en el NASA Space Apps Challenge! 🚀🛰️\n")
            break
        else:
            print("\nOpción inválida. Intenta nuevamente.")

def main():
    dataset = load_dataset()

    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ["--demo", "-d", "--globes"]:
            print(f"Abriendo Demo 3D Dual-Globe: {DEMO_HTML_FILE}")
            webbrowser.open(f"file://{DEMO_HTML_FILE}")
        elif arg in ["--rankings", "-r"]:
            display_rankings(dataset)
        elif arg in ["--sources", "-s"]:
            display_sources()
        elif arg in ["--html", "-w", "--web"]:
            path = generate_interactive_html(dataset)
            print(f"Dossier HTML generado: {path}")
            webbrowser.open(f"file://{path}")
        elif arg in ["--site", "-a"] and len(sys.argv) > 2:
            query = sys.argv[2].lower()
            match = None
            for a in dataset.get("analogs", []):
                if query in a["id"].lower() or query in a["name"].lower():
                    match = a
                    break
            if match:
                display_analog_detail(match)
            else:
                print(f"No se encontró análogo con búsqueda: '{query}'")
        else:
            print(f"Argumento desconocido: {arg}")
            print("Uso: python inspect_data.py [--rankings | --sources | --html | --site <nombre>]")
    else:
        interactive_menu(dataset)

if __name__ == "__main__":
    main()

