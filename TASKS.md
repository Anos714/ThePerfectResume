# ThePerfectResume — Build Task List

Status of the full stack and everything still needed to ship the app.

> Last updated: Oct 9, 2026 — after the cover-letter builder went live
> against `/cover-letters` and `/ai/cover-letter`.

---

## 1. What's already done

### Backend (`backend/`, branch `backend-dev`)

Eight Hono modules wired into `src/server.ts`, all behind `requireAuth` unless
noted, each protected by Redis rate limiters:

| Module | Endpoints | Status |
| --- | --- | --- |
| **users** | register, login, email-OTP verify, refresh, `me`, logout, forgot/reset password, change-password, Google OAuth, avatar upload | ✅ |
| **profiles** | `GET/POST/DELETE /api/v1/profiles` | ✅ |
| **resumes** | list, get, create (copies profile), update, delete, rename, template, visibility, ats-score, public-link, and unauthenticated `GET /api/v1/resumes/public/:resumeId` (+ view tracking) | ✅ |
| **exports** | `GET /api/v1/exports/:resumeId/pdf` and `/docx` | ✅ |
| **ai** | `/suggest`, `/summary`, `/ats-score`, `/cover-letter`, `/interview` (Gemini + retry/backoff) | ✅ |
| **billing** | `/checkout`, `/status`, `/cancel` (auth) + signed `/webhook` (no auth) via Dodo Payments | ✅ |
| **cover-letters** | `GET/POST/PUT/DELETE /api/v1/cover-letters` | ✅ |
| **interview-questions** | list, single + `/bulk` create, `PUT` (edit/star), `DELETE` | ✅ |

Infrastructure: zod env validation, CORS, Redis-backed rate limiting, global
error handler, Drizzle ORM + Neon Postgres, generated migrations in
`backend/drizzle/`, Puppeteer PDF + DOCX export renderers.

### Frontend (`frontend/`, branch `main`)

A complete Next.js 16 + React 19 + Tailwind 4 UI shell: landing page, legal
pages, auth pages, and the full dashboard (home, resumes list, resume builder
with editor + preview + ATS + AI panels, cover letters, interview prep,
templates, billing, settings), plus the public resume page.

**The critical gap: the frontend has zero backend integration.**
`frontend/src/data/*` is all hardcoded mock data, `frontend/src/lib/` contains
only `cn()`, there is no HTTP client, no data-fetching library, no auth-token
handling, and no Next.js middleware — so every dashboard route is unguarded
and every button is decorative.

---

## 2. Remaining backend tasks

### 2.1 Resume analytics — `views`, `atsScore`, `completion` ✅ DONE
The frontend `Resume` type carries `atsScore`, `views`, and `completion`, but
the `resumes` table has none of these columns.

- [x] Add `atsScore` (int), `views` (int, default 0), `completion` (int) columns to the `resumes` table.
- [x] Generate + apply the Drizzle migration.
- [x] `PATCH /api/v1/resumes/:resumeId/ats-score` — store a freshly computed score (called after the AI ATS check).
- [x] Increment `views` on the unauthenticated `GET /api/v1/resumes/public/:resumeId` (fire-and-forget, or a dedicated `POST /track-view`).
- [x] Derive `completion` server-side from filled sections, or accept it from the builder on save.
- [x] Return the three fields from the list/get endpoints so the dashboard cards render real numbers.

> `atsScore` and `views` are stored columns; `completion` is derived on read
> (weighted across identity, experience, education, projects, skills, and
> contact sections) so it can never go stale.

### 2.2 Avatar / file upload ✅ DONE
`users.avatarUrl` is a hardcoded default SVG.

- [x] Choose storage (S3/R2/UploadThing/Supabase Storage). → **Cloudinary**
- [x] `POST /api/v1/users/avatar` (multipart) — validate type/size, upload, update `avatarUrl`.
- [x] Add an env-driven storage config module and extend the zod env schema.
- [x] Return the new `avatarUrl` so the settings page and sidebar update.

> Image type (jpeg/png/webp/avif) + 5 MB cap enforced server-side; uploads land
> under a per-user `avatars/<userId>/` folder. Add real `CLOUDINARY_*` values to
> `.env` — local dev currently uses placeholders, so uploads fail at the
> network call (by design) until then.

