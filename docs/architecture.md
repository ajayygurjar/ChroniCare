# Architecture

## Where we are and where we are going

**Today** the React app talks directly to the Firebase Realtime Database and Firebase Auth. There is no
backend, so authorization happens in the browser and the database rules have to be open.

**Target** is a small set of services behind one gateway:

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
| 1 Core API replaces Firebase | Same features as today, but secure | Next: auth, appointments, history, prescriptions, data migration from Firebase |
| 2 Prescription upload + OCR | Patient uploads a printed prescription, gets an editable medication list | Not started |
| 3 Payments | Booking fee in test mode | Not started |
| 4 AI layer | LLM extraction and plain-language explanations | Not started |
| 5 Hardening | Tracing, end-to-end tests, backups | Not started |

Decisions are recorded in [adr/](adr/).
