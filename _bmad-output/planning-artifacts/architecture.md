---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
lastStep: 8
status: 'complete'
completedAt: '2026-02-18'
inputDocuments:
  - prd.md
  - ux-design-specification.md
workflowType: 'architecture'
project_name: 'aine-program'
user_name: 'B'
date: '2026-02-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

26 FRs across 5 categories. The split is roughly 40% admin CRUD (FR14-FR23), 35% player-facing browsing and search (FR1-FR8), 20% detail display with nested data (FR9-FR13), and 5% auth gating (FR24-FR26). Architecturally, this is a standard server-rendered CRUD app with a public read-only layer and a protected write layer.

**Non-Functional Requirements:**

- Performance: 2s page loads, 1s search results, 3s admin saves, cacheable static content
- Security: Authenticated admin routes, hashed credentials, secure session management, no sensitive data on public pages
- Accessibility: WCAG AA — keyboard navigation, 4.5:1 contrast ratios, semantic HTML, labeled forms, aria attributes on errors

**Scale & Complexity:**

- Primary domain: Web (server-rendered MPA)
- Complexity level: Low
- Estimated architectural components: ~6 (routing/pages, data model/persistence, search, auth/sessions, admin CRUD forms, public display templates)

### Technical Constraints & Dependencies

- MPA architecture with server-rendered HTML — no SPA frameworks, no client-side routing
- No JavaScript components — interactivity limited to native HTML elements and form submissions
- Custom CSS with BEM — no CSS framework, no preprocessor, no build step for styles
- Solo developer — architecture must be simple to maintain and extend by one person
- Greenfield — no legacy constraints, no existing data to migrate

### Cross-Cutting Concerns Identified

- **Authentication & authorization** — Binary split: public pages (no auth) vs. admin pages (auth required). Affects routing, middleware, and template rendering.
- **SEO** — Server-rendered HTML, unique URLs, semantic markup, structured data (schema.org), meta tags per page. Influences page structure and URL design.
- **Accessibility (WCAG AA)** — Impacts every template: heading hierarchy, form labels, keyboard focus management, contrast, aria attributes.
- **Caching** — Content changes only through admin updates. Pages are highly cacheable. Architecture should support aggressive caching or static generation with cache invalidation on admin writes.
- **Data hierarchy** — Unit > Model > Equipment Option with default/alternative relationships. Appears in admin forms (nested CRUD), detail pages (nested display), and index cards (summary projection). The data model design propagates through every layer.

## Starter Template Evaluation

### Technical Preferences

- **Language:** TypeScript
- **Framework:** Astro (MPA-first, server-rendered)
- **Database:** SQLite via better-sqlite3
- **ORM:** Drizzle ORM (type-safe, lightweight)
- **Containerization:** Docker + Docker Compose

### Primary Technology Domain

Server-rendered web application (MPA) based on project requirements analysis. Astro's MPA-first architecture aligns directly with the PRD's explicit requirement for server-rendered pages with minimal JavaScript.

### Starter Options Considered

**1. `npm create astro@latest` (Official CLI) — Selected**
Minimal, well-maintained starter. TypeScript, Vite, file-based routing out of the box. No unnecessary dependencies. Actively maintained by the Astro core team.

**2. Community Astro starters**
Evaluated and rejected. Most include Tailwind, React/Vue islands, or content collections — all unnecessary for this project and would need to be removed.

### Selected Starter: Astro Official (via create astro CLI)

**Rationale for Selection:**
- MPA by default — no client-side router, no JS bundle unless explicitly opted in
- File-based routing maps naturally to the page structure (index, detail, search, admin)
- SSR via `@astrojs/node` adapter supports dynamic pages, form handling, cookies, and auth
- Ships zero JavaScript to the browser by default — matches the "no JS components" UX requirement
- Vite build tooling is fast and requires no configuration
- Active maintenance and LTS stability from the Astro team

**Initialization Command:**

```bash
npm create astro@latest aine-program -- --template minimal --typescript strict --install --git
```

Then add the Node adapter:

