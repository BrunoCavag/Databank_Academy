const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M2 S3 - Pruebas de hipótesis, desbalance y métricas", footer: "DataBank Academy · Módulo 2 · Sesión 3 · Pruebas de hipótesis, desbalance de clases y métricas" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 2 · SESIÓN 3 DE 3", title: "Pruebas de hipótesis, desbalance de clases y métricas de clasificación",
    subtitle: "¿El modelo está bien calibrado? ¿Discrimina? ¿Con qué corte decidimos?", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027" });
  L.sAgenda(D, { items: [
    { t: "La lógica de una prueba de hipótesis", d: "H0, H1, p-valor, errores tipo I y II, potencia y tamaño de muestra", min: 25 },
    { t: "Tests para validar modelos de PD", d: "Binomial, Jeffreys, Hosmer-Lemeshow, χ² y Kolmogorov-Smirnov", min: 25 },
    { t: "Desbalance de clases", d: "La paradoja de la exactitud y el costo de balancear", min: 15 },
    { t: "Métricas y punto de corte", d: "ROC, Gini, KS, PR-AUC, Brier y corte por costos", min: 20 },
    { t: "Laboratorio", d: "Taiwan Default (UCI) y solicitudes tipo Home Credit", min: 35, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "La lógica de una prueba de hipótesis", sub: "Decidir con datos sabiendo que nos podemos equivocar" });
  L.sTable(D, { title: "Dos formas de equivocarse", colW: [3.0, 4.2, 4.2], w: 11.4, rowH: 1.0, fsize: 16,
    header: ["", "H0 es verdadera (el modelo está bien)", "H0 es falsa (el modelo subestima)"],
    rows: [["No rechazo H0", { text: "Correcto (1 − α)", options: { fill: { color: "D8F0E3" }, align: "center", bold: false } }, { text: "Error tipo II (β): no detectamos un modelo malo", options: { fill: { color: "F8D7DA" }, align: "center", bold: false } }],
      ["Rechazo H0", { text: "Error tipo I (α): recalibramos un modelo bueno", options: { fill: { color: "FFF4D6" }, align: "center", bold: false } }, { text: "Correcto: potencia (1 − β)", options: { fill: { color: "D8F0E3" }, align: "center", bold: false } }]],
    note: "En validación de PD, el error tipo II suele ser el más costoso: provisiones y capital insuficientes.",
    notes: "Analogía con un juicio: H0 es la inocencia. α es condenar a un inocente; β, absolver a un culpable." });
  L.sFormula(D, { title: "Ejemplo: ¿la PD del grado A está subestimada?", formula: "H0: PD = 2 %    vs.    H1: PD > 2 %      (31 defaults en 1 000 clientes)", fsize: 26,
    where: [["Estadístico", "Número de defaults observados: k = 31 (3,1 %)"], ["Distribución bajo H0", "Binomial(1 000; 0,02): E[k] = 20"], ["p-valor", "P(k ≥ 31 | H0) = 0,013"], ["Región de rechazo", "k ≥ 29 al 5 % (una cola)"]],
    example: { h: "Decisión", t: ["p = 0,013 < 0,05: se rechaza H0", "La PD del grado A parece subestimada", "Siguiente paso: ¿es material? ¿Es persistente en varios años?"] } });
  const pt = J.m2s3_pot; const keys = Object.keys(pt).filter(k => k !== "labels");
  L.sChart(D, { title: "Potencia: ¿el test es capaz de detectar el problema?", chart: { type: "line", labels: pt.labels,
      series: keys.map(k => ({ name: "PD real = " + k.replace("%", " %"), values: pt[k] })),
      opts: { showLegend: true, valAxisLabelFormatCode: "0%", lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 7, valAxisMaxVal: 1, chartColors: [L.HEX.slate, L.HEX.navy, L.HEX.crimson], catAxisTitle: "Clientes en el grado (n)", showCatAxisTitle: true, valAxisTitle: "Potencia (H0: PD = 2 %, α = 5 %)", showValAxisTitle: true } },
    points: ["Detectar 2 % → 3 % con 80 % de potencia requiere ≈ 1 400 clientes", "Detectar 2 % → 2,5 % requiere ≈ 5 200", "'No rechazar' en un grado chico no prueba que el modelo esté bien"],
    source: "Test binomial exacto, una cola. Notebook M02_S03, sección 1.",
    notes: "Vínculo con el Módulo 1: el champion–challenger con p = 0,24 no probaba que ambas políticas fueran iguales." });

  L.sSection(D, { num: 2, title: "Tests para validar modelos de PD", sub: "Calibración y discriminación" });
  const cl = J.m2s3_calib;
  L.sChart(D, { title: "Backtesting por grado: PD predicha vs. tasa observada", chart: { type: "bar", labels: cl.labels.map(x => "Grado " + x),
      series: [{ name: "PD media predicha", values: cl.pred }, { name: "Tasa observada", values: cl.obs }],
      opts: { barGrouping: "clustered", showLegend: true, valAxisLabelFormatCode: "0%", chartColors: [L.HEX.slate, L.HEX.crimson], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0%" } },
    points: ["Grados A y B: el modelo subestima (tests binomial y Jeffreys rechazan)", "Grados C-E: sobreestima", "Causa: PAY_0 (meses de atraso) tratado como lineal: motiva el WoE del Módulo 3"],
    source: "Taiwan Default of Credit Card Clients (UCI), muestra de prueba (30 %). Notebook M02_S03, sección 2.",
    notes: "Jeffreys: P(PD_real ≤ PD_modelo | datos) con posterior Beta(k + ½, n − k + ½). Valores bajos indican subestimación." });
  L.sFormula(D, { title: "Jeffreys y Hosmer-Lemeshow", formula: "Jeffreys: P(PD ≤ PD_modelo | k, n) = F_Beta(k+½, n−k+½)(PD_modelo)\nHL = Σ_g (O_g − E_g)² / [E_g (1 − E_g / n_g)] ~ χ²(G − 2)", fsize: 22,
    where: [["k, n", "Defaults observados y clientes del grado"], ["Beta(k+½, n−k+½)", "Posterior de la PD con prior no informativo de Jeffreys"], ["O_g, E_g", "Defaults observados y esperados (Σ PD) en el grupo g"], ["G", "Número de grupos (típicamente 10 deciles)"]],
    example: { h: "Cómo se usan", t: ["Jeffreys < 5 %: la PD del grado está subestimada (semáforo rojo)", "Recomendado por el BCE para backtesting de PD", "HL evalúa la calibración de todos los grupos a la vez", "HL en Taiwán = 74,9: se rechaza; falta calibrar"] },
    notes: "Jeffreys funciona bien incluso con pocos defaults, por eso es preferido en carteras de bajo incumplimiento." });
  L.sTable(D, { title: "La caja de herramientas de validación", colW: [2.6, 3.2, 3.1, 3.23], rowH: 0.78,
    header: ["Test", "Pregunta", "H0", "Comentario"],
    rows: [["Binomial / Jeffreys", "¿La PD de un grado está bien calibrada?", "PD real = PD del modelo", "Por grado; una cola (subestimación)"],
      ["Hosmer-Lemeshow", "¿La calibración global es adecuada?", "O_g = E_g en todos los grupos", "HL = 74,9 (p ≈ 0): con n grande rechaza casi siempre"],
      ["χ² de independencia", "¿Una variable se asocia con el default?", "Independencia", "Complementar con V de Cramér (magnitud)"],
      ["Kolmogorov-Smirnov", "¿El score separa buenos de malos?", "Misma distribución", "KS = 0,39 en Taiwán; estándar en LatAm"]],
    note: "Significancia ≠ materialidad: con 30 mil observaciones, EDUCATION tiene p ≈ 10⁻³² pero V de Cramér = 0,07 (asociación débil).",
    notes: "En validación se combinan tests estadísticos, umbrales de materialidad (semáforos) y juicio experto." });

  L.sSection(D, { num: 3, title: "Desbalance de clases", sub: "Cuando los malos son minoría" });
  L.sStats(D, { title: "La paradoja de la exactitud", stats: [
    { v: "8 %", l: "de malos en las solicitudes", color: L.HEX.navy },
    { v: "92 %", l: "de exactitud de un 'modelo' que dice que nadie incumple", color: L.HEX.crimson },
    { v: "0", l: "malos detectados por ese modelo", color: L.HEX.gold },
  ], points: ["La exactitud (accuracy) no sirve en problemas desbalanceados", "Necesitamos métricas de ordenamiento (AUC, KS) y de calibración (Brier, log-loss)", "Y una decisión explícita de corte según costos"] });
  L.sTable(D, { title: "Balancear clases no mejora el ranking y descalibra la PD", colW: [4.0, 1.8, 2.4, 1.8, 2.13], rowH: 0.6,
    header: ["Estrategia", "AUC", "PD media predicha", "Tasa real", "Brier"],
    rows: [["Base (sin balancear)", "0,744", { text: "7,9 %", options: { color: L.HEX.green, bold: true } }, "8,0 %", "0,068"],
      ["class_weight = 'balanced'", "0,744", { text: "42,4 %", options: { color: L.HEX.crimson, bold: true } }, "8,0 %", "0,204"],
      ["Undersampling 50/50", "0,744", { text: "42,5 %", options: { color: L.HEX.crimson, bold: true } }, "8,0 %", "0,204"],
      ["Undersampling + corrección de prior", "0,744", { text: "7,8 %", options: { color: L.HEX.green, bold: true } }, "8,0 %", "0,068"]],
    note: "Corrección de prior (King & Zeng): logit_corregido = logit − log[(π_muestra/(1−π_muestra)) / (π_pob/(1−π_pob))]. Fuente: notebook M02_S03, sección 3.",
    notes: "En riesgo, la PD se usa como probabilidad (provisiones, precio, capital). Si balanceas para entrenar, recalibra antes de usar." });

  L.sSection(D, { num: 4, title: "Métricas y punto de corte", sub: "Ordenar bien, calibrar bien y decidir bien" });
  const rc = J.m2s3_roc;
  L.sChart(D, { title: "Curva ROC: capacidad de ordenamiento", chart: { type: "line", labels: rc.labels,
      series: [{ name: "Modelo", values: rc.tpr }, { name: "Azar", values: rc.rand }],
      opts: { showLegend: true, lineSize: 3, lineDataSymbol: "none", valAxisLabelFormatCode: "0%", valAxisMaxVal: 1, chartColors: [L.HEX.navy, L.HEX.slate], catAxisTitle: "Tasa de falsos positivos (buenos rechazados)", showCatAxisTitle: true, valAxisTitle: "Tasa de verdaderos positivos (malos detectados)", showValAxisTitle: true } },
    kpi: { v: `Gini ${(2 * rc.auc - 1).toFixed(2).replace(".", ",")}`, l: `AUC = ${String(rc.auc).replace(".", ",")} · Taiwan, logística simple` },
    points: ["AUC: probabilidad de que un malo tenga más PD que un bueno", "Gini = 2·AUC − 1, el estándar de la industria", "No mide calibración: una PD × 5 tiene el mismo AUC"] });
  L.sTable(D, { title: "¿Qué métrica para qué pregunta?", colW: [2.6, 3.4, 6.13], rowH: 0.68,
    header: ["Métrica", "Mide", "Comentario en riesgo de crédito"],
    rows: [["AUC / Gini", "Ordenamiento", "Estándar; Gini > 0,5 suele ser bueno en originación minorista"], ["KS", "Máxima separación", "Muy usado en LatAm; ligado al punto de corte"], ["PR-AUC", "Desempeño en la clase minoritaria", "Más informativo cuando la tasa de malos es muy baja"],
      ["Brier / log-loss", "Calibración + discriminación", "Indispensables si la PD se usa como probabilidad"], ["Precisión / recall / F1", "Desempeño en un corte", "Útiles para la política, no para comparar modelos"]] });
  L.sFormula(D, { title: "El punto de corte depende de los costos, no de 0,5", formula: "p* = C_FP / (C_FP + C_FN)", fsize: 34,
    where: [["C_FN", "Costo de aprobar a un malo: LGD × EAD ≈ 0,75 × 0,80 = 60 % del monto"], ["C_FP", "Costo de rechazar a un bueno: margen perdido ≈ 0,55 × 15 % = 8,25 %"], ["p*", "Rechazar si PD ≥ p*: aquí p* ≈ 12 %"], ["Supuesto", "La PD debe estar calibrada"]],
    example: { h: "Resultado en el caso", t: ["Corte teórico 12,1 %; empírico 11,4 %", "Se rechaza al 21 % de los solicitantes", "Se detecta el 51 % de los malos", "Precisión de los rechazos: 19 %"] },
    notes: "Conecta con el Módulo 1: el corte de máxima utilidad. Si el margen sube, p* sube y se aprueba más." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M02_S03_Pruebas_de_Hipotesis_Desbalance_y_Metricas.ipynb", data: ["taiwan_default.csv (UCI, real)", "30 000 tarjetahabientes · 22 % default", "hc_application_sintetico.csv"], steps: [
    { h: "Test binomial y potencia", t: "Región de rechazo, curvas de potencia y tamaño de muestra" },
    { h: "Validación por grados", t: "Binomial, Jeffreys, Hosmer-Lemeshow y curva de calibración" },
    { h: "χ² y KS", t: "Asociación vs. magnitud; separación de buenos y malos" },
    { h: "Desbalance", t: "class_weight, undersampling y corrección de prior" },
    { h: "Métricas y corte", t: "ROC, PR, matriz de confusión y corte por costos" },
  ] });
  L.sTakeaways(D, { title: "Cierre del Módulo 2", items: [
    "Una prueba de hipótesis controla el error tipo I; la potencia dice si podemos detectar el problema.",
    "Validar una PD es validar calibración (binomial, Jeffreys, HL) y discriminación (AUC, Gini, KS).",
    "Significativo no es material: mide siempre la magnitud del efecto.",
    "Balancear clases no mejora el ranking y descalibra: si lo haces, corrige el prior.",
    "El corte óptimo sale de los costos del negocio, no de un umbral de 0,5.",
  ], next: "Módulo 3 · Regresión logística y scorecards." });
  await L.save(D, OUT);
})();
