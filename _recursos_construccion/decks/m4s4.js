const L = require("./lib");
const OUT = process.argv[2];
const IMG = "/home/claude/curso/img/m4s4/";
const B = (t, c) => ({ text: t, options: { bold: true, color: c || L.HEX.navy } });

(async () => {
  const D = L.newDeck({ title: "M4 S4 - XGBoost: derivación, aplicación e innovaciones", footer: "DataBank Academy · Módulo 4 · Sesión 4 · XGBoost (Chen y Guestrin, 2016) y sus innovaciones 2.0 → 3.4" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 4 · SESIÓN 4 DE 4", title: "XGBoost: derivación, aplicación a PD e innovaciones recientes",
    subtitle: "Chen y Guestrin (2016), \"XGBoost: A Scalable Tree Boosting System\", arXiv 1603.02754", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Notebook ejecutado con XGBoost 3.4.1. Las innovaciones se revisan desde la versión 2.0 (septiembre 2023) hasta la 3.4 (agosto 2026)." });
  L.sAgenda(D, { items: [
    { t: "Derivación del objetivo regularizado", d: "Expansión de segundo orden, pesos óptimos y ganancia", min: 25 },
    { t: "Reproducir un árbol de XGBoost", d: "Gain, pesos, cover y dirección de faltantes calculados a mano", min: 15 },
    { t: "Búsqueda de particiones y diseño del sistema", d: "Exact, aproximado, sketch ponderado, sparsity, hist; GB vs. XGBoost", min: 15 },
    { t: "XGBoost para PD", d: "Early stopping, regularización, restricciones, calibración, SHAP", min: 30 },
    { t: "Innovaciones 2.0 → 3.4", d: "Multi-salida, cuantiles, memoria externa, categóricas, expectiles", min: 25 },
    { t: "Comparación final y ejercicios", d: "XGBoost vs. scorecard fuera de tiempo", min: 10, lab: true },
  ] });

  L.sSection(D, { num: 1, title: "El objetivo regularizado", sub: "Boosting de segundo orden con penalización explícita" });
  L.sFormula(D, { title: "Objetivo y expansión de Taylor de segundo orden", formula: "L⁽ᵗ⁾ ≈ Σᵢ [gᵢ fₜ(xᵢ) + ½ hᵢ fₜ²(xᵢ)] + Ω(fₜ)        Ω(f) = γT + ½λ‖w‖² + α‖w‖₁", fsize: 22,
    where: [["gᵢ, hᵢ", "Primera y segunda derivada de la pérdida en ŷᵢ⁽ᵗ⁻¹⁾"], ["Logística", "gᵢ = pᵢ − yᵢ;  hᵢ = pᵢ(1 − pᵢ)"], ["T, w", "Número de hojas y vector de pesos del árbol"], ["γ, λ, α", "Penalización por hoja, ridge y lasso sobre los pesos"], ["Agrupando", "Σⱼ [Gⱼwⱼ + ½(Hⱼ + λ)wⱼ²] + γT, con Gⱼ = Σ gᵢ y Hⱼ = Σ hᵢ en la hoja j"]],
    example: { h: "La diferencia con Friedman", t: ["Friedman: árbol por MCO a los pseudo-residuos (primer orden); Newton solo en las hojas", "XGBoost: el criterio de partición usa g y h y la penalización Ω", "La estructura del árbol y sus pesos salen del mismo objetivo"] } });
  L.sFormula(D, { title: "Pesos óptimos y ganancia de una partición (ecuaciones 5-7)", formula: "wⱼ* = −Gⱼ / (Hⱼ + λ)        Gain = ½ [ G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ) ] − γ", fsize: 22,
    where: [["wⱼ*", "Paso de Newton encogido por λ: hojas con poca curvatura (pocos malos) pesan menos"], ["Score", "−½ Σⱼ Gⱼ²/(Hⱼ+λ) + γT mide la calidad de una estructura"], ["Gain", "Mejora del objetivo al partir; si Gain < 0 no se parte (γ poda)"], ["α", "Soft-thresholding de G: w = −sign(G)·max(|G|−α, 0)/(H+λ)"]],
    example: { h: "Nota práctica", t: ["El \"gain\" que reporta XGBoost omite el ½ y no resta γ", "cover = Σ hᵢ = Σ p(1−p): la \"cantidad de información\" de la hoja, no el número de clientes"] } });
  L.sTable(D, { title: "Cada hiperparámetro tiene un lugar en las ecuaciones", colW: [2.8, 5.2, 4.13], rowH: 0.62, fsize: 14,
    header: ["Parámetro", "Rol en las ecuaciones", "Lectura en riesgo de crédito"],
    rows: [["reg_lambda (λ)", "Encoge los pesos: w* = −G/(H + λ)", "PD de segmentos pequeños más cerca del promedio"], ["reg_alpha (α)", "Soft-thresholding de G", "Hojas con poca evidencia → peso 0"], ["gamma (γ)", "Ganancia mínima para partir", "Poda: menos segmentos espurios"],
      ["min_child_weight", "H mínimo por hoja: Σ p(1−p)", "Protege hojas con muy pocos malos"], ["max_delta_step", "Tope a |wⱼ|", "Útil con clases muy desbalanceadas"], ["learning_rate (η)", "Shrinkage de Friedman: ŷ⁽ᵗ⁾ = ŷ⁽ᵗ⁻¹⁾ + η fₜ", "Pasos pequeños + early stopping"]] });

  L.sSection(D, { num: 2, title: "Reproducir un árbol de XGBoost", sub: "Si podemos calcularlo a mano, podemos auditarlo" });
  L.sStats(D, { title: "Un árbol de XGBoost 3.4.1 reproducido exactamente", stats: [
    { v: "2 219,98", l: "Gain de la raíz (EXT_SOURCE_2 < 0,3902): igual al de XGBoost", color: L.HEX.navy, size: 40 },
    { v: "+1,7437", l: "Peso hoja izquierda (−G/(H+λ)); cover 625,4", color: L.HEX.crimson, size: 40 },
    { v: "−0,2887", l: "Peso hoja derecha; cover 3 782,2", color: L.HEX.green, size: 40 },
    { v: "Derecha", l: "Dirección aprendida para faltantes: la que da más ganancia", color: L.HEX.gold, size: 40 },
  ], points: ["Implementación propia: g = p − y, h = p(1 − p) desde la PD inicial; se recorren los cortes ordenados acumulando G y H", "Los faltantes se prueban en ambos lados (algoritmo 3, sparsity-aware) y se elige el que maximiza la ganancia", "Auditoría: cada peso y cada corte del modelo de producción se pueden recalcular con sumas de g y h"] });

  L.sSection(D, { num: 3, title: "Búsqueda de particiones y diseño del sistema", sub: "Por qué XGBoost escala" });
  L.sTable(D, { title: "Del algoritmo exacto a los histogramas", colW: [3.4, 6.0], rowH: 0.6, fsize: 14, w: 9.4,
    header: ["Componente (paper)", "Idea"],
    rows: [["Exact greedy (algoritmo 1)", "Enumera todos los cortes; costoso con datos grandes"], ["Aproximado (algoritmo 2)", "Cortes candidatos por percentiles; estadísticas agregadas por cubetas"], ["Weighted quantile sketch (3.3)", "Percentiles ponderados por hᵢ: la pérdida de 2.º orden es un MCO ponderado por hᵢ"],
      ["Sparsity-aware (algoritmo 3)", "Dirección por defecto para faltantes y ceros; solo recorre los no faltantes"], ["Bloques por columna (4.1)", "Datos preordenados y comprimidos, reutilizados en cada iteración"], ["Cache-aware y out-of-core (4.2-4.3)", "Prefetching, compresión y sharding en disco"], [B("hist (actual)"), "Histogramas de gradientes con cubetas fijas: método por defecto desde 2.0"]],
    side: ["En la cartera (200 árboles, profundidad 4):", "exact: 2,99 s · AUC entren. 0,774", "approx: 2,38 s · 0,778", "hist: 0,28 s · 0,778", "hist es ~10 veces más rápido sin perder calidad"] });
  L.sTable(D, { title: "Gradient boosting (Friedman) vs. XGBoost", colW: [2.6, 4.6, 4.93], rowH: 0.7, fsize: 14,
    header: ["Aspecto", "Gradient boosting (2001)", "XGBoost (2016)"],
    rows: [["Aproximación", "Primer orden: árbol a los pseudo-residuos", B("Segundo orden: g y h en el criterio de partición")], ["Criterio de partición", "MCO sobre residuos; Newton solo en hojas", "Ganancia derivada del objetivo regularizado"], ["Regularización", "Shrinkage, submuestreo, tamaño del árbol", B("Ω = γT + ½λ‖w‖² + α‖w‖₁ + shrinkage + submuestreo de filas y columnas")],
      ["Faltantes", "Imputación previa", B("Dirección por defecto aprendida")], ["Escalabilidad", "Secuencial", "Paralelo, sketch, histogramas, bloques, out-of-core, GPU, distribuido"], ["Restricciones", "—", B("Monotónicas y de interacción")]] });

  L.sSection(D, { num: 4, title: "XGBoost para PD", sub: "Entrenamiento 2022-2023, validación 2024, prueba fuera de tiempo 2025" });
  L.sImage(D, { title: "Early stopping: el número de árboles lo decide la validación", img: IMG + "c09_0.png",
    points: ["η = 0,03; la log-loss de validación 2024 deja de mejorar en el árbol 193", "El error de entrenamiento sigue bajando: sin early stopping, sobreajuste", "AUC fuera de tiempo 2025: 0,766 · Gini 0,532", "Validar en un período distinto al de entrenamiento (2024), no en una partición aleatoria"] });
  L.sTable(D, { title: "La regularización importa más que la capacidad", colW: [3.4, 1.6, 2.0, 1.8], rowH: 0.5, fsize: 14, w: 8.8,
    header: ["Configuración", "Árboles", "Log-loss valid.", "AUC 2025"],
    rows: [["Base (λ = 1, prof. 4)", "193", "0,2346", "0,766"], ["λ = 20", "268", "0,2338", "0,768"], [B("α = 5", L.HEX.green), "363", "0,2323", B("0,775", L.HEX.green)], ["γ = 2", "200", "0,2347", "0,767"], ["min_child_weight = 50", "258", "0,2340", "0,770"], ["Profundidad 2", "846", "0,2315", "0,772"], [B("Profundidad 8", L.HEX.crimson), "101", "0,2357", "0,758"], [B("Sin submuestreo", L.HEX.crimson), "173", "0,2377", "0,754"]],
    side: ["Árboles más simples (prof. 2) y lasso sobre los pesos (α) son lo que más ayuda", "Más profundidad empeora: la estructura de esta cartera es casi aditiva", "El submuestreo de filas y columnas aporta ~1 punto de AUC", "Moraleja: en PD minorista, XGBoost rinde mejor cuanto más se parece a un modelo aditivo regularizado"] });
  L.sImage(D, { title: "Restricciones monotónicas y de interacción", img: IMG + "c13_1.png",
    points: ["monotone_constraints: la PD no puede bajar si sube la RCI, ni subir si mejora EXT_SOURCE", "La curva ICE sin restricción tiene tramos que un comité no aceptaría; con restricción es escalonada pero coherente", "AUC 2025: 0,766 → 0,771 con monotonicidad: la restricción ayuda, no cuesta", "interaction_constraints (scores externos solo entre sí; demográficas entre sí): 0,775", "Ambas son controles de gobierno: hacen el modelo defendible ante validación y regulador"] });
  L.sTable(D, { title: "Calibración: XGBoost ordena bien, pero su PD también se desplaza", colW: [3.6, 1.7, 1.9, 1.6, 1.6, 1.4], rowH: 0.62, fsize: 15,
    header: ["Modelo (evaluado en 2S-2025)", "PD media", "Tasa observada", "Brier", "Log-loss", "AUC"],
    rows: [["XGBoost monotónico", B("8,11 %", L.HEX.crimson), "5,91 %", "0,0511", "0,1947", "0,785"], [B("+ Platt", L.HEX.green), "5,62 %", "5,91 %", B("0,0503"), B("0,1913"), "0,785"], ["+ isotónica", "5,61 %", "5,91 %", "0,0505", "0,1952", "0,783"]],
    note: "Recalibración ajustada en el 1S-2025 y evaluada en el 2S-2025, igual que el scorecard del Módulo 3. El mismo problema y la misma solución: el nivel se corrige sin tocar el orden." });
  L.sTable(D, { title: "SHAP: explicación aditiva de cada predicción", colW: [3.6, 2.0, 2.0, 2.0], rowH: 0.48, fsize: 14, w: 9.6,
    header: ["Contribución (log-odds)", "Cliente 1", "Cliente 2", "Cliente 3"],
    rows: [["Sesgo (base)", "−2,284", "−2,284", "−2,284"], ["EXT_SOURCE_2", "+0,026", B("−1,014", L.HEX.green), "−0,049"], ["AGENCIA_ID", "+0,058", "+0,253", B("+0,323", L.HEX.crimson)], ["NAME_EDUCATION_TYPE", "−0,289", "−0,159", "−0,305"], ["REGION_RATING_CLIENT", "−0,040", "+0,072", "−0,305"], ["OCCUPATION_TYPE", "−0,102", "−0,252", "−0,062"], ["ANTIG", "+0,013", "−0,178", "−0,153"]],
    side: ["pred_contribs=True: TreeSHAP nativo", "Suma de contribuciones = log-odds predicho (verificado)", "Base para reason codes de un modelo no lineal", "AGENCIA_ID entra como categórica nativa", "Detalle completo en el Módulo 7"] });

  L.sSection(D, { num: 5, title: "Innovaciones 2.0 → 3.4", sub: "Lo que cambió en XGBoost en los últimos tres años" });
  L.sTable(D, { title: "Innovaciones de XGBoost (2023-2026)", colW: [1.9, 6.0, 4.23], rowH: 0.56, fsize: 12,
    header: ["Versión", "Innovación", "Relevancia en riesgo de crédito"],
    rows: [[B("2.0 · sep 2023"), "device unificado (cpu/cuda); hist por defecto; árboles multi-salida; regresión por cuantiles (reg:quantileerror); intercepto automático", "Un código para CPU y GPU; cuantiles para LGD, EAD o ingresos"],
      [B("2.1 · jun 2024"), "Entrada nativa de DataFrames (pandas, Arrow); UBJSON por defecto; aprendizaje federado", "Menos conversiones; despliegue más robusto"],
      [B("3.0 · feb 2025"), "ExtMemQuantileDMatrix: memoria externa rápida en CPU, GPU y distribuida", "Entrenar carteras que no caben en memoria"],
      [B("3.1 · sep 2025"), "Re-codificador de categorías guardado en el modelo; soporte categórico estable; se eliminan gpu_hist y gpu_id", "Consistencia entrenamiento–producción"],
      [B("3.2 · feb 2026"), "Árboles vector-leaf ampliados (incluye cuantiles); muestreo basado en gradientes en CPU", "Varios cuantiles en un solo árbol"],
      [B("3.3 · jun 2026"), "Expectiles (reg:expectileerror); categóricas activadas por defecto; QuadratureTreeSHAP; RNG serializado (reproducible); gblinear deprecado", "Reproducibilidad para auditoría; SHAP más estable"],
      [B("3.4 · ago 2026"), "Vector-leaf completo: categóricas, DART, restricciones monotónicas y de interacción", "Multi-salida que cumple restricciones regulatorias"]],
    note: "Fuente: notas de versión en xgboost.readthedocs.io (changes v2.0 a v3.4). Todas se prueban en el notebook con la versión 3.4.1." });
  L.sCards(D, { title: "Tres innovaciones verificadas en código", cols: 3, cards: [
    { h: "Re-codificador de categorías", t: ["Producción envía las categorías en otro orden", "PD idénticas: [0,070 0,027 0,058 0,106 0,016]", "Elimina un error clásico de MLOps"] },
    { h: "Muestreo reproducible", t: ["El estado del generador aleatorio se guarda con el modelo", "Dos entrenamientos con la misma semilla: modelos idénticos", "Requisito de auditoría y validación"] },
    { h: "Cuantiles y expectiles", t: ["Un solo modelo vector-leaf estima los cuantiles 10-90 % del ingreso", "Capacidad de pago con incertidumbre", "Expectiles: alternativa suave con pérdida asimétrica"] },
  ] });
  L.sImage(D, { title: "Cuantiles del ingreso en un solo árbol multi-salida", img: IMG + "c20_2.png",
    points: ["reg:quantileerror con multi_strategy=\"multi_output_tree\": un árbol, varios cuantiles", "Uso: ingreso conservador (p10) para la RCI, no solo el ingreso medio", "Expectiles 10 % y 90 % (3.3): mismo objetivo con una pérdida cuadrática asimétrica", "Aplicaciones: LGD (Módulo 9), EAD de tarjetas, estrés de capacidad de pago"] });

  L.sSection(D, { num: 6, title: "Comparación final", sub: "¿Reemplaza XGBoost al scorecard?" });
  L.sTable(D, { title: "Fuera de tiempo 2025: el scorecard sigue siendo competitivo", colW: [4.6, 2.0, 1.8, 1.8], rowH: 0.62, fsize: 15, w: 10.2,
    header: ["Modelo", "AUC 2025", "Gini", "Log-loss"],
    rows: [[B("Scorecard logístico (WoE, Módulo 3)", L.HEX.green), B("0,772"), "0,543", "0,197"], ["XGBoost sin restricciones", "0,766", "0,532", "0,199"], ["XGBoost monotónico", "0,771", "0,542", "0,198"], ["XGBoost con α = 5 (mejor regularizado)", "0,775", "—", "—"]],
    note: "En esta cartera sintética las relaciones son casi monotónicas y aditivas: un buen scorecard es difícil de batir. La ventaja del boosting aparece con interacciones reales, muchas variables o datos alternativos.",
    notes: "Este resultado es pedagógico: no hay que asumir que el modelo más complejo gana. La decisión champion–challenger incluye explicabilidad, estabilidad, calibración, costo de mantenimiento y gobierno." });
  L.sQuestion(D, { q: "Si XGBoost gana 0,3 puntos de AUC sobre el scorecard, ¿lo pondrías en producción para originación?",
    hint: "valor económico de 0,3 puntos (Módulo 3, curva de utilidad), costo de explicar rechazos, monitoreo, riesgo de modelo y la opción de usarlo como challenger o para segmentos específicos." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M04_S04_XGBoost_Derivacion_Aplicacion_e_Innovaciones.ipynb", data: ["hc_application_sintetico.csv", "XGBoost 3.4.1 · train 2022-23, valid 2024, test 2025"], steps: [
    { h: "Reproducir un árbol", t: "g, h, Gain, pesos, cover y faltantes a mano" },
    { h: "Métodos de partición", t: "exact vs. approx vs. hist" },
    { h: "PD con XGBoost", t: "Early stopping, grilla de regularización, restricciones" },
    { h: "Calibración y SHAP", t: "Platt e isotónica; contribuciones aditivas" },
    { h: "Innovaciones", t: "Recoder de categorías, cuantiles multi-salida, expectiles, reproducibilidad" },
    { h: "Comparación", t: "XGBoost vs. scorecard del Módulo 3" },
  ] });
  L.sTakeaways(D, { title: "Cierre del Módulo 4", items: [
    "CART da el ladrillo; bagging y random forest reducen su varianza; el boosting reduce el sesgo sumando árboles pequeños.",
    "XGBoost es boosting de segundo orden con regularización explícita: pesos −G/(H+λ) y ganancia derivada del objetivo.",
    "Su ingeniería (hist, sparsity, sketch, memoria externa, GPU) explica su adopción masiva.",
    "En PD minorista: early stopping temporal, regularización, monotonicidad, calibración y SHAP son obligatorios.",
    "Más complejo no siempre es mejor: compara siempre contra un buen scorecard fuera de tiempo.",
  ], next: "Módulo 5 · CatBoost y el tratamiento de variables categóricas." });
  await L.save(D, OUT);
})();
