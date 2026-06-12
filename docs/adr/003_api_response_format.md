# ADR 003: Type-Safe API Response Format with Discriminated Unions

**Date:** 2026-06-02  
**Status:** Accepted  
**Author:** Frank

## Context

API responses need to handle both success and error cases consistently. The frontend needs type-safe access to responses, minimizing runtime errors and enabling compiler-level validation of API contracts.

## Decision

Implement a **discriminated union response format** where all API responses follow:

```typescript
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: { code: string; message: string; details?: object } };
```

## Rationale

### Type Safety
- **Discriminated unions**: TypeScript compiler enforces checking status before accessing data
- **Impossible states**: Can't accidentally access `data` when `status` is 'error'
- **Self-documenting**: Response shape tells you what to handle

### Developer Experience
- **IDE autocomplete**: IntelliSense knows what fields are available
- **Compile-time errors**: Typos caught before runtime
- **Clear error handling**: Standardized error shape across all endpoints

### Error Handling
- **Consistent format**: All errors follow same structure
- **Error codes**: Standardized codes enable programmatic error handling
- **Additional details**: Optional `details` field for form validation errors

### Frontend Benefits
```typescript
// Type-safe error handling
const response = await fetch('/api/products');
const result: ApiResponse<Product[]> = await response.json();

if (result.status === 'error') {
  // TypeScript knows result is error type here
  showError(result.error.message);
} else {
  // TypeScript knows result is success type here
  displayProducts(result.data);
}
```

## Trade-offs

### Advantages
- ✓ Compile-time type safety
- ✓ Impossible to mishandle responses
- ✓ Clear success vs error paths
- ✓ Shows advanced TypeScript patterns (important for senior roles)

### Disadvantages
- ✗ Slightly more verbose responses (one extra `status` field)
- ✗ Requires consistent adoption across all endpoints

### Mitigations
- Create response helper functions on backend to auto-wrap responses
- Use custom hooks on frontend to handle response unwrapping
- Document pattern in API specification

## Consequences

### Positive
- ✓ Catches API misuse at compile time
- ✓ Reduces runtime errors in production
- ✓ Demonstrates advanced TypeScript knowledge
- ✓ Makes error handling explicit and consistent

### Negative
- ✗ Slightly larger response payloads (negligible impact)
- ✗ All endpoints must follow the pattern

## Alternatives Considered

### Alternative 1: Exceptions/HTTP Status Codes Only
- **Pros**: Simpler, follows REST convention
- **Cons**: Requires parsing HTTP status in frontend, less type-safe
- **Rejected because**: Doesn't catch errors at compile time

### Alternative 2: Separate Success/Error Endpoints
- **Pros**: Simple type definitions
- **Cons**: Confusing API, duplicated endpoints
- **Rejected because**: Not practical

### Alternative 3: GraphQL
- **Pros**: Built-in error handling, strong typing
- **Cons**: Over-engineered for this scope, different paradigm
- **Rejected because**: REST is simpler, clearer learning

## Implementation

### Backend Helper
```typescript
// Utils for creating typed responses
export const successResponse = <T>(data: T): ApiResponse<T> => ({
  status: 'success',
  data,
});

export const errorResponse = (code: string, message: string, details?: object): ApiResponse<never> => ({
  status: 'error',
  error: { code, message, details },
});
```

### Frontend Type Guard
```typescript
// React hook for safe API calls
function useApiCall<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const call = async () => {
    const result: ApiResponse<T> = await fetch(url).then((r) => r.json());

    if (result.status === 'error') {
      setError(result.error);
    } else {
      setData(result.data);
    }
  };

  return { data, error, call };
}
```

## Links

- Related: ADR 001 (Separate Frontend/Backend)
- See: `src/types/api.ts` for implementation
- See: `src/utils/responses.ts` for helpers (TODO)

## Verification

This ADR is validated by:
1. All endpoints return `ApiResponse<T>` type
2. Frontend has type guards for checking status
3. Error handling tested in E2E tests
4. No runtime errors from API response shape mismatches
