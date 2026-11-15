const fs = require('fs');
let html = fs.readFileSync('ensayo.html', 'utf8');

const mapCountries = {
  'mcmurdo-antarctica': 'Antártida',
  'askja-iceland': 'Islandia',
  'haughton-canada': 'Canadá',
  'rio-tinto-spain': 'España',
  'sahara-algeria': 'Argelia',
  'amazon-manaus': 'Brasil',
  'siberia-yakutsk': 'Rusia',
  'himalaya-everest': 'Nepal',
  'mojave-death-valley': 'EE.UU.',
  'great-plains-kansas': 'EE.UU.'
};

for (const [id, country] of Object.entries(mapCountries)) {
  const target = `"id": "${id}",\n    "name":`;
  // find target and replace following "country": "Global"
  const idx = html.indexOf(target);
  if (idx !== -1) {
    const countryIdx = html.indexOf('"country": "Global"', idx);
    if (countryIdx !== -1 && countryIdx - idx < 200) {
      html = html.substring(0, countryIdx) + `"country": "${country}"` + html.substring(countryIdx + '"country": "Global"'.length);
      console.log(`Replaced ${id} -> ${country}`);
    }
  }
}

fs.writeFileSync('ensayo.html', html, 'utf8');
console.log("Sync complete for ensayo.html");
