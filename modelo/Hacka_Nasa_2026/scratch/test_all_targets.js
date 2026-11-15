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
    getElementById: (id) => ({ id, value: '', innerHTML: '', textContent: '', appendChild: () => {}, querySelectorAll: () => [], style: {}, scrollIntoView: () => {} }),
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
  console.log('=== TEST ALL MARS TARGETS (SAJAMA) ===');
  vm.runInContext("currentPlanetMode = 'mars'", context);
  await vm.runInContext("executePrediction(-18.11, -68.88, 20.0, 'volcan andesita')", context);
  let marsRanks = vm.runInContext("currentRankingList", context);
  console.log(`Total Mars targets evaluated: ${marsRanks.length}`);
  marsRanks.forEach((r, idx) => {
    console.log(`  ${idx+1}. ${r.target.name} -> PSI: ${r.sim.psi}% | Topo: ${r.sim.s_topo}% | Clima: ${r.sim.s_clim}% | Min: ${r.sim.s_min}%`);
  });

  console.log('\n=== TEST ALL MOON TARGETS (SAJAMA) ===');
  vm.runInContext("currentPlanetMode = 'moon'", context);
  await vm.runInContext("executePrediction(-18.11, -68.88, 20.0, 'volcan andesita')", context);
  let moonRanks = vm.runInContext("currentRankingList", context);
  console.log(`Total Moon targets evaluated: ${moonRanks.length}`);
  moonRanks.forEach((r, idx) => {
    console.log(`  ${idx+1}. ${r.target.name} -> PSI: ${r.sim.psi}% | Topo: ${r.sim.s_topo}% | Clima: ${r.sim.s_clim}% | Min: ${r.sim.s_min}%`);
  });

  console.log('\n=== TEST AUDIT TABLE ROW FOR MALAPERT MASSIF ===');
  vm.runInContext("selectTargetDestination('malapert_massif_site23')", context);
  const target = vm.runInContext("currentTargetSite", context);
  console.log(`Current Target Selected: ${target.name} (${target.id})`);

  console.log('\n=== TEST AUDIT TABLE ROW FOR UTOPIA PLANITIA VL2 ===');
  vm.runInContext("switchPlanetTarget('mars')", context);
  vm.runInContext("selectTargetDestination('utopia_planitia_vl2')", context);
  const targetUtopia = vm.runInContext("currentTargetSite", context);
  console.log(`Current Target Selected: ${targetUtopia.name} (${targetUtopia.id})`);
})();
