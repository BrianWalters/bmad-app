# Story 1.3: Edit and Delete Units

Status: review

## Story

As an admin,
I want to edit an existing unit's attributes or delete a unit,
So that I can keep unit information accurate and remove obsolete units.

## Acceptance Criteria

1. **Given** an authenticated admin navigates to `/admin/units/[id]/edit`
   **When** the page loads
   **Then** the edit form is pre-populated with the unit's current data including keyword associations, includes a hidden CSRF token, and displays all editable fields with labels (FR15)

2. **Given** the admin modifies unit attributes and submits the edit form
   **When** the server processes the POST request
   **Then** the CSRF token is validated, input is validated with Zod, the unit is updated in the database, keyword associations are updated, and the admin is redirected to `/admin`

3. **Given** the admin edits the unit name
   **When** the slug would change
   **Then** the slug is regenerated from the new name and uniqueness is validated before save (excluding the current unit's own slug from the uniqueness check)

4. **Given** the admin submits an edit form with invalid data
   **When** Zod validation fails
   **Then** the form re-renders with per-field error messages and the submitted values preserved

5. **Given** the admin clicks delete on a unit
   **When** the browser's native `confirm()` dialog appears and the admin confirms
   **Then** the unit and all its associated keyword associations are deleted from the database (via cascade), and the admin is redirected to `/admin` (FR16)

6. **Given** the admin clicks delete and cancels the confirmation dialog
   **When** the dialog is dismissed
   **Then** no deletion occurs and the page remains unchanged

## Tasks / Subtasks

- [x] Task 1: Add `getUnitById` and `deleteUnitById` to unit repository (AC: #1, #5)
  - [x] 1.1 Add `getUnitById(id: number)` to `src/data/repo/unit-repository.ts` — returns the unit row or null
  - [x] 1.2 Add `getKeywordsForUnit(unitId: number)` to `src/data/repo/unit-repository.ts` — returns keyword names for a unit by joining `unit_keyword` and `keyword` tables
  - [x] 1.3 Add `deleteUnitById(id: number)` to `src/data/repo/unit-repository.ts` — deletes the unit row (cascade handles `unit_keyword` cleanup)
  - [x] 1.4 Add `updateUnit(id: number, data)` to `src/data/repo/unit-repository.ts` — updates the unit row and replaces keyword associations in a transaction (delete old associations, insert new ones)
  - [x] 1.5 Update `isSlugAvailable` to accept an optional `excludeId` parameter so the edit form can check slug uniqueness while excluding the unit being edited
- [x] Task 2: Extend UnitForm to support editing (AC: #1, #2, #3, #4)
  - [x] 2.1 Modify `UnitForm` constructor to accept an optional `id: number` parameter
  - [x] 2.2 When `id` is provided, query the database using `getUnitById` and `getKeywordsForUnit` to load existing unit data and store it as the initial form values
  - [x] 2.3 Update `handleForm` to branch on whether `id` is set: if editing, call `updateUnit` instead of `createUnit`; regenerate slug from name and validate uniqueness with `excludeId`
  - [x] 2.4 Ensure `getFields()` and `getValue()` return the loaded database values as defaults when no form submission has occurred (i.e., on GET request for editing)
- [x] Task 3: Create edit unit page (AC: #1, #2, #3, #4)
  - [x] 3.1 Create `src/pages/admin/units/[id]/edit.astro` — same-page form handling pattern
  - [x] 3.2 GET: parse `id` from route params, instantiate `UnitForm` with the `id`, render the `UnitAdminForm` component with pre-populated values and a "Save Changes" submit label
  - [x] 3.3 POST: validate CSRF → call `unitForm.handleForm(data)` → redirect to `/admin` on success, re-render with errors on failure
  - [x] 3.4 Return 404 if unit with given id does not exist
- [x] Task 4: Add delete functionality (AC: #5, #6)
  - [x] 4.1 Add a delete form to the edit page with a button that triggers `confirm()` via an inline `onsubmit="return confirm('...')"` attribute
  - [x] 4.2 The delete form POSTs to the same edit page with a hidden `action` field set to `"delete"`
  - [x] 4.3 In the POST handler, check for `action === "delete"` — if so, validate CSRF, call `deleteUnitById(id)`, and redirect to `/admin`
- [x] Task 5: Write unit tests (AC: all)
  - [x] 5.1 Add tests for `getUnitById`, `getKeywordsForUnit`, `deleteUnitById`, `updateUnit` in unit-repository tests
  - [x] 5.2 Add tests for `isSlugAvailable` with `excludeId` parameter
  - [x] 5.3 Add tests for `UnitForm` constructor with `id` — verify it loads existing data as form defaults
  - [x] 5.4 Add tests for `UnitForm.handleForm` in edit mode — verify it calls `updateUnit` and handles slug uniqueness with `excludeId`

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Stories 1.1 and 1.2):**

- **Same-page form handling:** `/admin/units/[id]/edit.astro` handles both GET (render form) and POST (process submission) in its frontmatter. Successful POST ALWAYS redirects — never render after a successful write.
- **Data access boundary:** ALL database operations go through repository modules in `src/data/repo/`. Pages NEVER import `drizzle-orm` or `better-sqlite3` directly.
- **Auth boundary:** Session data is available via `Astro.locals.session` (set by middleware). Import `validateCsrfToken` from `src/auth/csrf.ts` for CSRF checks.
- **Validation boundary:** Zod schemas live in `src/data/validation/`. Never define inline validation in pages.
- **Form boundary:** `src/form/UnitForm.ts` encapsulates field definitions, FormData parsing, validation, and save orchestration. Route files handle only CSRF validation, form instantiation, and redirect logic.
- **Type sharing:** Use `DrizzleDatabase` type from `src/data/orm/types.ts` if any new classes need DB injection.

### UnitForm Extension Pattern

**The UnitForm class must be extended to support editing, not duplicated.**

- The constructor should accept an optional `id` parameter: `constructor(id?: number)`
- When `id` is provided, `UnitForm` queries the database for the unit via `getUnitById(id)` and stores the result
- The loaded unit data serves as default values for `getFields()` and `getValue()` on GET requests (pre-populating the form)
- When `handleForm` is called with an `id` set, it calls `updateUnit` instead of `createUnit`
- Slug uniqueness checks during editing must exclude the current unit's own id via `isSlugAvailable(slug, excludeId)`
- Keywords for the existing unit are loaded via `getKeywordsForUnit(unitId)` and joined as a comma-separated string for the keywords field default value

### Delete Pattern

- Delete uses a separate `<form>` on the edit page with a hidden `action` field set to `"delete"`
- The button uses `onsubmit="return confirm('Are you sure you want to delete this unit?')"` for the native confirmation dialog
- CSRF token must be validated before deletion
- `deleteUnitById(id)` is a simple repository function — cascade on `unit_keyword` FK handles association cleanup
- After successful deletion, redirect to `/admin`

### Database Naming Conventions
- Table names: singular, snake_case — `unit`, `keyword`, `unit_keyword`
- Column names: snake_case — `objective_control`, `invulnerability_save`, `created_at`
- Foreign keys: `unit_id`, `keyword_id`
- Drizzle maps snake_case DB columns to camelCase TypeScript properties automatically

### Code Naming Conventions
- Functions: camelCase — `getUnitById()`, `deleteUnitById()`, `updateUnit()`
- Types: PascalCase — `Unit`, `Keyword`
- Zod schemas: camelCase with `Schema` suffix — `unitSchema`
- Files: kebab-case — `unit-repository.ts`, `edit.astro`

### Import Conventions
- Always use `@/` path alias — never relative paths
- Examples: `import { getUnitById } from "@/data/repo/unit-repository"`

### Anti-Patterns — NEVER do these:
- Plural table names (`units` instead of `unit`)
- camelCase DB columns (`objectiveControl` instead of `objective_control`)
- Render a page after a successful POST write (always redirect)
- Use arrays or custom objects for form errors — use `Record<string, string>`
- Skip CSRF validation on any POST handler
- Import `drizzle-orm` or `better-sqlite3` from pages or components
- Put DB queries directly in `.astro` page files
- Create a separate `EditUnitForm` class — extend the existing `UnitForm` instead

### Error Display Pattern

```astro
<label for="name">Name</label>
<input id="name" name="name" value={formData.name ?? ""} aria-describedby={errors.name ? "name-error" : undefined} />
{errors.name && <p id="name-error" class="admin-form__error">{errors.name}</p>}
```

### Same-Page Form Handling Pattern

```typescript
// In .astro frontmatter:
import { validateCsrfToken } from "@/auth/csrf";
import { UnitForm } from "@/form/UnitForm";

const id = Number(Astro.params.id);
const unitForm = new UnitForm(id);

// Check unit exists (unitForm loads the data in constructor)

if (Astro.request.method === "POST") {
  const data = await Astro.request.formData();
  const submittedCsrf = data.get("_csrf")?.toString() ?? "";

  if (!validateCsrfToken(csrfToken, submittedCsrf)) {
    unitForm.getErrors().form = "Invalid form submission. Please try again.";
  } else if (data.get("action") === "delete") {
    // Handle delete
  } else if (unitForm.handleForm(data)) {
    return Astro.redirect("/admin");
  }
}
```

### Existing Code to Build On

**UnitForm** (`src/form/UnitForm.ts`):
- Already has `getFields()`, `getValue()`, `getErrors()`, `handleForm()`
- Currently only supports creating — needs `id` parameter and edit logic

**UnitAdminForm component** (`src/components/UnitAdminForm.astro`):
- Already renders the form with fields from `UnitForm.getFields()`
- Reusable for both create and edit — just change `submitLabel` prop

**Unit repository** (`src/data/repo/unit-repository.ts`):
- Has `createUnit`, `getAllUnits`, `findUnitBySlug`, `isSlugAvailable`
- Needs `getUnitById`, `getKeywordsForUnit`, `deleteUnitById`, `updateUnit`

### Library & Framework Requirements

All packages already installed. No new dependencies needed.

| Package | Version | Purpose |
|---|---|---|
| astro | ^5.17.3 | MPA framework (installed) |
| drizzle-orm | ^0.45.1 | Type-safe ORM (installed) |
| better-sqlite3 | ^12.6.2 | SQLite driver (installed) |
| zod | ^3.25.76 | Form validation (installed) |
| vitest | ^4.0.18 | Unit testing (installed) |

### Project Structure Notes

Files to create or modify in this story:

```
src/
├── data/
│   └── repo/
│       └── unit-repository.ts (modify — add getUnitById, getKeywordsForUnit, deleteUnitById, updateUnit, update isSlugAvailable)
├── form/
│   └── UnitForm.ts            (modify — add optional id constructor param, edit mode logic)
└── pages/
    └── admin/
        └── units/
            └── [id]/
                └── edit.astro  (create — edit unit form page with delete button)
```

### Previous Story Learnings (from Story 1.2)

- Integer stat columns (movement, toughness, save, wounds, objectiveControl) use `integer()` in Drizzle schema and `z.preprocess` with `Number()` coercion in Zod
- `invulnerabilitySave` is optional — both in schema and Zod validation
- The `UnitForm` class and `UnitAdminForm.astro` component were extracted during code review to keep route files minimal
- All imports use the `@/` alias (enforced during code review)
- `unit_keyword` has ON DELETE CASCADE on both FKs, so deleting a unit automatically cleans up keyword associations

### References

- [Source: architecture.md#Data-Architecture] — Drizzle ORM schema, slug handling
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — Same-page form handling, naming conventions, anti-patterns
- [Source: architecture.md#Project-Structure-&-Boundaries] — Data access boundary, form boundary, directory structure
- [Source: architecture.md#Frontend-Architecture] — URL structure: `/admin/units/[id]/edit`
- [Source: epics.md#Story-1.3] — Acceptance criteria for edit and delete
- [Source: prd.md#Unit-Administration] — FR15 (edit unit), FR16 (delete unit)

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

- Drizzle migration regenerated: previous migration had `ON DELETE no action` for `unit_keyword` FKs despite schema specifying `onDelete: "cascade"`. Deleted old migration and regenerated to fix.
- Added `@` path alias to `vitest.config.ts` — vitest was not resolving `@/` imports without explicit alias configuration.

### Completion Notes List

- Task 1: Added `getUnitById`, `getKeywordsForUnit`, `updateUnit`, `deleteUnitById` to unit repository. Extracted `syncKeywords` helper to share keyword association logic between `createUnit` and `updateUnit`. Updated `isSlugAvailable` to accept optional `excludeId` parameter using `and()`/`ne()` from drizzle-orm.
- Task 2: Extended `UnitForm` constructor to accept optional `id` parameter. When provided, loads unit data via `getUnitById` and keywords via `getKeywordsForUnit`, storing as initial form values. Added `isEditMode()` and `exists()` methods. `handleForm` now branches to call `updateUnit` in edit mode, passing `excludeId` to `isSlugAvailable`.
- Task 3: Created `src/pages/admin/units/[id]/edit.astro` with same-page form handling. Parses id from route params, instantiates `UnitForm(id)`, renders `UnitAdminForm` with "Save Changes" label. Returns 404 for invalid/non-existent ids.
- Task 4: Added delete form to edit page with `onsubmit="return confirm('...')"` for native dialog. POST handler checks `action === "delete"`, validates CSRF, calls `deleteUnitById`, redirects to `/admin`.
- Task 5: Created 15 repository tests (getUnitById, getKeywordsForUnit, updateUnit, deleteUnitById, isSlugAvailable with excludeId) and 12 UnitForm tests (constructor create/edit modes, handleForm create/edit modes, slug uniqueness with excludeId). 27 new tests, 74 total passing, 0 regressions.

### Change Log
- 2026-02-19: Story created manually — ready-for-dev
- 2026-02-19: Implemented all 5 tasks — repository functions (getUnitById, getKeywordsForUnit, updateUnit, deleteUnitById, isSlugAvailable with excludeId), UnitForm edit mode (optional id constructor, loads DB values, branches handleForm), edit page with delete button, 27 new tests. Regenerated migration for CASCADE fix. Added vitest path alias. 74 total tests passing.
- 2026-02-19: Changed leadership from text/string to integer across all layers — schema, Zod validation, repository interface, UnitForm field type, and all tests. Regenerated migration.

### File List
- `src/data/repo/unit-repository.ts` — modified (added getUnitById, getKeywordsForUnit, updateUnit, deleteUnitById; updated isSlugAvailable with excludeId; extracted syncKeywords helper)
- `src/data/repo/unit-repository.test.ts` — created (15 tests for repository functions)
- `src/form/UnitForm.ts` — modified (added optional id constructor param, isEditMode, exists methods, edit mode in handleForm)
- `src/form/UnitForm.test.ts` — created (12 tests for UnitForm create and edit modes)
- `src/pages/admin/units/[id]/edit.astro` — created (edit unit form page with delete button)
- `vitest.config.ts` — modified (added @ path alias for vitest resolution)
- `drizzle/0000_ordinary_lockjaw.sql` — regenerated (fixed ON DELETE cascade for unit_keyword FKs)
