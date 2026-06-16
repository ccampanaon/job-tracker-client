# Trackboard — Job Application Tracker (Frontend)

React + Vite SPA for the NestJS job-tracker backend. Kanban board with
drag-and-drop, JWT auth with silent refresh, and TanStack Query caching.

## Stack
- **Vite + React 18 + TypeScript**
- **TanStack Query** — server-state caching, optimistic updates, invalidation
- **React Router 6** — routing + protected routes
- **Axios** — API client with bearer + single-flight 401 refresh interceptor
- **Zustand** — auth session state
- **React Hook Form + Zod** — forms and validation
- **Tailwind CSS** — styling

## Quick start
```bash
npm install
cp .env.example .env   # VITE_API_URL defaults to /api (proxied to :3000)
npm run dev            # http://localhost:5173
```
The dev server proxies `/api` to the NestJS backend on `http://localhost:3000`,
so make sure the backend (and its Postgres) is running first.

## How auth works
1. `login`/`register` store the access token in memory (Zustand) and the
   refresh token in `localStorage`.
2. The axios request interceptor attaches `Authorization: Bearer <access>`.
3. On a `401`, the response interceptor calls `/auth/refresh` **once**
   (single-flight), replays queued requests with the new token, and on failure
   clears the session and redirects to `/login`.
4. `ProtectedRoute` gates every route except `/login`.

> If your backend issues refresh tokens as httpOnly cookies instead, drop the
> `localStorage` line in `src/store/auth.ts` and let the browser carry the cookie.

## How caching works
- `src/lib/queryClient.ts` holds the `QueryClient` and a `qk` key factory so
  cache keys stay consistent.
- Lists, detail, companies, and interviews each have hooks under
  `src/features/*`. Mutations invalidate the right keys on success.
- The kanban drag uses an **optimistic** status mutation (`useChangeStatus`):
  the card moves immediately and rolls back if the request fails.

## API endpoints consumed
| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` |
| Applications | `GET/POST /applications`, `GET/PATCH/DELETE /applications/:id` |
| Companies | `GET /companies?search=`, `GET/POST /companies/:id` |
| Interviews | `GET/POST/PATCH/DELETE /applications/:appId/interviews/:id` |

## Notes to wire to your real API
- Confirm the applications list response shape. This assumes
  `{ data: Application[], nextCursor }` (your backend uses keyset pagination).
  Adjust `Page<T>` in `src/types` and `applicationsApi.list` if the envelope differs.
- The create-application form sends `companyName`; if your backend requires a
  `companyId`, swap the field for a company picker using `useCompanies`.
- Status string values (`applied`…`rejected`) must match the backend enum casing.

## Structure
```
src/
  api/         axios client + endpoint modules
  features/    auth, applications, companies, interviews (hooks + components)
  pages/       Auth, Board, List, ApplicationDetail
  routes/      router config + ProtectedRoute
  layouts/     AppLayout
  components/   shared UI (StatusBadge, Spinner, EmptyState)
  store/       Zustand auth store
  lib/         queryClient + key factory
  types/       domain types mirroring backend entities
```
