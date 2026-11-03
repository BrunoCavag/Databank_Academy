"""Calcula los datos de los gráficos nativos de los PPT a partir de los mismos datasets de los notebooks."""
import json, sys
import numpy as np, pandas as pd
from scipy import stats
from sklearn.metrics import roc_auc_score, roc_curve
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from statsmodels.stats.proportion import proportion_confint

D = sys.argv[1]; OUT = sys.argv[2]
app = pd.read_csv(f"{D}/hc_application_sintetico.csv")
p = pd.read_csv(f"{D}/cartera_panel_mensual.csv.gz")
tw = pd.read_csv(f"{D}/taiwan_default.csv")
J = {}
r4 = lambda v: [round(float(x), 4) for x in v]

# ---------------- M1S1
app["EDAD"] = -app.DAYS_BIRTH / 365.25
app["RCI"] = app.AMT_ANNUITY / (app.AMT_INCOME_TOTAL / 12)
ext = app[["EXT_SOURCE_1", "EXT_SOURCE_2", "EXT_SOURCE_3"]].mean(axis=1)
app["SCORE"] = (ext.fillna(ext.median()) * 1000).round()
app["BANDA"] = pd.qcut(app.SCORE, 10, labels=[f"D{i}" for i in range(1, 11)])
tb = app.groupby("BANDA", observed=True).TARGET.mean()
J["m1s1_deciles"] = {"labels": list(tb.index.astype(str)), "values": r4(tb.values)}
cortes = np.arange(250, 701, 25)
J["m1s1_strategy"] = {"labels": [str(c) for c in cortes],
                      "aprob": r4([(app.SCORE >= c).mean() for c in cortes]),
                      "malos": r4([app.loc[app.SCORE >= c, "TARGET"].mean() for c in cortes])}
r_, rf, cop, LGD = 0.28, 0.06, 0.07, 0.75
contrib = 0.55 * app.AMT_CREDIT * (r_ - rf - cop) - app.TARGET * LGD * 0.8 * app.AMT_CREDIT
cortes2 = np.arange(200, 801, 25)
J["m1s1_utilidad"] = {"labels": [str(c) for c in cortes2], "values": [round(contrib[app.SCORE >= c].sum() / 1e6, 2) for c in cortes2]}
app["BANDA3"] = pd.qcut(app.SCORE, 3, labels=["Score bajo", "Score medio", "Score alto"])
app["RCI3"] = pd.cut(app.RCI, [0, .3, .5, 100], labels=["RCI ≤ 30 %", "30-50 %", "> 50 %"])
mt = app.pivot_table(index="BANDA3", columns="RCI3", values="TARGET", aggfunc="mean", observed=True)
J["m1s1_matriz"] = {"rows": list(mt.index.astype(str)), "cols": list(mt.columns.astype(str)), "values": [r4(r) for r in mt.values]}
rb = app.assign(b=pd.cut(app.RCI, [0, .1, .2, .3, .4, .5, .7, 100], labels=["≤10%", "10-20%", "20-30%", "30-40%", "40-50%", "50-70%", ">70%"])).groupby("b", observed=True).TARGET.mean()
J["m1s1_rci"] = {"labels": list(rb.index.astype(str)), "values": r4(rb.values)}

