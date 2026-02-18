# Story 1.1: Project Initialization & Admin Login

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to log into a secure admin area,
so that I can access unit management tools without unauthorized users gaining access.

## Acceptance Criteria

1. **Given** the Astro project is initialized with Node adapter, TypeScript strict mode, SQLite database via Drizzle ORM, and the `admin_user` and `session` tables exist
   **When** an admin navigates to `/admin/login`
   **Then** a login form is displayed with username and password fields, both with associated labels, and the form includes a hidden CSRF token field

2. **Given** valid admin credentials have been created via the `create-admin.ts` CLI script
   **When** the admin submits correct username and password
   **Then** a session is created in the database, a session cookie is set with `HttpOnly`, `SameSite=Strict` (and `Secure` in production), and the admin is redirected to `/admin`

3. **Given** the login form is displayed
   **When** the admin submits incorrect credentials
   **Then** the form re-renders with an error message, no session is created, and the password field is cleared

4. **Given** an unauthenticated user
   **When** they attempt to access any `/admin/*` route (except `/admin/login`)
   **Then** they are redirected to `/admin/login` (FR25)

5. **Given** an authenticated admin session
   **When** the admin accesses any `/admin/*` route
   **Then** the page renders normally with session data available

6. **Given** the `create-admin.ts` script is executed
   **When** the admin provides a username and password
   **Then** the password is hashed with bcrypt and stored in the `admin_user` table

## Tasks / Subtasks

