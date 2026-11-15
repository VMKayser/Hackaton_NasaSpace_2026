import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
nb_path = BASE_DIR / "analogs_ml_pipeline.ipynb"

with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

print(f"Total cells in notebook: {len(nb['cells'])}")
code_cells = [c for c in nb['cells'] if c['cell_type'] == 'code']
print(f"Code cells count: {len(code_cells)}")

globals_dict = {"display": lambda x: print(x)}

for i, cell in enumerate(code_cells, 1):
    code_text = ''.join(cell['source'])
    try:
        exec(code_text, globals_dict)
        print(f"✔ Code cell {i}/{len(code_cells)} executed successfully.")
    except Exception as e:
        print(f"❌ Cell {i} failed with error: {e}")
        import traceback
        traceback.print_exc()
        raise e

print("\n🎉 ALL 12 CODE CELLS EXECUTED WITH ZERO ERRORS!")
