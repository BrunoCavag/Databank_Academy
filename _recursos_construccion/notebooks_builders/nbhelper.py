import nbformat as nbf
from nbclient import NotebookClient
import os, textwrap

HEADER = """<div style="background:#0B2545;color:white;padding:18px 22px;border-radius:8px">
<div style="font-size:12px;letter-spacing:2px;opacity:.8">DATABANK ACADEMY · PROGRAMA EJECUTIVO EN GESTIÓN INTEGRAL DEL RIESGO DE CRÉDITO MINORISTA</div>
<div style="font-size:24px;font-weight:700;margin-top:6px">{title}</div>
<div style="font-size:14px;margin-top:4px;opacity:.9">{subtitle}</div>
</div>"""


def build(path, title, subtitle, cells, execute=True, cwd=None):
    nb = nbf.v4.new_notebook()
    nb.metadata["kernelspec"] = {"name": "python3", "display_name": "Python 3", "language": "python"}
    out = [nbf.v4.new_markdown_cell(HEADER.format(title=title, subtitle=subtitle))]
    for kind, src in cells:
        src = textwrap.dedent(src).strip("\n")
        out.append(nbf.v4.new_markdown_cell(src) if kind == "md" else nbf.v4.new_code_cell(src))
    nb.cells = out
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if execute:
        client = NotebookClient(nb, timeout=900, kernel_name="python3",
                                resources={"metadata": {"path": cwd or os.path.dirname(path)}})
        client.execute()
    nbf.write(nb, path)
    print("OK", path)

SETUP = """
import numpy as np, pandas as pd, matplotlib.pyplot as plt
from pathlib import Path
pd.set_option("display.float_format", lambda x: f"{x:,.4f}")
plt.rcParams.update({"figure.figsize": (10, 4.5), "axes.spines.top": False, "axes.spines.right": False,
                     "axes.grid": True, "grid.alpha": .3, "font.size": 11})
AZUL, ROJO, VERDE, GRIS, ORO = "#0B2545", "#C8102E", "#2E8B57", "#8D99AE", "#E0A100"
DATA = Path("../datos")
"""
