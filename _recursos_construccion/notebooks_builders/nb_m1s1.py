from nbhelper import build
import sys
M1 = sys.argv[1]

from nbhelper import SETUP

cells = [
("md", """
## Objetivos de la sesión (2 horas)

Al terminar este laboratorio podrás:

1. Recorrer el **ciclo de vida del crédito** (originación → seguimiento → cobranza → recuperación) con datos.
2. Medir el **embudo de originación**: solicitudes, filtros duros, decisión por score y capacidad de pago.
3. Construir la **curva de estrategia** (tasa de aprobación vs. tasa de malos) y usarla para traducir el **apetito de riesgo** en un punto de corte.
4. Cuantificar el efecto de una **política de capacidad de pago** (cuota/ingreso) y de las **excepciones**.

**Datos:** `hc_application_sintetico.csv`: 60 mil solicitudes con el esquema de *Home Credit Default Risk* (Kaggle). Es una muestra **sintética** con relaciones económicas plausibles: la tasa de incumplimiento ronda el 8 %, como en el original. `TARGET = 1` significa que el cliente incumplió (90+ días) en su ventana de desempeño.

| Bloque | Tiempo | Contenido |
|---|---|---|
| 1 | 15 min | Carga y lectura del portafolio de solicitudes |
| 2 | 25 min | Embudo de originación y políticas de filtro |
| 3 | 30 min | Score, curva de estrategia y apetito de riesgo |
| 4 | 25 min | Capacidad de pago (RCI) y límites |
| 5 | 15 min | Excepciones y overrides |
| 6 | 10 min | Ejercicios y discusión |
"""),
("code", SETUP),
("md", "## 1. Carga y primera lectura de las solicitudes"),
("code", """
app = pd.read_csv(DATA / "hc_application_sintetico.csv")
print(app.shape)
app.head()
"""),
("code", """
# Variables derivadas de negocio
app["EDAD"] = -app["DAYS_BIRTH"] / 365.25
app["ANTIG_LABORAL"] = np.where(app["DAYS_EMPLOYED"] == 365243, np.nan, -app["DAYS_EMPLOYED"] / 365.25)
app["RCI"] = app["AMT_ANNUITY"] / (app["AMT_INCOME_TOTAL"] / 12)      # relación cuota / ingreso mensual
app["LTI"] = app["AMT_CREDIT"] / app["AMT_INCOME_TOTAL"]              # préstamo / ingreso anual
app[["EDAD", "ANTIG_LABORAL", "RCI", "LTI", "TARGET"]].describe().T
"""),
("md", """
> **Pregunta para la clase:** `DAYS_EMPLOYED = 365243` aparece en ~18 % de los registros. ¿Qué significa? ¿Qué pasaría si lo usáramos sin tratar?
> *(Pista: cruza con `NAME_INCOME_TYPE`.)*
"""),
("code", """
pd.crosstab(app["DAYS_EMPLOYED"] == 365243, app["NAME_INCOME_TYPE"])
"""),
("md", """
### Tasa de malos por segmento: la primera conversación con negocio
Antes de cualquier modelo, un equipo de riesgo mira **cómo cambia el riesgo** entre segmentos simples.
"""),
("code", """
def tasa_malos(df, col):
    g = df.groupby(col)["TARGET"].agg(n="size", malos="sum", tasa_malos="mean")
    g["participacion"] = g["n"] / g["n"].sum()
    return g.sort_values("tasa_malos", ascending=False)

for c in ["NAME_INCOME_TYPE", "NAME_EDUCATION_TYPE", "CANAL", "REGION_RATING_CLIENT"]:
    display(tasa_malos(app, c).style.format({"tasa_malos": "{:.2%}", "participacion": "{:.1%}"}))
"""),
("code", """
fig, ax = plt.subplots(1, 2, figsize=(12, 4))
app.assign(edad_b=pd.cut(app.EDAD, [20, 25, 30, 35, 40, 45, 50, 55, 60, 70])).groupby("edad_b", observed=True)["TARGET"].mean().plot(kind="bar", ax=ax[0], color=AZUL)
ax[0].set_title("Tasa de malos por edad"); ax[0].yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
app.groupby("FECHA_SOLICITUD")["TARGET"].mean().plot(ax=ax[1], color=ROJO)
ax[1].set_title("Tasa de malos por mes de solicitud (efecto ciclo)"); ax[1].yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
plt.tight_layout(); plt.show()
"""),
("md", """
**Lectura:** el riesgo **no es estable en el tiempo**. Las cosechas originadas en 2022-2023 (inflación alta, tasas altas y desaceleración) muestran más incumplimiento que las de 2025. Esta idea vuelve en los módulos de PD *point-in-time* vs. *through-the-cycle* (Módulo 7) y de *stress testing* (Módulo 9).

## 2. Embudo de originación y filtros duros (*knock-out rules*)

Una política de admisión típica de banca minorista tiene capas:

1. **Filtros duros:** edad, ingreso mínimo, calificación en la central de riesgos (RCC SBS), listas negras, fraude.
2. **Score:** probabilidad de incumplimiento estimada → banda de riesgo.
3. **Capacidad de pago:** RCI (cuota/ingreso), endeudamiento total, LTI.
4. **Asignación de línea/monto y precio.**
5. **Excepciones:** aprobaciones fuera de política con autonomía definida.

Simulemos los filtros duros:
"""),
("code", """
FILTROS = {
    "Edad entre 21 y 70": (app.EDAD >= 21) & (app.EDAD <= 70),
    "Ingreso anual >= S/ 18 mil": app.AMT_INCOME_TOTAL >= 18_000,
    "No desempleado": app.NAME_INCOME_TYPE != "Unemployed",
    "Consultas buró último año <= 6": app.AMT_REQ_CREDIT_BUREAU_YEAR <= 6,
}
mask = pd.Series(True, index=app.index)
embudo = [("Solicitudes", len(app), app.TARGET.mean())]
for nombre, cond in FILTROS.items():
    mask &= cond
    embudo.append((nombre, mask.sum(), app.loc[mask, "TARGET"].mean()))
embudo = pd.DataFrame(embudo, columns=["etapa", "n", "tasa_malos"])
embudo["pct_sobre_solicitudes"] = embudo.n / embudo.n.iloc[0]
embudo.style.format({"tasa_malos": "{:.2%}", "pct_sobre_solicitudes": "{:.1%}", "n": "{:,}"})
"""),
("code", """
# ¿Qué tan "malos" son los rechazados por cada filtro (aislado)?
res = []
for nombre, cond in FILTROS.items():
    rech = ~cond
    res.append((nombre, rech.sum(), app.loc[rech, "TARGET"].mean() if rech.sum() else np.nan))
pd.DataFrame(res, columns=["filtro", "rechazados", "tasa_malos_rechazados"]).style.format({"tasa_malos_rechazados": "{:.2%}"})
"""),
("md", """
> **Discusión:** un filtro que rechaza clientes cuya tasa de malos es parecida al promedio **destruye volumen sin reducir riesgo**. ¿Qué filtro justificarías ante el comité y cuál revisarías?

## 3. Score, curva de estrategia y apetito de riesgo

Aún no tenemos un modelo propio (lo construiremos en el Módulo 3). Usaremos un **score de buró simulado** que combina `EXT_SOURCE_1..3`: es un *proxy* de lo que hace un score genérico de buró.
"""),
("code", """
ext = app[["EXT_SOURCE_1", "EXT_SOURCE_2", "EXT_SOURCE_3"]]
app["SCORE_BURO"] = (ext.mean(axis=1).fillna(ext.mean(axis=1).median()) * 1000).round()   # escala 0-1000: más alto, menos riesgo
from sklearn.metrics import roc_auc_score
print("AUC del score de buró:", round(roc_auc_score(app.TARGET, -app.SCORE_BURO), 3))

app["BANDA"] = pd.qcut(app.SCORE_BURO, 10, labels=[f"D{i}" for i in range(1, 11)])   # D1 = más riesgoso
tabla_bandas = app.groupby("BANDA", observed=True).agg(score_min=("SCORE_BURO", "min"), score_max=("SCORE_BURO", "max"),
                                                       n=("TARGET", "size"), tasa_malos=("TARGET", "mean"))
tabla_bandas.style.format({"tasa_malos": "{:.2%}"}).bar(subset=["tasa_malos"], color="#f4a3a8")
"""),
("md", """
### Curva de estrategia (*strategy curve*)
Para cada punto de corte calculamos la **tasa de aprobación** y la **tasa de malos de los aprobados**. El **apetito de riesgo** fija un máximo de tasa de malos (o de pérdida esperada). La política escoge el corte que **maximiza la aprobación** sin pasar ese máximo.
"""),
("code", """
base = app[mask].copy()          # sobre los que pasaron filtros duros
cortes = np.arange(200, 800, 5)
curva = pd.DataFrame([(c, (base.SCORE_BURO >= c).mean(), base.loc[base.SCORE_BURO >= c, "TARGET"].mean()) for c in cortes],
                     columns=["corte", "tasa_aprobacion", "tasa_malos"])

APETITO = 0.05     # máxima tasa de malos aceptada en la cosecha
corte_opt = curva.loc[curva.tasa_malos <= APETITO, "corte"].min()
fila = curva[curva.corte == corte_opt].iloc[0]

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(curva.tasa_aprobacion, curva.tasa_malos, color=AZUL, lw=2.5)
ax.axhline(APETITO, color=ROJO, ls="--", label=f"Apetito: tasa de malos <= {APETITO:.0%}")
ax.scatter(fila.tasa_aprobacion, fila.tasa_malos, s=120, color=ORO, zorder=5, label=f"Corte = {corte_opt:.0f}")
ax.set_xlabel("Tasa de aprobación"); ax.set_ylabel("Tasa de malos de aprobados"); ax.set_title("Curva de estrategia")
ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}")); ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
ax.legend(); plt.show()
print(f"Corte {corte_opt:.0f}: aprobación {fila.tasa_aprobacion:.1%}, tasa de malos {fila.tasa_malos:.2%}")
"""),
("md", """
### Del apetito en tasa de malos al apetito en **pérdida y rentabilidad**
Un apetito expresado sólo en tasa de malos ignora **cuánto** se presta y **cuánto se gana**. Calculemos una contribución simple por cliente:

$$\\text{Contribución} \\approx \\underbrace{\\bar{S} \\cdot (r - r_f - c_{op})}_{\\text{margen sobre saldo promedio}} - \\underbrace{\\mathbb{1}_{default} \\cdot LGD \\cdot EAD}_{\\text{pérdida}}$$

Supuestos ilustrativos: tasa activa 28 %, fondeo 6 %, costo operativo 7 % del saldo, saldo promedio en la vida = 55 % del monto, EAD al incumplir = 80 % del monto, LGD 75 %.
"""),
("code", """
r, rf, cop, LGD = 0.28, 0.06, 0.07, 0.75
base["margen"] = 0.55 * base.AMT_CREDIT * (r - rf - cop)
base["perdida"] = base.TARGET * LGD * 0.80 * base.AMT_CREDIT   # pérdida realizada (ex post)
print(f"PD de equilibrio aproximada: {0.55 * (r - rf - cop) / (LGD * 0.80):.1%}")
base["contrib"] = base.margen - base.perdida

curva["utilidad_MM"] = [base.loc[base.SCORE_BURO >= c, "contrib"].sum() / 1e6 for c in cortes]
corte_util = curva.loc[curva.utilidad_MM.idxmax(), "corte"]

fig, ax1 = plt.subplots(figsize=(10, 4.5))
ax1.plot(curva.corte, curva.utilidad_MM, color=VERDE, lw=2.5, label="Utilidad (MM)")
ax1.axvline(corte_util, color=VERDE, ls=":", label=f"Máx. utilidad: {corte_util:.0f}")
ax1.axvline(corte_opt, color=ROJO, ls="--", label=f"Corte por apetito: {corte_opt:.0f}")
ax2 = ax1.twinx(); ax2.plot(curva.corte, curva.tasa_aprobacion, color=GRIS, label="Aprobación"); ax2.grid(False)
ax1.set_xlabel("Punto de corte del score"); ax1.set_ylabel("Utilidad (MM)"); ax2.set_ylabel("Tasa de aprobación")
ax1.legend(loc="lower left"); ax1.set_title("Punto de corte: apetito vs. maximización de utilidad"); plt.show()
"""),
("md", """
**Mensaje clave:** el corte que maximiza la utilidad **no tiene por qué coincidir** con el que dicta el apetito. Si el corte rentable implica más riesgo del tolerado, la discusión no es técnica: es de **gobierno** (capital, volatilidad de resultados, reputación, regulación). Volveremos a esto con RAROC en el Módulo 8.

## 4. Capacidad de pago: relación cuota/ingreso (RCI) y límites
"""),
("code", """
base["RCI_b"] = pd.cut(base.RCI, [0, .1, .2, .3, .4, .5, .7, 10])
t = base.groupby("RCI_b", observed=True).agg(n=("TARGET", "size"), tasa_malos=("TARGET", "mean"))
t["participacion"] = t.n / t.n.sum()
display(t.style.format({"tasa_malos": "{:.2%}", "participacion": "{:.1%}"}))

ax = t.tasa_malos.plot(kind="bar", color=AZUL); ax.set_title("Tasa de malos por RCI"); ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}")); plt.show()
"""),
("code", """
# Matriz de política: score x RCI  ->  tasa de malos y volumen
base["BANDA3"] = pd.qcut(base.SCORE_BURO, 3, labels=["Score bajo", "Score medio", "Score alto"])
base["RCI3"] = pd.cut(base.RCI, [0, .3, .5, 10], labels=["RCI<=30%", "30-50%", ">50%"])
m = base.pivot_table(index="BANDA3", columns="RCI3", values="TARGET", aggfunc=["mean", "size"], observed=True)
m["mean"].style.format("{:.2%}").background_gradient(cmap="RdYlGn_r")
"""),
("md", """
**Política resultante (ejemplo para debatir):**

| | RCI <= 30 % | 30-50 % | > 50 % |
|---|---|---|---|
| **Score alto** | Aprobar | Aprobar | Aprobar con monto reducido |
| **Score medio** | Aprobar | Aprobar con monto reducido | Rechazar / excepción |
| **Score bajo** | Revisión | Rechazar | Rechazar |

Esta es la esencia de una **matriz de decisión**: combina *voluntad de pago* (score) con *capacidad de pago* (RCI).

## 5. Excepciones y *overrides*
Toda política tiene excepciones. Hay dos tipos:
- **Low-side override:** se aprueba un cliente que la política rechaza (riesgo).
- **High-side override:** se rechaza un cliente que la política aprueba (costo de oportunidad).

Simulemos que el área comercial aprueba como excepción el 15 % de los rechazados por score, con preferencia por montos altos.
"""),
("code", """
rng = np.random.default_rng(7)
base["aprob_politica"] = base.SCORE_BURO >= corte_opt
rech = base[~base.aprob_politica]
p_exc = 0.15 * (rech.AMT_CREDIT.rank(pct=True) * 1.5)      # mayor probabilidad de excepción a mayor monto
exc_idx = rech.index[rng.random(len(rech)) < p_exc.clip(0, 1)]
base["excepcion"] = base.index.isin(exc_idx)

resumen = pd.DataFrame({
    "n": [base.aprob_politica.sum(), base.excepcion.sum()],
    "tasa_malos": [base.loc[base.aprob_politica, "TARGET"].mean(), base.loc[base.excepcion, "TARGET"].mean()],
    "monto_prom": [base.loc[base.aprob_politica, "AMT_CREDIT"].mean(), base.loc[base.excepcion, "AMT_CREDIT"].mean()],
}, index=["Aprobados por política", "Excepciones"])
display(resumen.style.format({"tasa_malos": "{:.2%}", "monto_prom": "{:,.0f}", "n": "{:,}"}))

cartera = base[base.aprob_politica | base.excepcion]
print(f"Tasa de excepciones: {base.excepcion.sum() / len(cartera):.1%} de la cartera aprobada")
print(f"Tasa de malos de la cartera total: {cartera.TARGET.mean():.2%}  (sin excepciones: {base.loc[base.aprob_politica, 'TARGET'].mean():.2%})")
"""),
("md", """
**Gobierno de excepciones:** toda excepción debe registrarse (quién, por qué, con qué autonomía) y su **desempeño debe monitorearse aparte**. Indicadores típicos: % de excepciones sobre aprobaciones, tasa de malos de las excepciones vs. la cartera en política, y límite máximo de excepciones por canal o agencia.

## 6. Ejercicios
1. Cambia el `APETITO` a 4 % y a 6 %. ¿Cuánto volumen se gana o se pierde por cada punto de tasa de malos?
2. Agrega un filtro duro de `RCI <= 0.6`. ¿Mejora la curva de estrategia? ¿A qué costo?
3. Repite la curva de estrategia **por canal**. ¿Debería existir un corte distinto para *Retail aliado*?
4. Propón un límite de excepciones (%) y un indicador de alerta para el comité de riesgos.

---
**Conexión con el programa:** en el Módulo 3 reemplazaremos el score de buró por un *scorecard* propio (regresión logística + WoE). En el Módulo 7 la pérdida ex post se convertirá en **pérdida esperada** (PD × LGD × EAD).
"""),
]

build(f"{M1}/notebooks/M01_S01_Ciclo_de_Vida_Originacion_y_Apetito.ipynb",
      "Módulo 1 · Sesión 1: Ciclo de vida del crédito, originación y apetito de riesgo",
      "Laboratorio: embudo de originación, filtros, curva de estrategia, capacidad de pago y excepciones",
      cells)
