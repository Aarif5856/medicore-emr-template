# MediCore EMR — Design Audit vs Premium Dashboard Design Skill

Read-only audit. No files were changed. Findings are grouped by section, then re-ranked by priority.

---

## 1. PASS list (rules currently satisfied)

- **No indigo/violet defaults**: zero `indigo-*`, `violet-*`, `purple-*`, `#6366f1` etc. anywhere in `src/`.
- **No gradient trust-headers**: no two-stop purple→blue/blue→cyan/indigo→pink gradients on headers or hero areas (only chart area `AreaChart` fills and a subtle dark-mode glow via `--shadow-glow`).
- **No emoji as icons in UI chrome**: all nav/button/heading slots use `lucide-react` monoline icons. (Emojis appear only inside mock chat message bodies in `src/data/messages.ts`, which is realistic user-generated content, not iconography.)
- **No round marketing numbers**: KPIs use organic values ("2,847", "$128,450", "+12.5%", "+8.2%"); no "99.9%", "10×", "1000".
- **No lorem/"Feature One"/"Sample" copy** anywhere in source.
- **No "John Doe" / "Jane Doe"** in demo data (only as a form placeholder — see FAIL below).
- **One accent color system**: sky-500 primary + teal `--accent-teal` as the sole secondary, defined once in `src/styles.css`; charts pull from `--chart-1..5`.
- **One radius system**: single `--radius: 0.625rem` scale with derived sm/md/lg/xl/2xl; no ad-hoc mixed radii found.
- **One theme per page**: no mid-page light→dark section flips; dark mode driven purely by `.dark` class.
- **One icon family**: exclusively `lucide-react` across all components.
- **Landmarks & semantic HTML**: `<nav aria-label="Breadcrumb">`, sidebar `<Sidebar>`, header `<header>` in `_app.tsx`, one `<h1>` per page via `PageHeader`.
- **Icon-only buttons in header/conversation-thread**: `aria-label` present on theme toggle, notifications, search, call/video/attach/more.
- **Layout formula**: sidebar 220–260px fixed + top bar ≤72px + KPI row + primary chart + secondary charts/tables — matches the admin dashboard canon on `/dashboard`.
- **Sidebar active state**: uses primary accent with a 3px left rail, not a full-tile fill (restrained).
- **Tabular numerals** applied on stats/tables via `.tabular` utility.
- **Body ≤ 65ch** default (no long-form prose surfaces).
- **RTL support**: honored via `direction` hook + `me-*/ms-*` logical utilities.

---

## 2. FAIL list (findings)

### Anti-AI-Slop — Cardinal Sins

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F1 | **No rounded-card + colored left-border accent** ("canonical AI dashboard tile") | `src/components/appointments/status-badge.tsx` (STATUS_STYLES `leftBorder` entries); consumed in `src/components/dashboard/appointments-list.tsx` and `src/components/appointments/appointments-list.tsx` where rows are rendered as rounded cards with `border-l-[color]`. Also `src/components/appointments/calendar-view.tsx:226` (event chips with `border-l-[3px]`). | Appointment rows are rounded cards **and** have a colored left border — the exact pattern the skill bans. Drop either the radius or the border. |
| F2 | **"John Doe"-style placeholders** | `src/components/doctors/add-doctor-dialog.tsx:134,147,175` ("Jane" / "Doe" / `jane.doe@medicore.io`) | Uses the canonical stock name in field placeholders. Swap for a realistic doctor example (e.g. "Aisha" / "Patel" / `a.patel@medicore.io`). |
| F3 | **Emoji-adjacent copy** (borderline) | `src/data/messages.ts:64,150,171,243` (🙏 🙌 👍 🌟) | Inside chat bubbles, so arguably realistic UGC — but reviewers scanning demo data may flag it. Consider removing for a cleaner marketplace impression. |

### Accent & Color Discipline

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F4 | **Accent ≤ 2 uses per screen** | `src/routes/_app.dashboard.tsx` + `src/components/dashboard/stat-card.tsx` | Dashboard uses primary (sky) accent on: sidebar rail, 2 of 4 KPI icons (primary tone), visits chart line, revenue chart series, doctor availability rows, plus `glow-primary` halos. Well above the "≤2 per screen" ceiling. Rebalance tones so accent appears on only the single most important element per screen. |
| F5 | **Semantic status colors used decoratively** | `src/components/dashboard/stat-card.tsx` (tone `warning` on Revenue KPI) | `warning` (amber) is being used as decoration for the Revenue tile even though revenue isn't a warning state. Use a neutral tone or the teal accent instead; reserve warning for actual alerts. |

