# ADR 001: Separate Frontend and Backend Architecture

**Date:** 2026-06-02  
**Status:** Accepted  
**Author:** Frank

## Context

Building a full-stack e-commerce application (Keurope) that serves as a learning project for senior frontend development. The choice of architectural pattern affects learning outcomes, deployment flexibility, and demonstrated technical breadth.

## Decision

Implement a **separate frontend (React/Vite) and backend (Express/Node.js)** architecture instead of a full-stack framework (Next.js).

## Rationale

### Learning & Skill Demonstration
- **Full-stack understanding**: Demonstrates mastery of both frontend and backend independently
- **API design**: Learn to design clean, type-safe APIs (important for senior roles)
- **Team collaboration**: Shows understanding of how frontend and backend teams coordinate
- **Deployment knowledge**: Separate deployment pipelines teach infrastructure basics

### Technical Advantages
- **Independent scaling**: Frontend and backend can scale independently
- **Technology flexibility**: Each layer can use its optimal technology stack
- **Testing isolation**: Backend can be tested without frontend, and vice versa
- **Clear separation of concerns**: Business logic lives in backend, UI logic in frontend

### Interview Value
For a Senior Frontend position at enterprise companies (like FEXCO):
- Shows you can architect systems, not just build components
- Demonstrates knowledge of API contracts and request/response design
- Understanding of database migrations and schema design
- Shows DevOps/deployment awareness

## Trade-offs

### Disadvantages
- More boilerplate than Next.js or other full-stack frameworks
- Slightly slower initial development
- Must manually manage API versioning and compatibility
- Requires managing two separate deployments

### Mitigations
- Use TypeScript and Zod for compile-time safety
- Document API contracts clearly (OpenAPI/Swagger)
- Set up CI/CD to automate deployments
- Use shared type definitions between frontend and backend

## Consequences

### Positive
- ✓ Demonstrates architectural thinking (senior skill)
- ✓ Clear API boundaries enable better testing
- ✓ Can deploy frontend on Vercel, backend on Railway independently
- ✓ Easier to onboard new developers with clear separation
- ✓ Shows understanding of real-world enterprise architecture

### Negative
- ✗ More setup and configuration required
- ✗ Longer initial development cycle
- ✗ CORS configuration and API documentation complexity

## Alternatives Considered

### Alternative 1: Full-Stack Framework (Next.js)
- **Pros**: Fast development, built-in API routes, simpler deployment
- **Cons**: Hides backend complexity, less learning about APIs, harder to scale independently
- **Rejected because**: Doesn't demonstrate full-stack architectural understanding

### Alternative 2: Monorepo with Shared Code
- **Pros**: Share types between frontend and backend, single repository
- **Cons**: Still requires understanding of both layers, adds complexity
- **Considered**: Could use in future iterations, but separate repos clearer for learning

## Links

- Related: ADR 002 (Database Choice)
- Related: ADR 003 (API Response Format)

## Verification

This ADR is validated by:
1. Separate `/frontend` and `/backend` directories in project structure
2. Independent TypeScript configurations for each
3. Clear API specification document (in progress)
4. Separate npm scripts for dev/build/start
