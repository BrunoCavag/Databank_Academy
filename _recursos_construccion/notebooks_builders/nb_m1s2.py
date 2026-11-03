from nbhelper import build
from nbhelper import SETUP
import sys
M1 = sys.argv[1]

cells = [
("md", """
## Objetivos de la sesión (2 horas)

1. Construir desde datos crédito-mes los **indicadores de calidad de cartera** que reporta un banco peruano: cartera atrasada, mora por tramos, cartera pesada, castigos y coberturas.
2. Entender por qué la **mora contable engaña**: efecto denominador (crecimiento) y efecto castigos.
3. Calcular **provisiones** con las categorías de la Res. SBS N.° 11356-2008 y el **costo de riesgo**.
4. Leer **cosechas** (*vintages*) y **roll rates** como indicadores adelantados.
5. Armar un **P&L simplificado por producto**: margen, pérdidas y contribución.

**Datos:** `cartera_panel_mensual.csv.gz`: panel **sintético** de 16 mil créditos minoristas (tarjeta, consumo, microempresa, vehicular, hipotecario), originados entre enero de 2022 y diciembre de 2025, y observados mes a mes hasta septiembre de 2026. Incluye atraso, castigos y recuperaciones. El riesgo responde a un índice macro ilustrativo (`macro_peru_ilustrativa.csv`).

| Bloque | Tiempo | Contenido |
|---|---|---|
| 1 | 15 min | Estructura del panel crédito-mes |
| 2 | 30 min | Indicadores de calidad de cartera y sus trampas |
| 3 | 25 min | Provisiones SBS, cobertura y costo de riesgo |
| 4 | 25 min | Cosechas y roll rates |
| 5 | 15 min | Rentabilidad por producto |
| 6 | 10 min | Ejercicios |
"""),
("code", SETUP),
("md", "## 1. El panel crédito-mes"),
("code", """
p = pd.read_csv(DATA / "cartera_panel_mensual.csv.gz")
macro = pd.read_csv(DATA / "macro_peru_ilustrativa.csv")
sbs = pd.read_csv(DATA / "sbs_categorias_provisiones_consumo.csv")
print(p.shape); display(p.head(8)); display(sbs)
"""),
("code", """
# Un crédito a lo largo de su vida
ejemplo = p[p.id_credito == p.loc[p.monto_castigo > 0, "id_credito"].iloc[3]]
ejemplo[["id_credito", "producto", "cosecha", "periodo", "mob", "saldo", "dias_atraso", "bucket_atraso", "estado", "monto_castigo", "recupero"]]
"""),
("md", """
## 2. Indicadores de calidad de cartera

Definiciones simplificadas (alineadas con la terminología SBS):

| Indicador | Fórmula |
|---|---|
| Colocaciones | Saldo de créditos vigentes en balance |
| **Cartera atrasada / Mora** | Saldo con más de 30 días de atraso ÷ colocaciones (*simplificación del criterio contable SBS de crédito vencido*) |
| Mora 60+ / 90+ | Saldo con más de 60 / 90 días ÷ colocaciones |
| **Cartera pesada** | Saldo en Deficiente + Dudoso + Pérdida ÷ colocaciones |
| **Castigos** | Saldo retirado del balance (en este panel, al día 181) |
| Mora ajustada por castigos | (Atrasada + castigos 12 m) ÷ (colocaciones + castigos 12 m) |
| Mora rezagada | Atrasada_t ÷ colocaciones_{t−12} |
"""),
("code", """
vig = p[p.estado == "Vigente"].copy()
vig["cat_sbs"] = pd.cut(vig.dias_atraso, [-1, 8, 30, 60, 120, 10_000], labels=sbs.categoria.tolist())
tasa_prov = dict(zip(sbs.categoria, sbs.provision_sin_garantia_pct / 100))
vig["provision"] = vig.saldo * vig.cat_sbs.map(tasa_prov).astype(float)

def indicadores(df_vig, df_all):
    g = df_vig.groupby("periodo")
    ind = pd.DataFrame({
        "colocaciones": g.saldo.sum(),
        "atrasada": g.apply(lambda d: d.loc[d.dias_atraso > 30, "saldo"].sum()),
        "mora60": g.apply(lambda d: d.loc[d.dias_atraso > 60, "saldo"].sum()),
        "mora90": g.apply(lambda d: d.loc[d.dias_atraso > 90, "saldo"].sum()),
        "pesada": g.apply(lambda d: d.loc[d.dias_atraso > 30, "saldo"].sum()),  # Deficiente+ en consumo = >30 días
        "provisiones": g.provision.sum(),
    })
    ga = df_all.groupby("periodo")
    ind["castigos"] = ga.monto_castigo.sum().reindex(ind.index).fillna(0)
    ind["recuperos"] = ga.recupero.sum().reindex(ind.index).fillna(0)
    ind["castigos_12m"] = ind.castigos.rolling(12, min_periods=1).sum()
    ind["ratio_mora"] = ind.atrasada / ind.colocaciones
    ind["ratio_mora60"] = ind.mora60 / ind.colocaciones
    ind["ratio_mora90"] = ind.mora90 / ind.colocaciones
    ind["mora_ajustada"] = (ind.atrasada + ind.castigos_12m) / (ind.colocaciones + ind.castigos_12m)
    ind["mora_rezagada"] = ind.atrasada / ind.colocaciones.shift(12)
    ind["cobertura"] = ind.provisiones / ind.atrasada
    # costo de riesgo anualizado: (gasto de provisiones = Δprov + castigos - recuperos) / colocaciones promedio
    ind["gasto_prov"] = ind.provisiones.diff() + ind.castigos - ind.recuperos
    ind["costo_riesgo"] = ind.gasto_prov.rolling(12).sum() / ind.colocaciones.rolling(12).mean()
    return ind

# Foco: cartera de CONSUMO (tarjeta + consumo no revolvente), donde aplican los tramos de atraso usados
cons = ["Tarjeta de crédito", "Consumo no revolvente"]
ind = indicadores(vig[vig.producto.isin(cons)], p[p.producto.isin(cons)])
ind = ind.loc["2022-07":]
ind.loc[:"2023-06", "mora_rezagada"] = np.nan        # requiere 12 meses de cartera madura para ser interpretable
ind[["colocaciones", "ratio_mora", "ratio_mora90", "mora_ajustada", "mora_rezagada", "cobertura", "costo_riesgo"]].iloc[::3]
"""),
("code", """
fig, ax = plt.subplots(1, 2, figsize=(14, 4.5))
(ind.colocaciones / 1e6).plot(ax=ax[0], color=AZUL, lw=2); ax[0].set_title("Colocaciones de consumo (S/ MM)")
for col, c, lab in [("ratio_mora", AZUL, "Mora contable (>30d)"), ("mora_ajustada", ROJO, "Mora ajustada por castigos"),
                    ("mora_rezagada", ORO, "Mora rezagada 12m")]:
    ind[col].plot(ax=ax[1], color=c, lw=2, label=lab)
ax[1].yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}")); ax[1].legend(); ax[1].set_title("Tres lecturas del mismo riesgo")
plt.tight_layout(); plt.show()
"""),
("md", """
**Lectura obligatoria para el comité:**
- La **mora contable** puede bajar porque (a) la cartera **crece** y el denominador se infla con créditos nuevos que aún no maduran, o (b) se **castiga** cartera que deja de estar en balance.
- La **mora ajustada por castigos** devuelve al numerador lo que salió por castigo: es casi siempre bastante más alta.
- La **mora rezagada** compara la mora de hoy con la cartera de hace 12 meses y corrige el efecto crecimiento.

> Pregunta: si tu mora contable se mantiene en 4 %, pero la ajustada pasa de 8 % a 11 %, ¿qué está pasando y qué le dirías al gerente comercial?
"""),
("code", """
# Riesgo vs. ciclo macro
m = macro.set_index("periodo").loc[ind.index]
fig, ax1 = plt.subplots(figsize=(11, 4.2))
ax1.plot(ind.index, ind.mora_ajustada, color=ROJO, lw=2, label="Mora ajustada (consumo)")
ax2 = ax1.twinx(); ax2.plot(ind.index, m.indice_estres_simulado, color=GRIS, ls="--", label="Índice de estrés macro"); ax2.grid(False)
ax1.set_xticks(ind.index[::6]); ax1.tick_params(axis="x", rotation=45)
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}")); ax1.legend(loc="upper left"); ax2.legend(loc="upper right")
ax1.set_title("La calidad de cartera responde al ciclo con rezago"); plt.tight_layout(); plt.show()
"""),
("md", """
## 3. Provisiones SBS, cobertura y costo de riesgo

En la **Res. SBS N.° 11356-2008**, el deudor minorista se clasifica según sus días de atraso y cada categoría tiene una tasa mínima de provisión (créditos sin garantía). La provisión de la categoría *Normal* es **genérica** y puede incluir un componente procíclico; las demás son **específicas**.

> Nota: las tablas cargadas son una referencia didáctica para consumo sin garantías. En la práctica las tasas dependen del tipo de crédito, las garantías y las modificaciones normativas vigentes. **Valida siempre contra la norma actualizada.**
"""),
("code", """
ult = vig[(vig.periodo == "2026-06") & vig.producto.isin(cons)]
dist = ult.groupby("cat_sbs", observed=True).agg(saldo=("saldo", "sum"), provision=("provision", "sum"))
dist["pct_saldo"] = dist.saldo / dist.saldo.sum()
dist["tasa_efectiva"] = dist.provision / dist.saldo
display(dist.style.format({"saldo": "{:,.0f}", "provision": "{:,.0f}", "pct_saldo": "{:.1%}", "tasa_efectiva": "{:.1%}"}))
print(f"Provisión total / colocaciones: {dist.provision.sum() / dist.saldo.sum():.2%}")
print(f"Cobertura de cartera atrasada: {ind.loc['2026-06', 'cobertura']:.0%}")
"""),
("code", """
fig, ax = plt.subplots(1, 2, figsize=(14, 4.2))
ind.cobertura.plot(ax=ax[0], color=VERDE, lw=2); ax[0].set_title("Cobertura: provisiones / cartera atrasada")
ax[0].yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
ind.costo_riesgo.plot(ax=ax[1], color=ROJO, lw=2); ax[1].set_title("Costo de riesgo anualizado (gasto de provisiones / colocaciones)")
ax[1].yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
plt.tight_layout(); plt.show()
"""),
("md", """
**Puente hacia IFRS 9 (Módulo 7):** la provisión SBS es *incurrida/regulatoria* por categoría. IFRS 9 exige **pérdida crediticia esperada** con información prospectiva:
$$ECL = \\sum_t PD_t \\times LGD_t \\times EAD_t \\times DF_t$$
con *staging* (12 meses vs. vida del crédito). Hoy medimos lo que **ya pasó**; en el Módulo 7 mediremos lo que **esperamos que pase**.

## 4. Cosechas (*vintage analysis*)
Una cosecha agrupa los créditos desembolsados en el mismo período y sigue su desempeño por **meses en libros (MOB)**. Permite comparar originaciones **a igual madurez**, sin el efecto denominador.

Indicador: % del monto desembolsado de la cosecha que llegó alguna vez a **60+ días o castigo** hasta el MOB *k* (*ever 60+*).
"""),
("code", """
pc = p[p.producto.isin(cons)].copy()
pc["cosecha_q"] = pd.PeriodIndex(pc.cosecha, freq="M").asfreq("Q").astype(str)
pc["malo"] = (pc.dias_atraso > 60) | (pc.monto_castigo > 0)
primer_malo = pc[pc.malo].groupby("id_credito").mob.min()
creditos = pc.drop_duplicates("id_credito").set_index("id_credito")[["cosecha_q", "monto_desembolsado"]]
creditos["mob_malo"] = primer_malo
max_mob_cosecha = pc.groupby("cosecha_q").mob.max()

curvas = {}
for q, d in creditos.groupby("cosecha_q"):
    mobs = range(1, min(max_mob_cosecha[q], 36) + 1)
    curvas[q] = pd.Series([d.loc[d.mob_malo <= k, "monto_desembolsado"].sum() / d.monto_desembolsado.sum() for k in mobs], index=list(mobs))
vint = pd.DataFrame(curvas)

fig, ax = plt.subplots(figsize=(11, 5))
cmap = plt.cm.viridis(np.linspace(0, 1, vint.shape[1]))
for c, col in zip(vint.columns, cmap):
    ax.plot(vint.index, vint[c], color=col, lw=1.8, label=c)
ax.set_xlabel("Meses en libros (MOB)"); ax.set_ylabel("% monto ever 60+"); ax.set_title("Curvas de cosecha – consumo")
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}")); ax.legend(ncol=2, fontsize=8); plt.show()
"""),
("code", """
# Tabla tipo "triángulo" a MOB 3, 6, 12, 18
vint.loc[[3, 6, 12, 18]].T.style.format("{:.2%}", na_rep="—").background_gradient(cmap="RdYlGn_r", axis=None)
"""),
("md", """
**Lectura:** las cosechas de 2022-T4 y 2023 (originadas en un entorno de inflación y tasas altas) se deterioran **más rápido y más alto**. Las de 2024-2025 tienen mejores curvas a igual MOB. Ésta es la señal adelantada que la mora contable no da.

## 5. Roll rates: la dinámica de la morosidad
La matriz de transición muestra la probabilidad de que un crédito pase de un tramo de atraso a otro en un mes.
"""),
("code", """
orden = ["0", "1-30", "31-60", "61-90", "91-120", "121-180", "181+"]
pr = p[p.producto.isin(cons) & (p.estado != "Cancelado")].sort_values(["id_credito", "mob"])
pr = pr[~((pr.estado == "Castigado") & (pr.monto_castigo == 0))]          # quitamos filas post-castigo (recuperos)
pr["bucket_sig"] = pr.groupby("id_credito").bucket_atraso.shift(-1)
ventana = pr[(pr.periodo >= "2025-07") & (pr.periodo <= "2026-06") & pr.bucket_sig.notna() & (pr.bucket_atraso != "181+")]
rr = pd.crosstab(ventana.bucket_atraso, ventana.bucket_sig, normalize="index").reindex(index=orden[:-1], columns=orden).fillna(0)
rr.style.format("{:.1%}").background_gradient(cmap="Blues", axis=1)
"""),
("code", """
# Roll rate "hacia adelante" (forward roll) y tasa de cura
fwd = {orden[i]: rr.loc[orden[i], orden[i + 1]] for i in range(len(orden) - 1)}
cura = rr["0"]
res = pd.DataFrame({"roll_forward": fwd, "cura_a_0": cura})
res["prob_acum_castigo"] = res.roll_forward[::-1].cumprod()[::-1]
res.style.format("{:.1%}")
"""),
("md", """
`prob_acum_castigo` en el tramo `0` aproxima la probabilidad de que un crédito al día llegue a castigo **si las tasas se mantienen** (es una cadena de Markov). Es el puente intuitivo hacia las matrices de transición y la PD de vida del Módulo 7.

## 6. Rentabilidad por producto: el P&L de riesgo
Supuestos: costo de fondeo 5.5 % anual sobre saldo, costo operativo anual por producto (tarjeta 9 %, consumo 5 %, micro 8 %, vehicular 2.5 %, hipotecario 1.2 %). Los intereses se devengan sólo sobre créditos con 90 días de atraso o menos.
"""),
("code", """
opex = {"Tarjeta de crédito": .09, "Consumo no revolvente": .05, "Microempresa": .08, "Vehicular": .025, "Hipotecario": .012}
v12 = vig[(vig.periodo > "2025-06") & (vig.periodo <= "2026-06")].copy()
v12["ingreso_int"] = np.where(v12.dias_atraso <= 90, v12.saldo * v12.tasa_anual / 12, 0)
v12["costo_fondeo"] = v12.saldo * 0.055 / 12
v12["costo_op"] = v12.saldo * v12.producto.map(opex) / 12
a12 = p[(p.periodo > "2025-06") & (p.periodo <= "2026-06")]

pl = v12.groupby("producto").agg(saldo_prom=("saldo", lambda s: s.sum() / 12), ingreso_int=("ingreso_int", "sum"),
                                 costo_fondeo=("costo_fondeo", "sum"), costo_op=("costo_op", "sum"))
pl["perdida_neta"] = a12.groupby("producto").monto_castigo.sum() - a12.groupby("producto").recupero.sum()
pl["contribucion"] = pl.ingreso_int - pl.costo_fondeo - pl.costo_op - pl.perdida_neta
for c in ["ingreso_int", "costo_fondeo", "costo_op", "perdida_neta", "contribucion"]:
    pl[c + "_%"] = pl[c] / pl.saldo_prom
pl[["saldo_prom", "ingreso_int_%", "costo_fondeo_%", "costo_op_%", "perdida_neta_%", "contribucion_%"]].style.format(
    {"saldo_prom": "{:,.0f}", **{c: "{:.1%}" for c in pl.columns if c.endswith("_%")}})
"""),
("code", """
w = pl[["ingreso_int_%", "costo_fondeo_%", "costo_op_%", "perdida_neta_%", "contribucion_%"]].copy()
w[["costo_fondeo_%", "costo_op_%", "perdida_neta_%"]] *= -1
ax = w.plot(kind="bar", figsize=(12, 4.5), color=[AZUL, GRIS, ORO, ROJO, VERDE])
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}")); ax.set_title("P&L de riesgo por producto (% del saldo promedio)")
ax.axhline(0, color="black", lw=.8); plt.xticks(rotation=0); plt.tight_layout(); plt.show()
"""),
("md", """
**Mensaje clave:** el producto con **mayor mora** (tarjeta, micro) puede ser también el de **mayor contribución**, porque la tasa lo compensa. La pregunta correcta no es "¿cuánta mora tengo?", sino "¿mi precio paga la pérdida, el costo y el capital?" (Módulo 8, RAROC).

## 7. Ejercicios
1. Recalcula los indicadores para **Microempresa**. ¿La mora ajustada se comporta igual que en consumo?
2. Construye la curva de cosechas con el indicador **ever 30+ a MOB 6** (*30@6*), muy usado en originación.
3. Estima el impacto en provisiones de que 10 % del saldo *Normal* migre a *CPP*.
4. ¿Qué nivel de pérdida neta haría que la tarjeta tenga contribución cero? (punto de equilibrio).
"""),
]

build(f"{M1}/notebooks/M01_S02_Calidad_de_Cartera_Provisiones_y_Rentabilidad.ipynb",
      "Módulo 1 · Sesión 2: Calidad de cartera, pérdidas, provisiones y rentabilidad",
      "Laboratorio: indicadores de mora, castigos, provisiones SBS, cosechas, roll rates y P&L por producto",
      cells)
