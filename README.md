# Scout Predictor WC 2026

Plataforma MVP para predicciones del Mundial 2026 con motor Poisson, ranking Elo, páginas de selecciones, grupos, partidos y herramientas de valor esperado.

## Frontend

La app sigue siendo HTML/CSS/JS y puede abrirse directamente desde `index.html`.

Rutas principales:

- `#/dashboard`
- `#/partidos`
- `#/partido/:id`
- `#/equipos`
- `#/equipo/:id`
- `#/grupos`
- `#/ranking`
- `#/simulador`
- `#/ev`
- `#/tracker`

## Datos

El MVP usa `js/data.js` como seed local para avanzar rápido con la experiencia. Esos datos están preparados para migrarse después a PostgreSQL.

## Backend opcional

Instalar dependencias:

```bash
npm install
```

Configurar variables:

```bash
cp .env.example .env
```

Crear tablas:

```bash
psql "$DATABASE_URL" -f server/schema.sql
```

Iniciar servidor:

```bash
npm run dev
```

Endpoints iniciales:

- `GET /api/health`
- `GET /api/teams`
- `GET /api/teams/:id`
- `GET /api/matches`
- `POST /api/predictions`
