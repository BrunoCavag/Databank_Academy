const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M2 S2 - Estimación, intervalos y verosimilitud", footer: "DataBank Academy · Módulo 2 · Sesión 2 · Estimadores, intervalos, teoremas límite y verosimilitud" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 2 · SESIÓN 2 DE 3", title: "Estimadores, intervalos, teoremas límite y verosimilitud",
    subtitle: "Cuánto sabemos realmente de una PD estimada con datos", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Ayer: la PD como probabilidad. Hoy: la PD como algo que estimamos con datos finitos, y por lo tanto con incertidumbre." });
  L.sAgenda(D, { items: [
    { t: "Población, muestra y estimadores", d: "Sesgo, varianza, error cuadrático medio y shrinkage", min: 15 },
    { t: "Intervalos de confianza para una PD", d: "Wald, Wilson, Clopper-Pearson y Jeffreys", min: 20 },
    { t: "Ley de los grandes números, TLC y bootstrap", d: "Por qué funcionan los intervalos y cómo medir la incertidumbre del AUC", min: 20 },
    { t: "Verosimilitud y máxima verosimilitud", d: "De la PD constante a la regresión logística", min: 20 },
    { t: "Lectura de resultados estadísticos", d: "Coeficientes, errores estándar, p-valores y pseudo R²", min: 10 },
    { t: "Laboratorio", d: "Simulaciones, IC, bootstrap, MLE a mano y salida de statsmodels", min: 35, lab: true },
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

  L.sSection(D, { num: 4, title: "Verosimilitud y máxima verosimilitud", sub: "El motor de estimación de la regresión logística" });
  L.sFormula(D, { title: "La verosimilitud de una PD", formula: "ℒ(p) = Π p^(d_i) (1 − p)^(1 − d_i)     ℓ(p) = k·log p + (n − k)·log(1 − p)", fsize: 26,
    where: [["ℒ(p)", "Probabilidad de observar exactamente nuestros datos si la PD fuera p"], ["ℓ(p)", "Log-verosimilitud: más fácil de derivar y numéricamente estable"], ["p̂_MLE", "dℓ/dp = 0  ⇒  p̂ = k / n"], ["I(p)", "Información de Fisher = n / (p(1 − p)) ⇒ SE(p̂) = √(p̂(1 − p̂)/n)"]],
    example: { h: "Intuición", t: ["El MLE es el valor de p que hace 'menos sorprendentes' los datos", "La curvatura de ℓ en el máximo mide cuánto sabemos", "Más curvatura = menor error estándar"] } });
  const ll = J.m2s2_ll;
  L.sChart(D, { title: "Más datos: log-verosimilitud más 'puntiaguda'", chart: { type: "line", labels: ll.labels,
      series: [{ name: "n = 50", values: ll["50"] }, { name: "n = 200", values: ll["200"] }, { name: "n = 1 000", values: ll["1000"] }],
      opts: { showLegend: true, lineSize: 3, lineDataSymbol: "none", valAxisMinVal: -12, valAxisMaxVal: 0, chartColors: [L.HEX.slate, L.HEX.gold, L.HEX.navy], catAxisTitle: "Valor de p", showCatAxisTitle: true, valAxisTitle: "ℓ(p) − ℓ(p̂)", showValAxisTitle: true } },
    points: ["Las tres curvas tienen su máximo en p̂ = 8 %", "Con n = 1 000, valores como 6 % o 10 % ya son muy poco verosímiles", "Los puntos donde ℓ cae 1,92 bajo el máximo definen el IC por razón de verosimilitud"] });
  L.sFlow(D, { title: "De la PD constante a la regresión logística", steps: [
    { h: "PD constante", t: ["p igual para todos", "MLE: p̂ = k/n"] },
    { h: "PD que depende de x", t: ["p_i = 1 / (1 + e^−(β₀ + β₁x_i))", "Cada cliente tiene su PD"] },
    { h: "Maximizar ℓ(β)", t: ["Σ [d_i η_i − log(1 + e^η_i)]", "No hay solución cerrada: optimización numérica"] },
    { h: "Errores estándar", t: ["Hessiano: H = Xᵀ W X, W = diag(p(1 − p))", "SE = √diag(H⁻¹)"] },
  ], note: "en el laboratorio estimamos la logística 'a mano' con un optimizador y obtenemos exactamente los coeficientes y errores de statsmodels. En el Módulo 3 derivamos Newton-Raphson.",
    notes: "Advertencia práctica: el hess_inv que devuelve BFGS es una aproximación y no sirve para errores estándar; hay que usar el Hessiano analítico." });

  L.sSection(D, { num: 5, title: "Lectura de resultados estadísticos", sub: "Cómo lee un comité de validación la salida de un modelo" });
  L.sTable(D, { title: "German Credit: salida de una regresión logística", colW: [4.0, 1.5, 1.6, 1.5, 2.0], w: 10.6, rowH: 0.5, fsize: 14,
    header: ["Variable", "Coef.", "Odds ratio", "p-valor", "IC 95 % OR"],
    rows: [["Duración (meses)", "+0,034", "1,034", { text: "0,0001", options: { bold: true, color: L.HEX.crimson } }, "1,02 – 1,05"],
      ["log(monto)", "+0,111", "1,117", "0,442", "0,84 – 1,48"],
      ["Edad (años)", "−0,013", "0,987", "0,067", "0,97 – 1,00"],
      ["Sin cuenta corriente", "−1,532", "0,216", { text: "< 0,0001", options: { bold: true, color: L.HEX.crimson } }, "0,15 – 0,31"],
      ["Historia 'crítica'", "−0,765", "0,466", { text: "0,0001", options: { bold: true, color: L.HEX.crimson } }, "0,32 – 0,68"],
      ["Ahorro < 100 DM", "+0,659", "1,933", { text: "0,0001", options: { bold: true, color: L.HEX.crimson } }, "1,40 – 2,68"],
      ["Cuota / ingreso disponible", "+0,219", "1,245", { text: "0,006", options: { bold: true, color: L.HEX.crimson } }, "1,07 – 1,45"]],
    note: "1 000 créditos reales, 30 % malos. Pseudo R² (McFadden) = 0,16; log-verosimilitud −511,8. Fuente: notebook M02_S02, sección 5.",
    notes: "Leer una fila completa: cada mes adicional de plazo multiplica los odds de incumplir por 1,034 (+3,4 %). Un plazo 12 meses mayor: 1,034^12 ≈ 1,5 veces los odds." });
  L.sCards(D, { title: "Cinco preguntas antes de aceptar un coeficiente", cols: 3, cards: [
    { h: "¿Es significativo?", t: "p-valor e IC: ¿el intervalo excluye el cero (o el 1 en odds)?" },
    { h: "¿Es relevante?", t: "Con millones de registros todo es significativo; mira la magnitud del efecto." },
    { h: "¿Tiene sentido económico?", t: "En German Credit, 'historia crítica' reduce el riesgo: es un sesgo de selección de la muestra aprobada." },
    { h: "¿Es estable?", t: "¿Se mantiene el signo y la magnitud en otras ventanas de tiempo y segmentos?" },
    { h: "¿Es causal?", t: "Asociación no es causalidad: cuidado al usar el modelo para 'intervenir' (M6)." },
    { h: "¿Qué dice el modelo global?", t: "LLR test frente al modelo nulo y pseudo R² entre 0,1 y 0,3, habitual en riesgo." },
  ] });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M02_S02_Estimacion_Intervalos_TLC_y_Verosimilitud.ipynb", data: ["hc_application_sintetico.csv", "german_credit.csv (UCI, real)"], steps: [
    { h: "Distribución muestral de la PD", t: "Sesgo y varianza según n; shrinkage" },
    { h: "Intervalos de confianza", t: "Cuatro métodos y su cobertura real" },
    { h: "LGN, TLC y bootstrap", t: "Simulaciones e IC del AUC" },
    { h: "Verosimilitud", t: "Curvas de log-verosimilitud y MLE a mano con Hessiano" },
    { h: "Lectura de resultados", t: "Logit en statsmodels: odds ratios, p-valores e IC" },
  ] });
  L.sTakeaways(D, { items: [
    "La tasa de default observada es un estimador con sesgo y varianza; su incertidumbre cae con √n.",
    "Para PDs bajas o segmentos chicos usa Wilson o Jeffreys, no Wald.",
    "El bootstrap da intervalos para cualquier métrica, incluidos AUC y Gini.",
    "La regresión logística es máxima verosimilitud con una PD que depende de x; el Hessiano da los errores estándar.",
    "Significancia, relevancia, sentido económico, estabilidad y causalidad son preguntas distintas.",
  ], next: "pruebas de hipótesis, desbalance de clases y métricas de clasificación." });
  await L.save(D, OUT);
})();
