with open('ensayo.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('addRow(')
if idx != -1:
    print(text[max(0, idx-50):idx+350])
else:
    print("addRow not found")
