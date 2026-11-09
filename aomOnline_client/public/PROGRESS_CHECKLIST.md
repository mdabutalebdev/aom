# ✅ AOM অনলাইন মাদরাসা — অগ্রগতি চেকলিস্ট

> প্রতিটি পয়েন্ট শেষ হলে ⬜ → ✅ হয়। বিস্তারিত ব্যাখ্যা: [PROJECT_PLAN.md](PROJECT_PLAN.md)
> **নির্দেশিকা:** ✅ সম্পন্ন · ⬜ বাকি · ⭐ ডিজাইন-গুরুত্বপূর্ণ ফেজ

**নিশ্চিত সিদ্ধান্ত:** বেতন = `ratePerStudent × totalStudents` · মুদ্রা = **BDT ৳** · মাসিক ফি = **ক্লাস-ভেদে** · ছাত্র নিজে রেজিস্টার + শিক্ষক admin তৈরি করে · **সম্পূর্ণ UI বাংলায় (শুধু বাংলা, কোনো toggle নেই)**

**পাবলিক পেজ (৭টি):** হোম · আমাদের সম্পর্কে · যোগাযোগ · ভর্তি ফরম · লগইন · রেজিস্ট্রেশন · পাসওয়ার্ড ভুলে যাওয়া/রিসেট (ড্যাশবোর্ড পেজ আলাদা, এই গণনায় নেই)

**ডেটাবেস:** MongoDB Atlas সংযুক্ত (`.env`, db `aom_online_madrasa`) · **ডেমো অ্যাকাউন্ট** (`npm run seed:demo`): superAdmin `superadmin@aom.com`/`Admin@12345`; admin `admin@aom.com`, teacher1-3 `teacherN@aom.com`, student1-6 `studentN@aom.com`, parent `parent1@aom.com` — সবার পাসওয়ার্ড `Demo@123`

**সামগ্রিক অগ্রগতি:** ১০/১০ ফেজ সম্পন্ন ✅ (feature+QA) · deploy guide প্রস্তুত (আপনার hosting-এ চালানো বাকি)

| ফেজ | শিরোনাম | অবস্থা |
|---|---|---|
| ১ | ভিত্তি ও সেটআপ | ✅ সম্পন্ন |
| ২ | অথেন্টিকেশন, রোল ও ইউজার | ✅ সম্পন্ন |
| ৩ | পাবলিক ওয়েবসাইট | ✅ সম্পন্ন |
| ৪ | স্মার্ট ভর্তি | ✅ সম্পন্ন |
| ৫ | মূল মডেল | ✅ সম্পন্ন |
| ৬ ⭐ | শিক্ষক ব্যবস্থাপনা ও পেমেন্ট | ✅ সম্পন্ন |
| ৭ | উপস্থিতি | ✅ সম্পন্ন |
| ৮ | অগ্রগতি ও রিসোর্স | ✅ সম্পন্ন |
| ৯ ⭐ | ছাত্র ও অভিভাবক পোর্টাল | ✅ সম্পন্ন |
| ১০ | ড্যাশবোর্ড, রিপোর্ট, QA ও ডিপ্লয় | ✅ সম্পন্ন (deploy বাকি) |

---

## ফেজ ১ — ভিত্তি ও সেটআপ

**সার্ভার (`aomonline_server`)**
- ✅ Express + TypeScript প্রজেক্ট init (package.json, tsconfig, scripts: start:dev/build/lint/prettier)
- ✅ ফোল্ডার স্ট্রাকচার: `src/app.ts`, `src/server.ts`, `src/app/{config,middlewares,modules,utils}`
- ✅ `config/index.ts` — সব env এক জায়গায় (port, DB, JWT, Cloudinary, client_url)
- ✅ `utils/dbConnect.ts` — MongoDB connect হেল্পার · **Atlas সংযুক্ত (live, যাচাইকৃত)**
- ✅ `middlewares/globalErrorHandler.ts` (Zod/Mongoose/duplicate-key হ্যান্ডলিং)
- ✅ `middlewares/validateRequest.ts` (Zod)
- ✅ `middlewares/auth.ts` (authMiddleware + authorize + রোল hierarchy parent<student<teacher<admin<superAdmin)
- ✅ নিরাপত্তা: helmet, CORS (whitelist), express-rate-limit (global + auth), mongo-sanitize
- ✅ `config/cloudinary.ts` + multer storage সেটআপ (image/video/file)
- ✅ Health-check রুট `/` + নির্দিষ্ট port-এ server boot (DB-decoupled; HTTP 200 যাচাইকৃত)
- ✅ `.env.example`, `.gitignore`, README, Vercel config (`vercel.json`)

