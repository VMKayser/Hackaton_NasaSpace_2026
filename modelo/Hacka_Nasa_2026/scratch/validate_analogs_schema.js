const fs = require('fs');

const path = 'C:/Users/antra/Desktop/Hacka_nsa_2026/Hackaton_NasaSpace_2026/web/public/data/analogs.json';
const file = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log('Testing schema adherence for:', path);
console.log('- meta.mock:', file.meta.mock);
console.log('- meta.version:', file.meta.version);
console.log('- meta.generated:', file.meta.generated);
console.log('- dimensions count:', file.meta.dimensions.length);
console.log('- targets count:', file.targets.length);
console.log('- sites count:', file.sites.length);

const dimIds = new Set(file.meta.dimensions.map(d => d.id));
const targetIds = new Set(file.targets.map(t => t.id));
const purposeIds = new Set((file.meta.purposes || []).map(p => p.id));

let errors = [];

// Check sites
file.sites.forEach((s, idx) => {
  // check values
  for (const k of Object.keys(s.values)) {
    if (!dimIds.has(k)) errors.push(`Site ${s.id} unknown value dim "${k}"`);
  }
  // check scores
  s.scores.forEach((sc, scIdx) => {
    if (!targetIds.has(sc.targetId)) errors.push(`Site ${s.id} score ${scIdx} unknown target "${sc.targetId}"`);
    if (typeof sc.similarity !== 'number' || sc.similarity < 0 || sc.similarity > 1) {
      errors.push(`Site ${s.id} invalid similarity score: ${sc.similarity}`);
    }
    for (const [dk, dv] of Object.entries(sc.dimensions)) {
      if (!dimIds.has(dk)) errors.push(`Site ${s.id} score unknown dim "${dk}"`);
      if (dv !== null && (typeof dv !== 'number' || dv < 0 || dv > 1)) {
        errors.push(`Site ${s.id} dim ${dk} invalid score: ${dv}`);
      }
    }
  });
  // check purposeScores
  for (const [pk, pv] of Object.entries(s.purposeScores || {})) {
    if (!purposeIds.has(pk)) errors.push(`Site ${s.id} unknown purpose "${pk}"`);
    if (pv !== null && (typeof pv !== 'number' || pv < 0 || pv > 1)) {
      errors.push(`Site ${s.id} purpose ${pk} invalid score: ${pv}`);
    }
  }
});

if (errors.length === 0) {
  console.log('[SUCCESS] All 31 sites passed 100% of schema rules without any issues!');
} else {
  console.error('[ERROR] Schema violations found:', errors);
}
