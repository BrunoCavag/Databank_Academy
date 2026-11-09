const L = require("./lib");
const OUT = process.argv[2];
const IMG = "/home/claude/curso/img/m5s2/";
const B = (t, c) => ({ text: t, options: { bold: true, color: c || L.HEX.navy } });

(async () => {
  const D = L.newDeck({ title: "M5 S2 - CatBoost: árboles simétricos, benchmarks e innovaciones", footer: "DataBank Academy · Módulo 5 · Sesión 2 · CatBoost: árboles simétricos, benchmarks e innovaciones 2022-2026" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 5 · SESIÓN 2 DE 2", title: "CatBoost: árboles simétricos, regularización, benchmarks e innovaciones",
    subtitle: "De la estructura del árbol a los embeddings, el texto y los grafos como variables de entrada", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Notebook ejecutado con CatBoost 1.2.10 y XGBoost 3.4.1. Fuentes: paper original, documentación en catboost.ai, notas de versión en GitHub y benchmarks independientes." });
  L.sAgenda(D, { items: [
    { t: "Árboles simétricos (oblivious)", d: "La hoja como número binario; regularización y velocidad", min: 20 },
    { t: "Hiperparámetros y regularización", d: "depth, l2_leaf_reg, random_strength, bootstrap, border_count, grow_policy", min: 25 },
    { t: "CatBoost para PD y comparación", d: "Monotonicidad, calibración, SHAP; vs. XGBoost y scorecard", min: 20 },
    { t: "Benchmarks independientes", d: "Paper original, TabZilla, Florek y Zagdański, TabArena", min: 15 },
    { t: "Innovaciones 2022-2026", d: "Embeddings, texto, graph aggregated features, multiquantile, Polars", min: 30 },
    { t: "Ejercicios", d: "Lossguide, señal del embedding, calcers de texto, grafos aleatorios", min: 10, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "Árboles simétricos", sub: "La misma pregunta en todo el nivel" });
  L.sFormula(D, { title: "Oblivious trees: el árbol como tabla de decisión", formula: "hoja(x) = Σ_{l=0}^{d−1} 2ˡ · 1{ x_{jₗ} > bₗ }", fsize: 32,
    where: [["d", "Profundidad: d condiciones y 2ᵈ hojas"], ["jₗ, bₗ", "Variable y umbral del nivel l, iguales en todas las ramas"], ["Elección", "La partición que minimiza la pérdida sumada en todas las hojas del nivel"], ["Alternativas", "grow_policy = Depthwise (como XGBoost) o Lossguide (como LightGBM)"]],
    example: { h: "Primer árbol (profundidad 3) en el notebook", t: ["Nivel 0: EXT_SOURCE_2 > 0,39", "Nivel 1: RCI > 1,37", "Nivel 2: RCI > 0,65", "Hojas 2 y 3 vacías (RCI > 1,37 pero ≤ 0,65): el precio de la simetría", "Predicción por índice binario = CatBoost: verificado"] } });
  L.sStats(D, { title: "Por qué importa la simetría", stats: [
    { v: "0,08 s", l: "CatBoost: predecir 298 160 solicitudes (500 árboles, prof. 6)", color: L.HEX.green },
    { v: "1,7 s", l: "XGBoost: mismas solicitudes, árboles y profundidad", color: L.HEX.crimson },
    { v: "~20×", l: "Más rápido en inferencia en CPU", color: L.HEX.navy },
    { v: "Menos", l: "Sobreajuste: estructura más rígida = regularización", color: L.HEX.gold, size: 40 },
  ], points: ["La predicción es un cálculo de bits sin ramificaciones: vectoriza en CPU y GPU", "Importa en originación digital (respuesta en milisegundos) y en el recálculo masivo de la cartera para provisiones", "Costo: menos flexibilidad por árbol; se compensa con más árboles"] });

  L.sSection(D, { num: 2, title: "Hiperparámetros y regularización", sub: "Un modelo robusto con valores por defecto" });
  L.sTable(D, { title: "Los parámetros que gobiernan CatBoost", colW: [3.0, 6.6, 2.53], rowH: 0.58, fsize: 13,
    header: ["Parámetro", "Qué hace", "Por defecto"],
    rows: [["depth", "Profundidad del árbol simétrico (2ᵈ hojas)", "6"], ["l2_leaf_reg", "Penalización L2 de los valores de las hojas (como λ en XGBoost)", "3"], ["random_strength", "Ruido en el puntaje de las particiones candidatas", "1"],
      ["bootstrap_type / bagging_temperature", "MVS (guiado por gradientes) en CPU; Bayesian: pesos (−log U)ᵗ", "MVS; t = 1"], ["border_count", "Umbrales candidatos por variable numérica (cuantización)", "254 (CPU)"], ["one_hot_max_size", "Hasta ese número de niveles: one-hot; el resto con CTR", "2"],
      ["grow_policy", "SymmetricTree, Depthwise o Lossguide", "SymmetricTree"], ["learning_rate", "Se ajusta automáticamente según el tamaño de los datos", "auto"]] });
  L.sTable(D, { title: "Sensibilidad: todo cabe en ±0,4 puntos de AUC", colW: [3.6, 1.4, 1.9, 1.6, 1.5], rowH: 0.42, fsize: 13, w: 10.0,
    header: ["Configuración", "Árboles", "Log-loss valid.", "AUC 2025", "Segundos"],
    rows: [["Base (prof. 6, l2 = 3)", "214", "0,2235", "0,792", "12"], ["Profundidad 4", "391", "0,2235", "0,794", "12"], ["Profundidad 8", "150", "0,2241", "0,794", "15"], [B("l2_leaf_reg = 30", L.HEX.green), "382", "0,2231", B("0,795", L.HEX.green), "18"],
      ["random_strength = 0 / 5", "227 / 315", "0,2247 / 0,2235", "0,792 / 0,791", "13 / 15"], ["Bayesian, temperatura 0 / 5", "256 / 644", "0,2235 / 0,2259", "0,794 / 0,789", "14 / 30"], ["border_count = 32", "225", "0,2236", "0,793", "12"],
      ["Depthwise / Lossguide", "166 / 155", "0,2257 / 0,2252", "0,789 / 0,790", "6 / 6"], [B("one_hot_max_size = 255", L.HEX.crimson), "279", "0,2256", B("0,789", L.HEX.crimson), "6"]],
    side: ["Poca sensibilidad: una de sus fortalezas más citadas", "Más L2 ayuda algo", "Árboles no simétricos: más rápidos, algo peores", "One-hot de 180 agencias desperdicia la información que capturan las CTR"] });

  L.sSection(D, { num: 3, title: "CatBoost para PD", sub: "Las mismas herramientas de gobierno del Módulo 4" });
  L.sImage(D, { title: "Restricciones monotónicas: un comportamiento defendible", img: IMG + "c10_0.png",
    points: ["monotone_constraints: PD decreciente en EXT_SOURCE, creciente en RCI", "La curva ICE sin restricción baja en tramos donde la RCI sube", "Costo: 0,792 → 0,789 de AUC (−0,3 puntos)", "Para originación, el comité suele preferir el modelo monotónico"] });
  L.sTable(D, { title: "Calibración y SHAP en CatBoost", colW: [3.3, 1.7, 1.9, 1.5, 1.4], rowH: 0.6, fsize: 15, w: 9.8,
    header: ["Modelo (evaluado en 2S-2025)", "PD media", "Tasa observada", "Log-loss", "AUC"],
    rows: [["CatBoost monotónico", B("8,28 %", L.HEX.crimson), "5,91 %", "0,1912", "0,801"], [B("+ Platt (ajustado en 1S-2025)", L.HEX.green), "5,57 %", "5,91 %", B("0,1867"), "0,801"]],
    side: ["Mismo diagnóstico que el scorecard y XGBoost: 2025 es más benigno", "La recalibración corrige el nivel sin cambiar el orden", "ShapValues: contribuciones exactas; suma + base = log-odds (verificado)", "EMPLEADOR_ID y AGENCIA_ID aparecen como contribuciones directas → razones de rechazo"] });
  L.sTable(D, { title: "Comparación final fuera de tiempo 2025", colW: [4.8, 1.8, 1.6, 1.7, 1.6], rowH: 0.6, fsize: 15, w: 11.5,
    header: ["Modelo", "AUC 2025", "Gini", "Log-loss", "Segundos"],
    rows: [[B("CatBoost (categóricas en bruto)", L.HEX.green), B("0,792"), "0,584", "0,192", "11"], ["CatBoost monotónico", "0,789", "0,578", "0,193", "—"], ["XGBoost (categóricas nativas)", "0,775", "0,550", "0,196", "3"], ["Scorecard logístico (Módulo 3)", "0,772", "0,543", "0,197", "—"], [B("CatBoost solo numéricas", L.HEX.crimson), B("0,751", L.HEX.crimson), "0,503", "0,203", "1"]],
    note: "Sin las categóricas de alta cardinalidad, CatBoost no supera al scorecard. Su ventaja (~2 puntos) viene de extraer la información de empleador, agencia y comercio con TS ordenadas." });

  L.sSection(D, { num: 4, title: "Benchmarks independientes", sub: "XGBoost vs. CatBoost según distintas organizaciones" });
  L.sTable(D, { title: "Lo que dicen los benchmarks", colW: [3.2, 2.9, 6.03], rowH: 0.9, fsize: 12,
    header: ["Estudio", "Alcance", "Resultado principal"],
    rows: [[B("Prokhorenkova et al. (Yandex), NeurIPS 2018"), "9 datasets, varios con categóricas", "CatBoost gana en todos; XGBoost: +17 % de log-loss en Amazon, +11 % en Epsilon, +7,9 % en KDD Internet, +3,2 % en Kick"],
      [B("McElfresh et al., NeurIPS 2023 (TabZilla)"), "19 algoritmos, 176 datasets (tabla 1: 98)", "Rango medio: CatBoost 5,50; TabPFN 5,89; XGBoost 6,87; ResNet 7,65; RandomForest 8,26; LightGBM 8,46"],
      [B("Florek y Zagdański (2023)"), "12 datasets; con y sin tuning", "Sin tuning, XGBoost y CatBoost son los mejores en AUC; con tuning, LightGBM es el más consistente y rápido"],
      [B("Erickson et al., TabArena (NeurIPS 2025)"), "51 datasets curados, 16 modelos", "CatBoost 1.º con tuning estándar; con ensembles post-hoc: TabM, LightGBM, RealMLP, CatBoost (4.º), XGBoost (5.º)"],
      [B("Paper original, tabla 6"), "Tiempo por árbol (Epsilon)", "CatBoost Plain 1,1 s; Ordered 1,9 s; XGBoost 3,9 s; LightGBM 1,1 s"]] });
  L.sCards(D, { title: "Cómo leer los benchmarks", cols: 3, cards: [
    { h: "Robusto por defecto", t: ["CatBoost es de los mejores con configuración por defecto o tuning ligero", "Menos costo de tuning y de gobierno"] },
    { h: "Brilla con categóricas", t: ["Mayor ventaja en Amazon, Kick, KDD", "Con datos puramente numéricos, las diferencias con XGBoost y LightGBM son pequeñas"] },
    { h: "No hay ganador universal", t: ["Con tuning intensivo y ensembles, otros modelos lo alcanzan", "En la cartera: XGBoost con TS ordenada empata con CatBoost"] },
  ] });

  L.sSection(D, { num: 5, title: "Innovaciones 2022-2026", sub: "Nuevos tipos de variables de entrada" });
  L.sTable(D, { title: "Innovaciones de CatBoost (1.1 → 1.2.10)", colW: [2.0, 6.3, 3.83], rowH: 0.44, fsize: 12,
    header: ["Versión", "Innovación", "Uso en riesgo de crédito"],
    rows: [[B("1.1 · sep 2022"), "Regresión multiquantile; texto y embeddings para regresión y ranking", "Cuantiles de LGD o ingreso"], [B("1.1.1 · nov 2022"), "Embeddings en el aplicador C/C++; API tipo DataFrame en Spark", "Despliegue con embeddings"],
      [B("1.2 · may 2023"), "Focal loss; RMSEWithUncertainty en GPU; MultiLogloss con texto", "Eventos raros; incertidumbre"], [B("1.2.1 · ago 2023"), "Kernel gradient boosting; MultiRMSE en GPU", "Muestreo de modelos"],
      [B("1.2.3 · feb 2024"), "Python 3.12, Spark 3.5, target booleano", "—"], [B("1.2.5 · abr 2024"), "Métricas personalizadas en GPU", "—"],
      [B("1.2.6 · sep 2024", L.HEX.crimson), "Graph aggregated features; objetivos personalizados en GPU; GroupQuantile", "Redes de clientes"], [B("1.2.8 · abr 2025"), "Python 3.13 y NumPy 2", "Compatibilidad del stack"],
      [B("1.2.9 · feb 2026"), "Entrada Polars; Python 3.14; carga zero-copy (mmap); Lossguide más rápido", "Pipelines modernos, baja latencia"], [B("1.2.10 · feb 2026"), "Spark 4.0 y 4.1; predictTransposed en JVM", "Scoring masivo distribuido"]],
    note: "Fuente: notas de versión de CatBoost (GitHub) y documentación en catboost.ai." });
  L.sCompare(D, { title: "Embeddings y texto como variables de entrada", left: { h: "embedding_features", icon: "E", items: ["Columnas cuyo valor es un vector denso (transacciones, descripción del negocio, imagen de un documento)", "Calcers por defecto: LDA (proyección discriminante) y KNN (vecinos de cada clase)", "Calculados con el mismo esquema ordenado", "En el caso (simulado, señal débil): AUC 0,792 → 0,794; el embedding es la 8.ª variable"] },
    right: { h: "text_features", icon: "T", items: ["Tokenizador → diccionarios de unigramas y bigramas → calcers", "Calcers: BoW, NaiveBayes, BM25", "Sin preprocesamiento externo", "En el caso: campo libre \"destino del crédito\" (simulado): AUC 0,792 → 0,795"] },
    verdict: "CatBoost integra datos no estructurados en el mismo modelo tabular; el valor depende de la señal real que tengan esos datos, y deben estar disponibles al momento de la decisión." });
  L.sFormula(D, { title: "Graph aggregated features (1.2.6, basado en TabGraphs)", formula: "mean / max / min { Fᵢ(u) : (v, u) ∈ G }   para cada variable numérica Fᵢ", fsize: 24,
    where: [["G", "Lista de aristas [u, v] entre observaciones (índices de fila)"], ["Resultado", "3 variables nuevas por variable numérica: 36 en el caso"], ["Requisitos", "group_id con grupos contiguos; datos como arreglo NumPy; el grafo también al predecir"], ["Casos de uso", "Referidos, avales, compañeros de trabajo, transferencias, datos compartidos (fraude)"]],
    example: { h: "Red de referidos por agencia (simulada)", t: ["Sin grafo: AUC 0,792", "Red aleatoria: 0,791 (no aporta)", "Red con homofilia (h = 0,3): 0,802", "Mean de EXT_SOURCE_2 de los vecinos entre las 4 variables más importantes", "El valor depende de que exista homofilia"] },
    notes: "Cuidados: construir la red solo con información previa a la decisión, evitar que las variables de los vecinos incorporen sus desenlaces futuros, y revisar equidad y protección de datos personales." });
  L.sQuestion(D, { q: "Tu banco puede construir una red de clientes con las transferencias entre cuentas. ¿Qué validarías antes de usarla como variable en el modelo de originación?",
    hint: "homofilia real (¿el riesgo de los contactos predice el propio?), disponibilidad al momento de la decisión, fuga temporal, explicabilidad ante el cliente rechazado, equidad y normativa de datos personales." });

  D.sec("Ejercicios y cierre");
  L.sLab(D, { notebook: "M05_S02_CatBoost_Arboles_Simetricos_Benchmarks_e_Innovaciones.ipynb", data: ["hc_application_sintetico.csv", "CatBoost 1.2.10 · XGBoost 3.4.1", "Embedding, texto y red: simulados"], steps: [
    { h: "Árbol simétrico", t: "Lectura del JSON y predicción por índice binario" },
    { h: "Velocidad de inferencia", t: "CatBoost vs. XGBoost en ~300 000 solicitudes" },
    { h: "Grilla de hiperparámetros", t: "depth, L2, random_strength, bootstrap, grow_policy, one-hot" },
    { h: "PD con CatBoost", t: "Monotonicidad, Platt, SHAP y comparación final" },
    { h: "Embeddings y texto", t: "embedding_features (LDA, KNN) y text_features" },
    { h: "Grafos", t: "Red aleatoria vs. red con homofilia" },
  ] });
  L.sTakeaways(D, { title: "Cierre del Módulo 5", items: [
    "CatBoost resuelve la fuga de información en categóricas (TS ordenadas) y en el boosting (ordered boosting).",
    "Los árboles simétricos regularizan y hacen la inferencia muy rápida.",
    "Es robusto con valores por defecto: los benchmarks lo ubican entre los mejores sin tuning intensivo.",
    "Su ventaja es grande con categóricas ricas y pequeña sin ellas; compáralo siempre con un scorecard y con XGBoost bien codificado.",
    "Embeddings, texto y grafos amplían las fuentes de información, con exigencias adicionales de gobierno.",
  ], next: "Módulo 6 · Optimización bayesiana de hiperparámetros con Optuna." });
  await L.save(D, OUT);
})();