# ---------------- M1S2
cons = ["Tarjeta de crédito", "Consumo no revolvente"]
vig = p[(p.estado == "Vigente") & p.producto.isin(cons)]
g = vig.groupby("periodo")
ind = pd.DataFrame({"col": g.saldo.sum(), "atr": g.apply(lambda d: d.loc[d.dias_atraso > 30, "saldo"].sum())})
cast = p[p.producto.isin(cons)].groupby("periodo").monto_castigo.sum().reindex(ind.index).fillna(0)
ind["c12"] = cast.rolling(12, min_periods=1).sum()
ind["mora"] = ind.atr / ind.col; ind["aj"] = (ind.atr + ind.c12) / (ind.col + ind.c12)
ind = ind.loc["2022-07":"2026-06"].iloc[::3]
J["m1s2_mora"] = {"labels": list(ind.index), "mora": r4(ind.mora), "ajustada": r4(ind.aj)}
pc = p[p.producto.isin(cons)].copy()
pc["q"] = pd.PeriodIndex(pc.cosecha, freq="M").asfreq("Q").astype(str)
pc["malo"] = (pc.dias_atraso > 60) | (pc.monto_castigo > 0)
pm = pc[pc.malo].groupby("id_credito").mob.min()
cr = pc.drop_duplicates("id_credito").set_index("id_credito")[["q", "monto_desembolsado"]]; cr["mm"] = pm
mx = pc.groupby("q").mob.max()
vint = {}
for q in ["2022Q3", "2023Q1", "2023Q3", "2024Q1", "2024Q3", "2025Q1"]:
    d = cr[cr.q == q]
    vint[q] = [round(float(d.loc[d.mm <= k, "monto_desembolsado"].sum() / d.monto_desembolsado.sum()), 4) if k <= mx[q] else None for k in range(1, 25)]
J["m1s2_vintage"] = {"labels": [str(k) for k in range(1, 25)], "series": vint}
orden = ["0", "1-30", "31-60", "61-90", "91-120", "121-180", "181+"]
pr = p[p.producto.isin(cons) & (p.estado != "Cancelado")].sort_values(["id_credito", "mob"])
pr = pr[~((pr.estado == "Castigado") & (pr.monto_castigo == 0))]
pr["sig"] = pr.groupby("id_credito").bucket_atraso.shift(-1)
w = pr[(pr.periodo >= "2025-07") & (pr.periodo <= "2026-06") & pr.sig.notna() & (pr.bucket_atraso != "181+")]
rr = pd.crosstab(w.bucket_atraso, w.sig, normalize="index").reindex(index=orden[:-1], columns=orden).fillna(0)
J["m1s2_roll"] = {"rows": orden[:-1], "cols": orden, "values": [r4(r) for r in rr.values]}
opex = {"Tarjeta de crédito": .09, "Consumo no revolvente": .05, "Microempresa": .08, "Vehicular": .025, "Hipotecario": .012}
v12 = p[(p.estado == "Vigente") & (p.periodo > "2025-06") & (p.periodo <= "2026-06")].copy()
v12["ii"] = np.where(v12.dias_atraso <= 90, v12.saldo * v12.tasa_anual / 12, 0)
a12 = p[(p.periodo > "2025-06") & (p.periodo <= "2026-06")]
pl = v12.groupby("producto").agg(s=("saldo", lambda s: s.sum() / 12), ii=("ii", "sum"))
pl["pn"] = a12.groupby("producto").monto_castigo.sum() - a12.groupby("producto").recupero.sum()
pl["ing"] = pl.ii / pl.s; pl["fon"] = 0.055; pl["op"] = pl.index.map(opex); pl["per"] = pl.pn / pl.s
pl["con"] = pl.ing - pl.fon - pl.op - pl.per
pl = pl.loc[["Tarjeta de crédito", "Consumo no revolvente", "Microempresa", "Vehicular", "Hipotecario"]]
J["m1s2_pl"] = {"labels": list(pl.index), "ingreso": r4(pl.ing), "fondeo": r4(pl.fon), "opex": r4(pl.op), "perdida": r4(pl.per), "contrib": r4(pl.con)}

