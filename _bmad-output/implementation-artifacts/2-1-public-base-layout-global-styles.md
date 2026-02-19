# Story 2.1: Public Base Layout & Global Styles

Status: review

## Story

As a player,
I want a consistent, accessible page layout across the site,
So that I can navigate easily and read content comfortably on any device.

## Acceptance Criteria

1. **Given** a player navigates to any public route
   **When** the page loads
   **Then** the Base layout renders with a site header containing the site name linked to `/`, a `<main>` content area, and semantic HTML landmarks (`<header>`, `<main>`)

2. **Given** any public page loads
   **When** the HTML is rendered
   **Then** a skip-to-content link is the first focusable element, targeting the `<main>` element

3. **Given** the global CSS is loaded
   **When** any page renders
   **Then** design tokens are applied via CSS custom properties (`--color-bg: #FFFFFF`, `--color-text: #000000`, `--color-muted: #666666`, `--color-accent: #960B09`, `--color-accent-dark: #4A0F06`), Merriweather serif font (400/700) is loaded, and BEM class naming is used throughout

4. **Given** the responsive foundation is in place
   **When** the page is viewed at any viewport width
   **Then** the layout adapts intrinsically via CSS Grid and Flexbox with no media queries, and the content is capped at a max width of ~75rem

5. **Given** keyboard navigation is used
   **When** a user tabs through interactive elements
   **Then** focus indicators are visible as a 2px accent red outline with offset

6. **Given** any public route is requested
   **When** the response is sent
   **Then** appropriate `Cache-Control` headers are set on the response

7. **Given** any public route is requested by an unauthenticated user
   **When** the page loads
   **Then** the page is accessible without authentication and exposes no admin functionality (FR26)

## Tasks / Subtasks

