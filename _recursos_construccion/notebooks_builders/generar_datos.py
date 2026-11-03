"""
Generador de datos referenciales - Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista
DataBank Academy.

Produce (semilla fija, reproducible):
  1. hc_application_sintetico.csv  -> solicitudes con esquema tipo Home Credit Default Risk (Kaggle)
  2. cartera_panel_mensual.csv.gz  -> panel crédito-mes de una cartera minorista peruana simulada
  3. macro_peru_ilustrativa.csv    -> series macro mensuales ILUSTRATIVAS (reemplazar con BCRP)
  4. german_credit.csv             -> Statlog German Credit (real, vía scorecardpy / UCI)
  5. taiwan_default.csv            -> Default of Credit Card Clients, Taiwan (real, UCI)
  6. sbs_categorias_provisiones.csv -> tabla de referencia Res. SBS 11356-2008 (consumo)
"""
import sys, os
import numpy as np
import pandas as pd

OUT = sys.argv[1]
TAIWAN_XLS = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(2027)

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

# ---------------------------------------------------------------- 3. macro
meses = pd.period_range("2021-01", "2026-09", freq="M")
t = np.arange(len(meses))
# trayectoria estilizada: rebote 2021, desaceleración 2023 (recesión leve), recuperación 2024-2026
pbi = np.interp(t, [0, 6, 12, 24, 30, 36, 48, 60, 68],
                [3.0, 15.0, 4.0, 2.5, -1.0, -0.5, 3.3, 3.0, 3.2]) + rng.normal(0, 0.6, len(t))
infl = np.interp(t, [0, 12, 18, 24, 30, 36, 42, 48, 60, 68],
                 [2.7, 5.7, 8.6, 8.5, 6.0, 3.2, 2.0, 2.0, 1.8, 2.1]) + rng.normal(0, 0.15, len(t))
tasa_ref = np.interp(t, [0, 6, 12, 20, 30, 34, 42, 48, 56, 68],
                     [0.25, 0.25, 2.5, 7.5, 7.75, 7.0, 5.75, 5.0, 4.5, 4.25])
desempleo = np.interp(t, [0, 12, 24, 36, 48, 60, 68],
                      [10.5, 8.0, 7.5, 7.0, 6.5, 6.2, 6.0]) + rng.normal(0, 0.3, len(t))
macro = pd.DataFrame({
    "periodo": meses.astype(str),
    "pbi_var_anual_pct": pbi.round(2),
    "inflacion_anual_pct": infl.round(2),
    "tasa_referencia_pct": tasa_ref.round(2),
    "desempleo_lima_pct": desempleo.round(2),
})
# índice de estrés para la simulación: alto cuando PBI bajo / inflación y tasas altas
stress = (-(pbi - 3) / 3 + (infl - 3) / 4 + (tasa_ref - 4) / 5)
stress = pd.Series(stress, index=meses).rolling(3, min_periods=1).mean()
macro["indice_estres_simulado"] = stress.values.round(3)
macro.to_csv(f"{OUT}/macro_peru_ilustrativa.csv", index=False)

# ---------------------------------------------------------------- 1. application (esquema Home Credit)
N = 60000
fecha = pd.period_range("2022-01", "2025-12", freq="M")
fsol = rng.choice(len(fecha), N)
contrato = rng.choice(["Cash loans", "Revolving loans"], N, p=[0.9, 0.1])
gender = rng.choice(["F", "M", "XNA"], N, p=[0.658, 0.3418, 0.0002])
own_car = rng.choice(["Y", "N"], N, p=[0.34, 0.66])
own_realty = rng.choice(["Y", "N"], N, p=[0.69, 0.31])
children = rng.choice([0, 1, 2, 3, 4], N, p=[0.70, 0.20, 0.087, 0.012, 0.001])
income_type = rng.choice(["Working", "Commercial associate", "Pensioner", "State servant", "Unemployed"],
                         N, p=[0.516, 0.233, 0.18, 0.0705, 0.0005])
edu = rng.choice(["Secondary / secondary special", "Higher education", "Incomplete higher",
                  "Lower secondary", "Academic degree"], N, p=[0.71, 0.243, 0.033, 0.0135, 0.0005])
