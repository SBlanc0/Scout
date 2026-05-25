# ⚽ Scout Predictor

App de predicción de resultados de fútbol con motor estadístico Poisson y datos reales de API-Football.

## Archivos del proyecto

```
scout-predictor/
├── index.html   → Estructura de la app
├── style.css    → Estilos y tema oscuro
├── api.js       → Conexión a API-Football (con proxy CORS + caché)
├── engine.js    → Motor de predicción Poisson
├── app.js       → Lógica principal y renderizado
└── README.md    → Este archivo
```

## Cómo usar

1. **Descarga** los 4 archivos (index.html, style.css, api.js, app.js) en la misma carpeta
2. **Abre** `index.html` en tu navegador (doble clic)
3. Listo — la app se conecta automáticamente a API-Football

> No necesitas servidor. Funciona directamente en el navegador.

## Tu API Key

Tu key ya está configurada en `api.js`:
```
1dce940e7ef0026ffb9f1e27b5ab22de
```
Si en algún momento la cambias, edita la línea `const API_KEY` en `api.js`.

## Cómo funciona el motor de predicción

El motor usa **distribución de Poisson** para estimar la probabilidad de cada resultado:

1. **λ (lambda)** = goles esperados por equipo, calculados con:
   - Promedio de goles a favor y en contra de la clasificación real
   - Multiplicador de forma reciente (los últimos partidos pesan más)
   - Ventaja de jugar en casa (+15% en ataque)

2. **Probabilidades 1X2** = suma de la distribución Poisson para todos los marcadores posibles (0-0 hasta 7-7)

3. **Mercados adicionales** = Over 2.5 y BTTS calculados de la misma distribución

## Cuota gratuita

- 100 llamadas/día en el plan Free de API-Football
- La app usa **caché de 30 minutos** para no repetir llamadas
- El indicador en el header muestra cuántas llamadas llevas hoy

## Ligas disponibles

| Liga | ID |
|------|----|
| Premier League | 39 |
| La Liga | 140 |
| Champions League | 2 |
| Serie A | 135 |
| Bundesliga | 78 |

## Tracker de apuestas

- Las apuestas se guardan en `localStorage` del navegador
- Se mantienen entre sesiones
- Calcula automáticamente ROI, tasa de acierto y P&L
- Puedes actualizar el resultado de apuestas pendientes desde la lista
