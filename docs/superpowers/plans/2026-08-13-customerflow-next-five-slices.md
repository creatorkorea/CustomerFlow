# CustomerFlow Next Five Slices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the next five CustomerFlow MVP improvements and complete full regression, E2E, and UI/UX verification.

**Architecture:** Keep the existing Next.js App Router, Prisma service layer, Zod validation, server action, and route handler patterns. Each feature gets tests first, then minimal service/API/UI changes, then full verification and commit.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, PostgreSQL/Supabase, Zod, Vitest, Playwright, Tailwind CSS, shadcn-style local UI components.

## Global Constraints

- Use session-derived `organizationId` only; never trust body/query tenant IDs.
- Preserve current API response shape: `success/data/error`.
- Keep UTC storage and Asia/Seoul display.
- Use `npm.cmd` / `npx.cmd` on Windows PowerShell.
- Run full verification before completion: `npm.cmd test`, `npx.cmd prisma validate`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run test:e2e`.

---

### Task 1: Consultation-To-Workflow Actions

**Status:** Completed. Implemented and pushed in `fe925a2` and follow-up workflow commits.

**Files:**
- Modify: `src/server/consultations/service.ts`
- Modify: `src/app/(app)/consultations/page.tsx`
- Test: `tests/unit/consultations-service.test.ts`
- Test: `e2e/phase-one.spec.ts`

**Interfaces:**
- Consumes: `createConsultation({ organizationId, userId, input })`
- Produces: consultation list links to `/reservations/new?customerId=<id>` and `/follow-ups/new?customerId=<id>`

- [x] Add a failing service test proving consultation creation marks the customer `consulting`.
- [x] Add an E2E assertion that consultation list exposes reservation/follow-up action links.
- [x] Update `createConsultation` transaction to update customer status to `consulting`.
- [x] Add action links to the consultation list table.
- [x] Run focused tests, then continue.

### Task 2: Customer List Filters

**Status:** Completed. Implemented and pushed in `cb63533`.

**Files:**
- Modify: `src/server/customers/validation.ts`
- Modify: `src/server/customers/service.ts`
- Modify: `src/app/(app)/customers/page.tsx`
- Test: `tests/unit/customers-service.test.ts`
- Test: `tests/integration/customers-route.test.ts`

**Interfaces:**
- Produces: `listCustomers({ organizationId, search, status, tagId, page, pageSize })`

- [x] Add failing tests for `tagId` tenant-safe filtering.
- [x] Extend list validation with `tagId`.
- [x] Add Prisma relation filter for customer tags.
- [x] Add tag filter control to customer list.
- [x] Run focused tests, then continue.

### Task 3: Dashboard Operational Panels

**Status:** Completed. Implemented and pushed in `ca65d49` and `38b238a`.

**Files:**
- Modify: `src/server/dashboard/service.ts`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Test: `tests/unit/dashboard-service.test.ts`

**Interfaces:**
- Produces dashboard data for today reservations, due follow-ups, recent activity, unread notifications.

- [x] Add failing dashboard service tests for the four panels.
- [x] Extend dashboard service queries.
- [x] Render compact operational panels.
- [x] Run focused tests, then continue.

### Task 4: Notification Coverage

**Status:** Completed. Reservation/follow-up lifecycle notifications and app header unread count are implemented.

**Files:**
- Modify: `src/server/reservations/service.ts`
- Modify: `src/server/follow-ups/service.ts`
- Modify: `src/components/layout/app-header.tsx`
- Test: reservation/follow-up notification service tests.

**Interfaces:**
- Produces notifications for reservation created/status changed and follow-up status changed.

- [x] Add failing tests for notification creation on reservation lifecycle events.
- [x] Add notification creates in service transactions.
- [x] Show unread notification count in app header.
- [x] Run focused tests, then continue.

### Task 5: Operations Quality

**Status:** Completed. `pg@9` deprecation warning was traced to relation reads inside transaction updates and fixed in `7381475`.

**Files:**
- Modify: `src/lib/db.ts` or Prisma adapter setup if pg warning is local-client related.
- Modify: `prisma/seed.ts` if demo reset is needed.
- Modify: `README.md` or docs if operational notes are needed.

- [x] Investigate the `pg@9` deprecation warning with logs and dependency paths.
- [x] Add a deterministic E2E data cleanup or isolation note if practical.
- [x] Re-run full verification.
- [x] Perform UI/UX browser review of key pages.
- [x] Commit and push the complete slice set.

## Completion Evidence

- `npm.cmd run lint`: passed.
- `npm.cmd test`: passed, 31 files and 95 tests.
- `npx.cmd prisma validate`: passed.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e`: passed, 15 Playwright tests including desktop and mobile UI smoke checks.
- `NODE_OPTIONS=--trace-deprecation` follow-up E2E rerun: passed without the previous `pg@9` transaction warning.
