# Story 4.1: Search Bar & Search Results

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,
I want to search for units by name,
So that I can find a specific unit quickly without scrolling through the full index.

## Acceptance Criteria

1. **Given** any page on the site
   **When** the page loads
   **Then** the site header contains a search form (`.search-form`) with a text input for searching by unit name (FR4)

2. **Given** a player types a query into the search bar and submits
   **When** the search results page loads at `/search?q=[query]`
   **Then** matching units are displayed as a slim list showing unit name (as a link) and description (FR5)

3. **Given** a player views a search result
   **When** they click the unit name link
   **Then** they are navigated to that unit's detail page at `/units/[slug]` (FR6)

4. **Given** a player searches for a query with no matches
   **When** the search results page loads
   **Then** a clear message is displayed: "No units found matching [query]." using the `.empty-state` BEM block (FR7)

5. **Given** a player is on the search results page
   **When** they click the site name in the header or "Home" in the breadcrumb
   **Then** they are navigated back to the index at `/` (FR8)

6. **Given** a player submits an empty search query
   **When** the form is submitted
   **Then** the player is redirected to the index at `/`

7. **Given** the search results page renders
   **When** inspected
   **Then** search results return within 1 second, the page uses semantic HTML, and all text meets WCAG AA contrast requirements

## Tasks / Subtasks

