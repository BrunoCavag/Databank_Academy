const L = require("./lib");
const OUT = process.argv[2];
const IMG = "/home/claude/curso/img/m4s3/";

(async () => {
  const D = L.newDeck({ title: "M4 S3 - Gradient boosting (Friedman, 2001)", footer: "DataBank Academy · Módulo 4 · Sesión 3 · Gradient boosting: Friedman (2001), Annals of Statistics 29(5)" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 4 · SESIÓN 3 DE 4", title: "Gradient boosting: descenso de gradiente en el espacio de funciones",
    subtitle: "Friedman (2001), \"Greedy Function Approximation: A Gradient Boosting Machine\"", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Hoy derivamos el algoritmo que está detrás de XGBoost, LightGBM y CatBoost. Lo implementamos en unas 25 líneas y lo verificamos contra scikit-learn." });
  L.sAgenda(D, { items: [
    { t: "Optimización en el espacio de funciones", d: "Del descenso de gradiente en parámetros al gradiente en funciones (secciones 1-3)", min: 25 },
    { t: "Funciones de pérdida", d: "LS, LAD, Huber y binomial: pseudo-residuos y valores de hoja", min: 15 },
    { t: "L2_TreeBoost", d: "Derivación para PD (algoritmo 5) e implementación desde cero", min: 30 },
    { t: "Regularización", d: "Shrinkage, número de iteraciones y submuestreo estocástico", min: 25 },
    { t: "Interpretación", d: "Influencia relativa y dependencia parcial (sección 8)", min: 15 },
    { t: "Ejercicios", d: "LS_Boost, tamaño del árbol, influence trimming, calibración", min: 10, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "Optimización en el espacio de funciones", sub: "Tratar F(x) en cada punto como un parámetro" });
  L.sCompare(D, { title: "De parámetros a funciones (Friedman, secciones 2-3)", left: { h: "Espacio de parámetros", icon: "P", items: ["Buscamos P* = argmin Φ(P)", "Gradiente gₘ = ∂Φ/∂P en Pₘ₋₁", "Paso: Pₘ = Pₘ₋₁ − ρₘ gₘ", "Solución: suma de pasos P* = Σₘ pₘ", "Ej.: Newton-Raphson de la logística (Módulo 3)"] },
    right: { h: "Espacio de funciones", icon: "F", items: ["Buscamos F* = argmin E[L(y, F(x))]", "Gradiente gₘ(x) = ∂E[L(y, F(x)) | x]/∂F(x)", "Solo se conoce en los datos: pseudo-residuos ỹᵢ = −∂L(yᵢ, F(xᵢ))/∂F(xᵢ)", "Para generalizar: ajustar un árbol h(x; a) a los ỹᵢ por mínimos cuadrados", "Solución: F(x) = Σₘ ρₘ h(x; aₘ), un modelo aditivo"] },
    verdict: "cada árbol es un paso de descenso de gradiente; el modelo final es la suma de los pasos." });
  L.sFlow(D, { title: "Algoritmo 1: Gradient_Boost", steps: [
    { h: "1. Inicio", t: ["F₀(x) = argmin_ρ Σᵢ L(yᵢ, ρ)", "En PD: el log-odds de la tasa de malos"] },
    { h: "2. Pseudo-residuos", t: ["ỹᵢ = −∂L(yᵢ, F(xᵢ))/∂F(xᵢ) evaluado en Fₘ₋₁", "Dirección de máxima mejora en cada cliente"] },
    { h: "3. Ajustar el árbol", t: ["aₘ = argmin Σᵢ [ỹᵢ − β h(xᵢ; a)]²", "Siempre mínimos cuadrados, sea cual sea L"] },
    { h: "4. Búsqueda lineal", t: ["ρₘ = argmin Σᵢ L(yᵢ, Fₘ₋₁ + ρ h(xᵢ; aₘ))", "TreeBoost: un ρ por hoja (γⱼₘ)"] },
    { h: "5. Actualizar", t: ["Fₘ = Fₘ₋₁ + ν · ρₘ h(x; aₘ)", "Repetir M veces"] },
  ], note: "el árbol solo aporta la dirección (las regiones); el valor de cada hoja se optimiza con la pérdida original." });

  L.sSection(D, { num: 2, title: "Funciones de pérdida", sub: "Un mismo algoritmo, distintos problemas" });
  L.sTable(D, { title: "La pérdida define el pseudo-residuo y el valor de la hoja", colW: [2.4, 3.1, 3.0, 3.63], rowH: 0.62, fsize: 15,
    header: ["Algoritmo (Friedman)", "Pérdida L(y, F)", "Pseudo-residuo ỹ", "Valor de la hoja"],
    rows: [["LS_Boost", "½ (y − F)²", "y − F", "Media de los residuos"], ["LAD_TreeBoost", "|y − F|", "sign(y − F)", "Mediana de los residuos"], ["M_TreeBoost", "Huber", "Residuo truncado en δ", "M-estimador"],
      [{ text: "L2_TreeBoost", options: { bold: true, color: L.HEX.crimson } }, "log(1 + e^(−2yF)), y ∈ {−1, 1}", "2y / (1 + e^(2yF))", "Un paso de Newton"]],
    note: "En riesgo: L2_TreeBoost para PD; LS o Huber para LGD, EAD o ingresos; LAD si hay valores extremos (recuperaciones atípicas). XGBoost agrega cuantiles y expectiles (S4)." });

  L.sSection(D, { num: 3, title: "L2_TreeBoost", sub: "Gradient boosting para probabilidad de default (algoritmo 5)" });
  L.sFormula(D, { title: "Derivación para clasificación binaria", formula: "F*(x) = ½ log[ P(y=1|x) / P(y=−1|x) ]          γⱼₘ = Σ ỹᵢ / Σ |ỹᵢ| (2 − |ỹᵢ|)", fsize: 22,
    where: [["Pérdida", "Deviance binomial L = log(1 + e^(−2yF)) con y ∈ {−1, 1}"], ["F₀", "½ log[(1 + ȳ)/(1 − ȳ)]: la mitad del log-odds"], ["ỹᵢ", "2yᵢ / (1 + exp(2yᵢFₘ₋₁(xᵢ)))"], ["γⱼₘ", "Paso de Newton-Raphson en cada hoja (ecuación 23): gradiente / curvatura"], ["PD", "p(x) = 1 / (1 + e^(−2F(x)))"]],
    example: { h: "En el caso (iteración 1)", t: ["F₀ = −1,1763 = ½ · log-odds de 8,69 %", "ỹ de los buenos = −0,174; de los malos = +1,826", "150 árboles de 8 hojas desde cero: 22 s", "AUC fuera de tiempo: propio 0,7515 = scikit-learn 0,7515", "Diferencia media de PD: 0,0001"] },
    notes: "scikit-learn parametriza con y ∈ {0,1} y F igual al log-odds completo; las diferencias de escala se compensan exactamente. Las pequeñas diferencias individuales vienen de casi-empates en particiones profundas." });
  L.sTable(D, { title: "Un paso de Newton por hoja: el primer árbol", colW: [1.2, 1.5, 1.6, 1.6, 1.5, 1.8], rowH: 0.48, fsize: 14, w: 9.2,
    header: ["Hoja", "Clientes", "Tasa de malos", "Σ ỹ", "γ (Newton)", "PD tras el paso (ν = 1)"],
    rows: [["4", "24 459", "4,2 %", "−2 191", "−0,282", "5,1 %"], ["12", "6 897", "7,9 %", "−114", "−0,052", "7,9 %"], ["13", "6 543", "11,5 %", "+361", "+0,174", "11,9 %"], ["8", "2 387", "14,6 %", "+283", "+0,374", "16,7 %"], ["7", "1 988", "24,7 %", "+637", "+1,009", "41,7 %"], [{ text: "9", options: { bold: true, color: L.HEX.crimson } }, "1 070", "38,5 %", "+638", "+1,880", { text: "80,3 %", options: { bold: true, color: L.HEX.crimson } }]],
    side: ["Cerca del promedio, un paso de Newton lleva la PD casi exactamente a la tasa observada", "En hojas extremas se pasa: 38,5 % → 80 %, porque la curvatura se evalúa en la PD inicial (8,7 %)", "Otra razón para el shrinkage: avanzar un 10 % por iteración y dejar que los árboles siguientes corrijan"],
    note: "Fuente: notebook M04_S03, sección 3. El valor γ calculado a mano coincide con el del árbol en todas las hojas." });

  L.sSection(D, { num: 4, title: "Regularización", sub: "Shrinkage, iteraciones y submuestreo" });
  L.sFormula(D, { title: "Shrinkage (sección 5) y boosting estocástico (Friedman, 2002)", formula: "Fₘ(x) = Fₘ₋₁(x) + ν · Σⱼ γⱼₘ 1(x ∈ Rⱼₘ),     0 < ν ≤ 1", fsize: 26,
    where: [["ν", "Tasa de aprendizaje: cuánto se avanza en cada paso"], ["M", "Número de árboles: se elige junto con ν"], ["J", "Hojas por árbol: controla el orden de las interacciones (sección 7)"], ["Submuestreo", "Cada árbol con una submuestra sin reposición (≈ 50 %): menos varianza y menos tiempo"]],
    example: { h: "Hallazgo de Friedman", t: ["ν pequeño (≤ 0,1) mejora mucho el error de prueba", "A cambio requiere más iteraciones", "En la práctica: fijar ν y elegir M con early stopping (S4)"] } });
  L.sImage(D, { title: "Shrinkage en la cartera: el patrón que reporta Friedman", img: IMG + "c08_0.png",
    points: ["ν = 1: mínimo 0,2071 en M = 8 y luego sobreajuste rápido", "ν = 0,3: mínimo 0,2039 en M = 15", "ν = 0,1: mínimo 0,2019 en M = 97, curva plana", "ν = 0,1 + submuestreo 50 %: 0,2026 en M = 52, con la mitad del cómputo por árbol", "Con ν pequeño el número exacto de árboles importa menos: el modelo es más robusto"] });

  L.sSection(D, { num: 5, title: "Interpretación", sub: "Abrir la caja (Friedman, sección 8)" });
  L.sImage(D, { title: "Influencia relativa y dependencia parcial", img: IMG + "c10_1.png",
    points: ["Influencia relativa (ec. 43-44): mejora de la pérdida en las particiones de cada variable, promediada en los árboles", "Dependencia parcial: F̄_S(x_S) = (1/n) Σᵢ F(x_S, x_{i,C}), el efecto promedio integrando las demás variables", "EXT2: relación decreciente y casi lineal en log-odds; RCI: plana hasta ≈ 0,5 y luego creciente, como sugería el logit empírico del Módulo 3, sin especificarlo", "Es la base del PDP y del ICE del Módulo 7"] });
  L.sCompare(D, { title: "Gradient boosting frente al scorecard", left: { h: "Lo que gana", icon: "+", items: ["Descubre formas funcionales e interacciones", "Cualquier pérdida diferenciable: PD, LGD, cuantiles", "Árboles: sin transformaciones, robusto a extremos", "Mejor discriminación cuando hay estructura no aditiva"] },
    right: { h: "Lo que cuesta", icon: "−", items: ["Ya no es una tabla de puntos: necesita PDP, SHAP, reason codes", "Hiperparámetros a gobernar: ν, M, J, submuestreo", "Puede violar la monotonicidad esperada", "Riesgo de sobreajuste sin validación fuera de tiempo"] },
    verdict: "XGBoost (sesión 4) responde a varias de estas limitaciones: regularización explícita, restricciones monotónicas y escalabilidad." });
  L.sQuestion(D, { q: "¿Por qué el valor de cada hoja se calcula con la pérdida binomial y no simplemente como el promedio de los pseudo-residuos?",
    hint: "el árbol se ajusta por mínimos cuadrados a ỹ solo para encontrar regiones; el valor óptimo en cada región depende de la pérdida que realmente queremos minimizar (sección 4.3, TreeBoost)." });

  D.sec("Ejercicios y cierre");
  L.sLab(D, { notebook: "M04_S03_Gradient_Boosting_Friedman.ipynb", data: ["hc_application_sintetico.csv", "Desarrollo 2022-2024, fuera de tiempo 2025"], steps: [
    { h: "L2_TreeBoost desde cero", t: "Algoritmo 5 en 25 líneas; verificación contra GradientBoostingClassifier" },
    { h: "Un paso en detalle", t: "Pseudo-residuos, Σỹ, curvatura y γ por hoja" },
    { h: "Shrinkage y submuestreo", t: "Curvas de log-loss fuera de tiempo para ν = 1; 0,3; 0,1" },
    { h: "Interpretación", t: "Influencia relativa y dependencia parcial de EXT2 y RCI" },
    { h: "Ejercicios", t: "LS_Boost, J = 2 vs. 32, influence trimming, calibración con M grande" },
  ] });
  L.sTakeaways(D, { items: [
    "Gradient boosting es descenso de gradiente en el espacio de funciones: cada árbol aproxima el gradiente negativo.",
    "El árbol encuentra regiones por mínimos cuadrados; el valor de cada hoja se optimiza con la pérdida real.",
    "Para PD, L2_TreeBoost usa la deviance binomial y un paso de Newton por hoja.",
    "ν pequeño con early stopping y submuestreo da mejores modelos que pasos grandes.",
    "La dependencia parcial recupera la forma de las relaciones, pero el modelo exige herramientas de explicabilidad.",
  ], next: "Sesión 4 · XGBoost: derivación, aplicación e innovaciones recientes." });
  await L.save(D, OUT);
})();
