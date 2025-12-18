# DeftMail - Technical Architecture Document

**Version:** 1.0  
**Date:** December 17, 2025  
**Status:** Architecture Design

---

## 📐 ARCHITECTURE OVERVIEW

DeftMail follows a modern, scalable architecture pattern with clear separation of concerns:

- **Frontend**: Next.js 14+ with React Server Components
- **Backend**: Next.js API Routes (later: separate Node.js service if needed)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and rate limiting
- **Mail Engine**: Stalwart Mail Server
- **Storage**: Object storage for attachments

---

## 🏗️ SYSTEM COMPONENTS

### 1. Web Application Layer

```
┌─────────────────────────────────────────────┐
│         NEXT.JS APPLICATION                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │   AUTH UI    │  │  DASHBOARD   │       │
│  │              │  │     UI       │       │
│  │ - Login      │  │ - Overview   │       │
│  │ - Signup     │  │ - Analytics  │       │
│  │ - Password   │  │              │       │
│  │   Reset      │  │              │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │   DOMAIN     │  │    EMAIL     │       │
│  │     UI       │  │    USER UI   │       │
│  │              │  │              │       │
│  │ - Add Domain │  │ - Add User   │       │
│  │ - DNS Setup  │  │ - Manage     │       │
│  │ - Verify     │  │ - Quotas     │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────────────────────┐         │
│  │      WEBMAIL INTERFACE       │         │
│  │                              │         │
│  │  - Inbox                     │         │
│  │  - Compose                   │         │
│  │  - Read/Reply                │         │
│  │  - Attachments               │         │
│  └──────────────────────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

#### Key Features
- **Server-Side Rendering**: Fast initial page loads
- **React Server Components**: Reduced bundle size
- **Client Components**: Interactive UI elements
- **Optimistic Updates**: Better UX
- **Real-time Updates**: WebSocket for new emails (optional)

---

### 2. API Layer

```
┌─────────────────────────────────────────────┐
│           API ROUTES (Next.js)              │
├─────────────────────────────────────────────┤
│                                             │
│  /api/auth                                  │
│    ├─ POST /signup                          │
│    ├─ POST /login                           │
│    ├─ POST /logout                          │
│    └─ POST /refresh                         │
│                                             │
│  /api/domains                               │
│    ├─ GET    /                             │
│    ├─ POST   /                             │
│    ├─ GET    /:id                          │
│    ├─ PUT    /:id                          │
│    ├─ DELETE /:id                          │
│    ├─ GET    /:id/dns-records              │
│    └─ POST   /:id/verify                   │
│                                             │
│  /api/users                                 │
│    ├─ GET    /                             │
│    ├─ POST   /                             │
│    ├─ GET    /:id                          │
│    ├─ PUT    /:id                          │
│    ├─ DELETE /:id                          │
│    ├─ PUT    /:id/password                 │
│    └─ PUT    /:id/status                   │
│                                             │
│  /api/webmail                               │
│    ├─ GET    /mailboxes                    │
│    ├─ GET    /messages                     │
│    ├─ GET    /messages/:id                 │
│    ├─ POST   /messages                     │
│    ├─ PUT    /messages/:id                 │
│    ├─ DELETE /messages/:id                 │
│    └─ POST   /messages/:id/attachments     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Middleware Stack
```javascript
Request
  ↓
[CORS Middleware]
  ↓
[Security Headers]
  ↓
[Rate Limiting]
  ↓
[Authentication]
  ↓
[Tenant Isolation]
  ↓
[Input Validation]
  ↓
[Request Handler]
  ↓
[Response Formatter]
  ↓
Response
```

---

### 3. Service Layer

