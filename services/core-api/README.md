# core-api

Node.js + TypeScript + Express 5 + Prisma 7 + PostgreSQL. It will own users and auth, appointments,
medical history and prescriptions. Right now it has the health endpoints and the database schema; the
feature endpoints replace Firebase in Phase 1 (see [../../docs/architecture.md](../../docs/architecture.md)).

## Run it

Needs Node.js 22.18+ and the database from [../../infra](../../infra) (`docker compose -f infra/docker-compose.yml up -d`
from the repo root).

```bash
cp .env.example .env     # local development values, matching docker-compose defaults
npm install
npm run db:generate      # Prisma client -> src/generated (git-ignored)
npm run db:deploy        # apply migrations to core_db
npm run dev              # http://localhost:4000
```

| Endpoint | Purpose |
|---|---|
| `GET /health` | Liveness: the process is up. |
| `GET /ready` | Readiness: the database answers. `503` when it does not. |

Every response carries `X-Request-Id` (the gateway's id if it sent a sane one). Errors always look like
`{ "error": { "code", "message", "requestId" } }`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with reload (`tsx watch`), pretty logs |
| `npm run build` / `npm start` | Generate the client, compile to `dist/`, run it |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Vitest + Supertest against the **test** database |
| `npm run db:migrate -- --name <name>` | Create and apply a new migration while developing |
| `npm run db:deploy` | Apply pending migrations (what CI and production use) |
| `npm run db:status` | Show which migrations are applied |
| `npm run db:studio` | Browse the data |

## Configuration

Validated at startup (`src/config/env.ts`); the server refuses to start on a bad value.

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | required | `postgresql://user:password@host:port/db` |
| `TEST_DATABASE_URL` | unset | Used instead of `DATABASE_URL` when running tests. Without it, `npm test` refuses to run (outside CI) because tests empty the tables. |
| `PORT` | `4000` | |
| `LOG_LEVEL` | `info` | `fatal` `error` `warn` `info` `debug` `trace` `silent` |
| `NODE_ENV` | `development` | `production` switches logs to JSON |

## Database

The schema is in `prisma/schema.prisma`. Two rules Prisma cannot express are hand-written in
`prisma/migrations/*_init/migration.sql`: the `citext` extension (case-insensitive emails) and the partial
unique index that prevents double booking. Tests in `test/schema.test.ts` check both against a real
PostgreSQL. Reasoning: [../../docs/adr/0002-postgresql.md](../../docs/adr/0002-postgresql.md).

After changing the schema: `npm run db:migrate -- --name what_changed`, review the generated SQL, commit it.
Never edit a migration that has been applied; add a new one.

## Docker

```bash
docker build -t chronicare/core-api .
docker run --rm -p 4000:4000 -e DATABASE_URL=postgresql://core_api:core_dev_only@host.docker.internal:5433/core_db chronicare/core-api
```

The image runs as a non-root user with JSON logs and a health check. Migrations are not run by the app
container; run `npx prisma migrate deploy` as a separate step (the `build` stage of the Dockerfile has the CLI).
