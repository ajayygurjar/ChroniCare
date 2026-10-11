# 0003: Authentication with short-lived access tokens and a rotating refresh cookie

Status: accepted, 2026-10-11

## Context

The Firebase version signed users in from the browser, kept the token in `localStorage`, never refreshed
it, and decided who could see what in client code. Anyone with the database URL could read every patient.
Authorization has to happen on a server, and other services (the Java payment service later) must be able
to trust the result without sharing a secret.

## Decision

- **Passwords** are hashed with argon2id (OWASP minimum cost). Wrong-password and unknown-email answers are
  identical, and a role mismatch is reported only after the password is verified.
- **Access tokens** are RS256 JWTs that live 15 minutes. The browser sends them as `Authorization: Bearer`.
  They are kept in memory only. The public key is published at `/.well-known/jwks.json`, so other services
  verify tokens without ever holding the private key.
- **Refresh tokens** are opaque random strings in an `httpOnly`, `SameSite=Lax` cookie scoped to
  `/api/auth`. The database stores only their SHA-256 hash. Every use rotates the token.
- **Replay detection:** presenting a token that was already replaced (outside a 10 second window for two
  tabs refreshing together) ends all of that user's sessions. Logging out deletes the session at once.
- **Page reload** restores the session by calling `/api/auth/refresh`. A harmless "was signed in" flag in
  `localStorage` (no token) stops signed-out visitors from sending that request on every page load.
- **Authorization** is enforced in the API, per request: a patient reads only themselves, and a doctor
  reads only patients they have a non-cancelled appointment with.
- **One origin:** the browser calls `/api` on its own origin (Vite proxy in development, the gateway in
  production), so there is no CORS and the cookie is a plain same-site cookie.
- Login and sign-up are rate limited per IP.

## Consequences

- A stolen access token works for at most 15 minutes. A stolen refresh cookie is detected the next time the
  real user refreshes, and both lose access.
- `SameSite=Lax` plus bearer headers on every other request means the API is not exposed to CSRF.
- The rate limiter keeps its counters in memory, so it is per process. Running more than one API instance
  needs a shared store (Redis, already in the plan).
- Expired refresh-token rows are not purged yet; a scheduled cleanup should be added.
- Anyone can sign up as a doctor. Verifying doctors is a product decision for later; the access rules
  above already limit what an unverified doctor can see to patients who chose them.
- Passwords from the Firebase version cannot be moved: Firebase's hashes are not verifiable here. Existing
  users have to sign up again (or reset their password once that flow exists).
- There is no "forgot password" yet.
