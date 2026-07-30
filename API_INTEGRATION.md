# API Integration

How the FixItNow frontend talks to its Express/Prisma backend.

- **Frontend:** Next.js 16 App Router (this repo)
- **Backend:** Express + Prisma 7 + PostgreSQL, a sibling project (`../backend`, repo `l2-a4`)
- **Base URL:** `process.env.API_BASE_URL` (server-side only)

---

## 1. Architecture: Backend-For-Frontend

**The browser never talks to Express directly.** Every API call is made from the Next.js server — Server Components, Server Actions, or `proxy.ts`.

```
Browser ──► Next.js server ──► Express API ──► PostgreSQL
        ▲                  ▲
        │                  └── Authorization: Bearer <JWT from `session` cookie>
        └── first-party `session` / `session_refresh` cookies (httpOnly)
```

Why this shape:

| Benefit | Detail |
|---|---|
| **No CORS** | The browser only ever calls its own origin. The backend's single-origin CORS config is irrelevant. |
| **Tokens stay off the client** | JWTs live in `httpOnly` cookies read only on the server. No token in `localStorage`, none in the JS bundle. |
| **Backend URL is private** | `lib/env.ts` is marked `server-only`; `API_BASE_URL` has no `NEXT_PUBLIC_` prefix, so it cannot leak into client code. |
| **Route guards are possible** | `proxy.ts` can inspect the session before a protected page renders. |

> **Consequence:** the app cannot be exported as a static site, and `API_BASE_URL` **must** be set in the deployment environment. `lib/env.ts` throws at module load if it is missing, which fails the build rather than shipping a broken site.

---

## 2. The client — `lib/api-client.ts`

Two functions, both `server-only`:

```ts
apiRequest<T>(path, options?): Promise<T | undefined>
apiRequestWithResponse<T>(path, options?): Promise<{ data: T | undefined; response: Response }>
```

`options`:

| Option | Type | Notes |
|---|---|---|
| `method` | `GET \| POST \| PUT \| PATCH \| DELETE` | defaults to `GET` |
| `body` | `unknown` | JSON-serialised; sets `Content-Type` |
| `token` | `string` | sent as `Authorization: Bearer …` |
| `cache` | `RequestCache` | `"no-store"` for per-request data |
| `revalidate` | `number \| false` | ISR window in seconds |
| `tags` | `string[]` | cache tags |

**Why two functions.** The backend returns the login JWT **only in a `Set-Cookie` header**, never in the response body. `apiRequestWithResponse` exposes the raw `Response` so `readCookieFromResponse` can extract it. Everything else uses the simpler `apiRequest`.

**Response envelope.** The backend wraps payloads as `{ success, statusCode, message, data }`. `apiRequest` unwraps and returns `data`, so it can legitimately be `undefined` — every call site handles that.

**Errors.** Non-2xx throws a typed `ApiError` carrying `status` and the backend's `message`. Call sites branch on `error.status` (e.g. `404`/`403` → `notFound()`) and surface `error.message` directly to the user, so backend validation text reaches the form without duplicating copy.

---

## 3. Authentication flow

### Login
1. `POST /api/auth/login` via `apiRequestWithResponse`.
2. Read `accessToken` **and** `refreshToken` from the response's `Set-Cookie` header.
3. Store them as first-party cookies `session` and `session_refresh` (`httpOnly`, `sameSite=lax`, `secure` in production), with `maxAge` derived from each JWT's own `exp`.
4. Redirect to the validated `?redirect=` target — `safeRedirect` rejects anything not starting with `/`, plus `//`, `/auth/login` and `/auth/register` to avoid loops.

### Session reads
`lib/dal.ts` `getCurrentUser()` calls `GET /api/auth/me`, wrapped in React `cache()` so many components in one render share a single request.

### Transparent refresh — `proxy.ts`
Runs on every matched request:
1. Decode the access token's `exp` **locally** (no network call).
2. If more than 60s of life remains, pass through.
3. Otherwise `POST /api/auth/refresh` with the refresh cookie, and rewrite both cookies on the response.
4. If refresh fails on a guarded route, redirect to `/auth/login?redirect=…`.

