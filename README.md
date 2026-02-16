# Algorithm Learning Studio (React)

Learning app for algorithm patterns and complexity practice, with a local API for auth + study progress sync.

## Pages

- `Pattern Visualizer`: step-by-step simulation, explanations, and local benchmark trend.
- `Study Lab`: focused pattern summary plus quiz.
- `Complexity Trainer`: dedicated time/space complexity drills.

## Stack

- React + TypeScript + Vite
- React Router for page navigation
- Express + Postgres API for account auth and study progress persistence
- Local algorithm simulation logic

## Run

```bash
cd algo_visualizer/react_app
npm install
npm run dev
```

Open the local URL from Vite (usually `http://localhost:5173`).

## API Notes

- API server runs on `http://localhost:8787` in local dev (`npm run dev` starts both app + API).
- Frontend defaults to same-origin `/api` in production so it can be deployed together with API routes.
- Optional override: set `VITE_API_BASE_URL` only if your API is on a different host.

## Single Deploy (Frontend + API together)

- This repo includes serverless API handlers under `api/`:
  - `api/auth/login`
  - `api/auth/register`
  - `api/study`
  - `api/health`
- Set backend env vars on your deploy project:
  - `DATABASE_URL`
  - `JWT_SECRET`

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/pages/` page-level modules
- `src/components/` reusable UI blocks
- `src/lib/` algorithm logic, benchmark helpers, and study data
- `src/data/` pattern metadata
# Algorithm_Learning_Studio
