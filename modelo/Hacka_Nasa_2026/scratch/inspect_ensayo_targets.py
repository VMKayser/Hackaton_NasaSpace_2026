import re

with open('ensayo.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('const PLANETARY_TARGETS_DATA =')
end = text.find('];', start) + 2
block = text[start:end]

matches = re.findall(r"id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*body:\s*['\"]([^'\"]+)['\"]", block)
print(f"Total targets in PLANETARY_TARGETS_DATA: {len(matches)}")
for m in matches:
    print(f"  - {m[0]}: {m[1]} ({m[2]})")
