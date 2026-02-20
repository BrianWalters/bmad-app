# Story 2.2: Unit Detail Page

Status: review

## Story

As a player,
I want to view a unit's complete details on a single page,
So that I can see all attributes, models, and equipment options at a glance for game planning.

## Acceptance Criteria

1. **Given** a player navigates to `/units/[slug]` for an existing unit
   **When** the detail page loads
   **Then** all unit attributes are displayed using a definition list: name, movement, toughness, save, wounds, leadership, objective control, invulnerability save, and description (FR9)
   **And** the unit's keywords are displayed

2. **Given** a unit has one or more models
   **When** the detail page loads
   **Then** every model belonging to the unit is displayed in its own visually contained section (bordered) showing the model's name and details (FR10)

3. **Given** a model has a default equipment option set
   **When** the detail page loads
   **Then** the default equipment is clearly displayed for that model (FR11)

4. **Given** a model has multiple equipment options
   **When** the detail page loads
   **Then** all available equipment options for the model are displayed (FR12)

5. **Given** a model has both default and alternative equipment options
   **When** the detail page loads
   **Then** the default equipment is visually distinguished from alternatives so the player can instantly see what's standard vs. swappable (FR13)

6. **Given** the detail page loads
   **When** the page renders
   **Then** a breadcrumb is displayed in a `<nav aria-label="Breadcrumb">` element showing the path (e.g., Home > Unit Name)

7. **Given** the unit has rules text or other long prose content (description)
   **When** the detail page loads
   **Then** the content is rendered inside native `<details>/<summary>` elements, collapsed by default

8. **Given** the page uses semantic HTML
   **When** inspected
   **Then** the heading hierarchy is logical (h1 for unit name, h2 for sections, h3 for models), data is in `<dl>` or `<table>` elements as appropriate, and all text meets WCAG AA contrast requirements

9. **Given** a player navigates to `/units/[slug]` for a slug that doesn't exist
   **When** the page loads
   **Then** a 404 response is returned

10. **Given** an equipment option has damageMin 1 and damageMax 3
    **When** the detail page renders the equipment table
    **Then** the Damage column shows `D3`

11. **Given** an equipment option has damageMin 1 and damageMax 6
    **When** the detail page renders the equipment table
    **Then** the Damage column shows `D6`

12. **Given** an equipment option has damageMin 2 and damageMax 2
    **When** the detail page renders the equipment table
    **Then** the Damage column shows `2`

13. **Given** a unit has multiple models with the same name and identical equipment options (same options, same default flags)
    **When** the detail page loads
    **Then** those models are collapsed into a single displayed section with a quantity prefix (e.g., "4 Battle Sister" instead of four separate "Battle Sister" sections)

14. **Given** a model has equipment options with `range > 0` (ranged) and equipment options with `range === 0` (melee)
    **When** the detail page renders the equipment tables
    **Then** two separate tables are displayed: a "Ranged Weapons" table and a "Melee Weapons" table

15. **Given** an equipment option appears in the Ranged Weapons table
    **When** the Skill column header is rendered
    **Then** it is labeled `BS` (Ballistic Skill)

16. **Given** an equipment option appears in the Melee Weapons table
    **When** the Skill column header is rendered
    **Then** it is labeled `WS` (Weapon Skill)

## Tasks / Subtasks

