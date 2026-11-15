with open('ensayo.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const tableRowsData = [')
print(text[idx+6500:idx+8500])
