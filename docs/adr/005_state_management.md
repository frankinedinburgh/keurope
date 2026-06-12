# ADR 005: State Management Strategy (Context API + Custom Hooks)

**Date:** 2026-06-02  
**Status:** Accepted  
**Author:** Frank

## Context

React application needs to manage:
- **Server state**: Products, orders (from API)
- **UI state**: Modal visibility, filters, notifications
- **Session state**: Cart, auth token, user preferences

Options range from built-in React hooks to external libraries (Redux, Zustand, Jotai).

## Decision

Use **React Context API + custom hooks** for all state management. Avoid external state libraries.

## Rationale

### Simplicity
- **Built-in**: No new dependencies, understand React's native features
- **Learning value**: Shows mastery of React hooks and Context
- **Less abstraction**: Closer to React fundamentals

### Appropriate Scope
- **Cart**: One context with 6-8 items max, straightforward
- **Auth**: Single user object, simple login/logout
- **Filters**: Few filters, simple updates
- This app doesn't have the complexity that requires Redux

### Interview Value
- **Shows judgment**: Choosing right tool (Context) vs over-engineering (Redux)
- **Shows expertise**: Can explain why Redux would be overkill
- **Demonstrates patterns**: Custom hooks show advanced React knowledge

### Maintainability
- **Colocated logic**: Each feature has its hook + context
- **Easy to test**: Pure functions and hooks are testable
- **Clear data flow**: One-way data from context down

## Trade-offs

### Advantages
- ✓ Zero dependencies
- ✓ Easier to learn and debug
- ✓ No boilerplate (no reducers, actions, dispatchers)
- ✓ Shows architectural judgment
- ✓ Easier to refactor later if needed

### Disadvantages
- ✗ Not suitable for very complex state (but ours isn't)
- ✗ Prop drilling if many levels (mitigate with smart context placement)
- ✗ Context re-renders all consumers on any state change (mitigate with useMemo)

### Mitigations
- Split contexts: CartContext, FilterContext, AuthContext (separate concerns)
- Use `useMemo` to prevent unnecessary re-renders
- Use custom hooks to hide complexity: `useCart()`, `useAuth()`
- Document when to add external library (e.g., if > 50 state updates/second)

## Consequences

### Positive
- ✓ Lean codebase, easy to understand
- ✓ No Redux boilerplate (actions, reducers, dispatch)
- ✓ Can trace data flow directly in code
- ✓ Demonstrates React mastery

### Negative
- ✗ Not infinitely scalable (but this app won't grow that large)
- ✗ Context provider can be performance bottleneck if not careful

## Alternatives Considered

### Alternative 1: Redux
- **Pros**: Mature, time-travel debugging, large ecosystem
- **Cons**: Boilerplate, over-engineered for this scope, steep learning curve
- **Rejected because**: Violates "no premature complexity" principle

### Alternative 2: Zustand / Jotai
- **Pros**: Lighter than Redux, simpler API
- **Cons**: Still external dependency, adds complexity we don't need
- **Rejected because**: Context API is sufficient

### Alternative 3: TanStack Query (React Query)
- **Pros**: Great for server state caching
- **Cons**: Overkill for simple product/order fetching
- **Considered**: Could add in Phase 4 if caching becomes necessary

### Alternative 4: XState (State Machines)
- **Pros**: Explicit state transitions, good for complex flows
- **Cons**: Over-engineered, adds learning curve
- **Rejected because**: Simple Context is clearer

## Implementation Pattern

### Creating a Context Hook
```typescript
// CartContext.tsx
import { createContext, useContext, useState } from 'react';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems([...items, item]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook - hides context complexity
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used in CartProvider');
  return context;
}
```

### Performance Optimization
```typescript
// Prevent re-renders with memoization
const value = useMemo(() => ({ items, addItem, removeItem }), [items]);
return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
```

### Separation of Concerns
- `CartContext` - shopping cart state
- `AuthContext` - user auth state
- `FilterContext` - search/filter UI state
- `useProducts` - fetching hook (custom, not context)

## When to Reconsider

If any of these happen, consider adding Redux/Zustand:
- [ ] > 20 different state actions
- [ ] Complex state relationships (one action affects multiple slices)
- [ ] Need devtools/time-travel debugging
- [ ] Performance issues from Context re-renders (prove it first!)

## Links

- Related: ADR 001 (Separate Frontend/Backend)
- See: `frontend/src/context/` for implementation
- See: `frontend/src/hooks/useCart.ts` for pattern

## Verification

This ADR is validated by:
1. No Redux/external state library in dependencies
2. All state accessible through custom hooks
3. Performance metrics show no re-render issues
4. Code review: Custom hooks preferred over context access
