const L = require("./lib");
const OUT = process.argv[2];
const IMG = "/home/claude/curso/img/m4s1/";

(async () => {
  const D = L.newDeck({ title: "M4 S1 - Árboles de decisión: CART", footer: "DataBank Academy · Módulo 4 · Sesión 1 · Árboles de decisión y CART (Breiman et al., 1984)" });
  D.sec("Apertura");
  L.sTitle(D, { kicker: "MÓDULO 4 · SESIÓN 1 DE 4", title: "Árboles de decisión: el algoritmo CART",
    subtitle: "Impureza, priors y costos, particiones categóricas, poda por costo-complejidad y surrogates", meta: "Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista · DataBank Academy · 2027",
    notes: "Referencia central: Breiman, Friedman, Olshen y Stone (1984), Classification and Regression Trees. Todo lo que veamos hoy se implementa desde cero en el notebook y se compara con scikit-learn." });
  L.sAgenda(D, { items: [
    { t: "Por qué árboles en riesgo de crédito", d: "Segmentación, interacciones y los cuatro elementos de CART", min: 10 },
    { t: "Impureza y criterio de partición", d: "Gini, entropía, error; ΔI y el ejemplo de Breiman", min: 20 },
    { t: "Priors, costos y variables categóricas", d: "Costos asimétricos de un mal aprobado; teorema de orden por PD", min: 20 },
    { t: "Poda por costo-complejidad", d: "Weakest link, validación cruzada y regla 1-SE", min: 20 },
    { t: "Surrogates, importancia y límites del árbol", d: "Faltantes, importancia de variables, inestabilidad", min: 10 },
    { t: "Laboratorio", d: "CART desde cero vs. scikit-learn sobre la cartera de consumo", min: 40, lab: true },
  ] });
  L.sCards(D, { title: "Al terminar la sesión podrás", cols: 2, cards: [
    { h: "Derivar el criterio de partición", t: "Calcular a mano la reducción de impureza ΔI y explicar por qué Gini y entropía se prefieren a la tasa de error." },
    { h: "Incorporar costos y priors", t: "Traducir el costo de aprobar a un mal pagador en priors alterados o pesos de clase." },
    { h: "Podar con criterio estadístico", t: "Encontrar la secuencia de subárboles óptimos y elegir uno con validación cruzada y la regla 1-SE." },
    { h: "Reconocer fortalezas y límites", t: "Usar el árbol como herramienta de segmentación y entender por qué su inestabilidad motiva los ensembles." },
  ] });

  L.sSection(D, { num: 1, title: "Por qué árboles", sub: "La segmentación como modelo" });
  L.sCards(D, { title: "El árbol: un modelo que el comité ya conoce", cols: 2, cards: [
    { h: "Segmentación natural", t: ["Reglas \"si… entonces\" como las políticas de crédito", "Cada hoja es un segmento con su PD", "Base histórica de los scorecards segmentados"] },
    { h: "No paramétrico", t: ["No supone linealidad ni monotonicidad", "Invariante a transformaciones monótonas (no requiere WoE ni escalado)", "Robusto a valores extremos en las variables"] },
    { h: "Interacciones automáticas", t: ["Una partición dentro de otra es una interacción", "Ej.: la edad importa solo si EXT_SOURCE_2 es bajo"] },
    { h: "Pero inestable", t: ["Pequeños cambios en los datos cambian el árbol", "Predicción escalonada y discriminación modesta", "Motivación directa de bagging y boosting (S2-S4)"] },
  ] });
  L.sFlow(D, { title: "Los cuatro elementos de CART (Breiman et al., cap. 2)", steps: [
    { h: "Preguntas", t: ["Particiones binarias: ¿xⱼ ≤ c?", "Categóricas: ¿xⱼ ∈ S?", "Se buscan todas las variables y todos los cortes"] },
    { h: "Criterio de partición", t: ["Elegir la que más reduce la impureza i(t)", "Búsqueda codiciosa (greedy), un nodo a la vez"] },
    { h: "Tamaño del árbol", t: ["Crecer un árbol grande", "Podarlo por costo-complejidad", "Elegir con validación cruzada"] },
    { h: "Asignación de hojas", t: ["Clase con menor costo esperado", "En riesgo: la PD de la hoja (proporción de malos)"] },
  ], note: "Breiman et al. cambiaron la pregunta: en lugar de buscar una regla de parada, crecer de más y podar hacia atrás." });

  L.sSection(D, { num: 2, title: "Impureza y criterio de partición", sub: "¿Qué pregunta separa mejor a buenos y malos?" });
  L.sFormula(D, { title: "Impureza de un nodo y reducción por una partición", formula: "ΔI(s, t) = i(t) − p_L · i(t_L) − p_R · i(t_R)", fsize: 30,
    where: [["Gini", "i(t) = Σⱼ p(j|t)(1 − p(j|t)) = 2p(1 − p) con dos clases"], ["Entropía", "i(t) = −Σⱼ p(j|t) log p(j|t)"], ["Error", "i(t) = 1 − maxⱼ p(j|t)"], ["p_L, p_R", "Proporción de casos del nodo que va a cada hijo"], ["s*", "Partición elegida: argmax ΔI(s, t) sobre variables y cortes"]],
    example: { h: "Ejemplo de Breiman (sección 4.1)", t: ["Nodo: 400 buenos, 400 malos", "s₁ → (300,100) | (100,300)", "s₂ → (200,400) | (200,0)", "Error: ΔI = 0,25 en ambas", "Gini: 0,125 (s₁) vs. 0,167 (s₂)", "Gini premia el nodo puro (200, 0)"] },
    notes: "La tasa de error no es estrictamente cóncava: no distingue particiones que crean nodos puros. Gini y entropía sí, por eso se usan para crecer el árbol." });
  L.sImage(D, { title: "Las funciones de impureza: concavidad estricta", img: IMG + "c04_0.png",
    points: ["Gini y entropía son estrictamente cóncavas: cualquier partición no trivial reduce la impureza", "La tasa de error es lineal por tramos: muchas particiones útiles tienen ΔI = 0", "En la práctica Gini y entropía producen árboles muy parecidos; la elección importa menos que la poda"] });
  L.sTable(D, { title: "CART desde cero sobre la cartera de consumo", colW: [4.4, 1.6, 1.6, 1.8], rowH: 0.5, fsize: 14, w: 9.4,
    header: ["Nodo (profundidad 3)", "Clientes", "PD", "ΔI Gini"],
    rows: [["Raíz: EXT2 ≤ 0,372", "45 092", "8,7 %", "0,0062"], ["EXT2 ≤ 0,220", "5 800", "23,2 %", "0,0100"], ["  EXT3 ≤ 0,132 (hoja izquierda)", "234", { text: "55,6 %", options: { bold: true, color: L.HEX.crimson } }, "—"], ["  EDAD ≤ 39,9", "4 654", "19,7 %", "0,0049"],
      ["EXT2 ≤ 0,592", "39 292", "6,5 %", "0,0018"], ["  EXT3 ≤ 0,288", "14 735", "10,5 %", "0,0017"]],
    side: ["La implementación propia (≈ 40 líneas) reproduce exactamente las particiones de DecisionTreeClassifier", "Las PD de las hojas van de 2,5 % a 55,6 %: el árbol es un segmentador", "Pero solo 1 de 8 hojas se clasifica como \"malo\" con la regla de mayoría: hace falta incorporar costos"],
    note: "Fuente: notebook M04_S01, secciones 2-3. Desarrollo 2022-2024 (45 092 clientes, tasa de malos 8,69 %)." });

  L.sSection(D, { num: 3, title: "Priors, costos y variables categóricas", sub: "Aprobar a un mal pagador cuesta más que rechazar a un buen pagador" });
  L.sFormula(D, { title: "Costos de mala clasificación como priors alterados", formula: "π′(j) = C(j) · π(j) / Σₖ C(k) · π(k)          C(j) = Σᵢ C(i | j)", fsize: 24,
    where: [["π(j)", "Prior de la clase j (proporción en la población)"], ["C(i | j)", "Costo de clasificar como i a un caso de clase j"], ["π′(j)", "Prior alterado: el árbol se construye como si los malos fueran más frecuentes"], ["Equivalencia", "class_weight en scikit-learn = pesos proporcionales a C(j)"]],
    example: { h: "En el caso", t: ["Priors originales: 91,3 % / 8,7 %", "Priors alterados: 59,1 % / 40,9 %", "Hojas clasificadas \"malo\": 1 de 8 → 3 de 8", "Rechazo: 0,4 % → 10,3 %", "AUC fuera de tiempo: 0,707 → 0,723"] },
    notes: "Breiman et al., sección 4.4: los costos se pueden incorporar alterando los priors. Esto conecta con el Módulo 1: el costo de un mal es la pérdida (LGD × monto) y el de un bueno rechazado es el margen perdido." });
  L.sStats(D, { title: "Variables categóricas: el teorema de orden (Breiman et al., teorema 4.5)", stats: [
    { v: "4 095", l: "Particiones binarias posibles de 13 categorías (2¹²−1)", color: L.HEX.crimson },
    { v: "12", l: "Particiones necesarias si se ordenan por tasa de malos", color: L.HEX.green },
    { v: "18,6 s → 0,06 s", l: "Tiempo: fuerza bruta vs. orden", color: L.HEX.navy, size: 34 },
    { v: "Idéntico", l: "Mismo subconjunto y misma ΔI = 0,001003", color: L.HEX.gold, size: 36 },
  ], points: ["Con dos clases, la partición óptima de una categórica separa las categorías ordenadas por p(malo | categoría): basta probar L − 1 cortes", "Es la misma idea que el WoE del Módulo 3 y la base del tratamiento categórico de XGBoost, LightGBM y CatBoost (Módulo 5)", "Riesgo: con muchas categorías (agencia, empleador) el orden por tasa observada sobreajusta → target statistics ordenados de CatBoost"] });

  L.sSection(D, { num: 4, title: "Poda por costo-complejidad", sub: "Crecer de más y podar hacia atrás" });
  L.sFormula(D, { title: "Costo-complejidad y el eslabón más débil (cap. 3)", formula: "R_α(T) = R(T) + α · |T̃|          g(t) = [R(t) − R(T_t)] / (|T̃_t| − 1)", fsize: 24,
    where: [["R(T)", "Costo (error o impureza) de resubstitución del árbol T"], ["|T̃|", "Número de hojas: penalización por complejidad"], ["T_t", "Rama que cuelga del nodo t"], ["g(t)", "α al que conviene colapsar la rama T_t en la hoja t"], ["Weakest link", "Podar el nodo con menor g(t); repetir → secuencia anidada T₁ ⊃ T₂ ⊃ … ⊃ {raíz}"]],
    example: { h: "Verificación en el notebook", t: ["Árbol grande: 597 hojas", "Primer weakest link a mano: g = 1,162·10⁻⁷", "scikit-learn ccp_alpha₁ = 1,162·10⁻⁷", "Cada α define el subárbol óptimo de su tamaño"] },
    notes: "El resultado clave de Breiman et al.: para cada α existe un único subárbol más pequeño que minimiza R_α, y los subárboles óptimos son anidados. Eso hace la poda eficiente." });
  L.sImage(D, { title: "Validación cruzada y regla de un error estándar", img: IMG + "c13_1.png",
    points: ["El error CV cae rápido y luego queda plano en un amplio rango de tamaños", "Mínimo CV: 30 hojas", "Regla 1-SE: el árbol más pequeño con error ≤ mínimo + 1 SE → 21 hojas (α = 1,2·10⁻⁴)", "AUC fuera de tiempo del árbol podado: 0,732", "Parsimonia: menos segmentos, más estables y más fáciles de gobernar"] });

  L.sSection(D, { num: 5, title: "Surrogates, importancia y límites", sub: "Lo que hace único a CART" });
  L.sTable(D, { title: "Particiones sustitutas (surrogates) para valores faltantes", colW: [3.4, 1.8, 2.2], rowH: 0.5, fsize: 14, w: 7.4,
    header: ["Surrogate de EXT2 ≤ 0,372", "Corte", "% de acuerdo"],
    rows: [["Regla de mayoría (todos a la derecha)", "—", "87,1 %"], [{ text: "EXT3", options: { bold: true, color: L.HEX.green } }, "0,182", "88,0 %"], ["PENSIONISTA", "1", "87,1 %"], ["AMT_REQ_CREDIT_BUREAU_YEAR", "6", "86,9 %"], ["RCI", "1,77", "86,6 %"], ["EDAD", "21,5", "86,5 %"]],
    side: ["Si falta la variable principal, CART usa la partición de otra variable que mejor imita la división (sección 5.3)", "Aquí solo EXT3 supera a la regla de mayoría: los surrogates ayudan poco cuando las variables son poco redundantes", "XGBoost reemplaza esta idea por una dirección por defecto aprendida para los faltantes (S4)"],
    note: "Fuente: notebook M04_S01, sección 6. scikit-learn no implementa surrogates; se programan desde cero." });
  L.sImage(D, { title: "Importancia de variables y el árbol como regla de negocio", img: IMG + "c16_2.png",
    points: ["Importancia = suma ponderada de ΔI en las particiones de cada variable (incluyendo surrogates en la versión original de Breiman)", "EXT2 domina; un árbol de profundidad 2 ya separa segmentos con PD de 4,2 % a 37,4 %", "La importancia por impureza sesga hacia variables continuas con muchos cortes: en la S2 la comparamos con importancia por permutación"] });
  L.sCompare(D, { title: "El árbol frente al scorecard logístico", left: { h: "Fortalezas", icon: "+", items: ["Reglas legibles y segmentación directa", "Captura interacciones y no linealidades sin especificarlas", "Sin transformaciones previas; robusto a extremos", "Costos asimétricos explícitos"] },
    right: { h: "Debilidades", icon: "−", items: ["Alta varianza: otro período, otro árbol", "Predicción escalonada: pocas PD distintas", "AUC menor que el scorecard (0,73 vs. 0,77)", "Particiones greedy: puede omitir buenas combinaciones"] },
    verdict: "un solo árbol rara vez es el modelo final de PD; es un excelente segmentador y el ladrillo básico de bagging, random forest y boosting." });
  L.sQuestion(D, { q: "Si el comité quiere una política de 5 segmentos con PD claramente diferenciada, ¿usarías un árbol podado o bandas de un scorecard?",
    hint: "estabilidad entre períodos, monotonicidad de la PD por segmento, facilidad de explicar el rechazo, y cómo se monitorea cada alternativa." });

  D.sec("Laboratorio y cierre");
  L.sLab(D, { notebook: "M04_S01_Arboles_de_Decision_CART.ipynb", data: ["hc_application_sintetico.csv", "Desarrollo 2022-2024, fuera de tiempo 2025"], steps: [
    { h: "Impurezas y ejemplo de Breiman", t: "Gini, entropía y error; ΔI de s₁ y s₂" },
    { h: "CART desde cero", t: "Búsqueda exhaustiva de particiones y comparación con scikit-learn" },
    { h: "Priors y costos", t: "Priors alterados vs. class_weight; efecto en hojas y aprobación" },
    { h: "Teorema de orden para categóricas", t: "4 095 particiones vs. 12" },
    { h: "Poda", t: "Weakest link a mano, ccp_alpha, CV y regla 1-SE" },
    { h: "Surrogates e importancia", t: "Implementación propia y lectura de negocio" },
  ] });
  L.sTakeaways(D, { items: [
    "CART elige particiones que maximizan la reducción de impureza; Gini y entropía premian los nodos puros, la tasa de error no.",
    "Los costos de un mal aprobado entran como priors alterados o pesos de clase.",
    "Con dos clases, ordenar las categorías por tasa de malos reduce 2ᴸ⁻¹−1 particiones a L−1.",
    "Se crece de más y se poda por costo-complejidad; la regla 1-SE da árboles más simples y estables.",
    "La varianza del árbol es su gran debilidad: la próxima sesión la atacamos con bootstrap, bagging y random forest.",
  ], next: "Sesión 2 · Ensembles: bootstrap, bagging y random forest." });
  await L.save(D, OUT);
})();
