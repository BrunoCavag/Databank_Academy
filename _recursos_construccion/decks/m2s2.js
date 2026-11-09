const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M2 S2 - Estimadores, intervalos y teoremas límite", footer: "DataBank Academy · Módulo 2 · Sesión 2 · Muestra, estimadores, intervalos y teoremas límite" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 2 · SESIÓN 2 DE 4", title: "Muestra, estimadores, intervalos y teoremas límite",
    subtitle: "Cuánto sabemos realmente de una PD estimada con datos", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Sesión 1: la PD como probabilidad. Hoy: la PD como algo que estimamos con datos finitos, y por lo tanto con incertidumbre." });
  L.sAgenda(D, { items: [
    { t: "Población, muestra y estimadores", d: "Sesgo, varianza, error cuadrático medio y shrinkage", min: 20 },
    { t: "Intervalos de confianza para una PD", d: "Wald, Wilson, Clopper-Pearson y Jeffreys", min: 20 },
    { t: "Distribuciones muestrales, LGN, TLC y bootstrap", d: "Por qué funcionan los intervalos y cómo medir la incertidumbre del AUC", min: 20 },
    { t: "Más intervalos y tamaño de muestra", d: "Diferencia de PDs, LGD promedio y clientes necesarios", min: 20 },
    { t: "Laboratorio", d: "Simulaciones, IC, bootstrap y tamaño de muestra", min: 40, lab: true },
  ] });
  L.sSection(D, { num: 1, title: "Población, muestra y estimadores", sub: "La tasa de default observada es un estimador, no la PD" });
  L.sCompare(D, { title: "Parámetro vs. estimador", left: { h: "Parámetro (población)", icon: "θ", items: ["La PD verdadera del segmento: p", "Fija pero desconocida", "Es lo que queremos para provisionar, fijar precios y calcular capital"] },
    right: { h: "Estimador (muestra)", icon: "θ̂", items: ["La tasa observada: p̂ = defaults / n", "Variable: cambia con cada muestra", "Tiene sesgo, varianza y una distribución muestral"] },
    verdict: "toda PD reportada debería venir acompañada de una medida de su incertidumbre, sobre todo en segmentos chicos." });
  L.sFormula(D, { title: "Sesgo, varianza y error cuadrático medio", formula: "ECM(θ̂) = E[(θ̂ − θ)²] = Sesgo(θ̂)² + Var(θ̂)", fsize: 30,
    where: [["Sesgo", "E[θ̂] − θ: error sistemático"], ["Var(p̂)", "p(1 − p) / n: se reduce con más datos"], ["Shrinkage", "p̂_s = n/(n+k) · p̂ + k/(n+k) · p̄: encoge hacia la media de la cartera"], ["Trade-off", "Un poco de sesgo puede reducir mucho la varianza"]],
    example: { h: "Segmento chico: n = 40, PD real 15 %", t: ["Tasa cruda: sesgo ≈ 0, ECM = 0,0032", "Shrinkage (k = 30): sesgo −3 pp, ECM = 0,0019", "40 % menos error total", "La misma idea vuelve en regularización (M3), CatBoost (M5) y Bayes (M10)"] } });
  const se = J.m2s2_se;
  L.sChart(D, { title: "La incertidumbre de una PD cae con √n", chart: { type: "bar", labels: se.labels.map(x => "n = " + x), series: [{ name: "Error estándar de la PD (p = 8 %)", values: se.values }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0%", valAxisLabelFormatCode: "0.0%", chartColors: [L.HEX.navy] } },
    points: ["Con 50 créditos, una PD de 8 % tiene un error estándar de ±3,8 pp", "Multiplicar n por 4 solo reduce el error a la mitad", "Por eso los segmentos chicos requieren agrupar, encoger o usar priors"],
    source: "SE = √(p(1 − p)/n). Notebook M02_S02, sección 1." });

  L.sSection(D, { num: 2, title: "Intervalos de confianza para una PD", sub: "No todos los intervalos son iguales" });
  L.sTable(D, { title: "Cuatro formas de construir un intervalo para una PD", colW: [2.4, 4.6, 5.13], rowH: 0.75,
    header: ["Método", "Idea", "Cuándo usarlo"],
    rows: [["Wald", "p̂ ± z·√(p̂(1 − p̂)/n)", { text: "Solo con n grande y p lejos de 0. Puede dar límites negativos", options: { color: L.HEX.crimson } }],
      ["Wilson", "Invierte el test score de la Binomial", "Buena opción por defecto"],
      ["Clopper-Pearson", "Exacto, a partir de la distribución Binomial", "Conservador: garantiza al menos 95 % de cobertura"],
      ["Jeffreys", "Bayesiano con prior Beta(½, ½)", "Estándar en backtesting de PD (BCE / EBA)"]],
    side: ["Ejemplo: 2 defaults en 150", "Wald: [0,0 %; 3,2 %]", "Wilson: [0,4 %; 4,7 %]", "Jeffreys: [0,3 %; 4,2 %]"], w: 9.2,
    notes: "El Wald 'recorta' en cero e infravalora el límite superior: justamente el que importa para no subestimar el riesgo." });
  const cb = J.m2s2_cob;
  L.sChart(D, { title: "¿El IC al 95 % cubre la PD real el 95 % de las veces?", chart: { type: "line", labels: cb.labels.map(x => "n = " + x),
      series: ["Wald", "Wilson", "Clopper-Pearson", "Jeffreys"].map(n => ({ name: n, values: cb[n] })),
      opts: { showLegend: true, valAxisLabelFormatCode: "0%", valAxisMinVal: 0.5, valAxisMaxVal: 1, lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 7, chartColors: [L.HEX.crimson, L.HEX.navy, L.HEX.green, L.HEX.gold], valAxisTitle: "Cobertura real (PD = 3 %)", showValAxisTitle: true } },
    points: ["Wald cubre mucho menos que el 95 % prometido con n chico", "Wilson y Jeffreys se acercan al nominal", "Clopper-Pearson queda por encima: es conservador"],
    source: "5 000 simulaciones por punto. Notebook M02_S02, sección 2.",
    notes: "Mensaje práctico: en carteras de bajo default o segmentos chicos, no usar Wald." });

  L.sSection(D, { num: 3, title: "Teoremas límite y bootstrap", sub: "Las bases de la inferencia práctica" });
  L.sCards(D, { title: "Dos teoremas que usamos todos los días", cols: 2, cards: [
    { h: "Ley de los grandes números", t: ["p̂_n → p cuando n → ∞", "Con suficientes créditos, la tasa observada converge a la PD", "Justifica estimar la PD con frecuencias históricas", "Ojo: requiere estabilidad del proceso (el ciclo cambia la PD)"] },
    { h: "Teorema central del límite", t: ["(p̂ − p) / √(p(1−p)/n) → N(0, 1)", "La pérdida promedio se vuelve normal aunque cada pérdida sea muy asimétrica", "Justifica los intervalos y tests basados en z", "Ojo: con correlación (M2 S1), la cola de la cartera no es normal"] },
  ], notes: "En el laboratorio se simulan ambos teoremas con pérdidas Bernoulli × LGD beta." });
  L.sFlow(D, { title: "Bootstrap: incertidumbre sin fórmula", steps: [
    { h: "Remuestrear", t: ["Tomar n observaciones con reemplazo de la muestra original"] },
    { h: "Recalcular", t: ["Calcular la métrica (AUC, Gini, KS, PD del segmento)"] },
    { h: "Repetir", t: ["300 a 1 000 veces"] },
    { h: "Percentiles", t: ["IC 95 %: percentiles 2,5 y 97,5 de la distribución bootstrap"] },
  ], note: "AUC del score de buró = 0,731 con IC 95 % bootstrap [0,724; 0,738]. Diferencias de AUC menores al ancho del IC no son concluyentes.", notes: "Muy útil en comparaciones champion–challenger de modelos (Módulo 7)." });

  L.sCards(D, { title: "Distribución muestral: la idea que conecta todo", cols: 3, cards: [
    { h: "Qué es", t: "La distribución que tendría un estimador (PD, AUC, LGD media) si repitiéramos el muestreo muchas veces." },
    { h: "Cómo se obtiene", t: "Por fórmula (TLC: normal con SE = √(p(1−p)/n)), por simulación o por bootstrap cuando no hay fórmula." },
    { h: "Para qué sirve", t: "Intervalos de confianza, pruebas de hipótesis (sesión 4) y comparación de modelos champion–challenger." },
  ], notes: "Mensaje: todo número que reportamos al comité tiene una distribución muestral detrás; ignorarla es confundir ruido con señal." });
  L.sSection(D, { num: 4, title: "Más intervalos y tamaño de muestra", sub: "Diferencias de PDs, LGD y precisión requerida" });
  L.sCompare(D, { title: "Intervalos para una diferencia y para una LGD", left: { h: "Diferencia de dos PDs", icon: "Δ", items: ["¿La PD digital es distinta de la de agencia?", "Newcombe: combina dos intervalos de Wilson", "Digital − agencia = +1,3 pp, IC 95 % [+0,8; +1,9]", "El intervalo excluye 0: diferencia significativa"] },
    right: { h: "LGD promedio", icon: "L", items: ["Variable continua y bimodal (picos en 0 y 1)", "La media sí es aproximadamente normal (TLC)", "LGD = 36,4 %: IC t [31,6; 41,2] y bootstrap [31,7; 41,3]", "Con pocos casos, preferir bootstrap"] },
    verdict: "elige el intervalo según el tipo de variable y el tamaño de muestra; con proporciones bajas evita Wald.",
    notes: "Valores del notebook M02_S02, sección 4. La LGD bimodal es ilustrativa; en el Módulo 9 se trabaja con flujos de recuperación reales." });
  L.sTable(D, { title: "¿Cuántos clientes hacen falta para estimar una PD?", colW: [2.4, 2.3, 2.3, 2.3, 2.3], w: 11.6, rowH: 0.62,
    header: ["PD", "± 0,25 pp", "± 0,5 pp", "± 1 pp", "± 2 pp"],
    rows: [["1 %", "6 085", "1 522", "381", "96"], ["2 %", "12 047", { text: "3 012", options: { bold: true, color: L.HEX.crimson } }, "753", "189"], ["5 %", "29 196", "7 299", "1 825", "457"], ["8 %", "45 238", "11 310", "2 828", "707"], ["15 %", "78 366", "19 592", "4 898", "1 225"]],
    note: "n = z² · p(1 − p) / E², confianza 95 %. Fuente: notebook M02_S02, sección 5.",
    notes: "Explica por qué los segmentos pequeños se agrupan, se encogen hacia la media o se modelan con información compartida." });
  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M02_S02_Estimadores_Intervalos_y_Teoremas_Limite.ipynb", data: ["hc_application_sintetico.csv", "german_credit.csv (UCI, real)"], steps: [
    { h: "Distribución muestral de la PD", t: "Sesgo y varianza según n; shrinkage" },
    { h: "Intervalos para una PD", t: "Cuatro métodos y su cobertura real" },
    { h: "LGN, TLC y bootstrap", t: "Simulaciones e IC del AUC" },
    { h: "Más intervalos", t: "Diferencia de PDs (Newcombe) y LGD promedio" },
    { h: "Tamaño de muestra", t: "Clientes necesarios según PD y precisión" },
  ] });
  L.sTakeaways(D, { items: [
    "La tasa de default observada es un estimador con sesgo y varianza; su incertidumbre cae con √n.",
    "Para PDs bajas o segmentos chicos usa Wilson o Jeffreys, no Wald.",
    "El TLC hace normal a la media aunque la variable no lo sea; el bootstrap da intervalos para cualquier métrica.",
    "El tamaño de muestra define qué precisión es alcanzable: con 3 000 clientes, una PD de 2 % se estima a ± 0,5 pp.",
  ], next: "verosimilitud, inferencia y lectura de resultados estadísticos." });
  await L.save(D, OUT);
})();