```
┌─────────────────────────────────────────────┐
│              SERVICE LAYER                  │
├─────────────────────────────────────────────┤
│                                             │
│  AuthService                                │
│    - register()                             │
│    - login()                                │
│    - verifyToken()                          │
│    - refreshToken()                         │
│                                             │
│  DomainService                              │
│    - createDomain()                         │
│    - verifyDNS()                            │
│    - generateDNSRecords()                   │
│    - generateDKIM()                         │
│    - activateDomain()                       │
│                                             │
│  MailUserService                            │
│    - createUser()                           │
│    - updateUser()                           │
│    - deleteUser()                           │
│    - resetPassword()                        │
│    - checkQuota()                           │
│                                             │
│  StalwartService                            │
│    - addDomain()                            │
│    - createUser()                           │
│    - updatePassword()                       │
│    - deleteUser()                           │
│    - getQuota()                             │
│                                             │
│  JMAPService                                │
│    - getMailboxes()                         │
│    - getMessages()                          │
│    - sendMessage()                          │
│    - updateMessage()                        │
│                                             │
│  RateLimitService                           │
│    - checkLimit()                           │
│    - incrementCounter()                     │
│    - resetLimit()                           │
│                                             │
│  AuditService                               │
│    - logAction()                            │
│    - getAuditLog()                          │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 4. Data Layer

```
┌─────────────────────────────────────────────┐
│          POSTGRESQL DATABASE                │
├─────────────────────────────────────────────┤
│                                             │
│  Tables:                                    │
│    - tenants                                │
│    - users (auth)                           │
│    - domains                                │
│    - mail_users                             │
│    - rate_limits                            │
│    - audit_logs                             │
│    - sessions                               │
│                                             │
│  Indexes:                                   │
│    - tenant_id (all tables)                 │
│    - email (unique)                         │
│    - domain (unique per tenant)             │
│    - created_at                             │
│                                             │
│  Constraints:                               │
│    - Foreign keys (cascade delete)          │
│    - Unique constraints                     │
│    - Check constraints                      │
│                                             │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────┐
│              REDIS CACHE                    │
├─────────────────────────────────────────────┤
│                                             │
│  Sessions:                                  │
│    session:{id} → user data                 │
│                                             │
│  Rate Limits:                               │
│    ratelimit:{user}:{type} → counter        │
│                                             │
│  Cache:                                     │
│    domains:{tenant_id} → domain list        │
│    users:{domain_id} → user list            │
│                                             │
│  Queues (BullMQ):                           │
│    dns-verification                         │
│    email-quota-sync                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 5. Mail Engine Layer

```
┌─────────────────────────────────────────────┐
│        STALWART MAIL SERVER                 │
├─────────────────────────────────────────────┤
│                                             │
│  SMTP Server (Port 25, 587)                │
│    - Receive emails                         │
│    - Send emails                            │
│    - TLS encryption                         │
│    - Authentication                         │
│                                             │
│  IMAP Server (Port 143, 993)               │
│    - Email retrieval                        │
│    - Folder management                      │
│    - Message flags                          │
│                                             │
│  JMAP Server (Port 8080)                   │
│    - Modern email protocol                  │
│    - JSON-based API                         │
│    - Real-time updates                      │
│    - Used by webmail                        │
│                                             │
│  Security:                                  │
│    - SPF validation                         │
│    - DKIM signing/verification              │
│    - DMARC policy                           │
│    - Spam filtering                         │
│                                             │
│  Storage:                                   │
│    - Email messages                         │
│    - Attachments (< 1MB inline)             │
│    - User mailboxes                         │
│    - Quota management                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW DIAGRAMS

### User Registration Flow

```
┌────────┐
│ Client │
└───┬────┘
    │ 1. POST /api/auth/signup
    │    { email, password, company }
    ▼
┌────────────────┐
│   API Route    │
└───┬────────────┘
    │ 2. Validate input
    │ 3. Hash password
    ▼
┌────────────────┐
│  AuthService   │
└───┬────────────┘
    │ 4. Create tenant
    │ 5. Create user
    ▼
┌────────────────┐
│   Database     │
└───┬────────────┘
    │ 6. Return user data
    ▼
┌────────────────┐
│   API Route    │
└───┬────────────┘
    │ 7. Generate JWT
    │ 8. Create session
    ▼
┌────────────────┐
│     Redis      │
└───┬────────────┘
    │ 9. Return token
    ▼
┌────────────────┐
│     Client     │
└────────────────┘
```

### Domain Setup Flow

```
┌────────┐
│ Client │
└───┬────┘
    │ 1. POST /api/domains
    │    { domain: "kumar.com" }
    ▼
┌─────────────────┐
│   API Route     │
└───┬─────────────┘
    │ 2. Validate domain
    │ 3. Check tenant limits
    ▼
┌─────────────────┐
│  DomainService  │
└───┬─────────────┘
    │ 4. Generate DKIM keys
    │ 5. Create DNS records
    ▼
┌─────────────────┐
│    Database     │
└───┬─────────────┘
    │ 6. Save domain (status: pending)
    │ 7. Return DNS records
    ▼
┌─────────────────┐
│     Client      │
│  (Show DNS      │
│   instructions) │
└───┬─────────────┘
    │ User adds DNS records
    │ 8. Click "Verify"
    ▼
