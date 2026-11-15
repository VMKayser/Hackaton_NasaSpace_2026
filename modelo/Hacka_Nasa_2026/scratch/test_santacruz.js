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
  await vm.runInContext("executePrediction(-17.935, -63.155, 30.0, '')", context);
  const sample = vm.runInContext("currentEarthSample", context);
  console.log('Earth sample deduced:', {
    elevation: sample.elevation,
    geology: sample.geology,
    geology_label: sample.geology_label,
    temp: sample.temp,
    precip: sample.precip,
    terrain: sample.terrain,
    relief: sample.relief
  });
  const ranks = vm.runInContext("currentRankingList", context);
  console.log('Top rank:', ranks[0].target.name, 'PSI:', ranks[0].sim.psi, 'Topo:', ranks[0].sim.s_topo, 'Clim:', ranks[0].sim.s_clim, 'Min:', ranks[0].sim.s_min);
})();
