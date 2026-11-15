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

let tableRows = [];
const context = {
  window: { addEventListener: () => {} },
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      id,
      value: '',
      innerHTML: '',
      textContent: '',
      appendChild: (elem) => {
        if (id === 'audit-table-body') tableRows.push(elem);
      },
      querySelectorAll: () => [],
      style: {}
    }),
    createElement: (tag) => ({
      tag,
      className: '',
      innerHTML: '',
      onclick: null,
      style: {}
    })
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
  console.log('=== TEST: ISCHIGUALASTO VS CRÁTER GALE (MARTE) ===');
  tableRows = [];
  vm.runInContext("currentPlanetMode = 'mars'", context);
  await vm.runInContext("executePrediction(-30.01, -67.95, 120.0, 'arcillas rojas y oxidos de hierro')", context);
  vm.runInContext("selectTargetDestination('gale')", context);
  
  console.log('Filas de tabla generadas:', tableRows.length);
  for (let r of tableRows) {
    const raw = r.innerHTML.replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' ').trim();
    console.log(raw);
  }
})();

(async () => {
  console.log('\n=== TEST 2: ANTOFAGASTA DE LA SIERRA VS RIMA HADLEY (LUNA) ===');
  tableRows = [];
  vm.runInContext("currentPlanetMode = 'moon'", context);
  await vm.runInContext("executePrediction(-26.62, -67.50, 80.0, 'basalto volcanico')", context);
  vm.runInContext("selectTargetDestination('rima-hadley')", context);
  
  console.log('Filas de tabla:', tableRows.length);
  for (let r of tableRows) {
    if (r.innerHTML.includes('SUBTOTAL') || r.innerHTML.includes('ÍNDICE GLOBAL')) {
      const raw = r.innerHTML.replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' ').trim();
      console.log(raw);
    }
  }
})();