family = rng.choice(["Married", "Single / not married", "Civil marriage", "Separated", "Widow"],
                    N, p=[0.64, 0.148, 0.097, 0.064, 0.051])
housing = rng.choice(["House / apartment", "With parents", "Municipal apartment", "Rented apartment",
                      "Office apartment", "Co-op apartment"], N, p=[0.887, 0.048, 0.036, 0.016, 0.009, 0.004])
age_years = np.where(income_type == "Pensioner", rng.uniform(55, 69, N), rng.uniform(21, 62, N))
days_birth = -(age_years * 365.25).astype(int)
emp_years = np.minimum(rng.gamma(1.6, 4.0, N), age_years - 18)
days_employed = -(emp_years * 365.25).astype(int)
days_employed = np.where(income_type == "Pensioner", 365243, days_employed)   # anomalía clásica de Home Credit
inc_mult = np.select([income_type == "Commercial associate", income_type == "State servant",
                      income_type == "Pensioner"], [1.2, 1.15, 0.75], 1.0)
edu_mult = np.select([edu == "Higher education", edu == "Academic degree", edu == "Lower secondary"],
                     [1.35, 1.6, 0.8], 1.0)
income = np.exp(rng.normal(np.log(42000), 0.48, N)) * inc_mult * edu_mult   # ingreso anual en S/
income = np.round(income / 100) * 100
credit = np.round(income * np.exp(rng.normal(np.log(0.55), 0.6, N)) / 100) * 100
credit = np.where(contrato == "Revolving loans", np.round(income * rng.uniform(0.1, 0.5, N) / 100) * 100, credit)
goods = np.round(credit / rng.uniform(1.0, 1.2, N) / 100) * 100
plazo_m = np.where(contrato == "Revolving loans", 20, rng.choice([12, 18, 24, 36, 48, 60], N))
annuity = credit / plazo_m * rng.uniform(1.05, 1.35, N)
occ = rng.choice(["Laborers", "Sales staff", "Core staff", "Managers", "Drivers", "High skill tech staff",
                  "Accountants", "Medicine staff", "Security staff", "Cooking staff", "Cleaning staff",
                  "Low-skill Laborers"], N,
                 p=[0.28, 0.152, 0.13, 0.10, 0.088, 0.054, 0.046, 0.04, 0.032, 0.028, 0.022, 0.028])
occ = np.where((income_type == "Pensioner") | (rng.random(N) < 0.13), None, occ)
org = rng.choice(["Business Entity Type 3", "Self-employed", "Other", "Medicine", "Government",
                  "Trade: type 7", "School", "Construction", "Transport: type 4", "Bank"], N,
                 p=[0.27, 0.15, 0.07, 0.045, 0.045, 0.035, 0.035, 0.03, 0.025, 0.295 - 0.0])
region_rating = rng.choice([1, 2, 3], N, p=[0.105, 0.738, 0.157])
canal = rng.choice(["Agencia", "Digital", "Fuerza de ventas", "Retail aliado"], N, p=[0.45, 0.25, 0.18, 0.12])
bureau_enq = rng.poisson(1.9, N)
dti = annuity / (income / 12)

# latente de riesgo (log-odds) con relaciones económicas plausibles
z = (-2.9
     - 0.025 * (age_years - 40)
     - 0.06 * np.minimum(emp_years, 15)
     + 0.9 * np.clip(dti - 0.35, -0.3, 1.5)
     + 0.35 * (gender == "M")
     + 0.30 * (own_car == "N")
     + 0.25 * (edu == "Secondary / secondary special") + 0.5 * (edu == "Lower secondary") - 0.35 * (edu == "Higher education")
     + 0.30 * (income_type == "Working") - 0.3 * (income_type == "Pensioner") - 0.25 * (income_type == "State servant")
     + 0.45 * (income_type == "Unemployed")
     + 0.35 * (region_rating - 2)
     + 0.20 * (housing == "With parents") + 0.25 * (housing == "Rented apartment")
     + 0.30 * np.isin(occ, ["Laborers", "Drivers", "Low-skill Laborers", "Security staff"])
     - 0.35 * np.isin(occ, ["Accountants", "High skill tech staff", "Managers"])
     + 0.08 * bureau_enq
     + 0.25 * (canal == "Retail aliado") + 0.15 * (canal == "Digital")
     - 0.30 * (contrato == "Revolving loans")
     + 0.30 * stress.reindex(fecha[fsol]).values)
