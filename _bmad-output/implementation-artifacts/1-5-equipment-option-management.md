# Story 1.5: Equipment Option Management

Status: ready-for-dev

## Story

As an admin,
I want to define, edit, and remove equipment options for each model and designate a default,
So that players can see all available equipment choices and which is the default.

## Acceptance Criteria

1. **Given** the `equipment_option` table and `model_equipment_option` join table exist
   **When** an admin is on the model edit page
   **Then** a section for managing equipment options is displayed below the model form

2. **Given** an admin clicks to add an equipment option to a model
   **When** the equipment option fields are displayed
   **Then** the admin can enter the equipment option name and submit the form (FR20)

3. **Given** an admin edits an existing equipment option
   **When** the updated data is submitted
   **Then** the equipment option is updated in the database (FR21)

4. **Given** an admin removes an equipment option from a model
   **When** the form is submitted
   **Then** the association is deleted from the join table, and if it was the default, the default is cleared (FR22)

5. **Given** an admin designates an equipment option as the model's default
   **When** the form is submitted
   **Then** the `is_default` flag is set on that association row (and cleared on any previous default for the same model)

6. **Given** a model has no default equipment set
   **When** the admin views the model edit page
   **Then** no equipment option is marked as default, prompting the admin to choose one

7. **Given** a model has one or more equipment options
   **When** the admin views the model edit page
   **Then** all equipment options are displayed in a single table with columns Name, Range, A, BS/WS, S, AP, D (showing damageMin–damageMax), the default option row appears first, and each row includes "Edit" and "Set as Default" actions

## Tasks / Subtasks

