# DeftMail AI Coding Instructions

## Project Overview
DeftMail is a multi-tenant email hosting SaaS built with Next.js 15 (App Router) + Stalwart Mail Server. The architecture follows strict tenant isolation where each tenant (company) manages domains, creates email users, and accesses webmail.

**Core Flow**: Tenant signup → Add domain → Generate DKIM keys → Verify DNS → Create mailboxes in Stalwart → Access webmail via JMAP

## Architecture Principles

### Multi-Tenancy
- **Every database operation MUST filter by `tenantId`** - never expose cross-tenant data
- Auth flow creates both `Tenant` and `User` in a single transaction (see [auth.service.ts](../src/services/auth.service.ts#L26-L47))
- JWT payload includes `tenantId` for request-level isolation
- Prisma schema uses cascade deletes: `Tenant` → `Domain` → `MailUser`

### Service Layer Pattern
All business logic lives in `src/services/`, not API routes. API routes are thin controllers:
```typescript
// ✓ Correct: API route delegates to service
const result = await DomainService.createDomain(payload.tenantId, domain)

// ✗ Wrong: Business logic in API route
const domain = await prisma.domain.create({ ... })
```

Services to use:
- `AuthService` - signup/login, returns JWT tokens
- `DomainService` - creates domains, generates DKIM keys, orchestrates DNS verification
- `StalwartService` - HTTP client for Stalwart Admin API (create/delete accounts)
- `DKIMService` - generates RSA keypairs for DKIM signing
- `DNSService` - generates and verifies MX/SPF/DKIM/DMARC records

### Authentication Flow
1. JWT stored in **httpOnly cookie** named `token` (15min expiry)
2. Middleware ([middleware.ts](../src/middleware.ts)) uses Edge-compatible `jose` library for token verification
3. Protected routes: `/dashboard/*` and `/api/{domains,email-users}/*`
4. Token payload structure: `{ sub: userId, tenantId, email, role }`
5. Cookie extraction in API routes: `request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]`

### Stalwart Integration
- **Two-way sync required**: Operations must update both PostgreSQL and Stalwart
- Stalwart Admin API base URL: `process.env.STALWART_API_URL` (default: `http://localhost:8080`)
- When creating email users: 1) Create in Stalwart first, 2) Then save to DB
- When deleting: Reverse order (DB first, then Stalwart)
- Stalwart uses Bearer token auth: `Authorization: Bearer ${STALWART_ADMIN_TOKEN}`

## Development Workflows

### Local Setup
```powershell
# Start infrastructure (PostgreSQL, Redis, Stalwart)
docker-compose up -d

# Initialize database (SQLite for dev)
npm run db:push

# Run dev server
npm run dev
```

### Database Changes
- Using Prisma with **SQLite** for development (see [schema.prisma](../prisma/schema.prisma))
- After schema changes: `npm run db:push` (dev) or `npm run db:migrate` (prod)
- Always use snake_case for DB columns via `@map("snake_case")`
- Browse data: `npm run db:studio`

### API Route Patterns
All API routes follow this structure:
1. Extract and verify JWT token from cookies
2. Parse/validate request body with Zod schemas (`src/lib/validations/`)
3. Call service layer method with `tenantId` from JWT
4. Return JSON response with proper error handling

Example error handling:
```typescript
try {
  // operation
} catch (error: any) {
  if (error.name === 'ZodError') {
    return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
  }
  return NextResponse.json({ error: error.message }, { status: 400 })
}
```

## Critical Conventions

### Validation
- All user input validated with Zod schemas in `src/lib/validations/`
- Domain validation: Must check for valid FQDN format, lowercase normalization
- Email validation: Full RFC compliance via Zod's `.email()`

### DNS Record Generation
- DKIM keys generated once per domain (2048-bit RSA), stored in DB
- DNS records generated on-demand via `DNSService.generateDNSRecords()`
- Format example (see [dns.service.ts](../src/services/dns.service.ts)):
  - MX: `mail.deftmail.local` (priority 10)
  - SPF: `v=spf1 mx ~all`
  - DKIM: `default._domainkey` TXT with base64 public key
  - DMARC: `_dmarc` TXT with policy

### Error Messages
- User-facing errors: Generic ("Invalid credentials", "Domain not found")
- Console logging: Detailed with context (`console.error('Stalwart create account error:', error.response?.data)`)
- Never expose internal errors (DB constraints, stack traces) to API responses

## Key Files Reference
- **Architecture docs**: [ARCHITECTURE.md](../ARCHITECTURE.md), [PROJECT_PLAN.md](../PROJECT_PLAN.md)
- **Entry point**: [src/app/page.tsx](../src/app/page.tsx)
- **Auth middleware**: [src/middleware.ts](../src/middleware.ts) - JWT verification using `jose`
- **Database schema**: [prisma/schema.prisma](../prisma/schema.prisma) - SQLite with snake_case columns
- **Service layer**: [src/services/](../src/services/) - All business logic
- **API routes**: [src/app/api/](../src/app/api/) - Thin controllers

## Common Pitfalls
- **Don't forget tenant isolation**: Always filter by `tenantId` in queries
- **Two JWTs**: Use `jose` in middleware (Edge), `jsonwebtoken` in API routes (Node.js)
- **Stalwart sync**: Both systems must be updated for user/domain operations
- **Cookie security**: Set `httpOnly: true`, `secure` in production, `sameSite: 'lax'`
- **Prisma transactions**: Use for operations spanning multiple tables (e.g., tenant + user creation)
