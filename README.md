# Programa Ejecutivo en Gestión Integral del Riesgo de Crédito Minorista
DataBank Academy · Enero-mayo de 2027 · Material docente

## Estructura
Cada módulo tiene una carpeta con tres subcarpetas:
- `presentaciones/`: un PowerPoint por sesión de 2 horas (con notas del expositor).
- `notebooks/`: un notebook por sesión, ya ejecutado y con ejercicios al final.
- `datos/`: copia de los datos que usan los notebooks (rutas relativas `../datos`).

| Módulo | Sesión | Tema | Estado |
|---|---|---|---|
| 1 · Gestión integral del riesgo de crédito minorista | S1 | Ciclo de vida, originación y apetito de riesgo | Listo |
| | S2 | Calidad de cartera, provisiones y rentabilidad | Listo |
| | S3 | Organización, segmentación, indicadores y gobierno | Listo |
| 2 · Fundamentos estadísticos para riesgo | S1 | Variables aleatorias, Bayes y pérdida esperada | Listo |
| | S2 | Estimadores, intervalos, TLC y verosimilitud | Listo |
| | S3 | Pruebas de hipótesis, desbalance y métricas | Listo |
| 3 a 12 | | Pendientes (piloto validado primero) | — |

Formato de cada sesión: unos 60-70 minutos de fundamentos y discusión, más 35-50 minutos de laboratorio.

## Datos (`00_Datos_Referenciales/`)
| Archivo | Origen | Uso |
|---|---|---|
| `hc_application_sintetico.csv` | **Sintético**, mismo esquema que *Home Credit Default Risk* (Kaggle). 60 060 solicitudes, 8 % de default, incluye anomalías reales (DAYS_EMPLOYED = 365243, faltantes en EXT_SOURCE, 60 duplicados) | Caso conductor de originación |
| `cartera_panel_mensual.csv.gz` | **Sintético**. Panel crédito-mes de 16 000 créditos minoristas (2022-01 a 2026-09), con atraso, castigos y recuperos, ligado a un índice macro | Indicadores, cosechas, roll rates, provisiones |
| `macro_peru_ilustrativa.csv` | **Ilustrativa**: trayectoria aproximada de PBI, inflación, tasa de referencia y desempleo. Reemplazar con la API del BCRP | Ciclo y escenarios |
| `sbs_categorias_provisiones_consumo.csv` | Referencia didáctica de la Res. SBS N.° 11356-2008 (consumo sin garantías). Validar contra la norma vigente | Provisiones |
| `german_credit.csv` | **Real**: Statlog German Credit (UCI), 1 000 créditos | Inferencia y lectura de modelos |
| `taiwan_default.csv` | **Real**: Default of Credit Card Clients (UCI), 30 000 clientes | Validación y métricas |

`scripts/generar_datos.py` regenera los datos sintéticos (semilla fija, reproducible). Para usar el Home Credit original, descárgalo desde Kaggle (requiere cuenta) y reemplaza el archivo: las columnas principales coinciden.

## Requisitos para los notebooks
Python 3.10+ con: `pandas numpy scipy scikit-learn statsmodels matplotlib jinja2` (ver `requirements.txt`).

## `_recursos_construccion/`
Scripts que generaron los notebooks (`nb_m*.py`), los datos de los gráficos (`chart_data.py`) y los PowerPoint (`decks/lib.js`, librería de diapositivas con pptxgenjs). Sirven para producir los módulos 3 a 12 con el mismo formato.
