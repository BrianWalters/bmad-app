---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments: []
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
  projectContext: 0
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
workflowType: 'prd'
---

# Product Requirements Document - aine-program

**Author:** B
**Date:** 2026-02-18

## Executive Summary

Aine Program is a web application for tabletop wargame players to browse, view, and select units for their games. It replaces scattered rulebook lookups with a clean digital reference and selection tool.

### What Makes This Special

Focused, purpose-built tool that does one thing well. Players get a browsable interface to find and select units with zero unnecessary complexity.

## Project Classification

- **Project Type:** Web App (MPA, server-rendered)
- **Domain:** General (tabletop wargame companion tool)
- **Complexity:** Low
- **Project Context:** Greenfield
- **Resource Model:** Solo developer

## Success Criteria

### User Success

- Players find any unit within seconds via alphabetical browsing or search
- Players view complete unit details and all selectable options on a single detail page
- Site loads fast and works across devices

### Business Success

- All units accurately represented with full details and options
- Admin manages unit data (CRUD) without developer intervention
- Site is live and usable for players

### Technical Success

- Functional web app with index, search, detail, and admin pages
- Admin routes protected behind authentication
- Data persisted reliably; admin changes immediately visible to players

## Product Scope

### MVP (Phase 1)

**Core User Journeys Supported:**
- Browse alphabetical index and navigate to unit details
- Search for a unit by name
- Handle empty search results with clear fallback
- Admin creates/edits/deletes units

**Must-Have Capabilities:**
- Alphabetical unit index page with summary info
- Search bar and search results page
- Unit detail page with all details and selectable options
- Admin CRUD pages for units, models, and equipment options
- Authentication on admin routes
- Server-rendered pages for SEO
- Responsive layout
- WCAG AA compliance

### Growth (Phase 2)

- Filtering and sorting on the index (faction, type, cost, etc.)
- Army list builder — save and share unit selections
- Print-friendly detail views

### Expansion (Phase 3)

- Community features — shared army lists, ratings
- Rules reference integration
- Enhanced mobile experience for tabletop use

### Risk Mitigation

**Technical:** Low risk. Standard MPA with CRUD patterns. Mitigation: choose a mature, well-documented framework.
**Market:** Low risk. Validate with player feedback after MVP launch.
**Resource:** Solo developer — scope discipline is critical. MVP is intentionally small. If time-constrained, launch without search and add it shortly after.

## User Journeys

### Journey 1: Marcus — Finding the Right Unit (Player, Happy Path)

Marcus is planning his next tabletop session. He wants to try a different army composition but can't remember what options are available for some units.

He opens Aine Program and lands on the index page — a clean alphabetical list of all units with summary info. He scrolls through, spots a few interesting ones, and clicks into their detail pages. Each shows full stats, abilities, and every selectable option. Within minutes, he's planned his lineup.

**Capabilities revealed:** Index page with summaries, detail page with full unit data and options, fast navigation between index and detail.

### Journey 2: Marcus — Searching for Something Specific (Player, Search Path)

Marcus heard about a unit from a friend but only remembers part of the name. He types it into the search bar, spots it in the results, clicks through to the detail page, and confirms it's the right one. Done in seconds.

**Capabilities revealed:** Search bar, search results page with summaries, link-through to detail pages.

### Journey 3: Marcus — Unit Not Found (Player, Edge Case)

Marcus searches for a badly misspelled unit name. The results page shows a clear "no results" message. He navigates back to the index and browses instead.

**Capabilities revealed:** Empty search results handling, clear navigation back to index.

### Journey 4: B — Adding a New Unit (Admin)

B logs into the admin area, creates a new unit with all fields — name, stats, description, models, and equipment options. He saves it. The unit immediately appears on the index and is searchable.

**Capabilities revealed:** Authentication, CRUD forms for units/models/options, data persistence, immediate public availability.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Alphabetical index with summaries | Journey 1 |
| Unit detail page with all options | Journey 1, 2 |
| Search bar and results page | Journey 2, 3 |
| Empty state / no results handling | Journey 3 |
| Navigation between index and detail | Journey 1, 2 |
| Admin authentication | Journey 4 |
| Unit CRUD (create, read, update, delete) | Journey 4 |
| Immediate public visibility after admin changes | Journey 4 |

## Web App Technical Requirements

### Architecture

Multi-page application with server-rendered pages. Static content changes only through admin updates. MPA architecture supports SEO, accessibility, and lightweight pages with minimal JavaScript.

### Browser Support

Browsers with greater than 1% market share: current versions of Chrome, Safari, Firefox, Edge, and Samsung Internet.

### Responsive Design

Standard responsive layout supporting desktop and mobile viewports.

### SEO Strategy

- Server-rendered HTML for full search engine crawlability
- Unique, descriptive URLs for each unit detail page
- Semantic HTML with proper heading structure
- Meta descriptions and titles per unit page
- Structured data (schema.org) for rich search results where applicable

### Implementation Considerations

- MPA architecture favors server-side rendering frameworks
- Static content supports aggressive caching or static site generation with dynamic admin
- SEO and accessibility requirements reinforce the MPA choice

## Functional Requirements

### Unit Browsing

- FR1: Players can view an alphabetical index of all units with summary information
- FR2: Players can navigate from the index to any unit's detail page
- FR3: Players can navigate back to the index from any page

### Unit Search

- FR4: Players can search for units by name using a search bar
- FR5: Players can view search results with unit summary information
- FR6: Players can navigate from a search result to a unit's detail page
- FR7: Players see a clear message when a search returns no results
- FR8: Players can navigate back to the index from the search results page

### Unit Details

- FR9: Players can view all attributes for a unit on its detail page
- FR10: Players can view every model that belongs to a unit
- FR11: Players can view the default equipment for each model in a unit
- FR12: Players can view all available equipment options for each model in a unit
- FR13: Players can see which equipment choices are alternatives to the defaults

### Unit Administration

- FR14: Admin can create a new unit with all its attributes
- FR15: Admin can edit an existing unit's attributes
- FR16: Admin can delete a unit
- FR17: Admin can add models to a unit
- FR18: Admin can edit a model's details and default equipment
- FR19: Admin can remove a model from a unit
- FR20: Admin can define available equipment options for a model
- FR21: Admin can edit equipment options for a model
- FR22: Admin can remove equipment options from a model
- FR23: Changes made by admin are immediately visible to players

### Authentication & Access Control

- FR24: Admin pages require authentication before access
- FR25: Unauthenticated users are redirected to a login page when attempting to access admin routes
- FR26: Public pages (index, search, detail) are accessible without authentication

## Non-Functional Requirements

### Performance

- Pages load within 2 seconds on standard broadband connections
- Search results return within 1 second
- Admin save operations complete within 3 seconds
- Static content is cacheable to minimize server load

### Security

- Admin routes are inaccessible without valid authentication
- Authentication credentials are stored securely (hashed, never plaintext)
- Session management prevents unauthorized session reuse
- Public pages expose no admin functionality or sensitive data

### Accessibility

- WCAG AA compliance across all public-facing pages
- All images and icons include appropriate alt text
- Full keyboard navigation support on all pages
- Minimum 4.5:1 color contrast ratio for normal text
- Form inputs have associated labels and error messages
- Semantic HTML with logical heading hierarchy
