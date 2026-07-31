# FixItNow — Frontend

A home-service technician booking platform. Customers browse services, book a real time slot from a technician's live availability, pay through Stripe once the technician accepts, and review the job afterwards. Technicians manage their own services, availability and job queue. Admins oversee users, bookings and the service catalogue.

Built with the **Next.js 16 App Router**, TypeScript and Tailwind v4, against an existing Express + Prisma backend.

> API contract, authentication flow and the full endpoint map live in **[API_INTEGRATION.md](API_INTEGRATION.md)**.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.2.12** (App Router, React **19.2.4**) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS **v4** |
| UI | shadcn/ui **4.16** (`radix-nova` preset) + Radix primitives + lucide-react |
| Forms | react-hook-form + zod **v4** (`@hookform/resolvers`) |
| Data | Server Components + Server Actions over a typed `fetch` client |
| Theming | next-themes (System / Light / Dark, defaults to System) |
| Toasts | sonner |
| Auth | Custom JWT sessions in `httpOnly` cookies + `proxy.ts` refresh & guards |

---

## Getting started

**Prerequisites:** Node 20+, and the backend running (sibling `../backend`, default port 8000).

```bash
npm install

# API_BASE_URL is required — the build fails without it
printf 'API_BASE_URL="http://localhost:8000"\n' > .env.local

npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

---

## Architecture

### Backend-For-Frontend
The browser never calls Express directly. Every request goes through the Next.js server, which attaches the JWT from an `httpOnly` cookie. This removes CORS entirely, keeps tokens out of client JavaScript, hides the backend URL, and makes route guards possible. See [API_INTEGRATION.md §1](API_INTEGRATION.md).

### Sessions
Two cookies — `session` (access) and `session_refresh`. `proxy.ts` decodes the access token's `exp` **locally** and only calls the backend's refresh endpoint within 60s of expiry, so most requests cost no extra round trip.

Protection is two-layered, per the Next.js docs: `proxy.ts` is an optimistic redirect, and every page/layout independently calls `getCurrentUser()`. The second layer is the real gate, because a cookie can exist but be invalid.

### Project layout
```
app/
  (public)/          # marketing + catalogue, shares header/footer
    page.tsx         #   home
    services/        #   list + [id] detail
    technicians/     #   list + [id] detail
    payment/         #   success / cancel returns
  auth/              # login, register (real segment, so URLs are /auth/*)
  dashboard/
    customer/        # profile at root, bookings, [id], pay, payments
    technician/      # profile at root, overview, bookings, services, availability
    admin/           # profile at root, overview, users, bookings, categories
components/          # shared UI + wrappers (link, route-progress, refetch-boundary)
  ui/                # shadcn primitives
lib/
  api-client.ts      # typed fetch + ApiError
  dal.ts             # cached getCurrentUser()
  session*.ts        # cookie handling
  actions/           # Server Actions, one file per domain
  validations/       # zod schemas, one file per form
