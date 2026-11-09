const L = require("./lib");
const J = require("../chart_data_m3.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M3 S2 - Multicolinealidad, regularización y selección", footer: "DataBank Academy · Módulo 3 · Sesión 2 · Multicolinealidad, regularización y selección de variables" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 3 · SESIÓN 2 DE 4", title: "Multicolinealidad, regularización, selección de variables y métodos avanzados",
    subtitle: "De 23 candidatas a un modelo estable, explicable y que generaliza", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027" });
  L.sAgenda(D, { items: [
    { t: "Multicolinealidad", d: "Correlación, VIF, número de condición y coeficientes inestables", min: 20 },
    { t: "Regularización L1, L2 y elastic net", d: "Verosimilitud penalizada, trayectorias y validación cruzada", min: 20 },
    { t: "Selección de variables", d: "Negocio, filtros, stepwise AIC/BIC, L1, stability selection, permutación", min: 25 },
    { t: "Métodos avanzados", d: "Splines, interacciones, modelos segmentados y otros", min: 15 },
    { t: "Laboratorio", d: "VIF y bootstrap, trayectorias, stepwise, estabilidad, splines", min: 40, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "Multicolinealidad", sub: "No sesga las predicciones, pero destruye la interpretación" });
  L.sFormula(D, { title: "Diagnóstico de multicolinealidad", formula: "VIFⱼ = 1 / (1 − R²ⱼ)        κ = σ_max / σ_min", fsize: 32,
    where: [["R²ⱼ", "R² de regresar xⱼ contra las demás variables"], ["VIF > 5-10", "Señal de colinealidad problemática"], ["κ (condición)", "Número de condición de X estandarizada; > 30 indica colinealidad severa"], ["|ρ| > 0,7", "Alerta por pares (no detecta combinaciones de varias variables)"]],
    example: { h: "En el caso (11 numéricas)", t: ["log(bien) VIF 205 y log(crédito) VIF 205: casi la misma variable", "log(cuota) 9,0; LTI 8,4; RCI 5,7", "Número de condición: 40,9", "EXT_PROM incluye a EXT_SOURCE_2"] },
    notes: "Valores del notebook M03_S02, sección 1." });
  L.sTable(D, { title: "Consecuencia: coeficientes inestables y signos que cambian", colW: [3.2, 2.2, 2.2, 2.3, 2.23], rowH: 0.62,
    header: ["Variable", "Media (con redundantes)", "Desv. (con redundantes)", "% bootstraps con signo negativo", "Desv. (sin redundantes)"],
    rows: [["log(crédito)", "+0,78", { text: "0,78", options: { color: L.HEX.crimson, bold: true } }, { text: "16 %", options: { color: L.HEX.crimson, bold: true } }, "0,07"],
      ["log(bien)", "−0,79", { text: "0,77", options: { color: L.HEX.crimson, bold: true } }, { text: "84 %", options: { color: L.HEX.crimson, bold: true } }, "—"],
      ["EXT_SOURCE_2", "−0,84", "0,53", "95 %", "—"], ["EXT_PROM", "−4,45", "0,63", "100 %", "0,27"], ["log(ingreso)", "−0,27", "0,10", "100 %", "0,10"]],
    note: "200 muestras bootstrap de 8 000 clientes. El modelo predice igual, pero ningún comité aprobaría un scorecard donde 'más monto' a veces suma y a veces resta riesgo.",
    notes: "Remedios: eliminar redundantes con criterio de negocio y VIF, construir ratios (RCI), regularizar o trabajar con WoE." });

  L.sSection(D, { num: 2, title: "Regularización", sub: "Verosimilitud penalizada: L1, L2 y elastic net" });
  L.sFormula(D, { title: "Verosimilitud penalizada", formula: "max  ℓ(β) − λ [ α‖β‖₁ + (1 − α)/2 · ‖β‖₂² ]        C = 1/λ", fsize: 28,
    where: [["L2 (α = 0)", "Encoge todos los coeficientes sin anularlos: estabilidad ante colinealidad"], ["L1 (α = 1)", "Anula coeficientes: selecciona variables"], ["Elastic net", "Selecciona y reparte el peso entre variables correlacionadas"], ["Estandarizar", "Indispensable: si no, la penalización depende de las unidades"]],
    example: { h: "Resultado en el caso", t: ["Validación cruzada (log-loss, 5 folds)", "Mejor: elastic net α = 0,5, C = 0,032", "21 de 23 variables con coeficiente ≠ 0", "AUC fuera de tiempo: 0,770"] } });
  const l1 = J.m3s2_l1; const names = Object.keys(l1.series);
  L.sChart(D, { title: "Trayectoria L1: las variables entran una a una", chart: { type: "line", labels: l1.labels,
      series: names.map(n => ({ name: n, values: l1.series[n] })),
      opts: { showLegend: true, legendPos: "r", lineSize: 2.5, lineDataSymbol: "none", catAxisTitle: "log10(C)   (← más penalización)", showCatAxisTitle: true, valAxisTitle: "coeficiente estandarizado", showValAxisTitle: true,
        chartColors: [L.HEX.navy, L.HEX.slate, L.HEX.gold, L.HEX.crimson, L.HEX.green, L.HEX.teal, "7B2D8E", "E4572E"] } },
    points: ["Con mucha penalización solo sobreviven los scores externos; luego entran edad, RCI, pensionista y antigüedad", "De las gemelas, L1 elige solo una (log(bien)), tarde y con peso pequeño; log(crédito) queda en cero", "El punto de la trayectoria se elige por validación cruzada"],
    source: "15 000 clientes de desarrollo, variables estandarizadas. Notebook M03_S02, sección 2." });

  L.sSection(D, { num: 3, title: "Selección de variables", sub: "Cinco enfoques y una regla de oro" });
  L.sTable(D, { title: "Cinco enfoques de selección", colW: [2.4, 3.3, 3.1, 3.33], rowH: 0.7,
    header: ["Enfoque", "Ejemplo", "Ventaja", "Riesgo"],
    rows: [["Negocio", "Excluir variables no explicables o prohibidas", "Interpretabilidad, cumplimiento", "Sesgo del experto"], ["Filtro", "IV, Gini univariado, correlación", "Rápido y entendible", "Ignora redundancia"],
      ["Wrapper", "Stepwise con AIC/BIC", "Considera el modelo conjunto", "Inestable, p-valores sesgados"], ["Embebido", "L1 / elastic net", "Selección y estimación a la vez", "Elige una al azar entre gemelas"],
      ["Estabilidad", "L1 en 60 submuestras (stability selection)", "Robusto ante el muestreo", "Costo computacional"]],
    note: "Regla de oro: toda selección se hace solo con datos de desarrollo; seleccionar con todos los datos y luego validar infla el desempeño." });
  L.sChart(D, { title: "Menos variables, el mismo desempeño fuera de tiempo", chart: { type: "bar", labels: ["Todas (23)", "Top 8 por Gini univariado", "Stepwise AIC (15)", "Stepwise BIC (11)", "Stability selection (10)"],
      series: [{ name: "AUC fuera de tiempo (2025)", values: [0.7700, 0.7575, 0.7708, 0.7710, 0.7707] }],
      opts: { barDir: "bar", showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.000", valAxisMinVal: 0.74, valAxisMaxVal: 0.775, chartColors: [L.HEX.navy] } },
    points: ["El top por Gini univariado elige variables redundantes (las EXT y su promedio)", "BIC y estabilidad: 10-11 variables con el AUC de 23", "Menos variables = más estabilidad, explicabilidad y menos costo de monitoreo"],
    source: "Logística estimada en 2022-2024 y evaluada en 2025. Notebook M03_S02, sección 3.",
    notes: "Ojo con la importancia por permutación en el modelo completo: log(crédito) aparece como la más importante porque permutarla rompe el equilibrio con su gemela. Es un artefacto de la multicolinealidad." });

  L.sSection(D, { num: 4, title: "Métodos avanzados", sub: "Más allá de la logística lineal" });
  L.sCompare(D, { title: "Splines e interacciones: flexibilidad con evidencia", left: { h: "Splines", icon: "~", items: ["Polinomios por tramos unidos suavemente", "EXT_SOURCE_2 con spline: log-loss 0,2010 vs. 0,2013 lineal", "RCI con spline: no mejora (0,2015)", "Agregar flexibilidad solo donde la evidencia fuera de tiempo lo justifica"] },
    right: { h: "Interacciones", icon: "×", items: ["El efecto de una variable depende de otra", "EXT_SOURCE_2 × canal digital: LR = 0,26, p = 0,61", "No significativa: no se incluye", "Partir de hipótesis de negocio o de interacciones detectadas por árboles (Módulo 4)"] },
    verdict: "cada grado de libertad extra es algo más que validar, monitorear y explicar al comité." });
  L.sTable(D, { title: "Panorama de métodos avanzados para modelos logísticos", colW: [3.0, 4.6, 4.53], rowH: 0.62,
    header: ["Método", "Idea", "Cuándo usarlo"],
    rows: [["Firth (sesión 1)", "Verosimilitud penalizada con prior de Jeffreys", "Eventos raros, separación"], ["Modelos segmentados", "Un scorecard por población", "Nuevos vs. recurrentes, productos distintos"],
      ["GAM / splines", "Log-odds aditivo y no lineal", "No linealidades fuertes con interpretabilidad"], ["WoE + logística (sesión 3)", "Discretización óptima con monotonicidad", "Estándar de la industria"],
      ["Logística bayesiana (Módulo 6)", "Priors sobre los coeficientes", "Poca data, conocimiento experto"], ["Restricciones de signo", "Coeficientes con el signo esperado", "Requisito regulatorio o de negocio"], ["Reject inference", "Incorporar a los rechazados", "Sesgo de selección en originación"]] });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M03_S02_Multicolinealidad_Regularizacion_y_Seleccion.ipynb", data: ["hc_application_sintetico.csv", "23 variables candidatas", "Desarrollo 2022-2024, fuera de tiempo 2025"], steps: [
    { h: "Multicolinealidad", t: "Correlaciones, VIF, número de condición y bootstrap de coeficientes" },
    { h: "Regularización", t: "Trayectorias L2, elastic net y L1; validación cruzada" },
    { h: "Selección", t: "Filtro, stepwise AIC/BIC, L1, stability selection, permutación" },
    { h: "Splines", t: "Efecto no lineal de EXT_SOURCE_2 y RCI" },
    { h: "Interacciones", t: "Test de razón de verosimilitud" },
  ] });
  L.sTakeaways(D, { items: [
    "La multicolinealidad no daña la predicción, pero vuelve inestables los coeficientes y sus signos.",
    "L2 estabiliza, L1 selecciona y elastic net reparte el peso entre variables correlacionadas.",
    "Selecciona solo con desarrollo; prefiere métodos estables (BIC, stability selection) y valida fuera de tiempo.",
    "Splines e interacciones solo cuando la evidencia fuera de tiempo lo justifica.",
  ], next: "WoE, IV y binning óptimo con optbinning y fastwoe." });
  await L.save(D, OUT);
})();
