"""Datos de gráficos nativos para los PPT del Módulo 3 (mismos cálculos que los notebooks)."""
import json, sys, warnings
warnings.filterwarnings("ignore")
import numpy as np, pandas as pd
from scipy.special import expit, logit
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, roc_curve
from optbinning import OptimalBinning, BinningProcess
from fastwoe import FastWoe

D, OUT = sys.argv[1], sys.argv[2]
J = {}
r4 = lambda v: [round(float(x), 4) for x in v]
app = pd.read_csv(f"{D}/hc_application_sintetico.csv").drop_duplicates()
app["EDAD"] = -app.DAYS_BIRTH / 365.25
app["RCI"] = app.AMT_ANNUITY / (app.AMT_INCOME_TOTAL / 12)
app["EXT2"] = app.EXT_SOURCE_2.fillna(app.EXT_SOURCE_2.median())
app["OCCUPATION_TYPE"] = app.OCCUPATION_TYPE.fillna("Sin dato")

# S1: logit empírico
for var, nb in [("EXT2", 15), ("EDAD", 12), ("RCI", 15)]:
    b = pd.qcut(app[var], nb, duplicates="drop")
    g = app.groupby(b, observed=True).agg(x=(var, "mean"), p=("TARGET", "mean"))
    J[f"m3s1_logit_{var}"] = {"labels": [f"{x:.2f}" if var != "EDAD" else f"{x:.0f}" for x in g.x], "values": r4(logit(g.p))}
# S1: Newton vs gradiente
Xm = np.column_stack([np.ones(len(app)), app.EXT2 * 10, app.EDAD, app.RCI]); y = app.TARGET.values
ref = sm.Logit(y, Xm).fit(disp=0)
beta = np.zeros(4); nr = []
for t in range(8):
    eta = Xm @ beta; p = expit(eta); nr.append(np.sum(y * eta - np.logaddexp(0, eta)))
    H = Xm.T @ (Xm * (p * (1 - p))[:, None]); beta = beta + np.linalg.solve(H, Xm.T @ (y - p))
Xs = (Xm - np.r_[0, Xm[:, 1:].mean(0)]) / np.r_[1, Xm[:, 1:].std(0)]; b = np.zeros(4); gd = []
for it in range(1, 3001):
    eta = Xs @ b; b += 0.5 * Xs.T @ (y - expit(eta)) / len(y)
    if it in (1, 2, 3, 5, 8, 10, 20, 50, 100, 200, 500, 1000, 2000, 3000): gd.append((it, ref.llf - np.sum(y * (Xs @ b) - np.logaddexp(0, Xs @ b))))
J["m3s1_nr"] = {"labels": [str(i + 1) for i in range(8)], "gap": [max(float(ref.llf - v), 1e-12) for v in nr]}
J["m3s1_gd"] = {"labels": [str(i) for i, _ in gd], "gap": [max(float(v), 1e-12) for _, v in gd]}

# S2: trayectoria L1 (pocas variables para legibilidad)
dev = app[app.FECHA_SOLICITUD < "2025-01"]
app_v = dev.assign(ANTIG=np.where(dev.DAYS_EMPLOYED == 365243, 0, -dev.DAYS_EMPLOYED / 365.25), PEN=(dev.DAYS_EMPLOYED == 365243).astype(int),
                   EXT3=dev.EXT_SOURCE_3.fillna(dev.EXT_SOURCE_3.median()), LOGCRED=np.log(dev.AMT_CREDIT), LOGBIEN=np.log(dev.AMT_GOODS_PRICE.fillna(dev.AMT_CREDIT)))
cols = ["EXT2", "EXT3", "EDAD", "RCI", "PEN", "ANTIG", "LOGCRED", "LOGBIEN"]
sub = app_v.sample(15000, random_state=1); Xs2 = StandardScaler().fit_transform(sub[cols])
Cs = np.logspace(-3.3, 0, 14)
path = np.array([LogisticRegression(C=C, penalty="l1", solver="saga", max_iter=5000).fit(Xs2, sub.TARGET).coef_[0] for C in Cs])
J["m3s2_l1"] = {"labels": [f"{np.log10(c):.1f}" for c in Cs], "series": {c: r4(path[:, j]) for j, c in enumerate(cols)}}

# S3: binning de EDAD y WoE con IC de la RCI
devm = app[app.FECHA_SOLICITUD < "2025-01"]
ob = OptimalBinning(name="EDAD", dtype="numerical", solver="cp", monotonic_trend="descending", min_bin_size=0.05).fit(devm.EDAD.values, devm.TARGET.values)
bt = ob.binning_table.build().drop(index="Totals"); bt = bt[bt.Count > 0]
J["m3s3_edad"] = {"labels": [str(x).replace("(-inf, ", "< ").replace(", inf)", "+").replace("[", "").replace(")", "") for x in bt.Bin], "event": r4(bt["Event rate"]), "woe": r4(bt["WoE"])}
fw = FastWoe(binning_method="tree", tree_kwargs={"min_samples_leaf": 1000}, monotonic_cst={"RCI": 1}, random_state=0).fit(devm[["RCI"]], devm.TARGET)
m = fw.get_mapping("RCI")
J["m3s3_rci_ci"] = {"labels": list(m.category.astype(str)), "woe": r4(m.woe), "lo": r4(m.woe_ci_lower), "hi": r4(m.woe_ci_upper)}

json.dump(J, open(OUT, "w"), ensure_ascii=False, indent=1)
print("ok", list(J))