latent = rng.normal(0, 1, N)
z_full = z + 0.9 * latent
ext_noise = lambda s: rng.normal(0, s, N)
ext1 = sigmoid(-0.55 * latent - 0.15 * (z - z.mean()) + ext_noise(0.6))
ext2 = sigmoid(-0.70 * latent - 0.25 * (z - z.mean()) + ext_noise(0.5) + 0.5)
ext3 = sigmoid(-0.70 * latent - 0.20 * (z - z.mean()) + ext_noise(0.55))
ext1 = np.where(rng.random(N) < 0.56, np.nan, ext1)
ext3 = np.where(rng.random(N) < 0.20, np.nan, ext3)
ext2 = np.where(rng.random(N) < 0.002, np.nan, ext2)
from scipy.optimize import brentq
shift = brentq(lambda b: sigmoid(z_full + b).mean() - 0.081, -10, 10)
z_full = z_full + shift
pd_true = sigmoid(z_full)
target = (rng.random(N) < pd_true).astype(int)

app = pd.DataFrame({
    "SK_ID_CURR": np.arange(100002, 100002 + N),
    "TARGET": target,
    "FECHA_SOLICITUD": fecha[fsol].astype(str),
    "CANAL": canal,
    "NAME_CONTRACT_TYPE": contrato,
    "CODE_GENDER": gender,
    "FLAG_OWN_CAR": own_car,
    "FLAG_OWN_REALTY": own_realty,
    "CNT_CHILDREN": children,
    "AMT_INCOME_TOTAL": income.round(1),
    "AMT_CREDIT": credit.round(1),
    "AMT_ANNUITY": annuity.round(1),
    "AMT_GOODS_PRICE": np.where(contrato == "Revolving loans", np.nan, goods),
    "NAME_INCOME_TYPE": income_type,
    "NAME_EDUCATION_TYPE": edu,
    "NAME_FAMILY_STATUS": family,
    "NAME_HOUSING_TYPE": housing,
    "DAYS_BIRTH": days_birth,
    "DAYS_EMPLOYED": days_employed,
    "OCCUPATION_TYPE": occ,
    "ORGANIZATION_TYPE": org,
    "REGION_RATING_CLIENT": region_rating,
    "AMT_REQ_CREDIT_BUREAU_YEAR": bureau_enq,
    "EXT_SOURCE_1": np.round(ext1, 6),
    "EXT_SOURCE_2": np.round(ext2, 6),
    "EXT_SOURCE_3": np.round(ext3, 6),
})
# duplicados intencionales (para auditoría de datos en Módulo 7)
dups = app.sample(60, random_state=1)
app = pd.concat([app, dups]).sample(frac=1, random_state=2).reset_index(drop=True)
app.to_csv(f"{OUT}/hc_application_sintetico.csv", index=False)
print("application:", app.shape, "tasa default:", round(app.TARGET.mean(), 4))

