const L = require("./lib");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M1 S3 - Segmentación, concentración y alertas tempranas", footer: "DataBank Academy · Módulo 1 · Sesión 3 · Segmentación, concentración, alertas tempranas y cobranza" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 1 · SESIÓN 3 DE 4", title: "Segmentación, concentración, alertas tempranas y cobranza",
    subtitle: "Gestionar la cartera viva: dónde crecer, qué vigilar y cómo cobrar", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Las sesiones 1 y 2 trataron la admisión y la medición. Hoy: la gestión de la cartera viva, desde la planificación del crecimiento hasta la curación." });
  L.sAgenda(D, { items: [
    { t: "Segmentación de clientes, productos y portafolios", d: "Homogeneidad, heterogeneidad y accionabilidad", min: 15 },
    { t: "Concentración, diversificación y crecimiento", d: "HHI, límites y planes de crecimiento evaluados por riesgo y capital", min: 20 },
    { t: "Alerta temprana y listas de vigilancia", d: "Anticipar la mora en clientes que hoy están al día", min: 20 },
    { t: "Cobranza, refinanciamiento, reestructuración y curación", d: "Estrategias con capacidad limitada y valor esperado", min: 20 },
    { t: "Laboratorio", d: "HHI, plan de crecimiento, SAT, priorización de cobranza y re-default", min: 40, lab: true },
  ] });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Segmentar para decidir", t: "Diseñar segmentos accionables y leer riesgo y participación en una misma matriz." },
    { h: "Medir concentración y planificar", t: "Calcular el HHI y evaluar un plan comercial por pérdida esperada y capital." },
    { h: "Anticipar el deterioro", t: "Construir un sistema de alerta temprana y una lista de vigilancia con reglas de entrada y salida." },
    { h: "Cobrar con valor esperado", t: "Priorizar la gestión con capacidad limitada y evaluar refinanciamientos con su re-default." },
  ] });

  L.sSection(D, { num: 1, title: "Segmentación de cartera", sub: "Segmentar para decidir distinto, no para hacer más reportes" });
  L.sCards(D, { title: "Tres ejes de segmentación", cols: 3, cards: [
    { h: "Producto", t: ["Revolvente vs. cuotas", "Con o sin garantía", "Plazo y ticket"] },
    { h: "Cliente", t: ["Nuevo vs. recurrente", "Dependiente vs. independiente", "Bancarizado vs. sin historia", "Nivel de riesgo (score)"] },
    { h: "Portafolio y canal", t: ["Agencia, digital, fuerza de ventas, retail aliado", "Región", "Campaña o convenio"] },
  ], notes: "La segmentación de modelos (un score por segmento) y la de gestión (estrategias distintas) no siempre coinciden." });
  L.sCompare(D, { title: "¿Cuándo una segmentación es buena?", left: { h: "Criterios estadísticos", icon: "✓", items: ["Homogeneidad interna: riesgo parecido dentro del segmento", "Heterogeneidad entre segmentos: tasas de malos claramente distintas", "Tamaño suficiente para estimar y monitorear", "Estabilidad en el tiempo"] },
    right: { h: "Criterios de negocio", icon: "$", items: ["Accionable: cada segmento tiene una estrategia distinta", "Entendible por comercial y cobranzas", "Implementable en el motor de decisión", "Alineada con la rentabilidad"] },
    verdict: "si dos segmentos reciben la misma política, el mismo precio y la misma cobranza, en la práctica son un solo segmento." });

  L.sSection(D, { num: 2, title: "Concentración, diversificación y crecimiento", sub: "La concentración minorista no está en los deudores, sino en las dimensiones" });
  L.sFormula(D, { title: "Medir la concentración: índice de Herfindahl-Hirschman", formula: "HHI = Σ w_k²        N equivalente = 1 / HHI", fsize: 34,
    where: [["w_k", "Participación del grupo k en el saldo (producto, región, canal, empleador)"], ["HHI", "De 1/K (perfectamente repartido) a 1 (todo en un grupo)"], ["1 / HHI", "Número de grupos de igual tamaño que darían la misma concentración"], ["Límite", "Máximo % por grupo o HHI máximo por dimensión"]],
    example: { h: "En el caso (junio 2026)", t: ["Producto: HHI 0,51 → 2 productos 'equivalentes' (hipotecario 69 %)", "Región: HHI 0,34 (Lima 52 %)", "Canal: HHI 0,31", "Los 10 mayores deudores: solo 2,5 % del saldo"] },
    notes: "Valores del notebook M01_S03, sección 2. La concentración individual es baja, pero la de producto y región es relevante: un shock inmobiliario o regional afectaría a gran parte del saldo." });
  L.sTable(D, { title: "Planificar el crecimiento: no todo crecimiento cuesta lo mismo", colW: [3.6, 1.6, 1.7, 1.7, 1.7, 1.83], rowH: 0.62,
    header: ["Plan", "Saldo (S/ MM)", "Crecimiento", "EL (S/ MM)", "Capital (S/ MM)", "EL / saldo"],
    rows: [["Actual", "305,8", "—", "4,39", "19,6", "1,44 %"],
      ["A: tarjeta +40 %", "312,0", "+2,0 %", { text: "4,78", options: { color: L.HEX.crimson, bold: true } }, "20,3", "1,53 %"],
      ["B: consumo y micro +25 %", "316,8", "+3,6 %", { text: "4,86", options: { color: L.HEX.crimson, bold: true } }, "20,7", "1,53 %"],
      ["C: hipotecario +20 %", "348,2", "+13,9 %", "4,61", { text: "22,0", options: { color: L.HEX.gold, bold: true } }, "1,32 %"]],
    note: "PD through-the-cycle, LGD y capital IRB por producto de la sesión 2. Fuente: notebook M01_S03, sección 3.",
    notes: "El plan A crece 2 % en saldo pero suma casi tanta pérdida esperada como el plan C, que crece 14 %. El plan C consume más capital. Un plan comercial debe aprobarse con su efecto en provisiones, capital y RAROC, no solo en volumen." });

  L.sSection(D, { num: 3, title: "Alerta temprana y listas de vigilancia", sub: "Actuar antes de que el cliente caiga en mora" });
  L.sFlow(D, { title: "Cómo se construye un sistema de alerta temprana (SAT)", steps: [
    { h: "Población", t: ["Clientes al día en el mes t"] },
    { h: "Evento", t: ["30+ días en los próximos 3 meses"] },
    { h: "Señales", t: ["Atrasos recientes, amortización, antigüedad, buró, macro"] },
    { h: "Modelo", t: ["Logística validada fuera de tiempo"] },
    { h: "Acción", t: ["Watchlist con reglas de entrada, acción y salida"] },
  ], note: "un SAT se evalúa por lo que permite hacer: captura de futuras moras en la lista, y efecto de las acciones frente a un grupo de control." });
  L.sChart(D, { title: "El SAT concentra las futuras moras en pocos clientes", chart: { type: "bar", labels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
      series: [{ name: "Captura acumulada de futuras moras", values: [0.498, 0.648, 0.776, 0.872, 0.920, 0.958, 0.966, 0.987, 0.996, 1.0] }],
      opts: { showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0%", valAxisLabelFormatCode: "0%", valAxisMinVal: 0, valAxisMaxVal: 1.1, chartColors: [L.HEX.navy], catAxisTitle: "Decil de score SAT (D1 = mayor riesgo)", showCatAxisTitle: true } },
    kpi: { v: "50 %", l: "de las futuras moras en el 10 % de clientes (lift 5x)" },
    points: ["AUC 0,82 en desarrollo y 0,82 fuera de tiempo: estable", "Tasa de evento base: 1,2 % mensual", "El decil 1 es la candidata natural a watchlist"],
    source: "Validación fuera de tiempo (jul-2025 a jun-2026). Notebook M01_S03, sección 4." });
  L.sCards(D, { title: "Reglas de una lista de vigilancia", cols: 3, cards: [
    { h: "Entrada", t: ["Score SAT sobre el umbral", "Alerta de buró (nuevas deudas, atraso en otra entidad)", "Sobreendeudamiento o caída de ingresos"] },
    { h: "Acción", t: ["Contacto preventivo", "Congelar incrementos de línea", "Oferta temprana de reestructuración", "Revisión en comité"] },
    { h: "Salida", t: ["3 meses sin alertas", "Regularización comprobada", "Medición del efecto frente a un grupo de control"] },
  ] });

  L.sSection(D, { num: 4, title: "Cobranza, refinanciamiento y curación", sub: "Capacidad limitada, valor esperado y re-default" });
  L.sChart(D, { title: "Priorizar la cobranza por valor esperado", chart: { type: "bar", labels: ["Aleatoria", "Menor p(cura)", "Mayor saldo", "Mayor valor esperado"],
      series: [{ name: "Saldo esperado salvado (S/ miles)", values: [54.3, 60.9, 163.4, 165.9] }],
      opts: { barDir: "bar", showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", chartColors: [L.HEX.green] } },
    points: ["Capacidad: llamar al 25 % de los clientes en 1-30 días", "Valor de gestionar = uplift × (1 − p(cura)) × saldo", "El uplift debe medirse con grupos de control, no suponerse"],
    source: "Score de cura con AUC 0,65; uplift supuesto de 30 %. Notebook M01_S03, sección 5." });
  L.sTable(D, { title: "Matriz de estrategias de cobranza temprana", colW: [2.8, 4.5, 4.83], rowH: 1.0, fsize: 16,
    header: ["", "Saldo bajo", "Saldo alto"],
    rows: [["p(cura) alta", { text: "Recordatorio digital: SMS, WhatsApp, app", options: { fill: { color: "D8F0E3" }, bold: false } }, { text: "Recordatorio digital + llamada", options: { fill: { color: "FFF4D6" }, bold: false } }],
      ["p(cura) baja", { text: "Call center: compromiso y fecha de pago", options: { fill: { color: "FFF4D6" }, bold: false } }, { text: "Gestor dedicado; evaluar refinanciamiento", options: { fill: { color: "FBD9DE" }, bold: false } }]],
    note: "La estrategia se asigna por segmento y se ajusta con experimentos (champion–challenger de cobranza)." });
  L.sCompare(D, { title: "Refinanciamiento vs. reestructuración", left: { h: "Refinanciamiento", icon: "R", items: ["Cambia plazo, cuota o tasa por dificultades de pago", "Herramienta de cobranza de uso frecuente", "Riesgo: ocultar mora sin recuperar capacidad de pago"] },
    right: { h: "Reestructuración", icon: "E", items: ["Cambio más profundo, a menudo en un proceso formal", "Puede incluir quitas o consolidación de deudas", "Tratamiento de clasificación y provisión específico de la SBS"] },
    verdict: "toda operación refinanciada o reestructurada debe marcarse en los sistemas y seguirse por su re-default." });
  L.sTable(D, { title: "Curación no es lo mismo que riesgo resuelto", colW: [3.2, 2.2, 3.0, 3.73], w: 12.13, rowH: 0.6,
    header: ["Producto", "Casos en 31-60", "Cura en 6 meses", "Re-default en 12 meses"],
    rows: [["Tarjeta", "875", "32,7 %", "14,9 %"], ["Consumo NR", "496", "31,9 %", "15,1 %"], ["Microempresa", "398", "26,4 %", { text: "55,6 %", options: { color: L.HEX.crimson, bold: true } }], ["Vehicular", "61", "37,7 %", "15,0 %"], ["Hipotecario", "31", "45,2 %", "0 %"]],
    note: "Microempresa: la mitad de los que curan vuelve a caer. Una cura que no se sostiene solo posterga la pérdida. Fuente: notebook M01_S03, sección 6." });
  L.sStats(D, { title: "¿Conviene refinanciar? Una cuenta de valor esperado", stats: [
    { v: "S/ 31", l: "recuperados por cada S/ 100 sin refinanciar (cura 12 %, LGD 78 %)", color: L.HEX.crimson },
    { v: "S/ 50", l: "con refinanciamiento (cura 45 %, costo 3 %, pérdida de margen 10 %)", color: L.HEX.green },
    { v: "18 %", l: "cura mínima para que el refinanciamiento convenga", color: L.HEX.gold },
  ], points: ["La decisión depende de la cura incremental, no de la cura total", "Gobierno: elegibilidad, análisis de capacidad, marca en sistemas, seguimiento por cosecha de refinanciamiento"] });
  L.sQuestion(D, { q: "Cobranzas propone refinanciar automáticamente a todos los clientes de microempresa en 61-90 días. ¿Lo aprobarías?",
    hint: "Usa el re-default de microempresa (56 %), el umbral de cura de equilibrio (18 %) y la capacidad operativa. ¿Qué condiciones pondrías?" });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M01_S03_Segmentacion_Concentracion_y_Alertas_Tempranas.ipynb", data: ["cartera_panel_mensual.csv.gz", "macro_peru_ilustrativa.csv"], steps: [
    { h: "Segmentación y concentración", t: "Matriz producto × segmento, HHI por dimensión" },
    { h: "Plan de crecimiento", t: "EL y capital de tres planes comerciales" },
    { h: "Alerta temprana", t: "SAT con variables de comportamiento, validación fuera de tiempo, watchlist" },
    { h: "Cobranza", t: "Score de cura y priorización con capacidad limitada" },
    { h: "Curación y refinanciamiento", t: "Cura, re-default y valor esperado" },
  ] });
  L.sTakeaways(D, { items: [
    "Una segmentación vale si cambia decisiones: política, precio, línea o cobranza.",
    "En minorista la concentración relevante es por producto, región, canal o convenio, y se controla con límites.",
    "Un plan comercial se evalúa por su pérdida esperada y su capital, no solo por el volumen.",
    "La alerta temprana y la watchlist permiten actuar antes de la mora; su valor se mide frente a un grupo de control.",
    "La cobranza se prioriza por valor esperado, y toda cura se juzga por su re-default.",
  ], next: "gobierno del riesgo, de datos y de modelos, tendencias y caso integrador." });
  await L.save(D, OUT);
})();
