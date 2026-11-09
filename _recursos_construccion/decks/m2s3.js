const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M2 S3 - Verosimilitud e inferencia", footer: "DataBank Academy · Módulo 2 · Sesión 3 · Verosimilitud, inferencia y lectura de resultados" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 2 · SESIÓN 3 DE 4", title: "Verosimilitud, inferencia y lectura de resultados estadísticos",
    subtitle: "El motor de estimación de los modelos de PD", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Esta sesión es el puente directo hacia la regresión logística del Módulo 3." });
  L.sAgenda(D, { items: [
    { t: "Verosimilitud y máxima verosimilitud", d: "De la PD constante a la regresión logística; Fisher y Hessiano", min: 25 },
    { t: "Lectura de resultados estadísticos", d: "Coeficientes, errores estándar, odds ratios, p-valores", min: 15 },
    { t: "Inferencia: Wald, razón de verosimilitud y score", d: "Modelos anidados e intervalos perfilados", min: 20 },
    { t: "Comparación de modelos", d: "Deviance, AIC y BIC", min: 15 },
    { t: "Laboratorio", d: "MLE a mano, tests y selección por AIC/BIC sobre German Credit", min: 45, lab: true },
  ] });
  L.sSection(D, { num: 1, title: "Verosimilitud y máxima verosimilitud", sub: "El motor de estimación de la regresión logística" });
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

  L.sFormula(D, { title: "Información de Fisher y Hessiano de la logística", formula: "∇ℓ(β) = Xᵀ(y − p)        H(β) = −Xᵀ W X,   W = diag(pᵢ(1 − pᵢ))", fsize: 24,
    where: [["∇ℓ(β)", "Gradiente (score): se anula en el MLE"], ["H(β)", "Hessiano: curvatura de la log-verosimilitud, siempre negativo definido"], ["I(β) = −E[H]", "Información de Fisher: cuánta información aportan los datos sobre β"], ["Var(β̂) ≈ I(β̂)⁻¹", "Errores estándar = raíz de la diagonal de (XᵀWX)⁻¹"]],
    example: { h: "Por qué importa", t: ["Clientes con p cercana a 0 o 1 aportan poca información (pᵢ(1 − pᵢ) pequeño)", "Por eso los eventos raros dan errores estándar grandes", "El paso de Newton-Raphson usa exactamente ∇ℓ y H (Módulo 3)", "El hess_inv de BFGS no sirve para errores estándar"] },
    notes: "En el laboratorio se calcula XᵀWX a mano y se reproducen exactamente los errores estándar de statsmodels." });
  L.sSection(D, { num: 2, title: "Lectura de resultados estadísticos", sub: "Cómo lee un comité de validación la salida de un modelo" });
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
  L.sCards(D, { title: "Seis preguntas antes de aceptar un coeficiente", cols: 3, cards: [
    { h: "¿Es significativo?", t: "p-valor e IC: ¿el intervalo excluye el cero (o el 1 en odds)?" },
    { h: "¿Es relevante?", t: "Con millones de registros todo es significativo; mira la magnitud del efecto." },
    { h: "¿Tiene sentido económico?", t: "En German Credit, 'historia crítica' reduce el riesgo: es un sesgo de selección de la muestra aprobada." },
    { h: "¿Es estable?", t: "¿Se mantiene el signo y la magnitud en otras ventanas de tiempo y segmentos?" },
    { h: "¿Es causal?", t: "Asociación no es causalidad: cuidado al usar el modelo para 'intervenir' (M7)." },
    { h: "¿Qué dice el modelo global?", t: "LLR test frente al modelo nulo y pseudo R² entre 0,1 y 0,3, habitual en riesgo." },
  ] });

  L.sSection(D, { num: 3, title: "La trinidad de tests", sub: "Wald, razón de verosimilitud y score" });
  L.sTable(D, { title: "Tres formas de contrastar H0: β = 0", colW: [2.6, 4.8, 4.73], rowH: 0.85,
    header: ["Test", "Estadístico", "Qué necesita"],
    rows: [["Wald", "W = β̂² / SE(β̂)²  ~  χ²(1)", "Solo el modelo completo (es el z de la salida)"],
      ["Razón de verosimilitud (LR)", "LR = 2 (ℓ₁ − ℓ₀)  ~  χ²(q)", "Ambos modelos; el más confiable en muestras chicas"],
      ["Score (Lagrange)", "S = U(β₀)ᵀ I(β₀)⁻¹ U(β₀)", "Solo el modelo restringido: útil para evaluar variables candidatas"]],
    note: "Son asintóticamente equivalentes. Con coeficientes grandes, el Wald puede perder potencia (efecto Hauck-Donner)." });
  L.sStats(D, { title: "¿Aportan 'cuenta corriente' y 'ahorro' al modelo?", stats: [
    { v: "LR = 121", l: "razón de verosimilitud (2 gl)", color: L.HEX.navy, size: 40 },
    { v: "W = 98", l: "Wald conjunto", color: L.HEX.navy, size: 40 },
    { v: "S = 111", l: "score", color: L.HEX.navy, size: 40 },
    { v: "p < 10⁻²¹", l: "en los tres casos: aportan", color: L.HEX.green, size: 36 },
  ], points: ["Los tres tests coinciden en la conclusión, con estadísticos distintos", "Intervalo perfilado de 'sin cuenta corriente': [−1,95; −1,27] vs. Wald [−1,95; −1,23]: con n grande casi coinciden; con eventos raros, no"],
    notes: "Valores del notebook M02_S03, sección 3. El LR es 2 × (−523,9 − (−584,6)) ≈ 121." });
  L.sSection(D, { num: 4, title: "Comparar modelos", sub: "Deviance, AIC y BIC" });
  L.sTable(D, { title: "AIC y BIC: ¿la variable paga su complejidad?", colW: [3.5, 0.7, 1.5, 1.6, 1.6, 1.6, 1.63], rowH: 0.6,
    header: ["Modelo", "k", "logLik", "Deviance", "AIC", "BIC", "Pseudo R²"],
    rows: [["M0: duración + edad", "3", "−584,6", "1 169,2", "1 175,2", "1 189,9", "0,043"], ["M1: + cuenta y ahorro", "5", "−523,9", "1 047,9", "1 057,9", "1 082,4", "0,142"],
      ["M2: + historia + cuota", "7", "−512,1", "1 024,2", { text: "1 038,2", options: { bold: true, color: L.HEX.green } }, { text: "1 072,6", options: { bold: true, color: L.HEX.green } }, "0,162"],
      ["M3: M2 + log(monto)", "8", "−511,8", "1 023,6", "1 039,6", "1 078,9", "0,162"]],
    note: "AIC = −2ℓ + 2k; BIC = −2ℓ + k·log n. Ambos eligen M2: log(monto) no paga su complejidad. Fuente: notebook M02_S03, sección 4.",
    notes: "El BIC penaliza más la complejidad y tiende a modelos más simples. En el Módulo 3 vemos la selección de variables de forma sistemática." });
  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M02_S03_Verosimilitud_Inferencia_y_Lectura_de_Resultados.ipynb", data: ["german_credit.csv (UCI, real)", "1 000 créditos · 30 % malos"], steps: [
    { h: "Verosimilitud", t: "Curvas de log-verosimilitud y MLE a mano con Hessiano" },
    { h: "Lectura de resultados", t: "Logit en statsmodels: odds ratios, p-valores e IC" },
    { h: "Trinidad de tests", t: "Wald, LR y score para variables añadidas" },
    { h: "Intervalos perfilados", t: "Perfil de la log-verosimilitud vs. Wald" },
    { h: "AIC y BIC", t: "Comparación de cuatro modelos candidatos" },
  ] });
  L.sTakeaways(D, { items: [
    "La regresión logística es máxima verosimilitud con una PD que depende de x; el Hessiano da los errores estándar.",
    "Wald, LR y score contrastan lo mismo; el LR es el más confiable en muestras chicas o con eventos raros.",
    "Los intervalos perfilados corrigen al de Wald cuando la log-verosimilitud no es cuadrática.",
    "AIC y BIC comparan modelos no anidados y penalizan la complejidad.",
    "Significancia, relevancia, sentido económico, estabilidad y causalidad son preguntas distintas.",
  ], next: "pruebas de hipótesis, desbalance de clases y métricas de clasificación." });
  await L.save(D, OUT);
})();
