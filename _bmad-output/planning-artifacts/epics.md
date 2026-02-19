---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# aine-program - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for aine-program, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Players can view an alphabetical index of all units with summary information
FR2: Players can navigate from the index to any unit's detail page
FR3: Players can navigate back to the index from any page
FR4: Players can search for units by name using a search bar
FR5: Players can view search results with unit summary information
FR6: Players can navigate from a search result to a unit's detail page
FR7: Players see a clear message when a search returns no results
FR8: Players can navigate back to the index from the search results page
FR9: Players can view all attributes for a unit on its detail page
FR10: Players can view every model that belongs to a unit
FR11: Players can view the default equipment for each model in a unit
FR12: Players can view all available equipment options for each model in a unit
FR13: Players can see which equipment choices are alternatives to the defaults
FR14: Admin can create a new unit with all its attributes
FR15: Admin can edit an existing unit's attributes
FR16: Admin can delete a unit
FR17: Admin can add models to a unit
FR18: Admin can edit a model's details and default equipment
FR19: Admin can remove a model from a unit
FR20: Admin can define available equipment options for a model
FR21: Admin can edit equipment options for a model
FR22: Admin can remove equipment options from a model
FR23: Changes made by admin are immediately visible to players
FR24: Admin pages require authentication before access
FR25: Unauthenticated users are redirected to a login page when attempting to access admin routes
FR26: Public pages (index, search, detail) are accessible without authentication

### NonFunctional Requirements

NFR1: Pages load within 2 seconds on standard broadband connections
NFR2: Search results return within 1 second
NFR3: Admin save operations complete within 3 seconds
NFR4: Static content is cacheable to minimize server load
NFR5: Admin routes inaccessible without valid authentication
NFR6: Authentication credentials stored securely (hashed, never plaintext)
NFR7: Session management prevents unauthorized session reuse
NFR8: Public pages expose no admin functionality or sensitive data
NFR9: WCAG AA compliance across all public-facing pages
NFR10: All images and icons include appropriate alt text
NFR11: Full keyboard navigation support on all pages
NFR12: Minimum 4.5:1 color contrast ratio for normal text
NFR13: Form inputs have associated labels and error messages
NFR14: Semantic HTML with logical heading hierarchy

### Additional Requirements

From Architecture:
- Starter template: Astro via `npm create astro@latest` with `@astrojs/node` adapter (first implementation story)
- Database: SQLite via better-sqlite3 with Drizzle ORM, schema-first migrations via Drizzle Kit
- Data model: Unit > Model > Equipment Option hierarchy; many-to-many via `model_equipment_option` association table with `is_default` flag
- Slug column on unit table with unique index, auto-generated from name, editable by admin
- Zod validation on all admin form inputs, aligned with Drizzle schemas
- HTTP Cache-Control headers on public pages; `no-store` on admin pages
- Session-based auth with bcrypt password hashing, sessions stored in SQLite
- CSRF token per session, validated on every POST (`_csrf` hidden field)
- Same-page form handling pattern (GET renders form, POST processes submission, redirect on success)
- Docker + Docker Compose containerization with SQLite volume persistence
- Vitest for unit/integration tests (co-located), Playwright for E2E tests (e2e/ directory)
- Admin user creation via `scripts/create-admin.ts` CLI script (only way to create admin users)
- Environment variables: SESSION_SECRET, DATABASE_PATH, NODE_ENV

From UX:
- Intrinsic responsive design (no media queries) — CSS Grid card layout with `repeat(auto-fill, minmax(18rem, 1fr))`
- Tables wrapped for horizontal scroll on narrow viewports via `overflow-x: auto`
- Skip-to-content link as first focusable element
- Breadcrumb navigation in `<nav aria-label="Breadcrumb">` on detail and admin pages
- Focus indicators: 2px accent red outline with offset
- Native `<details>/<summary>` for collapsible rules text (no JavaScript)
- Delete confirmation via native `confirm()` dialog
- Color tokens: #FFFFFF bg, #000000 text, #666666 muted, #960B09 accent, #4A0F06 accent dark
- Typography: Merriweather serif (400/700 weights), 16px base size
- BEM class naming throughout
- Zero JavaScript components — all server-rendered HTML + CSS

