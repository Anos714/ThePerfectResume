# ThePerfectResume — Build Task List

Status of the full stack and everything still needed to ship the app.

> Last updated: Oct 7, 2026 — after the frontend auth flows (signin, signup,
> email-OTP verify, Google OAuth, logout) were wired to the real backend.

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
- [ ] **Home** — real stats: resume count, total views, average ATS score, completion, recent activity (needs backend analytics fields).
- [ ] **Resumes list** — fetch `/resumes`, wire new/delete/rename/template/publish/share actions to the real endpoints.
- [ ] **Resume builder** — bind the editor to `GET/PUT /resumes/:id` with **autosave/debounce** (the UI claims "Changes save instantly"); remove local-only state.
- [ ] **AI panel** — replace the `setTimeout` mock with `/ai/suggest` and `/ai/summary`.
- [ ] **ATS panel** — replace static checks with `/ai/ats-score`.
- [ ] **Export buttons** — hit `/exports/:id/pdf` and `/docx` (download via blob).
- [ ] **Cover letters** — list from `/cover-letters`; generate via `/ai/cover-letter` then `POST /cover-letters`; wire edit/delete.
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