# ---------------- M1S3
pc3 = p[p.producto.isin(["Tarjeta de crédito", "Consumo no revolvente", "Microempresa"])]
mob = pc3.pivot_table(index="id_credito", columns="mob", values="dias_atraso", aggfunc="max")
inf = pc3.drop_duplicates("id_credito").set_index("id_credito")[["cosecha"]]
inf["FPD"] = mob[1] > 0; inf["30@3"] = mob.loc[:, 1:3].max(axis=1) > 30; inf["60@6"] = mob.loc[:, 1:6].max(axis=1) > 60
inf = inf[mob.loc[:, 1:6].notna().sum(axis=1) == 6]
inf["q"] = pd.PeriodIndex(inf.cosecha, freq="M").asfreq("Q").astype(str)
ti = inf.groupby("q")[["FPD", "30@3", "60@6"]].mean()
J["m1s3_temprana"] = {"labels": list(ti.index), "FPD": r4(ti.FPD), "30@3": r4(ti["30@3"]), "60@6": r4(ti["60@6"])}
foto = p[(p.estado == "Vigente") & (p.periodo == "2026-06")]
prev = p[(p.estado == "Vigente") & (p.periodo == "2025-06")]
cc = pd.DataFrame({"saldo": foto.groupby("canal").saldo.sum() / 1e6,
                   "crec": foto.groupby("canal").saldo.sum() / prev.groupby("canal").saldo.sum() - 1,
                   "mora": foto.groupby("canal").apply(lambda d: d.loc[d.dias_atraso > 30, "saldo"].sum() / d.saldo.sum())})
J["m1s3_canal"] = {"rows": list(cc.index), "saldo": r4(cc.saldo), "crec": r4(cc.crec), "mora": r4(cc.mora)}
c2 = p[p.monto_castigo > 0][["id_credito", "producto", "periodo", "monto_castigo"]]
c2["rec"] = c2.id_credito.map(p.groupby("id_credito").recupero.sum()); c2 = c2[c2.periodo <= "2025-09"]
rc = c2.groupby("producto")[["monto_castigo", "rec"]].sum(); rc = rc.rec / rc.monto_castigo
J["m1s3_recupero"] = {"labels": list(rc.index), "values": r4(rc.values)}

# ---------------- M2S1
pd0 = app.TARGET.mean(); k = np.arange(15, 66)
J["m2s1_binom"] = {"labels": [str(x) for x in k], "values": r4(stats.binom.pmf(k, 500, pd0)), "pd": round(pd0, 4)}
pri = np.round(np.arange(0.01, 0.31, 0.02), 2)
bay = lambda s, f, pr: s * pr / (s * pr + f * (1 - pr))
J["m2s1_bayes"] = {"labels": [f"{x:.0%}" for x in pri], "f05": r4(bay(.6, .05, pri)), "f15": r4(bay(.6, .15, pri)), "f30": r4(bay(.6, .30, pri)), "prior": r4(pri)}
rng = np.random.default_rng(42)
pdv = np.clip(rng.beta(1.2, 13, 5000), 0.002, 0.6); umb = stats.norm.ppf(pdv); ead = rng.lognormal(10, .6, 5000); lgd = 0.65
EL = (pdv * lgd * ead).sum()
out = {}
for rho in [0.0, 0.05, 0.15]:
    L = np.empty(3000)
    for s in range(3000):
        M = rng.standard_normal(); Z = np.sqrt(rho) * M + np.sqrt(1 - rho) * rng.standard_normal(5000)
        L[s] = (lgd * ead * (Z < umb)).sum()
    out[rho] = [L.mean() / EL, np.quantile(L, .99) / EL, np.quantile(L, .999) / EL]
J["m2s1_var"] = {"labels": ["Media", "VaR 99 %", "VaR 99,9 %"], "r0": r4(out[0.0]), "r05": r4(out[0.05]), "r15": r4(out[0.15])}
vas = lambda pd_, rho: stats.norm.cdf((stats.norm.ppf(pd_) + np.sqrt(rho) * stats.norm.ppf(.999)) / np.sqrt(1 - rho))
J["m2s1_vasicek"] = {"labels": ["3 %", "5 %", "10 %", "15 %"], "values": r4([vas(0.08, r) for r in [.03, .05, .10, .15]])}
app_ = app.copy()
X = app_[["EXT_SOURCE_2", "EXT_SOURCE_3", "EDAD"]].fillna(app_[["EXT_SOURCE_2", "EXT_SOURCE_3", "EDAD"]].median())
app_["PD"] = LogisticRegression(max_iter=1000).fit(X, app_.TARGET).predict_proba(X)[:, 1]
app_["EL"] = app_.PD * 0.65 * app_.AMT_CREDIT * 0.85
dd = app_.assign(d=pd.qcut(app_.PD, 10, labels=False) + 1).groupby("d").EL.sum()
J["m2s1_el_dec"] = {"labels": [f"D{i}" for i in dd.index], "values": r4(dd / dd.sum())}

