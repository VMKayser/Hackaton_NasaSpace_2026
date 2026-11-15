import { useEffect } from 'react'
import type { Site, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { BodyChip } from './ui'

interface Props {
  site: Site
  target: Target
  onClose: () => void
}

interface AdaptationSection {
  id: string
  title: string
  icon: string
  items: string[]
}

function getAdaptationPlan(site: Site, target: Target, lang: 'es' | 'en'): AdaptationSection[] {
  const isMoon = target.body === 'moon'
  const targetBodyName = isMoon ? (lang === 'es' ? 'la Luna' : 'the Moon') : (lang === 'es' ? 'Marte' : 'Mars')
  const geo = (site.type?.en ?? '').toLowerCase()
  const isSalt = geo.includes('salt') || geo.includes('evaporite')
  const isVolcanic = geo.includes('volcanic') || geo.includes('basalt')
  const isDesert = geo.includes('desert') || geo.includes('arid')
  const isCave = site.id.includes('umajalanta') || geo.includes('karst')
  const isIce = geo.includes('glacial') || geo.includes('mountain') || site.id.includes('sajama')

  if (lang === 'es') {
    return [
      {
        id: 'equipment',
        title: 'Dispositivos y Equipamiento de Simulación',
        icon: '⚙️',
        items: [
          isMoon
            ? 'Arnés o grúa de desgravitación (Gravity-Offload Rig): Utilizar un sistema de poleas elásticas o contrapesos continuos que reduzca el 83 % del peso de rovers o trajes simulados, emulando la gravedad lunar (0.17g) y evitando falsas estimaciones de tracción.'
            : 'Sistema de compensación de gravedad marciana (0.38g): Emplear suspensión con resortes de rigidez variable o lastres reducidos para emular el 38 % de peso sobre el chasis y la suspensión rocker-bogie.',
          'Simulador de retardo en telecomunicaciones (Mission Comms Latency): Programar un retardo intencional en los comandos de telemetría de ' +
            (isMoon ? '2.5 a 3.0 segundos (ida y vuelta Luna)' : '5 a 20 minutos (ida y vuelta Marte)') +
            ' para forzar a los rovers y robots a operar con navegación y evasión de obstáculos autónoma.',
          isMoon
            ? 'Proyectores colimados de luz rasante de alto contraste: Ensayar sensores ópticos y cámaras estéreo con iluminación LED horizontal (<2° de elevación) para replicar las sombras profundas y deslumbramientos característicos del terreno polar lunar.'
            : 'Filtros de espectro solar atenuado y difusión difusa: Emular la radiación solar marciana (~43 % de la terrestre al nivel del mar) y la dispersión por polvo atmosférico en suspensión.',
          'Campana portátil de vacío / atmósfera controlada: Probar espectrómetros Raman y sensores ópticos dentro de cámaras selladas con purga de ' +
            (isMoon ? 'vacío preliminar (<0.01 kPa)' : 'gas CO2 a baja presión (~0.6 a 0.8 kPa)') +
            ' para eliminar la interferencia de la humedad y el 21 % de O2 terrestre.',
        ],
      },
      {
        id: 'materials',
        title: 'Materiales y Simulantes de Terreno',
        icon: '🧪',
        items: [
          isMoon
            ? 'Adición de simulante de regolito lunar (LHS-1 / JSC-1A): Esparcir parcelas de prueba con partículas de anortosita triturada de aristas vivas y microscópicas sin pulir para evaluar la abrasión extrema en rodamientos, sellos rotatorios y trajes espaciales.'
            : 'Incorporación de simulante de suelo marciano (MMS-1 / JSC Mars-1): Dispersar polvo basáltico rico en óxidos de hierro (hematita/magnetita) y arcillas esmectitas para someter a los trenes de rodaje al desgaste por polvo electrostático marciano.',
          isSalt
            ? 'Protección aislante contra salmuera activa: Como los paleolagos de ' + targetBodyName + ' están completamente secos, colocar lonas geotextiles impermeables o capas de grava basáltica seca sobre el salar para evitar que la humedad terrestre moje los neumáticos y altere las mediciones de dureza.'
            : isDesert
            ? 'Acondicionamiento de dunas y arena eólica: Nivelar pendientes eólicas con simulante fino para ensayar la detección de deslizamiento y tracción de ruedas rígidas con ranuras (grousers).'
            : 'Homogeneización granulométrica: Mezclar arenas finas con cenizas volcánicas secas para replicar la densidad aparente y la cohesión mecánica del regolito de ' + target.name + '.',
          isMoon
            ? 'Blindaje contra estática y polvo lunar vítreo: Tratar las cubiertas de paneles y visores con recubrimientos transparentes electrodinámicos repelentes de polvo para ensayar sistemas de mitigación de regolito.'
            : 'Dopado químico controlado para sensores (en laboratorio de campo): Ensayar detectores de biofirmas y geoquímica dopando muestras de suelo con sales de sulfato férrico anhidras y trazas de percloratos (0.5 %) en condiciones cerradas seguras.',
        ],
      },
      {
        id: 'tools',
        title: 'Herramientas de Muestreo e Intervención',
        icon: '🛠️',
        items: [
          'Taladro rotopercutor con brocas huecas de carburo de tungsteno: Probar extracción de testigos cilíndricos sin agua (coring en seco) para evitar la alteración térmica o de fluidos en los minerales.',
          'Herramienta de abrasión de roca (tipo RAT / Perseverance GDM): Desbastar mecánicamente 2 a 5 mm de la corteza exterior meteorizada por el aire terrestre para exponer la roca ígnea o evaporítica prístina subyacente.',
          'Tubos y contenedores herméticos de titanio ultra-limpio: Emular los protocolos de almacenamiento y preservación de muestras (Sample Return) con sellado hermético al vacío o gas inerte antes del análisis.',
          isIce
            ? 'Sondas criogénicas de perforación térmica: Utilizar calentadores de resistencia eléctrica para fundir y muestrear hielo subsuperficial simulando la extracción de volátiles ISRU.'
            : 'Pilas y pinzas de muestreo estéril con recubrimiento de teflón: Garantizar una barrera de biocontaminación para descartar ADN/bacterias terrestres en los sensores de vida.',
        ],
      },
      {
        id: 'site-adaptation',
        title: 'Adaptación del Entorno Local y Pruebas',
        icon: '📐',
        items: [
          'Configuración de campo de rocas de Golombek: Redistribuir bloques rocosos locales para que la densidad y tamaño de obstáculos (10 cm a 45 cm) sigan la distribución estadística exponencial observada en los sitios de descenso de ' + targetBodyName + '.',
          isVolcanic
            ? 'Circuitos sobre escoria y bombas volcánicas: Aprovechar la matriz volcánica local para calibrar la suspensión balancín-bogíe y la evasión de zancadas en terreno basáltico rugoso.'
            : isCave
            ? 'Aislamiento de luz y balizamiento en cueva: Operar en tramos de oscuridad absoluta con reflectores ultravioleta y balizas inalámbricas en malla para simular la exploración de tubos de lava de ' + target.name + '.'
            : 'Zonas de trampa de arena blanda: Excavar y rellenar trincheras con ceniza volcánica seca sin compactar para poner a prueba algoritmos de tracción antideslizamiento y rescate de atascos.',
          'Puntos de control geodésico y LiDAR terrestre: Emplazar dianas de calibración reflectantes en el terreno para contrastar en tiempo real la odometría de los vehículos con las mediciones satelitales orbitales.',
        ],
      },
    ]
  }

  return [
    {
      id: 'equipment',
      title: 'Simulation Devices & Hardware',
      icon: '⚙️',
      items: [
        isMoon
          ? 'Gravity-offload rig: Use counterweight pulleys or elastic harnesses to shed 83% of rover/suit mass, replicating 0.17g lunar gravity and preventing false traction readings.'
          : 'Martian gravity compensator (0.38g): Employ active suspension offloading to simulate 38% chassis weight on rocker-bogie mechanisms.',
        'Comms latency simulator: Introduce an intentional round-trip signal delay of ' +
          (isMoon ? '2.5 to 3.0 seconds (Moon)' : '5 to 20 minutes (Mars)') +
          ' to mandate autonomous navigation and obstacle avoidance.',
        isMoon
          ? 'Collimated low-angle floodlights: Test optical cameras with horizontal illumination (<2° elevation) to mimic harsh polar lunar shadows.'
          : 'Attenuated solar spectrum filters: Simulate Martian solar irradiance (~43% of Earth) and atmospheric dust scattering.',
        'Portable environmental chamber: Test spectrometers inside sealed chambers purged with ' +
          (isMoon ? 'vacuum (<0.01 kPa)' : 'low-pressure CO2 (~0.6 to 0.8 kPa)') +
          ' to eliminate terrestrial O2 and moisture interference.',
      ],
    },
    {
      id: 'materials',
      title: 'Terrain Simulants & Materials',
      icon: '🧪',
      items: [
        isMoon
          ? 'Lunar regolith simulant (LHS-1 / JSC-1A): Layer unweathered, razor-sharp crushed anorthosite on test beds to evaluate abrasive wear on wheel seals and bearings.'
          : 'Martian soil simulant (MMS-1): Distribute iron-rich basaltic dust and smectite clay to test electrostatic dust cling and wheel seal longevity.',
        isSalt
          ? 'Dry barrier installation: Because ' + targetBodyName + ' evaporites are completely desiccated, place geotextile membranes over active brines to prevent wheel wetting.'
          : isDesert
          ? 'Eolian sand dune conditioning: Grade sand drifts with fine simulant to benchmark wheel grouser traction and sinkage detection.'
          : 'Grain size sorting: Blend volcanic ash with fine sand to match ' + target.name + ' bulk regolith density and mechanical cohesion.',
        isMoon
          ? 'Electrodynamic dust shields: Coat solar panels and sensors with active electrostatic dust repellent coatings.'
          : 'Controlled chemical doping: Test biosignature detection assays on samples doped with anhydrous iron sulfates and 0.5% perchlorate salts in sealed trays.',
      ],
    },
    {
      id: 'tools',
      title: 'Sampling & Field Tools',
      icon: '🛠️',
      items: [
        'Dry rotary-percussive coring drill: Extract cylindrical core samples without lubricating water to avoid thermal or fluid mineral alteration.',
        'Rock Abrasion Tool (RAT): Mechanically grind away 2-5 mm of weathered terrestrial rock crust to access pristine unweathered minerals beneath.',
        'Ultra-clean titanium sample tubes: Rehearse aseptic sample acquisition and hermetic sealing protocols (Mars/Moon Sample Return).',
        isIce
          ? 'Thermal ice-melt probes: Test resistance heaters for melting and sampling subsurface ice to rehearse ISRU volatile extraction.'
          : 'Teflon-coated sampling scoops: Ensure an ultraclean barrier against terrestrial organic and bacterial cross-contamination.',
      ],
    },
    {
      id: 'site-adaptation',
      title: 'Local Environment Adaptation',
      icon: '📐',
      items: [
        'Golombek rock distribution: Arrange local boulders so that obstacle frequencies match exponential distributions surveyed at ' + targetBodyName + ' landing sites.',
        isVolcanic
          ? 'Basaltic bomb and scoria obstacle courses: Exploit local volcanic terrain to stress-test rocker-bogie articulation and hazard avoidance over sharp lava blocks.'
          : isCave
          ? 'Darkness and wireless mesh beacons: Operate in complete subterranean darkness using UV trackers and mesh radios to simulate lava tube missions.'
          : 'Soft sand entrapment trenches: Prepare loose, uncompacted ash pits to test wheel slip detection and rover extrication maneuvers.',
        'Ground-truth calibration targets: Deploy survey markers across the terrain to benchmark rover visual odometry against orbital DEM data.',
      ],
    },
  ]
}

export function AdaptationModal({ site, target, onClose }: Props) {
  const { lang } = useI18n()
  const isEs = lang === 'es'
  const sections = getAdaptationPlan(site, target, isEs ? 'es' : 'en')

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adaptation-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/20 bg-[#0d1626] text-white shadow-2xl">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between border-b border-white/15 bg-space/90 px-5 py-4">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                {isEs ? 'Guía de Adaptación Técnica' : 'Technical Adaptation Guide'}
              </span>
              <BodyChip body={target.body} />
            </div>
            <h2 id="adaptation-title" className="mt-1.5 font-serif text-lg font-bold sm:text-xl text-white leading-tight">
              {isEs ? 'Cómo adaptar' : 'How to adapt'} <span className="text-amber-300">{site.name}</span> {isEs ? 'para simular' : 'to simulate'} <span className="text-rust">{target.name}</span>
            </h2>
            <p className="mt-1 text-xs text-white/70">
              {isEs
                ? 'Recomendaciones de ingeniería, materiales, herramientas y dispositivos para maximizar la fidelidad física y operacional de este análogo terrestre.'
                : 'Engineering, materials, tools, and simulation recommendations to maximize physical and operational fidelity for this terrestrial analog.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEs ? 'Cerrar' : 'Close'}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Content body with custom scrollbar */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {sections.map((section) => (
            <section key={section.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <span className="text-base" aria-hidden="true">{section.icon}</span>
                <span>{section.title}</span>
              </h3>
              <ul className="mt-2.5 space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-white/85">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between border-t border-white/15 bg-space/90 px-5 py-3">
          <p className="text-[11px] text-white/60 font-mono">
            {site.name} ({site.lat.toFixed(2)}°, {site.lon.toFixed(2)}°) ➔ {target.name} ({target.body === 'moon' ? 'Luna' : 'Marte'})
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </footer>
      </div>
    </div>
  )
}
