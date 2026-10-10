# ChroniCare

Healthcare management for patients and doctors: appointments, medical history and prescriptions.

The project is moving from a Firebase-only React app to a small service platform
(see [docs/architecture.md](docs/architecture.md)). Today:

| Part | State |
|---|---|
| `apps/web` | React app, in production on Firebase Hosting. Still talks to Firebase directly. |
| `services/core-api` | Node.js + TypeScript API. Health/readiness endpoints and the PostgreSQL schema are done; feature endpoints replace Firebase in Phase 1. |
| PostgreSQL | Runs locally in Docker (`infra/`). |
| `services/ai-service`, `services/payment-service` | Planned (prescription OCR, payments). Folders only. |

## Repository layout

```
apps/
  web/                React 19 + Vite + Redux Toolkit frontend (its own README has the product overview)
services/
  core-api/           Node.js + TypeScript + Express + Prisma
  ai-service/         planned: Python, prescription OCR
  payment-service/    planned: Java, payments
contracts/
  openapi/            planned: API specs
  events/             planned: queue message schemas
infra/
  docker-compose.yml  local PostgreSQL (more services are added as phases need them)
  postgres/init/      creates one database and one role per service on first start
  gateway/            planned: reverse proxy config
  terraform/          planned: cloud infrastructure as code
docs/                 architecture notes and decision records (adr/)
.github/workflows/    one workflow per deployable, each triggered only by its own paths
```

## Quick start

You need Node.js 22.18 or newer and Docker.

```bash
# 1. Database (PostgreSQL 17 on localhost:5433; 5432 is left free for any Postgres you already run)
docker compose -f infra/docker-compose.yml up -d

# 2. Core API
cd services/core-api
cp .env.example .env
npm install
npm run db:generate      # generates the Prisma client
npm run db:deploy        # applies the migrations to core_db
npm run dev              # http://localhost:4000/health and /ready
npm test                 # runs against core_db_test, never against development data

# 3. Web app (separate terminal)
cd apps/web
cp .env.example .env     # then fill in the Firebase values
npm install
npm run dev
```

Stop the database with `docker compose -f infra/docker-compose.yml down`.
Add `-v` to also delete its data and re-run the init script.

## Ports

| Service | Port |
|---|---|
| web (Vite) | 5173 |
| core-api | 4000 |
| PostgreSQL | 5433 (loopback only) |

## Conventions

- Each service owns its data and its tooling (npm, uv, Maven); there is no shared build step.
- Local credentials in `.env.example` files and `docker-compose.yml` are for development only.
- Commit messages are plain sentences in the imperative mood.
