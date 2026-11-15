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
    getElementById: (id) => ({
      id,
      value: '',
      innerHTML: '',
      textContent: '',
      appendChild: () => {},
      querySelectorAll: () => [],
      classList: { add: () => {}, remove: () => {} },
      style: {},
      scrollIntoView: () => {}
    }),
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
  // Test 1: Santa Cruz (-17.935, -63.155)
  console.log("=== TEST SANTA CRUZ (-17.935, -63.155) ===");
  await vm.runInContext("executePrediction(-17.935, -63.155, 30.0, '')", context);
  
  // Test dimensions
  ['global', 'topo', 'clim', 'min'].forEach(dim => {
    vm.runInContext(`switchDimensionCriterion('${dim}')`, context);
    const ranks = vm.runInContext("currentRankingList", context);
    const top = ranks[0];
    console.log(`Dimensión: ${dim.toUpperCase()} -> Top 1: ${top.target.name} (${top.target.body}) | Score: Topo=${top.sim.s_topo}%, Clim=${top.sim.s_clim}%, Min=${top.sim.s_min}%, PSI=${top.sim.psi}%`);
  });

  // Test 2: Salar de Uyuni (-20.13, -67.49)
  console.log("\n=== TEST SALAR DE UYUNI (-20.13, -67.49) ===");
  await vm.runInContext("executePrediction(-20.13, -67.49, 50.0, 'salar')", context);
  ['global', 'topo', 'clim', 'min'].forEach(dim => {
    vm.runInContext(`switchDimensionCriterion('${dim}')`, context);
    const ranks = vm.runInContext("currentRankingList", context);
    const top = ranks[0];
    console.log(`Dimensión: ${dim.toUpperCase()} -> Top 1: ${top.target.name} (${top.target.body}) | Score: Topo=${top.sim.s_topo}%, Clim=${top.sim.s_clim}%, Min=${top.sim.s_min}%, PSI=${top.sim.psi}%`);
  });
})();
