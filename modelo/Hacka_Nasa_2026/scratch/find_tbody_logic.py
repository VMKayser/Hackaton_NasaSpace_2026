with open('ensayo.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('audit-table-body')
idx2 = text.find('audit-table-body', idx+20)
print(text[idx2:idx2+1500])