- [x] Task 1: Add `searchUnitsByName` repository function (AC: #2, #7)
  - [x] 1.1 In `src/data/repo/unit-repository.ts`, add `searchUnitsByName(query: string)` that performs a case-insensitive `LIKE` search on `unit.name`, ordered alphabetically by name
  - [x] 1.2 Return the same column set as `getAllUnits()` (full unit row)
  - [x] 1.3 Add co-located unit test in `src/data/repo/unit-repository.test.ts` for the new function

- [x] Task 2: Create `src/pages/search.astro` — search results page (AC: #2, #3, #4, #5, #6, #7)
  - [x] 2.1 Import `Base` layout, `Breadcrumb` component, `searchUnitsByName` from `@/data/repo/unit-repository`
  - [x] 2.2 Import co-located CSS: `import "./SearchResults.css"`
  - [x] 2.3 In frontmatter, read `q` from `Astro.url.searchParams`
  - [x] 2.4 If `q` is empty or missing, redirect to `/` via `return Astro.redirect("/")`
  - [x] 2.5 Call `searchUnitsByName(q)` to get matching units
  - [x] 2.6 Render breadcrumb: `Home > Search Results`
  - [x] 2.7 Display `<h1>` with "Search Results" heading
  - [x] 2.8 Show the query to the user (e.g., "Showing results for "[query]"")
  - [x] 2.9 If results exist, render a `<ul class="search-results">` with one `<li class="search-results__item">` per unit: unit name as `<a>` link to `/units/[slug]`, description as `<p>` in muted text
  - [x] 2.10 If no results, render `<p class="empty-state">No units found matching "[query]".</p>`

- [x] Task 3: Create `src/pages/SearchResults.css` — search results BEM styles (AC: #2, #4, #7)
  - [x] 3.1 `.search-results` — `list-style: none`, `padding: 0`, spacing between items via gap or margin
  - [x] 3.2 `.search-results__item` — bottom border or spacing to separate results
  - [x] 3.3 `.search-results__name` — link styling (accent red, underlined)
  - [x] 3.4 `.search-results__description` — `color: var(--color-muted)`, `font-size: 0.875rem`
  - [x] 3.5 All spacing in rem. No `@media` queries

- [x] Task 4: Write E2E tests for the search page (AC: all)
  - [x] 4.1 Create `e2e/search.spec.ts`
  - [x] 4.2 Test: submitting a search query shows matching results with unit names and descriptions
  - [x] 4.3 Test: clicking a search result navigates to the correct detail page
  - [x] 4.4 Test: searching for a non-existent unit shows "No units found matching" message
  - [x] 4.5 Test: submitting an empty search redirects to index `/`
  - [x] 4.6 Test: search results page has breadcrumb with "Home" link back to index
  - [x] 4.7 Test: clicking site name in header from search results navigates to index
  - [x] 4.8 Test: search results page has logical heading hierarchy
  - [x] 4.9 Test: partial name search returns matching units

- [x] Task 5: Verify all existing tests still pass (AC: all)
  - [x] 5.1 Run `npm run test` — all existing unit tests must pass
  - [x] 5.2 Run `npm run build` — must succeed with no errors
  - [x] 5.3 Run `npm run test:e2e` — all existing E2E tests must pass alongside new ones

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Epic 1, reinforced in Stories 2.1, 2.2, 3.1):**

- **Import convention:** Always use `@/` path alias — never relative paths. `@/` maps to `src/` (configured in `tsconfig.json`). Example: `import { searchUnitsByName } from "@/data/repo/unit-repository"`.
- **CSS co-location pattern:** Each BEM block gets its own CSS file, co-located with its Astro page or component. Astro files import their co-located CSS. `public/styles.css` contains ONLY the global reset and `:root` CSS custom properties — no BEM block styles.
- **Naming conventions:** Astro components are PascalCase (`SearchForm.astro`), TypeScript modules are kebab-case, BEM classes use `.block__element--modifier`.
- **Data access boundary:** Public pages use repository modules from `src/data/repo/` for DB reads — never import `drizzle-orm` directly in pages.
- **No JavaScript components:** All server-rendered HTML + CSS. Zero client JS.
- **Semantic HTML:** Logical heading hierarchy (h1 > h2), `<nav aria-label="Breadcrumb">` for breadcrumb, `<ul>` for result lists.
- **No scoped styles:** Do NOT use `<style>` tags in `.astro` files — always co-located `.css` files with BEM naming.

### Existing Components to REUSE (Do NOT Recreate)

| Component | File | Purpose |
|---|---|---|
| `SearchForm.astro` | `src/components/SearchForm.astro` | Search form in header — already submits GET to `/search?q=` |
| `SearchForm.css` | `src/components/SearchForm.css` | Search form styling — already complete |
| `SiteHeader.astro` | `src/components/SiteHeader.astro` | Header with home link + SearchForm — renders on every page via Base layout |
| `Breadcrumb.astro` | `src/components/Breadcrumb.astro` | Breadcrumb nav — accepts `items` array of `{label, href?}` |
| `Base.astro` | `src/layouts/Base.astro` | Base layout with `<header>`, `<main>`, skip-link, Google Fonts `<link>` |

**AC #1 (search form in header) is ALREADY FULLY IMPLEMENTED.** The `SearchForm.astro` component is rendered in `SiteHeader.astro` on every page. No work needed for AC #1.

### Existing Repository Functions

| Function | File | Returns |
|---|---|---|
| `getAllUnits()` | `unit-repository.ts` | All units ordered alphabetically by name |
| `findUnitBySlug(slug)` | `unit-repository.ts` | Single unit by slug or null |

**NEW function needed:** `searchUnitsByName(query: string)` — see implementation guidance below.

### Search Repository Function — Implementation Guidance

Add to `src/data/repo/unit-repository.ts`:

```typescript
export function searchUnitsByName(query: string) {
  return db
    .select()
    .from(unit)
    .where(like(unit.name, `%${query}%`))
    .orderBy(asc(unit.name))
    .all();
}
```

- Import `like` from `drizzle-orm` (add to existing import statement)
- SQLite `LIKE` is case-insensitive by default for ASCII characters — no special handling needed
- Returns same shape as `getAllUnits()` — array of full unit rows
- Ordered alphabetically to match index page behavior

### Search Page — Key Implementation Details

**Route:** `src/pages/search.astro` maps to `/search` (Astro file-based routing)

**Query parameter:** `q` — read via `Astro.url.searchParams.get("q")`

**Empty query handling:** If `q` is falsy or whitespace-only after trimming, redirect:
```typescript
const q = Astro.url.searchParams.get("q")?.trim() ?? "";
if (!q) {
  return Astro.redirect("/");
}
```

**Page title:** `Search Results — Army Builder`

**Breadcrumb:** `[{ label: "Home", href: "/" }, { label: "Search Results" }]` — matches the pattern used in `[slug].astro`

**Results display — slim list per UX spec:**
- Each result shows only: unit name (as link) + description (muted text)
- NO stat rows, NO card styling — this is intentionally different from the index
- Unit name links to `/units/[slug]`
- Description is optional (some units have null description)

**No results message:** `No units found matching "[query]".` — use `.empty-state` class (already defined in `src/pages/UnitIndex.css` — reuse the same class, styles are already in global scope via the index page)

### UX Requirements — Search Results Design

Per the UX spec:
- **Slim results:** Name + description only. No stats, no cards, no decoration. Get the player to the detail page fast.
- **Links:** Unit name is an accent red link (`var(--color-accent)`) — standard link styling
- **Description:** Muted text below the name. If null, just show the name.
- **No results:** Plain text message echoing the query. Header search bar available for retry.
- **Density:** Compact — minimal spacing between results

### Data Schema Reference

**Unit table columns used on search page:** name, slug, description (nullable)

Only `name`, `slug`, and `description` are displayed on the search results page. The full unit row is returned by the repository function, but the template only uses these three fields.

### File Structure Requirements

```
src/
├── pages/
│   ├── search.astro                                (create — search results page)
│   └── SearchResults.css                           (create — search results BEM styles)
├── data/
│   └── repo/
│       ├── unit-repository.ts                      (modify — add searchUnitsByName)
│       └── unit-repository.test.ts                 (modify — add search tests)
e2e/
└── search.spec.ts                                  (create — search E2E tests)
```

### Testing Requirements

**Unit tests** for `searchUnitsByName`:
- Co-located at `src/data/repo/unit-repository.test.ts`
- Test: returns matching units for partial name match
- Test: returns empty array for no matches
- Test: search is case-insensitive
- Test: results are ordered alphabetically
- Use fixture factories from `src/test/fixtures.ts` for test data

**E2E tests** at `e2e/search.spec.ts`:
- Use `test.describe.configure({ mode: "serial" })` to avoid race conditions (same pattern as `e2e/index.spec.ts`)
- Seed data via `request.post("/api/fixtures")` in `beforeAll`
- Seeded units: "E2E Detail Test Unit" and "E2E No Description Unit" — use these names for search queries
- Test partial matches (e.g., searching "Detail" should find "E2E Detail Test Unit")
- Test no matches (e.g., searching "ZZZZZ" should show empty state)
- Empty query tests need a separate describe block or direct navigation to `/search?q=`

### Anti-Patterns — NEVER Do These

- Use `@media` queries for responsive layout — use intrinsic design only
- Add client-side JavaScript for search behavior (autocomplete, live search, etc.)
- Use relative imports (`../../layouts/Base.astro`) — always use `@/` alias
- Put BEM block styles in `public/styles.css` — co-locate with pages/components
- Import `drizzle-orm` directly in page files — use repository functions
- Use px for spacing, padding, or margins — use rem only
- Use scoped styles (`<style>` tags in `.astro` files) — use co-located `.css` files
- Render search results as cards — results must be a slim list (name + description only)
- Use POST method for search — search is GET with query parameter `q`
- Create a separate search API endpoint — search is handled directly in the page frontmatter
- Add "did you mean" or autocomplete features — keep search simple

### Previous Story Learnings (from Story 3.1 + Epic 1 retro)

- **`@/` alias enforcement:** Dev agents used relative imports in 3/5 Epic 1 stories. Always use `@/` — zero exceptions.
- **CSS co-location is the standard:** Each BEM block gets its own CSS file next to its component. `public/styles.css` is reset + tokens only.
- **E2E tests use serial mode:** Story 3.1 discovered that `fullyParallel: true` causes race conditions with shared in-memory DB. Use `test.describe.configure({ mode: "serial" })`.
- **E2E fixture seeding pattern:** `request.post("/api/fixtures")` for standard seed, `?type=empty` to clear. Tests should be independent — each `describe` block seeds in `beforeAll`.
- **CSRF protection disabled in test mode:** `astro.config.mjs` disables `security.checkOrigin` when `NODE_ENV=test` to allow fixture API POST requests.
- **File List must be complete:** Stories 1.3 and 1.4 had incomplete File Lists caught in review. Document every file created or modified.
- **Site name is "Army Builder"** — use in page titles as suffix (e.g., "Search Results — Army Builder").
- **Google Fonts loaded via `<link>` in Base.astro** — do not add duplicate font links.

### Git Intelligence

Recent commits (last 3):
- `d932206` — Story 3.1 fixes
- `7d29559` — Story 3.1 dev complete
- `8bccdf0` — Create UnitPresenter to help with rendering

Key patterns from recent work:
- E2E tests use `request.post("/api/fixtures")` in `beforeAll` for standard seed
- CSS co-located with pages/components
- BEM naming throughout
- `test.describe.configure({ mode: "serial" })` for E2E suites sharing in-memory DB

### Existing Codebase State

**Files that exist and will be USED (do not recreate):**
- `src/layouts/Base.astro` — base layout with `<header>`, `<main>`, skip-link, Google Fonts
- `src/components/SiteHeader.astro` — header with home link and SearchForm
- `src/components/SearchForm.astro` — search form submitting GET to `/search?q=`
- `src/components/SearchForm.css` — search form styling
- `src/components/Breadcrumb.astro` — breadcrumb nav component
- `src/components/Breadcrumb.css` — breadcrumb styling
- `src/data/repo/unit-repository.ts` — unit repository (needs new search function)
- `src/data/orm/schema.ts` — Drizzle schema with unit table
- `public/styles.css` — global reset, `:root` tokens
- `src/test/e2e-seed.ts` — E2E seed data (2 units)
- `src/pages/api/fixtures.ts` — test-only fixture API endpoint

**Files to CREATE:**
- `src/pages/search.astro` — search results page
- `src/pages/SearchResults.css` — search results BEM styles
- `e2e/search.spec.ts` — search E2E tests

**Files to MODIFY:**
- `src/data/repo/unit-repository.ts` — add `searchUnitsByName` function
- `src/data/repo/unit-repository.test.ts` — add unit tests for search function

### Library & Framework Requirements

All packages already installed. No new dependencies needed.

| Package | Version | Purpose |
|---|---|---|
| astro | ^5.17.3 | MPA framework (installed) |
| @astrojs/node | ^9.5.4 | SSR adapter (installed) |
| drizzle-orm | 0.45.1 | DB queries via repository layer — `like` operator for search |
| playwright | 1.58.2 | E2E tests |
| vitest | 4.0.18 | Unit tests |

### Project Structure Notes

Alignment with unified project structure:
- `src/pages/search.astro` — standard Astro file-based routing for `/search`
- `src/pages/SearchResults.css` — co-located with the page that uses it
- `e2e/search.spec.ts` — E2E tests in project root `e2e/` directory per architecture spec
- Repository function added to existing `unit-repository.ts` — no new files in `src/data/repo/`

### References

- [Source: epics.md#Story-4.1] — acceptance criteria, FR4, FR5, FR6, FR7, FR8
- [Source: architecture.md#Frontend-Architecture] — URL `/search?q=`, SearchForm.astro, search.astro
- [Source: architecture.md#Requirements-to-Structure-Mapping] — FR4 maps to SearchForm.astro, FR5-FR8 map to search.astro
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — `@/` imports, naming, anti-patterns
- [Source: architecture.md#E2E-Testing-Strategy] — fixture seeding, in-memory SQLite, test independence
- [Source: ux-design-specification.md#Core-Interaction-Design] — slim search results, name + description only
- [Source: ux-design-specification.md#UX-Consistency-Patterns] — search pattern: results list, no results message, empty query redirect
- [Source: ux-design-specification.md#Component-Strategy] — `.search-results`, `.empty-state` BEM blocks
- [Source: ux-design-specification.md#Responsive-Design-&-Accessibility] — intrinsic design, WCAG AA
- [Source: 3-1-unit-index-page.md] — E2E test patterns, serial mode, fixture seeding, CSS co-location

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

- E2E tests initially failed with 8 workers due to shared in-memory SQLite DB race condition. The `index.spec.ts` empty-state `beforeAll` clears the DB via `?type=empty`, racing with search tests on other workers. Fixed by adding `workers: 1` to `playwright.config.ts` — this is a pre-existing architectural limitation (shared in-memory DB) that became visible with more E2E test files.

### Completion Notes List

- Task 1: Added `searchUnitsByName(query)` to `unit-repository.ts` using drizzle-orm `like` operator with `%query%` pattern, ordered by `asc(unit.name)`. SQLite LIKE is case-insensitive by default for ASCII. 4 unit tests added covering partial match, no match, case-insensitivity, and alphabetical ordering.
- Task 2: Created `search.astro` at `/search` route. Reads `q` from URL search params, trims whitespace, redirects to `/` if empty. Uses `searchUnitsByName(q)` for results. Renders breadcrumb (Home > Search Results), heading, query echo, result list or empty state.
- Task 3: Created `SearchResults.css` with BEM classes: `.search-results` (flexbox column, gap), `.search-results__item` (border-bottom separator), `.search-results__name` (accent red, underlined, bold), `.search-results__description` (muted color, 0.875rem). All spacing in rem, no media queries.
- Task 4: Created 9 E2E tests covering: search submission, result navigation, empty state, empty query redirect, breadcrumb, header navigation, heading hierarchy, partial search, and null description handling.
- Task 5: All 128 unit tests pass, build succeeds, all 31 E2E tests pass (0 regressions).
- Infrastructure fix: Added `workers: 1` to `playwright.config.ts` to prevent cross-file race conditions with shared in-memory DB.

### Change Log

- 2026-02-23: Implemented Story 4.1 — Search Bar & Search Results. Added `searchUnitsByName` repository function, `/search` page with results and empty state, SearchResults.css BEM styles, 9 E2E tests, 4 unit tests. Fixed Playwright config to use 1 worker for shared DB safety.
- 2026-02-23: Code review fixes — (H1) Added `.empty-state` CSS to SearchResults.css (was only defined in UnitIndex.css, unstyled on search page). (M1) Escaped SQL LIKE wildcards `%` and `_` in `searchUnitsByName` to prevent functional bugs. (M2) Added `MAX_SEARCH_RESULTS = 50` limit to search query. (M3) Changed `fullyParallel: false` in Playwright config to match `workers: 1` behavior. (L1) Added `description` meta tag to search page. (L2) Added E2E test for whitespace-only search query redirect. (L3) Added `.search-results-query` class with margin for query display text spacing. Added 1 new unit test for wildcard escaping, 1 new E2E test.

### Senior Developer Review (AI)

**Reviewed:** 2026-02-23 by B (AI-assisted)
**Outcome:** Approved with fixes applied
**Issues Found:** 1 High, 3 Medium, 3 Low — all fixed

- **H1 (fixed):** `.empty-state` CSS class was defined only in `UnitIndex.css` — unstyled on search page. Added to `SearchResults.css`.
- **M1 (fixed):** SQL LIKE wildcards (`%`, `_`) not escaped in `searchUnitsByName`. Added escape function with `ESCAPE` clause.
- **M2 (fixed):** No result limit on search query. Added `MAX_SEARCH_RESULTS = 50` constant with `.limit()`.
- **M3 (fixed):** `fullyParallel: true` contradicted `workers: 1` in Playwright config. Set `fullyParallel: false`.
- **L1 (fixed):** Missing `description` meta tag on search page. Added.
- **L2 (fixed):** No E2E test for whitespace-only query redirect. Added test.
- **L3 (fixed):** Query display text had no spacing from heading. Added `.search-results-query` class with margin.

**Test results after fixes:** 129 unit tests pass, 32 E2E tests pass, build succeeds.

### File List

- `src/data/repo/unit-repository.ts` — modified (added `searchUnitsByName` function with LIKE escape and result limit, replaced `like` import with `sql`)
- `src/data/repo/unit-repository.test.ts` — modified (added 5 unit tests for `searchUnitsByName` including wildcard escaping)
- `src/pages/search.astro` — created (search results page with description meta tag and query display class)
- `src/pages/SearchResults.css` — created (search results BEM styles, `.empty-state`, `.search-results-query`)
- `e2e/search.spec.ts` — created (10 E2E tests for search functionality including whitespace-only query)
- `playwright.config.ts` — modified (`workers: 1`, `fullyParallel: false`)