┌─────────────────┐
│   API Route     │
│  POST /verify   │
└───┬─────────────┘
    │ 9. Queue verification job
    ▼
┌─────────────────┐
│   Background    │
│      Job        │
└───┬─────────────┘
    │ 10. Check DNS records
    │     - MX
    │     - SPF
    │     - DKIM
    │     - DMARC
    ▼
┌─────────────────┐
│  DNS Servers    │
└───┬─────────────┘
    │ 11. Return records
    ▼
┌─────────────────┐
│   Background    │
│      Job        │
└───┬─────────────┘
    │ 12. If all verified:
    ▼
┌─────────────────┐
│ StalwartService │
└───┬─────────────┘
    │ 13. Add domain to Stalwart
    │ 14. Configure DKIM
    ▼
┌─────────────────┐
│    Stalwart     │
└───┬─────────────┘
    │ 15. Domain active
    ▼
┌─────────────────┐
│    Database     │
│ (status: active)│
└─────────────────┘
```

### Email Sending Flow (Webmail)

```
┌────────┐
│ Client │
│(Webmail)│
└───┬────┘
    │ 1. POST /api/webmail/messages
    │    { to, subject, body, attachments }
    ▼
┌─────────────────┐
│   API Route     │
└───┬─────────────┘
    │ 2. Check rate limit
    ▼
┌─────────────────┐
│ RateLimitService│
└───┬─────────────┘
    │ 3. If allowed:
    ▼
┌─────────────────┐
│   JMAPService   │
└───┬─────────────┘
    │ 4. Upload attachments
    ▼
┌─────────────────┐
│ Object Storage  │
└───┬─────────────┘
    │ 5. Get attachment URLs
    ▼
┌─────────────────┐
│   JMAPService   │
└───┬─────────────┘
    │ 6. Send via JMAP
    ▼
┌─────────────────┐
│    Stalwart     │
│  (JMAP Server)  │
└───┬─────────────┘
    │ 7. Queue for delivery
    │ 8. SMTP send
    ▼
┌─────────────────┐
│  Recipient's    │
│  Mail Server    │
└───┬─────────────┘
    │ 9. Delivery status
    ▼
┌─────────────────┐
│   AuditService  │
└───┬─────────────┘
    │ 10. Log send event
    ▼
┌─────────────────┐
│    Database     │
└───┬─────────────┘
    │ 11. Return success
    ▼
┌─────────────────┐
│     Client      │
└─────────────────┘
```

---

## 🔐 SECURITY ARCHITECTURE

### Authentication Flow

```
1. User Login
   ↓
2. Verify credentials (bcrypt)
   ↓
3. Generate JWT (15min expiry)
   ↓
4. Generate Refresh Token (7 days)
   ↓
5. Store refresh token in Redis
   ↓
6. Return both tokens
   ↓
7. Client stores in httpOnly cookies
```

### Token Structure

```javascript
// Access Token (JWT)
{
  "sub": "user_id",
  "tenant_id": "tenant_uuid",
  "email": "user@example.com",
  "role": "owner",
  "iat": 1234567890,
  "exp": 1234568790  // 15 minutes
}

// Refresh Token (opaque)
{
  "token": "random_uuid",
  "user_id": "user_uuid",
  "expires_at": "timestamp"
}
```

### Request Authentication

```
Client Request
  ↓
[Extract JWT from cookie/header]
  ↓
[Verify JWT signature]
  ↓
[Check expiry]
  ↓
[Load tenant_id]
  ↓
[Attach to request context]
  ↓
