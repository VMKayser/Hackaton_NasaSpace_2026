// Inglés: idioma por defecto y fuente de las claves. es.ts debe tener exactamente las mismas.
export const en = {
  'app.tagline': 'Earth analogs for planetary exploration',
  'lang.label': 'Language',
  'home.label': 'Back to start',

  'demo.title': 'Demo data',
  'demo.body': 'Scores and measurements are illustrative placeholders, not results.',

  'picker.kicker': 'Find an analog',
  'picker.title': 'What do you want to study or rehearse?',
  'picker.lead':
    'Choose a purpose. Galaxy Match ranks places on Earth by how closely their measured conditions match a site on another world, and shows where the analogy breaks down.',
  'picker.phenomenon': 'Study a phenomenon',
  'picker.task': 'Rehearse a task',
  'picker.targets': 'Or compare directly with a target site',
  'picker.noPurposes': 'Choose a target site',
  'picker.stats': '{sites} places on Earth · {targets} target sites · {dims} dimensions',

  'kind.phenomenon': 'Phenomenon',
  'kind.task': 'Task',

  'nav.changePurpose': 'Change purpose',
  'nav.backToRanking': 'Back to ranking',

  'target.label': 'Target site',
  'target.comparing': 'Compared with',

  'ranking.title': 'Best places on Earth',
  'ranking.byPurpose': 'Ordered by fit for this purpose',
  'ranking.bySimilarity': 'Ordered by overall similarity',
  'ranking.count': '{n} of {total} sites evaluated',
  'ranking.strongest': 'Strongest',
  'ranking.weakest': 'weakest',

  'badge.candidate': 'Candidate',
  'badge.known': 'Known analog',
  'badge.reference': 'Reference',
  'badge.control': 'Negative control',
  'badge.notEvaluated': 'Not evaluated',

  'detail.rank': 'Rank {rank} of {total}',
  'detail.purposeScore': 'Fit for this purpose',
  'detail.similarity': 'Overall similarity',
  'detail.notEvaluated': 'This site has no score for this target.',
  'detail.dimsScored': '{n} of {total} dimensions with data',
  'detail.about': 'About this site',
  'detail.evidence': 'Measured side by side',
  'detail.evidenceLead': 'Each score compares the same indicator on Earth and at the target, with its sources.',
  'detail.limits': 'Where the analogy breaks down',
  'detail.exploration': 'What can be tested here',
  'detail.radius': 'Area analysed: {km} km radius',
  'detail.share': 'Copy link',
  'detail.copied': 'Link copied',

  'table.dimension': 'Dimension',
  'table.earth': 'Earth',
  'table.score': 'Score',
  'table.counted': 'Counted in this score',
  'table.context': 'Context only: not counted in the total',
  'table.weight': 'weight {pct}%',

  'text.pending': 'Text pending',
  'value.noData': 'No data',

  'limits.general.mars':
    'No place on Earth reproduces Mars’ gravity (38% of Earth’s), its thin carbon-dioxide atmosphere (under 1% of Earth’s surface pressure) or its surface radiation.',
  'limits.general.moon':
    'No place on Earth reproduces the Moon’s gravity (17% of Earth’s), its vacuum, its two-week days and nights or its surface radiation.',

  'body.mars': 'Mars',
  'body.moon': 'Moon',
  'body.earth': 'Earth',

  'map.label': 'Map of candidate sites',
  'map.globe': 'Globe',
  'map.relief': 'Relief',
  'map.view': 'Map view',
  'map.noWebgl': 'This browser cannot display the map (WebGL 2 is required). The ranking and site details still work.',

  'legend.title': 'Legend',
  'legend.score': 'Match score',

  'loading': 'Loading data…',
  'error.title': 'The data could not be loaded',
  'error.file': 'Problem in {file}:',

  'footer.event': 'NASA Space Apps Challenge 2026',
  'footer.data': 'Data v{version} · generated {date}',
  'footer.code': 'Source code',
} as const
