# CustomerFlow UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved first UI mockup direction to the current CustomerFlow app without changing backend behavior.

**Architecture:** Refresh shared design tokens and reusable UI primitives first, then update the app shell, auth screens, dashboard, and customer screens to inherit the same polished SaaS admin style. Keep customer CRUD, Auth.js session behavior, Supabase/Prisma access, and tenant isolation unchanged.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, lucide-react, Prisma, Auth.js, Vitest, Playwright.

## Global Constraints

- Visual baseline: first generated CustomerFlow SaaS admin mockup.
- Background: cool off-white app background, white content surfaces.
- Text: slate/charcoal hierarchy with clear heading, body, and muted states.
- Primary: teal for primary actions, selected navigation, and active accents.
- Secondary accents: subtle blue, amber, rose, and green for statuses only.
- Borders: thin, low-contrast borders; avoid heavy shadow styling.
- Radius: 8px or less for cards, inputs, buttons, and panels.
- Density: compact but readable admin density.
- No backend schema or API behavior changes.
- No decorative orbs, bokeh, hero sections, stock images, illustrations, oversized marketing typography, or cards inside cards.
- Required checks: `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`.

---

## File Structure

- Modify `src/app/globals.css`: design tokens, body background, reusable utility classes for select/textarea if needed.
- Modify `src/components/ui/button.tsx`: primary, outline, ghost, danger-compatible variants with stable icon spacing.
- Modify `src/components/ui/input.tsx`: consistent focus, placeholder, disabled styling.
- Modify `src/components/ui/badge.tsx`: add status-aware variants while preserving existing default usage.
- Modify `src/components/ui/card.tsx`: reduce visual weight and align surfaces with the reference mockup.
- Modify `src/components/layout/app-shell.tsx`: page background, content width, shell spacing.
- Modify `src/components/layout/app-sidebar.tsx`: selected-looking SaaS sidebar, MVP navigation only.
- Modify `src/components/layout/app-header.tsx`: polished search/header/user/notification area.
- Modify `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`: modern auth layout without marketing hero.
- Modify `src/app/(app)/dashboard/page.tsx`: cockpit layout with CTA row, KPI cards, task panels.
- Modify `src/app/(app)/customers/page.tsx`: table-first customer page matching the reference.
- Modify `src/app/(app)/customers/new/page.tsx`, `src/app/(app)/customers/new/customer-form.tsx`: form surface polish.
- Modify `src/app/(app)/customers/[id]/page.tsx`, `src/app/(app)/customers/[id]/customer-edit-form.tsx`: detail/edit polish.
- Modify `e2e/phase-one.spec.ts` only if accessible labels or button names change.

---

### Task 1: Shared Design Tokens And UI Primitives

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/card.tsx`

**Interfaces:**
- Consumes: existing `Button`, `Input`, `Badge`, `Card` imports.
- Produces: same component names and props, plus optional `Badge` variants.

- [ ] **Step 1: Run current UI-related tests**

Run: `npm test`
Expected: PASS before UI-only edits.

- [ ] **Step 2: Update design tokens**

Set CSS variables in `globals.css` for app background, card surface, border, muted text, teal primary, focus ring, and destructive color.

- [ ] **Step 3: Update primitives without breaking imports**

Keep these public APIs:

```ts
export function Button(props: ButtonProps): JSX.Element;
export function Input(props: InputProps): JSX.Element;
export function Badge(props: BadgeProps): JSX.Element;
export function Card(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
```

- [ ] **Step 4: Verify**

Run: `npm test && npm run lint`
Expected: PASS.

---

### Task 2: App Shell Refresh

**Files:**
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/app-header.tsx`

**Interfaces:**
- Consumes: `AppShell({ children, userName })`, `AppSidebar()`, `AppHeader({ userName })`.
- Produces: same exports with refreshed visual structure.

- [ ] **Step 1: Preserve navigation labels**

Keep visible MVP labels: `대시보드`, `고객`, `상담`, `예약`, `후속관리`, `알림`, `설정`.

- [ ] **Step 2: Refresh sidebar**

Use a fixed desktop sidebar, teal selected affordance for current-looking navigation, restrained borders, and no P2 menu items.

- [ ] **Step 3: Refresh header**

Use global search, compact notification icon, user avatar initials, and logout action. Keep `aria-label="고객 또는 전화번호 검색"`.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: PASS.

---

### Task 3: Auth And Dashboard Screens

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: existing `LoginForm`, `RegisterForm`.
- Produces: same routes `/login`, `/register`, `/dashboard`.

- [ ] **Step 1: Refresh auth pages**

Keep headings `CustomerFlow 로그인` and `CustomerFlow 회원가입`. Use centered white auth panel on cool app background.

- [ ] **Step 2: Refresh dashboard**

Add top CTA row, compact KPI cards, today schedule panel, follow-up panel, and recent customers/activity surfaces with static Phase UI content only.

- [ ] **Step 3: Verify auth E2E labels**

Run: `npm run test:e2e -- --grep "login page|register page|dashboard redirects|seed owner"`
Expected: PASS.

---

### Task 4: Customer Screens Refresh

**Files:**
- Modify: `src/app/(app)/customers/page.tsx`
- Modify: `src/app/(app)/customers/new/page.tsx`
- Modify: `src/app/(app)/customers/new/customer-form.tsx`
- Modify: `src/app/(app)/customers/[id]/page.tsx`
- Modify: `src/app/(app)/customers/[id]/customer-edit-form.tsx`

**Interfaces:**
- Consumes: existing customer server actions and service functions.
- Produces: same routes `/customers`, `/customers/new`, `/customers/[id]`.

- [ ] **Step 1: Refresh customer list**

Add KPI summary strip, stronger search/filter bar, table polish, and readable empty state. Keep the `고객 추가`, `이름/전화번호 검색`, status filter, and table links.

- [ ] **Step 2: Refresh customer forms**

Use consistent labels, input spacing, select styling, textarea styling, and action buttons. Keep labels used by E2E: `고객명`, `전화번호`, `이메일`, `저장`, `변경 저장`, `고객 삭제`.

- [ ] **Step 3: Refresh customer detail**

Create clear identity summary, contact info panel, timeline area, and edit panel without nesting cards inside cards.

- [ ] **Step 4: Verify customer E2E**

Run: `npm run test:e2e -- --grep "customer"`
Expected: PASS.

---

### Task 5: Full Verification And Commit

**Files:**
- Modify only files touched in Tasks 1-4.

**Interfaces:**
- Produces: verified UI refresh commit on `main`.

- [ ] **Step 1: Run full checks**

Run:

```bash
npm test
npx prisma validate
npm run lint
npm run build
npm run test:e2e
```

Expected: all PASS.

- [ ] **Step 2: Start dev server and smoke check**

Run:

```bash
npm run dev
```

Smoke check:

- `http://127.0.0.1:3000/login`
- `http://127.0.0.1:3000/dashboard`
- `http://127.0.0.1:3000/customers`
- `http://127.0.0.1:3000/customers/new`

- [ ] **Step 3: Commit and push**

Run:

```bash
git add src/app src/components e2e/phase-one.spec.ts docs/superpowers/plans/2026-08-13-ui-refresh-implementation.md
git commit -m "style: refresh customerflow admin ui"
git push origin main
```

Expected: pushed to `origin/main`.