**ক্লায়েন্ট (`aomonline_client`)**
- ✅ Next.js 16 (App Router, JS) init + Tailwind v4 + `jsconfig.json` (`@/*` alias)
- ✅ Redux Toolkit `store.js` + `ReduxProviderWrapper`
- ✅ `config/api.js` — কেন্দ্রীয় API_BASE_URL
- ✅ ডিজাইন সিস্টেম: Tailwind theme (logo teal `#029199` + deep-green + gold, rounded, soft shadows)
- ✅ ফন্ট: Hind Siliguri (বাংলা) default, `layout.js` font variable
- ✅ সম্পূর্ণ বাংলা UI ভিত্তি (Hind Siliguri default, সব লেখা বাংলায় — কোনো toggle নেই)
- ✅ Reusable UI: Button, Card, Input, Select, Badge, Modal, Skeleton, Spinner
- ✅ Logo + favicon সংযোজন, base metadata/SEO
- ✅ `.env.local` example, `.gitignore`, README (Next.js → Vercel auto-detect)
- ✅ Root layout wired (Redux + Settings provider)

**মাইলফলক**
- ✅ **ফেজ ১ সম্পন্ন** — client build পাস + বাংলা home render (HTTP 200); server build পাস + boot + health-check HTTP 200; দুটোরই lint clean; git init।

---

## ফেজ ২ — অথেন্টিকেশন, রোল ও ইউজার ব্যবস্থাপনা

**সার্ভার**
- ✅ `user` module (model: name, email, password[bcryptjs, লুকানো], phone, photo, role, isActive) + interface
- ✅ রোল + hierarchy: parent < student < teacher < admin < superAdmin (superAdmin bypass যাচাইকৃত)
- ✅ `auth` module: register (ছাত্র নিজে), login, JWT (`{userId,role,email}`, 7d), bcryptjs
- ✅ পাসওয়ার্ড ভুলে যাওয়া / রিসেট ফ্লো (dev-এ resetToken রিটার্ন করে; + change-password)
- ✅ `authMiddleware` + `authorize(...roles)` সম্পূর্ণ (401 no-token / 403 wrong-role যাচাইকৃত)
- ✅ `seedAdmin` script → superAdmin (`superadmin@aom.com` / `Admin@12345`, idempotent)
- ✅ user CRUD (admin: list+search+filter+pagination / create-teacher / update / status / delete)

**ক্লায়েন্ট**
- ✅ `(auth)` layout + লগইন পেজ (RHF + Zod, বাংলা)
- ✅ রেজিস্ট্রেশন পেজ (ছাত্র নিজে রেজিস্টার)
- ✅ পাসওয়ার্ড ভুলে যাওয়া/রিসেট পেজ
- ✅ Token storage (localStorage 'token') + `authHeaders()` হেল্পার + `authSlice` (Redux)
- ✅ `ProtectedRoute` র‍্যাপার + role-based redirect (`getRoleHome`) + dashboard placeholder (admin/teacher/student)
- ✅ লগআউট + session হ্যান্ডলিং (fetchMe টোকেন যাচাই করে, reject হলে clear)

**মাইলফলক**
- ✅ **ফেজ ২ সম্পন্ন** — QA-তে ৩৪/৩৪ auth assertion পাস (register→login→/me→create-teacher→list→forgot/reset→inactive-block→401/403→409); client build + বাংলা পেজ render + guard redirect যাচাইকৃত; দুটোরই lint clean। Atlas DB সংযুক্ত + ডেমো ডেটা (১২ জন ইউজার) seeded ও live login যাচাইকৃত (meta.total=12)।

---

## ফেজ ৩ — পাবলিক ওয়েবসাইট

**সার্ভার**
- ✅ `contact` module (পাবলিক submit + admin list/get/status/delete + search/filter/pagination)
- ✅ `settings` module (single-doc get[public]/update[admin]) + seedSettings (বাংলা default কনটেন্ট, live seeded)