Continue to handler
```

### Tenant Isolation

```javascript
// Middleware
async function tenantIsolation(req, res, next) {
  // Already authenticated
  const tenantId = req.user.tenant_id;
  
  // All queries must include tenant_id
  req.db = {
    findMany: (table, where) => {
      return prisma[table].findMany({
        where: { ...where, tenant_id: tenantId }
      });
    },
    // ... other methods
  };
  
  next();
}
```

### API Security Headers

```javascript
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
}
```

---

## 📊 DATABASE ARCHITECTURE

### Entity Relationship Diagram

```
┌──────────────┐
│   tenants    │
│              │
│ id (PK)      │
│ company_name │
│ owner_email  │
│ plan         │
│ status       │
└──────┬───────┘
       │
       │ 1:N
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  users   │   │ domains  │   │audit_logs│   │sessions  │
│          │   │          │   │          │   │          │
│ id (PK)  │   │ id (PK)  │   │ id (PK)  │   │ id (PK)  │
│tenant_id │   │tenant_id │   │tenant_id │   │tenant_id │
│ email    │   │ domain   │   │ action   │   │ token    │
│password  │   │ status   │   │ details  │   │user_id   │
└──────────┘   └────┬─────┘   └──────────┘   └──────────┘
                    │
                    │ 1:N
                    │
                    ▼
             ┌──────────────┐
             │  mail_users  │
             │              │
             │ id (PK)      │
             │ tenant_id    │
             │ domain_id    │
             │ email        │
             │ status       │
             │ quota_mb     │
             │ used_quota   │
             └──────┬───────┘
                    │
                    │ 1:N
                    │
                    ▼
             ┌──────────────┐
             │ rate_limits  │
             │              │
             │ id (PK)      │
             │mail_user_id  │
             │ limit_type   │
             │current_count │
             │ max_limit    │
             │ reset_at     │
             └──────────────┘
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_domains_tenant_status ON domains(tenant_id, status);
CREATE INDEX idx_mail_users_domain ON mail_users(domain_id);
CREATE INDEX idx_mail_users_email ON mail_users(email);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_rate_limits_user_type ON rate_limits(mail_user_id, limit_type);

-- Unique constraints
CREATE UNIQUE INDEX uniq_domains_tenant_domain ON domains(tenant_id, domain);
CREATE UNIQUE INDEX uniq_mail_users_email ON mail_users(email);
CREATE UNIQUE INDEX uniq_tenants_owner_email ON tenants(owner_email);
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Caching Strategy

```
┌─────────────────────────────────────┐
│         CACHING LAYERS              │
├─────────────────────────────────────┤
│                                     │
│  1. Browser Cache                   │
│     - Static assets (CSS, JS)       │
│     - Images                        │
│     - Fonts                         │
│     Cache-Control: max-age=31536000 │
│                                     │
│  2. CDN Cache (Cloudflare)          │
│     - Static pages                  │
│     - API responses (selective)     │
│     Cache-Control: s-maxage=3600    │
│                                     │
│  3. Redis Cache                     │
│     - Domain lists                  │
│     - User lists                    │
│     - DNS records                   │
│     - Rate limit counters           │
│     TTL: 300-3600 seconds           │
│                                     │
│  4. Database Query Cache            │
│     - Prepared statements           │
│     - Connection pooling            │
│                                     │
└─────────────────────────────────────┘
```

### Query Optimization

```javascript
// Bad: N+1 queries
const domains = await prisma.domain.findMany({ 
  where: { tenant_id } 
});
for (const domain of domains) {
  const users = await prisma.mailUser.findMany({ 
    where: { domain_id: domain.id } 
  });
}

// Good: Single query with includes
const domains = await prisma.domain.findMany({
  where: { tenant_id },
  include: {
    mail_users: {
      select: { id: true, email: true, status: true }
    }
  }
});
```

### Pagination

```javascript
// Cursor-based pagination (better for large datasets)
async function getEmails(mailboxId, cursor, limit = 50) {
  const emails = await jmap.getMessages({
    mailboxId,
    limit,
    cursor: cursor || null,
    sort: [{ property: 'receivedAt', isAscending: false }]
  });
  
  return {
    data: emails,
    nextCursor: emails[emails.length - 1]?.id,
    hasMore: emails.length === limit
  };
}
```

---

## 🔧 DEPLOYMENT ARCHITECTURE

### Docker Compose Setup

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/deftmail
      - REDIS_URL=redis://redis:6379
      - STALWART_HOST=stalwart
    depends_on:
      - postgres
      - redis
      - stalwart

  postgres:
    image: postgres:15
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=deftmail
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=secure_password

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

  stalwart:
    image: stalwartlabs/mail-server:latest
    ports:
      - "25:25"
      - "587:587"
      - "143:143"
      - "993:993"
      - "8080:8080"
    volumes:
      - stalwart-data:/opt/stalwart-mail/data
      - ./config/stalwart:/opt/stalwart-mail/etc

volumes:
  postgres-data:
  redis-data:
  stalwart-data:
```

### Production Infrastructure

```
                    Internet
                        │
                        ▼
              ┌──────────────────┐
              │   Load Balancer  │
              │   (Cloudflare)   │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌─────────────────┐