### FR Coverage Map

FR1: Epic 3 - Alphabetical index with summaries
FR2: Epic 3 - Navigate index to detail
FR3: Epic 3 - Navigate back to index
FR4: Epic 4 - Search by name
FR5: Epic 4 - Search results with summaries
FR6: Epic 4 - Navigate result to detail
FR7: Epic 4 - No results message
FR8: Epic 4 - Navigate back from search
FR9: Epic 2 - View all unit attributes
FR10: Epic 2 - View models in a unit
FR11: Epic 2 - View default equipment
FR12: Epic 2 - View all equipment options
FR13: Epic 2 - See default vs. alternative equipment
FR14: Epic 1 - Create unit
FR15: Epic 1 - Edit unit
FR16: Epic 1 - Delete unit
FR17: Epic 1 - Add models
FR18: Epic 1 - Edit models/default equipment
FR19: Epic 1 - Remove models
FR20: Epic 1 - Define equipment options
FR21: Epic 1 - Edit equipment options
FR22: Epic 1 - Remove equipment options
FR23: Epic 1 - Immediate public visibility
FR24: Epic 1 - Admin requires auth
FR25: Epic 1 - Redirect to login
FR26: Epic 1 - Public pages open

## Epic List

### Epic 1: Admin Authentication & Unit Management
Admin can securely log in and fully manage all unit content — create, edit, and delete units, models, and equipment options.
**FRs covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

### Epic 2: Unit Detail Pages
Players can view a unit's complete details — all attributes, models, default equipment, and available equipment options — on a dedicated detail page.
**FRs covered:** FR9, FR10, FR11, FR12, FR13

### Epic 3: Unit Index Page
Players can browse an alphabetical index of all units and navigate between the index and detail pages.
**FRs covered:** FR1, FR2, FR3

### Epic 4: Unit Search
Players can search for units by name and navigate from search results to unit details.
**FRs covered:** FR4, FR5, FR6, FR7, FR8

### Epic 5: Containerization
Application is containerized with Docker for reliable production deployment.
**FRs covered:** FR23 (production verification)

## Epic 1: Admin Authentication & Unit Management

Admin can securely log in and fully manage all unit content — create, edit, and delete units, models, and equipment options.

### Story 1.1: Project Initialization & Admin Login

As an admin,
I want to log into a secure admin area,
So that I can access unit management tools without unauthorized users gaining access.

**Acceptance Criteria:**

**Given** the Astro project is initialized with Node adapter, TypeScript strict mode, SQLite database via Drizzle ORM, and the admin_user and session tables exist
**When** an admin navigates to `/admin/login`
**Then** a login form is displayed with username and password fields, both with associated labels
**And** the form includes a hidden CSRF token field

**Given** valid admin credentials have been created via the `create-admin.ts` CLI script
**When** the admin submits correct username and password
**Then** a session is created in the database, a session cookie is set with `HttpOnly`, `SameSite=Strict` (and `Secure` in production), and the admin is redirected to `/admin`

**Given** the login form is displayed
**When** the admin submits incorrect credentials
**Then** the form re-renders with an error message, no session is created, and the password field is cleared

**Given** an unauthenticated user
**When** they attempt to access any `/admin/*` route (except `/admin/login`)
**Then** they are redirected to `/admin/login` (FR25)

**Given** an authenticated admin session
**When** the admin accesses any `/admin/*` route
**Then** the page renders normally with session data available

**Given** the `create-admin.ts` script is executed
**When** the admin provides a username and password
**Then** the password is hashed with bcrypt and stored in the admin_user table

### Story 1.2: Create New Unit

As an admin,
I want to create a new unit with all its core attributes,
So that unit information is available in the system for players to view.

**Acceptance Criteria:**