# ---------------------------------------------------------------- 2. panel de cartera
prod_cfg = {
    #               peso, monto_med, plazo opciones, tasa_med, pd_mult, cancel_anticipada
    "Tarjeta de crédito":        (0.32, 7000,  [36],           0.65, 1.45, 0.010),
    "Consumo no revolvente":     (0.32, 18000, [12, 24, 36, 48], 0.38, 1.00, 0.015),
    "Microempresa":              (0.20, 20000, [12, 18, 24],     0.42, 1.25, 0.012),
    "Vehicular":                 (0.08, 55000, [36, 48, 60],     0.14, 0.55, 0.008),
    "Hipotecario":               (0.08, 180000, [180, 240],      0.09, 0.30, 0.004),
}
L = 16000
prods = list(prod_cfg)
prod = rng.choice(prods, L, p=[prod_cfg[p][0] for p in prods])
vint_rng = pd.period_range("2022-01", "2026-08", freq="M")
# crecimiento: más originación en el tiempo
w = np.linspace(1, 1.8, len(vint_rng)); w /= w.sum()
vint = rng.choice(len(vint_rng), L, p=w)
grade = rng.choice(["A", "B", "C", "D", "E"], L, p=[0.22, 0.30, 0.25, 0.15, 0.08])
grade_mult = pd.Series({"A": 0.35, "B": 0.65, "C": 1.0, "D": 1.7, "E": 2.8})[grade].values
region = rng.choice(["Lima Metropolitana", "Norte", "Sur", "Centro", "Oriente"], L, p=[0.52, 0.18, 0.15, 0.09, 0.06])
canal_l = rng.choice(["Agencia", "Digital", "Fuerza de ventas", "Retail aliado"], L, p=[0.45, 0.25, 0.18, 0.12])
canal_mult = pd.Series({"Agencia": 1.0, "Digital": 1.15, "Fuerza de ventas": 1.1, "Retail aliado": 1.35})[canal_l].values
monto = np.array([prod_cfg[p][1] for p in prod]) * np.exp(rng.normal(0, 0.55, L))
plazo = np.array([rng.choice(prod_cfg[p][2]) for p in prod])
tasa = np.array([prod_cfg[p][3] for p in prod]) * (0.75 + 0.15 * pd.Series({"A": 0, "B": 1, "C": 2, "D": 3, "E": 4})[grade].values / 2)
pd_mult = np.array([prod_cfg[p][4] for p in prod]) * grade_mult * canal_mult * (1 + 0.15 * (region == "Oriente"))
prepay = np.array([prod_cfg[p][5] for p in prod])

# matriz de transición base mensual (estados 0..5 + 6=castigo + 7=cancelado)
B = ["0", "1-30", "31-60", "61-90", "91-120", "121-180"]
def P_row(s, m):  # m: multiplicador de riesgo
    if s == 0:
        p1 = min(0.012 * m, 0.4); return {0: 1 - p1, 1: p1}
    if s == 1:
        f = min(0.17 * m ** 0.5, 0.8); c = 0.62 / m ** 0.3; c = min(c, 1 - f - 0.01); return {0: c, 1: 1 - c - f, 2: f}
    if s == 2:
        f = min(0.42 * m ** 0.4, 0.85); c = 0.22 / m ** 0.3; c = min(c, 1 - f - 0.01); return {0: c, 2: 1 - c - f, 3: f}
    if s == 3:
        f = min(0.62 * m ** 0.3, 0.9); c = 0.12 / m ** 0.3; c = min(c, 1 - f - 0.01); return {0: c, 3: 1 - c - f, 4: f}
    if s == 4:
        f = min(0.80 * m ** 0.2, 0.90); c = 0.06; return {0: c, 4: 1 - c - f, 5: f}
    if s == 5:
        return {0: 0.03, 5: 0.12, 6: 0.85}

