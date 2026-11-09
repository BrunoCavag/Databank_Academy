const L = require("./lib");
const J = require("../chart_data_m3.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M3 S1 - Regresión logística: odds, MLE y Newton-Raphson", footer: "DataBank Academy · Módulo 3 · Sesión 1 · De la Bernoulli a la regresión logística" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 3 · SESIÓN 1 DE 4", title: "De la Bernoulli a la regresión logística: odds, verosimilitud y Newton-Raphson",
    subtitle: "La formulación probabilística del modelo de PD más usado en la banca", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "El Módulo 2 dejó listo el lenguaje: Bernoulli, verosimilitud, Fisher. Hoy construimos la logística paso a paso e implementamos su estimación desde cero." });
  L.sAgenda(D, { items: [
    { t: "Odds, log-odds y logit empírico", d: "Tres escalas para la misma probabilidad; cuándo es razonable la linealidad", min: 20 },
    { t: "La función logística y sus coeficientes", d: "Odds ratios y efectos marginales en lenguaje de riesgo", min: 15 },
    { t: "Verosimilitud, gradiente, Hessiano y Newton-Raphson", d: "Derivación e implementación IRLS desde cero", min: 25 },
    { t: "Separación perfecta y Firth", d: "Cuando el MLE no existe: eventos raros y segmentos nuevos", min: 15 },
    { t: "Laboratorio", d: "Logit empírico, IRLS, Newton vs. gradiente, sklearn vs. statsmodels, Firth", min: 45, lab: true },
  ] });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Pensar en odds y log-odds", t: "Pasar entre probabilidad, odds y log-odds, y verificar con el logit empírico si una variable entra lineal." },
    { h: "Interpretar coeficientes", t: "Traducir β y eᵝ en lenguaje de riesgo: multiplicadores de odds y efectos sobre la PD." },
    { h: "Estimar desde cero", t: "Derivar gradiente y Hessiano e implementar Newton-Raphson (IRLS); entender su convergencia cuadrática." },
    { h: "Resolver la separación", t: "Reconocer cuándo el MLE no existe y aplicar la regresión logística de Firth." },
  ] });

  L.sSection(D, { num: 1, title: "Odds, log-odds y logit empírico", sub: "Tres escalas para la misma información" });
  L.sTable(D, { title: "Probabilidad, odds y log-odds", colW: [2.6, 3.2, 2.4, 3.93], rowH: 0.7,
    header: ["Escala", "Fórmula", "Rango", "Cartera del caso (p = 7,98 %)"],
    rows: [["Probabilidad", "p", "[0, 1]", "0,080"], ["Odds de malo", "p / (1 − p)", "[0, ∞)", "0,087"], ["Odds buenos:malos", "(1 − p) / p", "[0, ∞)", "11,5 : 1"], ["Log-odds (logit)", "ln(p / (1 − p))", "(−∞, ∞)", "−2,445"]],
    note: "El log-odds es la escala natural: no tiene límites, es simétrica y en ella los efectos de las variables se suman.",
    notes: "En scoring se usan los odds buenos:malos. Un PDO de 20 significa que cada 20 puntos esos odds se duplican (sesión 4)." });
  L.sTable(D, { title: "Ejemplo: odds y odds ratio por tipo de ingreso", colW: [3.4, 1.8, 2.0, 2.0, 2.93], rowH: 0.62,
    header: ["Tipo de ingreso", "Clientes", "Tasa de malos", "Odds de malo", "Odds ratio vs. Working"],
    rows: [["Working", "31 000", "9,88 %", "0,110", "1,00"], ["Commercial associate", "14 014", "7,85 %", "0,085", "0,78"], ["State servant", "4 257", "5,71 %", "0,061", "0,55"], ["Pensioner", "10 696", "3,57 %", "0,037", { text: "0,34", options: { bold: true, color: L.HEX.green } }]],
    note: "Un pensionista tiene un tercio de los odds de incumplir de un trabajador dependiente. Fuente: notebook M03_S01, sección 1." });
  const lr = J.m3s1_logit_RCI, le = J.m3s1_logit_EXT2;
  L.sChart(D, { title: "Logit empírico: ¿la variable entra lineal?", chart: { type: "line", labels: le.labels, series: [{ name: "log-odds observado por tramo de EXT_SOURCE_2", values: le.values }],
      opts: { lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 7, chartColors: [L.HEX.navy], catAxisTitle: "EXT_SOURCE_2 (promedio del tramo)", showCatAxisTitle: true, valAxisTitle: "log-odds", showValAxisTitle: true } },
    points: ["Agrupar en tramos y graficar el log-odds observado de cada tramo", "EXT_SOURCE_2: casi lineal, puede entrar tal cual", "RCI: plana hasta ~0,35 y luego creciente; requiere transformación (WoE o spline)"],
    notes: "El logit empírico es el diagnóstico más simple y poderoso antes de estimar una logística. Lo retomamos con splines (sesión 2) y WoE (sesión 3)." });

  L.sChart(D, { title: "Contraejemplo: la RCI no entra lineal", chart: { type: "line", labels: J.m3s1_logit_RCI.labels, series: [{ name: "log-odds observado por tramo de RCI", values: J.m3s1_logit_RCI.values }],
      opts: { lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 7, chartColors: [L.HEX.crimson], catAxisTitle: "RCI (promedio del tramo)", showCatAxisTitle: true, valAxisTitle: "log-odds", showValAxisTitle: true } },
    points: ["Plana y ruidosa hasta ~0,35", "Creciente después: el riesgo se acelera con el sobreendeudamiento", "Metida cruda, la logística promedia ambos tramos", "Soluciones: tramos con WoE (sesión 3) o splines (sesión 2)"] });
  L.sSection(D, { num: 2, title: "La función logística", sub: "De log-odds lineales a probabilidades entre 0 y 1" });
  L.sFormula(D, { title: "El modelo logístico", formula: "p(x) = 1 / (1 + e^−(β₀ + βᵀx))   ⇔   ln(p / (1 − p)) = β₀ + βᵀx", fsize: 28,
    where: [["βⱼ", "Cambio en el log-odds por una unidad de xⱼ, lo demás constante"], ["e^βⱼ", "Odds ratio: multiplicador de los odds"], ["∂p/∂xⱼ", "= βⱼ · p(1 − p): el efecto en la PD depende del nivel de riesgo"], ["p(1 − p)", "Máximo en p = 0,5; pequeño en carteras de baja PD"]],
    example: { h: "En el caso", t: ["+0,1 en EXT_SOURCE_2: odds × 0,655 (−34,5 %)", "+10 años de edad: odds × 0,798 (−20,2 %)", "Efecto marginal promedio de EXT_SOURCE_2: −2,9 pp de PD por cada 0,1", "Interpretar en odds, comunicar en PD"] },
    notes: "Valores del notebook M03_S01, sección 2." });

  L.sSection(D, { num: 3, title: "Verosimilitud y Newton-Raphson", sub: "Cómo se estiman los coeficientes" });
  L.sFormula(D, { title: "Log-verosimilitud, gradiente y Hessiano", formula: "ℓ(β) = Σ [yᵢ xᵢᵀβ − ln(1 + e^(xᵢᵀβ))]     ∇ℓ = Xᵀ(y − p)     H = −XᵀWX", fsize: 24,
    where: [["ℓ(β)", "Cóncava: un único máximo (si no hay separación)"], ["∇ℓ = Xᵀ(y − p)", "Se anula en el MLE: los residuos son ortogonales a cada variable"], ["W = diag(pᵢ(1 − pᵢ))", "Pesos: clientes con PD cercana a 0 o 1 aportan poca curvatura"], ["(XᵀWX)⁻¹", "Matriz de covarianzas del estimador: errores estándar"]],
    example: { h: "Consecuencia de ∇ℓ = 0", t: ["Con intercepto: Σ yᵢ = Σ p̂ᵢ", "La PD media predicha = tasa observada en desarrollo", "Por eso la logística está calibrada 'en promedio' en la muestra de desarrollo", "No necesariamente fuera de tiempo (sesión 4)"] } });
  L.sTable(D, { title: "Derivación del gradiente, paso a paso", colW: [0.8, 6.2, 5.13], rowH: 0.72, fsize: 15,
    header: ["Paso", "Expresión", "Comentario"],
    rows: [["1", "ℓᵢ = yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)", "Log-verosimilitud Bernoulli de un cliente"],
      ["2", "ℓᵢ = yᵢ ηᵢ − ln(1 + e^ηᵢ),  ηᵢ = xᵢᵀβ", "Sustituir pᵢ = σ(ηᵢ) y simplificar"],
      ["3", "∂ℓᵢ/∂ηᵢ = yᵢ − σ(ηᵢ) = yᵢ − pᵢ", "Porque d ln(1 + e^η)/dη = σ(η)"],
      ["4", "∂ℓ/∂β = Σ (yᵢ − pᵢ) xᵢ = Xᵀ(y − p)", "Regla de la cadena: ∂ηᵢ/∂β = xᵢ"],
      ["5", "∂²ℓ/∂β∂βᵀ = −Σ pᵢ(1 − pᵢ) xᵢxᵢᵀ = −XᵀWX", "Porque σ'(η) = σ(η)(1 − σ(η))"]],
    note: "La simplicidad de este gradiente es la razón por la que la logística es el modelo lineal generalizado 'canónico' para datos binarios." });
  L.sFlow(D, { title: "Newton-Raphson como mínimos cuadrados iterados (IRLS)", steps: [
    { h: "Inicio", t: ["β⁽⁰⁾ = 0 (todos con PD 50 %)"] },
    { h: "PD y pesos", t: ["p = σ(Xβ)", "W = diag(p(1 − p))"] },
    { h: "Paso de Newton", t: ["β ← β + (XᵀWX)⁻¹Xᵀ(y − p)"] },
    { h: "Equivalente IRLS", t: ["Respuesta de trabajo z = Xβ + W⁻¹(y − p)", "Regresión ponderada de z sobre X"] },
    { h: "Parar", t: ["Cuando el paso es menor a 10⁻¹⁰", "SE = √diag((XᵀWX)⁻¹)"] },
  ], note: "nuestra implementación de 15 líneas reproduce a statsmodels hasta el sexto decimal, en coeficientes y en errores estándar." });
  L.sChart(D, { title: "Convergencia: Newton en 6 iteraciones, gradiente en cientos", chart: { type: "line", labels: J.m3s1_gd.labels,
      series: [{ name: "Descenso de gradiente (variables estandarizadas)", values: J.m3s1_gd.gap }, { name: "Newton-Raphson", values: J.m3s1_gd.labels.map(l => { const i = parseInt(l) - 1; return i < J.m3s1_nr.gap.length ? J.m3s1_nr.gap[i] : null; }) }],
      opts: { showLegend: true, lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6, chartColors: [L.HEX.crimson, L.HEX.navy], valAxisLogScaleBase: 10, valAxisMinVal: 1e-6, catAxisTitle: "Iteración", showCatAxisTitle: true, valAxisTitle: "ℓ(β̂) − ℓ(βₜ)  (escala log)", showValAxisTitle: true, displayBlanksAs: "gap" } },
    points: ["Newton usa la curvatura (Hessiano): convergencia cuadrática, los dígitos correctos se duplican por iteración", "El gradiente es más barato por paso, pero lento y sensible a la escala", "Con millones de filas y miles de variables se usan variantes estocásticas o cuasi-Newton (L-BFGS)"],
    source: "Notebook M03_S01, sección 4." });
  L.sCompare(D, { title: "Cuidado: scikit-learn regulariza por defecto", left: { h: "statsmodels Logit", icon: "S", items: ["Máxima verosimilitud pura", "Errores estándar, p-valores, IC, LLR", "Para inferencia y documentación del modelo"] },
    right: { h: "scikit-learn LogisticRegression", icon: "K", items: ["Penalización L2 con C = 1 por defecto", "Sin errores estándar", "Para predicción y pipelines; desde la versión 1.8 la penalización se controla con C y l1_ratio"] },
    verdict: "con muchos datos la diferencia es mínima; con pocos datos o variables en escalas grandes puede cambiar coeficientes y conclusiones." });

  L.sSection(D, { num: 4, title: "Separación perfecta y Firth", sub: "Cuando el MLE no existe" });
  L.sStats(D, { title: "Separación: el MLE se va al infinito", stats: [
    { v: "0 / 21", l: "malos sin historial negativo", color: L.HEX.green },
    { v: "7 / 19", l: "malos con historial negativo", color: L.HEX.crimson },
    { v: "β = 25,5", l: "MLE: SE = 98 356 (no converge)", size: 36, color: L.HEX.crimson },
    { v: "β = 3,25", l: "Firth: SE = 1,54, odds ratio 25,8", size: 36, color: L.HEX.green },
  ], points: ["Ocurre con muestras pequeñas, eventos raros o celdas sin malos (segmentos nuevos)", "Firth penaliza con el prior de Jeffreys: ℓ*(β) = ℓ(β) + ½ ln|I(β)|; coeficientes finitos y menos sesgo"],
    notes: "Score modificado de Firth: U* = Xᵀ(y − p + h ⊙ (½ − p)), con h los leverages. En el notebook se implementa en 12 líneas. Alternativas: agrupar categorías (WoE), regularización L2 o priors bayesianos (Módulo 6)." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M03_S01_Logistica_Odds_MLE_y_Newton_Raphson.ipynb", data: ["hc_application_sintetico.csv", "60 000 solicitudes (sin duplicados)"], steps: [
    { h: "Odds y logit empírico", t: "Odds ratios por segmento y diagnóstico de linealidad" },
    { h: "Interpretación", t: "Odds ratios y efectos marginales promedio" },
    { h: "Newton-Raphson desde cero", t: "IRLS, tabla de convergencia, comparación con statsmodels" },
    { h: "Newton vs. gradiente; statsmodels vs. sklearn", t: "Velocidad de convergencia y regularización por defecto" },
    { h: "Separación y Firth", t: "Segmento pequeño con separación; implementación de Firth" },
  ] });
  L.sTakeaways(D, { items: [
    "La logística modela el log-odds como lineal: verifica esa linealidad con el logit empírico.",
    "eᵝ es un multiplicador de odds; el efecto en la PD depende del nivel de riesgo: p(1 − p).",
    "El MLE se calcula con Newton-Raphson (IRLS): gradiente Xᵀ(y − p), Hessiano −XᵀWX, convergencia cuadrática.",
    "scikit-learn regulariza por defecto; para inferencia, statsmodels.",
    "Con separación o eventos raros el MLE no existe: Firth da estimaciones finitas.",
  ], next: "multicolinealidad, regularización, selección de variables y métodos avanzados." });
  await L.save(D, OUT);
})();