**ক্লায়েন্ট (`(mainLayout)`)**
- ✅ Navbar + TopHeader + Footer (ইসলামিক theme, responsive, সব লেখা বাংলায়; chrome শুধু (mainLayout)-এ, auth/dashboard-এ নয়)
- ✅ হোম: Hero (logo + tagline), About intro, What We Offer (৬টি), ক্লাস preview (কায়দা/নাযেরা/হিফজ/আমপারা), Quote/Testimonial, CTA
- ✅ আমাদের সম্পর্কে পেজ (মিশন/ভিশন/বার্তা/মূল্যবোধ + stats band)
- ✅ যোগাযোগ পেজ + ফরম (RHF+Zod) → `POST /api/contacts` (live যাচাইকৃত)
- ✅ framer-motion animation + scroll reveal
- ✅ সম্পূর্ণ responsive (mobile/tablet/desktop)
- ✅ প্রতি পেজে SEO meta + favicon

**মাইলফলক**
- ✅ **ফেজ ৩ সম্পন্ন** — QA PASS: সব API auth-guard ঠিক (settings 401/403/200, contact public→admin→delete), হোম/আমাদের সম্পর্কে/যোগাযোগ বাংলা render, chrome-scoping নিখুঁত, দুটোরই build+lint clean। Footer/TopHeader-এর social-key bug ঠিক করা (facebook/youtube/whatsapp)।

---

## ফেজ ৪ — স্মার্ট ভর্তি সিস্টেম

**সার্ভার**
- ✅ `admission` module (model: applicant, guardian, phone, address, desiredClass, photo?, status pending/approved/rejected, userId)
- ✅ Endpoints: submit (public), upload-photo (public), list/filter (admin), approve → **User(student) auto-তৈরি (temp password)**, reject, delete (`// TODO Phase 5`: Student/Parent domain record)
- ✅ Validation (Zod) + ছবি আপলোড (Cloudinary; optional — creds বসলে live হবে)

**ক্লায়েন্ট**
- ✅ স্মার্ট ভর্তি ফরম (multi-section, RHF + Zod, optional ছবি আপলোড graceful) → `POST /api/admissions`
- ✅ সফলতা/নিশ্চিতকরণ স্ক্রিন
- ✅ Admin ভর্তি নিয়ন্ত্রণ পেজ (তালিকা, বিবরণ modal, approve[+temp password দেখায়]/reject[reason]/delete, status badge, search + status/class filter, pagination) + admin dashboard-এ লিংক
- ✅ "ভর্তি হোন"/ক্লাস CTA সব → `/admission` (৫ ফাইলে ঠিক করা)

**মাইলফলক**
- ✅ **ফেজ ৪ সম্পন্ন** — QA PASS ২৭/২৭: পাবলিক ফরম → admin approve → ছাত্র অ্যাকাউন্ট auto-তৈরি, এবং সেই temp password দিয়ে **সত্যিই login (200) যাচাইকৃত**; reject/delete/guard ঠিক; দুটোরই build+lint clean; test data cleanup (ফিরে ১২ user / ০ admission)।

---

## ফেজ ৫ — মূল ডোমেইন মডেল (শিক্ষক · ছাত্র · ক্লাস)

**পূর্বশর্ত**
- ✅ ক্লাস লেভেল: কায়দা/আমপারা/নাযেরা/হিফজ (ডাইনামিক CRUD), milestone ০/২০/৪০/৬০/৮০/১০০%
- ✅ অভিভাবক: ছাত্রের সাথে লিংকড (guardian তথ্য embedded), আলাদা login নয়

**সার্ভার**
- ✅ `class` module (public list + admin CRUD, `monthlyFee` + milestones, ডাইনামিক)
- ✅ `teacher` module (userRef, teacherId TCH-001 auto, subject, `ratePerStudent`, studentCount derived) + CRUD (create→User+profile, delete→User নিষ্ক্রিয়)
- ✅ `student` module (userRef optional, studentId auto AOM2026001, teacherRef, classRef, guardian embedded) + CRUD
- ✅ অভিভাবক = guardian তথ্য student-এ embedded (আলাদা module নয়, সিদ্ধান্ত অনুযায়ী)
- ✅ Relationship + populate (class/teacher) + studentCount হেল্পার
- ✅ ছাত্রের ক্লাস থেকে ফি auto-derive (ক্লাস বদলালে recompute, explicit দিলে অক্ষত)

**ক্লায়েন্ট (admin)**
- ✅ ক্লাস/লেভেল ব্যবস্থাপনা পেজ (CRUD + milestones editor)
- ✅ শিক্ষক ব্যবস্থাপনা (list/create[+User]/edit/delete, rate সেট, studentCount)
- ✅ ছাত্র ব্যবস্থাপনা (list/create/edit/delete, শিক্ষক+ক্লাস assign, ফি auto-fill) + dashboard-এ ৪টি লিংক কার্ড

