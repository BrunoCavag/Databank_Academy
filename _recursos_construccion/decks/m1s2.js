const L = require("./lib");
const J = require("../chart_data.json");
const OUT = process.argv[2];
const pct = (v, d = 1) => `${(v * 100).toFixed(d).replace(".", ",")} %`;

(async () => {
  const D = L.newDeck({ title: "M1 S2 - Calidad de cartera, provisiones y rentabilidad", footer: "DataBank Academy · Módulo 1 · Sesión 2 · Calidad de cartera, pérdidas, provisiones y rentabilidad" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 1 · SESIÓN 2 DE 3", title: "Calidad de cartera, pérdidas, provisiones y rentabilidad",
    subtitle: "Medir bien antes de modelar: los indicadores que mira un comité de riesgos", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Recapitular la sesión 1 en un minuto: ciclo, apetito, curva de estrategia. Hoy medimos el resultado de esas decisiones en la cartera." });
  L.sAgenda(D, { items: [
    { t: "Indicadores de calidad de cartera", d: "Stock, flujo, adelantados y rentabilidad", min: 20 },
    { t: "Las trampas de la mora contable", d: "Efecto denominador, castigos, mora ajustada y rezagada", min: 15 },
    { t: "Provisiones y costo de riesgo", d: "Categorías SBS, cobertura y el puente hacia IFRS 9", min: 20 },
    { t: "Cosechas y roll rates", d: "Indicadores adelantados y dinámica de la morosidad", min: 20 },
    { t: "P&L de riesgo por producto", d: "Margen, pérdida y contribución", min: 10 },
    { t: "Laboratorio", d: "Indicadores desde un panel crédito-mes de 16 mil créditos", min: 35, lab: true },
  ] });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Calcular los indicadores SBS", t: "Cartera atrasada, mora por tramos, cartera pesada, castigos y cobertura desde datos crédito-mes." },
    { h: "Leer la mora con sentido crítico", t: "Separar el riesgo real del efecto del crecimiento y de los castigos." },
    { h: "Conectar riesgo y contabilidad", t: "Calcular provisiones por categoría SBS y el costo de riesgo." },
    { h: "Anticipar el deterioro", t: "Usar cosechas y roll rates como señales adelantadas, y evaluar la rentabilidad por producto." },
  ] });

  L.sSection(D, { num: 1, title: "Indicadores de calidad de cartera", sub: "Qué medimos, cómo se calcula y qué esconde cada indicador" });
  L.sTable(D, { title: "El diccionario mínimo del comité de riesgos", colW: [3.2, 5.8, 3.13], rowH: 0.56,
    header: ["Indicador", "Definición (simplificada)", "Tipo"],
    rows: [
      ["Cartera atrasada (mora)", "Créditos vencidos y en cobranza judicial ÷ colocaciones directas", "Stock"],
      ["Cartera de alto riesgo", "Atrasada + refinanciada + reestructurada ÷ colocaciones", "Stock"],
      ["Cartera pesada", "Deudores en Deficiente, Dudoso y Pérdida ÷ colocaciones", "Stock"],
      ["Mora 30+ / 60+ / 90+", "Saldo con más de 30, 60 o 90 días de atraso ÷ colocaciones", "Stock"],
      ["Castigos", "Saldo retirado del balance por irrecuperable (totalmente provisionado)", "Flujo"],
      ["Cobertura", "Provisiones ÷ cartera atrasada (o de alto riesgo)", "Stock"],
      ["Costo de riesgo", "Gasto de provisiones neto anualizado ÷ colocaciones promedio", "Flujo"],
      ["Cosechas (30@3, 60@6)", "% de una originación que alcanzó el atraso X al mes Y", "Adelantado"],
    ], note: "En el laboratorio aproximamos la cartera atrasada de consumo como el saldo con más de 30 días de atraso.",
    notes: "Las definiciones contables exactas de la SBS dependen del tipo de crédito (por ejemplo, para consumo e hipotecario se considera vencida la cuota a partir de los 30 días, y el total del crédito a partir de los 90). Para el curso usamos versiones simplificadas y consistentes." });
  L.sCards(D, { title: "Cuatro familias de indicadores, cuatro preguntas", cols: 2, cards: [
    { h: "Stock", t: "¿Cómo está la cartera hoy? Mora, cartera pesada, cobertura. Fácil de comunicar, pero rezagado y manipulable por castigos y crecimiento." },
    { h: "Flujo", t: "¿Cuánto perdimos en el período? Castigos, gasto de provisiones, costo de riesgo. Se conecta directo con el P&L." },
    { h: "Adelantados", t: "¿Cómo se comportan las originaciones recientes? Cosechas, FPD, roll rates, entradas a mora." },
    { h: "Rentabilidad", t: "¿El precio paga el riesgo? Margen ajustado por pérdida, contribución y RAROC (Módulo 8)." },
  ], notes: "Un buen tablero combina las cuatro familias. Mostrar sólo stock es la causa más frecuente de sorpresas." });

  L.sSection(D, { num: 2, title: "Las trampas de la mora contable", sub: "Crecimiento y castigos pueden maquillar el riesgo" });
  const mo = J.m1s2_mora;
  L.sChart(D, { title: "El mismo riesgo, dos lecturas muy distintas", chart: { type: "line", labels: mo.labels,
      series: [{ name: "Mora contable (> 30 días)", values: mo.mora }, { name: "Mora ajustada por castigos 12m", values: mo.ajustada }],
      opts: { showLegend: true, valAxisLabelFormatCode: "0%", lineSize: 3, lineDataSymbol: "none", chartColors: [L.HEX.navy, L.HEX.crimson] } },
    points: ["La mora ajustada devuelve al numerador lo castigado en los últimos 12 meses", "En el pico de estrés (2023-24) la ajustada duplica a la contable", "Sin castigos, la mora 'mejora' más lento de lo que parece"],
    source: "Fuente: cartera_panel_mensual.csv.gz (sintético). Consumo: tarjeta + no revolvente. Notebook M01_S02.",
    notes: "Explicar la mecánica: un crédito llega a 180+ días, se castiga y sale del numerador y del denominador. La mora contable baja aunque la pérdida ya ocurrió." });
  L.sCompare(D, { title: "Dos efectos que distorsionan la mora", left: { h: "Efecto denominador", icon: "÷", items: ["La cartera crece con créditos nuevos que aún no maduran", "El numerador (atrasos) reacciona con 6-12 meses de rezago", "Resultado: la mora baja justo cuando se está originando más riesgo", "Corrección: mora rezagada y cosechas"] },
    right: { h: "Efecto castigos", icon: "−", items: ["Los créditos irrecuperables salen del balance", "La mora baja sin que mejore la cobranza", "Políticas de castigo distintas hacen incomparables a las entidades", "Corrección: mora ajustada por castigos"] },
    verdict: "nunca evalúes la calidad de cartera solo con la mora contable; acompáñala siempre de la ajustada, la rezagada y las cosechas." });
  L.sFormula(D, { title: "Dos correcciones simples", formula: "Mora ajustada = (Atr_t + Cast_12m) / (Col_t + Cast_12m)\nMora rezagada = Atr_t / Col_(t−12)", fsize: 24,
    where: [["Atr_t", "Cartera atrasada en el mes t"], ["Col_t", "Colocaciones (saldo en balance) en el mes t"], ["Cast_12m", "Castigos acumulados de los últimos 12 meses"], ["Col_(t−12)", "Colocaciones de hace 12 meses: la cartera que pudo madurar"]],
    example: { h: "Ejemplo numérico", t: ["Atrasada: 40 MM; colocaciones: 1 000 MM", "Castigos 12m: 45 MM; colocaciones de hace 12 m: 800 MM", "Contable: 4,0 %", "Ajustada: 85 / 1 045 = 8,1 %", "Rezagada: 40 / 800 = 5,0 %"] },
    notes: "La mora rezagada asume un tiempo de maduración promedio; en tarjeta 6-12 meses, en hipotecario mucho más." });
  L.sQuestion(D, { q: "Tu mora contable se mantiene estable en 4 %, pero la ajustada pasó de 8 % a 11 % en un año. ¿Qué está pasando y qué le dirías al gerente comercial?",
    hint: "Piensa en el volumen de castigos, la velocidad de deterioro (roll rates hacia 180+) y el crecimiento de la cartera.",
    notes: "Respuesta esperada: la pérdida aumentó, pero se está castigando más rápido (o la cartera crece). El deterioro es real y debe verse en el costo de riesgo." });

  L.sSection(D, { num: 3, title: "Provisiones y costo de riesgo", sub: "De la calificación del deudor al gasto en el estado de resultados" });
  L.sTable(D, { title: "Categorías de riesgo del deudor minorista (consumo)", colW: [4.0, 3.0, 3.0], w: 10.0, rowH: 0.6,
    header: ["Categoría", "Días de atraso", "Provisión mínima*"],
    rows: [["0 · Normal", "0 – 8", "1 % (genérica)"], ["1 · Con Problemas Potenciales (CPP)", "9 – 30", "5 %"], ["2 · Deficiente", "31 – 60", "25 %"], ["3 · Dudoso", "61 – 120", "60 %"], ["4 · Pérdida", "> 120", "100 %"]].map((r, i) => r.map((c, j) => j === 2 ? { text: c, options: { bold: true, color: ["2E8B57", "2E8B57", "E0A100", "C8102E", "C8102E"][i] } } : c)),
    note: "*Res. SBS N.° 11356-2008, créditos de consumo sin garantías preferidas. Referencia didáctica: verificar siempre la norma vigente, el componente procíclico y el tratamiento de garantías.",
    notes: "La provisión de la categoría Normal es genérica: incluye una tasa fija y un componente procíclico que la SBS activa o desactiva según el ciclo. Las demás son específicas. Las garantías preferidas reducen las tasas." });
  L.sCards(D, { title: "Cómo se lee la foto de provisiones", cols: 3, cards: [
    { h: "Distribución por categoría", t: "En el caso, 97 % del saldo de consumo está en Normal; el 3 % restante concentra la mayor parte de la provisión." },
    { h: "Provisión / colocaciones", t: "Aproximadamente 1,9 % en el corte de junio de 2026: es el colchón contable frente a la pérdida." },
    { h: "Cobertura", t: "Provisiones / cartera atrasada ≈ 100 %. Una cobertura que cae es señal de que el deterioro supera la provisión." },
  ], notes: "Valores del notebook M01_S02 (sección 3)." });
  L.sFormula(D, { title: "Costo de riesgo: el puente con el P&L", formula: "Costo de riesgo = (ΔProvisiones + Castigos − Recuperos) / Colocaciones promedio",  fsize: 24,
    where: [["ΔProvisiones", "Variación del stock de provisiones en el período"], ["Castigos", "Saldo retirado del balance (ya provisionado al 100 %)"], ["Recuperos", "Cobros sobre cartera castigada"], ["Colocaciones prom.", "Saldo promedio del período (anualizar si es mensual)"]],
    example: { h: "Por qué importa", t: ["Es el gasto que golpea la utilidad", "Es comparable con la tasa y el margen", "Es la versión contable de la pérdida esperada", "En el caso pasó de ~15 % (2023) a < 5 % (2025)"] },
    notes: "En la práctica, el costo de riesgo se compara con el spread del producto: si el spread es 20 % y el costo de riesgo 15 %, queda muy poco para cubrir costos y capital." });
  L.sCompare(D, { title: "Provisiones SBS vs. pérdida esperada IFRS 9", left: { h: "Regulatoria SBS", icon: "S", items: ["Basada en categorías por días de atraso", "Tasas mínimas fijas por categoría y tipo de crédito", "Enfoque de pérdida incurrida + componente procíclico", "Simple, comparable y auditable"] },
    right: { h: "IFRS 9 (ECL)", icon: "E", items: ["ECL = Σ PD × LGD × EAD × descuento", "Stage 1: 12 meses; Stages 2 y 3: vida del crédito", "Prospectiva: escenarios macroeconómicos ponderados", "Requiere modelos de PD, LGD y EAD (Módulo 7)"] },
    verdict: "hoy medimos lo que ya pasó; en el Módulo 7 mediremos lo que esperamos que pase, con escenarios y staging." });

  L.sSection(D, { num: 4, title: "Cosechas y roll rates", sub: "Indicadores adelantados: ver el deterioro antes que la mora" });
  L.sFlow(D, { title: "Cómo se construye un análisis de cosechas", steps: [
    { h: "Agrupar", t: ["Créditos desembolsados en el mismo mes o trimestre"] },
    { h: "Alinear", t: ["Medir por meses en libros (MOB), no por fecha calendario"] },
    { h: "Definir el evento", t: ["Ever 30+, ever 60+, castigo", "En monto o en número"] },
    { h: "Acumular", t: ["% de la cosecha que alcanzó el evento hasta el MOB k"] },
    { h: "Comparar", t: ["Cosechas a igual madurez", "Detectar quiebres de política o de ciclo"] },
  ], note: "las cosechas eliminan el efecto denominador: cada curva compara créditos con la misma antigüedad.", size: 15 });
  const v = J.m1s2_vintage; const names = Object.keys(v.series);
  L.sChart(D, { title: "Las cosechas de 2022-23 se deterioraron más rápido y más alto", chart: { type: "line", labels: v.labels,
      series: names.map(n => ({ name: n.replace("Q", " T"), values: v.series[n] })),
      opts: { showLegend: true, legendPos: "r", valAxisLabelFormatCode: "0%", lineSize: 2.5, lineDataSymbol: "none", catAxisTitle: "Meses en libros (MOB)", showCatAxisTitle: true, valAxisTitle: "% del monto ever 60+ o castigo", showValAxisTitle: true,
        chartColors: [L.HEX.crimson, "E4572E", L.HEX.gold, L.HEX.slate, L.HEX.teal, L.HEX.navy], displayBlanksAs: "gap" } },
    points: ["Originaciones en inflación y tasas altas: 15-20 % ever 60+ a MOB 12", "Cosechas 2024-25: 3-5 % a igual madurez", "El quiebre se ve en MOB 3-6, mucho antes que en la mora contable"],
    source: "Fuente: cartera_panel_mensual.csv.gz (sintético). Consumo. Notebook M01_S02, sección 4.",
    notes: "Señalar que una cosecha joven ya muestra su pendiente en los primeros meses: por eso se usan indicadores como 30@3 o 60@6 para monitorear la originación." });
  const rr = J.m1s2_roll;
  const heat = (v2, j) => j === 0 ? (v2 >= 0.3 ? "BFE3CF" : v2 >= 0.05 ? "DFF1E7" : "FFFFFF") : (v2 >= 0.5 ? "F4B6BE" : v2 >= 0.2 ? "FBD9DE" : v2 >= 0.05 ? "FDF0F2" : "FFFFFF");
  L.sTable(D, { title: "Matriz de transición mensual (roll rates)", colW: [1.4, ...Array(7).fill(1.17)], w: 9.6, rowH: 0.55, fsize: 14,
    header: ["De \\ a", ...rr.cols],
    rows: rr.rows.map((r, i) => [r, ...rr.values[i].map((x, j) => ({ text: x > 0 ? pct(x) : "–", options: { fill: { color: heat(x, j) }, align: "center", bold: false } }))]),
    side: ["Verde (columna 0): cura", "Rojo a la derecha de la diagonal: roll forward", "Diagonal: se mantiene en el tramo", "En tramos tardíos casi todo avanza a castigo"],
    note: "Ventana jul-2025 a jun-2026, consumo, en número de créditos. Fuente: notebook M01_S02, sección 5.",
    notes: "La matriz es una cadena de Markov: multiplicando las tasas forward se obtiene la probabilidad de que un crédito al día termine castigado. Es la intuición detrás de las matrices de transición del Módulo 7." });
  const r = rr.values; const fwd = [r[0][1], r[1][2], r[2][3], r[3][4], r[4][5], r[5][6]];
  const acum = fwd.reduce((a, b) => a * b, 1);
  L.sStats(D, { title: "Lo que dicen las roll rates", stats: [
    { v: pct(r[0][1]), l: "de los créditos al día entra a mora 1-30 cada mes", color: L.HEX.navy },
    { v: pct(r[1][0], 0), l: "de los que están en 1-30 se cura al mes siguiente", color: L.HEX.green },
    { v: pct(r[2][3], 0), l: "de 31-60 rueda a 61-90: allí la cobranza ya llega tarde" },
    { v: pct(fwd.slice(1).reduce((a, b) => a * b, 1), 0), l: "de lo que entra a 1-30 termina castigado si nada cambia", color: L.HEX.gold },
  ], points: ["La cobranza temprana (1-30) es la palanca más barata: cada punto de cura evita una cadena de roll forwards", "Prob. de que un crédito al día termine castigado ≈ " + pct(acum, 2) + " mensual: dato base para la PD de vida (Módulo 7)"] });

  L.sSection(D, { num: 5, title: "El P&L de riesgo por producto", sub: "¿El precio paga la pérdida?" });
  const pl = J.m1s2_pl;
  L.sChart(D, { title: "Más mora no significa menos rentabilidad", chart: { type: "bar", labels: pl.labels.map(x => x.replace("Consumo no revolvente", "Consumo NR").replace("Tarjeta de crédito", "Tarjeta")),
      series: [{ name: "Ingreso por intereses", values: pl.ingreso }, { name: "Fondeo", values: pl.fondeo.map(x => -x) }, { name: "Costo operativo", values: pl.opex.map(x => -x) }, { name: "Pérdida neta", values: pl.perdida.map(x => -x) }, { name: "Contribución", values: pl.contrib }],
      opts: { barGrouping: "clustered", showLegend: true, valAxisLabelFormatCode: "0%", chartColors: [L.HEX.navy, L.HEX.slate, L.HEX.gold, L.HEX.crimson, L.HEX.green], valAxisTitle: "% del saldo promedio (12 meses)", showValAxisTitle: true } },
    points: [`Tarjeta: la mayor pérdida (${pct(pl.perdida[0])}) y la mayor contribución (${pct(pl.contrib[0])})`, `Hipotecario: pérdida mínima, pero contribución de ${pct(pl.contrib[4])} sobre el saldo`, "La pregunta correcta: ¿el margen paga la pérdida, el costo y el capital?"],
    source: "Supuestos: fondeo 5,5 %; costo operativo por producto entre 1,2 % y 9 %. Notebook M01_S02, sección 6.",
    notes: "El hipotecario parece poco rentable por saldo, pero consume poco capital y fideliza. Esto anticipa RAROC (Módulo 8): la rentabilidad debe medirse contra el capital, no sólo contra el saldo." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M01_S02_Calidad_de_Cartera_Provisiones_y_Rentabilidad.ipynb", data: ["cartera_panel_mensual.csv.gz", "16 000 créditos · panel mensual", "2022-01 a 2026-09", "sbs_categorias_provisiones_consumo.csv", "macro_peru_ilustrativa.csv"], steps: [
    { h: "El panel crédito-mes", t: "La vida de un crédito: atraso, castigo y recuperos" },
    { h: "Indicadores y sus trampas", t: "Mora contable, ajustada y rezagada; relación con el ciclo macro" },
    { h: "Provisiones SBS", t: "Categorías, cobertura y costo de riesgo" },
    { h: "Cosechas y roll rates", t: "Curvas ever 60+, triángulo por MOB y matriz de transición" },
    { h: "P&L por producto", t: "Margen, pérdida neta y contribución" },
  ] });
  L.sTakeaways(D, { items: [
    "La mora contable es un indicador rezagado y manipulable: compleméntala con la ajustada, la rezagada y las cosechas.",
    "El costo de riesgo conecta la calidad de cartera con el P&L y se compara directamente con el margen.",
    "Las provisiones SBS miden lo incurrido por categoría; IFRS 9 exigirá medir lo esperado.",
    "Cosechas y roll rates muestran el deterioro meses antes que la mora.",
    "La rentabilidad por producto, no la mora, decide dónde crecer.",
  ], next: "organización, segmentación, indicadores del ciclo y gobierno del riesgo." });
  await L.save(D, OUT);
})();
