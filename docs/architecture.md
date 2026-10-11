# Architecture

## Where we are and where we are going

**Before** (the Firebase version) the React app talked directly to the Firebase Realtime Database and
Firebase Auth. There was no backend, so authorization happened in the browser and the database rules had
to be open.

**Today** the React app talks only to `core-api`, which authenticates users, enforces who may see what,
and stores everything in PostgreSQL. Firebase Hosting still serves the static site. See
[adr/0003-authentication.md](adr/0003-authentication.md).

**Target** adds the remaining services behind one gateway:

```
Browser (apps/web)
   |  HTTPS
Gateway (nginx / Caddy)            only public entry point
   |-- /api/*            -> core-api         Node.js + TypeScript   (auth, appointments, history, prescriptions)
   |-- /api/payments/*   -> payment-service  Java + Spring Boot     (orders, webhooks, ledger)
                                |
                          RabbitMQ  (async jobs and events)
                                |
                          ai-service        Python                 (prescription OCR, no public route)

Data:  PostgreSQL (source of truth)  +  Redis (cache, rate limits)  +  S3-compatible object storage (files)
```

Why separate services: Python owns the OCR/ML ecosystem, payments benefit from an isolated failure domain
and their own secrets, and Node serves the product API. REST is used for requests; RabbitMQ carries slow
work (OCR) and cross-service events (`payment.succeeded`).

## Rules the services follow

- **Each service owns its data.** One database and one login role per service; no service reads another's
  tables. Local setup: `core_db` (+ `core_db_test`) for core-api, `payments_db` for payment-service.
- **Events, not shared tables.** When something changes that another service cares about, publish an event.
- **Auth lives in core-api.** It issues short-lived JWTs; other services verify them against its JWKS endpoint.
- **Correlation ids.** Every request carries `X-Request-Id`, which is logged by every service.
- **One error shape:** `{ "error": { "code", "message", "requestId" } }`.
- **Health data stays out of logs.** Log ids, never request bodies, OCR text or drug names.

## Status

| Phase | Goal | State |
|---|---|---|
| 0 Foundations | Monorepo, services build and test in CI | In progress: monorepo, core-api scaffold, PostgreSQL, CI for web and core-api are done. ai-service, payment-service, Redis, RabbitMQ, object storage, gateway and `contracts/` are not started. |
| 1 Core API replaces Firebase | Same features as before, but secure | Mostly done: sign-in, appointments, history and prescriptions run on the API and PostgreSQL, with role-based access and tests. Still open: hosting the API and gateway so the live site can switch over, "forgot password", and importing old Firebase data (passwords cannot be moved; users re-register). |
| 2 Prescription upload + OCR | Patient uploads a printed prescription, gets an editable medication list | Not started |
| 3 Payments | Booking fee in test mode | Not started |
| 4 AI layer | LLM extraction and plain-language explanations | Not started |
| 5 Hardening | Tracing, end-to-end tests, backups | Not started |

Decisions are recorded in [adr/](adr/).