### Layout Formula / Spacing

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F6 | **Don't border every section — whitespace first** | `src/components/dashboard/*` — every dashboard tile wraps in `<Card class="card-glass">` even for simple lists. | The dashboard uses a Card per bento cell (including the lightweight lists and demographics). Consider dropping enclosure on 1–2 secondary tiles for rhythm. |

### Five Required States

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F7 | **Every table/list needs Empty / Loading / Error states** | `src/components/patients/patients-table.tsx`, `staff/staff-table.tsx`, `laboratory/lab-tests-table.tsx`, `pharmacy/inventory-table.tsx`, `pharmacy/prescriptions-table.tsx`, `billing/invoices-table.tsx`, `appointments/appointments-list.tsx`, `dashboard/appointments-list.tsx`, `dashboard/lab-results-card.tsx`, `dashboard/doctor-availability.tsx` | Data always populated from static mocks; no Skeleton, no "No results" empty state, no error UI. Filtered-to-zero scenarios show a bare table body. Add explicit Empty (headline + CTA), Loading (skeleton matching shape), and Error states. Only `CommandEmpty` inside comboboxes and `EmptyResult` in `report-sheet.tsx` are handled. |
| F8 | **Forms — validate on blur, not first keystroke** | `src/components/doctors/add-doctor-dialog.tsx`, `staff/add-staff-dialog.tsx`, `billing/new-invoice-dialog.tsx`, `laboratory/new-order-dialog.tsx`, `appointments/booking-dialog.tsx`, `routes/_app.patients.new.tsx` | `react-hook-form` default `mode` is `onSubmit` — validation only shows after submit press. Skill wants blur-based feedback. Set `mode: "onBlur"` on the useForm calls. |

### Motion

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F9 | **Respect `prefers-reduced-motion`** | Global — no `motion-reduce:*` utilities or `@media (prefers-reduced-motion)` rules found. | Card hover translate/shadow, sparklines, glow transitions ignore the OS setting. Add `motion-reduce:transition-none motion-reduce:transform-none` to interactive tiles, or a global rule in `styles.css`. |

### Accessibility (WCAG 2.2 AA)

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F10 | **Icon-only buttons need `aria-label`** | Row-action "⋯" triggers in `patients-table.tsx:195`, `staff-table.tsx:182`, `laboratory/lab-tests-table.tsx:195`, `pharmacy/inventory-table.tsx:153`, `pharmacy/prescriptions-table.tsx:185`, `billing/invoices-table.tsx:222`, `appointments/appointments-list.tsx:180`; pagination arrows in same tables; `billing/new-invoice-dialog.tsx:350` remove-row button; `appointments/calendar-view.tsx:70,81` prev/next; `messages/conversation-thread.tsx:74` (emoji picker), `:201` (send). | Most row-action buttons use `sr-only "Open row actions"` (acceptable) but pagination arrows, calendar nav, emoji picker, and send button have neither `aria-label` nor visible text — screen-reader users hear an unlabeled button. |
| F11 | **Chart accessibility — text alternative** | `src/components/dashboard/visits-chart.tsx`, `department-chart.tsx`, `revenue-chart.tsx`, `demographics-card.tsx`, `stat-card.tsx` (sparkline) | SVG polylines have no `role="img"` + `aria-label` summary. Screen readers get nothing. Add a summary label like `aria-label="Monthly visits — Dec: 610 inpatient, 1,260 outpatient"`. |
| F12 | **`h-dvh` instead of `h-screen` on mobile** | `src/routes/__root.tsx:20,48`, `src/routes/_auth.tsx:9` (all use `min-h-screen`) | On mobile Safari address bar changes cut off content. Swap `min-h-screen` → `min-h-dvh`. |
| F13 | **Focus-visible ring on all interactive elements** | Sidebar rail links, custom `Link` items, calendar day cells — not verified to have a 3:1-contrast focus ring in dark mode. | Not confirmed one way or the other in this pass. Recommend a focused keyboard-only sweep. |

### Charts & Data

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F14 | **Chart data should look organic** | `src/data/dashboard.ts` `AGE_GROUPS` (18/32/28/22 = 100 exactly), `GENDER_SPLIT` (51/46/3 = 100 exactly), `DEPARTMENTS` (32/24/18/14/12 = 100) | Percentages are engineered to sum exactly to 100. Real demographics almost never do (rounding + "prefer not to say"). Nudge one or two by ±0.4% for realism. |

