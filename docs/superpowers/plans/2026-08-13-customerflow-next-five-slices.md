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

**Files:**
- Modify: `src/server/consultations/service.ts`
- Modify: `src/app/(app)/consultations/page.tsx`
- Test: `tests/unit/consultations-service.test.ts`
- Test: `e2e/phase-one.spec.ts`

**Interfaces:**
- Consumes: `createConsultation({ organizationId, userId, input })`
- Produces: consultation list links to `/reservations/new?customerId=<id>` and `/follow-ups/new?customerId=<id>`

- [ ] Add a failing service test proving consultation creation marks the customer `consulting`.
- [ ] Add an E2E assertion that consultation list exposes reservation/follow-up action links.
- [ ] Update `createConsultation` transaction to update customer status to `consulting`.
- [ ] Add action links to the consultation list table.
- [ ] Run focused tests, then continue.

### Task 2: Customer List Filters

**Files:**
- Modify: `src/server/customers/validation.ts`
- Modify: `src/server/customers/service.ts`
- Modify: `src/app/(app)/customers/page.tsx`
- Test: `tests/unit/customers-service.test.ts`
- Test: `tests/integration/customers-route.test.ts`

**Interfaces:**
- Produces: `listCustomers({ organizationId, search, status, tagId, page, pageSize })`

- [ ] Add failing tests for `tagId` tenant-safe filtering.
- [ ] Extend list validation with `tagId`.
- [ ] Add Prisma relation filter for customer tags.
- [ ] Add tag filter control to customer list.
- [ ] Run focused tests, then continue.

### Task 3: Dashboard Operational Panels

**Files:**
- Modify: `src/server/dashboard/service.ts`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Test: `tests/unit/dashboard-service.test.ts`

**Interfaces:**
- Produces dashboard data for today reservations, due follow-ups, recent activity, unread notifications.

- [ ] Add failing dashboard service tests for the four panels.
- [ ] Extend dashboard service queries.
- [ ] Render compact operational panels.
- [ ] Run focused tests, then continue.

### Task 4: Notification Coverage

**Files:**
- Modify: `src/server/reservations/service.ts`
- Modify: `src/server/follow-ups/service.ts`
- Modify: `src/components/layout/app-header.tsx`
- Test: reservation/follow-up notification service tests.

**Interfaces:**
- Produces notifications for reservation created/status changed and follow-up status changed.

- [ ] Add failing tests for notification creation on reservation lifecycle events.
- [ ] Add notification creates in service transactions.
- [ ] Show unread notification count in app header.
- [ ] Run focused tests, then continue.

### Task 5: Operations Quality

**Files:**
- Modify: `src/lib/db.ts` or Prisma adapter setup if pg warning is local-client related.
- Modify: `prisma/seed.ts` if demo reset is needed.
- Modify: `README.md` or docs if operational notes are needed.

- [ ] Investigate the `pg@9` deprecation warning with logs and dependency paths.
- [ ] Add a deterministic E2E data cleanup or isolation note if practical.
- [ ] Re-run full verification.
- [ ] Perform UI/UX browser review of key pages.
- [ ] Commit and push the complete slice set.