- [x] Task 1: Create `Base.astro` layout (AC: #1, #2, #3, #4)
  - [x] 1.1 Create `src/layouts/Base.astro` with full HTML shell: `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with charset, viewport meta, title prop, link to `public/styles.css`, Merriweather Google Fonts link
  - [x] 1.2 Add skip-to-content link as the first element inside `<body>`: `<a href="#main-content" class="skip-link">Skip to content</a>`
  - [x] 1.3 Add `<SiteHeader />` component inside a `<header>` landmark
  - [x] 1.4 Add `<main id="main-content">` with a `<div class="page">` wrapper (max-width ~75rem) containing a `<slot />`
  - [x] 1.5 Accept `title` and `description` props for `<title>` and `<meta name="description">` tags
  - [x] 1.6 Create co-located `src/layouts/Base.css` with skip-link styles (visually hidden until focused)

- [x] Task 2: Create `SiteHeader.astro` component (AC: #1)
  - [x] 2.1 Create `src/components/SiteHeader.astro` with `<nav class="site-header">` containing site name linked to `/` and `<SearchForm />` component
  - [x] 2.2 Create co-located `src/components/SiteHeader.css` with BEM styles: `.site-header` uses Flexbox with `flex-wrap: wrap` for intrinsic responsive behavior, `.site-header__title` for the site name link, `.site-header__search` for the search form area
  - [x] 2.3 Site name text: "Aine Program" (plain text link, no logo)

- [x] Task 3: Create `SearchForm.astro` component (AC: #1)
  - [x] 3.1 Create `src/components/SearchForm.astro` with `<form class="search-form" action="/search" method="GET">` containing a labeled text input (`name="q"`) and a submit button
  - [x] 3.2 Create co-located `src/components/SearchForm.css` with BEM styles: `.search-form` uses Flexbox, `.search-form__input` with appropriate sizing, `.search-form__button`
  - [x] 3.3 Input has `<label>` (visually hidden but accessible) and `placeholder="Search units..."`

- [x] Task 4: Create `Breadcrumb.astro` component (AC: #1)
  - [x] 4.1 Create `src/components/Breadcrumb.astro` wrapped in `<nav aria-label="Breadcrumb">` with an ordered list of breadcrumb items
  - [x] 4.2 Accept `items` prop as array of `{ label: string, href?: string }` — last item has no link (current page)
  - [x] 4.3 Create co-located `src/components/Breadcrumb.css` with BEM styles: `.breadcrumb`, `.breadcrumb__list` (inline list), `.breadcrumb__item`, `.breadcrumb__separator`

- [x] Task 5: Update global CSS and establish co-located CSS pattern (AC: #3, #5)
  - [x] 5.1 Clean `public/styles.css` to contain ONLY the CSS reset and `:root` custom property definitions — move all BEM block styles out
  - [x] 5.2 Create `src/components/Field.css` — move `.field` block styles from `public/styles.css`
  - [x] 5.3 Create `src/components/Button.css` — move `.btn` block styles from `public/styles.css`
  - [x] 5.4 Create `src/components/EquipmentOptionsSelect.css` — move `.equipment-options-select` block styles from `public/styles.css`
  - [x] 5.5 Update `Field.astro`, `Button.astro`, `EquipmentOptionsSelect.astro` to import their co-located CSS files
  - [x] 5.6 Add `.admin-form__error` and `.admin-form--inline` styles to an appropriate co-located file (e.g., a shared admin form CSS or inside the components that use them)
  - [x] 5.7 Add skip-link styles to `Base.css`: visually hidden by default, visible on focus, positioned at top of page
  - [x] 5.8 Ensure the global reset in `public/styles.css` includes `img { max-width: 100%; display: block; }` and table base styles for horizontal scroll wrapper pattern

- [x] Task 6: Add Cache-Control headers for public routes (AC: #6)
  - [x] 6.1 Modify `src/middleware.ts`: for non-admin routes, set `Cache-Control: public, max-age=0, must-revalidate` header on the response (content is dynamic from DB, but allow CDN validation)
  - [x] 6.2 For admin routes, set `Cache-Control: no-store` header

- [x] Task 7: Create 404 page (AC: #7)
  - [x] 7.1 Create `src/pages/404.astro` using `Base.astro` layout with a clear "Page not found" message and a link back to the index

- [x] Task 8: Update index page to use Base layout (AC: #1, #7)
  - [x] 8.1 Replace `src/pages/index.astro` stub with a page that uses `Base.astro` layout, displays a heading and placeholder content (detail page will be Story 2.2, index content will be Story 3.1)

- [x] Task 9: Verify all existing tests still pass (AC: all)
  - [x] 9.1 Run `npm run test` — all 94 existing tests must pass
  - [x] 9.2 Verify `npm run build` succeeds with no errors

## Dev Notes

### Architecture Compliance

**CRITICAL — Follow these patterns exactly (established in Epic 1):**

- **Import convention:** Always use `@/` path alias — never relative paths. `@/` maps to `src/` (configured in `tsconfig.json`). Example: `import SiteHeader from "@/components/SiteHeader.astro"`.
- **CSS co-location pattern (NEW — established in Epic 1 retrospective):** Each BEM block gets its own CSS file, co-located with its Astro component. Example: `SiteHeader.astro` + `SiteHeader.css`. Astro components import their co-located CSS file. `public/styles.css` contains ONLY the global reset and `:root` CSS custom properties — no BEM block styles.
- **Naming conventions:** Astro components are PascalCase (`SiteHeader.astro`), TypeScript modules are kebab-case, BEM classes use `.block__element--modifier`.
- **Data access boundary:** Public pages use repository modules from `src/data/repo/` for DB reads — never import `drizzle-orm` directly.
- **No JavaScript components:** All server-rendered HTML + CSS. Zero client JS.
- **Semantic HTML:** Logical heading hierarchy (h1 > h2 > h3), `<nav>` for navigation, `<main>` for content, `<header>` for site header, `<label>` on form inputs.

### Design Token Reference

From UX specification — implement as CSS custom properties in `public/styles.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-text` | `#000000` | Primary text |
| `--color-muted` | `#666666` | Secondary text, borders |
| `--color-accent` | `#960B09` | Links, interactive elements |
| `--color-accent-dark` | `#4A0F06` | Hover/active states |

**Typography:** `"Merriweather", Georgia, "Times New Roman", serif` — 400 + 700 weights, 16px base, 1.6 line height body, 1.2 headings.

**Spacing:** All distances in rem. Compact density. No px for spacing/padding/margins.

### Responsive Strategy — Intrinsic Design (No Media Queries)

- **Card grid:** `grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))` (used by Story 3.1, but the grid foundation can be established)
- **Header:** Flexbox with `flex-wrap: wrap` — site name and search bar flow naturally
- **Tables:** Wrapped in `<div style="overflow-x: auto">` for horizontal scroll on narrow viewports
- **Content width:** Max-width cap at ~75rem on `.page` wrapper
- **Font scaling:** Use `clamp()` for heading sizes, e.g. `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem)`
- **No `@media` rules at all**

### Component Specifications

**SiteHeader (`.site-header`):**
- Contains site name linked to `/` and search form
- Flexbox layout with `flex-wrap: wrap` for responsive behavior
- Present on every public page via Base layout

**SearchForm (`.search-form`):**
- `<form action="/search" method="GET">` with text input `name="q"` and submit button
- Label is visually hidden but accessible via `<label>` with screen-reader-only class
- Input has `placeholder="Search units..."`
- Note: The `/search` page itself is built in Story 4.1 — the form should still be functional (it will navigate to a 404 for now, which is expected)

**Breadcrumb (`.breadcrumb`):**
- `<nav aria-label="Breadcrumb">` wrapping an `<ol>` list
- Accepts `items` prop: `Array<{ label: string, href?: string }>`
- Last item (current page) is plain text, not a link
- Items separated by `>` character
- Used on detail pages (Story 2.2) and admin pages — create the component now for reuse

**Base Layout (`Base.astro`):**
- Props: `title: string`, `description?: string`
- Skip-to-content link as first focusable element inside `<body>`
- `<SiteHeader />` inside `<header>`
- `<main id="main-content">` with `<div class="page">` wrapper containing `<slot />`
- Imports `public/styles.css` for global reset/tokens + `Base.css` for layout-specific styles
- Add `<meta name="description">` when description prop is provided

### Cache-Control Strategy

From architecture doc — content is dynamic (server-rendered from DB on each request):
- **Public routes:** `Cache-Control: public, max-age=0, must-revalidate` — allows CDN caching with revalidation
- **Admin routes:** `Cache-Control: no-store` — never cached
- Set in `src/middleware.ts` alongside existing auth middleware

### Migrating BEM Styles Out of `public/styles.css`

**Current state:** `public/styles.css` contains design tokens/reset AND BEM block styles (`.field`, `.btn`, `.admin-form__error`, `.equipment-options-select`, `.admin-form--inline`).

**Target state (per retro action item):** `public/styles.css` contains ONLY:
- CSS reset (`*, *::before, *::after { box-sizing: border-box; ... }`)
- `:root` custom properties (color tokens)
- Base element styles (`body`, `a` links, `img`)
- Merriweather font import

**Migration plan:**
1. Move `.field` block → `src/components/Field.css`, import in `Field.astro`
2. Move `.btn` block → `src/components/Button.css`, import in `Button.astro`
3. Move `.equipment-options-select` block → `src/components/EquipmentOptionsSelect.css`, import in `EquipmentOptionsSelect.astro`
4. Move `.admin-form__error` → inline in admin form component or a shared admin CSS file
5. Move `.admin-form--inline` → co-locate with component that uses it
6. Verify all admin pages still render correctly after migration

**CRITICAL:** Astro components import CSS files and Astro automatically includes them in the page bundle when the component is used. This means moving styles to co-located files will NOT break anything as long as the import is added to the component.

### Existing Codebase State

**Files that exist (relevant to this story):**
- `public/styles.css` — has design tokens + BEM blocks (needs cleanup)
- `src/middleware.ts` — auth middleware, no cache headers yet
- `src/pages/index.astro` — stub placeholder with no layout
- `src/components/Field.astro`, `Button.astro` — admin components (need CSS import added)
- `src/components/EquipmentOptionsSelect.astro` — admin component (needs CSS import added)

**Files that DO NOT exist (must be created):**
- `src/layouts/Base.astro` — no layouts directory exists at all
- `src/components/SiteHeader.astro` + `SiteHeader.css`
- `src/components/SearchForm.astro` + `SearchForm.css`
- `src/components/Breadcrumb.astro` + `Breadcrumb.css`
- `src/pages/404.astro`

### How Astro Component CSS Imports Work

```astro
---
import "./SiteHeader.css";
---
<nav class="site-header">...</nav>
```

Astro processes the CSS import at build time and includes it in the page's CSS bundle only when the component is rendered on that page. This is the standard Astro pattern for component-scoped styling with global BEM classes.

### Anti-Patterns — NEVER do these:

- Use `@media` queries for responsive layout — use intrinsic design only
- Add client-side JavaScript for any component behavior
- Use relative imports (`../../layouts/Base.astro`) — always use `@/` alias
- Put BEM block styles in `public/styles.css` — co-locate with components
- Use utility classes or CSS framework syntax
- Skip the skip-to-content link
- Use px for spacing, padding, or margins — use rem only
- Use scoped styles (`<style>` tags in `.astro` files) — use co-located `.css` files with BEM naming
- Expose admin links or functionality on public pages

### Previous Story Learnings (from Epic 1 retrospective)

- **`@/` alias enforcement:** Dev agents used relative imports in 3/5 stories. Always use `@/` — zero exceptions.
- **Component extraction upfront:** Design components in the story spec, not as afterthought during review. This story pre-defines SiteHeader, SearchForm, Breadcrumb, and Base layout.
- **Architecture doc stays in sync:** If any implementation decision diverges from architecture.md, update the doc in the same story.
- **CSS co-location is the new standard:** Each BEM block gets its own CSS file next to its component. `public/styles.css` is reset + tokens only.
- **Migration SQL verification:** Not directly applicable to this story, but maintain vigilance on generated artifacts.
- **E2E test gap:** Zero Playwright specs exist. Epic 2 is the natural starting point, likely in Story 2.2.

### Library & Framework Requirements

All packages already installed. No new dependencies needed.

| Package | Version | Purpose |
|---|---|---|
| astro | ^5.17.3 | MPA framework (installed) |
| @astrojs/node | ^9.5.4 | SSR adapter (installed) |

### Project Structure Notes

Files to create or modify:

```
src/
├── layouts/
│   ├── Base.astro                        (create — public base layout)
│   └── Base.css                          (create — skip-link, layout styles)
├── components/
│   ├── SiteHeader.astro                  (create — site header with home link + search)
│   ├── SiteHeader.css                    (create — header BEM styles)
│   ├── SearchForm.astro                  (create — search form component)
│   ├── SearchForm.css                    (create — search form BEM styles)
│   ├── Breadcrumb.astro                  (create — breadcrumb navigation)
│   ├── Breadcrumb.css                    (create — breadcrumb BEM styles)
│   ├── Field.astro                       (modify — add CSS import)
│   ├── Field.css                         (create — moved from public/styles.css)
│   ├── Button.astro                      (modify — add CSS import)
│   ├── Button.css                        (create — moved from public/styles.css)
│   ├── EquipmentOptionsSelect.astro      (modify — add CSS import)
│   └── EquipmentOptionsSelect.css        (create — moved from public/styles.css)
├── pages/
│   ├── index.astro                       (modify — use Base layout)
│   └── 404.astro                         (create — not found page)
├── middleware.ts                          (modify — add Cache-Control headers)
public/
└── styles.css                            (modify — strip BEM blocks, keep reset + tokens only)
```

### References

- [Source: architecture.md#CSS-file-organization] — co-located CSS pattern, `public/styles.css` is reset + tokens only
- [Source: architecture.md#Frontend-Architecture] — URL structure, component architecture, BEM naming
- [Source: architecture.md#Project-Structure-&-Boundaries] — `src/layouts/`, `src/components/`, directory structure
- [Source: architecture.md#Implementation-Patterns-&-Consistency-Rules] — import conventions, naming patterns, anti-patterns
- [Source: architecture.md#Authentication-&-Security] — public pages have no auth, admin routes need `no-store` cache
- [Source: ux-design-specification.md#Visual-Design-Foundation] — color tokens, typography, spacing
- [Source: ux-design-specification.md#Responsive-Design-&-Accessibility] — intrinsic design, no media queries, WCAG AA
- [Source: ux-design-specification.md#Component-Strategy] — `.site-header`, `.search-form`, `.breadcrumb`, `.unit-grid` BEM blocks
- [Source: ux-design-specification.md#Core-Interaction-Design] — navigation patterns, search behavior
- [Source: epics.md#Story-2.1] — acceptance criteria
- [Source: prd.md#Non-Functional-Requirements] — performance, accessibility requirements
- [Source: epic-1-retro-2026-02-19.md#Architecture-Updates] — CSS co-location decision, E2E gap
- [Source: epic-1-retro-2026-02-19.md#Next-Epic-Preview] — preparation needed for Epic 2

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-high-thinking

### Debug Log References

### Completion Notes List

- Created public Base.astro layout with full HTML shell, skip-to-content link, SiteHeader inside `<header>` landmark, `<main id="main-content">` with `.page` wrapper, and `title`/`description` props
- Created SiteHeader component with Flexbox `flex-wrap: wrap` layout, site name "Aine Program" linked to `/`, and embedded SearchForm
- Created SearchForm component with `GET /search` form, visually hidden `<label>`, `placeholder="Search units..."`, and BEM-styled submit button
- Created Breadcrumb component with `<nav aria-label="Breadcrumb">`, `<ol>` list, `items` prop accepting `{ label, href? }[]`, `aria-current="page"` on current item, `>` separator
- Migrated all BEM block styles out of `public/styles.css` into co-located CSS files: Field.css, Button.css, EquipmentOptionsSelect.css, AdminForm.css (shared by UnitAdminForm, ModelAdminForm, EquipmentOptionAdminForm, and login page)
- Cleaned `public/styles.css` to contain only: font import, `:root` tokens, CSS reset, base element styles (body, headings with `clamp()`, img, `.page`, links, table defaults)
- Added `Cache-Control: public, max-age=0, must-revalidate` for public routes and `Cache-Control: no-store` for all admin routes (including login) in middleware
- Created 404.astro page using Base layout with "Page not found" message and link back to index
- Updated index.astro to use Base layout with title and description meta tags
- All 94 existing tests pass, build succeeds with no errors
- All imports use `@/` alias — zero relative imports
- No `@media` queries used — all responsive behavior is intrinsic via Flexbox wrap and clamp()

### File List

- src/layouts/Base.astro (created — public base layout with skip link, header landmark, main landmark)
- src/layouts/Base.css (created — skip-link styles: visually hidden, visible on focus)
- src/components/SiteHeader.astro (created — site header with home link + search form)
- src/components/SiteHeader.css (created — Flexbox layout with wrap, title link styles)
- src/components/SearchForm.astro (created — search form with accessible label)
- src/components/SearchForm.css (created — Flexbox form layout, input + button styles)
- src/components/Breadcrumb.astro (created — breadcrumb nav with ol list, aria-label, aria-current)
- src/components/Breadcrumb.css (created — inline list, separator, current page styles)
- src/components/Field.css (created — moved .field block from public/styles.css)
- src/components/Button.css (created — moved .btn block from public/styles.css)
- src/components/EquipmentOptionsSelect.css (created — moved .equipment-options-select block from public/styles.css)
- src/components/AdminForm.css (created — .admin-form__error + .admin-form--inline styles)
- src/components/Field.astro (modified — added Field.css import)
- src/components/Button.astro (modified — added Button.css import)
- src/components/EquipmentOptionsSelect.astro (modified — added EquipmentOptionsSelect.css import)
- src/components/UnitAdminForm.astro (modified — added AdminForm.css import)
- src/components/ModelAdminForm.astro (modified — added AdminForm.css import)
- src/components/EquipmentOptionAdminForm.astro (modified — added AdminForm.css import)
- src/pages/admin/login.astro (modified — added AdminForm.css import)
- src/pages/index.astro (modified — replaced stub with Base layout usage)
- src/pages/404.astro (created — not found page using Base layout)
- src/middleware.ts (modified — added Cache-Control headers for public and admin routes)
- public/styles.css (modified — stripped BEM blocks, kept reset + :root tokens + base element styles only)
