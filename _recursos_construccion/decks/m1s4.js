const L = require("./lib");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M1 S4 - Gobierno del riesgo, datos y modelos", footer: "DataBank Academy · Módulo 1 · Sesión 4 · Gobierno del riesgo, de datos y de modelos" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 1 · SESIÓN 4 DE 4", title: "Gobierno del riesgo, de datos y de modelos; tendencias y caso integrador",
    subtitle: "Quién decide, con qué información, con qué modelos y bajo qué controles", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Cierre del Módulo 1. La sesión termina con la actividad integradora: un memo para el comité de riesgos." });
  L.sAgenda(D, { items: [
    { t: "Gobierno del riesgo", d: "Comités, líneas de defensa y articulación entre áreas", min: 15 },
    { t: "Gobierno de datos y de modelos", d: "Calidad de información, monitoreo, deterioro, explicabilidad y supervisión humana", min: 25 },
    { t: "Cambios de política con evidencia y tendencias", d: "Champion–challenger; automatización, IA y canales digitales", min: 15 },
    { t: "Actividad integradora", d: "Diagnóstico del portafolio y recomendación para el comité de riesgos", min: 55, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "Gobierno del riesgo", sub: "Comités, líneas de defensa y articulación" });
  L.sCards(D, { title: "Funciones de una gerencia de riesgo minorista", cols: 3, cards: [
    { h: "Políticas y admisión", t: "Reglas, cortes y autonomías; operación de los motores de decisión." },
    { h: "Modelos", t: "Scores de originación, comportamiento y cobranza; PD, LGD y EAD." },
    { h: "Seguimiento de portafolio", t: "Indicadores, cosechas, alertas tempranas, tableros para el comité." },
    { h: "Cobranzas y recuperaciones", t: "Estrategias por tramo, refinanciamiento, venta de cartera." },
    { h: "Provisiones y capital", t: "Cálculo SBS y NIIF 9, escenarios, coordinación con Finanzas." },
    { h: "Validación de modelos", t: "Revisión independiente de desempeño, supuestos y uso de los modelos." },
  ] });
  L.sFlow(D, { title: "Tres líneas de defensa", steps: [
    { h: "1ª línea: negocio y cobranzas", t: ["Origina y gestiona al cliente", "Ejecuta la política y responde por sus excepciones", "Dueña del riesgo que asume"] },
    { h: "2ª línea: riesgos y cumplimiento", t: ["Define apetito, políticas y modelos", "Monitorea y alerta", "Cumplimiento: normativa, conducta de mercado, protección al consumidor"] },
    { h: "3ª línea: auditoría interna", t: ["Evalúa que el marco funcione", "Revisa trazabilidad y documentación", "Reporta al comité de auditoría"] },
  ], note: "la independencia entre quien origina, quien mide y quien audita es lo que hace creíble la gestión de riesgos.", size: 16 });
  L.sTable(D, { title: "Espacios de decisión y articulación entre áreas", colW: [3.0, 4.6, 4.53], rowH: 0.66,
    header: ["Instancia", "Decide", "Áreas que participan"],
    rows: [["Directorio / comité de riesgos", "Apetito, límites globales, políticas marco", "Riesgos, Finanzas, Auditoría"],
      ["Comité de créditos minoristas", "Cambios de política, cortes, nuevos productos", "Riesgos, Negocio, Cobranzas"],
      ["Comité de modelos", "Aprobación, uso, monitoreo y retiro de modelos", "Modelos, Validación, Tecnología"],
      ["Comité de provisiones", "Escenarios NIIF 9, overlays", "Riesgos, Finanzas, Contabilidad"],
      ["Comité de productos", "Diseño, precio y conducta de mercado", "Negocio, Riesgos, Cumplimiento, Legal"]],
    notes: "Cada instancia debe tener actas y trazabilidad: quién propuso, quién validó y quién aprobó." });

  L.sSection(D, { num: 2, title: "Gobierno de datos y de modelos", sub: "Un modelo es tan confiable como sus datos y su monitoreo" });
  L.sTable(D, { title: "Controles de calidad antes de modelar o reportar", colW: [2.4, 4.6, 5.13], rowH: 0.62,
    header: ["Dimensión", "Control", "Resultado en el caso"],
    rows: [["Unicidad", "Llaves y filas duplicadas", { text: "60 solicitudes duplicadas", options: { color: L.HEX.crimson, bold: true } }],
      ["Completitud", "% de faltantes por variable", { text: "EXT_SOURCE_1: 56 %; ocupación: 29 %", options: { color: L.HEX.crimson, bold: true } }],
      ["Validez", "Rangos y dominios", "Edad y montos dentro de rango"],
      ["Consistencia", "Reglas cruzadas", { text: "DAYS_EMPLOYED = 365243 en 10 703 pensionistas", options: { color: L.HEX.gold, bold: true } }],
      ["Oportunidad", "Fecha de corte y rezago de la fuente", "Documentar en cada entrega"]],
    note: "Todo control que falla necesita un dueño, un umbral y una acción documentada. Fuente: notebook M01_S04, sección 1." });
  L.sFormula(D, { title: "Monitoreo de estabilidad: PSI", formula: "PSI = Σ (a_i − e_i) · ln(a_i / e_i)", fsize: 34,
    where: [["e_i", "% de la población de desarrollo en el tramo i"], ["a_i", "% de la población actual en el tramo i"], ["< 0,10", "Estable (verde)"], ["0,10 – 0,25 / > 0,25", "Vigilar (ámbar) / cambio relevante (rojo)"]],
    example: { h: "Qué monitorear", t: ["Estabilidad: PSI del score y de cada variable (CSI)", "Discriminación: AUC / Gini por período", "Calibración: PD predicha vs. tasa observada", "Uso: overrides y excepciones"] } });
  L.sTable(D, { title: "Un modelo puede ordenar bien y estar mal calibrado", colW: [1.6, 2.0, 1.6, 1.6, 2.2, 2.2], w: 11.2, rowH: 0.6,
    header: ["Año", "Solicitudes", "PSI", "AUC", "PD predicha", "Tasa observada"],
    rows: [["2022 (desarrollo)", "14 943", "0,000", "0,748", "8,2 %", "8,2 %"], ["2023", "15 124", "0,007", "0,753", "8,8 %", { text: "10,4 %", options: { color: L.HEX.crimson, bold: true } }],
      ["2024", "15 071", "0,002", "0,746", "8,1 %", "7,5 %"], ["2025", "14 922", "0,009", "0,752", "7,7 %", { text: "5,9 %", options: { color: L.HEX.crimson, bold: true } }]],
    note: "Población estable y discriminación estable, pero calibración desfasada por el ciclo: subestima en 2023 y sobreestima en 2025. Acción: recalibrar. Fuente: notebook M01_S04, sección 2.",
    notes: "Este patrón es el más común en la práctica y no lo detecta quien solo mira AUC." });
  L.sCards(D, { title: "Explicabilidad y supervisión humana", cols: 2, cards: [
    { h: "Explicabilidad", t: ["Razones de decisión (reason codes) para cada cliente", "Variables comunicables y libres de sesgo indebido", "Documentación de supuestos y limitaciones", "SHAP, PDP e ICE en el Módulo 7"] },
    { h: "Supervisión humana", t: ["Revisión de casos límite y de alto monto", "Monitoreo de overrides y excepciones", "Capacidad de detener o revertir un modelo", "Responsables definidos y escalamiento"] },
  ], notes: "Las guías supervisoras de riesgo de modelo y los principios de IA responsable convergen en estos puntos." });

  L.sSection(D, { num: 3, title: "Cambios con evidencia y tendencias", sub: "Champion–challenger; automatización, IA y canales digitales" });
  L.sStats(D, { title: "Champion–challenger: el experimento del caso", stats: [
    { v: "77,6 %", l: "aprobación champion (corte 415)", color: L.HEX.navy },
    { v: "80,9 %", l: "aprobación challenger (corte 365, RCI ≤ 100 %)", color: L.HEX.green },
    { v: "5,0 % vs. 5,3 %", l: "tasa de malos champion vs. challenger", size: 34 },
    { v: "p = 0,24", l: "diferencia no significativa al 5 %", color: L.HEX.gold },
  ], points: ["+3,3 pp de aprobación con tasa de malos dentro de la meta (≤ 5,5 %)", "'No significativo' no significa 'igual': falta potencia para detectar 0,3 pp (Módulo 2)"] });
  L.sCards(D, { title: "Tendencias en decisiones crediticias", cols: 2, cards: [
    { h: "Automatización", t: ["Originación digital de punta a punta", "Motores de decisión y aprobación en minutos", "Monitoreo y cobranza automatizados"] },
    { h: "Analítica avanzada e IA", t: ["Gradient boosting (Módulos 4-5)", "Datos alternativos: transaccionales, open banking, pagos digitales", "Modelos de lenguaje en documentos y cobranza"] },
    { h: "Canales digitales", t: ["Billeteras, embedded finance, compra ahora y paga después", "Nuevos riesgos: fraude y sobreendeudamiento"] },
    { h: "Regulación y responsabilidad", t: ["Gestión del riesgo de modelos", "Explicabilidad, sesgo y supervisión humana", "Protección al consumidor"] },
  ] });

  D.sec("Actividad integradora y cierre");
  L.sQuestion(D, { title: "Actividad integradora", q: "Comercial propone crecer 20 % en consumo y tarjeta bajando el corte de admisión: \"la mora está en mínimos\". Finanzas pide el crecimiento; Cobranzas está al 95 % de su capacidad.",
    hint: "En grupos, preparen un memo de una página para el comité de riesgos, con evidencia del tablero y de las sesiones 1-4.",
    notes: "40 minutos de trabajo en grupos y 15 de plenaria. Usar el tablero ejecutivo y la plantilla del notebook M01_S04." });
  L.sTable(D, { title: "Plantilla del memo para el comité", colW: [2.8, 5.0, 4.33], rowH: 0.62,
    header: ["Sección", "Contenido esperado", "Evidencia"],
    rows: [["1. Situación", "Crecimiento, mora contable y ajustada, costo de riesgo, cobertura", "Tablero; sesión 2"],
      ["2. Señales adelantadas", "Cosechas recientes, 30@3, roll rates, entradas a mora", "Sesiones 2 y 3"],
      ["3. Rentabilidad", "RAROC por producto frente al costo de capital", "Sesión 2"],
      ["4. Evaluación de la propuesta", "Efecto del nuevo corte, plan de crecimiento, EL y capital", "Sesión 3; champion–challenger"],
      ["5. Riesgos y controles", "Concentración, capacidad de cobranza, datos, calibración", "Sesiones 3 y 4"],
      ["6. Recomendación", "Aprobar, aprobar con condiciones o rechazar", "Síntesis"]],
    note: "Criterios: evidencia cuantitativa, reconocimiento de supuestos y limitaciones, y claridad de la recomendación." });
  L.sLab(D, { notebook: "M01_S04_Gobierno_Datos_Modelos_y_Caso_Integrador.ipynb", data: ["hc_application_sintetico.csv", "cartera_panel_mensual.csv.gz"], steps: [
    { h: "Calidad de datos", t: "Controles de unicidad, completitud, validez y consistencia" },
    { h: "Monitoreo del modelo", t: "PSI, CSI, AUC y calibración por año" },
    { h: "Explicabilidad", t: "Razones de decisión para un cliente" },
    { h: "Champion–challenger", t: "Aprobación, tasa de malos y test de proporciones" },
    { h: "Caso integrador", t: "Tablero ejecutivo y memo para el comité" },
  ] });
  L.sTakeaways(D, { title: "Cierre del Módulo 1", items: [
    "La gestión integral conecta diseño, admisión, seguimiento, cobranza, provisiones, capital y rentabilidad.",
    "El apetito se vuelve operativo con límites, cortes, facultades y un máximo de excepciones.",
    "Los indicadores adelantados (cosechas, 30@3, SAT) permiten anticiparse; el RAROC decide dónde crecer.",
    "Gobierno de datos y modelos: controles de calidad, monitoreo de estabilidad, discriminación y calibración, y supervisión humana.",
    "Los cambios de política se prueban con champion–challenger y se documentan.",
  ], next: "Módulo 2 · Fundamentos estadísticos para riesgo." });
  await L.save(D, OUT);
})();