- [ ] Task 1: Add `equipment_option` and `model_equipment_option` tables to schema, generate migration (AC: #1)
  - [ ] 1.1 Add `equipment_option` table to `src/data/orm/schema.ts` with columns: `id` (PK auto-increment), `name` (text, not null), `range` (integer, not null, default 0), `attacks` (integer, not null), `skill` (integer, not null), `strength` (integer, not null), `armorPiercing` (integer `armor_piercing`, not null, default 0), `damageMin` (integer `damage_min`, not null, default 1), `damageMax` (integer `damage_max`, not null, default 1), `created_at` (text, not null, default `datetime('now')`)
  - [ ] 1.2 Add `model_equipment_option` join table to `src/data/orm/schema.ts` with columns: `modelId` (integer FK to `model.id`, `onDelete: "cascade"`, not null), `equipmentOptionId` (integer FK to `equipment_option.id`, `onDelete: "cascade"`, not null), `isDefault` (integer, not null, default 0); composite primary key on (`modelId`, `equipmentOptionId`)
  - [ ] 1.3 Run `npm run generate` to create a new Drizzle migration
  - [ ] 1.4 Verify migration SQL: `model_equipment_option` has CASCADE on both FKs, composite PK, and `is_default` column with default 0
  - [ ] 1.5 Run `npm run migrate` to apply the migration
- [ ] Task 2: Create equipment option Zod validation schema (AC: #2)
  - [ ] 2.1 Create `src/data/validation/equipment-option.ts` with `equipmentOptionSchema`: `name` (trimmed string, `.trim().min(1)`), `range` (coerced integer, min 0, default 0), `attacks` (coerced integer, min 1), `skill` (coerced integer, min 1), `strength` (coerced integer, min 1), `armorPiercing` (coerced integer, min 0, default 0), `damageMin` (coerced integer, min 1, default 1), `damageMax` (coerced integer, min 1, default 1); add `.refine()` to enforce `damageMax >= damageMin`
  - [ ] 2.2 Create `src/data/validation/equipment-option.test.ts` — test valid input with all fields, valid input with defaults only, missing required fields, whitespace-only name, damageMax < damageMin rejection, negative values rejected
- [ ] Task 3: Create equipment option repository (AC: #2, #3, #4, #5)
  - [ ] 3.1 Create `src/data/repo/equipment-option-repository.ts` with functions: `createEquipmentOptionForModel(modelId, data)` (creates `equipment_option` row AND `model_equipment_option` association in a transaction), `getEquipmentOptionById(id)`, `getEquipmentOptionsForModel(modelId)` (joins through `model_equipment_option`, ordered by name asc, includes `isDefault` flag), `updateEquipmentOption(id, data)`, `removeEquipmentOptionFromModel(modelId, equipmentOptionId)` (deletes association row, returns `DeleteResult`); import `DeleteResult` from `@/data/repo/unit-repository`
  - [ ] 3.2 Add `setDefaultEquipment(modelId, equipmentOptionId)` — in a transaction: clear `is_default` on all associations for this model, then set `is_default = 1` on the specified association
  - [ ] 3.3 Add `clearDefaultEquipment(modelId)` — sets `is_default = 0` on all associations for this model
- [ ] Task 4: Create EquipmentOptionForm class (AC: #2, #3)
  - [ ] 4.1 Create `src/form/EquipmentOptionForm.ts` following the ModelForm pattern — constructor takes `modelId: number` (required) and optional `equipmentOptionId?: number`; when `equipmentOptionId` is provided, loads existing data via `getEquipmentOptionById` and verifies the equipment option is associated with the given model (ownership check via join table query)
  - [ ] 4.2 Implement `getFields()` (name, range, attacks, skill, strength, armorPiercing, damageMin, damageMax), `getValue()`, `getErrors()`, `handleForm(data)`, `isEditMode()`, `exists()`, `getModelId()`
  - [ ] 4.3 `handleForm` validates with `equipmentOptionSchema`, then calls `createEquipmentOptionForModel` or `updateEquipmentOption` depending on mode
  - [ ] 4.4 Create `src/form/EquipmentOptionForm.test.ts` — test create mode, edit mode (loads data), edit mode with unassociated equipment option (exists=false), handleForm create, handleForm edit, validation failure
- [ ] Task 5: Create equipment option admin form component and route pages (AC: #2, #3, #4)
  - [ ] 5.1 Create `src/components/EquipmentOptionAdminForm.astro` — renders all equipment option form fields (name text input, range/attacks/skill/strength/armorPiercing/damageMin/damageMax number inputs) using `Field.astro` and `Button.astro`, receives `csrfToken`, `equipmentOptionForm`, `submitLabel` props; number inputs use `type="number"` with appropriate `min` attributes
  - [ ] 5.2 Create `src/pages/admin/units/[unitId]/models/[modelId]/equipment/new.astro` — same-page form handling: GET renders empty form, POST validates CSRF → calls `equipmentOptionForm.handleForm(data)` → redirect to model edit page on success. Return 404 if unit or model doesn't exist or model doesn't belong to unit.
  - [ ] 5.3 Create `src/pages/admin/units/[unitId]/models/[modelId]/equipment/[equipmentId]/edit.astro` — same-page form handling: GET renders pre-populated form, POST handles edit (validate CSRF → handleForm → redirect) and remove (validate CSRF → `removeEquipmentOptionFromModel` → redirect). Return 404 if unit, model, or equipment option doesn't exist or ownership doesn't match. Remove uses `confirm()` dialog via `onsubmit` attribute.
- [ ] Task 6: Add equipment options section and default management to model edit page (AC: #1, #5, #6)
  - [ ] 6.1 Modify `src/pages/admin/units/[unitId]/models/[modelId]/edit.astro` — below the model form and delete section, add an "Equipment Options" section: render a single `<table>` with column headers (Name, Range, A, BS/WS, S, AP, D, Actions) and one row per equipment option. D column displays `damageMin–damageMax`. Default row appears first. Default row name shows "(Default)" label. Actions column contains "Edit" link and "Set as Default" form for non-default rows. Include an "Add Equipment Option" link below the table. Use `getEquipmentOptionsForModel(modelId)`. (AC: #7)
  - [ ] 6.2 Handle `action=set-default` in the model edit page POST handler: validate CSRF → read `equipmentId` from form data → call `setDefaultEquipment(modelId, equipmentId)` → redirect to model edit page
  - [ ] 6.3 Show prompt text "No equipment options yet." when empty, and "No default selected." when equipment options exist but none is designated as default

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Stories 1.1–1.4):**

- **Same-page form handling:** Every `.astro` form page handles both GET (render) and POST (process) in frontmatter. Successful POST ALWAYS redirects — never render after a write.
- **Data access boundary:** ALL database operations go through repository modules in `src/data/repo/`. Pages NEVER import `drizzle-orm` or `better-sqlite3` directly.
- **Auth boundary:** Session data available via `Astro.locals.session!` (set by middleware). Import `validateCsrfToken` from `@/auth/csrf` for CSRF checks.
- **Validation boundary:** Zod schemas live in `src/data/validation/`. Never define inline validation.
- **Form boundary:** `src/form/` form classes encapsulate field definitions, FormData parsing, Zod validation, and save orchestration. Route files handle only CSRF validation, form instantiation, and redirect logic.
- **Import convention:** Always use `@/` path alias — never relative paths.
- **Error display:** Use `aria-describedby` linking input to error element. Error text uses `field__error` BEM class.
- **Ownership validation:** Form classes must verify that loaded entities belong to the parent entity. This was a code review finding in Story 1.4.

### Data Model — Many-to-Many with Default Flag

**Design decision:** Equipment options have a many-to-many relationship with models via a join table. The default designation is stored as a flag on the association, not as a FK on the model table. This allows equipment options to be shared across models and keeps the default per-association.

**`equipment_option` table:**

| Column | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `name` | text | not null |
| `range` | integer | not null, default 0 |
| `attacks` | integer | not null |
| `skill` | integer | not null |
| `strength` | integer | not null |
| `armor_piercing` | integer | not null, default 0 |
| `damage_min` | integer | not null, default 1 |
| `damage_max` | integer | not null, default 1 |
| `created_at` | text | not null, default `datetime('now')` |

**`model_equipment_option` join table:**

| Column | Type | Constraints |
|---|---|---|
| `model_id` | integer | FK → `model.id`, `onDelete: "cascade"`, not null |
| `equipment_option_id` | integer | FK → `equipment_option.id`, `onDelete: "cascade"`, not null |
| `is_default` | integer | not null, default 0 |
| | | Composite PK on (`model_id`, `equipment_option_id`) |

**Cascade behavior:**
- Deleting a model cascades to `model_equipment_option` rows (removes all associations)
- Deleting an equipment option cascades to `model_equipment_option` rows (removes all associations)
- No `default_equipment_id` column on the model table — the default is tracked in the join table

**Default enforcement:** Only one equipment option per model should have `is_default = 1`. The `setDefaultEquipment` function enforces this by clearing all defaults for the model before setting the new one, wrapped in a transaction.

### Schema Definition in Drizzle

```typescript
export const equipmentOption = sqliteTable("equipment_option", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  range: integer("range").notNull().default(0),
  attacks: integer("attacks").notNull(),
  skill: integer("skill").notNull(),
  strength: integer("strength").notNull(),
  armorPiercing: integer("armor_piercing").notNull().default(0),
  damageMin: integer("damage_min").notNull().default(1),
  damageMax: integer("damage_max").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const modelEquipmentOption = sqliteTable(
  "model_equipment_option",
  {
    modelId: integer("model_id")
      .notNull()
      .references(() => model.id, { onDelete: "cascade" }),
    equipmentOptionId: integer("equipment_option_id")
      .notNull()
      .references(() => equipmentOption.id, { onDelete: "cascade" }),
    isDefault: integer("is_default").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.modelId, table.equipmentOptionId] }),
  ],
);
```

This follows the exact pattern of `unitKeyword` join table already in the schema. Place both new table definitions after the existing `model` table definition.

### Equipment Option Repository Pattern

```typescript
interface EquipmentOptionData {
  name: string;
  range: number;
  attacks: number;
  skill: number;
  strength: number;
  armorPiercing: number;
  damageMin: number;
  damageMax: number;
}
```

Functions needed:
- `createEquipmentOptionForModel(modelId: number, data: EquipmentOptionData)` — in a transaction: insert into `equipment_option`, then insert association into `model_equipment_option`
- `getEquipmentOptionById(id: number)` — returns equipment option or null
- `getEquipmentOptionsForModel(modelId: number)` — joins `model_equipment_option` with `equipment_option`, returns array with `id`, `name`, `range`, `attacks`, `skill`, `strength`, `armorPiercing`, `damageMin`, `damageMax`, `isDefault`, ordered by `isDefault` desc then name asc (default option first)
- `updateEquipmentOption(id: number, data: EquipmentOptionData)` — updates the `equipment_option` row
- `removeEquipmentOptionFromModel(modelId: number, equipmentOptionId: number): DeleteResult` — deletes the association row from `model_equipment_option`
- `setDefaultEquipment(modelId: number, equipmentOptionId: number)` — in a transaction: set `is_default = 0` for all associations of this model, then set `is_default = 1` for the specified association
- `clearDefaultEquipment(modelId: number)` — set `is_default = 0` for all associations of this model
- `isEquipmentOptionAssociatedWithModel(modelId: number, equipmentOptionId: number): boolean` — checks if the association exists (used for ownership validation in EquipmentOptionForm)

Import `DeleteResult` from `@/data/repo/unit-repository`.

### EquipmentOptionForm Class Pattern

Follow the `ModelForm` class pattern:

```typescript
export class EquipmentOptionForm {
  private modelId: number;
  private equipmentOptionId?: number;
  private formData: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private optionExists = true;

  constructor(modelId: number, equipmentOptionId?: number) {
    this.modelId = modelId;
    this.equipmentOptionId = equipmentOptionId;
    if (equipmentOptionId !== undefined) {
      const existing = getEquipmentOptionById(equipmentOptionId);
      if (!existing || !isEquipmentOptionAssociatedWithModel(modelId, equipmentOptionId)) {
        this.optionExists = false;
        return;
      }
      this.formData = {
        name: existing.name,
        range: String(existing.range),
        attacks: String(existing.attacks),
        skill: String(existing.skill),
        strength: String(existing.strength),
        armorPiercing: String(existing.armorPiercing),
        damageMin: String(existing.damageMin),
        damageMax: String(existing.damageMax),
      };
    }
  }

  getModelId(): number { return this.modelId; }
  isEditMode(): boolean { return this.equipmentOptionId !== undefined; }
  exists(): boolean { return this.optionExists; }
  getFields(): Array<FormField> { /* name, range, attacks, skill, strength, armorPiercing, damageMin, damageMax */ }
  getValue(name: string): string | null { /* ... */ }
  getErrors(): Record<string, string> { return this.errors; }
  handleForm(data: FormData): boolean { /* validate → create/update */ }
}
```

**Ownership check:** Unlike ModelForm which checks `existing.unitId !== unitId`, the equipment option ownership check queries the `model_equipment_option` join table to verify the association exists.

### Route Structure for Equipment Option Pages

| Route | Purpose |
|---|---|
| `/admin/units/[unitId]/models/[modelId]/equipment/new` | Add equipment option to model |
| `/admin/units/[unitId]/models/[modelId]/equipment/[equipmentId]/edit` | Edit / remove equipment option from model |

Both pages must:
1. Validate `unitId` param (unit must exist) — return 404 if not
2. Validate `modelId` param (model must exist and belong to unit) — return 404 if not
3. For edit: validate `equipmentId` param (equipment option must exist and be associated with model) — return 404 if not
4. After successful create/edit/remove: redirect to `/admin/units/[unitId]/models/[modelId]/edit`
5. Follow same-page form handling pattern exactly

### Model Edit Page — Equipment Options Section

Add below the existing delete section on the model edit page:

```html
<hr />
<section>
  <h2>Equipment Options</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th><th>Range</th><th>A</th><th>BS/WS</th>
        <th>S</th><th>AP</th><th>D</th><th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <!-- Default row first, then remaining by name asc -->
      <tr>
        <td>Option Name (Default)</td><td>24</td><td>2</td><td>3</td>
        <td>4</td><td>-1</td><td>1-2</td>
        <td><a href="...">Edit</a></td>
      </tr>
      <tr>
        <td>Other Option</td><td>0</td><td>3</td><td>4</td>
        <td>5</td><td>0</td><td>1-1</td>
        <td><a href="...">Edit</a> | "Set as Default" form</td>
      </tr>
    </tbody>
  </table>
  <a href="...">Add Equipment Option</a>
  <!-- Empty state: "No equipment options yet." (replaces table) -->
  <!-- No default state: "No default selected." shown above table when options exist but none is default -->
</section>
```

**"Set as Default" pattern:**
Each non-default equipment option gets a small inline form:
```html
<form method="POST">
  <input type="hidden" name="_csrf" value={csrfToken} />
  <input type="hidden" name="action" value="set-default" />
  <input type="hidden" name="equipmentId" value={option.id} />
  <button type="submit">Set as Default</button>
</form>
```

The model edit page's POST handler routes on the `action` field:
- `action=delete` → delete model (existing)
- `action=set-default` → set default equipment option (new)
- No action → model edit form submission (existing)

### Equipment Option Remove Pattern

Follows the existing delete pattern from Stories 1.3 and 1.4:
- Separate `<form>` on the equipment option edit page with hidden `action="delete"` field
- `onsubmit="return confirm('Are you sure you want to remove this equipment option? This action cannot be undone.')"` for native dialog
- CSRF token validated before removal
- Calls `removeEquipmentOptionFromModel(modelId, equipmentOptionId)` to delete the association
- Redirect to `/admin/units/[unitId]/models/[modelId]/edit` after removal

### Database Naming Conventions
- Table names: `equipment_option`, `model_equipment_option` (singular, snake_case)
- Columns: `model_id`, `equipment_option_id`, `is_default`, `created_at` (snake_case)
- Drizzle maps to camelCase TypeScript properties automatically

### Code Naming Conventions
- Functions: camelCase — `createEquipmentOptionForModel()`, `getEquipmentOptionById()`, `setDefaultEquipment()`
- Types: PascalCase — `EquipmentOptionData`
- Zod schemas: camelCase with `Schema` suffix — `equipmentOptionSchema`
- Files: kebab-case — `equipment-option-repository.ts`, `EquipmentOptionForm.ts` (form classes PascalCase per convention)

### Anti-Patterns — NEVER do these:
- Plural table names (`equipment_options` instead of `equipment_option`)
- camelCase DB columns
- Render after a successful POST (always redirect)
- Skip CSRF validation on any POST handler
- Import `drizzle-orm` or `better-sqlite3` from pages or components
- Put DB queries directly in `.astro` page files
- Use relative imports — always use `@/` alias
- Add `default_equipment_id` FK column on the model table — the default is tracked in `model_equipment_option.is_default`
- Allow multiple `is_default = 1` rows for the same model — always clear existing defaults in a transaction before setting a new one

### Existing Code to Build On

**ModelForm** (`src/form/ModelForm.ts`):
- Pattern for constructor with ownership validation (`existing.unitId !== unitId`)
- EquipmentOptionForm adapts this: checks association via join table instead of direct FK

**ModelAdminForm** (`src/components/ModelAdminForm.astro`):
- Pattern for simple form component with Field.astro and Button.astro

**Model edit page** (`src/pages/admin/units/[unitId]/models/[modelId]/edit.astro`):
- Already has POST handler routing on `action` field (delete)
- Extend to handle `action=set-default`
- Add equipment options section below delete form

**unitKeyword join table** (`src/data/orm/schema.ts`):
- Exact pattern for the `model_equipment_option` join table definition — composite PK, cascade deletes on both FKs

**unit-repository.ts syncKeywords** (`src/data/repo/unit-repository.ts`):
- Transaction pattern for managing join table rows

**DeleteResult** (`src/data/repo/unit-repository.ts`):
- Reuse this interface for `removeEquipmentOptionFromModel` return type

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
│   │   └── schema.ts                         (modify — add equipment_option + model_equipment_option tables)
│   ├── repo/
│   │   └── equipment-option-repository.ts    (create — equipment option CRUD + default management)
│   └── validation/
│       ├── equipment-option.ts               (create — Zod equipment option schema)
│       └── equipment-option.test.ts          (create — validation tests)
├── form/
│   ├── EquipmentOptionForm.ts                (create — equipment option form class)
│   └── EquipmentOptionForm.test.ts           (create — form class tests)
├── components/
│   └── EquipmentOptionAdminForm.astro        (create — equipment option form component)
└── pages/
    └── admin/
        └── units/
            └── [unitId]/
                └── models/
                    └── [modelId]/
                        ├── edit.astro                    (modify — add equipment section + set-default handler)
                        └── equipment/
                            ├── new.astro                 (create — add equipment option page)
                            └── [equipmentId]/
                                └── edit.astro            (create — edit/remove equipment option page)
drizzle/
└── (new migration file)                      (generated — equipment_option + model_equipment_option tables)
```

### Previous Story Learnings (from Stories 1.2–1.4)

- All imports must use `@/` alias (enforced during code review in Story 1.4)
- Form classes must validate entity ownership in constructor (Story 1.4 review fix)
- Use `.trim().min(1)` for name validation in Zod schemas (Story 1.4 review fix)
- When generating Drizzle migrations, verify the SQL output matches schema intent
- Deleting a unit cascades to models, which cascade to `model_equipment_option` rows — no changes needed to existing delete logic
- Route params use `[unitId]` not `[id]` (Story 1.4 review rename)
- Include Drizzle metadata files in the File List
- Don't export unused types

### References

- [Source: architecture.md#Data-Architecture] — Unit > Model > Equipment Option hierarchy, Drizzle schema, migration approach
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — Same-page form handling, naming conventions, anti-patterns
- [Source: architecture.md#Project-Structure-&-Boundaries] — Data access boundary, form boundary, directory structure, test organization
- [Source: architecture.md#Frontend-Architecture] — URL structure for admin pages
- [Source: epics.md#Story-1.5] — Acceptance criteria for equipment option management
- [Source: prd.md#Unit-Administration] — FR20 (define equipment options), FR21 (edit equipment options), FR22 (remove equipment options)
- [Source: ux-design-specification.md#Core-Interaction-Design] — Admin forms use native browser controls, flat admin flow

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
