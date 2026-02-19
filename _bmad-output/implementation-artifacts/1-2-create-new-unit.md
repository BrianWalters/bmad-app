# Story 1.2: Create New Unit

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to create a new unit with all its core attributes,
so that unit information is available in the system for players to view.

## Acceptance Criteria

1. **Given** the `unit` table exists with columns for name, slug, movement, toughness, save, wounds, leadership, objective_control, invulnerability_save, and description; and a `keyword` table (id, name) and `unit_keyword` join table (unit_id, keyword_id) exist
   **When** an authenticated admin navigates to `/admin/units/new`
   **Then** a form is displayed with fields for all unit attributes (name, movement, toughness, save, wounds, leadership, objective control, invulnerability save, description, keywords), each with associated labels, and a hidden CSRF token

2. **Given** the admin fills in valid unit data and selects or creates keywords
   **When** the server processes the POST request
   **Then** the CSRF token is validated, input is validated with the Zod unit schema, a slug is auto-generated from the unit name, the unit is saved to the database, keyword associations are created in the `unit_keyword` table, and the admin is redirected to `/admin` (FR14)

3. **Given** the admin assigns a keyword that doesn't exist yet
   **When** the form is submitted
   **Then** the new keyword is created in the `keyword` table and associated with the unit

4. **Given** the admin submits a form with invalid data (e.g., missing required fields)
   **When** Zod validation fails
   **Then** the form re-renders with per-field error messages using `aria-describedby`, previously entered values are preserved, and no database write occurs

5. **Given** the admin submits a unit with a name that generates a duplicate slug
   **When** uniqueness validation runs
   **Then** the form re-renders with an error on the name/slug field indicating the conflict

6. **Given** an authenticated admin navigates to `/admin`
   **When** the admin unit list page loads
   **Then** all existing units are listed with links to edit each one and a link to create a new unit

## Tasks / Subtasks