# ---------------- M2S2
ns = [20, 50, 100, 200, 500, 1000]
rng = np.random.default_rng(2027)
def cob(pv, n, m, sims=5000):
    x = rng.binomial(n, pv, sims); lo, hi = proportion_confint(x, n, alpha=.05, method=m); return float(((lo <= pv) & (pv <= hi)).mean())
J["m2s2_cob"] = {"labels": [str(n) for n in ns], **{lab: r4([cob(.03, n, m) for n in ns]) for lab, m in [("Wald", "normal"), ("Wilson", "wilson"), ("Clopper-Pearson", "beta"), ("Jeffreys", "jeffreys")]}}
nn = [50, 100, 200, 500, 1000, 5000]
J["m2s2_se"] = {"labels": [str(n) for n in nn], "values": r4([np.sqrt(pd0 * (1 - pd0) / n) for n in nn])}
grid = np.round(np.arange(0.02, 0.205, 0.01), 3)
ll = {}
for n in [50, 200, 1000]:
    kk = round(0.08 * n); l = kk * np.log(grid) + (n - kk) * np.log(1 - grid); ll[str(n)] = r4(l - (kk * np.log(kk / n) + (n - kk) * np.log(1 - kk / n)))
J["m2s2_ll"] = {"labels": [f"{g:.2f}" for g in grid], **ll}

# ---------------- M2S3
def pot(n, p0, p1, a=.05):
    kc = stats.binom.ppf(1 - a, n, p0) + 1; return float(1 - stats.binom.cdf(kc - 1, n, p1))
nn = [100, 250, 500, 1000, 2000, 5000, 10000]
J["m2s3_pot"] = {"labels": [f"{n:,}".replace(",", ".") for n in nn], **{f"{p1:.1%}".replace(".", ","): r4([pot(n, .02, p1) for n in nn]) for p1 in [.025, .03, .04]}}
Xt = tw[["LIMIT_BAL", "AGE", "PAY_0", "PAY_2", "PAY_3", "BILL_AMT1", "PAY_AMT1", "PAY_AMT2"]].copy()
Xt["LIMIT_BAL"] = np.log1p(Xt.LIMIT_BAL); Xt["BILL_AMT1"] = np.sign(Xt.BILL_AMT1) * np.log1p(Xt.BILL_AMT1.abs())
Xt["PAY_AMT1"] = np.log1p(Xt.PAY_AMT1); Xt["PAY_AMT2"] = np.log1p(Xt.PAY_AMT2)
a, b, ya, yb = train_test_split(Xt, tw["default"], test_size=.3, random_state=42, stratify=tw["default"])
pp = LogisticRegression(max_iter=2000).fit(a, ya).predict_proba(b)[:, 1]
v = pd.DataFrame({"y": yb.values, "p": pp}); v["g"] = pd.qcut(v.p, 7, labels=list("ABCDEFG"))
t = v.groupby("g", observed=True).agg(pm=("p", "mean"), o=("y", "mean"))
J["m2s3_calib"] = {"labels": list(t.index.astype(str)), "pred": r4(t.pm), "obs": r4(t.o)}
fpr, tpr, _ = roc_curve(yb, pp); grid = np.linspace(0, 1, 21)
J["m2s3_roc"] = {"labels": [f"{x:.2f}" for x in grid], "tpr": r4(np.interp(grid, fpr, tpr)), "rand": r4(grid), "auc": round(roc_auc_score(yb, pp), 3)}

json.dump(J, open(OUT, "w"), ensure_ascii=False, indent=1)
print("ok", list(J))