**Given** the unit table exists with columns for name, slug, movement, toughness, save, wounds, leadership, objective control, invulnerability save, and description; and a keyword table (id, name) and unit_keyword join table (unit_id, keyword_id) exist
**When** an authenticated admin navigates to `/admin/units/new`
**Then** a form is displayed with fields for all unit attributes (name, movement, toughness, save, wounds, leadership, objective control, invulnerability save, description, keywords), each with associated labels, and a hidden CSRF token

**Given** the admin fills in valid unit data and selects or creates keywords
**When** the server processes the POST request
**Then** the CSRF token is validated, input is validated with the Zod unit schema, a slug is auto-generated from the unit name, the unit is saved to the database, keyword associations are created in the unit_keyword table, and the admin is redirected to `/admin` (FR14)

**Given** the admin assigns a keyword that doesn't exist yet
**When** the form is submitted
**Then** the new keyword is created in the keyword table and associated with the unit

**Given** the admin submits a form with invalid data (e.g., missing required fields)
**When** Zod validation fails
**Then** the form re-renders with per-field error messages using `aria-describedby`, previously entered values are preserved, and no database write occurs

**Given** the admin submits a unit with a name that generates a duplicate slug
**When** uniqueness validation runs
**Then** the form re-renders with an error on the name/slug field indicating the conflict

**Given** an authenticated admin navigates to `/admin`
**When** the admin unit list page loads
**Then** all existing units are listed with links to edit each one and a link to create a new unit

### Story 1.3: Edit and Delete Units

As an admin,
I want to edit an existing unit's attributes or delete a unit,
So that I can keep unit information accurate and remove obsolete units.

**Acceptance Criteria:**

**Given** an authenticated admin navigates to `/admin/units/[id]/edit`
**When** the page loads
**Then** the edit form is pre-populated with the unit's current data including keyword associations, includes a hidden CSRF token, and displays all editable fields with labels (FR15)

**Given** the admin modifies unit attributes and submits the edit form
**When** the server processes the POST request
**Then** the CSRF token is validated, input is validated with Zod, the unit is updated in the database, keyword associations are updated, and the admin is redirected to `/admin`

**Given** the admin edits the unit name
**When** the slug would change
**Then** the slug is regenerated from the new name (or the admin can manually edit the slug field) and uniqueness is validated before save

**Given** the admin submits an edit form with invalid data
**When** Zod validation fails
**Then** the form re-renders with per-field error messages and the submitted values preserved

**Given** the admin clicks delete on a unit
**When** the browser's native `confirm()` dialog appears and the admin confirms
**Then** the unit and all its associated models and equipment options are deleted from the database, and the admin is redirected to `/admin` (FR16)

**Given** the admin clicks delete and cancels the confirmation dialog
**When** the dialog is dismissed
**Then** no deletion occurs and the page remains unchanged

### Story 1.4: Model Management

As an admin,
I want to add, edit, and remove models within a unit,
So that each unit's model composition is fully defined.

**Acceptance Criteria:**

**Given** the model table exists with a foreign key to the unit table
**When** an admin is on the create or edit unit page
**Then** a section for managing models is displayed below the unit attributes

**Given** an admin clicks to add a new model
**When** the model fields are displayed
**Then** the admin can enter model name, details, and other model attributes (FR17)

**Given** an admin has added models to a unit and submits the form
**When** the server processes the request
**Then** all models are validated with Zod and saved to the database associated with the unit

**Given** an admin is editing a unit with existing models
**When** the edit page loads
**Then** all existing models are displayed with their current data, each editable (FR18)

**Given** an admin modifies a model's details and submits
**When** the server processes the request
**Then** the model is updated in the database

**Given** an admin removes a model from a unit
**When** the form is submitted
**Then** the model and its associated equipment options are deleted from the database (FR19)

### Story 1.5: Equipment Option Management

As an admin,
I want to define, edit, and remove equipment options for each model and designate a default,
So that players can see all available equipment choices and which is the default.

**Acceptance Criteria:**

**Given** the `equipment_option` table and `model_equipment_option` association table exist
**When** an admin is on the model edit page
**Then** a section for managing equipment options is displayed below the model form

