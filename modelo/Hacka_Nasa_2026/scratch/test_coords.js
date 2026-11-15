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

const tableRows = [];
const context = {
  window: { addEventListener: () => {} },
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      id,
      value: '',
      innerHTML: '',
      textContent: '',
      appendChild: (elem) => { if (id === 'audit-table-body') tableRows.push(elem); },
      querySelectorAll: () => [],
      style: {}
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
  await vm.runInContext("executePrediction(-19.462, -67.426, 12, '')", context);
  const ranks = vm.runInContext("currentRankingList", context);
  console.log('Top rank:', ranks[0].target.name, ranks[0].sim.psi + '% PSI');
  console.log('Total table rows:', tableRows.length);
})();
