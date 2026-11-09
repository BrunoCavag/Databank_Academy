# Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista
DataBank Academy · Enero-mayo de 2027 · Material docente

## Estructura
Cada módulo tiene una carpeta con tres subcarpetas:
- `presentaciones/`: un PowerPoint por sesión de 2 horas (con notas del expositor).
- `notebooks/`: un notebook por sesión, ya ejecutado y con ejercicios al final.
- `datos/`: copia de los datos que usan los notebooks (rutas relativas `../datos`).

| Módulo | Sesión | Tema | Estado |
|---|---|---|---|
| 1 · Gestión integral del riesgo de crédito minorista (8 h) | S1 | Ciclo de vida, originación, apetito, políticas y facultades | Listo |
| | S2 | Calidad de cartera, provisiones, capital, pricing y RAROC | Listo |
| | S3 | Segmentación, concentración, alertas tempranas, cobranza y refinanciación | Listo |
| | S4 | Gobierno de datos y modelos; caso integrador para el comité de riesgos | Listo |
| 2 · Fundamentos estadísticos para riesgo (8 h) | S1 | Probabilidad, Bernoulli, Bayes y pérdida esperada | Listo |
| | S2 | Estimadores, intervalos y teoremas límite | Listo |
| | S3 | Verosimilitud, inferencia y lectura de resultados | Listo |
| | S4 | Pruebas de hipótesis, desbalance y métricas | Listo |
| 3 · Regresión logística y scorecards (8 h) | S1 | Odds, MLE y Newton-Raphson (IRLS desde cero, Firth) | Listo |
| | S2 | Multicolinealidad, regularización y selección de variables | Listo |
| | S3 | WoE e IV con optbinning y fastwoe (funcionalidades avanzadas) | Listo |
| | S4 | Scorecard, calibración y decisiones | Listo |
| 4 · Árboles, ensembles y XGBoost (8 h) | S1 | Árboles de decisión: CART (Breiman et al., 1984) | Listo |
| | S2 | Ensembles: bootstrap, bagging y random forest | Listo |
| | S3 | Gradient boosting (Friedman, 2001) | Listo |
| | S4 | XGBoost: derivación, aplicación e innovaciones 2.0 → 3.4 | Listo |
| 5 · CatBoost y variables categóricas (4 h) | S1 | Target statistics y ordered boosting (Prokhorenkova et al., 2018) | Listo |
| | S2 | Árboles simétricos, benchmarks e innovaciones (embeddings, texto, grafos) | Listo |
| 6 a 12 | | Optuna, explicabilidad, caso aplicado, NIIF 9, pricing, portafolio, MLOps | Pendientes |

Formato de cada sesión: unos 60-70 minutos de fundamentos y discusión, más 35-50 minutos de laboratorio.

## Datos (`00_Datos_Referenciales/`)
| Archivo | Origen | Uso |
|---|---|---|
| `hc_application_sintetico.csv` | **Sintético**, mismo esquema que *Home Credit Default Risk* (Kaggle). 60 060 solicitudes, 8 % de default, incluye anomalías reales (DAYS_EMPLOYED = 365243, faltantes en EXT_SOURCE, 60 duplicados) | Caso conductor de originación. Desde la versión actual incluye categóricas de alta cardinalidad (`AGENCIA_ID`, `EMPLEADOR_ID`, `COMERCIO_ALIADO`) para los módulos 4 y 5 |
| `cartera_panel_mensual.csv.gz` | **Sintético**. Panel crédito-mes de 16 000 créditos minoristas (2022-01 a 2026-09), con atraso, castigos y recuperos, ligado a un índice macro | Indicadores, cosechas, roll rates, provisiones |
| `macro_peru_ilustrativa.csv` | **Ilustrativa**: trayectoria aproximada de PBI, inflación, tasa de referencia y desempleo. Reemplazar con la API del BCRP | Ciclo y escenarios |
| `sbs_categorias_provisiones_consumo.csv` | Referencia didáctica de la Res. SBS N.° 11356-2008 (consumo sin garantías). Validar contra la norma vigente | Provisiones |
| `german_credit.csv` | **Real**: Statlog German Credit (UCI), 1 000 créditos | Inferencia y lectura de modelos |
| `taiwan_default.csv` | **Real**: Default of Credit Card Clients (UCI), 30 000 clientes | Validación y métricas |

`scripts/generar_datos.py` regenera los datos sintéticos (semilla fija, reproducible). Para usar el Home Credit original, descárgalo desde Kaggle (requiere cuenta) y reemplaza el archivo: las columnas principales coinciden.

## Requisitos para los notebooks
Python 3.10+ con las librerías de `requirements.txt`. Los módulos 3 a 5 usan además `optbinning`, `fastwoe`, `xgboost` (≥ 3.1; probado con 3.4.1) y `catboost` (≥ 1.2.6 para graph features; probado con 1.2.10).

## `_recursos_construccion/`
Scripts que generaron los notebooks (`nb_m*.py`), los datos de los gráficos (`chart_data.py`) y los PowerPoint (`decks/lib.js`, librería de diapositivas con pptxgenjs). Sirven para producir los módulos 6 a 12 con el mismo formato. Los decks de los módulos 4 y 5 insertan figuras exportadas de los notebooks (con `inspect_nb.py`).
