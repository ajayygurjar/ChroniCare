# ChroniCare

Healthcare management for patients and doctors: appointments, medical history and prescriptions.

The project has moved from a Firebase-only React app to a small service platform
(see [docs/architecture.md](docs/architecture.md)). Today:

| Part | State |
|---|---|
| `apps/web` | React app. Talks only to the core-api (no Firebase). Firebase Hosting still serves the static site. |
| `services/core-api` | Node.js + TypeScript API: sign-up and login, appointments, medical history and prescriptions, with role-based access rules and automated tests. |
| PostgreSQL | Runs locally in Docker (`infra/`). |
| `services/ai-service`, `services/payment-service` | Planned (prescription OCR, payments). Folders only. |

The live site on Firebase Hosting is still the earlier Firebase version. Do not deploy this version of the
web app until the API is hosted (see [apps/web/README.md](apps/web/README.md#-deployment)).

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
npm run db:seed          # optional: demo accounts with sample data (demo.patient@example.com / Demo-password-1)
npm run dev              # http://localhost:4000 (health: /health and /ready)
npm test                 # runs against core_db_test, never against development data

# 3. Web app (separate terminal). No .env needed: Vite forwards /api to the API on port 4000.
cd apps/web
npm install
npm run dev              # open the address it prints (5173, or the next free port)
```

Sign up in the web app as a patient, and as a doctor in a second browser profile or after logging out. Or
load the demo data (`npm run db:seed`) and sign in with `demo.patient@example.com` or
`demo.doctor@example.com`, password `Demo-password-1`.

Stop the database with `docker compose -f infra/docker-compose.yml down`.
Add `-v` to also delete its data and re-run the init script.

## API keys, URLs and secrets

Keep them in environment files, never in source. Each folder has a committed `.env.example` template;
the real `.env` next to it is git-ignored (`.env`, `.env.*` and everything except `*.example`).

| Value | Where it lives | Template |
|---|---|---|
| Web app settings (all optional: where to forward `/api` in development) | `apps/web/.env` | `apps/web/.env.example` |
| core-api settings (database URL, port, log level, token and cookie settings) | `services/core-api/.env` | `services/core-api/.env.example` |
| JWT signing key (`JWT_PRIVATE_KEY`, required in production; `npm run keys:generate` makes one) | host environment or secret manager | `services/core-api/.env.example` |
| Local Postgres passwords (optional overrides) | `infra/.env` | `infra/.env.example` |
| Firebase deploy credential for CI | GitHub repository secret `FIREBASE_SERVICE_ACCOUNT_CHRONICARE_FFD95` | n/a |

When a new key is needed (OCR provider, payment provider, LLM API, ...):

1. Put it in the `.env` of the service that uses it, and add a line with an empty value to that
   service's `.env.example`.
2. Read it through that service's config module (core-api: `src/config/env.ts`, which validates it at
   startup and refuses to boot without it), not with `process.env` scattered around the code.
3. In production and CI, set it as a host environment variable or a GitHub Actions secret.

Anything prefixed `VITE_` is compiled into the browser bundle and visible to every visitor, so `apps/web`
may only hold public settings. The web app no longer needs any key at all. Real secrets, such as the
JWT signing key, payment keys and LLM API keys, belong in a backend service only.

## Ports

| Service | Port |
|---|---|
| web (Vite) | 5173, or the next free port (it prints the address) |
| core-api | 4000 |
| PostgreSQL | 5433 (loopback only) |

## Conventions

- Each service owns its data and its tooling (npm, uv, Maven); there is no shared build step.
- Local credentials in `.env.example` files and `docker-compose.yml` are for development only.
- Commit messages are plain sentences in the imperative mood.