obs_end = pd.Period("2026-09", "M")
rows = []
for i in range(L):
    v = vint_rng[vint[i]]
    n_obs = min((obs_end - v).n + 1, plazo[i] + 8)
    r = tasa[i] / 12
    cuota = monto[i] * r / (1 - (1 + r) ** -plazo[i])
    saldo = monto[i]; s = 0; cuotas_pag = 0; recupero_acum = 0.0
    for mob in range(1, n_obs + 1):
        per = v + mob
        if per > obs_end:
            break
        st = stress.get(per, stress.iloc[-1])
        # efecto madurez: riesgo sube los primeros 12 meses y luego cae (curva de cosecha)
        mat = 0.6 + 0.8 * np.exp(-((mob - 10) / 8) ** 2)
        m = pd_mult[i] * mat * np.exp(0.45 * st)
        if s == 0 and rng.random() < prepay[i]:
            rows.append((i, per, mob, 0.0, 0, "Cancelado", 0.0, 0.0)); break
        probs = P_row(s, m)
        s_new = rng.choice(list(probs), p=np.array(list(probs.values())) / sum(probs.values()))
        castigo = 0.0; recupero = 0.0
        if s_new == 0:
            # paga cuota(s) pendientes
            n_pay = 1 + s if s > 0 else 1
            for _ in range(n_pay):
                if saldo > 0:
                    interes = saldo * r; saldo = max(saldo - (cuota - interes), 0); cuotas_pag += 1
        elif s_new == 6:
            castigo = saldo
        s = s_new
        dias = {0: 0, 1: rng.integers(1, 31), 2: rng.integers(31, 61), 3: rng.integers(61, 91),
                4: rng.integers(91, 121), 5: rng.integers(121, 181), 6: 181}[s]
        if s == 6:
            rows.append((i, per, mob, round(castigo, 2), 181, "Castigado", round(castigo, 2), 0.0))
            # recuperaciones post-castigo en los siguientes meses
            rec_rate = np.clip(rng.beta(1.2, 4.0), 0, 1) * (1.8 if prod[i] in ("Hipotecario", "Vehicular") else 1.0)
            rec_total = min(rec_rate, 0.95) * castigo
            for k in range(1, 13):
                p2 = per + k
                if p2 > obs_end: break
                share = rec_total * (0.25 * 0.75 ** (k - 1))
                rows.append((i, p2, mob + k, 0.0, 181, "Castigado", 0.0, round(share, 2)))
            break
        if saldo <= 1 and s == 0:
            rows.append((i, per, mob, 0.0, 0, "Cancelado", 0.0, 0.0)); break
        rows.append((i, per, mob, round(saldo, 2), int(dias), "Vigente", 0.0, 0.0))

panel = pd.DataFrame(rows, columns=["idx", "periodo", "mob", "saldo", "dias_atraso", "estado",
                                    "monto_castigo", "recupero"])
loans = pd.DataFrame({
    "id_credito": [f"CR{100000 + k}" for k in range(L)],
    "producto": prod, "segmento_riesgo": grade, "region": region, "canal": canal_l,
    "cosecha": vint_rng[vint].astype(str), "monto_desembolsado": monto.round(2),
    "plazo_meses": plazo, "tasa_anual": tasa.round(4),
})
panel = loans.iloc[panel.idx.values].reset_index(drop=True).join(panel.drop(columns="idx"))
panel["periodo"] = panel["periodo"].astype(str)
bins = [-1, 0, 30, 60, 90, 120, 180, 10_000]
panel["bucket_atraso"] = pd.cut(panel.dias_atraso, bins, labels=["0", "1-30", "31-60", "61-90", "91-120", "121-180", "181+"]).astype(str)
panel.to_csv(f"{OUT}/cartera_panel_mensual.csv.gz", index=False, compression="gzip")
print("panel:", panel.shape)

# ---------------------------------------------------------------- 4/5. datasets reales
try:
    import scorecardpy as sc
    g = sc.germancredit()
    g["creditability"] = (g["creditability"] == "bad").astype(int)
    g = g.rename(columns={"creditability": "default"})
    g.to_csv(f"{OUT}/german_credit.csv", index=False)
    print("german:", g.shape, g["default"].mean())
except Exception as e:
    print("german error", e)

tw = pd.read_excel(TAIWAN_XLS, header=1)
tw = tw.rename(columns={"default payment next month": "default"})
tw.to_csv(f"{OUT}/taiwan_default.csv", index=False)
print("taiwan:", tw.shape, tw["default"].mean())

# ---------------------------------------------------------------- 6. tabla SBS
sbs = pd.DataFrame({
    "categoria": ["0 - Normal", "1 - Con Problemas Potenciales (CPP)", "2 - Deficiente", "3 - Dudoso", "4 - Pérdida"],
    "dias_atraso_consumo_min": [0, 9, 31, 61, 121],
    "dias_atraso_consumo_max": [8, 30, 60, 120, 99999],
    "provision_sin_garantia_pct": [1.00, 5.00, 25.00, 60.00, 100.00],
})
sbs.to_csv(f"{OUT}/sbs_categorias_provisiones_consumo.csv", index=False)
print("ok")
