# AOM Online Madrasa — Dashboard Overhaul Progress

Full plan: `C:\Users\User\.claude\plans\sorted-tinkering-pnueli.md`

Scope: Super Admin / Teacher / Guardian dashboards only. Public site (Home/About/Contact/Admission) untouched.

Legend: ✅ Done · 🔄 In progress · ⬜ Not started · ⏸️ Deferred (needs client input, e.g. real SMTP/WhatsApp creds)

## Backend (`aomOnline_server`)

- ✅ Shared `createUserAccount()` helper (user module) — reused by teacher + student/guardian creation
- ✅ Student: `teacherPayoutAmount` field (per-student teacher payout, separate from `monthlyFee`)
- ✅ Student: optional guardian account creation (`guardianEmail`/`guardianPassword`) on create/update, linked via `userRef`
- ✅ Teacher salary calc rewritten: sum of `teacherPayoutAmount` across assigned students (falls back to `ratePerStudent` per-student if unset — no migration needed)
- ✅ Class/category promotion endpoint (`PATCH /progress/student/:id/promote`) — moves to next `Class` by `order`, resets `Progress`, notifies guardian
- ✅ Payment: `pending` status + `transactionId`/`bankInfo`/review fields
- ✅ Payment: `POST /payments/submit` (guardian), `PATCH /payments/:id/approve`, `PATCH /payments/:id/reject` (admin), `GET /payments/pending` (admin review list)
- ✅ Payment: teacher-facing reads (`GET /payments/teacher/:teacherId`, now teacher-accessible + self-scoped) stripped of transactionId/bankInfo/rejectionReason
- ✅ Notification: `POST /notifications/broadcast` (admin, all/selected guardians, `insertMany`)
- ⏸️ Email sending — stub only (`console.log`), needs real SMTP creds from client later (`.env` keys already scaffolded)
- ⏸️ WhatsApp sending — stub only (`console.log`), needs real WhatsApp API creds from client later (`.env` keys already scaffolded)
- ✅ `PATCH /api/user/me` — self profile update, per-role field whitelist
- ✅ Teacher self password-change blocked server-side (403) — only Super Admin resets teacher passwords

**Backend is fully implemented and verified end-to-end via live API calls** (create student+guardian, assign+payout, salary sum, guardian submit payment, admin approve, class promotion, broadcast, teacher self-scoping, permission whitelists all tested against the running dev server on 2026-07-09). `npx tsc --noEmit` is clean.

## Frontend (`aomOnline_client`)