**মাইলফলক**
- ✅ **ফেজ ৫ সম্পন্ন** — QA PASS ৪৬/৪৬: ৪ ক্লাস + ৩ শিক্ষক (studentCount ৮) + ২৪ ছাত্র seeded ও যাচাইকৃত; CRUD + populate + **ফি auto-derive** সব ঠিক; দুটোরই build+lint clean; test data cleanup (৪ ক্লাস/৩ শিক্ষক/২৪ ছাত্র/১২ user অক্ষত)।

---

## ফেজ ৬ ⭐ — শিক্ষক ব্যবস্থাপনা ও পেমেন্ট সিস্টেম (client req.txt)

**সার্ভার**
- ✅ `payment` module (model: studentRef, teacherRef, month, year, amount, status paid/unpaid, paidAt; unique index student+month+year)
- ✅ বেতন হিসাব: `ratePerStudent × studentCount` (৳) — প্রতি শিক্ষক ও গ্লোবাল
- ✅ গ্লোবাল overview: মোট শিক্ষক(৩), মোট ছাত্র(২৪), আগামী মাসের মোট বেতন(৳৭২০০)
- ✅ প্রতি-শিক্ষক aggregation: Paid/Unpaid সংখ্যা, মোট আদায়, মোট বকেয়া, বেতন, %
- ✅ পেমেন্ট status toggle endpoint (admin only) → stats সহ recompute রিটার্ন
- ✅ Month rollover: payment রেকর্ড (student+month+year)-keyed, absence=unpaid → নতুন মাস স্বয়ংক্রিয় fresh (cron লাগে না)

**ক্লায়েন্ট — পেজ ১: শিক্ষক তালিকা**
- ✅ Admin sidebar shell (ড্যাশবোর্ড/ভর্তি/ক্লাস/শিক্ষক/ছাত্র/পেমেন্ট + রিপোর্ট/নোটিফিকেশন/সেটিংস placeholder), doubled-chrome নেই
- ✅ ৩টি summary card (মোট শিক্ষক, মোট ছাত্র, আগামী মাসের মোট বেতন ৳)
- ✅ শিক্ষক card (avatar, নাম, TCH-ID, ছাত্র সংখ্যা, আগামী বেতন ৳, বিস্তারিত দেখুন)
- ✅ শিক্ষক search + pagination

**ক্লায়েন্ট — পেজ ২: শিক্ষক বিবরণ**
- ✅ প্রোফাইল header (photo, নাম, ID, email/phone, মোট ছাত্র, আগামী বেতন)
- ✅ Paid/Unpaid progress bar (% সহ)
- ✅ ছাত্র টেবিল (নাম, মাসিক ফি ৳, status badge, toggle) — mobile card view
- ✅ ৪টি হিসাব card (মোট পরিশোধিত, মোট বকেয়া, মোট আদায় ৳, মোট বকেয়া ৳)
- ✅ ছাত্র search + filter (সব / পরিশোধিত / বকেয়া)
- ✅ ম্যানুয়াল toggle → Paid(সবুজ)/Unpaid(লাল) + সাথে সাথে recalc (stats থেকে)

**মাইলফলক**
- ✅ **ফেজ ৬ সম্পন্ন** — QA PASS ৪১/৪১: overview/salary/collected/due নিখুঁত, **toggle → stats recompute** যাচাইকৃত, guard ঠিক, মকআপ-উপাদান সব উপস্থিত, দুটোরই build+lint clean। QA-র drill-down bug (link teacherId→`_id`) fixed। Live seed: ১৬ পরিশোধিত / ৮ বকেয়া।

---

## ফেজ ৭ — উপস্থিতি সিস্টেম

**সার্ভার**
- ✅ `attendance` module (model: studentRef, teacherRef, date[UTC-normalized], status present/absent/leave/holiday, markedBy; unique student+date)
- ✅ Endpoints: mark / bulk (teacher), my-students?date, my-summary?month, student/:id?month (Phase 9-এর জন্য) — ownership guard (নিজের ছাত্র; admin `?teacherId=`)
- ✅ Aggregate: present/absent/leave/holiday/total (মাসিক)

