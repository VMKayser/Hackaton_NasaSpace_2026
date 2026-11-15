const fs = require('fs');
const html = fs.readFileSync('ensayo_marte_luna.html', 'utf8');
const lines = html.split('\n');
let count = 0;
lines.forEach((l, idx) => {
  if (l.includes('"country": "Global"')) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
    count++;
  }
});
console.log('Total occurrences of "country": "Global" in ensayo_marte_luna.html:', count);