- ✅ shadcn/ui installed at `src/components/shadcn/` (kept separate from `src/components/ui/` to avoid clobbering marketing-page-shared components — Windows filesystem is case-insensitive, `Button.jsx` vs `button.jsx` would have collided)
- ✅ Brand colors mapped: shadcn's `--primary`/`--secondary`/`--accent`/`--border`/`--ring`/`--sidebar-*` tokens now resolve to the existing teal/green/gold palette instead of shadcn defaults; original `--radius-*` scale explicitly re-asserted after shadcn's block so existing `rounded-[var(--radius-lg)]` usages are unaffected
- ✅ `src/lib/apiClient.js` shared fetch wrapper (get/post/patch/delete, auth headers, JSON parsing, consistent error shape)
- ✅ Global toast (sonner) — `<Toaster>` mounted in `(dashboardLayout)/layout.jsx`, dashboard-only
- ✅ Animated Duolingo-style progress component (`src/components/shared/ProgressPath.jsx`, framer-motion spring fill + confetti burst on completion) — single component, `editable` prop switches between teacher (tap-a-step + promote CTA) and guardian (read-only celebratory) — will do a full visual check once wired into Teacher/Guardian pages
- ✅ Super Admin: Teachers menu rebuilt as card list (photo/salary/count/View Details) — this was previously misplaced under "Payments" menu, moved to match the client's reference design exactly
- ✅ Super Admin: Teacher detail page (student roster + payment toggle, handles paid/unpaid/pending) — student rows now link to a new Student Detail page
- ✅ Super Admin: new Student Detail page — profile + animated ProgressPath (read-only) + attendance summary, reachable from Teacher detail AND Students list
- ✅ Super Admin: assign-student form (StudentFormModal) gets payout amount + guardian account fields
- ✅ Super Admin: Payments menu simplified to pending-claim review only (approve/reject) — no longer duplicates the Teachers list
- ✅ Super Admin: notification broadcast composer (all / selected guardians), new Notifications nav item
- Verified end-to-end live in browser: Teachers → Teacher Detail → Student Detail → Notifications broadcast, no console errors, network calls all 200
- 🔄 Teacher: attendance UI unchanged (functional, not yet visually redesigned — deferred, not flagged as broken); progress UI fully rebuilt on ProgressPath
- ✅ Teacher: promote-to-next-class action wired + verified live (percentage tap-to-set, 100% celebration, promote CTA correctly hidden at the top class)
- ✅ Teacher: payment view is read-only (`/payments/my-students`, new self-resolving endpoint), no guardian contact info shown
- ✅ Teacher: settings page — photo only, no password field, verified live
- ✅ Guardian: new dashboard (`dashboard/guardian`) — profile card, animated ProgressPath (read-only), attendance calendar+summary, materials, payment status widget. Old `dashboard/student` route left in place (dormant `student` role only, unused now that guardian has its own)
- ✅ Guardian: payment submission UI (transaction ID / bank info) — verified live (submit → pending → shown with transaction ID)
- ✅ Guardian: settings page — profile + password editable (verified live, login with new password succeeded), email/phone locked read-only
- ✅ `getRoleHome()` updated: `parent` → `/dashboard/guardian`; backend `getMyDashboard` extended with current-month `payment` status so Guardian dashboard needs one call
- ✅ Notification bell: sound cue on new notification (Web Audio API two-tone chime, no external asset; unlocks on first click/keypress per browser autoplay policy; compares newest notification id across 60s polls, skips the first load so it doesn't chime on page open)
- ✅ Final responsive + visual QA pass — Teachers list, Guardian dashboard, Notification broadcast all checked at mobile width (375px) and desktop (1280px), no layout overflow, no console errors
- ✅ Full-repo `eslint` sweep run — only 8 pre-existing issues remain, all in files untouched this session (marketing pages, `ClassFormModal.jsx`, `SettingsManager.jsx`, `AdmissionForm.jsx`, auth pages) — not introduced by this work, left as-is (out of scope)
- ✅ Stale copy fixed on `dashboard/admin/payments/page.jsx` (description still referenced teacher salary after that content moved to Teachers)

## Notes / decisions made along the way
- Progress promotion resets in-place (no history collection kept) — simplest approach per plan.
- Progress path is a redesigned linear layout (not a winding SVG path) — same motivational effect, much less effort.
- `Teacher.ratePerStudent` kept as a form pre-fill default only; actual salary now sums per-student payout.
- Mid-build correction: the Teachers-list-with-salary-cards design (client's reference image) was initially built under the "Payments" nav item — client flagged this as wrong ("payment a teacher kno??"). Moved it to the Teachers menu where it belongs; Payments menu now only holds the guardian-payment-claim review queue. New Student Detail page (profile + animated progress + attendance) added and linked from both the Teacher roster and the Students list.
- Old `dashboard/student` route/components (`src/components/Student/*`) were left in place rather than deleted — the `student` role is dormant per the client's requirements (children never log in), but removing dead code wasn't asked for and the Guardian dashboard reuses several of those components (`StudentAttendance`, `StudentAttendanceSummary`, `StudentMaterials`, `StudentProfileCard`) directly, so the folder is still load-bearing.

## What's left / open items for the client
1. **Email/WhatsApp credentials** — provide SMTP host/user/pass (+ `EMAIL_FROM`) and/or WhatsApp Cloud API token + phone number ID whenever ready; drop them into `aomOnline_server/.env` using the keys already scaffolded in `.env.example`. No code changes needed — `notifyChannels.ts` will start sending for real instead of logging.
2. **Teacher attendance pages** — left functionally as-is (daily marking + monthly summary both still work), not restyled to the new shadcn look. Flag if this should be done too.
3. Everything else in this checklist is implemented and was verified live against the running dev servers this session.

## Round 2 — Admin design polish (client feedback: too plain / not compact / not shadcn enough)
Scope for this round was **Admin dashboard only** — Teacher/Guardian dashboards untouched this round.

- ✅ `/dashboard/admin` — rebuilt on shadcn `Card`/`CardHeader`/`CardTitle`, tighter gaps (`gap-3`/`p-4` instead of `gap-6`/`p-6`), `shadow-none` + subtle ring instead of heavy `shadow-soft`
- ✅ `/dashboard/admin/teachers` — same compacting pass, row actions moved into a `DropdownMenu` (⋯) instead of inline Edit/Delete buttons
- ✅ `/dashboard/admin/payments` — rebuilt around the **same hand-rolled `<table>` pattern as `/dashboard/admin/classes`** (client confirmed that page's table design is the gold standard — header tint `bg-primary-50/50`, row `hover:bg-primary-50/30`, `px-4 py-3` cells) rather than a plain shadcn `Table`. Approve/Reject is a `Select` in the Action column (not separate buttons), styled to match the row's visual weight. Removed emoji (✅/❌) from the Select items after client feedback that they rendered as clunky colored-box icons — plain text now, reject styled in destructive red.
  - Bug found + fixed during this round: two stale **orphaned Payment records** (`studentRef: null`, left over from earlier test cleanup where the Student was deleted but its Payment record wasn't) were rendering as "Unknown student" in this table. Cleared via the reject endpoint; real linked test data (2 students with submitted claims) added back for ongoing testing.
- ✅ `/dashboard/admin/settings` — same shadcn `Card` treatment, `gap-3` instead of `gap-6`, `Textarea`/`Label` from shadcn
- ✅ `/dashboard/admin/teachers/[teacherId]` — full rebuild matching the client's reference screenshot closely: back-link / centered "Teacher Profile" title / ⋯ menu (now wired to real Edit + Delete, previously this page had no edit/delete at all) top bar; profile card with 2 stat tiles + paid/unpaid segmented bar; searchable/filterable student table (same gold-standard table pattern) with a payment toggle per row; 4 summary tiles; info tip
- ✅ `/dashboard/admin/students` — same table pattern kept (it already matched the approved style), tightened the filter-bar spacing; **fixed Bangla class names** — `Class.name` (Bangla, required field) was showing in the Class column/filter/form dropdown instead of `Class.nameEn`. Fixed at the source: `student.service.ts` (`getAllStudents`/`getStudentById`) and `progress.service.ts` (`getClassMilestones`, `getMyStudents`, `promoteStudentClass`) now populate/return `nameEn` preferentially — this also fixes the class name shown in `ProgressPath` across Teacher/Guardian views, not just Admin (same shared field, would have been inconsistent otherwise). `ClassesManager.jsx` itself is untouched — it already shows Bangla name + English `nameEn` subtitle side by side, which the client approved as-is.
  - Also added `autoComplete="off"` / `autoComplete="new-password"` to the guardian email/password fields in `StudentFormModal` — Chrome was autofilling them with saved credentials (visible as a highlighted/prefilled field in the client's screenshot), which is now suppressed.
- ✅ `ProgressPath.jsx` (shared component — used on Student Detail, Teacher's progress page, and Guardian dashboard) — made bigger and more animated: step circles `h-11`→`h-16`, each of the 6 steps now cycles through a distinct brand color (teal/green/gold) instead of one flat color, a pulsing "you are here" ring on the furthest-reached step, staggered entrance animation on mount, bigger confetti burst (16 particles) and a bigger congratulations banner with a wiggling sparkle icon. Animation repeat counts are bounded (not `Infinity`) — confirmed an unbounded-repeat animation was hanging the screenshot tool's "wait for stable" heuristic during testing, fixed by capping repeats.
- Verified live for both a mid-progress state (60%, colored steps + pulse ring) and 100%-complete state (all steps filled, trophy gold, congratulations banner) — screenshots confirmed, no console errors.

## Round 3 — Payments page behavior fix (client feedback: rows disappearing after action)
- ✅ Fixed: approving/rejecting a guardian payment used to remove it from the list (`GET /payments/pending` only ever queried `status: 'pending'`). Client wants rows to **stay in the table permanently** — clicking Complete/Reject just updates that row's status badge in place, same as `/dashboard/admin/classes`' table never removes a class when you edit it.
  - Backend: `payment.service.ts`'s pending-list query broadened from `{status:'pending'}` to `{submittedBy: {$ne: null}}` — i.e. it now returns every guardian-submitted claim regardless of current status (route/controller name `getPendingPayments`/`/payments/pending` left unchanged to avoid churn, only the underlying query changed).
  - Frontend: 3 status states shown as badges — **Pending** (red), **Complete** (green), **Rejected** (gray) — with Complete/Reject buttons only shown while still Pending; resolved rows just show "—" in the Action column and stay visible.
  - Bug found + fixed while testing this: a rejection with a **blank reason** doesn't get a `rejectionReason` saved (optional field), so status can't be inferred from "has a rejection reason" — switched the Rejected/Pending distinction to check `reviewedBy` (set by both approve and reject) instead. Confirmed working by rejecting a claim with no reason text and verifying it still shows "Rejected", not "Pending", after a full page reload.
  - Also cleaned up 3 more leftover orphaned Payment records (from earlier in this session's testing) directly via a one-off script, since there's no delete endpoint for payments and they'd have otherwise shown as "Unknown student" rows now that the list includes all-time submissions, not just current-pending ones.

## Round 4 — Payments table interaction polish (client feedback: 2 buttons too heavy, status shouldn't stay editable after resolving, modals plain)
- ✅ Replaced the two Complete/Reject buttons with a single **Status column that IS the control**: while Pending, it's a colored dropdown (orange, click → Complete or Reject); Amount/Submitted-Info columns dropped from the table to make room — that detail moved into a new **eye-icon "View Details" action** instead, keeping the row itself compact.
- ✅ Fixed a real bug the client caught: after resolving a claim, the status dropdown could still be reopened and re-fired (Complete ⇄ Reject after the fact) — `disabled` on the Radix `Select` wasn't enough on its own. Fixed by not rendering a `Select` at all once resolved — just a plain static colored `<span>` pill, so there is no dropdown left to open, matching "pending theke complete/reject hole ar dropdown e rakba na" literally.
- ✅ 3-color system finalized: **Pending = orange** (`accent` tone), **Complete = green** (`secondary` tone), **Rejected = red** (`danger` tone) — was briefly red for Pending, corrected per client's explicit color spec.
- ✅ Polished both dialogs: Reject dialog now has a warning-triangle icon in a red circle + labeled reason field; the new Details dialog has a document icon header, an avatar+name+status summary block, and clean label/value rows (Teacher, Period, Amount, Transaction ID, Bank Info, Submitted At, Reviewed At, Rejection Reason when present).
- Verified live: dropdown only appears while Pending, locks to a static pill after Complete or Reject (confirmed via reload — not just optimistic UI), eye icon opens the new details modal correctly for both resolved and pending rows.

## Round 5 — Collection Trend chart (client feedback: chart box rendered empty/ugly)
- ✅ Installed shadcn's `chart` primitive (`npx shadcn add chart` → `src/components/shadcn/chart.jsx`, pulls in `recharts`) — the old hand-rolled `BarChart` in `DashboardCharts.jsx` had a CSS bug (percentage-height bar wrapped in a `flex-1` div inside an `items-end` flex column with no defined height, so bars collapsed to ~0px) which is why it rendered as an empty box on `/dashboard/admin`.
- ✅ Added `CollectionAreaChart` (`DashboardCharts.jsx`) — recharts `AreaChart` wrapped in shadcn's `ChartContainer`/`ChartTooltip`/`ChartTooltipContent`: smooth `monotone` curve, solid semi-transparent brand-teal fill (flat color + opacity, **not** a CSS gradient, per the standing "no gradients" rule), minimal axis (no Y-axis, dashed horizontal gridlines only), themed tooltip, "Trending up/down X% this month" caption with an arrow icon underneath — matches the shadcn Area Chart reference the client shared. Takes the exact same `bars` data (`trendBars`, from `d.collectionTrend`) the old `BarChart` used — no data/logic change, only the rendering swapped, per the standing "functionality can't change" rule.
- ✅ Wired into `AdminDashboard.jsx` in place of the old `<BarChart>` call under "Collection Trend (Last 6 Months)". Verified live: smooth filled curve renders correctly with real test data, no console/server errors.

## Round 6 — New/Edit Student moved from modal to its own page (client feedback: modal too tall/cramped)
- ✅ `StudentFormModal.jsx` (Dialog-based) replaced with `StudentForm.jsx` — same fields, same validation, same auto-fill-fee-from-class behavior, same payload shape — just laid out as shadcn `Card` sections ("Basic Information", "Class, Teacher & Fees", "Guardian") on a full page instead of inside a `Modal`. Deleted the old modal file (no longer referenced anywhere).
- ✅ Two new routes: `/dashboard/admin/students/new` (create) and `/dashboard/admin/students/[studentId]/edit` (edit — fetches that student by id and pre-fills). `StudentsManager.jsx`'s "New Student" button and each row's "Edit" button now `Link` to these instead of opening modal state; the list component no longer owns any form state, only search/filter/pagination/delete.
- Also fixed a drive-by bug noticed while verifying: the **mobile card view** in `StudentsManager.jsx` was still showing the Bangla `classRef.name` instead of `nameEn` (the desktop table got this fix in Round 2, the mobile card was missed) — now both match.
- Verified live end-to-end: created a real test student through the new page (class-change correctly auto-filled monthly fee, guardian section behaved correctly), edited it (fields pre-filled correctly, update saved), then deleted the test record. Both actions correctly toast and redirect back to the students list, list totals updated correctly each time.
- Testing note (tooling, not a code issue): the `preview_click` browser-automation tool's synthetic click did not reliably trigger native `<button type="submit">` form submission in this environment — verified the real code path is correct by triggering `form.requestSubmit()` directly, which worked immediately (POST fired, toast shown, redirect happened). Real user clicks in an actual browser are unaffected; this only affected how this session verified the feature.
