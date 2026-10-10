# 0001: One monorepo for all services

Status: accepted, 2026-10-10

## Context

ChroniCare is moving from one React app to several services in different languages (Node.js, Python, Java)
that share API contracts and run together locally. One developer maintains all of it.

## Decision

Keep everything in one repository: `apps/` for frontends, `services/` for backends, `contracts/` for API and
event schemas, `infra/` for local and cloud infrastructure, `docs/` for documentation.

Each part keeps its own native tooling (npm, uv/Poetry, Maven/Gradle). There is no monorepo build tool.
CI has one workflow per deployable, triggered only by the paths it depends on.

## Consequences

- A change that spans services (for example a new field in an event) is one pull request.
- One `docker compose up` runs the whole system, and a reviewer sees everything from one link.
- Path-filtered workflows must not be marked as *required* status checks: a pull request that does not touch
  the path never starts the workflow, and the check stays pending forever. If required checks are needed
  later, use a single workflow with path filtering inside it.
- Splitting into repositories would only make sense if separate teams owned separate services.
