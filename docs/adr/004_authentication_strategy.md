# ADR 004: Authentication Strategy (Supabase Auth)

**Date:** 2026-06-02  
**Status:** Accepted  
**Author:** Frank

## Context

The application needs user authentication to:
- Track user orders and history
- Sync carts across devices
- Personalize experience
- Protect sensitive endpoints

Options range from building custom auth (educational but risky) to using managed services (secure but less learning).

## Decision

Use **Supabase Auth** (managed authentication service) with JWT tokens stored in localStorage.

## Rationale

### Security First
- **Professionally maintained**: Supabase uses industry-standard auth best practices
- **No custom crypto**: Reduces security vulnerabilities from implementing auth wrongly
- **Social auth ready**: Can add Google/GitHub login easily later

### Learning Value
- **Practical enterprise skill**: Learning to integrate managed auth services is real-world
- **JWT understanding**: Still learn about tokens, validation, refresh logic
- **Backend validation**: Server still validates auth tokens on protected endpoints

### Development Speed
- **Zero infrastructure**: No need to manage auth server, database, etc.
- **Ready-made UI**: Supabase provides pre-built auth components
- **Integrated database**: PostgreSQL + Auth in one platform

### Production Ready
- **Compliance ready**: Handles security standards (no password plain-text, etc.)
- **Scalability**: Built for millions of users
- **Cost**: Free tier sufficient for development and demo

## Trade-offs

### Advantages
- ✓ Secure by default (no custom crypto mistakes)
- ✓ Fast development (no auth from scratch)
- ✓ Integrated with Supabase PostgreSQL
- ✓ Shows integration skills (important for senior roles)
- ✓ Can add OAuth/2FA easily later

### Disadvantages
- ✗ Less learning about auth internals (trade-off we're accepting)
- ✗ Vendor lock-in to Supabase
- ✗ Learning Supabase API required

### Mitigations
- Document where auth tokens are used
- Understand JWT structure and validation
- Design abstraction layer in frontend (`useAuth` hook) for future switching
- Could migrate to Auth0 or custom if needed

## Consequences

### Positive
- ✓ App is production-secure immediately
- ✓ Can focus on features, not auth mechanics
- ✓ Shows judgment in choosing right tool for job
- ✓ Interview: "I integrated Supabase Auth" > "I built auth from scratch"

### Negative
- ✗ Don't learn cryptography internals (acceptable trade-off)
- ✗ Dependent on Supabase's uptime

## Alternatives Considered

### Alternative 1: Build Custom Auth
- **Pros**: Learn everything about auth, full control
- **Cons**: High complexity, security risks, time-consuming
- **Rejected because**: Not worth security risk for learning project

### Alternative 2: NextAuth.js / Auth0
- **Pros**: Balanced approach, good documentation
- **Cons**: NextAuth tied to Next.js, Auth0 is SaaS dependency
- **Rejected because**: Supabase is simpler and integrated with our DB

### Alternative 3: No Auth (Sessions Only)
- **Pros**: Simplest to implement
- **Cons**: Can't track user orders, no personalization
- **Rejected because**: Core feature requirement

## Implementation

### Frontend
```typescript
// React hook hides auth complexity
const { user, loading, signUp, signIn, signOut } = useAuth();

// Auto-refresh tokens
// Handle logout on token expiry
```

### Backend
```typescript
// Middleware validates JWT tokens
app.use(verifySupabaseToken);

// Protected routes check token
app.get('/api/me', (req: AuthRequest, res) => {
  // req.user populated from JWT
});
```

### Data Flow
1. User signs up/in with Supabase Auth
2. Supabase returns JWT token
3. Frontend stores token in localStorage
4. Each API call includes token in Authorization header
5. Backend verifies token is valid (hasn't expired/been tampered with)

## Links

- Related: ADR 001 (Separate Frontend/Backend)
- See: `frontend/src/services/auth.ts` (TODO)
- See: `backend/src/middleware/auth.ts` (TODO)

## Verification

This ADR is validated by:
1. Supabase project created and configured
2. `useAuth()` hook works correctly
3. Protected endpoints return 401 when token missing
4. Tokens auto-refresh before expiry
5. E2E test flows: signup → order → view history
