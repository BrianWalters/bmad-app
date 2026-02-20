# Story 3.1: Unit Index Page

Status: ready-for-dev

## Story

As a player,
I want to browse an alphabetical list of all units with summary information,
So that I can quickly scan available units and navigate to any unit's detail page.

## Acceptance Criteria

1. **Given** a player navigates to `/`
   **When** the index page loads
   **Then** all units are displayed in alphabetical order by name, each as a card in a responsive grid using CSS Grid `repeat(auto-fill, minmax(18rem, 1fr))` (FR1)

2. **Given** each unit card on the index
   **When** the page renders
   **Then** the card displays the unit's name and summary information (key attributes and description) using the `.unit-card` BEM block

3. **Given** a player views a unit card on the index
   **When** they click the card
   **Then** they are navigated to that unit's detail page at `/units/[slug]` (FR2)

4. **Given** a player is on any page (detail, search, admin)
   **When** they click the site name in the header
   **Then** they are navigated back to the index at `/` (FR3)

5. **Given** the detail page breadcrumb
   **When** the player clicks "Home" in the breadcrumb
   **Then** they are navigated back to the index at `/`

6. **Given** there are no units in the database
   **When** the index page loads
   **Then** an empty state message is displayed (e.g., "No units yet.")

7. **Given** the index page renders
   **When** inspected
   **Then** the heading hierarchy is logical (h1 for page title), cards are keyboard-navigable, and all text meets WCAG AA contrast requirements

## Tasks / Subtasks

