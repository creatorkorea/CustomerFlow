# Premium CRM UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved premium CRM plus Korean operations visual direction to CustomerFlow while keeping backend behavior unchanged.

**Architecture:** Update the design source of truth first, then shared UI primitives, then app shell, then the high-value dashboard and customer screens. Keep existing Server Component and Client Component boundaries intact.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, lucide-react, Prisma, Auth.js, Vitest, Playwright.

## Global Constraints

- Use the detailed rules in `docs/superpowers/specs/2026-08-14-premium-crm-ui-rules.md`.
- Do not change Prisma schema, server actions, route handlers, or tenant-isolation behavior.
- Preserve accessible labels used by tests: `고객 또는 전화번호 검색`, `고객명`, `전화번호`, `이메일`, `저장`, `변경 저장`, `고객 삭제`.
- Use `npm.cmd` and `npx.cmd` on Windows PowerShell.
- Verify with `npm.cmd test`, `npx.cmd prisma validate`, `npm.cmd run lint`, `npm.cmd run build`, and `npm.cmd run test:e2e`.

---

### Task 1: Design Source And Shared Primitives

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/card.tsx`

**Interfaces:**
- Consumes: existing `Button`, `Input`, `Badge`, `Card`, `CardHeader`, `CardTitle`, `CardContent` exports.
- Produces: same component APIs with refined tokens, spacing, borders, and status styles.

- [x] Update CSS variables for the approved premium CRM palette.
- [x] Update form select and textarea global styles to match input focus and disabled behavior.
- [x] Refine button variants without changing props.
- [x] Refine input, badge, and card styling without changing imports.
- [x] Run `npm.cmd test -- tests/unit/app-header.test.tsx tests/unit/customer-picker.test.tsx`.

### Task 2: App Shell

**Files:**
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/app-header.tsx`

**Interfaces:**
- Consumes: `AppShell({ children, unreadNotificationCount, userName })`, `AppSidebar()`, `AppHeader({ unreadNotificationCount, userName })`.
- Produces: same exports with premium sidebar, command-style search header, compact user area, and MVP-only navigation.

- [x] Refresh sidebar brand, active state, nav rhythm, and bottom status panel.
- [x] Refresh header search, notification, user block, and logout visual priority.
- [x] Refresh main shell spacing and max-width.
- [x] Run `npm.cmd test -- tests/unit/app-header.test.tsx`.

### Task 3: Dashboard

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Keep: `src/app/(app)/dashboard/dashboard-activity-item.tsx`
- Keep: `src/app/(app)/dashboard/dashboard-notification-item.tsx`

**Interfaces:**
- Consumes: `getDashboardOverview({ organizationId })`.
- Produces: same `/dashboard` route with stronger today-flow header, KPI rhythm, primary actions, and operational panels.

- [x] Refresh page header copy and CTA hierarchy.
- [x] Replace generic Phase badge with operational status language.
- [x] Improve KPI cards with icon, value, and short decision label.
- [x] Rebalance panels so today reservations and follow-ups feel like the primary work queues.
- [x] Run `npm.cmd test -- tests/unit/dashboard-service.test.ts tests/unit/dashboard-activity-item.test.tsx tests/unit/dashboard-notification-item.test.tsx`.

### Task 4: Customer List

**Files:**
- Modify: `src/app/(app)/customers/page.tsx`

**Interfaces:**
- Consumes: `listCustomers({ organizationId, search, status, tagId, page, pageSize })`, `listTags({ organizationId, pageSize })`.
- Produces: same `/customers` route with premium table-first layout and practical quick actions.

- [x] Refresh title area, KPI strip, search/filter bar, desktop table, mobile cards, and empty state.
- [x] Preserve current query params and pagination behavior.
- [x] Keep customer name links to `/customers/[id]`.
- [x] Run `npm.cmd test -- tests/unit/customers-service.test.ts tests/integration/customers-route.test.ts`.

### Task 5: Customer Forms And Detail

**Files:**
- Modify: `src/app/(app)/customers/new/page.tsx`
- Modify: `src/app/(app)/customers/new/customer-form.tsx`
- Modify: `src/app/(app)/customers/[id]/page.tsx`
- Modify: `src/app/(app)/customers/[id]/customer-edit-form.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`

**Interfaces:**
- Consumes: existing customer create/update/delete server actions and auth forms.
- Produces: same routes and form labels with refined panel hierarchy.

- [x] Refresh create/edit forms with consistent labels, spacing, and action row.
- [x] Refresh customer detail identity summary, workflow actions, info panel, timeline, and edit panel.
- [x] Refresh auth pages to match the same premium but practical visual system.
- [x] Run `npm.cmd run test:e2e -- --grep "login page|register page|customer"`.

### Task 6: Full Verification

**Files:**
- Verify all edited files.

**Interfaces:**
- Produces: verified UI refresh ready for user review.

- [x] Run `npm.cmd test`.
- [x] Run `npx.cmd prisma validate`.
- [x] Run `npm.cmd run lint`.
- [x] Run `npm.cmd run build`.
- [x] Run `npm.cmd run test:e2e`.
- [x] Inspect `git status --short --branch`.

### Task 7: Workflow List Extension

**Files:**
- Modify: `src/app/(app)/consultations/page.tsx`
- Modify: `src/app/(app)/reservations/page.tsx`
- Modify: `src/app/(app)/follow-ups/page.tsx`
- Modify: `docs/superpowers/specs/2026-08-14-premium-crm-ui-rules.md`

**Interfaces:**
- Consumes: existing list services, filters, pagination, and status actions.
- Produces: same `/consultations`, `/reservations`, and `/follow-ups` routes with the premium CRM list structure extended from customers.

- [x] Refresh consultation list header, filter bar, table header, mobile cards, and action links.
- [x] Refresh reservation list header, filter bar, table header, mobile cards, and status actions.
- [x] Refresh follow-up list header, filter bar, table header, mobile cards, and status actions.
- [x] Document workflow list rules in the premium CRM UI rules.
- [x] Run focused workflow tests and full UI verification.