**Given** an admin adds an equipment option to a model
**When** the option fields are filled in and the form is submitted
**Then** the equipment option is validated with Zod and saved to the database associated with the model (FR20)

**Given** an admin edits an existing equipment option
**When** the updated data is submitted
**Then** the equipment option is updated in the database (FR21)

**Given** an admin removes an equipment option from a model
**When** the form is submitted
**Then** the association is deleted from the join table, and if it was marked as default, the default is cleared (FR22)

**Given** an admin designates an equipment option as the model's default
**When** the form is submitted
**Then** the `is_default` flag is set on that association row in `model_equipment_option`

**Given** a model has no default equipment set
**When** the admin views the model in the form
**Then** the default equipment selection shows no default selected, prompting the admin to choose one

## Epic 2: Unit Detail Pages

Players can view a unit's complete details — all attributes, models, default equipment, and available equipment options — on a dedicated detail page.

### Story 2.1: Public Base Layout & Global Styles

As a player,
I want a consistent, accessible page layout across the site,
So that I can navigate easily and read content comfortably on any device.

**Acceptance Criteria:**

**Given** a player navigates to any public route
**When** the page loads
**Then** the Base layout renders with a site header containing the site name linked to `/`, a `<main>` content area, and semantic HTML landmarks (`<header>`, `<main>`)

**Given** any public page loads
**When** the HTML is rendered
**Then** a skip-to-content link is the first focusable element, targeting the `<main>` element

**Given** the global CSS is loaded
**When** any page renders
**Then** design tokens are applied via CSS custom properties (`--color-bg: #FFFFFF`, `--color-text: #000000`, `--color-muted: #666666`, `--color-accent: #960B09`, `--color-accent-dark: #4A0F06`), Merriweather serif font (400/700) is loaded, and BEM class naming is used throughout

**Given** the responsive foundation is in place
**When** the page is viewed at any viewport width
**Then** the layout adapts intrinsically via CSS Grid and Flexbox with no media queries, and the content is capped at a max width of ~75rem

**Given** keyboard navigation is used
**When** a user tabs through interactive elements
**Then** focus indicators are visible as a 2px accent red outline with offset

**Given** any public route is requested
**When** the response is sent
**Then** appropriate `Cache-Control` headers are set on the response

**Given** any public route is requested by an unauthenticated user
**When** the page loads
**Then** the page is accessible without authentication and exposes no admin functionality (FR26)

### Story 2.2: Unit Detail Page

As a player,
I want to view a unit's complete details on a single page,
So that I can see all attributes, models, and equipment options at a glance for game planning.

**Acceptance Criteria:**

**Given** a player navigates to `/units/[slug]` for an existing unit
**When** the detail page loads
**Then** all unit attributes are displayed using a definition list: name, movement, toughness, save, wounds, leadership, objective control, invulnerability save, and description (FR9)
**And** the unit's keywords are displayed

**Given** a unit has one or more models
**When** the detail page loads
**Then** every model belonging to the unit is displayed in its own visually contained section (bordered) showing the model's name and details (FR10)

**Given** a model has a default equipment option set
**When** the detail page loads
**Then** the default equipment is clearly displayed for that model (FR11)

**Given** a model has multiple equipment options
**When** the detail page loads
**Then** all available equipment options for the model are displayed (FR12)

**Given** a model has both default and alternative equipment options
**When** the detail page loads
**Then** the default equipment is visually distinguished from alternatives so the player can instantly see what's standard vs. swappable (FR13)

**Given** the detail page loads
**When** the page renders
**Then** a breadcrumb is displayed in a `<nav aria-label="Breadcrumb">` element showing the path (e.g., Home > Unit Name)

**Given** the unit has rules text or other long prose content
**When** the detail page loads
**Then** the content is rendered inside native `<details>/<summary>` elements, collapsed by default

**Given** the page uses semantic HTML
**When** inspected
**Then** the heading hierarchy is logical (h1 for unit name, h2 for sections, h3 for models), data is in `<dl>` or `<table>` elements as appropriate, and all text meets WCAG AA contrast requirements

