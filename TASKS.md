# ThePerfectResume — Build Task List

Status of the full stack and everything still needed to ship the app.

> Last updated: Oct 6, 2026 — after billing, cover-letters persistence,
> interview-prep persistence, and resume analytics landed on `backend-dev`.

---

## 1. What's already done

### Backend (`backend/`, branch `backend-dev`)

Eight Hono modules wired into `src/server.ts`, all behind `requireAuth` unless
noted, each protected by Redis rate limiters:

| Module | Endpoints | Status |
| --- | --- | --- |
| **users** | register, login, email-OTP verify, refresh, `me`, logout, forgot/reset password, change-password, Google OAuth | ✅ |
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

### 2.2 Avatar / file upload
`users.avatarUrl` is a hardcoded default SVG.

- [ ] Choose storage (S3/R2/UploadThing/Supabase Storage).
- [ ] `POST /api/v1/users/avatar` (multipart) — validate type/size, upload, update `avatarUrl`.
- [ ] Add an env-driven storage config module and extend the zod env schema.
- [ ] Return the new `avatarUrl` so the settings page and sidebar update.

### 2.3 Optional / hardening
- [ ] Plan-gated AI limits (the frontend shows `aiSuggestionsUsedToday` / `aiSuggestionsPerDay`; free vs pro vs career quotas on `/api/v1/ai/*`).
- [ ] Replace placeholder Dodo credentials (`DODO_API_KEY`, product IDs) with real ones; verify the webhook signature end-to-end in production.
- [ ] Unit/integration tests (there is no backend test setup today).

---

## 3. Remaining frontend tasks

### 3.1 Foundation (unblocks everything else)
- [ ] **API client** — a typed fetch wrapper in `src/lib/api.ts` (base URL from `NEXT_PUBLIC_API_URL`, JSON parse, error normalization).
- [ ] **Auth token handling** — attach `Authorization: Bearer <accessToken>`, transparently call `/users/refresh` on 401 using the httpOnly refresh cookie, then retry.
- [ ] **Data fetching** — add `@tanstack/react-query` (or SWR) for caching/mutation/invalidation across dashboard pages.
- [ ] **Route protection** — Next.js `middleware.ts` guarding `/dashboard/*` (check a session cookie / `/users/me`, redirect to `/signin` otherwise).
- [ ] Delete or gate the `src/data/*` mocks as each page goes live.

### 3.2 Auth flows
- [ ] Wire `signin-form.tsx` / `signup-form.tsx` `onSubmit` to the real endpoints (today they only `preventDefault()`).
- [ ] Email-OTP verify screen → `POST /users/verify`.
- [ ] Google OAuth → `POST /users/auth/google` and redirect handling.
- [ ] Logout → `POST /users/logout` then clear client state.

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

- [ ] **Env & config** — set `NEXT_PUBLIC_API_URL` (frontend) and `FRONTEND_URL`/CORS (backend) for dev/staging/prod.
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
cp .env.example .env          # fill DATABASE_URL, REDIS_URL, GEMINI_API_KEY, DODO_*
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