- [ ] Task 1: Modify `src/pages/index.astro` — fetch units and render grid or empty state (AC: #1, #6, #7)
  - [ ] 1.1 Import `getAllUnits` from `@/data/repo/unit-repository` and `UnitCard` from `@/components/UnitCard.astro`
  - [ ] 1.2 Import co-located CSS: `import "./UnitIndex.css"`
  - [ ] 1.3 In frontmatter, call `getAllUnits()` to get all units (already ordered alphabetically by name)
  - [ ] 1.4 Keep existing `<h1>Army Builder</h1>` heading
  - [ ] 1.5 If units array is non-empty, render a `<div class="unit-grid">` containing a `<UnitCard>` for each unit
  - [ ] 1.6 If units array is empty, render `<p class="empty-state">No units yet.</p>`

- [ ] Task 2: Create `src/components/UnitCard.astro` (AC: #2, #3, #7)
  - [ ] 2.1 Define Props interface accepting the unit object fields: `name`, `slug`, `movement`, `toughness`, `save`, `wounds`, `leadership`, `objectiveControl`, `invulnerabilitySave` (nullable), `description` (nullable)
  - [ ] 2.2 Render card as `<article class="unit-card">` with a `position: relative` container for the stretched link pattern
  - [ ] 2.3 Render unit name as `<h2 class="unit-card__name">` containing an `<a>` link to `/units/{slug}` — this link uses a `::after` pseudo-element stretched to cover the entire card, making the whole card clickable while keeping the link text semantic for screen readers
  - [ ] 2.4 Render key stats in a compact row `<div class="unit-card__stats">`: M, T, SV, W, LD, OC — displayed as abbreviated label-value pairs (e.g., `M:6" T:4 SV:3+ W:2 LD:6+ OC:2`)
  - [ ] 2.5 If description exists, render as `<p class="unit-card__description">` with CSS line-clamping to 2 lines
  - [ ] 2.6 Import co-located CSS: `import "./UnitCard.css"`

- [ ] Task 3: Create `src/components/UnitCard.css` (AC: #2, #7)
  - [ ] 3.1 `.unit-card` — `position: relative`, `border: 1px solid var(--color-muted)`, padding in rem, `overflow: hidden`
  - [ ] 3.2 `.unit-card__name` — heading style, margin-bottom
  - [ ] 3.3 `.unit-card__name a` — `color: inherit`, `text-decoration: none`
  - [ ] 3.4 `.unit-card__name a::after` — `content: ""`, `position: absolute`, `inset: 0` — stretched link covering entire card
  - [ ] 3.5 `.unit-card:hover` — `border-color: var(--color-accent)` for hover feedback
  - [ ] 3.6 `.unit-card__name a:focus` — `outline: 2px solid var(--color-accent)`, `outline-offset: 2px` on the link, with `.unit-card:focus-within` for card-level visual feedback
  - [ ] 3.7 `.unit-card__stats` — `font-size: 0.875rem`, `color: var(--color-muted)`, compact display
  - [ ] 3.8 `.unit-card__description` — `color: var(--color-muted)`, `font-size: 0.875rem`, line-clamp to 2 lines via `-webkit-line-clamp: 2`, `display: -webkit-box`, `-webkit-box-orient: vertical`, `overflow: hidden`
  - [ ] 3.9 All spacing in rem. No `@media` queries. No px for padding/margins

- [ ] Task 4: Create `src/pages/UnitIndex.css` — page-level grid and empty state styles (AC: #1, #6)
  - [ ] 4.1 `.unit-grid` — `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))`, `gap` in rem
  - [ ] 4.2 `.empty-state` — `color: var(--color-muted)`, padding in rem
  - [ ] 4.3 All spacing in rem. No `@media` queries

- [ ] Task 5: Write E2E tests for the index page (AC: all)
  - [ ] 5.1 Create `e2e/index.spec.ts`
  - [ ] 5.2 Test: index page shows all seeded units as cards with unit names visible
  - [ ] 5.3 Test: units are displayed in alphabetical order
  - [ ] 5.4 Test: clicking a unit card navigates to the correct detail page at `/units/[slug]`
  - [ ] 5.5 Test: empty database shows "No units yet." empty state message (use `?type=empty` fixture endpoint)
  - [ ] 5.6 Test: page has logical heading hierarchy (h1 for page title, h2 for card names)
  - [ ] 5.7 Test: cards are keyboard-navigable (Tab to card link, Enter to navigate)

- [ ] Task 6: Verify all existing tests still pass (AC: all)
  - [ ] 6.1 Run `npm run test` — all existing unit tests must pass
  - [ ] 6.2 Run `npm run build` — must succeed with no errors
  - [ ] 6.3 Run `npx playwright test` — all existing E2E tests must pass alongside new ones

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Epic 1, reinforced in Stories 2.1 and 2.2):**

- **Import convention:** Always use `@/` path alias — never relative paths. `@/` maps to `src/` (configured in `tsconfig.json`). Example: `import { getAllUnits } from "@/data/repo/unit-repository"`.
- **CSS co-location pattern:** Each BEM block gets its own CSS file, co-located with its Astro component or page. Astro components import their co-located CSS. `public/styles.css` contains ONLY the global reset and `:root` CSS custom properties — no BEM block styles.
- **Naming conventions:** Astro components are PascalCase (`UnitCard.astro`), TypeScript modules are kebab-case, BEM classes use `.block__element--modifier`.
- **Data access boundary:** Public pages use repository modules from `src/data/repo/` for DB reads — never import `drizzle-orm` directly.
- **No JavaScript components:** All server-rendered HTML + CSS. Zero client JS.
- **Semantic HTML:** Logical heading hierarchy (h1 > h2), `<article>` for cards, accessible link patterns.
- **No scoped styles:** Do NOT use `<style>` tags in `.astro` files — always co-located `.css` files with BEM naming.

### Existing Repository Functions to Use

**Do NOT create new query functions — this already exists and covers all data needs:**

| Function | File | Returns |
|---|---|---|
| `getAllUnits()` | `unit-repository.ts` | Array of all units ordered alphabetically by `name` (ASC) |

### Data Schema Reference

**Unit table columns:** id, name, slug, movement, toughness, save, wounds, leadership, objectiveControl, invulnerabilitySave (nullable), description (nullable)

The `getAllUnits()` function returns the full unit row. Use `name`, `slug`, and stat fields for the card. Description is optional.

### UX Requirements — Card Design

Per the UX spec and epics:
- **Card grid:** CSS Grid with `repeat(auto-fill, minmax(18rem, 1fr))` — cards fill available space naturally, single column on narrow screens, multi-column on wide, no breakpoints
- **Card content:** Unit name + key attributes + brief description. Cards show just enough to identify a unit — full details are on the detail page
- **Card styling:** 1px gray border, no shadows, no rounded corners. Minimal decoration — content is the interface
- **Links:** Accent red (`#960B09`). Entire card is clickable via stretched link pattern
- **Empty state:** Plain text message: "No units yet."
- **Density:** Compact — more data visible, less whitespace

### Stat Display Conventions

Follow the same conventions established in Story 2.2 for the detail page:
- **Movement:** Display with `"` suffix (e.g., `6"`)
- **Save, Leadership:** Display with `+` suffix (e.g., `3+`, `6+`)
- **Invulnerability Save:** Only show if non-null, display with `+` suffix
- **Other stats (Toughness, Wounds, OC):** Display as plain numbers

On the card, show stats in a compact abbreviated format: `M:6" T:4 SV:3+ W:2 LD:6+ OC:2`

### Accessible Card Pattern

Use the "stretched link" pattern for clickable cards:
1. `<article class="unit-card">` has `position: relative`
2. `<h2 class="unit-card__name">` contains `<a href="/units/{slug}">`
3. The `<a>` has a `::after` pseudo-element with `position: absolute; inset: 0` stretching over the entire card
4. Screen readers announce just the unit name as link text — not all card content
5. Keyboard users Tab to the link and press Enter to navigate
6. The card gets a visual hover state via `.unit-card:hover`
7. Focus is visible via `.unit-card:focus-within` or link `:focus` styles

This pattern is semantic, accessible, and requires zero JavaScript.

### FR3 — Navigation Back to Index

FR3 (navigate back to index) and AC #4/#5 are **already implemented**:
- `SiteHeader.astro` contains `<a href="/" class="site-header__title">Army Builder</a>` — clicking site name navigates to `/`
- `Breadcrumb.astro` renders "Home" as `<a href="/">Home</a>` on detail pages

No additional work needed for FR3. E2E tests can verify this behavior exists.

### Component Specifications

**Page: `src/pages/index.astro`**
- Uses `Base.astro` layout with `title="Army Builder"` and `description="Browse and search tabletop wargame units."`
- Imports `UnitCard` component and `UnitIndex.css`
- All data fetching in frontmatter via `getAllUnits()`
- Renders card grid or empty state

**Component: `src/components/UnitCard.astro`**
- Props: unit data object (name, slug, stats, description)
- Uses `.unit-card` BEM block
- Imports co-located `UnitCard.css`
- Renders `<article>` with heading link, stats row, optional description

**CSS: `src/components/UnitCard.css`**
- BEM block `.unit-card` with elements: `__name`, `__stats`, `__description`
- Stretched link pattern for full-card clickability
- Hover and focus states using accent colors
- All rem spacing, no `@media`, no px

**CSS: `src/pages/UnitIndex.css`**
- `.unit-grid` — responsive card grid layout
- `.empty-state` — empty state message styling

### Responsive Strategy — Intrinsic Design (No Media Queries)

- **Card grid:** `repeat(auto-fill, minmax(18rem, 1fr))` adapts naturally to viewport width — no breakpoints needed
- **Cards:** Block-level content inside cards flows naturally
- **Content width:** Already capped at ~75rem via `.page` wrapper in Base layout
- **No `@media` rules at all**

### Anti-Patterns — NEVER do these

- Use `@media` queries for responsive layout — use intrinsic design only
- Add client-side JavaScript for any component behavior
- Use relative imports (`../../layouts/Base.astro`) — always use `@/` alias
- Put BEM block styles in `public/styles.css` — co-locate with pages/components
- Import `drizzle-orm` directly in page files — use repository functions
- Create new repository functions when existing ones cover the need
- Use px for spacing, padding, or margins — use rem only
- Use scoped styles (`<style>` tags in `.astro` files) — use co-located `.css` files with BEM naming
- Use utility classes or CSS framework syntax
- Add rounded corners, shadows, or decorative elements to cards
- Make the entire `<a>` wrap the card (breaks screen reader experience) — use stretched link pattern instead

### Previous Story Learnings (from Story 2.2 + Epic 1 retro)

- **`@/` alias enforcement:** Dev agents used relative imports in 3/5 Epic 1 stories. Always use `@/` — zero exceptions.
- **CSS co-location is the standard:** Each BEM block gets its own CSS file next to its component. `public/styles.css` is reset + tokens only.
- **E2E tests expected:** Story 2.2 established 11 E2E tests using fixture API. Follow same pattern: `beforeAll` seeds data via `request.post("/api/fixtures")`.
- **File List must be complete:** Stories 1.3 and 1.4 had incomplete File Lists caught in review. Document every file created or modified.
- **Site name is "Army Builder"** — confirmed during Story 2.1 code review. Use as page title.
- **Google Fonts loaded via `<link>` in Base.astro** — do not add a duplicate font link or CSS `@import`.
- **N+1 queries are acceptable for SQLite at current scale** — per Story 2.2's known limitations.
- **Stat display conventions:** Movement with `"` suffix, Save/Leadership with `+` suffix, AP as negative. Established in Story 2.2.

### Git Intelligence

Recent commits (last 3):
- `08ce7a3` — 2.2 code review and revisions
- `9e81e95` — Refactor E2E tests to use fixture factories for data seeding
- `3b13149` — 2.2 dev implementation

Key patterns from recent work:
- E2E tests use `request.post("/api/fixtures")` in `beforeAll` for standard seed, `?type=empty` to clear
- CSS co-located with pages/components
- BEM naming throughout
- Fixture factories in `src/test/fixtures.ts` for unit tests

### Existing Codebase State

**Files that exist and will be USED (do not recreate):**
- `src/layouts/Base.astro` — public base layout with `<header>`, `<main>`, skip-link, Google Fonts `<link>`
- `src/components/SiteHeader.astro` — site header with home link and search bar (FR3 already done)
- `src/data/repo/unit-repository.ts` — `getAllUnits()` function
- `public/styles.css` — global reset, `:root` tokens, base table styles
- `src/test/e2e-seed.ts` — E2E seed data (2 units: "E2E Detail Test Unit", "E2E No Description Unit")
- `src/pages/api/fixtures.ts` — test-only API endpoint for seeding/clearing
- `e2e/public-layout.spec.ts` — 3 existing E2E tests
- `e2e/unit-detail.spec.ts` — 11 existing E2E tests

**Files to CREATE:**
- `src/components/UnitCard.astro` — unit card component
- `src/components/UnitCard.css` — unit card BEM styles
- `src/pages/UnitIndex.css` — index page grid and empty state styles
- `e2e/index.spec.ts` — index page E2E tests

**Files to MODIFY:**
- `src/pages/index.astro` — add unit fetching, card grid rendering, and empty state

### E2E Testing Notes

E2E tests use the established fixture seeding pattern:
- `request.post("/api/fixtures")` seeds the standard dataset (2 units with models and equipment)
- `request.post("/api/fixtures?type=empty")` clears all tables for empty state testing
- Playwright config runs against `localhost:4321` with `NODE_ENV=test` (in-memory SQLite)
- Tests should be independent — each `describe` block seeds its own data in `beforeAll`

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
│   ├── index.astro                              (modify — add unit grid rendering)
│   └── UnitIndex.css                            (create — grid and empty state styles)
├── components/
│   ├── UnitCard.astro                           (create — unit card component)
│   └── UnitCard.css                             (create — unit card BEM styles)
e2e/
└── index.spec.ts                                (create — index page E2E tests)
```

### References

- [Source: epics.md#Story-3.1] — acceptance criteria, FR1, FR2, FR3
- [Source: architecture.md#Frontend-Architecture] — URL `/`, component `UnitCard.astro`
- [Source: architecture.md#Requirements-to-Structure-Mapping] — FR1 maps to `index.astro` + `UnitCard.astro`
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — `@/` imports, naming, anti-patterns
- [Source: architecture.md#Project-Structure-&-Boundaries] — `src/components/UnitCard.astro`, `src/components/UnitCard.css`
- [Source: ux-design-specification.md#Core-Interaction-Design] — cards-first browsing, summary vs. detail separation
- [Source: ux-design-specification.md#Component-Strategy] — `.unit-card`, `.unit-grid`, `.empty-state` BEM blocks
- [Source: ux-design-specification.md#Responsive-Design-&-Accessibility] — intrinsic design, `repeat(auto-fill, minmax(18rem, 1fr))`, WCAG AA
- [Source: ux-design-specification.md#Visual-Design-Foundation] — color tokens, Merriweather font, spacing in rem
- [Source: ux-design-specification.md#UX-Consistency-Patterns] — plain card grid, 1px gray borders, no shadows
- [Source: epic-1-retro-2026-02-19.md] — `@/` alias enforcement, CSS co-location, E2E test expectations
- [Source: 2-2-unit-detail-page.md] — stat display conventions, E2E test patterns, fixture seeding

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