Next 16 deprecated `middleware.ts` and renamed it to `proxy.ts`, which **defaults to the Node.js runtime**. The `runtime` segment-config option is unavailable in proxy files and throws if set, so there is no edge/node choice to make here.

### Logout — known gap
`logoutAction` clears both local cookies and redirects. It does **not** call `POST /api/auth/logout`, so the refresh token is not revoked server-side. Practically the user is signed out (the cookies are gone), but a captured refresh token would stay valid until it expires. The backend endpoint exists and is unused.

### Two-layer protection
Per the Next.js docs, proxy checks are optimistic only:

1. **`proxy.ts`** — redirects `/dashboard/*` to login when no session cookie is present.
2. **Every page and layout** — independently calls `getCurrentUser()` and redirects. This is the real gate, because a cookie can exist but be invalid.

Wrong-role visits always redirect to `` `/dashboard/${user.role}` ``, never to a hardcoded path.

---

## 4. Endpoint map

`✅` integrated · `➖` exists but unused by this frontend

### Auth — `/api/auth`
| Method | Path | Used by | |
|---|---|---|---|
| POST | `/login` | `app/auth/login/actions.ts` | ✅ |
| POST | `/register` | `app/auth/register/actions.ts` | ✅ |
| GET | `/me` | `lib/dal.ts` | ✅ |
| PATCH | `/me` | `lib/actions/profile.ts` | ✅ |
| POST | `/refresh` | `proxy.ts` | ✅ |
| POST | `/logout` | — | ➖ see §3 |

### Public catalogue
| Method | Path | Used by | |
|---|---|---|---|
| GET | `/api/services` | home, `/services`, technician's own services (`?technician_id=`) | ✅ |
| GET | `/api/services/:id` | `/services/[id]`, `lib/actions/booking.ts` | ✅ |
| GET | `/api/categories` | home, `/services` filters, service form | ✅ |
| GET | `/api/technicians` | home, `/technicians`, `/services` filters | ✅ |
| GET | `/api/technicians/:id` | `/technicians/[id]` | ✅ |

