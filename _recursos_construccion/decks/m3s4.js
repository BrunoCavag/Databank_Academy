const L = require("./lib");
const OUT = process.argv[2];

(async () => {
  const D = L.newDeck({ title: "M3 S4 - Scorecard, calibración y decisiones", footer: "DataBank Academy · Módulo 3 · Sesión 4 · Scorecard, discriminación, calibración y decisiones" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 3 · SESIÓN 4 DE 4", title: "Construcción del scorecard, discriminación, calibración y decisiones",
    subtitle: "Del modelo logístico a una herramienta de decisión crediticia", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027" });
  L.sAgenda(D, { items: [
    { t: "Del modelo al scorecard", d: "Escalamiento por PDO, a mano y con optbinning", min: 25 },
    { t: "Discriminación", d: "AUC, Gini, KS y curva CAP en desarrollo y fuera de tiempo", min: 15 },
    { t: "Calibración y recalibración", d: "Global, por bandas; intercepto, Platt e isotónica", min: 20 },
    { t: "Puntos de corte y decisiones", d: "Matrices de confusión, utilidad, bandas, razones de rechazo, monitoreo", min: 20 },
    { t: "Laboratorio", d: "Scorecard completo del caso conductor", min: 40, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "Del modelo al scorecard", sub: "Puntos para duplicar los odds" });
  L.sFormula(D, { title: "Escalamiento por PDO", formula: "Score = Offset + Factor · ln(odds)     Factor = PDO / ln 2     Offset = S₀ − Factor · ln(odds₀)", fsize: 22,
    where: [["odds", "Odds buenos:malos = e^−(α + Σ βⱼ WoEⱼ)"], ["S₀, odds₀", "Punto de anclaje: 600 puntos ↔ 50:1"], ["PDO", "Puntos para duplicar los odds: 20"], ["Puntosᵢⱼ", "−(βⱼ · WoEᵢⱼ + α/k) · Factor + Offset/k"]],
    example: { h: "En el caso", t: ["Factor = 20 / ln 2 = 28,85", "Offset = 600 − 28,85 · ln 50 = 487,1", "EXT_SOURCE_2: de 18 puntos (< 0,27) a 80 puntos (≥ 0,82)", "La suma de puntos reproduce la fórmula (diferencia 10⁻¹³)"] },
    notes: "La escala no cambia el ordenamiento ni el AUC: es una convención para comunicar. Lo importante es fijarla y documentarla." });
  L.sTable(D, { title: "Tabla de puntos: la RCI en el scorecard", colW: [2.6, 1.8, 2.0, 1.8, 1.8, 2.13], rowH: 0.52, fsize: 14,
    header: ["Tramo de RCI", "Clientes", "Tasa de malos", "WoE", "Coeficiente", "Puntos"],
    rows: [["< 0,08", "2 511", "6,6 %", "+0,30", "−0,87", "53,9"], ["0,08 – 0,13", "6 001", "7,0 %", "+0,24", "−0,87", "52,5"], ["0,13 – 0,25", "12 692", "7,4 %", "+0,18", "−0,87", "51,0"], ["0,25 – 0,49", "13 582", "8,1 %", "+0,07", "−0,87", "48,3"],
      ["0,49 – 0,60", "2 906", "9,8 %", "−0,14", "−0,87", "43,0"], ["0,60 – 0,76", "2 701", "10,6 %", "−0,22", "−0,87", "41,1"], ["0,76 – 1,01", "2 262", "12,3 %", "−0,39", "−0,87", "36,8"], ["≥ 1,01", "2 437", "18,3 %", "−0,86", "−0,87", { text: "24,9", options: { bold: true, color: L.HEX.crimson } }]],
    note: "optbinning.Scorecard con reverse_scorecard=False (más puntos = menos riesgo). El score manual y el de optbinning coinciden (correlación 1,000000).",
    notes: "Los coeficientes no son −1 porque hay correlación entre variables: la regresión reduce el peso de cada una para no contar dos veces la evidencia." });

  L.sSection(D, { num: 2, title: "Discriminación", sub: "¿El score ordena bien a buenos y malos?" });
  L.sStats(D, { title: "Discriminación en desarrollo y fuera de tiempo", stats: [
    { v: "0,786", l: "AUC desarrollo (2022-2024)", color: L.HEX.navy },
    { v: "0,772", l: "AUC fuera de tiempo (2025)", color: L.HEX.green },
    { v: "0,54", l: "Gini fuera de tiempo", color: L.HEX.green },
    { v: "0,41", l: "KS fuera de tiempo", color: L.HEX.gold },
  ], points: ["Caída de 1,4 pp de AUC fuera de tiempo: dentro de lo esperable; sin señales de sobreajuste", "Gini > 0,5 en originación minorista es un buen resultado", "La curva CAP muestra qué % de malos se captura al rechazar el X % de menor score"] });

  L.sSection(D, { num: 3, title: "Calibración y recalibración", sub: "Un buen orden no garantiza una buena PD" });
  L.sTable(D, { title: "El scorecard ordena bien, pero 2025 es más benigno", colW: [3.2, 1.6, 1.8, 1.4, 1.4, 1.5, 1.23], rowH: 0.62,
    header: ["Método (evaluado en 2S-2025)", "PD media", "Tasa observada", "Brier", "Log-loss", "Hosmer-L.", "AUC"],
    rows: [[{ text: "Original (desarrollo)", options: { bold: true } }, { text: "7,85 %", options: { color: L.HEX.crimson, bold: true } }, "5,91 %", "0,0514", "0,1957", "54,2", "0,782"],
      ["Recalibración de intercepto", "5,61 %", "5,91 %", "0,0507", "0,1926", "18,7", "0,782"], ["Platt", "5,64 %", "5,91 %", "0,0508", "0,1928", "19,0", "0,782"], ["Isotónica", "5,60 %", "5,91 %", "0,0511", "0,1944", "15,8", "0,778"]],
    note: "Recalibración con el 1S-2025 y evaluación en el 2S-2025. Fuente: notebook M03_S04, sección 3.",
    notes: "La recalibración corrige el nivel sin cambiar el orden. La de intercepto es la más usada porque preserva la estructura aprobada del scorecard." });
  L.sCompare(D, { title: "¿Hacia qué nivel recalibrar?", left: { h: "Point-in-time (PIT)", icon: "P", items: ["La PD refleja el entorno actual", "Uso: provisiones NIIF 9, pricing de corto plazo", "Recalibrar a la tasa reciente y a escenarios prospectivos (Módulo 9)"] },
    right: { h: "Through-the-cycle (TTC)", icon: "T", items: ["La PD refleja el promedio del ciclo", "Uso: capital, apetito, límites", "Recalibrar a la tendencia central de largo plazo"] },
    verdict: "un mismo scorecard puede tener calibraciones distintas según su uso; documenta cuál se aplica en cada decisión." });

  L.sSection(D, { num: 4, title: "Puntos de corte y decisiones", sub: "Del score a la política" });
  L.sTable(D, { title: "Cada corte, una matriz de confusión distinta", colW: [1.5, 1.5, 1.9, 2.0, 1.7], rowH: 0.62, fsize: 13,
    header: ["Corte", "Aprobación", "Tasa de malos aprobados", "Malos rechazados (recall)", "Buenos rechazados"],
    rows: [["517", "94,9 %", "4,66 %", "24,4 %", "3,9 %"], [{ text: "537 (óptimo)", options: { bold: true, color: L.HEX.green } }, "85,7 %", "3,58 %", "47,7 %", "12,2 %"], ["557", "67,9 %", "2,67 %", "69,1 %", "29,8 %"]],
    side: ["Corte por utilidad: margen de los buenos aprobados menos pérdida de los malos aprobados", "Margen 8,25 % y pérdida 60 % del monto (Módulo 1)", "En el corte óptimo: 12 316 buenos y 457 malos aprobados; 1 719 buenos y 416 malos rechazados"], w: 8.6 });
  L.sTable(D, { title: "Bandas de riesgo: del score a la política", colW: [3.4, 1.4, 1.6, 1.9, 1.6, 2.23], rowH: 0.62,
    header: ["Banda (2025)", "Clientes", "% clientes", "Tasa de malos", "PD recalibrada", "EL (LGD 75 %)"],
    rows: [[{ text: "A: aprobar + preaprobado", options: { color: L.HEX.green, bold: true } }, "6 742", "45,2 %", "1,66 %", "1,39 %", "1,04 %"], ["B: aprobar", "3 383", "22,7 %", "4,67 %", "4,11 %", "3,08 %"],
      ["C: aprobar con monto reducido", "2 648", "17,8 %", "7,06 %", "7,73 %", "5,80 %"], ["D: revisión", "1 378", "9,2 %", "14,73 %", "14,21 %", "10,66 %"], [{ text: "E: rechazo", options: { color: L.HEX.crimson, bold: true } }, "757", "5,1 %", "28,14 %", "28,79 %", "21,59 %"]],
    note: "Cada banda tiene una acción, un precio (Módulo 10) y un tratamiento de cobranza (Módulo 11). Fuente: notebook M03_S04, sección 5." });
  L.sTable(D, { title: "Tabla de odds: el idioma común entre riesgo y negocio", colW: [2.4, 2.8, 2.4, 4.53], rowH: 0.52, fsize: 14,
    header: ["Score", "Odds buenos:malos", "PD implícita", "Lectura"],
    rows: [["500", "1,6 : 1", "39 %", "Riesgo muy alto"], ["540", "6,3 : 1", "14 %", "Zona de revisión"], ["560", "12,5 : 1", "7,4 %", "Cerca del promedio de la cartera"], ["600", "50 : 1", "2,0 %", "Punto de anclaje"], ["640", "200 : 1", "0,5 %", "Riesgo muy bajo"], ["680", "800 : 1", "0,1 %", "Preaprobados"]],
    note: "Cada 20 puntos se duplican los odds (PDO = 20). Las PD implícitas son las de la escala de desarrollo; antes de usarlas en provisiones, recalibrar." });
  L.sCards(D, { title: "Razones de rechazo y monitoreo", cols: 2, cards: [
    { h: "Razones de rechazo (reason codes)", t: ["Para cada rechazado: variables donde perdió más puntos frente al máximo", "Ejemplo (score 446): EXT_SOURCE_2 −48, agencia −48, EXT_SOURCE_3 −42", "Base de la comunicación al cliente y de la revisión humana"] },
    { h: "Monitoreo con ScorecardMonitoring", t: ["PSI del score 2025 vs. desarrollo: 0,007 (estable)", "PSI por variable: todas < 0,02", "Tasa de malos por tramo: menor en 2025 en todos los tramos → recalibrar, no redesarrollar"] },
  ] });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M03_S04_Scorecard_Calibracion_y_Decisiones.ipynb", data: ["hc_application_sintetico.csv", "12 variables, BinningProcess de optbinning"], steps: [
    { h: "Scorecard a mano y con optbinning", t: "PDO, offset, factor, tabla de puntos; verificación" },
    { h: "Discriminación", t: "AUC, Gini, KS, ROC y CAP" },
    { h: "Calibración", t: "Intercepto, Platt e isotónica; Brier, log-loss, Hosmer-Lemeshow" },
    { h: "Puntos de corte", t: "Curva de utilidad y matrices de confusión" },
    { h: "Decisiones", t: "Bandas, tabla de odds, razones de rechazo y monitoreo" },
  ] });
  L.sTakeaways(D, { title: "Cierre del Módulo 3", items: [
    "La logística sobre WoE se convierte en scorecard con una escala PDO: transparente, auditable y comunicable.",
    "Discriminación (AUC, Gini, KS) y calibración (nivel de la PD) se evalúan por separado, en desarrollo y fuera de tiempo.",
    "Recalibrar corrige el nivel sin tocar el orden; el nivel objetivo (PIT o TTC) depende del uso.",
    "El corte se elige por economía, y cada banda de score se traduce en una acción, un precio y una razón.",
  ], next: "Módulo 4 · Árboles, ensembles, gradient boosting y XGBoost." });
  await L.save(D, OUT);
})();