```bash
cd aine-program && npx astro add node
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript in strict mode
- Node.js 24 (as set in `.nvmrc`)
- Astro 5.17.2

**Server Adapter:**
- `@astrojs/node` 9.5.3 — enables SSR with `output: 'server'`
- Standalone Node.js HTTP server (no Express/Fastify required, though compatible)

**Styling Solution:**
- Plain CSS with BEM naming — no CSS framework, no preprocessor
- CSS custom properties for design tokens as specified in UX spec
- **CSS file organization:**
  - Each BEM block gets its own CSS file
  - If a BEM block is used in an Astro component, the CSS file goes in the same directory with the same name but `.css` extension (e.g., `Button.astro` and `Button.css`, `Field.astro` and `Field.css`)
  - `public/styles.css` serves as the global reset and `:root` CSS custom property definitions only — no BEM block styles in this file
  - Astro components import their co-located CSS file to include it in the page bundle

**Build Tooling:**
- Vite (bundled with Astro)
- No additional build configuration needed
- CSS is processed directly — no preprocessor, no build step for styles

**Testing Framework:**
- Not included by starter — to be selected in architectural decisions step

**Code Organization:**
- `src/pages/` — file-based routing (each `.astro` file = one URL)
- `src/layouts/` — shared page layouts (header, footer, base HTML)
- `src/components/` — reusable Astro components (server-rendered)
- `src/lib/` or `src/db/` — database schema, queries, utilities
- `public/` — static assets served as-is

**Development Experience:**
- Hot module reloading via Vite dev server
- TypeScript type checking
- Astro VS Code extension for `.astro` file support

### Additional Stack Decisions

**Database Layer (to be installed alongside starter):**
- `drizzle-orm` 0.45.1 — type-safe ORM with SQLite support
- `drizzle-kit` 0.31.9 — migration generation and management
- `better-sqlite3` 12.6.2 — synchronous SQLite driver (fast, well-suited for single-server)

**Containerization:**
- Dockerfile for Node.js 24 production build
- Docker Compose for full stack orchestration
- SQLite database file persisted via Docker volume

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model schema with separate default equipment column on model
- Session-based authentication with bcrypt password hashing
- Astro SSR with same-page form handling pattern
- Docker + Docker Compose containerization

**Important Decisions (Shape Architecture):**
- Zod validation integrated with Drizzle schema
- CSRF token protection on all forms
- HTTP cache headers on public pages
- URL structure with slugs for public pages, IDs for admin
- Vitest + Playwright testing strategy

**Deferred Decisions (Post-MVP):**
- Hosting provider selection (deferred per user preference)
- CI/CD pipeline (deferred until hosting is chosen)
- Monitoring and alerting (not needed at MVP scale)

### Data Architecture

**Data Modeling:**
- Drizzle ORM schema defines the Unit > Model > Equipment Option hierarchy
- Equipment options have a many-to-many relationship with models via a `model_equipment_option` association table with a composite primary key (`model_id`, `equipment_option_id`)
- The association table carries an `is_default` integer flag (0 or 1) per association row; a model can have multiple default equipment options simultaneously
- Rationale: equipment options can be shared across models, defaults are tracked per-association without constraining to a single default, and the join table cleanly cascades on deletion of either side
- Unit table has a `slug` column with a unique index; slugs are auto-generated from the unit name but editable by admin in forms
- Slug uniqueness enforced at the DB level and validated before save

**Data Validation:**
- Zod for all admin form input validation
- Zod schemas derived from or aligned with Drizzle table schemas for consistency
- Validation runs server-side before any database write
- Validation errors re-render the form with per-field error messages

**Migration Approach:**
- Drizzle Kit 0.31.9 for schema-first migration generation
- Migrations stored in `drizzle/` directory and committed to version control
- When schemas are changed, run `npm run generate` to create migrations
- To update the database to the latest schema and apply all migrations, run `npm run migrate`

**Caching Strategy:**
- HTTP `Cache-Control` headers on public pages (index, detail, search)
- Pages are server-rendered on each request; caching is handled at the HTTP layer
- No complex invalidation logic — content changes are reflected on the next uncached request
- Admin pages are never cached (`Cache-Control: no-store`)

### Authentication & Security

**Authentication Method:**
- Simple session-based authentication with username and password
- Single admin user; credentials stored in SQLite database
- No registration flow, no external auth providers

**Password Hashing:**
- bcrypt for password hashing
- Rationale: battle-tested, widely supported, no native compilation issues in Docker

**Session Management:**
- Sessions stored in SQLite (sessions table)
- Cookie-based session ID with secure flags: `HttpOnly`, `Secure` (production), `SameSite=Strict`
- Configurable session TTL with expiry cleanup

**CSRF Protection:**
- CSRF token generated per session and embedded as a hidden field in every form
- Token validated on every POST request before processing
- Prevents cross-site form submission attacks

**Access Control:**
- Binary split: public routes (no auth) vs. admin routes (auth required)
- Middleware checks session cookie on all `/admin/*` routes
- Unauthenticated requests to admin routes redirect to `/admin/login`

### API & Communication Patterns

**Form Handling:**
- Same-page form handling pattern throughout
- Each `.astro` page handles both GET (render form) and POST (process submission) in its frontmatter
- POST processing: validate with Zod → save to DB → redirect on success, or re-render with errors
- Matches the classic MPA form pattern; no separate API endpoints needed

**Error Handling:**
- Form validation errors: re-render the page with inline error messages per field (red accent color, linked via `aria-describedby`)
- 404: custom `src/pages/404.astro` page
- 500: custom error page, error logged to stdout
- Search no results: handled in search page template per UX spec

### Frontend Architecture

**URL Structure:**

| Route | Purpose |
|---|---|
| `/` | Index — alphabetical unit card grid |
| `/units/[slug]` | Unit detail page (SEO-friendly slug) |
| `/search?q=` | Search results page |
| `/admin` | Admin unit list |
| `/admin/units/new` | Create unit form |
| `/admin/units/[id]/edit` | Edit unit form |
| `/admin/login` | Login page |

- Public pages use URL slugs (SEO-friendly, human-readable)
- Admin pages use numeric IDs (simpler, no slug management overhead)

**Component Architecture:**
- Astro components (`.astro` files) for all UI — server-rendered, zero client JS
- Shared layout in `src/layouts/` for header, footer, base HTML shell
- Reusable components in `src/components/` for cards, breadcrumbs, forms, tables
- BEM class naming throughout; each BEM block in its own co-located `.css` file

### Infrastructure & Deployment

**Docker Strategy:**
- Multi-stage Dockerfile targeting Node.js 24 Alpine
- Stage 1: install dependencies + build Astro (`astro build`)
- Stage 2: copy build output + production dependencies only, run Node server
- Lean production image with minimal attack surface

**Docker Compose:**
- Single service: Astro SSR app
- Named volume for SQLite database persistence
- Environment variables passed via Compose `environment` block
- No separate database container (SQLite is embedded)

**Environment Configuration:**
- `SESSION_SECRET` — signing key for session cookies (required)
- `DATABASE_PATH` — path to SQLite file (default: `./data/sqlite.db`)
- `NODE_ENV` — `production` or `development`
- `.env` file for local development (gitignored)
- Docker Compose `environment` block for container configuration

**Logging:**
- Structured logging to stdout (standard for containerized apps)
- `console.log` / `console.error` with contextual information
- No logging library at MVP scale

**Testing:**
- Vitest 4.0.18 for unit and integration tests (schema validation, query logic, form processing)
- Playwright 1.58.2 for end-to-end tests (page loads, navigation, form submissions, search, auth flows)
- Both run in Docker-compatible environments

**E2E Testing Strategy (Playwright):**

E2E tests run against a live Astro server with an isolated in-memory SQLite database so tests never touch the development database.

- **Test database isolation:** When `NODE_ENV=test`, the database connection module automatically uses an in-memory SQLite database (`:memory:`), creating an ephemeral database that exists only for the duration of the test run.
- **Auto-migration on startup:** When `NODE_ENV=test`, the server must auto-run Drizzle migrations at startup so the in-memory database has the correct schema. Implement this by calling `runMigrations()` during server initialization when the test environment is detected.
- **Test data seeding:** E2E test data is seeded via a test-only API route at `POST /api/fixtures`, which is active only when `NODE_ENV=test` (returns 400 otherwise). By default, the endpoint clears all tables and inserts the standard fixture set from `src/test/e2e-seed.ts`. Passing `?type=empty` clears all tables without seeding, allowing a test suite to start from a blank database and insert only the fixtures it needs using the factory functions in `src/test/fixtures.ts`. Test suites that need data should call this endpoint in their `beforeAll` hook.
- **Playwright configuration:** The `webServer` block in `playwright.config.ts` must pass `NODE_ENV=test` via its `env` option. The server command is `npm run build && npm run preview`.
- **Test independence:** The in-memory database resets on every server restart. Each test suite controls its own data by calling `POST /api/fixtures` in `beforeAll` — either seeding the standard set or clearing to empty and inserting suite-specific fixtures. This ensures suites don't depend on execution order or leftover data from other suites.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (Astro starter + Node adapter)
2. Database schema + Drizzle setup + migrations
3. Authentication (session table, login page, middleware)
4. Public pages (index, detail, search)
5. Admin CRUD pages (with Zod validation, CSRF, same-page form handling)
6. Docker + Docker Compose
7. Testing (Vitest unit tests, Playwright E2E)

**Cross-Component Dependencies:**
- Drizzle schema defines types used across all pages and forms
- Auth middleware must be in place before any admin page works
- Zod validation schemas should align with Drizzle table definitions
- CSRF middleware applies to all form-handling routes (admin + search)
- Docker volume mount path must match `DATABASE_PATH` default

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
12 areas where AI agents could make different choices, all resolved below.

### Naming Patterns

**Database Naming Conventions:**
- Table names: **singular, snake_case** — `unit`, `model`, `equipment_option`, `session`
- Column names: **snake_case** — `is_default`, `created_at`, `session_id`
- Foreign keys: **snake_case referencing table** — `unit_id`, `model_id`
- Indexes: **`idx_{table}_{column}`** — `idx_unit_slug`, `idx_session_expires_at`
- Drizzle maps snake_case DB columns to camelCase TypeScript properties automatically

**Code Naming Conventions:**
- Functions: **camelCase** — `getUnitBySlug()`, `validateSession()`, `hashPassword()`
- Types/interfaces: **PascalCase** — `Unit`, `Model`, `EquipmentOption`, `SessionData`
- Constants: **UPPER_SNAKE_CASE** — `SESSION_TTL`, `MAX_SEARCH_RESULTS`
- Variables: **camelCase** — `unitCount`, `isAuthenticated`, `csrfToken`
- Zod schemas: **camelCase with `Schema` suffix** — `unitSchema`, `loginSchema`, `equipmentOptionSchema`

**Import Conventions:**
- Always use the `@/` path alias for imports — never relative paths like `../../`
- `@/` maps to `src/` (configured in `tsconfig.json`)
- Examples: `import { db } from "@/data/orm/connection"`, `import { findUnitBySlug } from "@/data/repo/unit-repository"`

**File Naming Conventions:**
- Astro components: **PascalCase** — `UnitCard.astro`, `Breadcrumb.astro`, `SearchForm.astro`
- Astro pages: **lowercase/kebab-case** (Astro routing convention) — `index.astro`, `[slug].astro`, `search.astro`
- TypeScript modules: **kebab-case** — `session.ts`, `csrf.ts`, `schema.ts`, `unit-repository.ts`
- Test files: **same name with `.test.ts` suffix** — `session.test.ts`, `schema.test.ts`
- Config files: **standard names** — `astro.config.mjs`, `drizzle.config.ts`, `vitest.config.ts`

### Structure Patterns

**Project Organization:**
- `src/components/` — flat directory for all Astro components (PascalCase files)
- `src/layouts/` — shared page layouts (base HTML shell with header, footer)
- `src/pages/` — file-based routing (Astro convention)
- `src/data/orm/` — Drizzle schema definitions and database connection
- `src/data/repo/` — Domain-specific repository modules for read-only data access (one file per domain entity, queries defined inline)
- `src/data/validation/` — Zod schemas for form validation
- `src/form/` — CRUD form abstractions (one class per entity) — encapsulate field definitions, FormData parsing, validation orchestration, and save logic so route files stay minimal and form behavior is reusable across create/edit pages
- `src/presenters/` — Presenter classes that transform Drizzle row objects into display-ready data for templates (one class per entity, e.g., `UnitPresenter.ts`). Presenters are pure logic with no database dependency — they accept raw data and expose computed properties and formatting methods. Must always have co-located unit tests.
- `src/auth/` — session management, CSRF token logic, auth middleware
- `src/test/` — shared test utilities for unit and E2E testing, such as fixture factories and E2E seed data
- `public/` — static assets served as-is
- `drizzle/` — generated migration files (committed to version control)
- `e2e/` — Playwright end-to-end tests (project root)

**Test Organization:**
- Unit/integration tests: **co-located** with the module they test
  - `src/data/orm/schema.ts` → `src/data/orm/schema.test.ts`
  - `src/data/repo/unit-repository.ts` → `src/data/repo/unit-repository.test.ts`
  - `src/auth/session.ts` → `src/auth/session.test.ts`
  - `src/data/validation/unit.ts` → `src/data/validation/unit.test.ts`
- End-to-end tests: **`e2e/` directory in project root**
  - `e2e/search.spec.ts`, `e2e/admin-crud.spec.ts`, `e2e/auth.spec.ts`
- Shared test utilities: **`src/test/`** — fixture factories, E2E seed functions, and other modules shared across unit and E2E tests

### Process Patterns

**Same-Page Form Handling (mandatory pattern for all form pages):**

Every `.astro` page that handles form submissions MUST follow this exact sequence:

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

// GET requests and failed POST validations render the page below
```

- `errors` is always `Record<string, string>` — keys are field names, values are error messages
- `formData` preserves submitted values for re-populating the form on validation failure
- Successful writes ALWAYS redirect (POST-redirect-GET pattern) — never render after a successful write
- CSRF validation happens BEFORE any other processing

**Error Display Pattern:**

Templates render errors consistently using the `errors` object:

```astro
<label for="name">Name</label>
<input id="name" name="name" value={formData.name} aria-describedby={errors.name ? "name-error" : undefined} />
{errors.name && <p id="name-error" class="admin-form__error">{errors.name}</p>}
```

- Error messages always use `aria-describedby` linking to the error element
- Error text uses the `admin-form__error` BEM class (red accent color)
- Field values are always re-populated from `formData` on error

**Auth Middleware Pattern:**

All `/admin/*` routes (except `/admin/login`) are protected by the same middleware check:

1. Read session cookie
2. Look up session in DB, check expiry
3. If invalid/expired: redirect to `/admin/login`
4. If valid: continue to page, make session data available

**CSRF Token Pattern:**

1. Token generated and stored in session on login
2. Embedded in every form as `<input type="hidden" name="_csrf" value={csrfToken} />`
3. Validated on every POST before any processing
4. Field name is always `_csrf`

### Enforcement Guidelines

**All AI Agents MUST:**

- Follow the same-page form handling pattern exactly as defined above for every form page
- Use singular snake_case for all database table and column names
- Use `Record<string, string>` for form validation error objects — no other structure
- Place unit tests co-located with their module using `.test.ts` suffix
- Place E2E tests in the `e2e/` root directory using `.spec.ts` suffix
- Use PascalCase for component file names, kebab-case for all other TypeScript files
- Use the `_csrf` hidden field name for CSRF tokens in all forms
- Redirect after successful form submission — never render a page after a write

**Anti-Patterns (NEVER do these):**

- Plural table names (`units` instead of `unit`)
- camelCase database columns (`defaultEquipmentId` instead of `default_equipment_id`)
- Rendering a success page after a POST write (always redirect)
- Using arrays or custom objects for form errors instead of `Record<string, string>`
- Putting Playwright tests in `src/` or co-locating them with pages
- Using kebab-case for component file names (`unit-card.astro` instead of `UnitCard.astro`)
- Skipping CSRF validation on any POST handler
- Using relative import paths (`../../data/orm/connection`) instead of the `@/` alias (`@/data/orm/connection`)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
aine-program/
├── .env.example
├── .gitignore
├── .nvmrc
├── astro.config.mjs
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vitest.config.ts
├── drizzle/
│   └── migrations/
├── e2e/
│   ├── auth.spec.ts
│   ├── browse.spec.ts
│   ├── search.spec.ts
│   └── admin-crud.spec.ts
├── scripts/
│   └── create-admin.ts
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── styles.css
├── src/
│   ├── env.d.ts
│   ├── middleware.ts
│   ├── auth/
│   │   ├── csrf.ts
│   │   ├── csrf.test.ts
│   │   ├── session.ts
│   │   └── session.test.ts
│   ├── components/
│   │   ├── Breadcrumb.astro
│   │   ├── Breadcrumb.css
│   │   ├── SearchForm.astro
│   │   ├── SearchForm.css
│   │   ├── SiteHeader.astro
│   │   ├── SiteHeader.css
│   │   ├── UnitAdminForm.astro
│   │   ├── UnitAdminForm.css
│   │   ├── UnitCard.astro
│   │   └── UnitCard.css
│   ├── data/
│   │   ├── orm/
│   │   │   ├── connection.ts
│   │   │   ├── schema.ts
│   │   │   ├── schema.test.ts
│   │   │   ├── slugify.ts
│   │   │   └── slugify.test.ts
│   │   ├── repo/
│   │   │   ├── unit-repository.ts
│   │   │   ├── unit-repository.test.ts
│   │   │   └── user-repository.ts
│   │   └── validation/
│   │       ├── unit.ts
│   │       ├── unit.test.ts
│   │       ├── login.ts
│   │       └── login.test.ts
│   ├── form/
│   │   ├── field.ts
│   │   └── UnitForm.ts
│   ├── presenters/
│   │   ├── UnitPresenter.ts
│   │   └── UnitPresenter.test.ts
│   ├── test/
│   │   ├── fixtures.ts
│   │   └── e2e-seed.ts
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── search.astro
│   │   ├── 404.astro
│   │   ├── 500.astro
│   │   ├── units/
│   │   │   └── [slug].astro
│   │   └── admin/
│   │       ├── index.astro
│   │       ├── login.astro
│   │       └── units/
│   │           ├── new.astro
│   │           └── [id]/
│   │               └── edit.astro
└── data/
    └── sqlite.db
```

### Architectural Boundaries

**Route Boundaries (Public vs. Admin):**
- `src/pages/index.astro`, `src/pages/search.astro`, `src/pages/units/` — public, no auth
- `src/pages/admin/` — all protected by auth middleware (except `login.astro`)
- `src/middleware.ts` enforces this boundary: checks session on `/admin/*` routes, skips `/admin/login`

**Data Access Boundary:**
- `src/data/orm/` owns schema definitions and the database connection — nothing else touches `drizzle-orm` or `better-sqlite3` directly
- `src/data/repo/` contains domain-specific repository modules for all read-only data access (e.g., `unit-repository.ts`, `user-repository.ts`)
- Each repository module encapsulates its own queries — there is no centralized `queries.ts`
- Pages and components import repository functions for reads and `src/data/orm/` utilities for writes
- `src/data/orm/connection.ts` creates and exports the single Drizzle database instance

**Validation Boundary:**
- `src/data/validation/` contains all Zod schemas
- Admin form pages import Zod schemas from here — never define inline validation
- Validation always runs in page frontmatter BEFORE calling any query function

**Form Boundary:**
- `src/form/` contains CRUD form classes — one per entity (e.g., `UnitForm.ts`)
- Each form class encapsulates: field definitions, FormData parsing, Zod validation, and save orchestration (slug generation, repository calls)
- Form classes are imported and instantiated in `.astro` page frontmatter — route files handle only CSRF validation, form instantiation, and redirect logic
- Form classes import from `src/data/validation/`, `src/data/repo/`, and `src/data/orm/` as needed
- Reusable across create and edit pages for the same entity
- `src/form/field.ts` defines the shared `FormField` interface used by form components

**Presenter Boundary:**
- `src/presenters/` contains Presenter classes — one per entity (e.g., `UnitPresenter.ts`)
- Presenters accept Drizzle row objects (and optional related data) in their constructor and expose display-ready computed properties and formatting methods
- Presenters contain zero database logic — they are pure transformations from data shapes to presentation shapes
- Pages construct a Presenter in their frontmatter after fetching data, then use it in the template
- Because Presenters are pure functions of their inputs, they must always have co-located unit tests (no DB mocking required)

**Auth Boundary:**
- `src/auth/` owns all session and CSRF logic
- Pages call `src/auth/session.ts` functions to check/create/destroy sessions
- Pages call `src/auth/csrf.ts` functions to generate and validate tokens
- Auth state flows from middleware → page via `Astro.locals`

### Requirements to Structure Mapping

**Unit Browsing (FR1-FR3):**

| Requirement | File(s) |
|---|---|
| FR1: Alphabetical index with summaries | `src/pages/index.astro`, `src/components/UnitCard.astro` |
| FR2: Navigate to unit detail | `src/pages/units/[slug].astro` |
| FR3: Navigate back to index | `src/components/SiteHeader.astro`, `src/components/Breadcrumb.astro` |

**Unit Search (FR4-FR8):**

| Requirement | File(s) |
|---|---|
| FR4: Search by name | `src/components/SearchForm.astro` (in header) |
| FR5: Search results with summaries | `src/pages/search.astro` |
| FR6: Navigate from result to detail | `src/pages/search.astro` → `src/pages/units/[slug].astro` |
| FR7: No results message | `src/pages/search.astro` |
| FR8: Navigate back to index | `src/components/SiteHeader.astro` |

**Unit Details (FR9-FR13):**

| Requirement | File(s) |
|---|---|
| FR9-FR13: All unit/model/equipment display | `src/pages/units/[slug].astro` |

**Unit Administration (FR14-FR23):**

| Requirement | File(s) |
|---|---|
| FR14-FR16: Unit CRUD | `src/pages/admin/index.astro`, `src/pages/admin/units/new.astro`, `src/pages/admin/units/[id]/edit.astro` |
| FR17-FR22: Model/equipment management | `src/pages/admin/units/new.astro`, `src/pages/admin/units/[id]/edit.astro` |
| FR23: Immediate public visibility | No cache — server-rendered from DB on every request |

**Authentication (FR24-FR26):**

| Requirement | File(s) |
|---|---|
| FR24: Admin requires auth | `src/middleware.ts` |
| FR25: Redirect to login | `src/middleware.ts` → `src/pages/admin/login.astro` |
| FR26: Public pages accessible | `src/middleware.ts` (skips auth for non-admin routes) |

### Cross-Cutting Concerns Mapping

| Concern | Files |
|---|---|
| Auth middleware | `src/middleware.ts` → `src/auth/session.ts` |
| CSRF protection | `src/auth/csrf.ts` → all admin form pages |
| SEO (meta, structured data) | `src/layouts/Base.astro` → all public pages |
| Accessibility | `src/layouts/Base.astro` (skip link, landmarks), all components |
| BEM CSS | `public/styles.css` (reset + tokens) + co-located `.css` files per BEM block |
| Cache headers | `src/middleware.ts` or page-level `Astro.response.headers` |

### Data Flow

```
Browser Request
    → src/middleware.ts (auth check for /admin/*, cache headers for public)
    → src/pages/*.astro (route handler)
        → src/auth/csrf.ts (validate on POST)
        → src/form/*.ts (admin CRUD forms: parse FormData, validate, save)
            → src/data/validation/*.ts (Zod schema validation)
            → src/data/repo/*-repository.ts (DB reads and writes)
                → src/data/orm/connection.ts (Drizzle instance)
                    → SQLite file (./data/sqlite.db)
        → src/data/repo/*-repository.ts (direct read-only queries for GET)
        → src/presenters/*.ts (transform Drizzle rows into display-ready data)
    → src/layouts/Base.astro (HTML shell, header, footer)
        → src/components/*.astro (render UI, using Presenter properties)
    → HTML Response to Browser
```

### Development Workflow

**Dev server:** `npm run dev` — Astro dev server with hot reload via Vite
**Build:** `npm run build` — Astro produces a Node.js server bundle in `dist/`
**Preview:** `npm run preview` — runs the built server locally
**Migrations:** When schemas change, run `npm run generate` to create migrations. To apply all migrations and update the database, run `npm run migrate`.
**Unit tests:** `npx vitest` (watches co-located `.test.ts` files)
**E2E tests:** `npx playwright test` (runs `e2e/*.spec.ts` against an Astro server with in-memory SQLite — see E2E Testing Strategy above)
**Create admin:** `npx tsx scripts/create-admin.ts` — interactive prompt for username + password, hashes with bcrypt, inserts into DB. This is the ONLY way to create admin users.
**Docker:** `docker compose up --build` — builds image and starts the app with SQLite volume

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are version-compatible. Astro 5.17.2 supports Node >=22.0.0 (Node 24 works). Vitest 4.0.18 supports Node >=24.0.0. Drizzle ORM 0.45.1 has an explicit better-sqlite3 driver. bcrypt compiles in Alpine Docker with build tools. No version conflicts.

**Pattern Consistency:**
snake_case DB columns map to camelCase TypeScript via Drizzle's automatic mapping. PascalCase components and kebab-case modules follow Astro community convention. Co-located `.test.ts` files are discovered by Vitest's default config. `e2e/` root directory works with Playwright's `testDir` setting. All patterns align with the chosen stack.

**Structure Alignment:**
File-based routing maps 1:1 to the URL structure. `src/data/orm/` as the sole DB access point is a clean boundary. `src/middleware.ts` is the standard Astro middleware location. All boundaries are enforceable through import conventions.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (26/26):**

| FR Category | FRs | Architectural Support |
|---|---|---|
| Unit Browsing | FR1-FR3 | `index.astro`, `UnitCard.astro`, `[slug].astro`, `SiteHeader.astro`, `Breadcrumb.astro` |
| Unit Search | FR4-FR8 | `SearchForm.astro`, `search.astro`, no-results handling |
| Unit Details | FR9-FR13 | `[slug].astro` with model/equipment hierarchy display |
| Unit Administration | FR14-FR23 | Admin pages + Zod validation + `data/repo/` repository functions |
| Authentication | FR24-FR26 | `middleware.ts`, `session.ts`, `login.astro` |

**Non-Functional Requirements Coverage:**
- Performance: SSR + SQLite meets 2s/1s/3s targets; cache headers on public pages
- Security: bcrypt password hashing, SQLite sessions, CSRF tokens, auth middleware
- Accessibility: WCAG AA — skip link, landmarks, heading hierarchy, `aria-describedby` on form errors, 4.5:1+ contrast ratios verified in UX spec

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All technologies specified with exact versions
- Implementation patterns include TypeScript code examples
- Consistency rules are explicit with enforced anti-patterns list

**Structure Completeness:**
- Complete directory tree with all files defined
- All boundaries documented with clear ownership rules
- Every FR mapped to specific file(s)

**Pattern Completeness:**
- Naming conventions cover database, code, and files
- Form handling pattern codified with exact sequence
- Error display pattern includes accessibility attributes
- Auth and CSRF patterns fully specified

### Gap Analysis Results

**Gaps Identified: 2 — Both Resolved**

**Gap 1: Initial Admin User Creation — Resolved**
- `scripts/create-admin.ts` — interactive CLI script using `tsx`
- Prompts for username, password, password confirmation
- Hashes password with bcrypt and inserts into database
- This is the ONLY way to create admin users — no registration flow, no API, no seed file
- Added to project structure and development workflow

**Gap 2: Slug Generation — Resolved**
- Slugs auto-generated from unit name (e.g., "Space Marine" → `space-marine`)
- Slug field is editable in admin forms so admin can adjust if needed
- Unique index on `slug` column in `unit` table enforces uniqueness at DB level
- Slugify utility in `src/data/orm/slugify.ts` handles generation
- Validation checks uniqueness before save, surfaces error if duplicate

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Process patterns documented with code examples
- [x] Anti-patterns explicitly listed

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — low-complexity project with well-understood patterns, mature technology choices, and comprehensive consistency rules.

**Key Strengths:**
- Technology stack is minimal and well-matched to requirements — no over-engineering
- Clear architectural boundaries prevent agent conflicts
- Same-page form handling pattern with code examples eliminates ambiguity
- Every FR is mapped to specific files
- Single data access layer (`src/data/orm/`) prevents scattered DB calls

**Areas for Future Enhancement:**
- CI/CD pipeline (deferred until hosting is chosen)
- Monitoring and logging (not needed at MVP scale)
- Advanced caching strategy (HTTP headers sufficient for now, could add page-level caching later)
- Rate limiting on login (low priority for single-admin app, worth adding post-MVP)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries — especially the data access boundary
- Refer to this document for all architectural questions
- When in doubt, follow the anti-patterns list to know what NOT to do

**First Implementation Priority:**

```bash
npm create astro@latest aine-program -- --template minimal --typescript strict --install --git
cd aine-program && npx astro add node
```

Then: install Drizzle + better-sqlite3 + bcrypt, create schema, run migrations, set up middleware.
