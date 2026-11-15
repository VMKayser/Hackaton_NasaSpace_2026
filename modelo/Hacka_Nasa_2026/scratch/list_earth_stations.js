const fs = require('fs');
const stations = JSON.parse(fs.readFileSync('data/stations.json', 'utf8'));
const earth = stations.filter(s => s.body === 'earth');
earth.forEach((s, idx) => {
  console.log((idx+1) + '. ' + s.name + ' -> Country: ' + s.country + ' | Region: ' + s.region);
});