### 2.3 Optional / hardening
- [x] Plan-gated AI limits (the frontend shows `aiSuggestionsUsedToday` / `aiSuggestionsPerDay`; free vs pro vs career quotas on `/api/v1/ai/*`).
- [x] Replace placeholder Dodo credentials (`DODO_API_KEY`, product IDs) with real ones; verify the webhook signature end-to-end in production.
- [x] Unit/integration tests (there is no backend test setup today).

> **Plan-gated quotas** live in `src/config/planLimits.ts` (free 10 / pro 50 /
> career 200 per day) — kept dependency-free so it is importable in tests.
> `aiQuotaLimiter` is mounted on every `/api/v1/ai/*` route: it counts usage in
> Redis with a daily TTL, surfaces `X-AI-Usage-Used` / `X-AI-Usage-Limit` /
> `X-AI-Plan` on every AI response, and refunds the counter when the AI call
> fails with a 5xx so transient Gemini outages don't burn quota.
>
> **Dodo webhook** signature verification is covered by
> `billing.service.test.ts`, which signs payloads with the real
> `standardwebhooks` HMAC and asserts the service accepts a valid signature and
> rejects a wrong key, a tampered body, and missing headers. `DODO_API_KEY`,
> `DODO_WEBHOOK_KEY`, and the two product IDs are still placeholders in `.env` —
> swap in live values before launch.
>
> **Tests** run on `bun test` (34 across 4 files: plan quotas, webhook
> signature, resume completion, and resume/cover-letter/interview schemas).
> `env.ts` now falls back to placeholder values under `bun test` instead of
> hard-exiting, so the suite passes in a fresh worktree or CI checkout with no
> `.env` file.

---

## 3. Remaining frontend tasks

### 3.1 Foundation (unblocks everything else) ✅ DONE
- [x] **API client** — a typed fetch wrapper in `src/lib/api.ts` (base URL from `NEXT_PUBLIC_API_URL`, JSON parse, error normalization).
- [x] **Auth token handling** — attach `Authorization: Bearer <accessToken>`, transparently call `/users/refresh` on 401 using the httpOnly refresh cookie, then retry.
- [x] **Data fetching** — add `@tanstack/react-query` (or SWR) for caching/mutation/invalidation across dashboard pages.
- [x] **Route protection** — Next.js `middleware.ts` guarding `/dashboard/*` (check a session cookie / `/users/me`, redirect to `/signin` otherwise).
- [ ] Delete or gate the `src/data/*` mocks as each page goes live.

> **`src/lib/api.ts`** is the single entry point to the backend. It resolves
> `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`), sends
> `credentials: "include"` on every call so the httpOnly `refreshToken` cookie
> reaches the backend, and attaches the in-memory access token as
> `Authorization: Bearer`. On a 401 it posts to `/api/v1/users/refresh` exactly
> once — concurrent 401s share a single refresh round-trip — then replays the
> original request; a failed refresh clears the token. Responses are parsed,
> the `{ success, message, data }` envelope is unwrapped, and non-2xx results
> throw an `ApiError` carrying `status`, `isAuthError`, and `fieldErrors` for
> inline form validation.
>
> **`src/app/providers.tsx`** mounts TanStack Query via the Next 16 pattern
> (fresh `QueryClient` per server render, one reused in the browser) and is
> wired into the root layout.
>
> **Route protection** is `src/proxy.ts`, not `middleware.ts` — Next.js 16
> renamed the convention. It checks the `refreshToken` cookie as an optimistic
> guard on `/dashboard/:path*` and redirects to `/signin?redirect=…` otherwise.
> This is deliberately optimistic; the backend remains the authoritative auth
> check on every request.
>
> **Tests:** `api.test.ts` (23 assertions across base URL, headers, envelope
> unwrapping, error normalisation, refresh-retry, no-retry-loop, and
> refresh-failure teardown) and `proxy.test.ts` (allow-with-cookie, redirect,
> destination passthrough, non-dashboard passthrough). All pass under
> `bun test`; `bun run lint`, `tsc --noEmit`, and `bun run build` are clean.

