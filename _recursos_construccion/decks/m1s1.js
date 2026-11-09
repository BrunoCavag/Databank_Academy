const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];
const pct = v => `${(v * 100).toFixed(1).replace(".", ",")} %`;

(async () => {
  const D = L.newDeck({ title: "M1 S1 - Ciclo de vida del crédito y apetito de riesgo", footer: "DataBank Academy · Módulo 1 · Sesión 1 · Crédito minorista: ciclo de vida, apetito y políticas" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 1 · SESIÓN 1 DE 4", title: "Crédito minorista: ciclo de vida, apetito de riesgo y políticas",
    subtitle: "Gestión integral del riesgo de crédito minorista", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Bienvenida al programa. Presentación del docente y de la dinámica: cada sesión de 2 horas combina unos 60 minutos de fundamentos y discusión con 50-60 minutos de laboratorio en Python. Este primer módulo es el lenguaje de negocio: todo lo que modelemos después tiene que terminar en una decisión de aprobación, provisión, precio o gestión de cartera." });
  L.sAgenda(D, { items: [
    { t: "Qué hace distinto al crédito minorista", d: "Frente al corporativo y pyme; las decisiones de un equipo de riesgo", min: 15 },
    { t: "El ciclo de vida completo", d: "Del diseño del producto al cierre", min: 15 },
    { t: "Apetito de riesgo y punto de corte", d: "Del marco de apetito a la curva de estrategia y la rentabilidad", min: 25 },
    { t: "Políticas, límites, facultades y excepciones", d: "Filtros, capacidad de pago, matriz de decisión, autonomías y overrides", min: 25 },
    { t: "Laboratorio", d: "Concentración, embudo, curva de estrategia, RCI, excepciones y facultades", min: 40, lab: true },
  ], notes: "Tiempos referenciales para 120 minutos. El laboratorio puede intercalarse: después de la sección 3 se ejecutan los bloques 1-3 del notebook y al final los bloques 4-5." });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Distinguir el crédito minorista", t: "Explicar por qué se gestiona con modelos y portafolios, y recorrer el ciclo de vida completo." },
    { h: "Traducir apetito en política", t: "Convertir una tolerancia de pérdida en un punto de corte usando la curva de estrategia." },
    { h: "Combinar voluntad y capacidad", t: "Diseñar una matriz de decisión que cruce el score con la relación cuota/ingreso." },
    { h: "Gobernar facultades y excepciones", t: "Diseñar autonomías, medir el costo de los overrides y proponer límites para el comité." },
  ], notes: "Enfatizar que son objetivos de decisión, no de software." });

  L.sSection(D, { num: 1, title: "Qué hace distinto al crédito minorista", sub: "Granularidad, automatización y gestión por portafolio" });
  L.sTable(D, { title: "Minorista vs. pyme vs. corporativo", colW: [2.6, 3.4, 2.9, 3.23], rowH: 0.62,
    header: ["Dimensión", "Minorista", "Pyme", "Corporativo"],
    rows: [["Deudores", "Cientos de miles o millones", "Miles a decenas de miles", "Decenas a cientos"],
      ["Exposición individual", "Pequeña: ninguna amenaza al banco", "Media", "Grande: concentración"],
      ["Información", "Solicitud, buró, transaccional", "EEFF parciales + buró", "EEFF auditados, rating externo"],
      ["Decisión", "Automatizada: score + políticas + motor", "Mixta: score + analista", "Analista y comité, caso a caso"],
      ["Gestión del riesgo", "Estadística, por portafolio y cosechas", "Mixta", "Individual: rating y covenants"],
      ["Basilea", "Cartera minorista, correlaciones bajas", "Minorista si la exposición es pequeña", "Corporativa, correlación alta"]],
    notes: "La pyme es un punto intermedio: las más pequeñas se gestionan como minoristas (score + política), las más grandes como corporativas." });
  L.sStats(D, { title: "Granularidad: la misma suma de dinero, otro problema de riesgo", stats: [
    { v: "60 060", l: "deudores en la cartera minorista del caso", color: L.HEX.navy },
    { v: "0,3 %", l: "del saldo en los 10 mayores deudores minoristas", color: L.HEX.green },
    { v: "150", l: "deudores en una cartera corporativa simulada", color: L.HEX.navy },
    { v: "≈ 35 %", l: "del saldo en sus 10 mayores deudores" },
  ], points: ["En minorista el riesgo individual se diversifica: lo que importa son las tasas por segmento (PD, LGD) y el ciclo económico", "Por eso se gestiona con modelos, políticas, motores de decisión y análisis de portafolio"],
    notes: "Valores del notebook M01_S01, sección 0 (HHI y número equivalente de deudores). La cifra corporativa depende de la simulación lognormal." });
  L.sCards(D, { title: "Seis decisiones que toma un equipo de riesgo minorista", cols: 3, cards: [
    { h: "¿A quién prestar?", t: "Admisión: score, políticas, filtros y verificación." },
    { h: "¿Cuánto prestar?", t: "Monto o línea según capacidad de pago y endeudamiento." },
    { h: "¿A qué precio?", t: "Tasa que cubra fondeo, costos, pérdida esperada y capital." },
    { h: "¿Cómo seguir la cartera?", t: "Alertas, comportamiento, gestión de líneas y renovaciones." },
    { h: "¿Cómo cobrar y recuperar?", t: "Estrategias por tramo, refinanciación, castigo y venta de cartera." },
    { h: "¿Cuánto provisionar?", t: "Provisiones regulatorias (SBS) y pérdida esperada (NIIF 9)." },
  ], notes: "Cada decisión corresponde a módulos del programa: admisión (M3-M8), provisiones (M9), precio (M10), cartera y cobranza (M11). La idea de 'integral' es que optimizar una decisión aislada (por ejemplo, aprobar más) mueve las demás (provisiones, cobranza, capital)." });
  L.sTable(D, { title: "La cartera minorista: productos con lógicas de riesgo distintas", colW: [2.7, 2.0, 1.9, 1.9, 1.9, 1.73],
    header: ["Tipo de crédito (SBS)", "Ticket típico", "Plazo", "Tasa", "Riesgo", "Garantía"],
    rows: [
      ["Consumo revolvente (tarjeta)", "Bajo", "Indefinido", "Muy alta", "Alto", "No"],
      ["Consumo no revolvente", "Bajo-medio", "12-60 meses", "Alta", "Medio-alto", "No / descuento por planilla"],
      ["Vehicular", "Medio", "36-60 meses", "Media", "Medio", "Prenda"],
      ["Hipotecario", "Alto", "15-25 años", "Baja", "Bajo", "Hipoteca"],
      ["Microempresa", "Bajo", "6-24 meses", "Alta", "Alto", "Generalmente no"],
      ["Pequeña empresa", "Medio", "12-48 meses", "Media-alta", "Medio-alto", "A veces"],
    ], rowH: 0.55, note: "La Res. SBS N.° 11356-2008 clasifica la cartera en 8 tipos de crédito; el minorista abarca consumo (revolvente y no revolvente), hipotecario, micro y pequeña empresa.",
    notes: "Mensaje: no hay 'un' riesgo minorista. La tarjeta tiene mora alta pero tasa alta; el hipotecario tiene mora baja pero plazos muy largos y riesgo de concentración en el ciclo inmobiliario. Pregunta rápida: ¿qué producto tiene la mayor pérdida esperada por sol prestado? ¿Y el mayor capital?" });

  L.sSection(D, { num: 2, title: "El ciclo de vida completo del crédito", sub: "Del diseño del producto al cierre" });
  L.sTable(D, { title: "Siete etapas, siete decisiones", colW: [2.3, 4.9, 4.93], rowH: 0.6,
    header: ["Etapa", "Decisiones clave", "Datos y herramientas"],
    rows: [["Diseño del producto", "Mercado objetivo, monto, plazo, tasa, garantías, canal", "Pricing ajustado por riesgo, simulación de P&L"],
      ["Originación", "Captación, canales, preaprobados", "Campañas, scores de propensión, prescreening"],
      ["Admisión", "Aprobar o rechazar, monto, tasa", "Score, políticas, capacidad de pago, verificación"],
      ["Seguimiento", "Líneas, renovaciones, alertas", "Score de comportamiento, alerta temprana, watchlist"],
      ["Cobranza", "Contacto, refinanciamiento, reestructuración", "Score de cobranza, estrategias por tramo, curación"],
      ["Recuperación", "Judicial, castigo, venta de cartera", "LGD, recuperos, costos"],
      ["Cierre", "Cancelación, liberación de garantías, castigo final", "Cosechas cerradas, rentabilidad realizada"]],
    note: "El cierre retroalimenta el diseño: la rentabilidad realizada de una cosecha es la prueba de que el producto estaba bien diseñado.",
    notes: "Cada etapa genera los datos que alimentan los modelos de la siguiente: el ciclo es un sistema, no una secuencia de áreas. Ejemplo de una tarjeta: se diseña con un pricing que supone una pérdida; se aprueba con un score; se gestiona la línea con comportamiento; si cae en mora, se cobra; si se castiga, el recupero define la LGD; al cerrar la cosecha se compara la rentabilidad realizada con la diseñada." });
  L.sFlow(D, { title: "El embudo de originación", lead: "Cada capa filtra volumen y debería filtrar riesgo. Si no reduce riesgo, sólo destruye negocio.", steps: [
    { h: "Solicitud", t: ["Canal: agencia, digital, fuerza de ventas, retail", "Datos declarados + buró"] },
    { h: "Filtros duros", t: ["Edad, ingreso mínimo", "Calificación RCC SBS", "Listas negras y fraude"] },
    { h: "Score", t: ["PD estimada", "Banda de riesgo", "Punto de corte"] },
    { h: "Capacidad", t: ["Cuota / ingreso (RCI)", "Endeudamiento total", "Monto máximo"] },
    { h: "Oferta", t: ["Monto, plazo y tasa", "Excepciones con autonomía"] },
    { h: "Desembolso", t: ["Verificación", "Tasa de toma (take-up)"] },
  ], note: "medir la tasa de malos de los rechazados por cada filtro (aislado) dice si el filtro aporta.",
    notes: "En el laboratorio veremos que el filtro de ingreso mínimo rechaza clientes con tasa de malos similar o menor al promedio: es un filtro que cuesta volumen sin aportar riesgo. Ojo con la 'tasa de toma': aprobar no es desembolsar, y los que no toman suelen ser los mejores clientes (selección adversa)." });
  L.sCards(D, { title: "Modelos y herramientas a lo largo del ciclo", cols: 2, cards: [
    { h: "Score de originación (application)", t: ["Información de la solicitud y del buró", "Clientes nuevos: poca o ninguna historia interna", "Decide aprobación, monto y precio"] },
    { h: "Score de comportamiento (behavior)", t: ["Uso, pagos y saldos de los últimos meses", "Gestión de líneas, renovaciones y venta cruzada", "Insumo para provisiones (PD de cartera viva)"] },
    { h: "Score de cobranza (collection)", t: ["Probabilidad de cura o de roll forward", "Prioriza la gestión y el canal de contacto", "Optimiza la capacidad del call center"] },
    { h: "Modelos de pérdida (LGD, EAD)", t: ["Cuánto se pierde si incumple y con qué exposición", "Provisiones NIIF 9, pricing y capital", "Módulo 9"] },
  ], notes: "Mencionar que en el programa construiremos sobre todo modelos de PD (originación), y en el Módulo 9 completaremos la tríada PD-LGD-EAD." });
  L.sQuestion(D, { q: "Si sólo pudieras invertir en mejorar una etapa del ciclo este año, ¿cuál elegirías y por qué?",
    hint: "Considera dónde se origina la pérdida (admisión) frente a dónde se contiene (cobranza), y qué etapa tiene hoy menos datos y menos modelos en tu institución.",
    notes: "Dinámica de 5 minutos. Recoger 3-4 respuestas. No hay respuesta única: en carteras de rápido crecimiento suele ser originación; en carteras maduras, cobranza temprana." });

  L.sSection(D, { num: 3, title: "Apetito de riesgo y punto de corte", sub: "Cuánto riesgo estamos dispuestos a asumir para lograr nuestros objetivos" });
  L.sFlow(D, { title: "El marco de apetito de riesgo", steps: [
    { h: "Capacidad", t: ["Máximo riesgo que la entidad puede asumir", "Restringida por capital, liquidez y regulación"] },
    { h: "Apetito", t: ["Riesgo que se desea asumir para cumplir la estrategia", "Aprobado por el directorio"] },
    { h: "Tolerancia", t: ["Desviación aceptable alrededor del apetito", "Dispara alertas y planes de acción"] },
    { h: "Límites", t: ["Traducción operativa: por producto, canal, segmento", "Puntos de corte, montos máximos, % excepciones"] },
  ], note: "el apetito vive en el directorio; los límites viven en la política de admisión. El trabajo del equipo de riesgo es conectarlos con números.",
    notes: "Capacidad > apetito > tolerancia. Ejemplo: capacidad de pérdida anual de 6 % de la cartera de consumo; apetito, costo de riesgo de 4 %; tolerancia, hasta 4,5 % con plan de acción; límites, corte de score de 415 y máximo 5 % de excepciones." });
  L.sTable(D, { title: "Ejemplo de tablero de apetito para consumo", colW: [3.6, 2.0, 2.0, 2.0, 2.53],
    header: ["Métrica", "Apetito", "Tolerancia", "Límite", "Frecuencia"],
    rows: [
      ["Costo de riesgo anualizado", "≤ 4,0 %", "4,0-4,5 %", "> 4,5 %", "Mensual"],
      ["Mora > 30 días (ajustada por castigos)", "≤ 6,0 %", "6-7 %", "> 7 %", "Mensual"],
      ["Cosecha 60@6 (originaciones del trimestre)", "≤ 3,0 %", "3-3,5 %", "> 3,5 %", "Trimestral"],
      ["Tasa de malos esperada de aprobados", "≤ 5,0 %", "5-5,5 %", "> 5,5 %", "Mensual"],
      ["% de aprobaciones por excepción", "≤ 3 %", "3-5 %", "> 5 %", "Mensual"],
      ["RAROC del producto", "≥ 20 %", "15-20 %", "< 15 %", "Trimestral"],
    ], rowH: 0.55, note: "Valores ilustrativos para la discusión en clase.",
    notes: "Notar que mezclamos métricas de stock (mora), de flujo (costo de riesgo), adelantadas (cosechas) y de rentabilidad (RAROC). Un apetito solo con mora contable es peligroso: la mora puede bajar porque la cartera crece (lo veremos en la sesión 2)." });
  L.sChart(D, { title: "Un score ordena el riesgo: tasa de malos por decil", chart: { type: "bar", labels: J.m1s1_deciles.labels, series: [{ name: "Tasa de malos", values: J.m1s1_deciles.values }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0%", valAxisLabelFormatCode: "0%", chartColors: [L.HEX.navy], catAxisTitle: "Decil de score (D1 = más riesgoso)", showCatAxisTitle: true } },
    kpi: { v: `${(J.m1s1_deciles.values[0] / J.m1s1_deciles.values[9]).toFixed(0)}x`, l: "más riesgo en D1 que en D10" },
    points: ["Score de buró simulado sobre 60 mil solicitudes con esquema Home Credit", "Tasa de malos promedio: 8 %", "La pendiente entre deciles es lo que permite fijar un corte"],
    source: "Fuente: hc_application_sintetico.csv (sintético, esquema Kaggle Home Credit). Notebook M01_S01.",
    notes: "Un buen score muestra una relación monótona y pronunciada. Si los deciles intermedios se cruzan, el score no ordena bien en esa zona y los cortes son inestables." });
  L.sChart(D, { title: "Curva de estrategia: aprobación vs. tasa de malos", chart: { type: "line", labels: J.m1s1_strategy.labels,
      series: [{ name: "Tasa de aprobación", values: J.m1s1_strategy.aprob }, { name: "Tasa de malos de aprobados", values: J.m1s1_strategy.malos }],
      combo: true,
      opts: { showLegend: true, chartColors: [L.HEX.navy, L.HEX.crimson],
        valAxes: [{ showValAxisTitle: true, valAxisTitle: "Aprobación", valAxisLabelFormatCode: "0%", valAxisMinVal: 0, valAxisMaxVal: 1 }, { showValAxisTitle: true, valAxisTitle: "Tasa de malos", valAxisLabelFormatCode: "0%", valAxisMinVal: 0, valAxisMaxVal: 0.1, valGridLine: { style: "none" } }],
        catAxes: [{ catAxisTitle: "Punto de corte del score", showCatAxisTitle: true }, { catAxisHidden: true }] } },
    points: ["Subir el corte reduce la tasa de malos… y la aprobación", "Con apetito de 5 % de malos, el corte es 415 y se aprueba ~78 %", "Cada punto de tasa de malos tiene un 'precio' en volumen"],
    notes: "Construir la curva: para cada corte, % de aprobados y tasa de malos de los aprobados. La política elige el corte que maximiza la aprobación sujeto a la restricción de apetito." });
  L.sFormula(D, { title: "Del apetito en tasa de malos a la rentabilidad", formula: "Contribución ≈ S̄ · (r − r_f − c_op) − 𝟙_D · LGD · EAD",
    where: [["S̄", "Saldo promedio durante la vida del crédito (≈ 55 % del monto)"], ["r − r_f − c_op", "Tasa activa menos fondeo y costo operativo (28 % − 6 % − 7 %)"], ["𝟙_D", "Indicador de incumplimiento (1 si el cliente incumple)"], ["LGD · EAD", "Pérdida si incumple: 75 % de una exposición de 80 % del monto"]],
    example: { h: "PD de equilibrio", t: ["Margen: 0,55 × 15 % = 8,25 % del monto", "Pérdida si incumple: 0,75 × 0,80 = 60 %", "PD de equilibrio ≈ 8,25 / 60 ≈ 13,8 %", "Clientes con PD > 13,8 % destruyen valor… antes del capital"] },
    notes: "Ésta es una versión simplificada de la ecuación de pricing del Módulo 10. Sirve para mostrar que el corte óptimo depende de la tasa: si la tasa sube, la PD de equilibrio sube y el corte rentable baja." });
  const ut = J.m1s1_utilidad; const iMax = ut.values.indexOf(Math.max(...ut.values));
  L.sChart(D, { title: "El corte rentable no siempre coincide con el apetito", chart: { type: "line", labels: ut.labels, series: [{ name: "Utilidad (S/ MM)", values: ut.values }],
      opts: { lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 5, chartColors: [L.HEX.green], valAxisTitle: "Contribución total (S/ MM)", showValAxisTitle: true, catAxisTitle: "Punto de corte del score", showCatAxisTitle: true } },
    kpi: { v: "≈ 390 vs. 415", l: "corte de máxima utilidad vs. corte por apetito (notebook, tras filtros)" },
    points: ["Por debajo de ~390 se aprueban clientes con PD sobre el equilibrio", "Por encima, se rechazan clientes rentables", "Si el corte rentable implica más riesgo que el tolerado, decide el gobierno, no el modelo"],
    notes: "La utilidad máxima y el apetito están cerca en este caso, pero no tienen por qué estarlo. El capital (pérdida inesperada) agrega un costo que mueve el corte rentable hacia arriba: lo incorporaremos con RAROC." });

  L.sSection(D, { num: 4, title: "Políticas de admisión, límites y excepciones", sub: "Voluntad de pago + capacidad de pago + gobierno" });
  L.sCards(D, { title: "Las capas de una política de admisión", cols: 3, cards: [
    { h: "Filtros duros", t: "Requisitos mínimos no negociables: edad, documento, calificación SBS, fraude." },
    { h: "Score y corte", t: "Voluntad de pago: PD estimada y banda de riesgo con corte según apetito." },
    { h: "Capacidad de pago", t: "Cuota/ingreso, endeudamiento total en el sistema y estabilidad del ingreso." },
    { h: "Límites de exposición", t: "Monto máximo por cliente, producto, canal y nivel de riesgo." },
    { h: "Verificación", t: "Validación de ingresos, identidad y domicilio, proporcional al riesgo." },
    { h: "Excepciones", t: "Aprobaciones fuera de política con autonomía, registro y seguimiento." },
  ], notes: "Recordar que cada capa debe justificarse con datos: tasa de malos de los rechazados y volumen perdido." });
  L.sChart(D, { title: "La capacidad de pago también discrimina", chart: { type: "bar", labels: J.m1s1_rci.labels, series: [{ name: "Tasa de malos", values: J.m1s1_rci.values }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0%", valAxisLabelFormatCode: "0%", chartColors: [L.HEX.crimson], catAxisTitle: "Relación cuota / ingreso mensual (RCI)", showCatAxisTitle: true } },
    points: ["Hasta 40-50 % de RCI la tasa de malos crece suave", "Por encima de 70 % casi se duplica", "RCI y score miden cosas distintas: conviene cruzarlos"],
    source: "Fuente: hc_application_sintetico.csv. Notebook M01_S01, sección 4.",
    notes: "RCI = cuota mensual / ingreso mensual. En la práctica se usa el endeudamiento total (todas las cuotas del sistema financiero según el RCC) y no sólo la del crédito nuevo." });
  const m = J.m1s1_matriz;
  const dec = [["Revisión", "Rechazar", "Rechazar"], ["Aprobar", "Aprobar con monto reducido", "Rechazar / excepción"], ["Aprobar", "Aprobar", "Aprobar con monto reducido"]];
  const colorFor = v => v > 0.12 ? "F8D7DA" : v > 0.06 ? "FFF4D6" : "D8F0E3";
  L.sTable(D, { title: "Matriz de decisión: score × capacidad de pago", colW: [2.2, 3.4, 3.4, 3.13], fsize: 14, rowH: 0.9,
    header: ["", ...m.cols],
    rows: m.rows.map((r, i) => [r, ...m.values[i].map((v, j) => ({ text: `${pct(v)} de malos\n${dec[i][j]}`, options: { fill: { color: colorFor(v) }, bold: false, align: "center" } }))]),
    note: "Celdas: tasa de malos observada y decisión propuesta. Verde < 6 %, ámbar 6-12 %, rojo > 12 %.",
    notes: "La matriz combina voluntad de pago (score) y capacidad (RCI). Es la forma más transparente de comunicar política a negocio. Preguntar: ¿aprobarías score medio con RCI > 50 % si el cliente tiene vivienda propia?" });
  L.sCompare(D, { title: "Excepciones: dos tipos de override", left: { h: "Low-side override", icon: "L", items: ["Se aprueba a quien la política rechaza", "Riesgo: deteriora la cartera", "Típico: presión comercial, montos altos, clientes 'conocidos'", "Control: autonomía, registro del motivo y seguimiento de su desempeño"] },
    right: { h: "High-side override", icon: "H", items: ["Se rechaza a quien la política aprueba", "Costo: volumen y clientes buenos perdidos", "Típico: información cualitativa o desconfianza en el score", "Control: medir la tasa de malos de los rechazados por excepción"] },
    verdict: "toda excepción debe ser medible. Si las excepciones rinden igual que la política, la política es demasiado estricta; si rinden mucho peor, falta control.",
    notes: "Lo ideal es tener los dos lados medidos. En muchas entidades solo se mide el low-side." });
  const fac = [["Automático", "Analista", "Jefe de admisión", "Comité de créditos"], ["Automático", "Automático", "Analista", "Jefe de admisión"], ["Automático", "Automático", "Automático", "Analista"]];
  const fcol = { "Automático": "D8F0E3", "Analista": "FFF4D6", "Jefe de admisión": "FBD9DE", "Comité de créditos": "F4B6BE" };
  L.sTable(D, { title: "Facultades: quién puede aprobar qué", w: 9.3, colW: [1.7, 1.9, 1.9, 1.9, 1.9], rowH: 0.85, fsize: 14,
    header: ["Riesgo \\ monto", "≤ S/ 15 mil", "S/ 15-40 mil", "S/ 40-100 mil", "> S/ 100 mil"],
    rows: ["Alto", "Medio", "Bajo"].map((r, i) => [r, ...fac[i].map(f => ({ text: f, options: { fill: { color: fcol[f] }, align: "center", bold: false } }))]),
    side: ["La matriz de facultades es la traducción operativa del apetito", "En el caso, ~81 % de las solicitudes se resuelve automáticamente", "El comité ve pocos casos, pero con alto monto en riesgo", "Toda excepción se aprueba dentro de una facultad y queda registrada"],
    notes: "Valores de la simulación del notebook M01_S01, sección 5." });
  L.sStats(D, { title: "El costo de las excepciones en nuestro caso", stats: [
    { v: "3,1 %", l: "de la cartera aprobada entra por excepción", color: L.HEX.navy },
    { v: "20,1 %", l: "tasa de malos de las excepciones" },
    { v: "5,0 %", l: "tasa de malos de los aprobados por política", color: L.HEX.green },
    { v: "+0,4 pp", l: "de tasa de malos total por excepciones", color: L.HEX.gold },
  ], points: ["Pocas excepciones, pero con montos promedio 50 % más altos: el impacto en pérdida es mayor que en número", "Propuesta: límite de 3 % por agencia, revisión mensual en comité y alerta si la tasa de malos de excepciones supera 2 veces la de la política"],
    notes: "Valores del notebook (sección 5). Se simuló que comercial aprueba como excepción el 15 % de los rechazados, con sesgo hacia montos altos." });
  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M01_S01_Ciclo_de_Vida_Originacion_y_Apetito.ipynb", data: ["hc_application_sintetico.csv", "60 060 solicitudes · 26 variables", "Esquema Home Credit (Kaggle)"], steps: [
    { h: "Primera lectura del portafolio", t: "Variables de negocio (edad, RCI, LTI) y la anomalía DAYS_EMPLOYED = 365243" },
    { h: "Embudo y filtros duros", t: "Volumen y tasa de malos por capa; ¿qué filtro aporta?" },
    { h: "Score y curva de estrategia", t: "Deciles, corte por apetito y corte de máxima utilidad" },
    { h: "Capacidad de pago", t: "Tasa de malos por RCI y matriz score × RCI" },
    { h: "Excepciones", t: "Simulación de overrides y su efecto en la cartera" },
  ], notes: "Ejecutar en vivo los bloques 1-3; los bloques 4-5 pueden quedar como trabajo guiado. Ejercicios al final del notebook." });
  L.sTakeaways(D, { items: [
    "El crédito minorista es un ciclo: lo que se aprueba hoy define la cobranza, las provisiones y el precio de mañana.",
    "El apetito de riesgo solo es útil cuando se traduce en límites operativos: cortes, montos y % de excepciones.",
    "La curva de estrategia hace explícito el trade-off volumen-riesgo; la rentabilidad decide dónde pararse.",
    "Score (voluntad) y RCI (capacidad) son complementarios: la matriz de decisión los combina.",
    "Una excepción que no se mide no es una excepción: es una política paralela.",
  ], next: "indicadores de cartera, provisiones, capital, pricing y RAROC.", notes: "Cierre y preguntas." });
  await L.save(D, OUT);
})();
