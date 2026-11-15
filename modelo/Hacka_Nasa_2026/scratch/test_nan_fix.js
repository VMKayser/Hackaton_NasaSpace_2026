const fs = require('fs');
const html = fs.readFileSync('ensayo.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('Script not found');

global.window = { addEventListener: () => {} };
global.document = {
  getElementById: (id) => ({
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    classList: { add: ()=>{}, remove: ()=>{} },
    appendChild: ()=>{}
  }),
  querySelectorAll: () => [],
  createElement: (tag) => ({
    className: '',
    style: {},
    innerHTML: '',
    appendChild: ()=>{},
    addEventListener: ()=>{}
  })
};

let code = scriptMatch[1];
code = code.replace(/let currentEarthSample/g, 'global.currentEarthSample');
code = code.replace(/let currentRankingList/g, 'global.currentRankingList');
eval(code);

async function runScreenshotTest() {
  console.log('=== RUNNING TEST: LAT -25.12, LON -68.38, AREA 45 ===');
  await executePrediction(-25.12, -68.38, 45, '');
  console.log('Earth Sample Inferred:');
  console.log('  Geology:', global.currentEarthSample.geology_label);
  console.log('  Elevation:', global.currentEarthSample.elevation, 'msnm');
  console.log('  Atm Pressure:', global.currentEarthSample.atm_pressure, 'kPa');
  console.log('  Terrain Slope:', global.currentEarthSample.terrain, 'deg');
  console.log('  Relieve:', global.currentEarthSample.relief, 'm');
  console.log('  Roughness:', global.currentEarthSample.roughness);
  console.log('  Temp:', global.currentEarthSample.temp, 'C');
  console.log('  Temp Swing:', global.currentEarthSample.temp_swing, 'C');
  console.log('  Precip:', global.currentEarthSample.precip, 'mm/yr');
  console.log('  UVI:', global.currentEarthSample.uv_index);
  console.log('  Solar Flux:', global.currentEarthSample.solar_flux, 'MJ/m2');

  console.log('\nRanking List for Mars:');
  for (const r of global.currentRankingList) {
    console.log(r.target.name.padEnd(45), '| PSI:', (r.sim.psi + '%').padStart(6), '| Topo:', (r.sim.s_topo + '%').padStart(6), '| Clima:', (r.sim.s_clim + '%').padStart(6), '| Min:', (r.sim.s_min + '%').padStart(6));
  }
}

runScreenshotTest();
