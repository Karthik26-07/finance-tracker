# 🛡️ FinTrack Security Audit: JWT & Authorization

## 🔍 Audit Findings

| Category | Status | Details |
| :--- | :--- | :--- |
| **Authentication Strategy** | ⚠️ At Risk | Currently using standard NextAuth v5 cookie-based JWT sessions. Lacks professional-grade Refresh Token Rotation. |
| **Token Lifecycle** | 🔴 Non-Compliant | Access token duration not explicit (default NextAuth behavior). Missing distinct 15m/12h lifecycle constraints. |
| **Global Authorization** | 🔴 Incomplete | Middleware only protects `/(dashboard)/*`. Publicly accessible routes are too broad. |
| **Session Security** | ✅ Compliant | Already utilizing `strategy: "jwt"` but needs refinement. |
| **Server Actions** | ✅ Compliant | Most actions use `auth()`, but global enforcement logic is decentralized. |

---

## 🛠️ Implementation Plan: Professional JWT Engine

### Phase 1: Authentication Core Updates (`lib/auth.ts`)
- [ ] Configure `session.maxAge` to 43,200 (12 Hours) as the "Refresh Token" duration.
- [ ] Implement `jwt` callback logic to include an explicit `accessTokenExpires` (15m).
- [ ] Add `refresh_token` management (optional: database-backed or session-embedded).
- [ ] Implement automated session rotation every 15 minutes upon activity within the 12-hour window.

### Phase 2: Global Authorization Middleware (`middleware.ts`)
- [ ] Update matcher to cover ALL routes: `matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']`.
- [ ] Implement logic to redirect non-authenticated users to `/login` from any route except `/login` and `/register`.
- [ ] Redirect authenticated users away from `/login` and `/register` to `/dashboard`.

### Phase 3: Server Action Hardening (`lib/server-action-middleware.ts`)
- [ ] Update `executeServerAction` to perform a "Session Freshness" check.
- [ ] Ensure `AuthError` is thrown if the 15-minute access window is violated without a valid refresh.

---

## 🚀 Recommended Changes

### 1. Global Middleware Enforcement
```typescript
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  
  const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
  const isPublicApi = nextUrl.pathname.startsWith('/api/auth')
  
  if (isAuthPage) {
    if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
    return null
  }

  if (!isLoggedIn && !isPublicApi) {
    return Response.redirect(new URL('/login', nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 2. Token Lifecycle Configuration
Set in `lib/auth.ts`:
- `accessTokenExpires`: `Date.now() + 15 * 60 * 1000` (15m)
- `session.maxAge`: `12 * 60 * 60` (12h)

---

> [!IMPORTANT]
> This migration will ensure FinTrack meets professional banking-grade security standards for session management and token rotation.
