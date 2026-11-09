const L = require("./lib");
const J = require("../chart_data_m3.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M3 S3 - WoE, IV, optbinning y fastwoe", footer: "DataBank Academy · Módulo 3 · Sesión 3 · WoE, IV y binning óptimo con optbinning y fastwoe" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 3 · SESIÓN 3 DE 4", title: "Weight of Evidence, Information Value y binning óptimo",
    subtitle: "optbinning para diseñar tramos con restricciones; fastwoe para inferir sobre el WoE", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027" });
  L.sAgenda(D, { items: [
    { t: "WoE e IV", d: "Definición, cálculo manual, interpretación y reglas prácticas", min: 15 },
    { t: "optbinning", d: "Optimización con restricciones: tendencias, códigos especiales, categóricas, 2D, BinningProcess", min: 30 },
    { t: "fastwoe", d: "SE e IC del WoE, IV con test, sesgo de ruido, WoE condicional, alta cardinalidad", min: 25 },
    { t: "Estabilidad y comparación", d: "PSI por tramos y desempeño fuera de tiempo", min: 10 },
    { t: "Laboratorio", d: "Ambas librerías sobre el caso conductor", min: 40, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "WoE e IV", sub: "La escala de evidencia del scoring tradicional" });
  L.sFormula(D, { title: "Weight of Evidence e Information Value", formula: "WoEᵢ = ln(gᵢ / bᵢ)        IV = Σᵢ (gᵢ − bᵢ) · WoEᵢ", fsize: 32,
    where: [["gᵢ, bᵢ", "% de los buenos y % de los malos de la cartera que caen en el tramo i"], ["WoE > 0", "Menos riesgo que el promedio (convención clásica y de optbinning)"], ["IV", "Divergencia simétrica entre las distribuciones de buenos y malos"], ["Logística sobre WoE", "Coeficiente −1 si la variable estuviera sola"]],
    example: { h: "Tipo de ingreso (desarrollo)", t: ["Pensioner: 3,9 % de malos, WoE +0,86", "Working: 10,8 % de malos, WoE −0,25", "IV total = 0,138: poder medio", "Reglas: < 0,02 nulo; 0,1-0,3 medio; > 0,5 sospechoso"] } });
  L.sCards(D, { title: "¿Por qué discretizar y usar WoE en un scorecard?", cols: 3, cards: [
    { h: "No linealidades", t: "Cada tramo tiene su propio riesgo, con una logística simple." },
    { h: "Faltantes y especiales", t: "Son tramos propios con su propio WoE, sin imputar." },
    { h: "Outliers", t: "Quedan contenidos en el tramo extremo." },
    { h: "Monotonicidad", t: "Se puede imponer la tendencia esperada por negocio." },
    { h: "Auditabilidad", t: "Una tabla de puntos por tramo, fácil de revisar." },
    { h: "Costo", t: "Se pierde información dentro del tramo y hay saltos en los cortes." },
  ] });

  L.sSection(D, { num: 2, title: "optbinning", sub: "El binning como problema de optimización con restricciones" });
  L.sFlow(D, { title: "Cómo funciona OptimalBinning", steps: [
    { h: "Pre-binning", t: ["Árbol o cuantiles: hasta ~20 tramos iniciales"] },
    { h: "Formulación", t: ["Maximizar IV (o JS, Hellinger)", "Variables binarias: fusionar o no tramos vecinos"] },
    { h: "Restricciones", t: ["Tendencia, tamaño mínimo, n.° de tramos, p-valor entre vecinos"] },
    { h: "Solver", t: ["CP (OR-Tools) o MIP", "Solución óptima garantizada"] },
    { h: "Salida", t: ["Tabla de binning, WoE, análisis de calidad"] },
  ], note: "a diferencia de un árbol o de cuantiles, el resultado es el mejor binning posible sujeto a las restricciones que impone el negocio." });
  const ed = J.m3s3_edad;
  L.sChart(D, { title: "Tendencias monotónicas: el negocio define la forma", chart: { type: "bar", labels: ed.labels, series: [{ name: "Tasa de malos por tramo de edad", values: ed.event }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0%", valAxisLabelFormatCode: "0%", chartColors: [L.HEX.navy], catAxisLabelFontSize: 9 } },
    points: ["descending: 11 tramos, IV 0,174", "auto, peak y valley: misma solución (la curva ya es monótona)", "convex: 4 tramos, IV 0,158", "ascending (tendencia equivocada): 1 tramo, IV 0: el solver respeta incluso una restricción absurda"],
    source: "monotonic_trend admite auto, auto_asc_desc, ascending, descending, peak, valley, convex y concave. Notebook M03_S03, sección 2.1." });
  L.sTable(D, { title: "Códigos especiales, faltantes y restricciones estadísticas", colW: [3.6, 1.6, 2.0, 1.5, 3.43], rowH: 0.58,
    header: ["Tramo de DAYS_EMPLOYED", "Clientes", "Tasa de malos", "WoE", "Comentario"],
    rows: [["Más de 12,4 años", "3 398", "4,6 %", "+0,69", "Antigüedad alta: bajo riesgo"], ["8,1 a 12,4 años", "5 664", "7,5 %", "+0,17", ""], ["3,6 a 8,1 años", "14 994", "10,0 %", "−0,16", ""], ["Menos de 3,6 años", "12 972", "11,8 %", "−0,34", "Antigüedad baja: más riesgo"],
      [{ text: "Special (365243)", options: { bold: true, color: L.HEX.green } }, "8 064", "3,9 %", { text: "+0,86", options: { bold: true, color: L.HEX.green } }, "Pensionistas: tramo propio"]],
    note: "Sin declarar special_codes, los pensionistas quedan mezclados en el último tramo. Con max_pvalue = 0,05 se fusionan tramos vecinos no distinguibles. Quality score: 0,61.",
    notes: "binning_table.analysis() reporta Gini, IV, JS, Hellinger, KS, HHI, V de Cramér, quality score y tests entre tramos adyacentes." });
  L.sCards(D, { title: "Más funcionalidades avanzadas de optbinning", cols: 3, cards: [
    { h: "Categóricas", t: ["Agrupa categorías por tasa de malos", "cat_cutoff para poco frecuentes", "180 agencias → 7 tramos, IV 0,13"] },
    { h: "Binning 2D", t: ["OptimalBinning2D: dos variables a la vez", "Tendencia en cada eje", "EXT_SOURCE_2 × RCI: IV 0,652 vs. 0,664 sola → no aporta"] },
    { h: "BinningProcess", t: ["Todas las variables a la vez", "binning_fit_params por variable", "selection_criteria: IV y quality score"] },
    { h: "Scorecard", t: ["Escalamiento PDO u min-max", "Tabla de puntos detallada", "Sesión 4"] },
    { h: "Monitoreo", t: ["ScorecardMonitoring: PSI del score y de variables", "Tests de tasa de malos por tramo"] },
    { h: "Otras variantes", t: ["ContinuousOptimalBinning (LGD)", "MulticlassOptimalBinning", "Piecewise y por escenarios"] },
  ], notes: "Ojo: en BinningProcess, special_codes se aplica a todas las variables y, si es un diccionario, define grupos con nombre. Para un código de una sola variable, usar binning_fit_params." });

  L.sSection(D, { num: 3, title: "fastwoe", sub: "El WoE es una estimación: tiene error estándar" });
  const ci = J.m3s3_rci_ci;
  L.sChart(D, { title: "WoE con intervalos de confianza (fastwoe)", chart: { type: "line", labels: ci.labels,
      series: [{ name: "Límite superior IC 95 %", values: ci.hi }, { name: "WoE", values: ci.woe }, { name: "Límite inferior IC 95 %", values: ci.lo }],
      opts: { showLegend: true, lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 7, chartColors: [L.HEX.slate, L.HEX.crimson, L.HEX.slate], catAxisTitle: "Tramo de RCI (árbol con restricción monotónica)", showCatAxisTitle: true } },
    points: ["SE(WoE) = √(1/buenos + 1/malos)", "Tramos chicos: intervalos anchos", "Si dos tramos vecinos se solapan mucho, conviene fusionarlos", "Convención inversa: en fastwoe WoE > 0 = MÁS riesgo"],
    source: "FastWoe(binning_method='tree', monotonic_cst={'RCI': 1}). Notebook M03_S03, sección 3.1." });
  L.sTable(D, { title: "IV con test de significancia: detectar el ruido", colW: [3.6, 1.6, 1.3, 2.3, 1.6, 1.73], rowH: 0.65,
    header: ["Variable", "Categorías", "IV", "IV esperado por azar", "p-valor", "Veredicto"],
    rows: [["AGENCIA_ID", "180", "0,185", "0,050", "< 0,001", { text: "Significativa", options: { color: L.HEX.green, bold: true } }],
      ["NAME_INCOME_TYPE", "5", "0,138", "0,001", "< 0,001", { text: "Significativa", options: { color: L.HEX.green, bold: true } }],
      [{ text: "Ruido con 300 categorías", options: { bold: true, color: L.HEX.crimson } }, "300", "0,081", "0,084", "0,61", { text: "No significativa", options: { color: L.HEX.crimson, bold: true } }]],
    note: "Bajo 'sin poder predictivo', n_ef · IV ~ χ²(k−1) y E[IV] ≈ (k−1)/n_ef. La regla 'IV > 0,02' sin inferencia seleccionaría ruido puro.",
    notes: "fastwoe calcula el SE del IV por el método delta, tratando como estimados tanto el WoE como los pesos." });
  L.sCompare(D, { title: "WoE condicional: no contar dos veces la misma evidencia", left: { h: "WoE marginal (naive Bayes)", icon: "+", items: ["Suma el WoE de cada variable", "Supone independencia condicional", "'Pensionista' y 'mayor de 55' tienen IV similar: sumarlos duplica la evidencia de edad"] },
    right: { h: "WoE condicional (regla de Good)", icon: "|", items: ["El peso de cada variable se mide dentro de la población definida por las anteriores", "Dado que es pensionista, 'mayor de 55' aporta ≈ 0", "Los pesos condicionales suman el score exacto"] },
    verdict: "el orden de condicionamiento cambia la atribución entre variables, no el score: se fija con criterio de negocio. Las celdas con menos de 30 casos usan el peso marginal." });
  L.sCards(D, { title: "Más funcionalidades de fastwoe", cols: 3, cards: [
    { h: "WoePreprocessor", t: "Reduce la cardinalidad: 2 962 empleadores → 52 categorías; IV 0,144 significativo." },
    { h: "Categorías no vistas", t: "unseen='prior' asigna WoE 0 (odds de la cartera) a categorías nuevas en producción." },
    { h: "predict_ci", t: "Intervalo para la PD de cada cliente: identifica PDs inciertas para revisión humana." },
  ] });

  L.sSection(D, { num: 4, title: "Estabilidad y comparación", sub: "Lo que funciona en desarrollo debe sostenerse fuera de tiempo" });
  L.sTable(D, { title: "optbinning y fastwoe se complementan", colW: [2.6, 4.7, 4.83], rowH: 0.72,
    header: ["", "optbinning", "fastwoe"],
    rows: [["Fortaleza", "Optimización con restricciones (CP/MIP), monotonicidad flexible, 2D, scorecard, monitoreo", "Inferencia: SE e IC del WoE, IV con test, WoE condicional, IC de la predicción"],
      ["Convención WoE", "ln(%buenos / %malos): + = menos riesgo", "log-odds relativo de incumplir: + = más riesgo"],
      ["AUC fuera de tiempo", "0,772 (logística sobre WoE, 12 variables)", "0,764 (suma de WoE) · 0,773 (logística sobre WoE)"],
      ["Ideal para", "Construir y documentar el scorecard", "Validar, seleccionar sin ruido, explicar con incertidumbre"]],
    note: "PSI de los tramos 2025 vs. desarrollo: todos < 0,02 (estables). La logística sobre WoE supera a la suma directa porque re-pondera variables correlacionadas." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M03_S03_WoE_IV_optbinning_y_fastwoe.ipynb", data: ["hc_application_sintetico.csv", "Incluye AGENCIA_ID (180) y EMPLEADOR_ID (2 962)"], steps: [
    { h: "WoE e IV a mano", t: "Tabla completa para el tipo de ingreso" },
    { h: "optbinning", t: "Tendencias, códigos especiales, categóricas, 2D, BinningProcess" },
    { h: "fastwoe", t: "WoE con IC, IV con test y ruido, WoE condicional, alta cardinalidad" },
    { h: "IC para la predicción", t: "PDs inciertas para revisión humana" },
    { h: "Estabilidad y comparación", t: "PSI por tramos y AUC fuera de tiempo" },
  ] });
  L.sTakeaways(D, { items: [
    "WoE e IV miden la evidencia de cada tramo; el binning debe respetar la lógica de negocio.",
    "optbinning encuentra el binning óptimo bajo restricciones: tendencia, tamaño, significancia, especiales.",
    "El WoE y el IV son estimaciones: con muchas categorías, el IV del ruido parece predictivo sin un test.",
    "El WoE condicional evita el doble conteo de variables correlacionadas.",
    "Verifica siempre la convención de signo del WoE antes de comparar herramientas.",
  ], next: "construcción del scorecard, calibración, puntos de corte y decisiones." });
  await L.save(D, OUT);
})();