**ক্লায়েন্ট (শিক্ষক পোর্টাল)**
- ✅ শিক্ষক সাইডবার শেল (TeacherSidebarShell, no doubled chrome) + Smart Attendance Tracker (দৈনিক মার্ক, "সবাইকে উপস্থিত", instant-save)
- ✅ মাস/দিন navigation + অতীত উপস্থিতি edit
- ✅ উপস্থিতি মাসিক summary ভিউ (per-student present/absent/leave/total)

**মাইলফলক**
- ✅ **ফেজ ৭ সম্পন্ন** — QA PASS ৩৩/৩৩ (server): roster/holiday, ownership (own 200 / non-owned 403), bulk-denied, summary (জুন total ৩০/holiday ৪), guards; দুটোরই build+lint clean। QA-র mark bug (studentId→`_id`) fixed + পুরো client ID-sweep clean। Live seed: ৭৯২ রেকর্ড (জুন+জুলাই)।

---

## ফেজ ৮ — অগ্রগতি ট্র্যাকিং ও রিসোর্স সেন্টার

**সার্ভার**
- ✅ `progress` module (studentRef unique, classRef, percentage, completedMilestones[] auto-computed, updatedBy) — teacher/admin update, student নিজে পড়তে পারে (Phase 9)
- ✅ `material` module (title, fileUrl, type excel/pdf/image/video/other, classRef?, teacherRef) + Cloudinary upload endpoint + `/my` (ছাত্রের ক্লাস অনুযায়ী)
- ✅ `notification` module (list + read + read-all + unreadCount) + **milestone→অভিনন্দন hook** (নতুন milestone crossed → ছাত্রের userRef-এ notification)

**ক্লায়েন্ট (শিক্ষক পোর্টাল)**
- ✅ Progress Evaluator UI (preset ০-১০০ + slider + milestone bar, optimistic, "লেভেল সম্পন্ন 🎉")
- ✅ Resource Center UI (material list + type filter + upload/URL + edit/delete) — সাইডবারে অগ্রগতি/রিসোর্স চালু

**মাইলফলক**
- ✅ **ফেজ ৮ সম্পন্ন** — QA PASS ৪০/৪০: progress read (AOM2026001=১০০%), **milestone hook end-to-end** (bump→notification→read), ownership/self (২০০/২০০/৪০৩), materials CRUD + /my class-scoping, notifications; দুটোরই build+lint clean; `_id`-sweep clean (নতুন bug নেই)। Live seed: ২৪ progress + ২ milestone notification + ৬ material।

---

## ফেজ ৯ ⭐ — ছাত্র ও অভিভাবক পোর্টাল (গেমিফাইড ড্যাশবোর্ড)

**সার্ভার**
- ✅ `GET /students/me/dashboard?month=&year=` — এক কলে aggregation (profile+progress+attendance grid+materials+notifications), student নিজের ডেটা (userRef, নাহলে 404)

**ক্লায়েন্ট (ছাত্র/অভিভাবক পোর্টাল)**
- ✅ পোর্টাল layout passthrough + AOM branded header (logo + tagline + mascot emoji)
- ✅ প্রোফাইল card (avatar, Student ID, নাম, শিক্ষকের নাম, "ছাত্র" badge, হাদিস উক্তি)
- ✅ গেমিফাইড Progress Bar (বর্তমান ক্লাস, milestone emoji ০→১০০%, % badge)
- ✅ "🎉 অভিনন্দন! আপনি {ক্লাস} লেভেল সম্পন্ন করেছেন!" banner (notification message সহ)
- ✅ উপস্থিতি ক্যালেন্ডার (মাসের full grid, রঙ-কোডেড, legend, মাস ◀/▶ nav)
- ✅ উপস্থিতি summary card (উপস্থিত/অনুপস্থিত/ছুটি/মোট)
- ✅ One-Click Download area (fileType-ভিত্তিক card + ডাউনলোড link)
- ✅ অভিভাবক ভিউ = একই dashboard (read-only, linked-parent সিদ্ধান্ত)
- ✅ Real ডেটা wire (এক endpoint থেকে সব)

**মাইলফলক**
- ✅ **ফেজ ৯ সম্পন্ন** — QA PASS ২৭/২৭: dashboard endpoint (July ৩১ দিন/৩ জুলাই=বন্ধ, June ৩০/holiday ৪), 404/401 guard; client render + passthrough + wiring; দুটোরই build+lint clean; **মকআপের সাথে মিল, live ডেটা** (AOM2026001=কায়দা ১০০% + অভিনন্দন)। SettingsContext fetch-loop আশঙ্কা নাকচ।

