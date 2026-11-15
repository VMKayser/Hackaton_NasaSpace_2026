const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('ensayo.html', 'utf8');
const demJs = fs.readFileSync('data/dem/bolivia_dem_embedded.js', 'utf8');

const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
let mainScript = '';
for (let sc of scriptMatch) {
  if (sc.includes('CENTRALIZED_STATIONS')) {
    mainScript = sc.replace(/<\/?script.*?>/gi, '');
    break;
  }
}

const context = {
  window: { addEventListener: () => {} },
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({ id, value: '', innerHTML: '', textContent: '', appendChild: () => {}, querySelectorAll: () => [], style: {} }),
    createElement: () => ({ className: '', innerHTML: '', onclick: null, style: {} })
  },
  console: console,
  Math: Math,
  parseFloat: parseFloat,
  parseInt: parseInt,
  isNaN: isNaN,
  Boolean: Boolean,
  Number: Number,
  String: String,
  Array: Array,
  Object: Object,
  Buffer: Buffer,
  Uint8Array: Uint8Array,
  Int16Array: Int16Array,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  fetch: async () => ({ ok: false })
};
context.window = Object.assign(context.window, context);
context.global = context;

vm.createContext(context);
vm.runInContext(demJs, context);
vm.runInContext(mainScript, context);

(async () => {
  console.log('=== TEST SAJAMA (MARTE) EN ENSAYO.HTML ===');
  await vm.runInContext("executePrediction(-18.11, -68.88, 20.0, 'volcan andesita')", context);
  let ranks = vm.runInContext("currentRankingList", context);
  for (let i = 0; i < 3; i++) {
    const r = ranks[i];
    console.log(`${i+1}. ${r.target.name} (${r.target.body}) -> PSI: ${r.sim.psi}% | Topo: ${r.sim.s_topo}% | Clima: ${r.sim.s_clim}% | Min: ${r.sim.s_min}%`);
  }

  console.log('\n=== TEST SAJAMA (LUNA) EN ENSAYO.HTML ===');
  vm.runInContext("currentPlanetMode = 'moon'", context);
  await vm.runInContext("executePrediction(-18.11, -68.88, 20.0, 'volcan andesita')", context);
  ranks = vm.runInContext("currentRankingList", context);
  for (let i = 0; i < 3; i++) {
    const r = ranks[i];
    console.log(`${i+1}. ${r.target.name} (${r.target.body}) -> PSI: ${r.sim.psi}% | Topo: ${r.sim.s_topo}% | Clima: ${r.sim.s_clim}% | Min: ${r.sim.s_min}%`);
  }

  console.log('\n=== TEST SALAR DE UYUNI (MARTE) EN ENSAYO.HTML ===');
  vm.runInContext("currentPlanetMode = 'mars'", context);
  await vm.runInContext("executePrediction(-20.13, -67.49, 50.0, 'salar')", context);
  ranks = vm.runInContext("currentRankingList", context);
  for (let i = 0; i < 3; i++) {
    const r = ranks[i];
    console.log(`${i+1}. ${r.target.name} (${r.target.body}) -> PSI: ${r.sim.psi}% | Topo: ${r.sim.s_topo}% | Clima: ${r.sim.s_clim}% | Min: ${r.sim.s_min}%`);
  }
})();
