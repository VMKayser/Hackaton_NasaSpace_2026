with open('ensayo.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="comparison-table-section"')
print(text[idx-200:idx+400])
