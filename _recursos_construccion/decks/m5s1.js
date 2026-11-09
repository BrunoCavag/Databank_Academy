const L = require("./lib");
const OUT = process.argv[2];
const IMG = "/home/claude/curso/img/m5s1/";
const B = (t, c) => ({ text: t, options: { bold: true, color: c || L.HEX.navy } });

(async () => {
  const D = L.newDeck({ title: "M5 S1 - CatBoost: target statistics y ordered boosting", footer: "DataBank Academy · Módulo 5 · Sesión 1 · CatBoost: categóricas, target statistics y ordered boosting" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 5 · SESIÓN 1 DE 2", title: "CatBoost: variables categóricas, target statistics y ordered boosting",
    subtitle: "Prokhorenkova et al. (2018), \"CatBoost: unbiased boosting with categorical features\", NeurIPS · arXiv 1706.09516", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "La idea central del paper: tanto la codificación de categóricas por tasa de malos como el boosting clásico sufren la misma fuga de información (target leakage). La solución también es la misma: usar solo el pasado en una permutación aleatoria." });
  L.sAgenda(D, { items: [
    { t: "Categóricas de alta cardinalidad", d: "Agencia, empleador, comercio aliado: información valiosa y ruidosa", min: 10 },
    { t: "Target statistics y fuga de información", d: "Greedy, holdout, leave-one-out y ordenada; los ejemplos del paper", min: 30 },
    { t: "Efecto en un modelo de PD", d: "XGBoost con TS greedy vs. K-fold vs. ordenada", min: 15 },
    { t: "Prediction shift y ordered boosting", d: "Teorema 1 por simulación; algoritmo 1; Plain vs. Ordered", min: 25 },
    { t: "CatBoost en la cartera", d: "CTR, combinaciones y comparación con XGBoost", min: 30 },
    { t: "Ejercicios", d: "Prior, permutaciones, tamaño de muestra y one-hot", min: 10, lab: true },
  ] });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Codificar categóricas sin fuga", t: "Explicar y programar las cuatro target statistics y elegir la que no filtra el target." },
    { h: "Detectar fuga de información", t: "Reconocer por qué un AUC de entrenamiento \"demasiado bueno\" no se sostiene fuera de tiempo." },
    { h: "Entender el prediction shift", t: "Derivar por qué el boosting reutiliza mal los datos y cómo lo corrige el ordered boosting." },
    { h: "Usar CatBoost con criterio", t: "Saber cuándo su ventaja es real (categóricas ricas) y cuándo otro modelo bien codificado rinde igual." },
  ] });

  L.sSection(D, { num: 1, title: "Categóricas de alta cardinalidad", sub: "Mucha información, mucho ruido" });
  L.sStats(D, { title: "El caso: empleadores, agencias y comercios aliados", stats: [
    { v: "2 881", l: "Empleadores distintos en entrenamiento", color: L.HEX.navy },
    { v: "81 %", l: "Empleadores con menos de 10 clientes", color: L.HEX.crimson },
    { v: "4", l: "Clientes por empleador (mediana)", color: L.HEX.gold },
    { v: "180 · 41", l: "Agencias · comercios aliados", color: L.HEX.green, size: 40 },
  ], points: ["One-hot: miles de columnas casi vacías; un árbol aísla un nivel por partición", "Codificación por etiquetas (1, 2, 3…): impone un orden arbitrario", "Codificar por la tasa de malos del nivel es lo natural… y donde aparece la fuga de información"] });
  L.sImage(D, { title: "El embudo del ruido: tasa de malos por empleador", img: IMG + "c04_0.png",
    points: ["Empleadores pequeños: tasas de 0 % o 50 % por puro azar", "Cualquier codificación por tasa de malos debe suavizar hacia el promedio (prior)", "Y, sobre todo, no debe usar el propio target del cliente"] });

  L.sSection(D, { num: 2, title: "Target statistics", sub: "Reemplazar la categoría por una estimación de E[y | categoría]" });
  L.sFormula(D, { title: "Target statistic con prior (sección 3 del paper)", formula: "x̂ₖ = ( Σ_{j ∈ Dₖ} 1{xⱼ = xₖ} · yⱼ + a·p ) / ( Σ_{j ∈ Dₖ} 1{xⱼ = xₖ} + a )", fsize: 26,
    where: [["p", "Prior: tasa de malos global"], ["a", "Peso del prior: suaviza los niveles pequeños"], ["Dₖ", "Clientes usados para calcular la TS del cliente k: aquí está todo el problema"], ["P1", "La TS de entrenamiento debe distribuirse igual que la de prueba"], ["P2", "Usar todos los datos para entrenar y para calcular TS"]],
    example: { h: "Las cuatro opciones de Dₖ", t: ["Greedy: todos, incluido k → fuga", "Holdout: una parte reservada → desperdicia datos", "Leave-one-out: todos menos k → fuga inversa", "Ordenada: los anteriores a k en una permutación aleatoria → cumple P1 y P2"] } });
  L.sTable(D, { title: "Las cuatro TS programadas desde cero: AUC de la variable sola", colW: [2.6, 1.9, 1.9, 1.9, 1.9], rowH: 0.62, fsize: 15, w: 10.2,
    header: ["Variable", "Greedy", "Holdout", "Leave-one-out", "Ordenada"],
    rows: [["ID_FALSO (1 nivel por cliente)", B("1,000 / 0,50", L.HEX.crimson), "0,50 / 0,50", "0,50 / 0,50", "0,50 / 0,50"], ["CONSTANTE (1 nivel)", "0,50 / 0,50", "0,50 / 0,50", B("0,000 / 0,50", L.HEX.crimson), "0,50 / 0,50"],
      ["EMPLEADOR_ID", B("0,80 / 0,59", L.HEX.crimson), "0,56 / 0,57", "0,59 / 0,59", B("0,58 / 0,59", L.HEX.green)], ["COMERCIO_ALIADO", "0,54 / 0,54", "0,53 / 0,54", B("0,16 / 0,54", L.HEX.crimson), "0,52 / 0,54"]],
    note: "Cada celda: AUC en entrenamiento / AUC en prueba 2025. Fuente: notebook M05_S01, sección 2.",
    notes: "ID_FALSO es el ejemplo del paper: con TS greedy, x̂ = (y + ap)/(1 + a) separa perfectamente. CONSTANTE es el ejemplo de leave-one-out: x̂ = (n⁺ − y + ap)/(n − 1 + a) es menor para los malos, separación perfecta invertida. COMERCIO_ALIADO se comporta como la constante porque el nivel 'Sin dato' agrupa a la mayoría." });
  L.sCompare(D, { title: "Los dos ejemplos de fuga del paper", left: { h: "Greedy con una variable tipo ID", icon: "G", items: ["Cada cliente es su propio nivel", "x̂ₖ = (yₖ + ap)/(1 + a): contiene su propio target", "Una partición separa perfectamente: AUC entren. = 1,000", "En prueba todos reciben el prior: AUC = 0,5"] },
    right: { h: "Leave-one-out con una variable constante", icon: "L", items: ["Un solo nivel para todos", "x̂ₖ = (n⁺ − yₖ + ap)/(n − 1 + a)", "Los malos reciben un valor algo menor que los buenos", "Separación perfecta invertida: AUC entren. = 0,000"] },
    verdict: "ambas variables no tienen información, pero un árbol encontraría en ellas una partición \"perfecta\". La TS ordenada no tiene este problema." });

  L.sSection(D, { num: 3, title: "Efecto en un modelo de PD", sub: "Lo que importa es lo que aprende el boosting" });
  L.sTable(D, { title: "XGBoost con tres codificaciones de las categóricas de alta cardinalidad", colW: [2.4, 1.4, 2.0, 2.1, 1.9], rowH: 0.62, fsize: 15, w: 9.8,
    header: ["TS", "Árboles", "AUC entrenamiento", "AUC validación 2024", "AUC prueba 2025"],
    rows: [[B("Greedy", L.HEX.crimson), "159", B("0,893", L.HEX.crimson), "0,754", "0,764"], ["K-fold (5)", "344", "0,854", "0,790", B("0,799", L.HEX.green)], [B("Ordenada", L.HEX.green), "401", "0,856", "0,790", B("0,798", L.HEX.green)]],
    side: ["Con TS greedy el modelo confía en una variable que \"conoce\" el target", "Early stopping temprano y 3,5 puntos menos de AUC fuera de tiempo", "K-fold y ordenada: el mismo resultado, muy superior"],
    note: "Mismo XGBoost (prof. 4, η = 0,03, submuestreo 0,8) para las tres; AGENCIA_ID, EMPLEADOR_ID y COMERCIO_ALIADO codificadas con TS (a = 10)." });
  L.sTable(D, { title: "El paper: la TS ordenada gana en todos los datasets (tabla 4)", colW: [2.6, 2.4, 2.4, 2.6], rowH: 0.55, fsize: 15, w: 10.0,
    header: ["Dataset", "Greedy", "Holdout", "Leave-one-out"],
    rows: [["Adult", "+1,1 %", "+2,1 %", "+5,5 %"], ["Amazon", B("+40 %", L.HEX.crimson), "+8,3 %", "+4,5 %"], ["Click", "+13 %", "+1,5 %", "+2,7 %"], ["KDD Internet", "+33 %", "+2,6 %", B("+27 %", L.HEX.crimson)], ["KDD Upselling", B("+57 %", L.HEX.crimson), "+1,6 %", "+3,9 %"], ["Kick", "+22 %", "+1,3 %", "+3,7 %"]],
    note: "Aumento relativo del log-loss frente a la TS ordenada. Prokhorenkova et al. (2018), tabla 4 (extracto)." });

  L.sSection(D, { num: 4, title: "Prediction shift y ordered boosting", sub: "La misma fuga, dentro del boosting" });
  L.sFormula(D, { title: "Teorema 1: el boosting que reutiliza los datos está sesgado", formula: "E[F(x)] = f*(x) − c₂ (x² − ½) / (n − 1) + O(2⁻ⁿ)", fsize: 30,
    where: [["Modelo", "y = c₁x¹ + c₂x², con x¹, x² ~ Bernoulli(½); pérdida cuadrática; dos stumps"], ["Reutilizar", "El residuo de k se calcula con un modelo que vio a k: sesgo de orden 1/n"], ["Indep.", "Con muestras independientes: sesgo exponencialmente pequeño"], ["Prediction shift", "F^{t−1}(xₖ) | xₖ en entrenamiento ≠ F^{t−1}(x) | x en un cliente nuevo"]],
    example: { h: "Simulación (n = 15, 40 000 réplicas)", t: ["Misma muestra: sesgo ±0,035 / ±0,036", "Teorema: ±0,0357", "Muestras independientes: ±0,001", "El sesgo cae como 1/n: importa en segmentos pequeños o productos nuevos"] } });
  L.sFlow(D, { title: "Algoritmo 1: ordered boosting", steps: [
    { h: "Permutación", t: ["Ordenar los clientes al azar: σ", "Define qué es \"el pasado\" de cada cliente"] },
    { h: "Modelos de soporte", t: ["Mᵢ se entrena solo con los primeros i clientes", "En teoría n modelos"] },
    { h: "Residuos insesgados", t: ["rⱼ = yⱼ − M_{j−1}(xⱼ)", "Un modelo que nunca vio al cliente j"] },
    { h: "Ajustar y actualizar", t: ["Árbol sobre los residuos insesgados", "Actualizar los modelos de soporte"] },
    { h: "Versión práctica", t: ["Soporte en prefijos de tamaño 2ʲ: O(log n)", "Varias permutaciones", "La misma σ para TS y boosting"] },
  ], note: "en la librería, boosting_type=\"Ordered\"; \"Plain\" es el boosting estándar, pero con TS ordenadas para las categóricas." });
  L.sTable(D, { title: "Plain vs. Ordered: la ganancia aparece en muestras pequeñas", colW: [2.0, 1.9, 1.9, 1.9, 1.9], rowH: 0.5, fsize: 15, w: 9.6,
    header: ["Muestra de 2 000", "AUC Plain", "AUC Ordered", "Log-loss Plain", "Log-loss Ordered"],
    rows: [["1", "0,753", "0,749", "0,2012", "0,2032"], ["2", "0,739", "0,741", "0,2071", "0,2064"], ["3", "0,745", "0,745", "0,2011", "0,2018"], ["4", "0,745", "0,749", "0,2051", "0,2050"], ["5", "0,742", "0,748", "0,2020", "0,2014"], [B("Promedio"), B("0,7448"), B("0,7463", L.HEX.green), "0,2033", "0,2035"]],
    side: ["Ordered mejora el AUC en 3 de 5 muestras (+0,15 pp en promedio)", "Paper (tabla 3): mayores ganancias en datasets pequeños (KDD Internet, Adult)", "Con 30 000 clientes: Plain 0,795 vs. Ordered 0,793, y Ordered tarda ~40 % más"] });

  L.sSection(D, { num: 5, title: "CatBoost en la cartera", sub: "Categóricas en bruto, sin preprocesamiento" });
  L.sCards(D, { title: "Qué hace CatBoost con cada categórica", cols: 2, cards: [
    { h: "CTR (counter / target statistics)", t: ["Borders: tasa de malos con varios priors (0; 0,5; 1)", "Counter: frecuencia del nivel", "Todas calculadas en forma ordenada"] },
    { h: "Combinaciones", t: ["Al crecer el árbol combina categóricas ya usadas con nuevas (agencia × canal)", "Cada combinación tiene su propia TS", "max_ctr_complexity = 4 por defecto"] },
    { h: "Varias permutaciones", t: ["Reducen la varianza de las TS de los primeros clientes", "permutation_count = 4 por defecto"] },
    { h: "One-hot solo si conviene", t: ["one_hot_max_size = 2: solo binarias van con one-hot", "El resto, con CTR"] },
  ] });
  L.sTable(D, { title: "Comparación fuera de tiempo 2025", colW: [4.6, 1.5, 1.8, 1.9, 1.6], rowH: 0.6, fsize: 15, w: 11.4,
    header: ["Modelo", "Árboles", "AUC 2025", "Log-loss 2025", "Segundos"],
    rows: [[B("CatBoost (Plain), categóricas en bruto", L.HEX.green), "494", B("0,795"), "0,191", "24"], ["CatBoost (Ordered)", "378", "0,793", "0,191", "34"], ["XGBoost, categóricas nativas", "187", "0,775", "0,196", "3"], ["XGBoost sin EMPLEADOR_ID", "258", "0,772", "0,197", "3"], [B("XGBoost + TS ordenada (propia)", L.HEX.green), "401", B("0,798"), "—", "—"], ["Scorecard logístico (Módulo 3)", "—", "0,772", "0,197", "—"]],
    note: "La ventaja no es magia del algoritmo: es un tratamiento correcto de las categóricas. CatBoost lo trae por defecto y sin riesgo de fuga; con otras librerías hay que programarlo (y es fácil hacerlo mal).",
    notes: "XGBoost con categóricas nativas particiona por subconjuntos de niveles y no logra extraer la información de 2 881 empleadores: quitarlo solo le resta 0,3 puntos. Con una TS ordenada bien hecha, XGBoost alcanza e incluso supera ligeramente a CatBoost." });
  L.sImage(D, { title: "Importancia e interacciones en CatBoost", img: IMG + "c16_1.png",
    points: ["EMPLEADOR_ID pasa a ser la segunda variable más importante", "Interacciones fuertes: EXT2 × agencia, EXT2 × empleador", "Cuidado: la TS de un empleador cambia en el tiempo → recalcular y monitorear su PSI (Módulo 12)", "Revisar equidad: la agencia puede actuar como proxy geográfico"] });
  L.sQuestion(D, { q: "Un analista reporta que la tasa de malos por agencia, calculada con toda la base de desarrollo, eleva el AUC de entrenamiento de 0,78 a 0,86. ¿Qué le preguntarías antes de aprobar la variable?",
    hint: "¿cómo se calculó la tasa (greedy, K-fold, ordenada)?, ¿cuál es el AUC fuera de tiempo?, ¿qué pasa con las agencias nuevas o pequeñas?, ¿cómo se actualizará en producción?" });

  D.sec("Ejercicios y cierre");
  L.sLab(D, { notebook: "M05_S01_CatBoost_Target_Statistics_y_Ordered_Boosting.ipynb", data: ["hc_application_sintetico.csv", "Agencia, empleador y comercio aliado", "Train 2022-23 · valid 2024 · test 2025"], steps: [
    { h: "Cardinalidad y ruido", t: "Niveles, tamaño y embudo de tasas por empleador" },
    { h: "Cuatro TS desde cero", t: "Greedy, holdout, leave-one-out y ordenada; ejemplos ID y constante" },
    { h: "TS en XGBoost", t: "Greedy vs. K-fold vs. ordenada fuera de tiempo" },
    { h: "Teorema 1", t: "Simulación del prediction shift con dos stumps" },
    { h: "Plain vs. Ordered", t: "Muestras de 2 000 y cartera completa" },
    { h: "CatBoost vs. XGBoost", t: "Categóricas en bruto, importancia e interacciones" },
  ] });
  L.sTakeaways(D, { items: [
    "Las categóricas de alta cardinalidad contienen riesgo real, pero su tasa de malos por nivel es casi puro ruido en los niveles pequeños.",
    "Greedy y leave-one-out filtran el target: AUC de entrenamiento inflado y peor desempeño fuera de tiempo.",
    "La TS ordenada usa solo \"el pasado\" de una permutación: sin fuga y con todos los datos.",
    "El boosting clásico sufre la misma fuga (prediction shift); el ordered boosting la corrige, sobre todo en muestras pequeñas.",
    "La ventaja de CatBoost es el tratamiento correcto de las categóricas, por defecto y sin código adicional.",
  ], next: "Sesión 2 · Árboles simétricos, regularización, benchmarks e innovaciones (embeddings, texto, grafos)." });
  await L.save(D, OUT);
})();