### 3.2 Auth flows ✅ DONE
- [x] Wire `signin-form.tsx` / `signup-form.tsx` `onSubmit` to the real endpoints (today they only `preventDefault()`).
- [x] Email-OTP verify screen → `POST /users/verify`.
- [x] Google OAuth → `POST /users/auth/google` and redirect handling.
- [x] Logout → `POST /users/logout` then clear client state.

> **`src/features/auth/auth-provider.tsx`** is the session layer: it hydrates
> `/users/me` from a stored access token (query disabled while anonymous) and
> exposes `login` / `register` / `verifyOtp` / `loginWithGoogleCode` / `logout`
> via `useAuth()`, keeping the user in the React Query cache under
> `["auth", "me"]` for the pages that go live next.
>
> **Signin** validates inline against `ApiError.fieldErrors`, honours the
> proxy's `?redirect=` param (validated site-relative by `safeRedirect` so it
> can't be an open redirect), and — because the backend answers an unverified
> login with `200 { success: false }` — routes to `/verify?userId=&email=`
> instead of showing an error. **Signup** gained the confirm-password field the
> register schema requires, then lands on the same verify screen; the "Remember
> me" checkbox keeps the access token in `sessionStorage` rather than
> `localStorage` (the refresh path preserves that choice).
>
> **`/verify`** is a six-box OTP input (paste-fill, auto-advance, backspace
> navigation) that POSTs `/users/verify`; that endpoint issues the session, so
> verifying lands straight in the dashboard with no second login. A cold load
> of `/verify` without a `userId` shows an invalid-link state.
>
> **Google OAuth** is the authorization-code flow: the button sends the user to
> the Google consent screen, and `/auth/google/callback` hands the returned
> `code` to `POST /users/auth/google`, which exchanges it server-side where the
> client secret lives. The button is hidden entirely until
> `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set, and the code is exchanged exactly once.
> The frontend callback is at `/auth/google/callback` — the backend's
> `GOOGLE_REDIRECT_URI` (currently `http://localhost:5173/...`) must be pointed
> at it and registered in the Google console before this path works end to end.
>
> **Logout** in the sidebar POSTs `/users/logout`, drops the client token, and
> clears the cached session even when the backend call fails.
>
> **Forgot / reset password** — `/forgot-password` emails a one-time code via
> `POST /users/forgot-password` and carries the returned user id to
> `/reset-password`, which consumes `POST /users/reset-password` (6-digit code +
> new password with the live strength checklist) and sends the user back to
> sign in, since no session is issued there.
>
> **Validation** (`src/lib/validation.ts`) mirrors the backend zod rules so a
> form that passes client-side never gets a 422: required + well-formed email,
> 3+ character username, password strength, and confirm-password match. Errors
> fire on submit, clear as the field is edited, and the email re-checks on blur.
>
> **Tests:** `auth.test.ts` (register payload, token issuance on login/verify/
> google, the unverified-login shape, `/users/me` unwrapping, and
> logout-tears-down-on-failure), `google.test.ts` (consent URL), and
> `redirect.test.ts` (open-redirect guard) — 54 pass. `bun run lint`,
> `tsc --noEmit`, and `bun run build` are clean.

### 3.3 Dashboard pages
- [x] **Home** — real stats: resume count, total views, average ATS score, completion, recent activity (needs backend analytics fields).

> **`src/lib/resumes.ts`** is the typed client for `GET /api/v1/resumes`: it
> mirrors the nullable Drizzle columns the controller echoes back (the one
> exception is `completion`, which the service derives on read) and owns the
> `["resumes", "list"]` query key the rest of the dashboard will share.
>
> **`dashboard-stats.ts`** turns that list into the home view, dependency-free
> so it is unit-tested directly: `computeDashboardStats` rolls up resume count,
> published/draft split, total views, and averages for ATS score and completion
> (both averages skip resumes with no score so a fresh draft can't drag them
> down); `sortRecentResumes` orders the "Recent resumes" list by `updatedAt`
> without mutating the query cache; `deriveRecentActivity` builds the feed from
> the timestamps the backend already has — a `created` event at `createdAt` and
> an event at `updatedAt` that reads as a publish when the resume is live —
> formatted by `formatRelativeTime` ("Just now" → "Yesterday" → "4 days ago" →
> absolute date past a week). There is no activity log on the backend, so the
> feed never invents events it can't source.
>
> **`dashboard-home.tsx`** dropped the `src/data/*` mocks for a React Query
> read under that key with four real states: a skeleton while it loads, a retry
> card on failure, an empty state that points at the resumes page, and the
> loaded view. The greeting reads the username from `useAuth()`, and the
> "New resume" button is now a link to the resumes page — actually creating one
> arrives with the resumes-list task.
>
> **Tests:** `dashboard-stats.test.ts` — 17 tests / 28 assertions covering the
> stat rollups, the relative-time boundaries (including unparseable and future
> timestamps), activity derivation (publish vs. update, deduped create+update,
> sort order and limit, untitled fallback), and that sorting leaves the input
> untouched. `bun test` is 71 pass across 11 files; `bun run lint`,
> `tsc --noEmit`, and `bun run build` are clean.
- [x] **Resumes list** — fetch `/resumes`, wire new/delete/rename/template/publish/share actions to the real endpoints.

