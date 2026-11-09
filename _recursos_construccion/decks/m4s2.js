const L = require("./lib");
const OUT = process.argv[2];
const IMG = "/home/claude/curso/img/m4s2/";

(async () => {
  const D = L.newDeck({ title: "M4 S2 - Ensembles: bootstrap, bagging y random forest", footer: "DataBank Academy · Módulo 4 · Sesión 2 · Ensemble learning: bootstrap, bagging y random forest" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 4 · SESIÓN 2 DE 4", title: "Ensemble learning: bootstrap, bagging y random forest",
    subtitle: "Cómo convertir muchos árboles inestables en un modelo de PD estable", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Referencias: Efron (1979) para el bootstrap; Breiman (1996) Bagging predictors; Breiman (2001) Random forests; Freund y Schapire (1997) para AdaBoost." });
  L.sAgenda(D, { items: [
    { t: "Sesgo, varianza y la inestabilidad del árbol", d: "Por qué un árbol profundo es un buen candidato para promediar", min: 15 },
    { t: "Bootstrap", d: "Remuestreo con reemplazo, 63,2 % y muestras fuera de bolsa (OOB)", min: 15 },
    { t: "Bagging", d: "Promediar árboles; la fórmula de varianza ρσ² + (1−ρ)σ²/B", min: 20 },
    { t: "Random forest e importancia de variables", d: "Decorrelacionar con max_features; MDI vs. permutación", min: 20 },
    { t: "Puente hacia el boosting", d: "AdaBoost: de promediar en paralelo a corregir en secuencia", min: 10 },
    { t: "Laboratorio", d: "Bootstrap, bagging desde cero, random forest y comparación", min: 40, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "Sesgo, varianza e inestabilidad", sub: "El problema que resuelven los ensembles" });
  L.sFormula(D, { title: "Descomposición del error de predicción", formula: "E[(Y − f̂(x))²] = σ²_ε + [Sesgo f̂(x)]² + Var f̂(x)", fsize: 28,
    where: [["σ²_ε", "Ruido irreducible: nadie predice el default individual con certeza"], ["Sesgo", "Error por un modelo demasiado simple (árbol de 2 niveles)"], ["Varianza", "Sensibilidad a la muestra (árbol profundo)"], ["Idea", "Promediar modelos de bajo sesgo y alta varianza reduce la varianza sin aumentar el sesgo"]],
    example: { h: "En el notebook: varianza de la PD entre 30 muestras", t: ["Profundidad 2: varianza 0,0006", "Profundidad 6: 0,0026", "Profundidad 10: 0,0076", "Sin límite: 0,0114 (desv. 9,4 pp)", "El árbol profundo es casi insesgado pero muy variable"] } });
  L.sCards(D, { title: "¿Dónde está la inestabilidad del árbol?", cols: 3, cards: [
    { h: "La raíz es estable", t: ["20 árboles con 3 000 clientes distintos cada uno", "Los 20 eligen EXT2 en la raíz", "Una variable dominante fija el primer corte"] },
    { h: "El umbral no", t: ["El corte de la raíz varía entre 0,30 y 0,60", "La PD de un cliente cerca del corte salta de segmento"] },
    { h: "El segundo nivel menos", t: ["Hijo izquierdo: EXT2 7, EXT3 6, EDAD 3, RCI 2, otras 2", "Los segmentos finales cambian de muestra a muestra"] },
  ], notes: "Esta es la evidencia empírica de la alta varianza: la estructura profunda del árbol depende de la muestra." });

  L.sSection(D, { num: 2, title: "Bootstrap", sub: "Simular nuevas muestras a partir de la que tenemos" });
  L.sFormula(D, { title: "Bootstrap (Efron, 1979): remuestrear con reemplazo", formula: "P(caso i no elegido) = (1 − 1/n)ⁿ → e⁻¹ ≈ 0,368", fsize: 30,
    where: [["Muestra bootstrap", "n extracciones con reemplazo de los n casos de desarrollo"], ["63,2 %", "Fracción esperada de casos distintos en cada muestra"], ["OOB", "El 36,8 % no elegido: una validación gratuita para cada árbol"], ["Usos en riesgo", "Intervalos de AUC, de PD por banda, estabilidad de variables (Módulo 2-3)"]],
    example: { h: "Verificación", t: ["Fracción distinta simulada: 0,6320", "Teoría: 1 − e⁻¹ = 0,6321", "(1−1/n)ⁿ: n=5 → 0,328; n=100 → 0,366; n=10 000 → 0,368", "Cada caso fue OOB en 36,8 de 100 árboles"] } });

  L.sSection(D, { num: 3, title: "Bagging", sub: "Bootstrap aggregating (Breiman, 1996)" });
  L.sFormula(D, { title: "Por qué promediar funciona, y hasta dónde", formula: "Var( (1/B) Σ_b f̂_b(x) ) = ρσ² + (1 − ρ) σ² / B", fsize: 30,
    where: [["f̂_b", "Árbol profundo entrenado en la muestra bootstrap b"], ["σ²", "Varianza de un árbol individual"], ["ρ", "Correlación entre las predicciones de dos árboles"], ["B → ∞", "El segundo término desaparece; queda el piso ρσ²"], ["Predicción", "PD = promedio de las PD de las hojas (o voto)"]],
    example: { h: "Consecuencia", t: ["Más árboles nunca empeora el bagging: solo deja de mejorar", "La única forma de bajar el piso es reducir ρ", "→ Random forest: árboles menos parecidos entre sí"] } });
  L.sImage(D, { title: "Bagging desde cero en la cartera de consumo", img: IMG + "c08_0.png",
    points: ["100 árboles profundos, implementación propia (41 s): AUC OOB 0,739; fuera de tiempo 0,745", "BaggingClassifier de scikit-learn: 0,747", "Con ρ = 0,42 la varianza de la PD cae rápido hasta B ≈ 20 y luego se acerca al piso ρσ²", "De un árbol podado (0,718) a bagging (0,747): la ganancia viene de reducir varianza"] });

  L.sSection(D, { num: 4, title: "Random forest", sub: "Decorrelacionar los árboles (Breiman, 2001)" });
  L.sTable(D, { title: "max_features: el parámetro que controla ρ", colW: [2.2, 2.0, 2.0, 2.4], rowH: 0.55, fsize: 14, w: 8.6,
    header: ["max_features", "ρ entre árboles", "AUC OOB", "AUC fuera de tiempo"],
    rows: [["1", "0,378", "0,747", "0,742"], ["2", "0,465", "0,750", "0,747"], [{ text: "3 (≈ √12)", options: { bold: true, color: L.HEX.green } }, "0,484", { text: "0,751", options: { bold: true } }, { text: "0,750", options: { bold: true } }], ["6", "0,498", "0,747", "0,749"], ["12 (= bagging)", "0,491", "0,745", "0,747"]],
    side: ["En cada partición se sortean m de las p variables candidatas", "m pequeño → árboles distintos (ρ baja) pero cada uno peor (σ² y sesgo suben)", "El óptimo suele estar cerca de √p en clasificación", "Con una variable dominante (EXT2), forzar m pequeño obliga a explorar las demás"],
    note: "Fuente: notebook M04_S02, sección 4. 300 árboles, 12 variables." });
  L.sImage(D, { title: "Importancia de variables: impureza (MDI) vs. permutación", img: IMG + "c11_1.png",
    points: ["MDI: suma de reducciones de Gini en entrenamiento; favorece variables continuas con muchos cortes posibles (LTI, AMT_CREDIT, AMT_INCOME)", "Permutación: caída de AUC al desordenar la variable en datos fuera de tiempo; mide el aporte real a la discriminación", "Ambas coinciden en el top (EXT2, EXT3, EDAD, RCI); difieren en la cola", "Para gobierno de modelos, reportar permutación fuera de tiempo (y SHAP, Módulo 7)"] });

  L.sSection(D, { num: 5, title: "Puente hacia el boosting", sub: "De promediar en paralelo a corregir en secuencia" });
  L.sCompare(D, { title: "Bagging/random forest vs. boosting", left: { h: "Bagging y random forest", icon: "∥", items: ["Árboles profundos (bajo sesgo, alta varianza)", "Entrenados en paralelo e independientes", "Reducen varianza", "Difícil sobreajustar al agregar árboles", "OOB como validación interna"] },
    right: { h: "Boosting (AdaBoost, gradient boosting)", icon: "→", items: ["Árboles pequeños (alto sesgo, baja varianza)", "Entrenados en secuencia: cada uno corrige los errores del anterior", "Reducen sobre todo sesgo", "Puede sobreajustar: requiere shrinkage y early stopping", "AdaBoost = boosting con pérdida exponencial (Friedman, Hastie y Tibshirani, 2000)"] },
    verdict: "el boosting no promedia modelos iguales: construye un modelo aditivo por etapas. Ese es el tema de la sesión 3." });
  L.sTable(D, { title: "Comparación fuera de tiempo (2025)", colW: [4.2, 2.4, 2.0, 2.0], rowH: 0.6, fsize: 15, w: 10.6,
    header: ["Modelo", "AUC fuera de tiempo", "PD media", "Tasa observada"],
    rows: [["Árbol podado (1 árbol)", "0,718", "7,98 %", "5,86 %"], ["Bagging (100 árboles)", "0,747", "8,02 %", "5,86 %"], [{ text: "Random forest (300 árboles)", options: { bold: true, color: L.HEX.green } }, { text: "0,750", options: { bold: true } }, "8,04 %", "5,86 %"],
      ["AdaBoost (200 tocones)", "0,746", { text: "28,71 %", options: { bold: true, color: L.HEX.crimson } }, "5,86 %"]],
    note: "AdaBoost ordena bien pero sus \"probabilidades\" no son PD: necesita calibración. Ningún ensemble supera aún al scorecard logístico (0,772). Fuente: notebook M04_S02, sección 6.",
    notes: "Mensaje doble: los ensembles mejoran mucho al árbol, pero la logística sobre WoE sigue siendo un rival fuerte en esta cartera; y discriminación no es calibración (todos sobreestiman la PD de 2025, un año más benigno)." });
  L.sQuestion(D, { q: "Un random forest con 300 árboles mejora 3 puntos de AUC sobre un árbol. ¿Qué le preguntaría el área de validación antes de aprobarlo?",
    hint: "explicabilidad de un rechazo individual, calibración de la PD, estabilidad fuera de tiempo, costo computacional en producción y cómo se monitorea." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M04_S02_Ensembles_Bootstrap_Bagging_y_Random_Forest.ipynb", data: ["hc_application_sintetico.csv", "Desarrollo 2022-2024, fuera de tiempo 2025"], steps: [
    { h: "Sesgo y varianza", t: "Varianza de la PD por profundidad; variabilidad de umbrales y segundo nivel" },
    { h: "Bootstrap", t: "63,2 %, OOB y convergencia de (1−1/n)ⁿ" },
    { h: "Bagging desde cero", t: "AUC OOB, curva por B y fórmula de varianza con ρ estimado" },
    { h: "Random forest", t: "max_features, correlación entre árboles e importancias" },
    { h: "AdaBoost y comparación", t: "Discriminación y calibración de los cuatro modelos" },
  ] });
  L.sTakeaways(D, { items: [
    "El árbol profundo tiene poco sesgo y mucha varianza: es el candidato ideal para promediar.",
    "El bootstrap deja fuera el 36,8 % de los casos en cada muestra: validación OOB gratuita.",
    "Bagging reduce varianza hasta el piso ρσ²; random forest baja ρ sorteando variables.",
    "Importancia por permutación fuera de tiempo es más confiable que la de impureza.",
    "El boosting cambia de estrategia: modelos pequeños en secuencia que reducen el sesgo.",
  ], next: "Sesión 3 · Gradient boosting (Friedman, 2001)." });
  await L.save(D, OUT);
})();