- [x] Task 1: Initialize Astro project (AC: #1)
  - [x] 1.1 Run `npm create astro@latest aine-program -- --template minimal --typescript strict --install --git`
  - [x] 1.2 Run `npx astro add node` to install `@astrojs/node` adapter
  - [x] 1.3 Configure `astro.config.mjs` with `output: 'server'` and Node adapter in standalone mode
  - [x] 1.4 Create `.nvmrc` with `24`
  - [x] 1.5 Create `.env.example` with `SESSION_SECRET`, `DATABASE_PATH=./data/sqlite.db`, `NODE_ENV=development`
  - [x] 1.6 Update `.gitignore` to exclude `data/`, `.env`, `node_modules/`
- [x] Task 2: Set up database layer (AC: #1)
  - [x] 2.1 Install `drizzle-orm`, `better-sqlite3`, `@types/better-sqlite3`
  - [x] 2.2 Install `drizzle-kit` as dev dependency
  - [x] 2.3 Create `drizzle.config.ts` pointing to `src/data/orm/schema.ts`
  - [x] 2.4 Create `src/data/orm/connection.ts` — single Drizzle database instance using `DATABASE_PATH` env var
  - [x] 2.5 Create `src/data/orm/schema.ts` — define `admin_user` table (id, username, password_hash, created_at) and `session` table (id, session_id, user_id, csrf_token, expires_at, created_at)
  - [x] 2.6 Run `npx drizzle-kit generate` to create initial migration in `drizzle/` directory
  - [x] 2.7 Ensure migrations run at app startup or provide a migration script
- [x] Task 3: Implement session management (AC: #2, #5)
  - [x] 3.1 Install `bcrypt`, `@types/bcrypt`
  - [x] 3.2 Create `src/auth/session.ts` with functions: `createSession(userId)`, `validateSession(sessionId)`, `destroySession(sessionId)`, `cleanExpiredSessions()`
  - [x] 3.3 Session cookie config: name `session_id`, `HttpOnly: true`, `SameSite: Strict`, `Secure: NODE_ENV === 'production'`, path `/`
  - [x] 3.4 Session TTL as a configurable constant (e.g., 24 hours)
- [x] Task 4: Implement CSRF protection (AC: #1, #2)
  - [x] 4.1 Create `src/auth/csrf.ts` with functions: `generateCsrfToken()`, `validateCsrfToken(sessionToken, formToken)`
  - [x] 4.2 CSRF token generated at session creation time and stored in the session record
  - [x] 4.3 Hidden field name is always `_csrf`
- [x] Task 5: Implement auth middleware (AC: #4, #5)
  - [x] 5.1 Create `src/middleware.ts` using Astro middleware API
  - [x] 5.2 On `/admin/*` routes (except `/admin/login`): read session cookie → validate session in DB → redirect to `/admin/login` if invalid/expired
  - [x] 5.3 On valid session: attach session data to `Astro.locals` (user id, csrf token)
  - [x] 5.4 On non-admin routes: pass through without auth check
  - [x] 5.5 Update `src/env.d.ts` to type `Astro.locals` with session data
- [x] Task 6: Create admin login page (AC: #1, #2, #3)
  - [x] 6.1 Create `src/data/validation/login.ts` — Zod schema: `loginSchema` with `username` (string, min 1) and `password` (string, min 1)
  - [x] 6.2 Create `src/pages/admin/login.astro` — same-page form handling pattern
  - [x] 6.3 GET: render login form with username field, password field, labels, hidden `_csrf` field
  - [x] 6.4 POST: validate CSRF → parse FormData → validate with Zod → verify credentials with bcrypt → create session → set cookie → redirect to `/admin`
  - [x] 6.5 On invalid credentials: re-render with generic error message ("Invalid username or password"), preserve username, clear password
  - [x] 6.6 On Zod validation failure: re-render with field-level errors using `aria-describedby`
- [x] Task 7: Create admin index placeholder (AC: #5)
  - [x] 7.1 Create `src/pages/admin/index.astro` — minimal authenticated page
  - [x] 7.2 Display "Admin Dashboard" heading and session info to confirm auth works
  - [x] 7.3 Include logout functionality (POST form to destroy session)
- [x] Task 8: Create admin user CLI script (AC: #6)
  - [x] 8.1 Install `tsx` as dev dependency for running TypeScript scripts
  - [x] 8.2 Create `scripts/create-admin.ts` — prompts for username and password
  - [x] 8.3 Hash password with bcrypt (salt rounds 10-12)
  - [x] 8.4 Insert into `admin_user` table
  - [x] 8.5 Handle duplicate username gracefully with error message
- [x] Task 9: Set up testing infrastructure (AC: all)
  - [x] 9.1 Install `vitest` as dev dependency
  - [x] 9.2 Create `vitest.config.ts`
  - [x] 9.3 Install `playwright` and `@playwright/test` as dev dependencies
  - [x] 9.4 Create `playwright.config.ts` with `testDir: 'e2e'`
  - [x] 9.5 Write `src/auth/session.test.ts` — test session creation, validation, expiry, destruction
  - [x] 9.6 Write `src/auth/csrf.test.ts` — test token generation and validation
  - [x] 9.7 Write `src/data/validation/login.test.ts` — test Zod schema validation

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly:**

- **Same-page form handling:** The login page MUST handle both GET (render form) and POST (process submission) in its Astro frontmatter. Successful POST ALWAYS redirects — never render after a successful write.
- **Data access boundary:** ALL database operations go through functions in `src/data/orm/queries.ts` or `src/data/orm/connection.ts`. Pages NEVER import `drizzle-orm` or `better-sqlite3` directly.
- **Auth boundary:** ALL session and CSRF logic lives in `src/auth/`. Pages call these functions — never implement auth logic inline.
- **Validation boundary:** ALL Zod schemas live in `src/data/validation/`. Never define inline validation in pages.

**Database Naming Conventions:**
- Table names: singular, snake_case — `admin_user`, `session`
- Column names: snake_case — `password_hash`, `session_id`, `csrf_token`, `expires_at`, `created_at`
- Indexes: `idx_{table}_{column}` — `idx_session_session_id`, `idx_session_expires_at`
- Drizzle maps snake_case DB columns to camelCase TypeScript properties automatically

**Code Naming Conventions:**
- Functions: camelCase — `createSession()`, `validateSession()`, `hashPassword()`
- Types: PascalCase — `SessionData`, `AdminUser`
- Zod schemas: camelCase with `Schema` suffix — `loginSchema`
- Files: kebab-case for TS modules (`session.ts`, `csrf.ts`), PascalCase for Astro components

**Anti-Patterns — NEVER do these:**
- Plural table names (`sessions` instead of `session`)
- camelCase DB columns (`passwordHash` instead of `password_hash`)
- Render a page after a successful POST write (always redirect)
- Use arrays or custom objects for form errors — use `Record<string, string>`
- Skip CSRF validation on any POST handler
- Import `drizzle-orm` or `better-sqlite3` from pages or components

### Error Display Pattern

```astro
<label for="username">Username</label>
<input id="username" name="username" value={formData.username} aria-describedby={errors.username ? "username-error" : undefined} />
{errors.username && <p id="username-error" class="admin-form__error">{errors.username}</p>}
```

### Same-Page Form Handling Pattern

```typescript
// In .astro frontmatter:
let errors: Record<string, string> = {};
let formData: Record<string, string> = {};

if (Astro.request.method === "POST") {
  // 1. Validate CSRF token
  // 2. Parse FormData
  // 3. Validate with Zod schema
  // 4. If validation fails: populate errors + formData, fall through to render
  // 5. If validation passes: write to DB, redirect with Response.redirect()
}
```

### Auth Middleware Pattern

```typescript
// src/middleware.ts
// 1. Read session cookie from request
// 2. Look up session in DB, check expiry
// 3. If invalid/expired: redirect to /admin/login
// 4. If valid: attach session data to Astro.locals, continue
// Skip auth check entirely for non-admin routes and /admin/login
```

### CSRF Token Pattern

1. Token generated and stored in session on login
2. Embedded in every form: `<input type="hidden" name="_csrf" value={csrfToken} />`
3. Validated on every POST before any processing
4. Field name is always `_csrf`

### Library & Framework Requirements

| Package | Version | Purpose |
|---|---|---|
| astro | latest (5.x) | MPA framework |
| @astrojs/node | latest (9.x) | SSR adapter for Node.js |
| drizzle-orm | 0.45.x | Type-safe ORM |
| drizzle-kit | 0.31.x | Migration generation |
| better-sqlite3 | 12.x | SQLite driver |
| bcrypt | latest | Password hashing |
| zod | latest | Form validation |
| vitest | 4.x | Unit/integration testing |
| playwright | 1.x | E2E testing |
| tsx | latest | TypeScript script runner |

Use `npm install` for runtime deps and `npm install -D` for dev deps. Let the package manager resolve to the latest compatible versions within these major ranges.

### Project Structure Notes

Files to create in this story:

```
aine-program/
├── .env.example
├── .nvmrc
├── astro.config.mjs          (modify — add output: 'server', adapter)
├── drizzle.config.ts          (create)
├── vitest.config.ts           (create)
├── playwright.config.ts       (create)
├── tsconfig.json              (modify if needed)
├── drizzle/
│   └── migrations/            (generated)
├── e2e/                       (create directory)
├── scripts/
│   └── create-admin.ts        (create)
├── src/
│   ├── env.d.ts               (modify — add Astro.locals types)
│   ├── middleware.ts           (create)
│   ├── auth/
│   │   ├── session.ts         (create)
│   │   ├── session.test.ts    (create)
│   │   ├── csrf.ts            (create)
│   │   └── csrf.test.ts       (create)
│   ├── data/
│   │   ├── orm/
│   │   │   ├── connection.ts  (create)
│   │   │   └── schema.ts      (create)
│   │   └── validation/
│   │       ├── login.ts       (create)
│   │       └── login.test.ts  (create)
│   └── pages/
│       └── admin/
│           ├── index.astro    (create)
│           └── login.astro    (create)
└── data/                      (create — SQLite db location, gitignored)
```

### Database Schema for This Story

```sql
-- admin_user table
CREATE TABLE admin_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- session table
CREATE TABLE session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES admin_user(id),
  csrf_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_session_session_id ON session(session_id);
CREATE INDEX idx_session_expires_at ON session(expires_at);
```

Define these using Drizzle ORM's SQLite schema builder, NOT raw SQL. The SQL above is for reference only.

### References

- [Source: architecture.md#Starter-Template-Evaluation] — Astro initialization command and adapter setup
- [Source: architecture.md#Data-Architecture] — Drizzle ORM schema, migration approach, naming conventions
- [Source: architecture.md#Authentication-&-Security] — Session management, bcrypt, CSRF pattern
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — Same-page form handling, error display, naming conventions, anti-patterns
- [Source: architecture.md#Project-Structure-&-Boundaries] — Complete directory structure, data access boundary, auth boundary
- [Source: epics.md#Story-1.1] — Acceptance criteria and user story
- [Source: prd.md#Authentication-&-Access-Control] — FR24, FR25, FR26
- [Source: ux-design-specification.md#Form-Patterns] — Labels above inputs, required field marking, server-side validation
- [Source: ux-design-specification.md#Accessibility-Strategy] — WCAG AA, keyboard nav, aria-describedby for errors

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

### Completion Notes List

- Astro 5.17.3 initialized with @astrojs/node 9.5.4 in standalone server mode
- SQLite database via better-sqlite3 12.6.2 with Drizzle ORM 0.45.1; schema defines admin_user and session tables with snake_case naming
- Drizzle Kit generates migrations; migrations auto-run at app startup via middleware
- Session management: UUID-based session IDs, bcrypt password hashing (12 rounds), 24h TTL, HttpOnly/SameSite=Strict cookies
- CSRF protection: token generated per session, timing-safe comparison validation, `_csrf` hidden field
- Auth middleware protects all /admin/* routes (except /admin/login), attaches session data to Astro.locals
- Login page follows same-page form handling pattern with Zod validation, aria-describedby error display
- Admin dashboard placeholder with logout functionality via CSRF-protected POST form
- create-admin.ts CLI script: interactive prompts, bcrypt hashing, duplicate username handling
- 13 unit tests across 3 test files (csrf, session, login validation) — all passing
- Vitest configured for co-located tests, Playwright configured for e2e/ directory

### Change Log
- 2026-02-18: Story created by create-story workflow — ready-for-dev
- 2026-02-18: Implementation complete — all 9 tasks done, 13 tests passing, build successful
- 2026-02-18: Code review fixes — refactored SessionManager to class with DI, added generateCsrfToken(), created user-repository, fixed .gitignore, removed redundant index, 18 tests passing

### File List

- package.json (created)
- package-lock.json (generated)
- tsconfig.json (created)
- astro.config.mjs (created)
- .env.example (created)
- .gitignore (created)
- .nvmrc (created)
- drizzle.config.ts (created)
- vitest.config.ts (created)
- playwright.config.ts (created)
- drizzle/0000_graceful_shotgun.sql (generated)
- drizzle/meta/0000_snapshot.json (generated)
- drizzle/meta/_journal.json (generated)
- e2e/.gitkeep (created)
- scripts/create-admin.ts (created)
- src/env.d.ts (created)
- src/middleware.ts (created)
- src/auth/index.ts (created)
- src/auth/session.ts (created)
- src/auth/session.test.ts (created)
- src/auth/csrf.ts (created)
- src/auth/csrf.test.ts (created)
- src/data/orm/connection.ts (created)
- src/data/orm/schema.ts (created)
- src/data/orm/types.ts (created)
- src/data/repo/user-repository.ts (created)
- src/data/validation/login.ts (created)
- src/data/validation/login.test.ts (created)
- src/pages/index.astro (created)
- src/pages/admin/index.astro (created)
- src/pages/admin/login.astro (created)
