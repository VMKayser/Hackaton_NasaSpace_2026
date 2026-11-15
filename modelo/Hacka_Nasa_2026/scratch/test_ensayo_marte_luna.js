const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('ensayo_marte_luna.html', 'utf8');

const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const inlineScript = scriptMatches.find(m => m[1].trim().length > 100);
if (!inlineScript) {
  console.error("No script tag found!");
  process.exit(1);
}
const scriptCode = inlineScript[1];

// DOM Mock
const elements = {};
function getEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerHTML: '',
      innerText: '',
      value: '',
      style: {},
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); }
      },
      children: [],
      appendChild: function(child) { 
        this.children.push(child);
        this.innerHTML += child.innerHTML || '';
      },
      addEventListener: function() { },
      scrollIntoView: function() { },
      querySelectorAll: function() { return []; },
      querySelector: function() { return null; }
    };
  }
  return elements[id];
}

const sandbox = {
  console,
  window: {
    addEventListener: () => {}
  },
  document: {
    getElementById: getEl,
    createElement: (tag) => {
      return {
        tagName: tag,
        innerHTML: '',
        style: {},
        classList: {
          add: () => {},
          remove: () => {}
        },
        children: [],
        appendChild: function(c) {
          this.children.push(c);
          this.innerHTML += c.innerHTML || '';
        },
        addEventListener: () => {}
      };
    },
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  Math
};

vm.createContext(sandbox);
const appendExpose = `
this.ALL_STATIONS = ALL_STATIONS;
this.EARTH_STATIONS = EARTH_STATIONS;
this.MARS_TARGETS = MARS_TARGETS;
this.MOON_TARGETS = MOON_TARGETS;
this.executeInverseSearch = executeInverseSearch;
this.switchDimensionCriterion = switchDimensionCriterion;
this.switchBodyTarget = switchBodyTarget;
this.selectPlanetaryTarget = selectPlanetaryTarget;
this.selectEarthSiteFromTable = selectEarthSiteFromTable;
this.calculatePlanetaryAnalogSimilarity = calculatePlanetaryAnalogSimilarity;
this.getCurrentEarthRanking = () => currentEarthRanking;
this.getCurrentSelectedEarthSite = () => currentSelectedEarthSite;
this.getCurrentTarget = () => currentTarget;
`;

vm.runInContext(scriptCode + appendExpose, sandbox);

console.log("ALL_STATIONS:", sandbox.ALL_STATIONS.length);
console.log("EARTH_STATIONS:", sandbox.EARTH_STATIONS.length);
console.log("MARS_TARGETS:", sandbox.MARS_TARGETS.length);
console.log("MOON_TARGETS:", sandbox.MOON_TARGETS.length);

// Verify targets
console.log("\nMars Targets:");
sandbox.MARS_TARGETS.forEach(t => console.log(`  - ${t.id}: ${t.name}`));

console.log("\nMoon Targets:");
sandbox.MOON_TARGETS.forEach(t => console.log(`  - ${t.id}: ${t.name}`));

// Test execution for Mars: Jezero Crater
console.log("\n=================== TEST MARS: jezero-crater ===================");
sandbox.switchBodyTarget('mars');
sandbox.selectPlanetaryTarget('jezero-crater');

let ranked = sandbox.getCurrentEarthRanking();
console.log("Ranked Earth Analogs Count:", ranked.length);
console.log("Selected Earth Analog:", sandbox.getCurrentSelectedEarthSite() ? sandbox.getCurrentSelectedEarthSite().name : "None");

// Check Top 10 Earth Analogs
console.log("\nTop 10 Earth Analogs for Jezero Crater (Global PSI):");
ranked.slice(0, 10).forEach((item, idx) => {
  const s = item.station;
  const sim = item.sim;
  console.log(`  #${idx+1}: ${s.name} (${s.country}) | PSI: ${sim.psi}% | Topo: ${sim.s_topo}% | Clim: ${sim.s_clim}% | Min: ${sim.s_min}% | Elev: ${s.elevation}m`);
  if (isNaN(sim.psi) || isNaN(sim.s_topo) || isNaN(sim.s_clim) || isNaN(sim.s_min)) {
    throw new Error(`NaN encountered in Jezero Crater analog #${idx+1}`);
  }
});

// Test Dimension Switching
console.log("\nTesting Dimension Switch -> Topo:");
sandbox.switchDimensionCriterion('topo');
ranked = sandbox.getCurrentEarthRanking();
console.log("Top 3 Topo matches:");
ranked.slice(0, 3).forEach((item, idx) => {
  console.log(`  #${idx+1}: ${item.station.name} -> S_topo: ${item.sim.s_topo}% (PSI: ${item.sim.psi}%)`);
});

console.log("\nTesting Dimension Switch -> Clim:");
sandbox.switchDimensionCriterion('clim');
ranked = sandbox.getCurrentEarthRanking();
console.log("Top 3 Clim matches:");
ranked.slice(0, 3).forEach((item, idx) => {
  console.log(`  #${idx+1}: ${item.station.name} -> S_clim: ${item.sim.s_clim}% (PSI: ${item.sim.psi}%)`);
});

console.log("\nTesting Dimension Switch -> Min:");
sandbox.switchDimensionCriterion('min');
ranked = sandbox.getCurrentEarthRanking();
console.log("Top 3 Min matches:");
ranked.slice(0, 3).forEach((item, idx) => {
  console.log(`  #${idx+1}: ${item.station.name} -> S_min: ${item.sim.s_min}% (PSI: ${item.sim.psi}%)`);
});

// Test Moon Target: Mons Mouton Plateau / Shackleton
console.log("\n=================== TEST MOON: mons-mouton-plateau ===================");
sandbox.switchBodyTarget('moon');
sandbox.selectPlanetaryTarget('mons-mouton-plateau');

ranked = sandbox.getCurrentEarthRanking();
console.log("Ranked Earth Analogs Count for Mons Mouton:", ranked.length);
console.log("Top 5 Earth Analogs for Mons Mouton (Global):");
ranked.slice(0, 5).forEach((item, idx) => {
  const s = item.station;
  const sim = item.sim;
  console.log(`  #${idx+1}: ${s.name} (${s.country}) | PSI: ${sim.psi}% | Topo: ${sim.s_topo}% | Clim: ${sim.s_clim}% | Min: ${sim.s_min}%`);
  if (isNaN(sim.psi) || isNaN(sim.s_topo) || isNaN(sim.s_clim) || isNaN(sim.s_min)) {
    throw new Error(`NaN encountered in Mons Mouton analog #${idx+1}`);
  }
});

// Test Gerlache Rim 2
console.log("\n=================== TEST MOON: de-gerlache-rim-2 ===================");
sandbox.selectPlanetaryTarget('de-gerlache-rim-2');

ranked = sandbox.getCurrentEarthRanking();
console.log("Ranked Earth Analogs Count for Gerlache Rim 2:", ranked.length);
console.log("Top 5 Earth Analogs for Gerlache Rim 2 (Global):");
ranked.slice(0, 5).forEach((item, idx) => {
  const s = item.station;
  const sim = item.sim;
  console.log(`  #${idx+1}: ${s.name} (${s.country}) | PSI: ${sim.psi}% | Topo: ${sim.s_topo}% | Clim: ${sim.s_clim}% | Min: ${sim.s_min}%`);
});

// Verify audit table side-by-side execution
console.log("\n--- Testing Side-by-Side Audit rendering ---");
sandbox.selectEarthSiteFromTable('salar-de-uyuni');
console.log("Selected earth analog:", sandbox.getCurrentSelectedEarthSite().name);
console.log("Side-by-side audit container innerHTML length:", elements['side-by-side-tbody'].innerHTML.length);
if (elements['side-by-side-tbody'].innerHTML.includes('NaN')) {
  throw new Error("Side-by-side audit table contains NaN!");
}
console.log("Side-by-side table rendered cleanly without NaN!");

console.log("\nALL INVERSE ENGINE TESTS PASSED! 🚀");
