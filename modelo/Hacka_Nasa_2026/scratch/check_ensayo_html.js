const fs = require('fs');
const html = fs.readFileSync('ensayo.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('"country": "Global"')) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});
