# core-api

Node.js + TypeScript + Express 5 + Prisma 7 + PostgreSQL. It owns users and sign-in, appointments, medical
history and prescriptions, and is the only thing the web app talks to (see
[../../docs/architecture.md](../../docs/architecture.md)).

## Run it

Needs Node.js 22.18+ and the database from [../../infra](../../infra) (`docker compose -f infra/docker-compose.yml up -d`
from the repo root).

```bash
cp .env.example .env     # local development values, matching docker-compose defaults
npm install
npm run db:generate      # Prisma client -> src/generated (git-ignored)
npm run db:deploy        # apply migrations to core_db
npm run db:seed          # optional: demo accounts and sample data (see below)
npm run dev              # http://localhost:4000
```

## API

Operational endpoints (not under `/api`):

| Endpoint | Purpose |
|---|---|
| `GET /health` | Liveness: the process is up. |
| `GET /ready` | Readiness: the database answers. `503` when it does not. |
| `GET /.well-known/jwks.json` | Public key that verifies access tokens (for other services). |

Application endpoints, all under `/api`. Everything except sign-up, login, refresh and logout needs
`Authorization: Bearer <access token>`.

| Endpoint | Who | What |
|---|---|---|
| `POST /auth/signup` | anyone | Create a patient or doctor account; signs you in. |
| `POST /auth/login` | anyone | Sign in. Optional `expectedRole` reports a role mismatch. |
| `POST /auth/refresh` | cookie | Trade the refresh cookie for a new access token (rotates the cookie). |
| `POST /auth/logout` | cookie | End the session. |
| `GET /auth/me` | signed in | The current user and profile. |
| `GET /doctors` | signed in | Doctors to choose from (no contact details). |
| `GET /patients` | doctor | The doctor's own patients: those with a non-cancelled appointment with them. |
| `GET /patients/:id` | patient (self), doctor with an appointment | A patient's profile. |
| `GET /patients/:id/history` | same | Medical history, newest first, with prescriptions. |
| `GET /appointments` | patient, doctor | Your own appointments, soonest first. |
| `POST /appointments` | patient | Request an appointment (`doctorId`, `scheduledAt`, `reason`). `409` if the doctor's slot is taken. |
| `PATCH /appointments/:id/status` | the doctor | `confirmed`, `cancelled` or `completed`, following the allowed transitions. |
| `POST /history` | patient | Add a medical record. |
| `POST /history/:id/prescription` | doctor with an appointment | Prescribe on a record (one per record). |

Every response carries `X-Request-Id` (the gateway's id if it sent a sane one) and `Cache-Control: no-store`.
Errors always look like `{ "error": { "code", "message", "requestId" } }`; validation errors add a `details`
list of `{ field, message }`. How sign-in works: [../../docs/adr/0003-authentication.md](../../docs/adr/0003-authentication.md).

## Demo data

`npm run db:seed` creates four accounts with sample appointments, records and prescriptions, all with the
password `Demo-password-1`: `demo.patient@example.com`, `demo.doctor@example.com`,
`vikram.joshi@example.com` and `meera.iyer@example.com`. It is safe to run twice and refuses to run when
`NODE_ENV=production`.

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
| `npm run db:seed` | Load demo accounts and sample data (development only) |
| `npm run db:studio` | Browse the data |
| `npm run keys:generate` | Print a `JWT_PRIVATE_KEY=...` line for production |

## Configuration

Validated at startup (`src/config/env.ts`); the server refuses to start on a bad value.

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | required | `postgresql://user:password@host:port/db` |
| `TEST_DATABASE_URL` | unset | Used instead of `DATABASE_URL` when running tests. Without it, `npm test` refuses to run (outside CI) because tests empty the tables. |
| `PORT` | `4000` | |
| `LOG_LEVEL` | `info` | `fatal` `error` `warn` `info` `debug` `trace` `silent` |
| `NODE_ENV` | `development` | `production` switches logs to JSON and requires `JWT_PRIVATE_KEY` |
| `JWT_PRIVATE_KEY` | throwaway key (dev/test only) | RSA private key (PEM, `\n` escapes allowed) that signs access tokens. Required in production. |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Lifetime of an access token (minimum 60). |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | Lifetime of a login session. |
| `COOKIE_SECURE` | `true` in production, else `false` | Send the refresh cookie over HTTPS only. |
| `AUTH_RATE_LIMIT_MAX` | `20` | Login and sign-up attempts per IP per 15 minutes. |
| `TRUST_PROXY` | `0` | Number of reverse proxies in front of the API (set `1` behind the gateway). |

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