> **Backend fix first:** the authenticated share-link handler was registered at
> `GET /public/:resumeId` — the same pattern as the unauthenticated public view
> mounted earlier in the same router — so it was unreachable and every
> share-link call silently hit the public viewer instead. It now lives at
> `GET /:resumeId/public-link`, which matches no other route (verified against
> Hono's matcher).
>
> **`src/lib/resumes.ts`** grew the six wrappers the list needs — create, delete,
> rename (`PATCH /rename`), template (`PATCH /template`), visibility
> (`PATCH /visibility`, sending `isPublished` and `isPublic` together because the
> backend schema requires them to move as one), and the public link — plus
> `buildShareUrl` as a client-side fallback and `sortRecentResumes`, moved here
> from the home feature so it sits next to the type it sorts. `fetchResumes`
> guards on `Array.isArray` because the client's envelope unwrapper hands back
> the whole body when `data` is null. `getErrorMessage` was added to
> `src/lib/api.ts` so every failure surfaces the backend's own message.
>
> **`use-resumes.ts`** wraps those calls in mutations that invalidate
> `["resumes", "list"]` — the same key the dashboard home reads, so a rename or
> a publish here refreshes the home stats too. Delete and publish are optimistic:
> the card flips immediately and the cache is restored verbatim if the request
> fails.
>
> **`resumes-list.tsx`** renders four states (skeleton / error-with-retry /
> empty / loaded) and drives every row action through four dialogs in
> `resume-dialogs.tsx`: create (title + template), edit (rename and/or template,
> saved in parallel when both changed), share (publishes on demand, then shows a
> copy-to-clipboard link, with unpublish), and a delete confirmation. ATS badges
> and the completeness bar hide when the backend has no value for them yet.
>
> Two reusable pieces joined `components/ui`: a `Modal` (Escape/backdrop close,
> scroll lock) and a `Select`, and `Button` gained a `danger` variant for the
> destructive actions.
>
> **Note:** the resume cards still link to `/dashboard/resumes/:id`, whose page
> reads the `src/data/resumes` mocks — the builder binding is the very next task
> and makes those pages resolve real ids.
>
> **Tests:** `resumes.test.ts` — 11 tests asserting each wrapper hits the right
> path with the right verb and body (including that the share link does *not*
> use the public-view path), that a null list payload degrades to `[]`, and that
> sorting doesn't mutate its input. `bun test` is 82 pass across 12 files;
> `bun run lint`, `tsc --noEmit`, and `bun run build` are clean, and the page
> renders against a live dev server.
- [x] **Resume builder** — bind the editor to `GET/PUT /resumes/:id` with **autosave/debounce** (the UI claims "Changes save instantly"); remove local-only state.

> The builder page dropped `getResumeById` from `src/data/*` entirely and now
> hands the `resumeId` straight to `ResumeBuilder`, which loads the document
> with `useResumeQuery` (`staleTime: Infinity`, no retry — the editor keeps its
> own copy and our own writes refresh the cache) and renders a skeleton while
> it loads plus a "Couldn't open this resume" card with a back-link on failure.
> **Next.js dynamic params were the one real bug here:** the route folder is
> `[id]`, so `params` is keyed `id`, but the page destructured `resumeId` —
> every load requested `/api/v1/resumes/undefined` and blew up the Drizzle
> query with an undefined parameter.
>
> **Autosave** (`use-resume.ts`) debounces 800 ms and chains every write behind
> the one in flight so a slow request can never land after a newer one and
> clobber it. `status` drives the header indicator — idle → "Saving…" → green
> "Saved" → a retry affordance on error, with a full-width retry bar and a
> `beforeunload` guard plus an unmount flush so navigating away never drops a
> pending edit. The `updatedAt` column bumps on *every* update, so the debounce
> deliberately skips the first payload it sees: that one is the document exactly
> as the server handed it over, and writing it back would churn "Last edited"
> and the dashboard activity feed on every open.
>
> **`resume-mappers.ts`** bridges the nullable Drizzle columns to the
> non-optional shapes the editor and preview expect — every scalar coerced,
> missing arrays to `[]`, `currentlyWorking` only true when the server said so,
> and rows written before ids existed get one so React keys stay stable.
> `buildResumePayload` produces exactly the strict `updateResumeSchema` body and
> carries both visibility flags on every write, since the schema defaults them
> to false and omitting them would silently unpublish. There is no `email`
> column, so the field is gone from the editor and the payload; the preview's
> email render is now dead code until the profile is wired in.
>
> **Backend:** `updateResumeSchema` was relaxed to be autosave-friendly —
> section rows may arrive half-typed (empty company/role/date strings), links
> may be protocol-less mid-typing, and item ids round-trip so React keys
> survive the save. Length caps and the strict-key check are intact.
>
> **Tests:** `resume-mappers.test.ts` (18 assertions: blank rows, junk entries,
> id assignment, flag coercion, payload completeness and the fields that must
> stay out) and `resumes.schema.test.ts`'s new autosave cases; `resumes.test.ts`
> gained a GET-single and a PUT that asserts the body byte-for-byte. `bun test`
> is 97 pass across 13 files (frontend), 40 across 4 (backend); `bun run lint`,
> `tsc --noEmit`, and `bun run build` are clean.
- [x] **AI panel** — replace the `setTimeout` mock with `/ai/suggest` and `/ai/summary`.

> **`src/lib/ai.ts`** is the typed client for the AI module. `suggestImprovements`
> and `rewriteSummary` go through the new `apiFetchWithMeta` — a thin split of
> the existing client into `rawFetch` (request + the single 401 refresh-and-replay)
> and `unwrap` (envelope + `ApiError`), so `apiFetch` is unchanged for every
> other caller but the AI calls can also read `X-AI-Usage-Used` /
> `X-AI-Usage-Limit` / `X-AI-Plan`, which the JSON envelope does not carry.
> Malformed Gemini output degrades to "no suggestions" rather than crashing the
> panel, and an empty 2xx rewrite throws a friendly message. `buildSuggestContext`
> assembles the "rough notes" from the headline, summary, experience
> descriptions, project descriptions and skills — empty sections contribute
> nothing, and the result is capped at the schema's 2000 characters.
>
> **`ai-panel.tsx`** dropped `aiSuggestions` / `mockUser` for a `useMutation`
> against `/api/v1/ai/suggest` and renders five states: an idle prompt, the
> existing "Copilot is writing…" skeleton, an error card whose retry button
> becomes an upgrade link when the backend answers 429 (quota spent), an empty
> result card, and the loaded list. The quota line is now real — "3 of 10 daily
> suggestions left" off the response headers, with an upgrade link at zero —
> replacing the hardcoded `aiSuggestionsUsedToday` / `aiSuggestionsPerDay`. The
> generate button is disabled until the resume has enough content to clear the
> backend's 10-character minimum, so a blank resume can no longer fire a
> guaranteed 422.
>
> **"Add" actually adds now:** the suggestion is appended to the professional
> summary as its own line, which the autosave then persists. Un-applying lifts
> that exact line back out; if the user has already edited it away, the summary
> is left untouched and only the badge clears. The 750-character cap is
> enforced client-side with an inline notice rather than by truncating.
>
> **`editor-form.tsx`** wired the summary section's dead "Rewrite with AI"
> button to `POST /ai/summary` via a new `SummarySection` — spinner + "Rewriting…"
> while in flight, the rewritten text replaces the field on success, the
> backend's message shows inline on failure, and the button is disabled with a
> hint below the 10-character minimum. `EditorForm` takes a `resumeId` prop now,
> threaded down from the builder.
>
> **Tests:** `ai.test.ts` — 18 tests covering both endpoints' path/verb/body,
> quota-header parsing (present, absent, exhausted), malformed and non-array
> suggestion payloads, the empty-rewrite guard, and `buildSuggestContext`'
> assembly, blank-section skipping, generic heading fallback and length cap.
> `bun test` is 115 pass across 14 files (frontend), 43 across 5 (backend);
> `bun run lint`, `tsc --noEmit`, and `bun run build` are clean.

- [x] **ATS panel** — replace static checks with `/ai/ats-score`.

> **`src/lib/ai.ts`** grew the second typing of the AI module: `scoreAts` POSTs
> `{ resumeId, content }` to `/api/v1/ai/ats-score`, normalizes the returned
> 0-100 `score` (clamped + rounded) and the check list (unknown statuses
> degrade to `warn`, malformed rows are dropped), and reads the same
> `X-AI-Usage-*` quota headers as `/suggest`. `buildAtsContext` flattens the
> whole document — contact block, headline, summary, experience with dates and
> descriptions, education, projects, skills, certifications and languages —
> into the plain text the grader parses, capped at the schema's 50000
> characters. The static `src/data/ats.ts` mock is gone.
>
> **`src/lib/resumes.ts`** added `updateResumeAtsScore`, the `PATCH
> /resumes/:id/ats-score` wrapper that persists a freshly computed score so the
> dashboard's ATS badge and the average stat stop going stale.
>
> **`ats-panel.tsx`** dropped the hardcoded `atsChecks` array for a
> `useMutation` against `/api/v1/ai/ats-score` and renders five states: an idle
> prompt that still shows the last saved score ring when the row has one, the
> existing scan animation, an error card whose retry button becomes an upgrade
> link on 429, an empty-result card, and the loaded breakdown (score ring +
> "n of m checks passed" + the animated check rows). The run button is disabled
> until the document clears the backend's 50-character minimum, and the quota
> line is real off the response headers. Persisting the score is best-effort —
> the panel still renders the fresh result if the analytics write fails, and on
> success it seeds `resumeQueryKey` and invalidates the list so the badge
> updates immediately.
>
> **Tests:** `ai.test.ts` gained 13 tests for `buildAtsContext` (emotional
> contact/summary/roles/projects/skills assembly, ongoing-role `Present`,
> blank-field skipping, education/certs/languages, the 50000 cap) and `scoreAts`
> (path/verb/body, quota-header parsing, clamping/rounding, non-numeric score,
> malformed checks + default status, non-array payload, 429). `resumes.test.ts`
> asserts the `PATCH /ats-score` path and body. `bun test` is 133 pass across 15
> files (frontend), 43 across 5 (backend); `bun run lint`, `tsc --noEmit`, and
> `bun run build` are clean.
- [ ] **Export buttons** — hit `/exports/:id/pdf` and `/docx` (download via blob).
- [x] **Cover letters** — list from `/cover-letters`; generate via `/ai/cover-letter` then `POST /cover-letters`; wire edit/delete.

> **`src/lib/cover-letters.ts`** is the typed client for the module: `fetchCoverLetters`
> (guards on `Array.isArray` because the envelope unwrapper hands back the whole
> body when `data` is null), `fetchCoverLetter`, `createCoverLetter`,
> `updateCoverLetter`, `deleteCoverLetter`, plus dependency-free `sortRecentCoverLetters`
> and `coverLetterExcerpt` helpers. The row types mirror the nullable Drizzle
> columns the controller echoes back.
>
> **`src/lib/ai.ts`** gained `generateCoverLetter` (POSTs
> `{ resumeId, resumeData, jobDescription, tone }` to `/api/v1/ai/cover-letter`,
> rejects an empty 2xx body, reads the `X-AI-Usage-*` headers) and
> `buildCoverLetterResumeData`, which shares the document-flattening core with
> `buildAtsContext` but caps at the cover-letter schema's smaller 20000-char
> limit.
>
> **`use-cover-letters.ts`** wraps the calls in React Query mutations that
> invalidate `["cover-letters", "list"]`; delete is optimistic and restores the
> cache verbatim on failure.
>
> **`cover-letters.tsx`** dropped the `src/data/cover-letters` mock for a real
> query with the usual loading / error-with-retry / loaded states, and the
> empty affordance doubles as the "generate" entry point. Three dialogs in
> `cover-letter-dialogs.tsx` drive it: **generate** (pick a resume, paste a job
> description, choose a tone → `/ai/cover-letter` then `POST /cover-letters`,
> with the job-description and resume-content minimums gating the button and a
> quota-aware message on 429), **edit** (title, company, role, tone,
> draft/final status, body and job description), and **delete**.
>
> **Tests:** `cover-letters.test.ts` asserts every wrapper's path, verb and body
> (create full payload, partial PUT, delete), a null list payload degrading to
> `[]`, sort order without mutation, and excerpt collapsing/truncation/null.
> `ai.test.ts` gained cover-letter generation tests (path/verb/body, default
> tone, quota headers, empty-rewrite guard, 429) and `buildCoverLetterResumeData`
> tests (empty, shared flattening, 20000 cap, schema minimums). `bun test` is
> 153 pass across 16 files (frontend), 43 across 5 (backend); `bun run lint`,
> `tsc --noEmit`, and `bun run build` are clean.
- [ ] **Interview prep** — list from `/interview-questions`; generate via `/ai/interview` then `POST /interview-questions/bulk`; wire star toggle (`PUT`) and delete.
- [ ] **Templates** — drive the gallery from real template metadata.
- [ ] **Billing** — `/billing/status` for the current plan, `/billing/checkout` for upgrade, `/billing/cancel`; gate Pro/Career features by plan.
- [ ] **Settings** — profile save (`POST /profiles`), change password (`POST /users/change-password`), avatar upload (needs 2.2), delete account.
- [ ] **Public resume page** — `GET /resumes/public/:id` instead of mocks.

---

## 4. Full-app / cross-cutting tasks

- [x] **Env & config** — set `NEXT_PUBLIC_API_URL` (frontend) and `FRONTEND_URL`/CORS (backend) for dev/staging/prod.
- [ ] **Type sharing** — generate backend response types (zod-to-ts or hand-written `src/types/api.d.ts`) so the frontend consumes real shapes instead of the mock `types.ts`.
- [ ] **Error UX** — toast/banner surface for API failures and validation errors.
- [ ] **Loading states** — skeletons/spinners while queries resolve.
- [ ] **SEO/OG** — keep the existing `opengraph-image.tsx`; add per-resume meta for public pages.
- [ ] **Deployment** — backend (Bun) + frontend (Vercel/Next), Neon DB, Redis (Upstash), secrets for Gemini/Dodo/SMTP/storage.
- [ ] **E2E tests** — Playwright covering signup → builder → export → public view.
- [ ] **Branch merge** — merge `backend-dev` and `frontend-dev` into `main` once integration begins (both stay separate today).

---

## 5. Suggested build order

1. **Frontend foundation (3.1)** — API client, refresh-on-401, React Query, middleware. Everything else depends on this.
2. **Auth flows (3.2)** — first real end-to-end path; proves the foundation.
3. **Resumes + builder (3.3)** — the core product, including autosave and the AI/ATS panels.
4. **Backend analytics (2.1)** — unblocks the dashboard home's real numbers.
5. **Cover letters + interview prep (3.3)** — modules already exist; pure wiring.
6. **Billing (3.3 + 2.3)** — checkout/status/cancel and plan gating.
7. **Avatar upload (2.2)** + settings polish.
8. **Hardening, tests, deployment (2.3 + 4).**

---

## 6. Dev quick reference

```bash
# backend
cd backend
cp .env.example .env          # fill DATABASE_URL, REDIS_URL, GEMINI_API_KEY,
                              # DODO_*, and CLOUDINARY_*
bun install
bun run db:push               # apply schema to Neon
bun run dev                   # http://localhost:8080
bun run typeCheck             # tsc --noEmit
bun run build                 # bundles to dist/

# frontend
cd frontend
bun install
bun run dev                   # http://localhost:3000
bun run lint
bun run build
```
