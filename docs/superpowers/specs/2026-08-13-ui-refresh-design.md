# CustomerFlow UI Refresh Design

## Decision

CustomerFlow will use the first generated design direction as the visual baseline:
a polished modern SaaS admin interface with a left sidebar, top search header, dense
customer table, compact KPI cards, and a right-side work panel for tasks and recent
activity.

Reference image:
`C:\Users\82106\.codex\generated_images\019ff8d9-378e-78f2-826b-8e51292d112b\call_MGVv2Fh9lx1jd6ADVeX9sdek.png`

## Product Fit

The UI should feel like a daily operations tool for small business owners and staff.
It should prioritize scanning, filtering, customer lookup, and quick follow-up actions
over marketing-style visuals.

The first implementation pass should not add new product features. It should improve
visual consistency and usability for the existing screens:

- login
- register
- app shell
- dashboard
- customers list
- customer create
- customer detail/edit

## Visual System

- Background: cool off-white app background, white content surfaces.
- Text: slate/charcoal hierarchy with clear heading, body, and muted states.
- Primary: teal for primary actions, selected navigation, and active accents.
- Secondary accents: subtle blue, amber, rose, and green for statuses only.
- Borders: thin, low-contrast borders; avoid heavy shadow styling.
- Radius: 8px or less for cards, inputs, buttons, and panels.
- Density: compact but readable admin density.

Avoid:

- purple-heavy gradients
- dark navy dominated pages
- beige/brown/orange-heavy themes
- decorative orbs, bokeh, hero sections, stock images, illustrations
- oversized marketing typography
- cards inside cards

## Layout

### App Shell

Use a stable SaaS admin shell:

- fixed-width left sidebar on desktop
- top header with global customer/phone search
- user area and lightweight notification affordance on the right
- main content area with restrained max width only where needed
- responsive sidebar/drawer behavior later, without changing desktop structure

### Sidebar

MVP navigation should stay focused:

- Dashboard
- Customers
- Consultations
- Reservations
- Follow-ups
- Notifications
- Settings

P2 items such as marketing, statistics, plan usage, and import/export should not be
shown as primary navigation yet.

### Dashboard

Dashboard should become a work cockpit:

- top CTA row for customer, consultation, reservation
- compact KPI cards
- today schedule panel
- follow-up panel
- recent customers/activity list

### Customers

The customer list is the most important first redesigned screen:

- page title and primary `고객 추가` CTA
- KPI summary strip
- search and filters above the table
- table-first desktop layout
- status badges for `신규`, `상담중`, `예약`, `완료`, `휴면`, `취소`
- right-side task/activity panel can be introduced on dashboard first, then customer detail

Customer detail should prioritize:

- identity summary
- status and contact details
- edit form with clear save/delete actions
- timeline area explaining that consultations, reservations, and follow-ups will appear there once implemented

## Component Updates

Update shared components first so screens inherit the same design language:

- `globals.css`: design tokens, app background, focus ring
- `Button`: teal primary, subtle outline/ghost states, stable icon spacing
- `Input`: consistent focus, placeholder, disabled states
- `Badge`: status variants
- `Card`: restrained border, radius, and shadow
- shared select/textarea classes where practical
- `AppSidebar`, `AppHeader`, `AppShell`

Avoid introducing a large new design abstraction before the current UI surface proves
the need for it.

## Data And Behavior

No backend schema or API behavior changes are part of the UI refresh. Existing customer
CRUD, Auth.js session rules, and tenant isolation must remain unchanged.

## Testing

Required checks:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`

Manual/browser checks:

- `/login`
- `/register`
- `/dashboard`
- `/customers`
- `/customers/new`
- an existing `/customers/[id]`

Visual acceptance:

- no overlapping text or controls
- mobile width does not break form fields or buttons
- customer table remains readable on desktop
- UI does not read as a one-color teal theme
- MVP-only navigation is visible and P2 navigation is not primary
