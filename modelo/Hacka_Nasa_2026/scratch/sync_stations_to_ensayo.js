const fs = require('fs');
const stations = JSON.parse(fs.readFileSync('data/stations.json', 'utf8'));
let html = fs.readFileSync('ensayo.html', 'utf8');

// Replace CENTRALIZED_STATIONS array
const startTag = 'const CENTRALIZED_STATIONS = [';
const startIdx = html.indexOf(startTag);
if (startIdx === -1) {
  console.error("CENTRALIZED_STATIONS start not found!");
  process.exit(1);
}

const endTag = '];';
const endIdx = html.indexOf(endTag, startIdx);
if (endIdx === -1) {
  console.error("CENTRALIZED_STATIONS end not found!");
  process.exit(1);
}

const newStationsStr = 'const CENTRALIZED_STATIONS = ' + JSON.stringify(stations, null, 2);
html = html.substring(0, startIdx) + newStationsStr + html.substring(endIdx + 2);

fs.writeFileSync('ensayo.html', html, 'utf8');
console.log('Successfully updated CENTRALIZED_STATIONS in ensayo.html');
