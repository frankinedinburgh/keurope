# ADR 002: Database Choice (SQLite → PostgreSQL)

**Date:** 2026-06-02  
**Status:** Accepted  
**Author:** Frank

## Context

Keurope requires persistent data storage for products, carts, orders, and user information. The project needs to support local development, testing, and production environments. Database choice affects development speed, testing capabilities, and production readiness.

## Decision

- **Development & Testing**: SQLite (embedded, zero-config)
- **Production**: PostgreSQL (managed service via Supabase)
- **Migration Path**: Design schema to be database-agnostic using migrations

## Rationale

### SQLite for Development
- **Zero setup**: Works immediately with no external services
- **File-based**: Easy to commit test databases, inspect state
- **Fast iteration**: Ideal for rapid development and prototyping
- **Learning**: Understand SQL without complex database setup

### PostgreSQL for Production
- **Scalability**: Handles real traffic, concurrent connections
- **Reliability**: ACID compliance, data integrity
- **Features**: Advanced features (JSON columns, full-text search, etc.)
- **Hosting**: Supabase provides managed PostgreSQL with auth integration

### Migration-Based Schema
- **Version control**: SQL migrations tracked in git
- **Reproducibility**: Same migrations run in dev and prod
- **Documentation**: Migrations act as schema history
- **Safety**: Allows rolling back if needed

## Trade-offs

### Advantages
- ✓ Fastest development with SQLite
- ✓ Production-ready with PostgreSQL
- ✓ Easy local testing without Docker
- ✓ Demonstrates database best practices

### Disadvantages
- ✗ Schema differences between SQLite and PostgreSQL (minimal with care)
- ✗ Slightly more setup for migrations
- ✗ Some SQL syntax differences between databases

### Mitigations
- Use standard SQL to minimize dialect differences
- Test migrations on both databases
- Document any database-specific code
- Use prepared statements to prevent SQL injection

## Consequences

### Positive
- ✓ Developers can run tests locally without Docker
- ✓ Can commit dev database to git for team sharing
- ✓ Production is truly production-ready
- ✓ Shows understanding of database progression

### Negative
- ✗ Must maintain migration system
- ✗ Potential SQL compatibility issues (minimal with care)

## Alternatives Considered

### Alternative 1: Always SQLite
- **Pros**: Single database everywhere, simpler
- **Cons**: Doesn't scale, not suitable for production
- **Rejected because**: Not production-ready

### Alternative 2: Always PostgreSQL (local Docker)
- **Pros**: Same database everywhere
- **Cons**: Slower onboarding, requires Docker, heavier local setup
- **Rejected because**: Slows development iteration

### Alternative 3: ORM (TypeORM, Prisma)
- **Pros**: Database abstraction, automatic migrations
- **Cons**: Hides SQL, less learning, over-engineered for this scope
- **Rejected because**: Want to understand raw SQL and migrations

## Implementation

### Development
```bash
npm run seed  # Runs migrations + seeds on SQLite
```

### Production
```bash
# Migrations run on Supabase PostgreSQL during deployment
npm run build && npm run migrate:prod
```

### Schema Design
- Stored as SQL migrations in `src/database/migrations/`
- Run automatically on server startup
- Tracked in git for version control

## Links

- Related: ADR 001 (Separate Frontend/Backend)
- Related: ADR 004 (Auth Strategy)

## Verification

This ADR is validated by:
1. Migration system implemented in `src/database/migrations.ts`
2. SQL migration files in `src/database/migrations/*.sql`
3. Seed script in `src/database/seed.ts`
4. Supabase project configured with PostgreSQL
