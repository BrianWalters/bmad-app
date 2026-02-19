# Story 1.4: Model Management

Status: review

## Story

As an admin,
I want to add, edit, and remove models within a unit,
So that each unit's model composition is fully defined.

## Acceptance Criteria

1. **Given** the model table exists with a foreign key to the unit table
   **When** an admin is on the create or edit unit page
   **Then** a section for managing models is displayed below the unit attributes

2. **Given** an admin clicks to add a new model
   **When** the model fields are displayed
   **Then** the admin can enter model name and other model attributes (FR17)

3. **Given** an admin has added models to a unit and submits the form
   **When** the server processes the request
   **Then** all models are validated with Zod and saved to the database associated with the unit

4. **Given** an admin is editing a unit with existing models
   **When** the edit page loads
   **Then** all existing models are displayed with their current data, each editable (FR18)

5. **Given** an admin modifies a model's details and submits
   **When** the server processes the request
   **Then** the model is updated in the database

6. **Given** an admin removes a model from a unit
   **When** the form is submitted
   **Then** the model and its associated equipment options are deleted from the database (FR19)

## Tasks / Subtasks

- [x] Task 1: Add model table to schema and generate migration (AC: #1)
  - [x] 1.1 Add `model` table to `src/data/orm/schema.ts` with columns: `id` (PK auto-increment), `unit_id` (integer FK to `unit.id`, `onDelete: "cascade"`, not null), `name` (text, not null), `created_at` (text, not null, default `datetime('now')`)
  - [x] 1.2 Run `npm run generate` to create a new Drizzle migration for the model table
  - [x] 1.3 Run `npm run migrate` to apply the migration
- [x] Task 2: Create model Zod validation schema (AC: #3)
  - [x] 2.1 Create `src/data/validation/model.ts` with `modelSchema`: `name` required non-empty string
  - [x] 2.2 Create `src/data/validation/model.test.ts` — test valid input, missing name, empty name
- [x] Task 3: Create model repository (AC: #3, #5, #6)
  - [x] 3.1 Create `src/data/repo/model-repository.ts` with functions: `createModel(unitId, data)`, `getModelById(id)`, `getModelsForUnit(unitId)` (ordered by name asc), `updateModel(id, data)`, `deleteModelById(id)` (returns `DeleteResult`)
- [x] Task 4: Create ModelForm class (AC: #2, #3, #4, #5)
  - [x] 4.1 Create `src/form/ModelForm.ts` following the UnitForm pattern — constructor takes `unitId: number` (required) and optional `modelId?: number`; when `modelId` is provided, loads existing model data as form defaults via `getModelById`
  - [x] 4.2 Implement `getFields()`, `getValue()`, `getErrors()`, `handleForm(data)`, `isEditMode()`, `exists()`, `getUnitId()`
  - [x] 4.3 `handleForm` validates with `modelSchema`, then calls `createModel` or `updateModel` depending on mode
  - [x] 4.4 Create `src/form/ModelForm.test.ts` — test create mode, edit mode (loads data), handleForm create, handleForm edit, validation failure
- [x] Task 5: Create model admin form component and route pages (AC: #2, #3, #4, #5, #6)
  - [x] 5.1 Create `src/components/ModelAdminForm.astro` — renders model form fields (name input) using `Field.astro` and `Button.astro`, receives `csrfToken`, `modelForm`, `submitLabel` props
  - [x] 5.2 Create `src/pages/admin/units/[id]/models/new.astro` — same-page form handling: GET renders empty model form, POST validates CSRF → calls `modelForm.handleForm(data)` → redirect to `/admin/units/[id]/edit` on success. Return 404 if unit id is invalid or unit doesn't exist.
  - [x] 5.3 Create `src/pages/admin/units/[id]/models/[modelId]/edit.astro` — same-page form handling: GET renders pre-populated model form, POST handles edit (validate CSRF → handleForm → redirect) and delete (validate CSRF → `deleteModelById` → redirect). Return 404 if unit or model doesn't exist. Delete uses `confirm()` dialog via `onsubmit` attribute.
- [x] Task 6: Add models section to unit pages (AC: #1, #4)
  - [x] 6.1 Modify `src/pages/admin/units/[id]/edit.astro` — below the unit form and delete section, add a "Models" section that lists existing models using `getModelsForUnit(id)`, displaying each model's name with an "Edit" link to `/admin/units/[id]/models/[modelId]/edit`; include an "Add Model" link to `/admin/units/[id]/models/new`
  - [x] 6.2 On `src/pages/admin/units/new.astro` — add a note below the unit form: "Save the unit first, then add models from the edit page." (Models require a unit_id FK, so they cannot be added before the unit exists.)

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Stories 1.1–1.3):**

- **Same-page form handling:** Every `.astro` form page handles both GET (render) and POST (process) in frontmatter. Successful POST ALWAYS redirects — never render after a write.
- **Data access boundary:** ALL database operations go through repository modules in `src/data/repo/`. Pages NEVER import `drizzle-orm` or `better-sqlite3` directly.
- **Auth boundary:** Session data available via `Astro.locals.session!` (set by middleware). Import `validateCsrfToken` from `@/auth/csrf` for CSRF checks.
- **Validation boundary:** Zod schemas live in `src/data/validation/`. Never define inline validation.
- **Form boundary:** `src/form/` form classes encapsulate field definitions, FormData parsing, Zod validation, and save orchestration. Route files handle only CSRF validation, form instantiation, and redirect logic.
- **Import convention:** Always use `@/` path alias — never relative paths.
- **Error display:** Use `aria-describedby` linking input to error element. Error text uses `field__error` BEM class.

### Model Table Design

The `model` table for this story:

| Column | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `unit_id` | integer | FK → `unit.id`, `onDelete: "cascade"`, not null |
| `name` | text | not null |
| `created_at` | text | not null, default `datetime('now')` |

**Important:** The `default_equipment_id` FK column will be added in Story 1.5 when the `equipment_option` table is created. Do NOT add it in this story.

**Cascade behavior:** `onDelete: "cascade"` on `unit_id` means deleting a unit automatically deletes all its models. This extends the existing cascade chain — no changes needed to the unit delete logic from Story 1.3.

### Model Repository Pattern

Follow the exact pattern from `src/data/repo/unit-repository.ts`:

```typescript
interface ModelData {
  name: string;
}
```

Functions needed:
- `createModel(unitId: number, data: ModelData)` — inserts model row
- `getModelById(id: number)` — returns model or null
- `getModelsForUnit(unitId: number)` — returns all models for a unit, ordered by name ascending
- `updateModel(id: number, data: ModelData)` — updates model row
- `deleteModelById(id: number): DeleteResult` — deletes model, returns `{ success: boolean }`

Import the `DeleteResult` interface from `@/data/repo/unit-repository` or define a shared type. Prefer reusing the existing `DeleteResult` interface.

### ModelForm Class Pattern

Follow the `UnitForm` class pattern exactly:

```typescript
export class ModelForm {
  private unitId: number;
  private modelId?: number;
  private formData: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private modelExists = true;

  constructor(unitId: number, modelId?: number) {
    this.unitId = unitId;
    this.modelId = modelId;
    if (modelId !== undefined) {
      // Load existing model data as defaults
    }
  }

  getUnitId(): number { return this.unitId; }
  isEditMode(): boolean { return this.modelId !== undefined; }
  exists(): boolean { return this.modelExists; }
  getFields(): Array<FormField> { /* name field */ }
  getValue(name: string): string | null { /* ... */ }
  getErrors(): Record<string, string> { return this.errors; }
  handleForm(data: FormData): boolean { /* validate → create/update */ }
}
```

The `getFields()` method returns only the `name` field.

### Route Structure for Model Pages

| Route | Purpose |
|---|---|
| `/admin/units/[id]/models/new` | Add model to unit |
| `/admin/units/[id]/models/[modelId]/edit` | Edit model / delete model |

Both pages must:
1. Validate the `id` param (unit must exist) — return 404 if not
2. For edit: validate `modelId` param (model must exist and belong to unit) — return 404 if not
3. After successful create/edit/delete: redirect to `/admin/units/[id]/edit`
4. Follow same-page form handling pattern exactly

### Model Delete Pattern

Follows the existing delete pattern from Story 1.3:
- Separate `<form>` on the model edit page with hidden `action="delete"` field
- `onsubmit="return confirm('Are you sure you want to delete this model? This action cannot be undone.')"` for native dialog
- CSRF token validated before deletion
- Redirect to `/admin/units/[unitId]/edit` after delete

### Unit Edit Page — Models Section

Add below the existing delete section on the edit page:

```html
<section>
  <h2>Models</h2>
  <!-- List existing models -->
  <!-- Each model: name, Edit link -->
  <!-- "Add Model" link at bottom -->
</section>
```

Use `getModelsForUnit(id)` to fetch models. Display as a list or table. Show empty state if no models: "No models yet."

### Database Naming Conventions
- Table name: `model` (singular, snake_case)
- Columns: `unit_id`, `created_at` (snake_case)
- Drizzle maps to camelCase TypeScript properties automatically

### Code Naming Conventions
- Functions: camelCase — `createModel()`, `getModelById()`, `getModelsForUnit()`
- Types: PascalCase — `ModelData`
- Zod schemas: camelCase with `Schema` suffix — `modelSchema`
- Files: kebab-case — `model-repository.ts`, `ModelForm.ts` (form classes are PascalCase per existing convention)

### Anti-Patterns — NEVER do these:
- Plural table names (`models` instead of `model`)
- camelCase DB columns
- Render after a successful POST (always redirect)
- Skip CSRF validation on any POST handler
- Import `drizzle-orm` or `better-sqlite3` from pages or components
- Put DB queries directly in `.astro` page files
- Use relative imports — always use `@/` alias
- Add `default_equipment_id` to the model table in this story (that's Story 1.5)

### Existing Code to Build On

**UnitForm** (`src/form/UnitForm.ts`):
- Pattern for constructor with optional id, create/edit branching, `isEditMode()`, `exists()`, `getFields()`, `getValue()`, `getErrors()`, `handleForm()`
- ModelForm should follow this exact structure

**UnitAdminForm** (`src/components/UnitAdminForm.astro`):
- Pattern for form component: receives `csrfToken`, form instance, `submitLabel` props
- Uses `Field.astro` for input fields and `Button.astro` for submit
- Handles textarea (description) and special fields (keywords) outside the `fields.map()` loop
- ModelAdminForm follows this pattern but is simpler (just name field)

**Field.astro** (`src/components/Field.astro`):
- Reusable field component — use for model name field

**Button.astro** (`src/components/Button.astro`):
- Reusable button with `primary`/`danger` variants — use for submit and delete buttons

**Unit edit page** (`src/pages/admin/units/[id]/edit.astro`):
- Already has same-page form handling for unit edit + delete
- Add models section below the delete form
- Import `getModelsForUnit` from `@/data/repo/model-repository`

**DeleteResult** (`src/data/repo/unit-repository.ts`):
- Reuse this interface for `deleteModelById` return type. Import from unit-repository or extract to a shared location.

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
│   ├── orm/
│   │   └── schema.ts              (modify — add model table)
│   ├── repo/
│   │   └── model-repository.ts    (create — model CRUD functions)
│   └── validation/
│       ├── model.ts               (create — Zod model schema)
│       └── model.test.ts          (create — validation tests)
├── form/
│   ├── ModelForm.ts               (create — model form class)
│   └── ModelForm.test.ts          (create — form class tests)
├── components/
│   └── ModelAdminForm.astro       (create — model form component)
└── pages/
    └── admin/
        └── units/
            ├── new.astro          (modify — add "save first" note for models)
            └── [id]/
                ├── edit.astro     (modify — add models section)
                └── models/
                    ├── new.astro          (create — add model page)
                    └── [modelId]/
                        └── edit.astro     (create — edit/delete model page)
drizzle/
└── (new migration file)           (generated — model table migration)
```

### Previous Story Learnings (from Stories 1.2 and 1.3)

- Integer stat columns use `integer()` in Drizzle and `z.preprocess` with `Number()` in Zod — model doesn't have integer stats, but follow the same pattern if any are added
- `UnitForm` class and `UnitAdminForm.astro` were extracted to keep route files minimal — do the same for ModelForm and ModelAdminForm
- All imports must use `@/` alias (enforced during code review)
- `unit_keyword` has `ON DELETE CASCADE` — model table must also use `onDelete: "cascade"` on unit_id FK so unit deletes cascade to models
- Vitest requires `@` path alias configured in `vitest.config.ts` (already done in Story 1.3)
- When generating Drizzle migrations, verify the SQL output matches schema intent (cascade behavior was wrong in one previous migration)
- `deleteUnitById` already works via cascade — no changes needed when model table is added with cascade FK

### References

- [Source: architecture.md#Data-Architecture] — Unit > Model > Equipment Option hierarchy, Drizzle schema, migration approach
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — Same-page form handling, naming conventions, anti-patterns
- [Source: architecture.md#Project-Structure-&-Boundaries] — Data access boundary, form boundary, directory structure, test organization
- [Source: architecture.md#Frontend-Architecture] — URL structure for admin pages
- [Source: epics.md#Story-1.4] — Acceptance criteria for model management
- [Source: prd.md#Unit-Administration] — FR17 (add models), FR18 (edit models), FR19 (remove models)
- [Source: ux-design-specification.md#Core-Interaction-Design] — Admin forms use native browser controls, flat admin flow

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

No issues encountered during implementation. All tasks completed in a single pass.

### Completion Notes List

- Task 1: Added `model` table to Drizzle schema with cascade FK to `unit.id`. Generated and applied migration `0001_medical_talkback.sql`. Verified CASCADE ON DELETE in SQL output.
- Task 2: Created `modelSchema` Zod validation (name: required non-empty string). 3 tests: valid input, missing name, empty name — all pass.
- Task 3: Created model repository with CRUD functions following unit-repository pattern. Reuses `DeleteResult` interface from unit-repository.
- Task 4: Created `ModelForm` class following `UnitForm` pattern exactly — constructor with `unitId` (required) and `modelId` (optional), edit mode loads existing data, `handleForm` validates then creates/updates. 7 tests covering create mode, edit mode, handleForm create, handleForm edit, and validation failure — all pass.
- Task 5: Created `ModelAdminForm.astro` component, `new.astro` and `edit.astro` route pages. All follow same-page form handling pattern. Edit page includes delete with confirm dialog. Both pages validate unit/model existence and return 404 when not found.
- Task 6: Added "Models" section to unit edit page listing models with edit links and "Add Model" link. Added "Save the unit first" note to unit new page.
- All 69 tests pass (10 new tests added: 3 model validation + 7 ModelForm). Zero regressions.

### Change Log

- 2026-02-19: Implemented Story 1.4 — Model Management. Added model table, Zod schema, repository, ModelForm class, admin form component, and route pages for add/edit/delete model within a unit.

### File List

- src/data/orm/schema.ts (modified — added model table)
- src/data/validation/model.ts (created — Zod model schema)
- src/data/validation/model.test.ts (created — validation tests)
- src/data/repo/model-repository.ts (created — model CRUD repository)
- src/form/ModelForm.ts (created — model form class)
- src/form/ModelForm.test.ts (created — form class tests)
- src/components/ModelAdminForm.astro (created — model form component)
- src/pages/admin/units/[id]/models/new.astro (created — add model page)
- src/pages/admin/units/[id]/models/[modelId]/edit.astro (created — edit/delete model page)
- src/pages/admin/units/[id]/edit.astro (modified — added models section)
- src/pages/admin/units/new.astro (modified — added "save first" note)
- drizzle/0001_medical_talkback.sql (generated — model table migration)