### Typography & Shape Locks

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F15 | **Zero em-dashes (—) in visible UI strings** | 25+ hits across `src/data/staff.ts` (schedule "—"), `src/data/dashboard.ts:198` (doctor hours "—"), `src/data/patient-detail.ts:97,99`, `src/data/invoices.ts:125,144,152,170` (invoice line descriptions like "Specialist Consultation — Cardiology"), `src/data/notifications.ts:42,170`, `src/routes/__root.tsx:83,87,90`, every page-title meta in `src/routes/_app.*.tsx` ("Dashboard — MediCore EMR"), `routes/_app.messages.tsx:117`, `routes/_app.doctors.tsx:115`, `components/laboratory/upload-result-dialog.tsx:95,135,158`, `components/staff/add-staff-dialog.tsx:469`, `components/billing/invoice-sheet.tsx:239`, `components/staff/profile-sheet.tsx:159,165`, `components/pharmacy/prescriptions-table.tsx:155`, `components/laboratory/report-sheet.tsx:94`, `components/doctors/profile-sheet.tsx:236`. | Skill: use period, comma, or hyphen. Replace `—` with `·` (middle dot) in titles and with `-` or `—`→"—" style safe punctuation elsewhere. Placeholder `"—"` in table cells → `"–"` (en-dash) is also disallowed; use `"—"` still counts. Replace with `"-"` or `"None"`. |

### Soul Formula & Microcopy

| # | Rule | File(s) | Problem |
|---|---|---|---|
| F16 | **Voice in microcopy** (nice-to-have) | e.g. empty combobox strings "No patient found." / "No test found." | Fine but flat. Skill suggests punchier voice ("No matching patients — try a different name"). Not blocking. |

---

## 3. Priority ranking

### P0 — must fix before marketplace submission
- **F1** Rounded cards + colored left borders (appointment rows, calendar event chips) — canonical AI-slop tell.
- **F7** Missing Empty / Loading / Error states across every table and list — skill explicitly calls this "the #1 AI-design failure".
- **F15** Em-dashes throughout visible UI strings (route titles, invoice line items, staff schedules) — explicit skill ban.
- **F10** Unlabeled icon buttons (pagination arrows, calendar nav, send, emoji picker) — WCAG 2.2 blocker.
- **F12** `min-h-screen` on auth + root shells — visible mobile clipping.

### P1 — should fix
- **F4** Accent overuse on dashboard (multiple primary-tone KPIs + charts + rail).
- **F2** "Jane Doe" placeholder in Add Doctor dialog.
- **F5** Amber `warning` tone used decoratively on Revenue KPI.
- **F8** Forms validate on submit only (blur validation is skill baseline).
- **F11** Chart aria/text alternatives missing.
- **F9** No `prefers-reduced-motion` handling.

### P2 — polish
- **F3** Emoji inside seeded chat message bodies.
- **F6** Every dashboard tile enclosed in a Card (whitespace-first).
- **F13** Focus-visible ring audit (keyboard sweep).
- **F14** Demographics/department percentages sum exactly to 100.
- **F16** Sharper microcopy in empty combobox strings.

---

## 4. Fix effort estimate

| ID | Effort | Notes |
|---|---|---|
| F1 | **Small** | Remove `border-l-*` from status style presets and calendar event chip; keep the dot / chip color. |
| F2 | **Small** | 3 string edits in one dialog. |
| F3 | **Small** | Delete 4 emoji from `data/messages.ts`. |
| F4 | **Medium** | Requires design decision: which single KPI keeps primary tone; retone charts to neutral. |
| F5 | **Small** | Change `tone: "warning"` → `"teal"` or `"primary"`. |
| F6 | **Medium** | Redesign 1–2 dashboard tiles to drop the Card wrapper without breaking bento rhythm. |
| F7 | **Large** | Add Skeleton + Empty + Error components; wire per-table isLoading/isError states (currently no async layer — needs a fake loader or a real one) across 10 tables. |
| F8 | **Small** | Add `mode: "onBlur"` to each `useForm` call (≈6 files). |
| F9 | **Small** | Global `@media (prefers-reduced-motion: reduce)` rule in `styles.css` disabling transitions and `translate`. |
| F10 | **Small** | Add `aria-label` to ~15 icon buttons. |
| F11 | **Medium** | Wrap each chart in a `<figure>` with `<figcaption class="sr-only">` summary computed from data. |
| F12 | **Small** | `min-h-screen` → `min-h-dvh` in 3 files. |
| F13 | **Medium** | Keyboard sweep + `focus-visible` ring additions. |
| F14 | **Small** | Tweak 3 numbers. |
| F15 | **Medium** | ~50 string edits across data + routes; mechanical but wide surface. |
| F16 | **Small** | Rewrite ~4 empty-state strings. |

---

## Suggested next step

If you approve, I can execute fixes in this order: **P0 batch** (F1, F12, F15, F10, then F7) → **P1 batch** → **P2 batch**, each as its own commit-sized change with a screenshot check. Approve this plan to enter build mode and start with the P0 batch, or tell me to scope it differently (e.g. "P0 only").