- [x] Task 1: Create unit detail page `src/pages/units/[slug].astro` (AC: #1, #6, #7, #8, #9)
  - [x] 1.1 Create `src/pages/units/[slug].astro` using `Base.astro` layout with `title` set to `"{unitName} — Army Builder"` and `description` from unit description
  - [x] 1.2 In frontmatter: get `slug` from `Astro.params.slug`, call `findUnitBySlug(slug)` — if null, return `Astro.redirect("/404")` or `new Response(null, { status: 404 })`
  - [x] 1.3 Fetch related data: `getKeywordsForUnit(unit.id)`, `getModelsForUnit(unit.id)`, and for each model call `getEquipmentOptionsForModel(model.id)`
  - [x] 1.4 Render `<Breadcrumb items={[{ label: "Home", href: "/" }, { label: unit.name }]} />`
  - [x] 1.5 Render `<h1>{unit.name}</h1>`
  - [x] 1.6 Display keywords if present (comma-separated, below the heading)
  - [x] 1.7 Display unit attributes in a `<dl class="unit-detail__attributes">`: Movement, Toughness, Save, Wounds, Leadership, Objective Control, Invulnerability Save (omit if null)
  - [x] 1.8 If unit has a description, render inside `<details><summary>Description</summary><p>{description}</p></details>`
  - [x] 1.9 For each model, render a bordered section (see Task 2)

- [x] Task 2: Create model section with equipment table (AC: #2, #3, #4, #5, #13)
  - [x] 2.1 In frontmatter, after fetching models and their equipment options, group models by name + equipment signature (same option IDs with same isDefault flags). Each group becomes one displayed section with a `count` and the shared equipment list. Heading: `<h3>{count > 1 ? `${count} ${model.name}` : model.name}</h3>`
  - [x] 2.1b Each group renders inside a `<section class="unit-detail__model">`
  - [x] 2.2 Split model's equipment options into two lists: ranged (`range > 0`) and melee (`range === 0`). Render each non-empty list as a separate table wrapped in `<div class="table-scroll">`
  - [x] 2.3 Ranged table: heading "Ranged Weapons", columns: Name, Range, A, BS, S, AP, D. Melee table: heading "Melee Weapons", columns: Name, A, WS, S, AP, D (no Range column). Both use `<thead>` with `<th>` headers
  - [x] 2.4 Default equipment rows get a `unit-detail__equipment--default` modifier class and a visual indicator (e.g., bold text or "(Default)" label)
  - [x] 2.5 Alternative equipment rows use base styling — the contrast with default rows provides the visual distinction (FR13)
  - [x] 2.6 AP values displayed as negative numbers (e.g., `-2` not `2`) per Epic 1 retro convention
  - [x] 2.7 Damage displayed using dice notation: if `damageMin === damageMax`, show the single number (e.g., `2`); if `damageMin` is 1 and `damageMax` > 1, show as `D{damageMax}` (e.g., `D3`, `D6`) (AC: #10, #11, #12)
  - [x] 2.8 If model has zero equipment options, display a muted "No equipment options" message

- [x] Task 3: Create `UnitDetail.css` co-located styles (AC: #2, #5, #8)
  - [x] 3.1 Create `src/pages/units/UnitDetail.css` with BEM block `.unit-detail`
  - [x] 3.2 `.unit-detail__attributes` — definition list styling: `<dt>` bold, `<dd>` inline or below, compact spacing
  - [x] 3.3 `.unit-detail__keywords` — keyword display styling (muted color)
  - [x] 3.4 `.unit-detail__model` — bordered section for each model: `border: 1px solid var(--color-muted)`, padding in rem, margin-bottom between models
  - [x] 3.5 `.unit-detail__equipment--default` — visual distinction for default equipment (bold or background tint)
  - [x] 3.6 `.table-scroll` — `overflow-x: auto` wrapper for responsive table handling (deferred from Story 2.1)
  - [x] 3.7 All spacing in rem. No `@media` queries. No px for padding/margins

- [x] Task 4: Fix Breadcrumb.astro — add `.breadcrumb` block class (AC: #6)
  - [x] 4.1 Add `class="breadcrumb"` to the `<nav>` element in `src/components/Breadcrumb.astro` (deferred from Story 2.1 code review)
  - [x] 4.2 Optionally add a `.breadcrumb` rule to `Breadcrumb.css` if any block-level styles are needed

- [x] Task 5: Write E2E tests for detail page (AC: all)
  - [x] 5.1 Create `e2e/unit-detail.spec.ts`
  - [x] 5.2 Test: navigating to a valid unit slug renders the detail page with unit name as h1, breadcrumb, attributes in dl, and model sections
  - [x] 5.3 Test: equipment table shows default vs. alternative distinction
  - [x] 5.4 Test: navigating to a non-existent slug returns 404
  - [x] 5.5 Test: description renders inside a `<details>` element

- [x] Task 6: Verify all existing tests still pass (AC: all)
  - [x] 6.1 Run `npm run test` — all 94 existing tests must pass
  - [x] 6.2 Run `npm run build` — must succeed with no errors
  - [x] 6.3 Run `npx playwright test` — all existing E2E tests (3) must pass alongside new ones

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Epic 1, reinforced in Story 2.1):**

- **Import convention:** Always use `@/` path alias — never relative paths. `@/` maps to `src/` (configured in `tsconfig.json`). Example: `import { findUnitBySlug } from "@/data/repo/unit-repository"`.
- **CSS co-location pattern:** Each BEM block gets its own CSS file, co-located with its Astro component or page. Astro components import their co-located CSS. `public/styles.css` contains ONLY the global reset and `:root` CSS custom properties.
- **Naming conventions:** Astro components are PascalCase (`Breadcrumb.astro`), TypeScript modules are kebab-case, BEM classes use `.block__element--modifier`.
- **Data access boundary:** Public pages use repository modules from `src/data/repo/` for DB reads — never import `drizzle-orm` directly. Available repos: `unit-repository.ts`, `model-repository.ts`, `equipment-option-repository.ts`.
- **No JavaScript components:** All server-rendered HTML + CSS. Zero client JS.
- **Semantic HTML:** Logical heading hierarchy (h1 > h2 > h3), `<nav>` for navigation, `<main>` for content, `<label>` on form inputs, `<dl>` for key-value pairs, `<table>` with `<thead>` for tabular data.

### Existing Repository Functions to Use

**Do NOT create new query functions — these already exist and cover all data needs:**

| Function | File | Returns |
|---|---|---|
| `findUnitBySlug(slug)` | `unit-repository.ts` | Unit object or `null` |
| `getKeywordsForUnit(unitId)` | `unit-repository.ts` | `string[]` of keyword names |
| `getModelsForUnit(unitId)` | `model-repository.ts` | Array of models ordered by name |
| `getEquipmentOptionsForModel(modelId)` | `equipment-option-repository.ts` | Array with all fields + `isDefault` flag, ordered defaults-first then by name |

### Data Schema Reference

**Unit table columns:** id, name, slug, movement, toughness, save, wounds, leadership, objectiveControl, invulnerabilitySave (nullable), description (nullable)

**Model table columns:** id, unitId, name

**Equipment option columns (via join):** id, name, range, attacks, skill, strength, armorPiercing, damageMin, damageMax, isDefault (0 or 1)

**Keywords:** Retrieved as `string[]` via `getKeywordsForUnit()`

### Model Grouping Logic

Models with the same name AND identical equipment options (same set of equipment option IDs with the same `isDefault` flags) must be collapsed into a single displayed section with a quantity prefix. To compute the equipment signature for grouping, sort the equipment option entries by ID, then serialize as a string of `{id}:{isDefault}` pairs. Models sharing the same name and signature are one group.

Example: A unit has 4 "Battle Sister" models each with the same Boltgun (default). Display: `"4 Battle Sister"` with one equipment table. If one Battle Sister has different equipment, she gets her own section.

### Equipment Display Conventions

- **AP (Armor Piercing):** Display as negative number. If `armorPiercing` is `2`, render as `-2`. If `0`, display `0`.
- **Damage:** If `damageMin === damageMax`, display single number (e.g., `2`). If `damageMin` is 1 and `damageMax` > 1, display as dice notation `D{damageMax}` (e.g., `D3`, `D6`).
- **Range:** Display with `"` suffix (e.g., `24"`). Range column only appears in the Ranged Weapons table (melee options have `range === 0` and go in a separate table with no Range column).
- **Skill:** Display with `+` suffix (e.g., `3+`). Column header is `BS` in the Ranged Weapons table and `WS` in the Melee Weapons table.
- **Table split:** Equipment options are separated into two tables per model section. Ranged (`range > 0`) and Melee (`range === 0`). Either table is omitted if it would be empty.
- **Save values:** Display with `+` suffix (e.g., `3+`).
- **Default equipment:** `isDefault === 1`. Mark visually — bold row or "(Default)" label. Defaults are already sorted first by the repository query.

### Component Specifications

**Page: `src/pages/units/[slug].astro`**
- Uses `Base.astro` layout
- Imports `Breadcrumb` component and `UnitDetail.css`
- All data fetching in frontmatter via repository functions
- Returns 404 for non-existent slugs

**CSS: `src/pages/units/UnitDetail.css`**
- BEM block `.unit-detail` with elements:
  - `__attributes` — definition list for unit stats
  - `__keywords` — keyword display
  - `__model` — bordered model section
  - `__equipment--default` — default equipment visual distinction
- `.table-scroll` — `overflow-x: auto` wrapper for equipment tables
- All rem spacing, no `@media`, no px

### Responsive Strategy — Intrinsic Design (No Media Queries)

- **Tables:** Wrap all `<table>` elements in `<div class="table-scroll">` with `overflow-x: auto` for horizontal scroll on narrow viewports
- **Definition lists:** Natural flow, no special handling needed
- **Model sections:** Block-level, full width, stack naturally
- **Content width:** Already capped at ~75rem via `.page` wrapper in Base layout
- **No `@media` rules at all**

### Breadcrumb Fix (Deferred from Story 2.1)

The `Breadcrumb.astro` component's `<nav>` element is missing the `.breadcrumb` block class. Add `class="breadcrumb"` to the `<nav>` element. This was identified in Story 2.1 code review (finding #4) and deferred to this story.

### Anti-Patterns — NEVER do these

- Use `@media` queries for responsive layout — use intrinsic design only
- Add client-side JavaScript for any component behavior
- Use relative imports (`../../layouts/Base.astro`) — always use `@/` alias
- Put BEM block styles in `public/styles.css` — co-locate with pages/components
- Import `drizzle-orm` directly in page files — use repository functions
- Create new repository functions when existing ones cover the need
- Use px for spacing, padding, or margins — use rem only
- Use scoped styles (`<style>` tags in `.astro` files) — use co-located `.css` files with BEM naming
- Skip the breadcrumb on the detail page
- Use utility classes or CSS framework syntax

### Previous Story Learnings (from Story 2.1 + Epic 1 retro)

- **`@/` alias enforcement:** Dev agents used relative imports in 3/5 Epic 1 stories. Always use `@/` — zero exceptions.
- **CSS co-location is the standard:** Each BEM block gets its own CSS file next to its component. `public/styles.css` is reset + tokens only.
- **E2E tests are expected in Epic 2:** Story 2.1 established 3 E2E tests. This story must add more for the detail page.
- **File List must be complete:** Stories 1.3 and 1.4 had incomplete File Lists caught in review. Document every file created or modified.
- **Site name is "Army Builder"** — confirmed during Story 2.1 code review. Use in page titles: `"{unitName} — Army Builder"`.
- **Google Fonts loaded via `<link>` in Base.astro** — do not add a duplicate font link or CSS `@import`.

### Existing Codebase State

**Files that exist and will be USED (do not recreate):**
- `src/layouts/Base.astro` — public base layout with `<header>`, `<main>`, skip-link, Google Fonts `<link>`
- `src/components/Breadcrumb.astro` + `Breadcrumb.css` — breadcrumb navigation (needs `.breadcrumb` class fix)
- `src/data/repo/unit-repository.ts` — `findUnitBySlug()`, `getKeywordsForUnit()`
- `src/data/repo/model-repository.ts` — `getModelsForUnit()`
- `src/data/repo/equipment-option-repository.ts` — `getEquipmentOptionsForModel()`
- `public/styles.css` — global reset, `:root` tokens, base table styles
- `e2e/public-layout.spec.ts` — existing 3 E2E tests

**Files to CREATE:**
- `src/pages/units/[slug].astro` — unit detail page
- `src/pages/units/UnitDetail.css` — detail page BEM styles

**Files to MODIFY:**
- `src/components/Breadcrumb.astro` — add `.breadcrumb` class to `<nav>`

### E2E Testing Notes

E2E tests require a running server with seeded data. The current Playwright config (`playwright.config.ts`) uses `npm run preview` against `localhost:4321`. For tests that need unit data in the DB, the test setup must seed data through admin forms or the DB must already contain test data.

Check if `NODE_ENV=test` auto-seeding is configured per the architecture doc's E2E strategy. If not yet implemented, tests can verify the 404 case directly and the detail page structure against any existing seeded data.

### Library & Framework Requirements

All packages already installed. No new dependencies needed.

| Package | Version | Purpose |
|---|---|---|
| astro | ^5.17.3 | MPA framework (installed) |
| @astrojs/node | ^9.5.4 | SSR adapter (installed) |
| drizzle-orm | 0.45.1 | DB queries via repository layer |
| playwright | 1.58.2 | E2E tests |

### Project Structure Notes

```
src/
├── pages/
│   └── units/
│       ├── [slug].astro                     (create — unit detail page)
│       └── UnitDetail.css                   (create — detail page BEM styles)
├── components/
│   ├── Breadcrumb.astro                     (modify — add .breadcrumb class to nav)
│   └── Breadcrumb.css                       (existing — may add .breadcrumb rule)
e2e/
└── unit-detail.spec.ts                      (create — detail page E2E tests)
```

### References

- [Source: epics.md#Story-2.2] — acceptance criteria, FR9-FR13
- [Source: architecture.md#Frontend-Architecture] — URL `/units/[slug]`, component architecture
- [Source: architecture.md#Data-Architecture] — Unit > Model > Equipment Option hierarchy
- [Source: architecture.md#Project-Structure-&-Boundaries] — `src/pages/units/`, `src/data/repo/`
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — `@/` imports, naming, anti-patterns
- [Source: ux-design-specification.md#Core-Interaction-Design] — detail page is where value is delivered
- [Source: ux-design-specification.md#UX-Pattern-Analysis] — tables for stats, dl for attributes, details/summary for prose
- [Source: ux-design-specification.md#Component-Strategy] — `.unit-detail` not listed but follows BEM convention
- [Source: ux-design-specification.md#Responsive-Design-&-Accessibility] — intrinsic design, overflow-x for tables, WCAG AA
- [Source: ux-design-specification.md#Data-Display-Patterns] — hierarchy shown through nesting and borders
- [Source: epic-1-retro-2026-02-19.md#Next-Epic-Preview] — AP as negative, E2E tests expected
- [Source: 2-1-public-base-layout-global-styles.md] — Base layout, Breadcrumb component, CSS co-location established

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- Created unit detail page at `src/pages/units/[slug].astro` with full SSR rendering of unit attributes, keywords, models, and equipment tables
- Implemented model grouping logic: models with same name and identical equipment signature (sorted ID:isDefault pairs) are collapsed with quantity prefix (e.g., "2 Test Warrior")
- Equipment split into separate Ranged Weapons (BS header) and Melee Weapons (WS header) tables per model section
- Damage displayed using dice notation: single number when min===max, D{max} when min is 1 and max > 1
- AP displayed as negative numbers per Epic 1 retro convention
- Default equipment visually distinguished with bold rows and "(Default)" label; alternative rows use base styling
- Save/leadership/invulnerability save displayed with `+` suffix; movement with `"` suffix; range with `"` suffix
- Invulnerability save omitted from attributes when null; description details element omitted when no description
- Created BEM-based co-located CSS (`UnitDetail.css`) with all rem spacing, no @media queries, no px
- Fixed Breadcrumb.astro — added missing `.breadcrumb` class to `<nav>` element (deferred from Story 2.1 code review)
- 404 returned via `new Response(null, { status: 404 })` for non-existent slugs
- Wrote 10 E2E tests covering all acceptance criteria; tests self-seed data via better-sqlite3 and clean up after
- All 94 existing unit tests pass (no regressions); all 13 E2E tests pass (3 existing + 10 new); build succeeds

### File List

- `src/pages/units/[slug].astro` — **created** — unit detail page with SSR rendering
- `src/pages/units/UnitDetail.css` — **created** — BEM co-located styles for detail page
- `src/components/Breadcrumb.astro` — **modified** — added `class="breadcrumb"` to `<nav>` element
- `e2e/unit-detail.spec.ts` — **created** — 10 E2E tests for detail page

## Change Log

- **2026-02-20:** Implemented Story 2.2 — Unit Detail Page. Created SSR detail page at `/units/[slug]` with unit attributes, model sections with grouped models, equipment tables split by ranged/melee, dice notation damage display, AP as negative numbers, breadcrumb navigation, and description in collapsible details element. Fixed Breadcrumb.astro missing `.breadcrumb` class (deferred from Story 2.1 review). Added 10 E2E tests. All 94 unit tests and 13 E2E tests pass.
