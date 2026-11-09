const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];
const pct = (v, d = 1) => `${(v * 100).toFixed(d).replace(".", ",")} %`;

(async () => {
  const D = L.newDeck({ title: "M2 S1 - Probabilidad para el incumplimiento", footer: "DataBank Academy · Módulo 2 · Sesión 1 · Variables aleatorias, probabilidad condicional y esperanza" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 2 · SESIÓN 1 DE 4", title: "Variables aleatorias, probabilidad condicional y esperanza",
    subtitle: "El lenguaje probabilístico del incumplimiento", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "El Módulo 1 fue el lenguaje de negocio; el Módulo 2 es el lenguaje probabilístico. Todo modelo de PD estima una probabilidad condicional, y toda provisión es una esperanza." });
  L.sAgenda(D, { items: [
    { t: "El incumplimiento como variable aleatoria", d: "Bernoulli, Binomial y el número de incumplimientos", min: 20 },
    { t: "Probabilidad condicional y Bayes", d: "PD por segmento, independencia y alertas tempranas", min: 25 },
    { t: "Esperanza, varianza y pérdida esperada", d: "De la PD individual a la pérdida de la cartera", min: 20 },
    { t: "Correlación y distribución de pérdidas", d: "Modelo de un factor (Vasicek), VaR y capital", min: 20 },
    { t: "Laboratorio", d: "Binomial, Bayes, EL por decil y Monte Carlo con correlación", min: 35, lab: true },
  ] });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Modelar el incumplimiento", t: "Representar el default como Bernoulli y el número de defaults de una cartera como Binomial." },
    { h: "Razonar con probabilidades condicionales", t: "Distinguir P(D | x) de P(x | D) y aplicar Bayes a alertas y reglas de cobranza." },
    { h: "Calcular la pérdida esperada", t: "Usar la linealidad de la esperanza para pasar de PD × LGD × EAD individual a la cartera." },
    { h: "Entender el rol de la correlación", t: "Explicar por qué la misma pérdida esperada puede tener colas y capitales muy distintos." },
  ] });

  L.sSection(D, { num: 1, title: "El incumplimiento como variable aleatoria", sub: "Bernoulli y Binomial" });
  L.sFormula(D, { title: "Cada cliente es una Bernoulli", formula: "D_i ~ Bernoulli(p_i)    E[D_i] = p_i    Var(D_i) = p_i (1 − p_i)", fsize: 28,
    where: [["D_i", "1 si el cliente i incumple en el horizonte (p. ej., 90+ días en 12 meses), 0 si no"], ["p_i = PD_i", "Probabilidad de incumplimiento del cliente i"], ["E[D_i]", "La esperanza de un indicador es su probabilidad"], ["Var(D_i)", "Máxima cuando p = 50 %; pequeña cuando p es cercana a 0"]],
    example: { h: "En nuestra cartera", t: ["PD observada: " + pct(J.m2s1_binom.pd, 2), "Var(D) = 0,08 × 0,92 ≈ 0,073", "Desviación ≈ 0,27", "La 'definición de default' (días, horizonte) es una decisión de negocio: Módulo 8"] },
    notes: "Enfatizar que la definición del evento (90 días, 12 meses) cambia todo lo que sigue. Basilea define el default como 90+ días de atraso o improbabilidad de pago." });
  L.sFormula(D, { title: "Una cartera homogénea e independiente es una Binomial", formula: "N = Σ D_i ~ Binomial(n, p)    E[N] = n·p    Var(N) = n·p·(1 − p)", fsize: 28,
    where: [["n", "Número de créditos"], ["p", "PD común (cartera homogénea)"], ["Supuesto 1", "Independencia: el default de uno no cambia la probabilidad de otro"], ["Supuesto 2", "Homogeneidad: todos tienen la misma PD"]],
    example: { h: "Una agencia con 500 créditos", t: ["E[N] = 500 × 0,08 ≈ 40 incumplimientos", "Desviación ≈ √(500 × 0,08 × 0,92) ≈ 6", "Intervalo central 95 %: ~ 28 a 52", "Ambos supuestos fallan en la práctica (Sección 4)"] } });
  const b = J.m2s1_binom;
  L.sChart(D, { title: "¿Cuántos incumplimientos esperar en 500 créditos?", chart: { type: "bar", labels: b.labels, series: [{ name: "P(N = k)", values: b.values }],
      opts: { valAxisLabelFormatCode: "0%", chartColors: [L.HEX.navy], catAxisTitle: "Número de incumplimientos (k)", showCatAxisTitle: true, barGapWidthPct: 30 } },
    kpi: { v: "≈ 1 %", l: "probabilidad de observar 55 o más si p = 8 %" },
    points: ["La variabilidad es natural: ver 45 en lugar de 40 no es una señal", "55 o más ya es poco probable bajo el supuesto: algo cambió o el supuesto falla"],
    source: "Binomial(500, " + pct(b.pd, 2) + "). Notebook M02_S01, sección 1." });
  L.sQuestion(D, { q: "Una agencia reporta 55 incumplimientos en 500 créditos (11 %). ¿Es mala suerte o una señal?",
    hint: "Bajo la Binomial la probabilidad es ≈ 1 %. ¿Qué supuestos podrían fallar? Pista: ¿los clientes de una misma agencia comparten economía local, empleador o campaña? ¿Tienen la misma PD?",
    notes: "Llevar a la idea de correlación (sección 4) y de heterogeneidad (mezcla de PDs). Una mezcla de PDs heterogéneas reduce la varianza respecto a la Binomial; la correlación la aumenta." });

  L.sSection(D, { num: 2, title: "Probabilidad condicional y Bayes", sub: "Toda PD por segmento es una probabilidad condicional" });
  L.sFormula(D, { title: "Probabilidad condicional", formula: "P(D = 1 | X = x) = P(D = 1, X = x) / P(X = x)", fsize: 30,
    where: [["P(D | x)", "PD del segmento x: lo que estima un modelo de riesgo"], ["P(x | D)", "Perfil de los morosos: cuántos tienen la característica x"], ["Independencia", "P(D | x) = P(D): la variable x no discrimina"], ["Lift", "P(D | x) / P(D): cuántas veces más riesgo que el promedio"]],
    example: { h: "Conexión con el programa", t: ["Regresión logística: estima P(D | x) con muchas variables (M3)", "WoE e Information Value: miden cuánto se aleja x de la independencia (M3)", "XGBoost y CatBoost: otra forma de estimar P(D | x) (M4-M5)"] } });
  L.sTable(D, { title: "La confusión más común: P(D | x) no es P(x | D)", colW: [3.6, 2.6, 2.6, 2.6], w: 11.4, rowH: 0.6,
    header: ["Nivel educativo", "P(D = 1 | educación)", "P(educación | D = 1)", "P(educación)"],
    rows: [["Secundaria", "8,9 %", "79,3 %", "71,0 %"], ["Superior", "5,2 %", "16,0 %", "24,4 %"], ["Superior incompleta", "7,0 %", "2,8 %", "3,3 %"], ["Secundaria incompleta", { text: "10,9 %", options: { bold: true, color: L.HEX.crimson } }, "1,8 %", "1,4 %"], ["Total", "8,0 %", "100 %", "100 %"]],
    note: "\"El 79 % de los morosos tiene secundaria\" no implica que secundaria sea el segmento más riesgoso: el más riesgoso es secundaria incompleta, con 10,9 %. Fuente: notebook M02_S01, sección 2.",
    notes: "Este error aparece a menudo en reportes comerciales y de cobranza: describir el perfil del moroso en vez de la tasa de morosidad del perfil." });
  L.sFormula(D, { title: "Teorema de Bayes: el valor de una alerta depende de la PD base", formula: "P(D | A) = P(A | D) · P(D) / [P(A | D) · P(D) + P(A | no D) · P(no D)]", fsize: 24,
    where: [["P(D)", "PD base del segmento (prior)"], ["P(A | D)", "Sensibilidad: % de futuros morosos en que se activa la alerta"], ["P(A | no D)", "Falsos positivos: % de buenos en que se activa"], ["P(D | A)", "PD dado que la alerta se activó (posterior)"]],
    example: { h: "Alerta: uso > 90 % de línea en otros bancos", t: ["Sensibilidad 60 %, falsos positivos 15 %", "PD base 8 %", "P(D | A) = 0,6·0,08 / (0,6·0,08 + 0,15·0,92)", "= 25,8 %: el riesgo se triplica"] } });
  const by = J.m2s1_bayes;
  L.sChart(D, { title: "La misma alerta vale distinto en cada segmento", chart: { type: "line", labels: by.labels,
      series: [{ name: "Falsos positivos 5 %", values: by.f05 }, { name: "Falsos positivos 15 %", values: by.f15 }, { name: "Falsos positivos 30 %", values: by.f30 }, { name: "Sin información (posterior = prior)", values: by.prior }],
      opts: { showLegend: true, valAxisLabelFormatCode: "0%", lineSize: 3, lineDataSymbol: "none", chartColors: [L.HEX.green, L.HEX.navy, L.HEX.crimson, L.HEX.slate], catAxisTitle: "PD base del segmento (prior)", showCatAxisTitle: true, valAxisTitle: "PD dada la alerta", showValAxisTitle: true } },
    points: ["Con PD base baja (hipotecario), una alerta genera muchos falsos positivos", "Con PD base alta (micro), la misma alerta casi confirma el deterioro", "Las reglas de cobranza preventiva deben calibrarse por segmento"],
    notes: "Sensibilidad fija en 60 %. Volveremos a Bayes en el Módulo 6 como forma de actualizar creencias y optimizar hiperparámetros." });

  L.sSection(D, { num: 3, title: "Esperanza, varianza y pérdida esperada", sub: "De la PD individual a la cartera" });
  L.sFormula(D, { title: "Pérdida esperada: la linealidad de la esperanza", formula: "L_i = D_i · LGD_i · EAD_i     E[Σ L_i] = Σ PD_i · LGD_i · EAD_i", fsize: 28,
    where: [["LGD", "Severidad: % de la exposición que se pierde si hay default"], ["EAD", "Exposición al momento del default"], ["E[Σ L]", "No requiere independencia: la EL de la cartera es la suma de las EL individuales"], ["Var(Σ L)", "Sí depende de las covarianzas: Σ Var(L_i) + Σ_{i≠j} Cov(L_i, L_j)"]],
    example: { h: "En el caso (60 mil solicitudes)", t: ["EAD total ≈ S/ 1 647 MM", "LGD supuesta: 65 %", "EL ≈ S/ 89 MM = 5,4 % de la exposición", "Supuesto: LGD y EAD independientes de D (en recesiones no lo son)"] } });
  const el = J.m2s1_el_dec;
  L.sChart(D, { title: "La pérdida esperada se concentra en los deciles riesgosos", chart: { type: "bar", labels: el.labels, series: [{ name: "% de la pérdida esperada", values: el.values }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0%", valAxisLabelFormatCode: "0%", chartColors: [L.HEX.crimson], catAxisTitle: "Decil de PD (D10 = más riesgoso)", showCatAxisTitle: true } },
    kpi: { v: pct(el.values[9], 0), l: "de la EL en el 10 % más riesgoso" },
    points: ["Priorizar cobranza, límites y precio por pérdida esperada, no por número de clientes", "Los 3 deciles más riesgosos explican cerca de dos tercios de la EL"],
    source: "PD de un modelo logístico simple de 3 variables, solo como insumo. Notebook M02_S01, sección 3." });

  L.sSection(D, { num: 4, title: "Correlación y distribución de pérdidas", sub: "Por qué la media no basta: provisiones vs. capital" });
  L.sFormula(D, { title: "El modelo de un factor (Vasicek)", formula: "Z_i = √ρ · M + √(1 − ρ) · ε_i      D_i = 𝟙{ Z_i < Φ⁻¹(PD_i) }", fsize: 28,
    where: [["M ~ N(0,1)", "Factor sistémico: la economía, común a todos"], ["ε_i ~ N(0,1)", "Factor idiosincrático del cliente"], ["ρ", "Correlación de activos: cuánto depende cada cliente del ciclo"], ["Φ⁻¹(PD)", "Umbral que asegura que la PD incondicional sea PD_i"]],
    example: { h: "Basilea IRB", t: ["Es el modelo detrás de la fórmula de capital", "Minorista 'otros': ρ entre 3 % y 16 %", "Hipotecario: ρ = 15 %", "Revolvente calificado: ρ = 4 %"] },
    notes: "La intuición: si M es muy negativo (recesión), todos los Z bajan a la vez y muchos clientes cruzan su umbral simultáneamente." });
  const vr = J.m2s1_var;
  L.sChart(D, { title: "Misma pérdida esperada, colas muy distintas", chart: { type: "bar", labels: vr.labels,
      series: [{ name: "ρ = 0 % (independencia)", values: vr.r0 }, { name: "ρ = 5 %", values: vr.r05 }, { name: "ρ = 15 %", values: vr.r15 }],
      opts: { barGrouping: "clustered", showLegend: true, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0\"x\"", valAxisLabelFormatCode: "0.0\"x\"", chartColors: [L.HEX.green, L.HEX.navy, L.HEX.crimson], valAxisTitle: "Múltiplo de la pérdida esperada", showValAxisTitle: true } },
    points: ["La media no cambia con ρ: se cubre con provisiones y precio", "La cola (VaR 99,9 %) se multiplica: se cubre con capital", "La diversificación elimina el riesgo idiosincrático, no el sistémico"],
    source: "Monte Carlo, 5 000 créditos y 3 000 escenarios. Ver notebook M02_S01, sección 4.",
    notes: "Este gráfico resume por qué existen provisiones y capital por separado." });
  const vs = J.m2s1_vasicek;
  L.sChart(D, { title: "Una PD de 8 % en un escenario de 1 en 1 000 años", chart: { type: "bar", labels: vs.labels.map(x => "ρ = " + x), series: [{ name: "PD condicional al percentil 99,9 %", values: vs.values }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0%", valAxisLabelFormatCode: "0%", chartColors: [L.HEX.navy] } },
    kpi: { v: pct(vs.values[1], 0), l: "PD estresada con ρ = 5 %" },
    points: ["PD(M) = Φ[(Φ⁻¹(PD) + √ρ · Φ⁻¹(0,999)) / √(1 − ρ)]", "Base de la fórmula de capital IRB y de los ejercicios de stress (M11)"] });
  L.sCompare(D, { title: "Pérdida esperada vs. pérdida inesperada", left: { h: "Pérdida esperada (EL)", icon: "E", items: ["Media de la distribución de pérdidas", "Costo del negocio: se cubre con provisiones", "Debe estar incluida en la tasa (pricing)", "Módulos 9 y 10"] },
    right: { h: "Pérdida inesperada (UL)", icon: "U", items: ["VaR al 99,9 % menos la EL", "Se cubre con capital", "El capital tiene un costo que también entra al precio (RAROC)", "Módulos 10 y 11"] },
    verdict: "un precio que sólo cubre la pérdida esperada no paga el capital que la volatilidad exige." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M02_S01_Probabilidad_Bernoulli_Bayes_y_Perdida_Esperada.ipynb", data: ["hc_application_sintetico.csv", "60 060 solicitudes"], steps: [
    { h: "Bernoulli y Binomial", t: "PD, varianza e intervalo para el número de incumplimientos" },
    { h: "Probabilidad condicional", t: "P(D | x), P(x | D), lift e independencia" },
    { h: "Bayes", t: "Posterior de una alerta temprana según la PD base" },
    { h: "Pérdida esperada", t: "EL por cliente y concentración por decil" },
    { h: "Monte Carlo con correlación", t: "Distribución de pérdidas, VaR y fórmula de Vasicek" },
  ] });
  L.sTakeaways(D, { items: [
    "El incumplimiento es una Bernoulli; la cartera, una suma de Bernoullis que rara vez son independientes.",
    "Un modelo de PD estima P(D | x); no confundir con el perfil de los morosos, P(x | D).",
    "El valor de una señal depende de la PD base: Bayes obliga a calibrar por segmento.",
    "La pérdida esperada es lineal y se provisiona; la inesperada depende de la correlación y requiere capital.",
  ], next: "estimadores, intervalos, teoremas límite y verosimilitud." });
  await L.save(D, OUT);
})();