---

## ফেজ ১০ — অ্যাডমিন ড্যাশবোর্ড, রিপোর্ট, QA ও ডিপ্লয়মেন্ট

**ফিচার**
- ✅ Admin Central Dashboard (৭ stat card + inline SVG donut/bar chart + recent activity + quick links)
- ✅ `analytics` module (overview + report: বেতন/পেমেন্ট/উপস্থিতি/অগ্রগতি) + admission→admin notification hook
- ✅ রিপোর্ট: বেতন/পেমেন্ট(আদায়/বকেয়া)/উপস্থিতি/অগ্রগতি + totals
- ✅ Export = `window.print()` + print CSS (dependency-free PDF; jsPDF লাগেনি)
- ✅ Notification bell (unreadCount badge + dropdown + read/read-all, ৬০s refresh) — admin+teacher
- ✅ Settings পেজ (site info/logo/contact/social/about/mission/vision/footer edit) — rate per-teacher, fee per-class (helper note)

**QA ও হার্ডেনিং**
- ✅ সম্পূর্ণ responsive (প্রতি phase-এ mobile/tablet/desktop built+verified, table→card)
- ✅ empty/loading/error state (সব পেজে)
- ✅ role-guard audit (প্রতি endpoint QA-verified 401/403; sanitize+helmet+rate-limit চালু) · prod rate-limit/secrets মান → [DEPLOYMENT.md](DEPLOYMENT.md)-এ ডকুমেন্টেড
- ✅ Lint + Prettier clean (client + server, প্রতি phase)
- ✅ Performance (Next.js static prerender, next/font, lazy fetch)

**ডিপ্লয় (guide প্রস্তুত → আপনার action)**
- 🔲 Server deploy (Render/Railway সুপারিশ, বা Vercel) + env — [DEPLOYMENT.md](DEPLOYMENT.md)
- 🔲 Client deploy (Vercel) + `NEXT_PUBLIC_API_URL` + custom domain
- 🔲 Production seed (`seed:admin`+`settings`+`classes`) + smoke test
- ✅ চূড়ান্ত ডকুমেন্ট (DEPLOYMENT.md + PROJECT_PLAN.md + এই checklist)

**মাইলফলক**
- ✅ **ফেজ ১০ সম্পন্ন (feature+QA)** — QA PASS ৩৯/৩৯; সব feature build+lint clean ও live যাচাইকৃত; deploy guide প্রস্তুত (production-live আপনার deploy-এর অপেক্ষায়)। 🔲 = আপনার hosting-এ চালানোর ধাপ।

---
*আপডেট নিয়ম: প্রতিটি পয়েন্ট শেষ হলে সাথে সাথে ⬜ → ✅ হয়; ফেজের চরম পয়েন্ট শেষ হলে উপরের টেবিলে status ✅ এবং সামগ্রিক কাউন্টার আপডেট হয়।*

---

## সাম্প্রতিক পরিবর্তন (Recent Changes)
- **সিস্টেমের ভাষা পরিবর্তন**: ব্যবহারকারীর নির্দেশ অনুযায়ী `PROGRESS_CHECKLIST.md` ফাইলটি বাদে পুরো সিস্টেমের (অ্যাডমিন, শিক্ষক, ছাত্র পোর্টাল সহ) সকল UI টেক্সট, বাটন, ফর্ম লেবেল এবং মেসেজগুলো বাংলা থেকে ইংরেজিতে অনুবাদ করা হয়েছে।
- **মুদ্রা (Currency)**: অ্যাডমিন ড্যাশবোর্ড ও অন্যান্য জায়গায় টাকার অংকের সাথে শুধুমাত্র `৳` (Taka symbol) চিহ্নটি রাখা হয়েছে।
- **অ্যাডমিন ড্যাশবোর্ডের কার্যাবলী**: ব্যবহারকারীর প্রশ্নের উত্তরে অ্যাডমিন ড্যাশবোর্ডের কাজগুলো সম্পর্কে বিস্তারিত জানানো হয়েছে।
- **অ্যাডমিন ড্যাশবোর্ড UI ফিক্স**: পূর্বে উল্লেখিত ডিজাইন সমস্যা এবং ফিল্ড এডিট না হওয়ার সমস্যাগুলো সমাধান করা হয়েছে।