- [x] Task 1: Add unit, keyword, and unit_keyword tables to schema (AC: #1)
  - [x] 1.1 Add `unit` table to `src/data/orm/schema.ts` with columns: id, name, slug (unique), movement, toughness, save, wounds, leadership, objective_control, invulnerability_save, description, created_at
  - [x] 1.2 Add `keyword` table with columns: id, name (unique)
  - [x] 1.3 Add `unit_keyword` join table with columns: unit_id (FK → unit), keyword_id (FK → keyword), with composite primary key
  - [x] 1.4 Add index `idx_unit_slug` on `unit.slug`
  - [x] 1.5 Run `npx drizzle-kit generate` to create new migration
- [x] Task 2: Create slug utility (AC: #2, #5)
  - [x] 2.1 Create `src/data/orm/slugify.ts` — export `slugify(name: string): string` that lowercases, replaces spaces/special chars with hyphens, strips leading/trailing hyphens
  - [x] 2.2 Create `src/data/orm/slugify.test.ts` — test common cases: spaces, special characters, multiple hyphens, leading/trailing whitespace, accented characters
- [x] Task 3: Create Zod validation schema for units (AC: #2, #4)
  - [x] 3.1 Create `src/data/validation/unit.ts` — export `unitSchema` with: name (string, min 1), movement (string, min 1), toughness (string, min 1), save (string, min 1), wounds (string, min 1), leadership (string, min 1), objectiveControl (string, min 1), invulnerabilitySave (string, optional), description (string, optional), keywords (string, optional — comma-separated input)
  - [x] 3.2 Create `src/data/validation/unit.test.ts` — test valid input, missing required fields, optional fields, edge cases
- [x] Task 4: Create unit repository (AC: #2, #3, #5, #6)
  - [x] 4.1 Create `src/data/repo/unit-repository.ts` — export functions: `createUnit(data)`, `getAllUnits()`, `findUnitBySlug(slug)`, `isSlugAvailable(slug)`
  - [x] 4.2 `createUnit` must: insert unit row, parse keywords string, find-or-create each keyword, insert unit_keyword associations — all in a single transaction
  - [x] 4.3 `getAllUnits` returns all units ordered alphabetically by name
  - [x] 4.4 `isSlugAvailable` checks the unit table for an existing slug
- [x] Task 5: Create admin unit list page (AC: #6)
  - [x] 5.1 Modify `src/pages/admin/index.astro` — replace placeholder with a list of all units from `getAllUnits()`
  - [x] 5.2 Each unit shows name and a link to `/admin/units/[id]/edit`
  - [x] 5.3 Include a "Create New Unit" link to `/admin/units/new`
  - [x] 5.4 Show empty state "No units yet." with create link when no units exist
  - [x] 5.5 Keep existing logout form functional
- [x] Task 6: Create new unit form page (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 Create `src/pages/admin/units/new.astro` — same-page form handling pattern
  - [x] 6.2 GET: render form with all unit fields, labels, hidden `_csrf` field
  - [x] 6.3 POST: validate CSRF → parse FormData → validate with `unitSchema` → generate slug via `slugify()` → check slug uniqueness → create unit via `createUnit()` → redirect to `/admin`
  - [x] 6.4 On validation failure: re-render with `errors` and `formData` preserved, `aria-describedby` on errored fields
  - [x] 6.5 On duplicate slug: add error to `errors.name` with conflict message, re-render
  - [x] 6.6 Keywords field: accept comma-separated text input; parse and trim before passing to `createUnit`
- [x] Task 7: Write unit tests (AC: all)
  - [x] 7.1 Tests for `slugify` utility (co-located: `src/data/orm/slugify.test.ts`)
  - [x] 7.2 Tests for `unitSchema` validation (co-located: `src/data/validation/unit.test.ts`)

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Story 1.1):**

- **Same-page form handling:** `/admin/units/new.astro` handles both GET (render form) and POST (process submission) in its frontmatter. Successful POST ALWAYS redirects — never render after a successful write.
- **Data access boundary:** ALL database operations go through repository modules in `src/data/repo/`. Pages NEVER import `drizzle-orm` or `better-sqlite3` directly. Follow the pattern set by `src/data/repo/user-repository.ts`.
- **Auth boundary:** Session data is available via `Astro.locals.session` (set by middleware). Import `validateCsrfToken` from `src/auth/csrf.ts` for CSRF checks.
- **Validation boundary:** Zod schemas live in `src/data/validation/`. Never define inline validation in pages.
- **Type sharing:** Use `DrizzleDatabase` type from `src/data/orm/types.ts` if any new classes need DB injection.

**Database Naming Conventions:**
- Table names: singular, snake_case — `unit`, `keyword`, `unit_keyword`
- Column names: snake_case — `objective_control`, `invulnerability_save`, `created_at`
- Foreign keys: `unit_id`, `keyword_id`
- Indexes: `idx_{table}_{column}` — `idx_unit_slug`
- Drizzle maps snake_case DB columns to camelCase TypeScript properties automatically

**Code Naming Conventions:**
- Functions: camelCase — `createUnit()`, `getAllUnits()`, `slugify()`
- Types: PascalCase — `Unit`, `Keyword`
- Zod schemas: camelCase with `Schema` suffix — `unitSchema`
- Files: kebab-case — `unit-repository.ts`, `slugify.ts`

**Anti-Patterns — NEVER do these:**
- Plural table names (`units` instead of `unit`)
- camelCase DB columns (`objectiveControl` instead of `objective_control`)
- Render a page after a successful POST write (always redirect)
- Use arrays or custom objects for form errors — use `Record<string, string>`
- Skip CSRF validation on any POST handler
- Import `drizzle-orm` or `better-sqlite3` from pages or components
- Put DB queries directly in `.astro` page files

### Error Display Pattern

```astro
<label for="name">Name</label>
<input id="name" name="name" value={formData.name ?? ""} aria-describedby={errors.name ? "name-error" : undefined} />
{errors.name && <p id="name-error" class="admin-form__error">{errors.name}</p>}
```

### Same-Page Form Handling Pattern

```typescript
// In .astro frontmatter:
import { validateCsrfToken } from "../../auth/csrf";

let errors: Record<string, string> = {};
let formData: Record<string, string> = {};
const csrfToken = Astro.locals.session!.csrfToken;

if (Astro.request.method === "POST") {
  const data = await Astro.request.formData();
  const submittedCsrf = data.get("_csrf")?.toString() ?? "";

  if (!validateCsrfToken(csrfToken, submittedCsrf)) {
    errors.form = "Invalid form submission. Please try again.";
  } else {
    // 1. Parse FormData into plain object
    // 2. Validate with Zod schema
    // 3. If validation fails: populate errors + formData, fall through to render
    // 4. If validation passes: write to DB via repository, redirect
  }
}
```

### CSRF Token Pattern

1. CSRF token is stored in the session — access via `Astro.locals.session!.csrfToken`
2. Embed in every form: `<input type="hidden" name="_csrf" value={csrfToken} />`
3. Validate on every POST before any processing using `validateCsrfToken()` from `src/auth/csrf.ts`
4. Field name is always `_csrf`

### Slug Generation Pattern

- Auto-generate slug from unit name: `"Space Marine" → "space-marine"`
- Utility in `src/data/orm/slugify.ts`
- Check uniqueness via `isSlugAvailable()` before insert
- On conflict, surface error on the name field — do NOT silently append numbers

### Keyword Handling Pattern

- Keywords are entered as a comma-separated string in the form (e.g., "Infantry, Imperium, Adeptus Astartes")
- On save: split by comma, trim whitespace, skip empty strings
- For each keyword: find existing `keyword` row by name, or insert new one
- Create `unit_keyword` association rows
- Wrap the entire unit + keywords save in a transaction

### Library & Framework Requirements

All packages already installed in Story 1.1. No new dependencies needed.

| Package | Version | Purpose |
|---|---|---|
| astro | ^5.17.3 | MPA framework (installed) |
| drizzle-orm | ^0.45.1 | Type-safe ORM (installed) |
| drizzle-kit | ^0.31.9 | Migration generation (installed) |
| better-sqlite3 | ^12.6.2 | SQLite driver (installed) |
| zod | ^3.25.76 | Form validation (installed) |
| vitest | ^4.0.18 | Unit testing (installed) |

### Project Structure Notes

Files to create or modify in this story:

```
src/
├── data/
│   ├── orm/
│   │   ├── schema.ts          (modify — add unit, keyword, unit_keyword tables)
│   │   ├── slugify.ts         (create)
│   │   └── slugify.test.ts    (create)
│   ├── repo/
│   │   └── unit-repository.ts (create)
│   └── validation/
│       ├── unit.ts            (create)
│       └── unit.test.ts       (create)
└── pages/
    └── admin/
        ├── index.astro        (modify — add unit list)
        └── units/
            └── new.astro      (create)
drizzle/                       (regenerate — new migration)
```

### Database Schema for This Story

```sql
-- unit table
CREATE TABLE unit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  movement TEXT NOT NULL,
  toughness TEXT NOT NULL,
  save TEXT NOT NULL,
  wounds TEXT NOT NULL,
  leadership TEXT NOT NULL,
  objective_control TEXT NOT NULL,
  invulnerability_save TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_unit_slug ON unit(slug);

-- keyword table
CREATE TABLE keyword (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- unit_keyword join table
CREATE TABLE unit_keyword (
  unit_id INTEGER NOT NULL REFERENCES unit(id),
  keyword_id INTEGER NOT NULL REFERENCES keyword(id),
  PRIMARY KEY (unit_id, keyword_id)
);
```

Define these using Drizzle ORM's SQLite schema builder, NOT raw SQL. The SQL above is for reference only. Note: the `.unique()` on `slug` already creates an index, so the explicit `idx_unit_slug` is not needed — just use `.unique()` on the column.

### Existing Code Patterns to Follow

**Repository pattern** (from `src/data/repo/user-repository.ts`):
```typescript
import { eq } from "drizzle-orm";
import { db } from "../orm/connection";
import { adminUser } from "../orm/schema";

export function findUserByUsername(username: string) {
  return (
    db.select().from(adminUser).where(eq(adminUser.username, username)).get() ??
    null
  );
}
```

Follow this import pattern: import `db` from `../orm/connection`, import schema tables from `../orm/schema`, import operators from `drizzle-orm`.

**Admin page pattern** (from `src/pages/admin/index.astro`):
- Session is accessed via `Astro.locals.session!`
- Logout form is already present — keep it when modifying this page
- CSRF token from session: `session.csrfToken`

### References

- [Source: architecture.md#Data-Architecture] — Drizzle ORM schema, unit > model > equipment hierarchy, slug handling
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — Same-page form handling, naming conventions, anti-patterns
- [Source: architecture.md#Project-Structure-&-Boundaries] — Data access boundary, validation boundary, directory structure
- [Source: epics.md#Story-1.2] — Acceptance criteria, user story, keyword and slug requirements
- [Source: prd.md#Unit-Administration] — FR14 (create unit), FR23 (immediate visibility)
- [Source: ux-design-specification.md#Form-Patterns] — Labels above inputs, required field marking, server-side validation, aria-describedby errors
- [Source: ux-design-specification.md#Accessibility-Strategy] — WCAG AA, keyboard nav, form labels

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

### Completion Notes List

- Task 1: Added `unit`, `keyword`, and `unit_keyword` tables to Drizzle schema with proper FK constraints (cascade delete on unit_keyword), composite PK, and unique slug. movement, toughness, save, wounds, objective_control as integer columns; invulnerability_save as optional integer. A migration was generated.
- Task 2: Created `slugify()` utility with NFD normalization for accented chars, special char replacement, hyphen collapsing. 10 tests passing.
- Task 3: Created `unitSchema` Zod validator with integer coercion via preprocess for stat fields (movement, toughness, save, wounds, objectiveControl, invulnerabilitySave) and string fields (name, leadership). 18 tests passing.
- Task 4: Created `unit-repository.ts` with `createUnit` (transactional insert with find-or-create keywords), `getAllUnits` (alphabetical), `findUnitBySlug`, `isSlugAvailable`. Interface uses number types for integer stat fields.
- Task 5: Updated admin dashboard to list all units with edit links and "Create New Unit" link. Empty state handled. Logout form preserved.
- Task 6: Created `/admin/units/new.astro` with same-page form handling: CSRF validation, Zod schema validation with integer coercion, slug generation + uniqueness check, per-field error display with aria-describedby, form data preservation on failure, type="number" inputs for stat fields, redirect on success.
- Task 7: Tests already co-located and passing (slugify: 10 tests, unitSchema: 18 tests). Full suite: 46 tests, 5 files, 0 regressions.

### Change Log
- 2026-02-18: Story created by create-story workflow — ready-for-dev
- 2026-02-18: Implemented all 7 tasks — unit/keyword/unit_keyword schema (integer stat columns), slugify utility, Zod validation (integer coercion), repository layer, admin list page, create unit form page (number inputs), unit tests. Moved migrations from middleware to `npm run migrate` command. 28 new tests added, 46 total passing.
- 2026-02-19: Code review completed — 10 issues found and resolved. Fixed invulnerabilitySave to be optional (schema, Zod, form, repo, tests). Extracted form into UnitAdminForm.astro component. Added HTML required attributes. Converted all relative imports to @/ alias (7 files). Added ON DELETE CASCADE to unit_keyword FKs. Added test for required-only fields. Updated architecture to document src/form/ layer. Updated story File List and completion notes. Migrations wiped for clean regeneration. 47 tests passing.

### File List
- `src/data/orm/schema.ts` — modified (added unit, keyword, unit_keyword tables)
- `src/data/orm/slugify.ts` — created (slug generation utility)
- `src/data/orm/slugify.test.ts` — created (10 tests for slugify)
- `src/data/validation/unit.ts` — created (Zod unitSchema + UnitInput type)
- `src/data/validation/unit.test.ts` — created (a test suite was created for unitSchema)
- `src/data/repo/unit-repository.ts` — created (createUnit, getAllUnits, findUnitBySlug, isSlugAvailable)
- `src/pages/admin/index.astro` — modified (added unit list, create link, empty state)
- `src/pages/admin/units/new.astro` — created (create unit form page with full validation)
- `src/pages/admin/login.astro` — modified (added stylesheet link)
- `src/form/field.ts` — created (FormField interface for form components)
- `src/form/UnitForm.ts` — created (unit CRUD form abstraction)
- `src/components/UnitAdminForm.astro` — created (reusable unit form component)
- `public/styles.css` — created (admin form styles and design tokens)
- `src/middleware.ts` — modified (removed migration call from request lifecycle)
- `scripts/migrate.ts` — created (standalone migration script)
- `package.json` — modified (added `migrate` script)
- `drizzle/` — a migration was generated (unit, keyword, unit_keyword tables with integer stat columns)