│   Web App VPS   │        │  Mail Server    │
│                 │        │      VPS        │
│  - Next.js      │        │                 │
│  - Node.js      │        │  - Stalwart     │
│  - Nginx        │        │  - Port 25, 587 │
│                 │        │  - Port 143, 993│
│                 │        │  - Port 8080    │
└────────┬────────┘        └────────┬────────┘
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Database VPS        │
        │                       │
        │  - PostgreSQL         │
        │  - Redis              │
        │  - Backups            │
        └───────────────────────┘
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Horizontal Scaling

```
Load Balancer
    │
    ├─── App Server 1
    ├─── App Server 2
    ├─── App Server 3
    └─── App Server N
         │
         ├─── Database (Primary/Replica)
         ├─── Redis (Cluster)
         └─── Object Storage
```

### Database Scaling

1. **Read Replicas**: For heavy read workloads
2. **Connection Pooling**: PgBouncer
3. **Partitioning**: By tenant_id (future)
4. **Sharding**: Multi-region deployment (future)

### Mail Server Scaling

1. **Multiple Stalwart Instances**: Round-robin DNS
2. **Dedicated IPs**: Per Stalwart instance
3. **Message Queue**: For delivery retries
4. **Rate Limiting**: Per-instance quotas

---

## 🎯 MONITORING & OBSERVABILITY

### Metrics to Track

```
Application Metrics:
  - Request rate (req/sec)
  - Response time (p50, p95, p99)
  - Error rate (%)
  - Active users
  - API endpoint performance

Database Metrics:
  - Connection pool usage
  - Query execution time
  - Slow queries (>100ms)
  - Cache hit rate

Mail Metrics:
  - Emails sent/received
  - Delivery rate (%)
  - Bounce rate (%)
  - Queue length
  - SMTP connection count

Business Metrics:
  - Active tenants
  - Domains verified
  - Email users created
  - Storage used
  - Revenue (MRR)
```

### Logging Strategy

```javascript
// Structured logging
{
  "level": "info",
  "timestamp": "2025-12-17T10:30:00Z",
  "service": "api",
  "tenant_id": "uuid",
  "user_id": "uuid",
  "action": "domain.verify",
  "domain": "kumar.com",
  "result": "success",
  "duration_ms": 234,
  "ip": "1.2.3.4"
}
```

---

## 🔍 API DOCUMENTATION

### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: DeftMail API
  version: 1.0.0
  description: Multi-tenant email hosting platform API

servers:
  - url: https://api.deftmail.com/v1

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []

paths:
  /auth/signup:
    post:
      summary: Register new tenant
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                company_name:
                  type: string
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: Tenant created successfully
        '400':
          description: Invalid input
        '409':
          description: Email already exists

  /domains:
    get:
      summary: List domains for tenant
      responses:
        '200':
          description: List of domains
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Domain'
    
    post:
      summary: Add new domain
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                domain:
                  type: string
                  example: "kumar.com"
      responses:
        '201':
          description: Domain created
        '400':
          description: Invalid domain
        '409':
          description: Domain already exists

# ... more endpoints
```

---

## 📝 CONFIGURATION MANAGEMENT

### Environment Variables

```bash
# App
NODE_ENV=production
PORT=3000
APP_URL=https://deftmail.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/deftmail
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=secure_password

# JWT
JWT_SECRET=very_secure_random_string
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Stalwart
STALWART_HOST=mail.deftmail.com
STALWART_ADMIN_PORT=8080
STALWART_ADMIN_TOKEN=admin_token

# Object Storage
S3_BUCKET=deftmail-attachments
S3_REGION=us-east-1
S3_ACCESS_KEY=key
S3_SECRET_KEY=secret

# Email
SMTP_HOST=mail.deftmail.com
SMTP_PORT=587
FROM_EMAIL=noreply@deftmail.com

# Monitoring
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production

# Rate Limiting
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX=100  # requests per window
```

---

## 🧪 TESTING STRATEGY

### Test Pyramid

```
        /\
       /  \
      / E2E\        <- 10% (Happy path, Critical flows)
     /      \
    /────────\
   /          \
  / Integration\   <- 30% (API endpoints, DB operations)
 /              \
/────────────────\
│      Unit      │ <- 60% (Services, Utils, Logic)
└────────────────┘
```

### Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Security Tests**: Penetration testing
- **Load Tests**: 1000 concurrent users

---

**This architecture is designed to be:**
- ✅ **Scalable**: Can grow from 1 to 10,000 users
- ✅ **Secure**: Multi-layered security approach
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Observable**: Comprehensive monitoring
- ✅ **Cost-effective**: Efficient resource usage

---

**Next: Begin implementation with Sprint 1** 🚀
