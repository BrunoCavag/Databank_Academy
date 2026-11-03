const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];
const pct = (v, d = 1) => `${(v * 100).toFixed(d).replace(".", ",")} %`;

(async () => {
  const D = L.newDeck({ title: "M1 S3 - Organización, segmentación y gobierno", footer: "DataBank Academy · Módulo 1 · Sesión 3 · Organización, segmentación, indicadores y gobierno" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 1 · SESIÓN 3 DE 3", title: "Organización, segmentación, indicadores y gobierno del riesgo minorista",
    subtitle: "Quién decide qué, con qué información y bajo qué reglas", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Cierre del Módulo 1. Ya tenemos ciclo y apetito (S1) e indicadores de cartera (S2). Hoy: la organización que toma las decisiones, cómo segmenta y cómo gobierna los cambios." });
  L.sAgenda(D, { items: [
    { t: "Organización del equipo de riesgo minorista", d: "Funciones, líneas de defensa y comités", min: 15 },
    { t: "Segmentación de productos, clientes y portafolios", d: "Homogeneidad, heterogeneidad y accionabilidad", min: 15 },
    { t: "Indicadores del ciclo de crédito", d: "Originación, seguimiento, cobranza y recuperación", min: 20 },
    { t: "Gobierno: facultades, excepciones y cambios de política", d: "Autonomías, champion–challenger y articulación con otras áreas", min: 20 },
    { t: "Laboratorio y caso integrador", d: "Segmentación, FPD/30@3, cura, facultades y tablero ejecutivo", min: 50, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "La organización del riesgo minorista", sub: "Funciones, líneas de defensa y espacios de decisión" });
  L.sCards(D, { title: "Funciones típicas de una gerencia de riesgo minorista", cols: 3, cards: [
    { h: "Políticas y admisión", t: "Define reglas, cortes, autonomías; opera los motores de decisión." },
    { h: "Modelos (desarrollo)", t: "Construye scores de originación, comportamiento, cobranza, PD/LGD/EAD." },
    { h: "Seguimiento de portafolio", t: "Indicadores, cosechas, alertas tempranas, tableros para comité." },
    { h: "Cobranzas y recuperaciones", t: "Estrategias por tramo, campañas, refinanciaciones, venta de cartera." },
    { h: "Provisiones y capital", t: "Cálculo SBS e IFRS 9, escenarios, coordinación con Finanzas." },
    { h: "Validación y gobierno de modelos", t: "Revisión independiente del desempeño y de los supuestos de los modelos." },
  ], notes: "Dependiendo del tamaño de la entidad, varias funciones se fusionan. Lo importante es separar a quien desarrolla un modelo de quien lo valida." });
  L.sFlow(D, { title: "Tres líneas de defensa aplicadas al crédito minorista", steps: [
    { h: "1ª línea: negocio", t: ["Origina y gestiona la relación con el cliente", "Ejecuta la política y responde por sus excepciones", "Dueña del riesgo que asume"] },
    { h: "2ª línea: riesgos", t: ["Define apetito, políticas y modelos", "Monitorea, alerta y propone acciones", "Valida modelos de forma independiente"] },
    { h: "3ª línea: auditoría", t: ["Evalúa que el marco se cumpla", "Revisa trazabilidad y documentación", "Reporta al comité de auditoría"] },
  ], note: "la independencia entre quien origina, quien mide y quien audita es lo que hace creíble a la gestión de riesgos.", size: 16 });
  L.sTable(D, { title: "Espacios de decisión: quién aprueba qué", colW: [3.0, 4.7, 4.43], rowH: 0.65,
    header: ["Instancia", "Decide", "Insumos típicos"],
    rows: [
      ["Directorio / comité de riesgos", "Apetito de riesgo, límites globales, políticas marco", "Tablero de apetito, stress tests, capital"],
      ["Comité de créditos minoristas", "Cambios de política, cortes, nuevos productos", "Champion–challenger, cosechas, rentabilidad"],
      ["Comité de modelos", "Aprobación, uso y retiro de modelos", "Informe de desarrollo y de validación"],
      ["Comité de provisiones", "Overlays, escenarios IFRS 9", "Proyecciones macro y backtesting"],
      ["Jefaturas de admisión", "Casos dentro de su autonomía y excepciones", "Score, RCI, verificación"],
    ], notes: "Cada instancia debe tener actas y trazabilidad: quién propuso, quién validó y quién aprobó." });

  L.sSection(D, { num: 2, title: "Segmentación de cartera", sub: "Segmentar para decidir distinto, no para hacer más reportes" });
  L.sCards(D, { title: "Tres ejes de segmentación", cols: 3, cards: [
    { h: "Producto", t: ["Revolvente vs. cuotas", "Con o sin garantía", "Plazo y ticket"] },
    { h: "Cliente", t: ["Nuevo vs. recurrente", "Dependiente vs. independiente", "Bancarizado vs. sin historia", "Nivel de riesgo (score)"] },
    { h: "Portafolio / canal", t: ["Agencia, digital, fuerza de ventas, retail aliado", "Región", "Campaña o convenio"] },
  ], notes: "La segmentación de modelos (un score por segmento) y la de gestión (estrategias distintas) no siempre coinciden." });
  L.sCompare(D, { title: "¿Cuándo una segmentación es buena?", left: { h: "Criterios estadísticos", icon: "✓", items: ["Homogeneidad interna: riesgo parecido dentro del segmento", "Heterogeneidad entre segmentos: tasas de malos claramente distintas", "Tamaño suficiente para estimar y monitorear", "Estabilidad en el tiempo"] },
    right: { h: "Criterios de negocio", icon: "$", items: ["Accionable: cada segmento tiene una estrategia distinta", "Entendible por comercial y cobranzas", "Implementable en los sistemas (motor de decisión)", "Alineada con la rentabilidad"] },
    verdict: "si dos segmentos reciben la misma política, el mismo precio y la misma cobranza, en la práctica son un solo segmento." });

  L.sSection(D, { num: 3, title: "Indicadores del ciclo de crédito", sub: "Una métrica para cada decisión" });
  L.sTable(D, { title: "El tablero por etapa del ciclo", colW: [2.2, 4.6, 5.33], rowH: 0.72,
    header: ["Etapa", "Indicadores", "Pregunta que responde"],
    rows: [
      ["Originación", "Tasa de aprobación, ticket, FPD, 30@3, 60@6", "¿Estamos aprobando bien?"],
      ["Seguimiento", "% al día, entradas a mora 1-30, migración de categorías", "¿Se deteriora la cartera viva?"],
      ["Cobranza", "Roll rate 1-30 → 31-60, tasa de cura, contactabilidad", "¿La cobranza contiene la mora?"],
      ["Recuperación", "Castigos, tasa de recupero post-castigo, LGD observada", "¿Cuánto recuperamos de lo perdido?"],
      ["Rentabilidad", "Margen ajustado por riesgo, costo de riesgo, RAROC", "¿El precio paga el riesgo?"],
    ], notes: "FPD (first payment default): el cliente no paga su primera cuota. Es un indicador muy temprano de fraude o de problemas de admisión." });
  const tp = J.m1s3_temprana;
  L.sChart(D, { title: "Indicadores tempranos de originación por cosecha", chart: { type: "line", labels: tp.labels.map(x => x.replace("Q", " T")),
      series: [{ name: "FPD", values: tp.FPD }, { name: "30@3", values: tp["30@3"] }, { name: "60@6", values: tp["60@6"] }],
      opts: { showLegend: true, valAxisLabelFormatCode: "0.0%", lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6, chartColors: [L.HEX.slate, L.HEX.gold, L.HEX.crimson] } },
    points: ["30@3: % de la cosecha con más de 30 días de atraso en sus primeros 3 meses", "60@6: idem, más de 60 días en 6 meses", "Se leen 3-6 meses después del desembolso: ideales para evaluar cambios de política"],
    source: "Fuente: cartera_panel_mensual.csv.gz (sintético). Tarjeta, consumo y microempresa. Notebook M01_S03.",
    notes: "Notar que las cosechas de 2023 tienen 60@6 claramente mayor. Si una nueva política se implementa, el 30@3 de las primeras cosechas da la primera lectura." });
  const rc = J.m1s3_recupero;
  L.sChart(D, { title: "Recuperación: cuánto vuelve después del castigo", chart: { type: "bar", labels: rc.labels.map(x => x.replace("Consumo no revolvente", "Consumo NR").replace("Tarjeta de crédito", "Tarjeta")), series: [{ name: "Tasa de recupero a 12 meses", values: rc.values }],
      opts: { barDir: "bar", showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0%", valAxisLabelFormatCode: "0%", chartColors: [L.HEX.green] } },
    points: ["Productos con garantía (vehicular, hipotecario) recuperan más", "LGD aproximada = 1 − tasa de recupero", "Falta descontar el tiempo y los costos de cobranza: workout LGD en el Módulo 7"],
    source: "Castigos con al menos 12 meses de observación. Notebook M01_S03, sección 2.",
    notes: "La LGD observada es un insumo clave para el pricing y las provisiones." });

  L.sSection(D, { num: 4, title: "Gobierno de políticas", sub: "Facultades, excepciones y cambios controlados" });
  const fac = [["Automático", "Analista", "Jefe de admisión", "Comité de créditos"], ["Automático", "Automático", "Analista", "Jefe de admisión"], ["Automático", "Automático", "Automático", "Analista"]];
  const fcol = { "Automático": "D8F0E3", "Analista": "FFF4D6", "Jefe de admisión": "FBD9DE", "Comité de créditos": "F4B6BE" };
  L.sTable(D, { title: "Matriz de facultades: monto × nivel de riesgo", w: 9.3, colW: [1.7, 1.9, 1.9, 1.9, 1.9], rowH: 0.85, fsize: 14,
    header: ["Riesgo \\ monto", "≤ S/ 15 mil", "S/ 15-40 mil", "S/ 40-100 mil", "> S/ 100 mil"],
    rows: ["Alto", "Medio", "Bajo"].map((r, i) => [r, ...fac[i].map(f => ({ text: f, options: { fill: { color: fcol[f] }, align: "center", bold: false } }))]),
    side: ["81 % de las solicitudes se resuelve automáticamente", "14 % va a analista, 5 % a jefatura y < 1 % a comité", "Más autonomía automática: más rapidez y menor costo, pero más riesgo sin revisar", "El comité debería ver pocos casos, pero con alto monto en riesgo"],
    notes: "Valores de la simulación del notebook M01_S03, sección 3." });
  L.sFlow(D, { title: "Champion–challenger: cambiar la política con evidencia", steps: [
    { h: "Hipótesis", t: ["Qué cambia y por qué", "Métrica de éxito definida antes"] },
    { h: "Asignación aleatoria", t: ["10-20 % al challenger", "Tamaño de muestra con potencia suficiente (M2)"] },
    { h: "Maduración", t: ["Esperar 30@3 / 60@6", "No decidir con la mora del primer mes"] },
    { h: "Decisión", t: ["Comité con resultados y significancia", "Documentar quién propuso, validó y aprobó"] },
    { h: "Despliegue", t: ["Implementación gradual", "Monitoreo y plan de rollback"] },
  ], note: "sin asignación aleatoria no se puede atribuir la diferencia a la política: puede ser el ciclo, el canal o la campaña." });
  L.sStats(D, { title: "El experimento del caso", stats: [
    { v: "77,6 %", l: "aprobación champion (corte 415)", color: L.HEX.navy },
    { v: "80,9 %", l: "aprobación challenger (corte 365, RCI ≤ 100 %)", color: L.HEX.green },
    { v: "5,0 % vs 5,3 %", l: "tasa de malos champion vs. challenger", size: 34 },
    { v: "p = 0,24", l: "la diferencia en tasa de malos no es significativa al 5 %", color: L.HEX.gold },
  ], points: ["+3,3 pp de aprobación con una tasa de malos dentro de la meta (≤ 5,5 %)", "Pero 'no significativo' no significa 'igual': con 12 mil casos el test tiene poca potencia para diferencias de 0,3 pp (Módulo 2)"],
    notes: "Valores del notebook M01_S03, sección 4. Buena puerta de entrada al Módulo 2: pruebas de hipótesis y potencia." });
  L.sCards(D, { title: "Articulación con otras áreas", cols: 3, cards: [
    { h: "Negocio", t: "Metas de crecimiento compatibles con el apetito; dueño de las excepciones; retroalimenta sobre fricciones del proceso." },
    { h: "Finanzas", t: "Presupuesto de provisiones y costo de riesgo; tasas de fondeo; rentabilidad y capital por producto." },
    { h: "Cobranzas", t: "Capacidad operativa frente al crecimiento; estrategias por segmento; datos de cura y recupero para los modelos." },
  ], notes: "El caso integrador final del programa pide justamente esta integración ante un panel." });
  L.sQuestion(D, { title: "Caso de discusión", q: "Comercial propone bajar el corte de 415 a 365 para todos los canales: \"la mora está en mínimos\". Finanzas pide crecer 20 % y Cobranzas está al 95 % de su capacidad.",
    hint: "¿Qué indicadores apoyan o contradicen el argumento (mora contable vs. cosechas)? ¿Qué evidencia pedirías? ¿Qué condiciones pondrías: canal, límites, monitoreo, rollback? ¿Cómo involucras a Finanzas y Cobranzas?",
    notes: "Grupos de 4, 10 minutos, luego plenaria. Usar el tablero ejecutivo del notebook como insumo." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M01_S03_Segmentacion_Indicadores_y_Gobierno.ipynb", data: ["cartera_panel_mensual.csv.gz", "hc_application_sintetico.csv"], steps: [
    { h: "Segmentación", t: "Matriz producto × segmento y crecimiento vs. riesgo por canal" },
    { h: "Indicadores del ciclo", t: "FPD, 30@3, 60@6, entradas a mora, cura y recupero" },
    { h: "Facultades", t: "Carga por nivel de autonomía" },
    { h: "Champion–challenger", t: "Aprobación, tasa de malos y test de proporciones" },
    { h: "Tablero ejecutivo", t: "KPIs y tendencias en una página para el comité" },
  ] });
  L.sTakeaways(D, { title: "Cierre del Módulo 1", items: [
    "La gestión integral conecta originación, seguimiento, cobranza, provisiones y rentabilidad en un solo sistema.",
    "El apetito se vuelve operativo con límites, cortes, facultades y un % máximo de excepciones.",
    "Cada etapa del ciclo tiene sus indicadores; los adelantados (cosechas, 30@3) son los que permiten anticiparse.",
    "Los cambios de política se prueban con champion–challenger y se gobiernan con trazabilidad.",
    "Siguiente paso: el lenguaje probabilístico que sostiene los modelos de PD.",
  ], next: "Módulo 2 · Fundamentos estadísticos para riesgo." });
  await L.save(D, OUT);
})();