**Given** a player navigates to `/units/[slug]` for a slug that doesn't exist
**When** the page loads
**Then** a 404 page is displayed

## Epic 3: Unit Index Page

Players can browse an alphabetical index of all units and navigate between the index and detail pages.

### Story 3.1: Unit Index Page

As a player,
I want to browse an alphabetical list of all units with summary information,
So that I can quickly scan available units and navigate to any unit's detail page.

**Acceptance Criteria:**

**Given** a player navigates to `/`
**When** the index page loads
**Then** all units are displayed in alphabetical order by name, each as a card in a responsive grid using CSS Grid `repeat(auto-fill, minmax(18rem, 1fr))` (FR1)

**Given** each unit card on the index
**When** the page renders
**Then** the card displays the unit's name and summary information (description, key attributes) using the `.unit-card` BEM block

**Given** a player views a unit card on the index
**When** they click the card
**Then** they are navigated to that unit's detail page at `/units/[slug]` (FR2)

**Given** a player is on any page (detail, search, admin)
**When** they click the site name in the header
**Then** they are navigated back to the index at `/` (FR3)

**Given** the detail page breadcrumb
**When** the player clicks "Home" in the breadcrumb
**Then** they are navigated back to the index at `/`

**Given** there are no units in the database
**When** the index page loads
**Then** an empty state message is displayed (e.g., "No units yet.")

**Given** the index page renders
**When** inspected
**Then** the heading hierarchy is logical, cards are keyboard-navigable, and all text meets WCAG AA contrast requirements

## Epic 4: Unit Search

Players can search for units by name and navigate from search results to unit details.

### Story 4.1: Search Bar & Search Results

As a player,
I want to search for units by name,
So that I can find a specific unit quickly without scrolling through the full index.

**Acceptance Criteria:**

**Given** any page on the site
**When** the page loads
**Then** the site header contains a search form (`.search-form`) with a text input for searching by unit name (FR4)

**Given** a player types a query into the search bar and submits
**When** the search results page loads at `/search?q=[query]`
**Then** matching units are displayed as a slim list showing unit name (as a link) and description (FR5)

**Given** a player views a search result
**When** they click the unit name link
**Then** they are navigated to that unit's detail page at `/units/[slug]` (FR6)

**Given** a player searches for a query with no matches
**When** the search results page loads
**Then** a clear message is displayed: "No units found matching [query]." using the `.empty-state` BEM block (FR7)

**Given** a player is on the search results page
**When** they click the site name in the header or "Home" in the breadcrumb
**Then** they are navigated back to the index at `/` (FR8)

**Given** a player submits an empty search query
**When** the form is submitted
**Then** the player is redirected to the index at `/`

**Given** the search results page renders
**When** inspected
**Then** search results return within 1 second, the page uses semantic HTML, and all text meets WCAG AA contrast requirements

## Epic 5: Containerization

Application is containerized with Docker for reliable production deployment.

### Story 5.1: Docker Containerization

As an admin,
I want to deploy the application via Docker,
So that the app runs reliably in production and admin changes are immediately visible to players.

**Acceptance Criteria:**

**Given** a multi-stage Dockerfile targeting Node.js 24 Alpine
**When** `docker compose up --build` is run
**Then** the Astro app builds, installs production dependencies, and starts the Node server

**Given** Docker Compose is configured with a named volume for the SQLite database
**When** the container restarts
**Then** all data persists across restarts

**Given** environment variables `SESSION_SECRET`, `DATABASE_PATH`, and `NODE_ENV` are set in Docker Compose
**When** the app starts
**Then** the app uses these values for session signing, database location, and environment mode

**Given** an admin creates or edits a unit via the admin interface
**When** a player loads any public page
**Then** the changes are immediately visible because pages are server-rendered from the database on each request (FR23)

**Given** the production Docker image
**When** inspected
**Then** it contains only the build output and production dependencies with no dev dependencies or source files