proxy.ts             # token refresh + /dashboard guard
```

---

## Routes

### Public
| Route | Notes |
|---|---|
| `/` | Hero, category grid, featured services, how-it-works, CTA |
| `/services` | All 7 query params wired: search, category, technician, min/max price, sort field + direction. 6 sort options |
| `/services/[id]` | Full detail, availability, reviews, booking dialog |
| `/technicians` | 6 filters (search, skill, min/max experience, min/max rate) + 7 sort options |
| `/technicians/[id]` | Services, rating distribution, reviews, contact, availability |
| `/auth/login`, `/auth/register` | |
| `/payment/success`, `/payment/cancel` | Stripe return pages |

### Customer
| Route | Notes |
|---|---|
| `/dashboard/customer` | Profile (account details) |
| `/dashboard/customer/bookings` | List with derived status, Pay now / Cancel / Review |
| `/dashboard/customer/bookings/[id]` | Progress timeline, technician, payment panel |
| `/dashboard/customer/bookings/[id]/pay` | Stripe checkout hand-off |
| `/dashboard/customer/payments` | Payment history |

### Technician
| Route | Notes |
|---|---|
| `/dashboard/technician` | Profile (account details) |
| `/dashboard/technician/overview` | Stats, profile-completeness prompt, availability summary |
| `/dashboard/technician/bookings` | Job requests: Accept / Decline / Start / Complete, earnings |
| `/dashboard/technician/services` | Create, edit and delete own services |
| `/dashboard/technician/profile` | Service profile: bio, skills, experience, hourly rate |
| `/dashboard/technician/availability` | Weekly availability editor |
| `/dashboard` | Combined customer + technician view |

### Admin
| Route | Notes |
|---|---|
| `/dashboard/admin` | Profile (account details) |
| `/dashboard/admin/overview` | Revenue, bookings by status, people, payments, catalogue, top technicians |
| `/dashboard/admin/users` + `/[id]` | Search, role and status filters, ban / unban |
| `/dashboard/admin/bookings` + `/[id]` | Search, status and payment filters, revenue |
| `/dashboard/admin/categories` | Create, edit, delete (blocked when in use) |

The **account profile lives at the root of each role's namespace**, so its URL is role-dependent. `/dashboard/profile` is kept as a redirect for older links. A wrong-role visit always redirects to `` `/dashboard/${user.role}` ``.

Technicians are also users, so they can book other technicians' services and reach the `/dashboard/customer/*` sub-routes. A 3-option scope selector (Customer & Technician / Customer / Technician) switches context; it renders only for technicians, since everyone else has one context.

---

## Features

**Booking** — availability-window validation in zod *and* again in the Server Action; a technician cannot book, pay for, or review their own service (enforced on the backend too).

**Booking lifecycle** — `pending → accept → in_progress → complete`, plus `decline` (technician) and `cancel` (customer). `PAID` is **derived**, not stored: `accept` + a completed payment. A customer can cancel only while the booking is `pending`; once accepted it is locked.

**Payments** — Stripe Checkout. Confirmation arrives by webhook, so UI gates on `payment.status === "completed"`, never on the user reaching the success page.

**Reviews** — gated to completed **and** paid **and** not-yet-reviewed, with a checklist showing which condition is outstanding.

**Loading feedback** — two mechanisms:
- *Page navigation*: a top progress bar plus spinner pill, driven by `useLinkStatus()` through a `Link` wrapper. Fades in on a delay so instant navigations show nothing.
- *Filter / search refetch*: skeletons replace the list. This needs client-side pending state — a keyed `<Suspense>` only covers first paint, because `router.replace` commits the new URL *after* the payload arrives.

**Error handling** — segment-scoped `error.tsx` / `not-found.tsx` for root, `(public)` and `dashboard` on a shared `StatusPage`, plus a dashboard loading skeleton. `global-error.tsx` uses inline styles, because per the docs it does **not** load global CSS.

**Theming** — System / Light / Dark. Every surface is styled for both schemes.

---

## Conventions

- **No redundant comments.** Comments explain *why* something non-obvious is done, never *what* the line does.
- **Server Actions for all writes**, one file per domain in `lib/actions/`, each returning a discriminated result (`{ ok: true, … } | { ok: false, message }`) rather than throwing at the UI.
- **zod schemas mirror backend validation** so errors surface inline before a request is made; the backend remains the authority.
- **Forms are dirty-gated** — Save disabled until `isDirty`, with Discard, and reset from the server response so `isDirty` clears after saving.
- **Filters are URL state**, not component state, so every view is linkable and works before hydration.

### Gotchas worth knowing

| Trap | Rule |
|---|---|
| Brand buttons | Never use `variant="outline"` with a brand background — `dark:bg-input/30` from the outline variant cannot be de-conflicted by `tailwind-merge`, making text invisible in dark mode. Use `variant="default"`. |
| Responsive grids | Always give a base `grid-cols-1`. Without it, mobile gets an implicit `auto` track whose base size is min-content — and `truncate`'s `white-space: nowrap` makes that the full string, blowing the track past the viewport. |
| Card footers | `mt-auto` collapses to 0 when content is tall; pair it with a minimum gap. |
| `Decimal` fields | Serialise as **strings**. Use `formatPrice`; never do raw arithmetic. |
| `loading.tsx` | Its presence turns a 404 in that segment into an HTTP 200 (the correct UI still renders). Accepted under `dashboard`, deliberately avoided under `(public)` so public 404s keep their real status. |
| Client-side handlers | `onClick` + `router.replace` does nothing before hydration. Filters that can be links are links. |

---

## Deployment

Set **`API_BASE_URL`** in the hosting provider's environment variables for **all** environments (Production, Preview, Development), then redeploy — it is read at build time. `.env*` is gitignored, so a local `.env.local` never reaches the host, and a missing value fails the build with `Error: API_BASE_URL is not set`.

Do not rename it to `NEXT_PUBLIC_API_BASE_URL`; keeping it server-only is deliberate.

On the backend side, set **`FRONTEND_URL`** to the deployed frontend origin, or Stripe will return paying customers to `localhost`.

---

## Known gaps

- `logoutAction` clears local cookies but does not call `POST /api/auth/logout`, so refresh tokens are not revoked server-side. Refresh tokens are stateless, so nothing can be revoked at all.
- `@tanstack/react-query` is installed and its provider mounted, but nothing uses `useQuery`/`useMutation` — Server Components and Server Actions cover all data flow. Safe to remove.
- No accessibility audit or full responsive audit has been done beyond fixing specific reported issues.
- Backend, from the 2026-07-31 security review: a **banned user can still log in** (login has no status check, though refresh does) and `GET /api/auth/me` skips the ban check — mutations are still blocked, so it is read-only exposure; `globalErrorHandler` returns the whole error object, leaking table and column names; **no rate limiting** anywhere; **no server-side password policy** (the API accepts a 1-character password); no booking status transition matrix; no server-side validation of `scheduled_at`. See [API_INTEGRATION.md §5](API_INTEGRATION.md).

**Fixed in that review:** `GET /api/users` no longer returns bcrypt password hashes; the `/payment/*` return pages require a session and verify the `session_id` belongs to the caller; and login no longer leaks which emails are registered, by response *or* by timing.
- Not implemented (no backend support): location filtering, profile pictures, admin-featured services, password change. The home page's "Featured services" is cheapest-first, not curated.
