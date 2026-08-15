# CustomerFlow Premium CRM UI Rules

## Direction

CustomerFlow will use a hybrid visual direction:

- Base quality and layout discipline from Option B, the premium CRM mockup.
- Practical workflow language and direct action affordances from Option C, the Korean small-business operations mockup.
- The product should feel like a polished SaaS CRM that a small business owner or staff member can understand without training.

The UI is an operations console, not a marketing site. The first screen should help users answer:

- What needs attention today?
- Which customer should I act on next?
- How do I create a customer, consultation, reservation, or follow-up quickly?

## Visual Principles

1. Premium, not decorative.
   Use polish through alignment, type scale, spacing, borders, and state clarity. Do not use hero sections, decorative blobs, image backgrounds, or fake visual spectacle inside the product UI.

2. Table-first operations.
   Customer lists and work queues are primary surfaces. Tables should be readable, calm, and action-oriented.

3. One strong primary action per screen cluster.
   Each major header area can have one filled teal primary action. Secondary actions use outline or ghost styles.

4. Explicit Korean workflow language.
   Prefer direct labels such as `고객 추가`, `상담 등록`, `예약 등록`, `후속관리 등록`, `전화하기`, `문자`, `오늘 예약`, `후속 연락 필요`.

5. Compact but breathable.
   Keep admin density high enough for repeated daily use, but preserve generous gutters and row spacing so the UI feels designed.

## Palette

Use CSS variables in `src/app/globals.css` as the design source.

- App background: `#f6f8f7`, a cool off-white.
- Subtle background band: `#eef6f4`, used sparingly for selected nav and calm highlights.
- Surface: `#ffffff`.
- Raised surface: `#fbfefd`.
- Text strong: `#0f172a`.
- Text body: `#334155`.
- Text muted: `#64748b`.
- Border: `#d8e3df`.
- Strong border: `#bed2cc`.
- Primary teal: `#006f6a`.
- Primary hover: `#005f5b`.
- Primary soft: `#e4f5f2`.
- Focus ring: `#0f9488`.

Status accents:

- New/info: blue.
- Consulting/default: teal.
- Reservation/warning: amber.
- Completed/success: emerald.
- Dormant/neutral: slate.
- Cancelled/danger: rose.

Avoid:

- Purple or blue AI gradients.
- Beige, brown, espresso, or luxury tan dominance.
- Heavy navy dashboards.
- A one-note teal-only interface.

## Typography

- Use the existing system sans stack.
- Use slate/charcoal text hierarchy rather than black everywhere.
- Page titles: `text-2xl` to `text-3xl`, `font-semibold`, `tracking-tight`.
- Section titles: `text-sm` to `text-base`, `font-semibold`.
- Table text: `text-sm`, medium only for names or primary values.
- Labels: `text-xs` or `text-sm`, `font-medium` or `font-semibold`, muted color.
- Do not use negative letter spacing. Tailwind `tracking-tight` is allowed only for page-level headings already using it.
- Avoid oversized marketing copy in app screens.

## Layout

### App Shell

- Desktop sidebar width: around `16rem`.
- Sidebar is white with a right border.
- Main background uses cool off-white.
- Header is white, fixed-height, with bottom border.
- Main content uses `px-4` on mobile, `px-6` to `px-8` desktop, and a readable max width.
- Avoid cards inside cards. Use cards for independent panels only.

### Header

- Search is the leading object in the header.
- Search should feel like a command bar: rounded 8px or less, subtle border, icon inside.
- Notification icon is compact and bordered.
- User block is compact with initials, name, and role.
- Logout remains present but visually secondary.

### Sidebar

- Brand mark is compact and confident.
- Active navigation uses deep teal fill or soft teal surface with a clear left/start affordance.
- MVP navigation only:
  - `대시보드`
  - `고객`
  - `상담`
  - `예약`
  - `후속관리`
  - `태그`
  - `알림`
  - `설정`
- P2 items such as marketing, statistics, automation, billing, AI, and import/export must not appear as primary navigation.

### Dashboard

- Top header copy should say what the user can do today.
- CTA row should prioritize:
  - `고객 추가`
  - `상담 등록`
  - optionally `예약 등록`
- KPI cards should be horizontal rhythm, clear icons, and minimal microcopy.
- The strongest operational area should be a task queue or today flow, not generic charts.
- Right-side panels are allowed on wide screens, but should collapse naturally on mobile.

### Customers

- Customer list is the product's primary daily work screen.
- Search/filter area should be clearly connected to the table.
- Desktop table needs strong row scan:
  - customer name
  - phone
  - status
  - latest contact
  - tags
  - quick actions where practical
- Mobile list uses repeated cards, one card per customer, with no nested inner cards.
- Empty state should be calm and action-oriented.

### Workflow Lists

- Consultation, reservation, and follow-up lists should follow the same structure as the customer list:
  - premium white page header surface
  - Korean operational badge
  - `text-3xl` page heading
  - compact KPI strip
  - bordered filter bar
  - table card with a list title, total count, and active status badge
