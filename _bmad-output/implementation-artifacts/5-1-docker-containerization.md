# Story 5.1: Docker Containerization

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to deploy the application via Docker,
So that the app runs reliably in production and admin changes are immediately visible to players.

## Acceptance Criteria

1. **Given** a multi-stage Dockerfile targeting Node.js 24 Alpine and a `docker-compose.yml` in the project root
   **When** `docker compose up` is run
   **Then** the Astro app builds, installs production dependencies, starts the Node server, and is accessible at `http://localhost:4000`

2. **Given** Docker Compose is configured with a named volume for the SQLite database
   **When** the container restarts
   **Then** all data persists across restarts

3. **Given** environment variables `SESSION_SECRET`, `DATABASE_PATH`, and `NODE_ENV` are set in Docker Compose
   **When** the app starts
   **Then** the app uses these values for session signing, database location, and environment mode

4. **Given** an admin creates or edits a unit via the admin interface
   **When** a player loads any public page
   **Then** the changes are immediately visible because pages are server-rendered from the database on each request (FR23)

5. **Given** the production Docker image
   **When** inspected
   **Then** it contains only the build output and production dependencies with no dev dependencies or source files

## Tasks / Subtasks

- [ ] Task 1: Modify `connection.ts` to auto-run migrations on startup (AC: #1, #2, #3)
  - [ ] 1.1 Remove the `if (isTestEnv)` guard around `runMigrations()` so migrations run on every server startup (idempotent — Drizzle skips already-applied migrations)
  - [ ] 1.2 Verify dev server still starts correctly with auto-migration
  - [ ] 1.3 Verify all existing tests still pass (`npm run test`)

- [ ] Task 2: Create `.dockerignore` (AC: #5)
  - [ ] 2.1 Exclude `node_modules/`, `dist/`, `data/`, `.env`, `.git/`, `.gitignore`, `.astro/`, `.idea/`, `e2e/`, `_bmad*/`, `*.md`

- [ ] Task 3: Create multi-stage `Dockerfile` (AC: #1, #5)
  - [ ] 3.1 Stage 1 (`deps`): Node 24 Alpine + build tools (`python3`, `make`, `g++`) for native deps (bcrypt, better-sqlite3). Copy `package.json` + `package-lock.json`, run `npm ci`
  - [ ] 3.2 Stage 2 (`builder`): Extend `deps`, copy source, run `npm run build`
  - [ ] 3.3 Stage 3 (`prod-deps`): Clean Node 24 Alpine + build tools, copy `package.json` + `package-lock.json`, run `npm ci --omit=dev`
  - [ ] 3.4 Stage 4 (`production`): Clean Node 24 Alpine (no build tools). Copy `node_modules` from `prod-deps`, `dist/` from `builder`, `drizzle/` from `builder`, `package.json`
  - [ ] 3.5 Set `HOST=0.0.0.0`, `PORT=4000`, `NODE_ENV=production`. `EXPOSE 4000`
  - [ ] 3.6 CMD: `node dist/server/entry.mjs`

- [ ] Task 4: Create `docker-compose.yml` (AC: #1, #2, #3)
  - [ ] 4.1 Single service `app` with `build: .`
  - [ ] 4.2 Port mapping: `4000:4000`
  - [ ] 4.3 Named volume `sqlite-data` mapped to `/app/data` for SQLite persistence
  - [ ] 4.4 Environment: `SESSION_SECRET`, `DATABASE_PATH=/app/data/sqlite.db`, `NODE_ENV=production`
  - [ ] 4.5 Restart policy: `unless-stopped`

- [ ] Task 5: Verify Docker build and operation (AC: all)
  - [ ] 5.1 `docker compose up` builds and starts successfully
  - [ ] 5.2 App accessible at `http://localhost:4000`
  - [ ] 5.3 Admin login works, can create/edit units, changes visible on public pages
  - [ ] 5.4 Data persists after `docker compose down && docker compose up`
  - [ ] 5.5 Inspect production image: no dev dependencies, no source files
  - [ ] 5.6 All existing tests still pass (`npm run test`, `npm run test:e2e`)

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly:**

- **Multi-stage Dockerfile:** 4 stages — `deps`, `builder`, `prod-deps`, `production`. Final image contains ONLY `dist/`, production `node_modules/`, `drizzle/` migrations, and `package.json`. No source files, no dev dependencies, no build tools.
- **Native dependencies:** `bcrypt` and `better-sqlite3` require Alpine build tools (`python3`, `make`, `g++`) for compilation. Install in `deps` and `prod-deps` stages. The final `production` stage copies pre-compiled `node_modules` — no build tools needed there.
- **SQLite via Docker volume:** Named volume `sqlite-data` maps to `/app/data/`. `DATABASE_PATH` must point inside this mount (`/app/data/sqlite.db`). The `connection.ts` module auto-creates the directory if missing via `mkdirSync({ recursive: true })`.
- **Auto-migration on startup:** Remove the `if (isTestEnv)` guard in `connection.ts` so `runMigrations()` runs unconditionally. Drizzle migrations are idempotent — already-applied migrations are skipped. The `drizzle/` folder must be present in the production image at `./drizzle` (relative to working directory `/app`).
- **Host binding:** Astro's `@astrojs/node` adapter reads `HOST` and `PORT` env vars. Docker requires `HOST=0.0.0.0` to expose the server outside the container. Port is `4000`.
- **No application logic changes:** `astro.config.mjs`, middleware, pages, components, and all other source files remain unchanged. Only `connection.ts` is modified (migration guard removal).

### Existing Files to REUSE (Do NOT Recreate)

| File | Purpose |
|---|---|
| `astro.config.mjs` | Astro config with `@astrojs/node` adapter in `standalone` mode — no changes needed |
| `src/data/orm/connection.ts` | DB connection + `runMigrations()` — modify to remove test-only guard |
| `.env.example` | Documents env vars (`SESSION_SECRET`, `DATABASE_PATH`, `NODE_ENV`) — no changes needed |
| `package.json` | `npm run build` produces Astro server bundle in `dist/` — no changes needed |
| `drizzle/` | 3 migration SQL files — must be copied to production image |
| `.nvmrc` | Specifies Node 24 — Dockerfile must match this version |

### connection.ts Modification

Change from:

```typescript
if (isTestEnv) {
  runMigrations();
}
```

To:

```typescript
runMigrations();
```

**Rationale:** Drizzle migrations are idempotent — `migrate()` checks a journal table and skips already-applied migrations. Auto-running on every startup ensures:
- Docker containers always have the latest schema on first boot
- Dev server auto-applies migrations after `npm run generate` (improved DX — no manual `npm run migrate` step)
- Test mode works exactly as before (in-memory DB gets schema on each run)
- No separate entrypoint script or migration step needed in Docker

### Dockerfile — Implementation Guidance

```dockerfile
FROM node:24-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:24-alpine AS prod-deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000
CMD ["node", "dist/server/entry.mjs"]
```

**Key decisions:**
- `deps` stage: all dependencies (dev + prod) needed for `npm run build` (Astro build requires dev deps like `drizzle-kit`)
- `prod-deps` stage: separate clean install with `--omit=dev` — only runtime packages (astro, drizzle-orm, better-sqlite3, bcrypt, zod)
- Build tools (`python3`, `make`, `g++`) in `deps` and `prod-deps` for compiling native bindings, but NOT in the final stage — compiled `.node` files carry over via `node_modules` copy
- `builder` extends `deps` (reuses cached `node_modules` layer) to run the Astro build
- Final stage: clean Alpine with no build tools, no source code, no dev dependencies

### docker-compose.yml — Implementation Guidance

```yaml
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - SESSION_SECRET=change-me-to-a-secure-random-string
      - DATABASE_PATH=/app/data/sqlite.db
      - NODE_ENV=production
    volumes:
      - sqlite-data:/app/data
    restart: unless-stopped

volumes:
  sqlite-data:
```

**Key decisions:**
- Named volume `sqlite-data` persists the SQLite database across container rebuilds and restarts
- `DATABASE_PATH=/app/data/sqlite.db` aligns with the volume mount at `/app/data`
- No separate database container — SQLite is embedded in the Node process
- `restart: unless-stopped` recovers from crashes but respects manual `docker compose stop`
- `SESSION_SECRET` placeholder — user must change before production use

### .dockerignore — Implementation Guidance

```
node_modules
dist
data
.env
.git
.gitignore
.astro
.idea
e2e
_bmad*
_bmad-output
*.md
```

Excludes dev artifacts, test files, documentation, and local data from the Docker build context. The `drizzle/` directory is NOT excluded — it must be available during the build for copying to the production image.

### Library & Framework Requirements

No new dependencies. All packages already installed. No `package.json` changes needed.

| Package | Version | Relevance to This Story |
|---|---|---|
| `astro` | ^5.17.3 | `npm run build` produces `dist/server/entry.mjs` — the production server entrypoint |
| `@astrojs/node` | ^9.5.4 | Standalone mode creates a Node HTTP server; reads `HOST` and `PORT` env vars |
| `better-sqlite3` | ^12.6.2 | Native addon — requires `python3 make g++` on Alpine to compile |
| `bcrypt` | ^6.0.0 | Native addon — requires `python3 make g++` on Alpine to compile |
| `drizzle-orm` | ^0.45.1 | `migrate()` function used for auto-migration on startup |

### File Structure Requirements

```
aine-program/
├── .dockerignore              (create)
├── Dockerfile                 (create)
├── docker-compose.yml         (create)
└── src/
    └── data/
        └── orm/
            └── connection.ts  (modify — remove migration test-only guard)
```

**No other files are created or modified.** This is a pure infrastructure story.

### Testing Requirements

**No new tests are needed for this story.** Docker containerization is verified manually (Task 5).

**Regression verification (required):**
- `npm run test` — all 129 existing unit tests must pass (the `connection.ts` change must not break anything)
- `npm run build` — must succeed with no errors
- `npm run test:e2e` — all 32 existing E2E tests must pass

**Manual Docker verification (Task 5):**
- `docker compose up` builds and starts without errors
- App responds at `http://localhost:4000`
- Admin login, unit CRUD, and public page rendering all work
- `docker compose down && docker compose up` preserves all data
- `docker compose exec app ls node_modules/.package-lock.json` or similar to confirm no dev deps in image

### Admin User Creation in Docker

The `scripts/create-admin.ts` script requires `tsx` (a devDependency not present in the production image). To create an admin user in a running Docker container:

1. **Before first deploy:** Run `npm run create-admin` locally with `DATABASE_PATH` pointing to the volume-mounted database file
2. **Or after deploy:** Use a one-off container with dev dependencies:
   ```bash
   docker compose run --rm -e DATABASE_PATH=/app/data/sqlite.db --entrypoint "" app sh -c "npx tsx scripts/create-admin.ts"
   ```
   Note: this will fail in the production image since `tsx` is not installed. The recommended approach is to create the admin user locally before deploying, or mount the data volume to a local environment for admin creation.

This is an existing limitation — not in scope for this story.

### Cross-Epic Intelligence (from Stories 1.1–4.1)

- **`@/` alias enforcement:** Dev agents used relative imports in 3/5 Epic 1 stories. This story only modifies `connection.ts` which already uses relative imports for local `./schema` — that's fine since it's within the same directory. Do NOT change existing import style in this file.
- **connection.ts is a singleton module:** Imported once per server process. `runMigrations()` runs exactly once on server startup, not per-request.
- **`data/` directory is gitignored:** The SQLite database lives at `./data/sqlite.db` locally. In Docker, the volume mount at `/app/data` serves the same purpose. The `connection.ts` auto-creates this directory if missing.
- **E2E tests use in-memory SQLite:** `NODE_ENV=test` triggers `:memory:` database in `connection.ts`. The migration change (removing `if (isTestEnv)` guard) does NOT affect test behavior — unconditional `runMigrations()` still runs for in-memory DB.

### Git Intelligence

Recent commits (last 5):
- `4e88d87` — code review of 4.1
- `e53cdfc` — 4.1 dev complete
- `d932206` — fixes (story 3.1)
- `7d29559` — story 3.1 dev complete
- `8bccdf0` — Create UnitPresenter

Relevant patterns:
- Build succeeds cleanly (`npm run build` verified in every story)
- 129 unit tests + 32 E2E tests form the regression baseline
- No Docker-related files exist yet — this is a greenfield task within the project

### Anti-Patterns — NEVER Do These

- Install build tools (`python3`, `make`, `g++`) in the final production stage — only needed in `deps`/`prod-deps` for compilation
- Use `npm install` instead of `npm ci` in Dockerfile — `ci` ensures reproducible installs from lockfile
- Copy the entire source tree to the production stage — only `dist/`, `drizzle/`, `node_modules/`, and `package.json` belong there
- Expose SQLite database without a volume — data will be lost on container recreation
- Use `localhost` or `127.0.0.1` for HOST — must be `0.0.0.0` for Docker
- Add an ENTRYPOINT migration script — migrations auto-run via `connection.ts` on startup
- Modify `astro.config.mjs` for Docker — it already works as-is with env vars
- Use port 4321 — this project uses port **4000**
- Include `e2e/`, `_bmad*/`, or `*.md` files in the Docker image
- Add `tsx` to production dependencies for the create-admin script
- Skip copying `drizzle/` to the production image — migrations need the SQL files at runtime

### Project Structure Notes

Alignment with unified project structure:
- `Dockerfile` and `docker-compose.yml` at project root per architecture spec
- `.dockerignore` at project root (standard Docker convention)
- `connection.ts` modification is minimal — single line removal
- No new directories created
- Production image layout mirrors architecture doc: `dist/server/entry.mjs` as entrypoint, `drizzle/` for migrations, `data/` for SQLite (via volume)

### References

- [Source: epics.md#Epic-5] — Epic objectives, FR23 coverage
- [Source: epics.md#Story-5.1] — Acceptance criteria, user story
- [Source: architecture.md#Infrastructure-&-Deployment] — Docker strategy, Docker Compose, environment configuration
- [Source: architecture.md#Core-Architectural-Decisions] — Docker + Docker Compose as critical decision
- [Source: architecture.md#Data-Architecture] — Migration approach, Drizzle Kit, DATABASE_PATH
- [Source: architecture.md#Authentication-&-Security] — SESSION_SECRET, bcrypt (native dep)
- [Source: architecture.md#Project-Structure-&-Boundaries] — Complete directory structure including Dockerfile, docker-compose.yml
- [Source: architecture.md#Development-Workflow] — `docker compose up --build` command, `npm run build`
- [Source: architecture.md#Starter-Template-Evaluation] — Node.js 24, @astrojs/node standalone mode
- [Source: connection.ts] — Current migration logic, DATABASE_PATH handling, directory auto-creation
- [Source: .env.example] — Environment variable documentation
- [Source: package.json] — Build scripts, dependency versions
- [Source: 4-1-search-bar-search-results.md] — Most recent story for regression baseline (129 unit tests, 32 E2E)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

### File List
