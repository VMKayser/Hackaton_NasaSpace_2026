with open('ensayo.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="presets-container"')
print(text[idx:idx+1200])