- Keep the existing route headings `상담`, `예약`, and `후속관리` for E2E and user recognition.
- Use list subtitles such as `상담 목록`, `예약 목록`, and `후속관리 목록` inside the table card.
- Desktop table headers should use the shared pale surface background and no uppercase styling.
- Hover states should use `--primary-soft` or primary text, not hardcoded teal utility colors.
- Mobile workflow cards should use the same border-first, light-shadow treatment as customer cards.
- Preserve existing workflow actions:
  - consultation detail, reservation creation, follow-up creation
  - reservation progress/completion/cancellation
  - follow-up completion/cancellation

### Workflow Forms And Detail

- Consultation, reservation, and follow-up create screens should use the same compact work-form structure:
  - premium white page header surface
  - Korean operational badge such as `상담 업무`, `예약 업무`, or `후속관리 업무`
  - `text-3xl` page heading
  - one bordered form card with a divided card header
- Keep route headings and form labels stable:
  - `상담 등록`, `예약 등록`, `후속관리 등록`
  - `상담 내용`, `상담 결과`, `다음 액션`
  - `예약명`, `시작`, `종료`, `장소`, `메모`
  - `할 일`, `마감`, `상담 ID`, `상태`
- Form submit areas should be separated with a top border and include a short operational helper sentence plus the single primary `저장` action.
- Detail screens should use the same structure across workflow types:
  - white summary header with back link, Korean workflow badge, title, explanatory copy, and visible customer/action links
  - main record card with bordered summary chips using `--surface-subtle`
  - right-side update card with a divided card header and one full-width `변경 저장` action
- Use `form-input`, `form-select`, and `form-textarea` instead of repeated ad hoc input class strings.
- Hover and primary button states should use CSS variables such as `--primary`, `--primary-hover`, and `--surface-subtle`, not hardcoded teal utility colors.

### Customer Detail

- Top area is an identity summary:
  - name
  - phone
  - status
  - important tags
  - primary next action
- Action buttons must be immediately visible:
  - 상담 등록
  - 예약 등록
  - 후속관리 등록
- Timeline and edit form should be separate surfaces.
- Do not hide important workflow actions below long metadata.

## Components

### Buttons

- Radius: `0.5rem` maximum.
- Primary:
  - deep teal fill
  - white text
  - subtle shadow
  - used once per major cluster
- Outline:
  - white background
  - calm border
  - slate text
  - used for secondary work actions
- Ghost:
  - transparent
  - muted slate
  - used for low-priority controls
- Icon spacing should be stable with `gap-2`.

### Inputs And Selects

- Height: `2.5rem` for normal controls.
- Radius: `0.5rem`.
- Border: calm gray-green.
- Focus: teal border plus subtle teal ring.
- Placeholder: muted slate.
- Disabled: pale slate background.

### Cards And Panels

- Radius: `0.5rem`.
- Border-first, shadow-light.
- Card padding usually `1rem` to `1.25rem`.
- Avoid nested cards. Use dividers and whitespace inside a card instead.
- For dense tables, card content can be `p-0` and the table provides structure.

### Badges

- Small rectangular badges with subtle ring.
- Use status color only for status semantics.
- Avoid decorative badges that do not help decisions.

### Tables

- Header background: very light surface, not dark.
- Row height: enough for phone/status scan.
- Hover: very soft teal.
- Text: names strong, secondary values muted.
- Avoid all-caps Korean table labels.

## Responsive Rules

- No control text may overflow buttons.
- Buttons stack on mobile when the row would become cramped.
- Customer tables become cards on mobile.
- Right-side panels move below the main content on tablet/mobile.
- Header search remains usable on mobile; user block may hide but notification and logout stay reachable.

## Interaction Rules

- Keep all current backend behavior unchanged.
- Preserve route labels and accessible labels used by tests:
  - `고객 또는 전화번호 검색`
  - `고객명`
  - `전화번호`
  - `이메일`
  - `저장`
  - `변경 저장`
  - `고객 삭제`
  - `상담 상세`
  - `예약 상세`
  - `후속관리 상세`
- Do not introduce new schema fields for the UI refresh.
- Do not expose inactive P2 controls.

## Reference Images

- Option B premium CRM reference:
  `C:\Users\82106\.codex\generated_images\01a0000f-7545-7c81-8cfd-d11eeba925cc\call_BbHRjysYj5LNZMrFZgHuevIP.png`
- Option C practical Korean operations reference:
  `C:\Users\82106\.codex\generated_images\01a0000f-7545-7c81-8cfd-d11eeba925cc\call_RLdXJjuaD32oL5UvjGhtaMKm.png`

## Acceptance Criteria

- Current tests, lint, build, and E2E pass.
- `/dashboard`, `/customers`, `/customers/new`, and `/customers/[id]` visibly follow the hybrid direction.
- `/consultations`, `/reservations`, `/follow-ups`, and their create/detail screens visibly follow the same workflow UI direction.
- The app looks like one coherent product, not a set of individually styled pages.
- There are no decorative blobs, no nested card stacks, no marketing hero sections, and no inactive P2 primary navigation.
- Desktop and mobile views remain readable with no overlapping text or controls.
