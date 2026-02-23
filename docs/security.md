# Security Review

**Date:** 2026-02-23
**Scope:** Full application codebase

---

## Critical

### SEC-01: Hardcoded session secret in docker-compose.yml

**File:** `docker-compose.yml:8`

The production docker-compose file hardcodes `SESSION_SECRET=secret`. While this env var is not currently consumed by application code (see SEC-02), it signals intent to use it for session signing. Anyone reading the compose file knows the value.

**Recommendation:** Use a `.env` file or Docker secrets. Never commit secrets to version control.

### SEC-02: SESSION_SECRET is declared but never used

**Files:** `.env`, `.env.example`, `docker-compose.yml`

`SESSION_SECRET` is defined in environment configuration but no application code reads it. Session IDs are plain `randomUUID()` values stored in the database. There is no HMAC signing or encryption of the session cookie value.

If the database is leaked or the session table is readable via SQL injection in a future feature, an attacker could directly forge session cookies since the raw session ID is the cookie value with no additional cryptographic binding.

**Recommendation:** Sign or HMAC the session cookie value using the `SESSION_SECRET` so that database-only leaks cannot produce valid cookies.

---

## High

### SEC-03: No rate limiting on login

**File:** `src/pages/admin/login.astro`

The login endpoint has no rate limiting, account lockout, or progressive delay. An attacker can make unlimited password-guessing attempts.

**Recommendation:** Implement rate limiting per IP and/or per username. Consider exponential backoff or temporary lockout after N failed attempts.

### SEC-04: Test fixtures endpoint ships in all builds

**File:** `src/pages/api/fixtures.ts`

The `/api/fixtures` POST endpoint exists in the production build. It checks `process.env.NODE_ENV !== "test"` and returns 400, but the route is still registered and reachable. If `NODE_ENV` were ever misconfigured or unset, the endpoint would allow wiping and reseeding the entire database.

**Recommendation:** Exclude this file from production builds entirely (e.g., via build-time conditional or a separate test-only Astro config). A runtime env check is insufficient as a sole guard.

### SEC-05: Docker container runs as root

**File:** `Dockerfile`

The final stage has no `USER` directive. The Node.js process runs as root inside the container. If an attacker achieves code execution, they have full root access within the container.

**Recommendation:** Add a non-root user:

```dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```

---

## Medium

### SEC-06: No security response headers

**File:** `src/middleware.ts`

The middleware sets `Cache-Control` but no security headers. Missing:

- `Content-Security-Policy` — no CSP means inline scripts and unrestricted resource loading
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or `SAMEORIGIN`)
- `Referrer-Policy`
- `Strict-Transport-Security` (for production)
- `Permissions-Policy`

**Recommendation:** Add standard security headers in the middleware for all responses.

### SEC-07: No password complexity requirements

**Files:** `src/data/validation/login.ts`, `scripts/create-admin.ts`

The login schema requires only `min(1)` for password. The `create-admin` script accepts any non-empty password. A single-character password is valid.

**Recommendation:** Enforce a minimum password length (e.g., 12+ characters) in the `create-admin` script. The login form validation should stay permissive (so it doesn't leak policy info), but the creation path should enforce strength.

### SEC-08: Expired sessions are never cleaned up

**File:** `src/auth/session.ts`

`cleanExpiredSessions()` exists but is never called. Expired session rows accumulate indefinitely. This is a data hygiene issue that could also mask unauthorized access in logs.

**Recommendation:** Call `cleanExpiredSessions()` periodically — on login, on a timer, or via a cron job hitting a maintenance endpoint.

### SEC-09: Misconfigured allowedDomains in Astro config

**File:** `astro.config.mjs:13`

```js
allowedDomains: [{}],
```

This passes an empty object literal, which is almost certainly not the intended configuration. Depending on how Astro interprets this, it may silently allow all origins or do nothing.

**Recommendation:** Either remove the property or provide valid domain strings per Astro's documentation.

### SEC-10: Old sessions not invalidated on new login

**File:** `src/auth/session.ts`

When a user logs in, `createSession()` inserts a new row but does not invalidate prior sessions for the same user. If a session token was compromised, logging in again does not revoke it.

**Recommendation:** On successful login, destroy all existing sessions for that `userId` before creating the new one (or provide an explicit "log out everywhere" feature).

---

## Low

### SEC-11: create-admin script echoes password to terminal

**File:** `scripts/create-admin.ts`

`rl.question("Password: ")` displays the typed password in plaintext. This is visible in terminal history and over-the-shoulder.

**Recommendation:** Use a library or raw terminal mode to mask password input.

### SEC-12: No HTTPS enforcement

The application binds to `0.0.0.0:4000` with no TLS termination. In production, if a reverse proxy is not in front of this, all traffic (including session cookies and passwords) is sent in cleartext.

**Recommendation:** Document that a TLS-terminating reverse proxy (nginx, Caddy, etc.) is required for production. Consider refusing to start without `SESSION_SECRET` set and `NODE_ENV=production` if no proxy is detected.

### SEC-13: Secure cookie flag is false in development

**File:** `src/auth/session.ts:87`

`secure: isProduction` means the session cookie is sent over HTTP in development. This is standard practice but worth noting: development environments on shared networks expose the session token.

**Recommendation:** Acceptable for local development. No action needed unless dev is done on shared/remote machines.

---

## Positive Findings

The following security practices are already in place and well implemented:

- **CSRF protection** — All mutating admin forms include a CSRF token validated with `timingSafeEqual`. The timing-safe comparison in `src/auth/csrf.ts` prevents timing attacks.
- **Bcrypt password hashing** — 12 rounds via `bcrypt`. Solid.
- **SQL injection prevention** — Drizzle ORM parameterizes all queries. The `searchUnitsByName` function properly escapes LIKE wildcards.
- **Session cookie flags** — `httpOnly: true`, `sameSite: "strict"`, `secure` in production, scoped `path: "/"`.
- **Origin checking** — Astro's built-in `checkOrigin` is enabled for non-test environments.
- **Input validation** — Zod schemas validate all form inputs server-side before database writes.
- **Auth middleware** — All `/admin` routes (except login) require a valid session. Expired sessions are rejected and cleaned up on access.
- **Foreign key enforcement** — `PRAGMA foreign_keys = ON` prevents orphaned records.
- **`.env` in `.gitignore`** — Secrets file is excluded from version control.
- **Multi-stage Docker build** — Only production dependencies and built artifacts are in the final image.