`GET /api/services` query params, all wired to the UI: `searchTerm`, `category_id`, `technician_id`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`.

### Bookings — `/api/bookings` (customer + technician)
| Method | Path | Used by | |
|---|---|---|---|
| POST | `/` | `lib/actions/booking.ts` | ✅ |
| GET | `/` | `/dashboard/customer/bookings`, `/dashboard` | ✅ |
| GET | `/:id` | booking detail, pay page | ✅ |
| PATCH | `/:id/cancel` | `lib/actions/booking.ts` | ✅ |

### Technician management — `/api/technician`
| Method | Path | Used by | |
|---|---|---|---|
| PUT | `/profile` | `lib/actions/technician-profile.ts` | ✅ |
| PUT | `/availability` | `lib/actions/availability.ts` | ✅ |
| GET | `/bookings` | job requests, overview, `/dashboard` | ✅ |
| PATCH | `/bookings/:id` | `lib/actions/technician-bookings.ts` | ✅ |

### Services (technician-owned writes)
| Method | Path | Used by | |
|---|---|---|---|
| POST | `/api/services` | `lib/actions/services.ts` | ✅ |
| PATCH | `/api/services/:id` | `lib/actions/services.ts` | ✅ |
| DELETE | `/api/services/:id` | `lib/actions/services.ts` | ✅ |

### Payments — `/api/payments`
| Method | Path | Used by | |
|---|---|---|---|
| POST | `/create` | `lib/actions/payments.ts` | ✅ |
| GET | `/` | `/dashboard/customer/payments` | ✅ |
| GET | `/:id` | — | ➖ |

### Reviews
| Method | Path | Used by | |
|---|---|---|---|
| POST | `/api/reviews` | `lib/actions/reviews.ts` | ✅ |

### Admin — `/api/admin`
| Method | Path | Used by | |
|---|---|---|---|
| GET | `/users` | `/dashboard/admin/users`, overview | ✅ |
| GET | `/users/:id` | `/dashboard/admin/users/[id]` | ✅ |
| PATCH | `/users/:id` | `lib/actions/admin-users.ts` (ban/unban) | ✅ |
| GET | `/bookings` | `/dashboard/admin/bookings`, overview | ✅ |
| GET | `/bookings/:id` | `/dashboard/admin/bookings/[id]` | ✅ |
| GET | `/categories` | `/dashboard/admin/categories`, overview | ✅ |
| POST | `/categories` | `lib/actions/categories.ts` | ✅ |
| PATCH | `/categories/:id` | `lib/actions/categories.ts` | ✅ |
| DELETE | `/categories/:id` | `lib/actions/categories.ts` | ✅ |

### Deliberately not used
| Path | Why |
|---|---|
| `GET /api/users` | Bare `prisma.user.findMany()` with no `select`, so it returns every user's **bcrypt password hash**. `GET /api/admin/users` does the same job with a proper `select`. Use that one. |

---

## 5. Endpoints added to the backend for this frontend

The original backend was missing pieces the requirements needed. Added (with validation and authorisation in each case):

| Endpoint | Why |
|---|---|
| `PATCH /api/auth/me` | No profile-update API existed. Whitelists `name` and `phone_no` only and rejects unknown fields, so a user cannot send `role` and self-promote. **`email` is deliberately not updatable** — it is the sign-in identifier, enforced at the API, not just hidden in the UI. |
| `POST /api/auth/refresh`, `POST /api/auth/logout` | No refresh token existed at all; sessions died when the access token expired. Includes rotation and a re-check of ban status. |
| `GET /api/services/:id` | No single-service endpoint, so a detail page was impossible. |
| `PATCH /api/services/:id` | No way for a technician to edit a service. |
| `DELETE /api/services/:id` | With a **409 guard when the service has bookings** — the cascade runs Service → Booking → Payment/Review, so an unguarded delete would have destroyed payment records. |
| `PATCH /api/bookings/:id/cancel` | No cancel path existed, and `BookingStatus` had no value for it. Gated to `pending` only: once the technician accepts, the customer can no longer cancel. |
| `GET /api/admin/users/:id` | No single-user endpoint for the admin detail page. |
| `GET /api/admin/bookings/:id` | Same, for booking details. |
| `PATCH /api/admin/categories/:id` | No category update. |
| `DELETE /api/admin/categories/:id` | With a **409 guard when any service uses the category** — same cascade risk as service delete. |

### Backend defects found and fixed while integrating

- **`GET /api/bookings` returned unusable data** — a bare `findMany` with zero `include`s, so bookings had no service, technician, payment or review. The same defect existed in `GET /api/technician/bookings` and `GET /api/payments`.
- **`updateTechnicianProfileDb` had no validation** — `Number("abc")` → `NaN` reached Prisma.
- **`createServiceDb` / `createCategoryDb` had no validation** — empty name *and* description were accepted; `NaN` prices got through.
- **`createReviewDb` had no payment check** — anyone could review without paying, with non-integer ratings and empty comments.
- **Login did not check ban status.**
- **Payments were `authorize("customer")` only**, locking technicians out of paying for bookings they made.
- **An admin could ban their own account** → unrecoverable, since banned users are blocked and only admins can unban.
- **Stripe `success_url`/`cancel_url` pointed at the backend**, so users never returned to the app. Now built from a dedicated `FRONTEND_URL`.
- **Technicians could book, pay for, or review their own services.** Booking blocked it; payment and review were only transitively protected and now have explicit owner checks.
- **A technician could accept a booking the customer had already cancelled** — closed when the cancel feature landed.

### Still open (backend)
- 🔴 `GET /api/users` leaks bcrypt hashes (unused here, but should be fixed or deleted).
- 🟡 No full booking status transition matrix — `complete → pending` is still reachable. Only the `cancel` transition is enforced.
- 🟡 No server-side validation that `scheduled_at` is in the future or inside the technician's availability. The frontend enforces both, in zod *and* again in the server action, but the API accepts anything.

---

## 6. Data conventions

| Concern | Rule |
|---|---|
| **Prisma `Decimal`** | Serialises to a **string**, never a number. `formatPrice` in `lib/format.ts` handles both; never do arithmetic on the raw value. |
| **Derived `PAID` status** | Not stored. `deriveBookingStatus(status, paymentStatus)` computes it: `accept` + `payment.status === "completed"` → `paid`, otherwise `accepted`. |
| **Booking status enum** | `pending · accept · decline · in_progress · complete · cancel`. `cancel` is the *customer's* withdrawal; `decline` is the *technician's* refusal. |
| **Availability weekdays** | `WEEKDAYS` index matches `Date.getDay()` (`sunday = 0`). |
| **Cascade deletes** | `onDelete: Cascade` chains Category → Service → Booking → Payment/Review. Any delete endpoint needs a usage guard first. |

---

## 7. Caching

| Data | Strategy |
|---|---|
| Categories, technician lists (filter options) | `revalidate: 300` |
| Home featured services | `revalidate: 60` |
| Anything user-specific (bookings, payments, profile, admin lists) | `cache: "no-store"` |

Mutations call `revalidatePath` after success, scoped to what actually changed:

| Mutation | Invalidates |
|---|---|
| Account profile (name/phone) | `revalidatePath("/", "layout")` — the name appears in the header on every page |
| Technician service profile, availability | `revalidatePath("/dashboard", "layout")` |
| Service create/edit/delete | `/dashboard/technician/services`, `/services`, `/`, and `/services/[id]` on edit |
| Review submit | booking list + detail, `/services`, `/technicians`, `/` |
| Ban/unban, categories, booking status, cancel | the specific affected paths |

`revalidatePath(path, "layout")` invalidates that layout **and everything nested beneath it**, so the two `"layout"` calls above cover all role namespaces without listing each root.

### TanStack Query is installed but unused
`@tanstack/react-query` is a dependency and `QueryClientProvider` is mounted in `components/providers.tsx`, but **no component calls `useQuery` or `useMutation`**. Server Components handle reads and Server Actions handle writes, so there is no client-side cache to manage. The provider is currently dead weight — safe to remove, kept only in case client-side fetching is added later.

---

## 8. Loading states

Two distinct mechanisms, because they solve different problems:

**Page navigation** — `components/route-progress.tsx` shows a top bar plus a spinner pill. Driven by `useLinkStatus()` inside the `components/link.tsx` wrapper (Next 16 exposes no router events, and `useLinkStatus` must run inside a `<Link>`), reporting into a shared counter store. Both parts fade in on a CSS delay so instant navigations show nothing.

**Filter / search refetch** — `components/refetch-boundary.tsx` swaps the list for a skeleton. This needs client-side pending state: the keyed `<Suspense>` on the list pages covers only first paint, because `router.replace` commits the new URL *after* the payload arrives, so the new `key` never exists during the pending window.

Filter chips that are real links use `components/filter-link.tsx`, which reports to the refetch store only — deliberately not the route bar, so one action produces one signal.

---

## 9. Environment

### Frontend
```env
API_BASE_URL="http://localhost:8000"   # no NEXT_PUBLIC_ prefix — server-only
```
The **only** variable this app reads besides `NODE_ENV`. It must be set in the deployment provider's environment; `.env*` is gitignored, and a missing value fails the build with `Error: API_BASE_URL is not set`.

### Backend (`../backend/.env`)
```env
PORT, DATABASE_URL, BCRYPT_SALT_ROUNDS,
JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN,
JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN,
STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
APP_URL,        # CORS origin
FRONTEND_URL,   # Stripe success/cancel redirect base — must be the deployed frontend
NODE_ENV
```

> **Deployment note:** `FRONTEND_URL` must point at the deployed frontend, not `localhost:3000`, or paying customers are redirected to a dead address after checkout.

---

## 10. Payment flow

1. Customer opens `/dashboard/customer/bookings/[id]/pay` (only reachable when the booking is `accept` and unpaid).
2. `POST /api/payments/create` creates a Stripe Checkout Session, stores its id as `Payment.transaction_id` with status `pending`, and returns the session URL.
3. Browser is redirected to Stripe.
4. Stripe returns to `${FRONTEND_URL}/payment/success?session_id=…` or `/payment/cancel`.
5. A Stripe **webhook** marks the payment `completed` — the return page does not.

Because confirmation is asynchronous, the success page tells the user the booking may take a few seconds to show as paid. Any UI that gates on payment must check `payment.status === "completed"`, never merely that the user landed on the success page.

**Both return pages are currently public and unverified** — anyone can open `/payment/success`. The `session_id` in the URL is effectively an unguessable token that could be matched against the user's own `GET /api/payments` (which returns `transaction_id`) to verify ownership, but that check is not implemented yet.
