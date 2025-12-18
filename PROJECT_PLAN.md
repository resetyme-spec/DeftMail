# DeftMail - Email Hosting SaaS Platform

**Project Start Date:** December 17, 2025  
**Status:** Planning & Architecture Phase  
**Target:** Beat Zoho Mail Starter, Not Gmail

---

## 🎯 PROJECT VISION

A multi-tenant email hosting SaaS where users can:
- Sign up for an account (one account = one company)
- Add custom domains (e.g., kumar.com)
- Verify DNS configuration
- Create email addresses (e.g., care@kumar.com)
- Use a modern webmail interface
- Manage their email infrastructure

### Key Differentiators
- Business-focused email hosting
- Integration with HostelWeb (killer advantage)
- Clean, modern interface
- Affordable pricing
- Easy DNS setup and verification

---

## 🧱 SYSTEM ARCHITECTURE

### High-Level Components

```
┌─────────────────────────────────────────────────────┐
│           NEXT.JS WEB APPLICATION                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  - Auth (Signup/Login)                       │  │
│  │  - Domain Setup UI                           │  │
│  │  - DNS Instructions UI                       │  │
│  │  - Email User Manager                        │  │
│  │  - Webmail Interface (JMAP)                  │  │
│  │  - Billing (Phase 2)                         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND API (Node.js)                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  - User Management                           │  │
│  │  - Domain Verification                       │  │
│  │  - DNS Checker                               │  │
│  │  - Stalwart Admin API Integration            │  │
│  │  - Rate Limiting & Abuse Protection          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│         STALWART MAIL SERVER (Mail Engine)          │
│  ┌──────────────────────────────────────────────┐  │
│  │  - Multi-domain Support                      │  │
│  │  - SMTP/IMAP/JMAP Protocols                  │  │
│  │  - DKIM/SPF/DMARC                            │  │
│  │  - User Authentication                       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE                      │
│  - VPS (Mail Server)                                │
│  - VPS (Web Application)                            │
│  - PostgreSQL Database                              │
│  - Object Storage (Attachments)                     │
│  - Redis (Caching & Rate Limiting)                  │
└─────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Registration** → Creates tenant in database
2. **Domain Addition** → Generates DNS records, stores in DB
3. **DNS Verification** → Background job checks DNS records
4. **Domain Activation** → Configures Stalwart for the domain
5. **Mailbox Creation** → Creates user in Stalwart + stores in DB
6. **Email Operations** → Webmail ↔ JMAP ↔ Stalwart

---

## 🧩 MVP FEATURE LIST

### Phase 1: Core Functionality (MVP)

#### ✅ 1. Authentication & Tenant Isolation
- User signup/login with email verification
- One account = one company/tenant
- Secure session management
- Tenant-based data isolation
- Role-based access control (Owner, Admin)

#### ✅ 2. Domain Management
- Add custom domain
- Generate DNS records (MX, SPF, DKIM, DMARC)
- Display DNS setup instructions
- Verify DNS configuration
- Activate domain for email hosting
- Domain status tracking (pending, verified, active)

#### ✅ 3. Email User Management
- Create mailbox (email@domain.com)
- Set/reset passwords
- Enable/disable mailboxes
- View mailbox list
- Mailbox status management

#### ✅ 4. Webmail Interface
- Inbox view with email listing
- Read email (full view)
- Compose new email
- Reply / Reply All
- Forward emails
- Attachment upload/download
- Basic folder management (Inbox, Sent, Trash)

#### ✅ 5. Abuse Protection (Basic)
- Limit mailboxes per tenant (plan-based)
- Rate limit: emails per user per day
- Rate limit: emails per domain per day
- Temporary blocks for suspicious activity
- Logging and monitoring

### Phase 2: Enhanced Features (Post-MVP)
- Billing integration (Stripe)
- Email aliases
- Catch-all addresses
- Email forwarding rules
- Auto-responders
- Email templates
- Advanced spam filtering
- Mobile app

---

## 🗂️ DATABASE SCHEMA

### Core Tables

#### `tenants`
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL UNIQUE,
  owner_name VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free', -- free, starter, business, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
  max_domains INT DEFAULT 1,
  max_users_per_domain INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `domains`
```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, active, failed
  dkim_selector VARCHAR(100) DEFAULT 'default',
  dkim_public_key TEXT,
  dkim_private_key TEXT,
  mx_verified BOOLEAN DEFAULT FALSE,
  spf_verified BOOLEAN DEFAULT FALSE,
  dkim_verified BOOLEAN DEFAULT FALSE,
  dmarc_verified BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, domain)
);
```

#### `mail_users`
```sql
CREATE TABLE mail_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, disabled, suspended
  password_hash TEXT, -- stored securely
  quota_mb INT DEFAULT 1024, -- 1GB default
  used_quota_mb INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

#### `rate_limits`
```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mail_user_id UUID REFERENCES mail_users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  limit_type VARCHAR(50) NOT NULL, -- daily_send, hourly_send
  current_count INT DEFAULT 0,
  max_limit INT NOT NULL,
  reset_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES mail_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- domain_added, user_created, email_sent, etc.
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_domains_tenant ON domains(tenant_id);
CREATE INDEX idx_domains_status ON domains(status);
CREATE INDEX idx_mail_users_tenant ON mail_users(tenant_id);
CREATE INDEX idx_mail_users_domain ON mail_users(domain_id);
CREATE INDEX idx_mail_users_email ON mail_users(email);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_rate_limits_user ON rate_limits(mail_user_id);
```

---

## 🛠️ STALWART INTEGRATION STRATEGY

### Overview
- **One Stalwart instance** serves all tenants (multi-tenant)
- **Your app** = Control plane (manages domains, users, settings)
- **Stalwart** = Mail engine (handles actual email operations)

### Integration Methods

#### 1. Domain Management
```bash
# Add domain to Stalwart
stalwart-cli domain add kumar.com

# Generate DKIM keys
stalwart-cli dkim generate kumar.com --selector default

# Configure domain
stalwart-cli domain configure kumar.com --enable
```

#### 2. User Management
```bash
# Create email user
stalwart-cli user create care@kumar.com --password "secure_pass" --quota 1GB

# Disable user
stalwart-cli user disable care@kumar.com

# Reset password
stalwart-cli user password care@kumar.com --new-password "new_pass"
```

#### 3. Programmatic Access
```javascript
// Use Stalwart Admin API (if available) or CLI wrapper
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function createMailUser(email, password, quota) {
  const command = `stalwart-cli user create ${email} --password "${password}" --quota ${quota}GB`;
  const { stdout, stderr } = await execPromise(command);
  return { success: true, output: stdout };
}
```

#### 4. Configuration Strategy
- Store Stalwart CLI path in environment variables
- Use Docker exec for containerized Stalwart
- Implement retry logic for failed operations
- Log all Stalwart operations for debugging

### Docker Setup Example
```yaml
version: '3.8'
services:
  stalwart:
    image: stalwartlabs/mail-server:latest
    ports:
      - "25:25"    # SMTP
      - "143:143"  # IMAP
      - "993:993"  # IMAPS
      - "587:587"  # Submission
      - "8080:8080" # JMAP
    volumes:
      - stalwart-data:/opt/stalwart-mail/data
      - ./config:/opt/stalwart-mail/etc
    environment:
      - STALWART_ADMIN_PASSWORD=your_admin_password
    restart: unless-stopped

volumes:
  stalwart-data:
```

---

## 🔐 SECURITY & MULTI-TENANCY

### Tenant Isolation Strategy

#### 1. Database Level
- Every query includes `tenant_id` in WHERE clause
- Row-level security (PostgreSQL RLS) for extra protection
- Foreign keys ensure data integrity

#### 2. API Level
```javascript
// Middleware example
async function tenantIsolation(req, res, next) {
  const userId = req.session.userId;
  const tenant = await db.query(
    'SELECT tenant_id FROM users WHERE id = $1',
    [userId]
  );
  req.tenantId = tenant.tenant_id;
  next();
}

// Usage in routes
app.get('/api/domains', tenantIsolation, async (req, res) => {
  const domains = await db.query(
    'SELECT * FROM domains WHERE tenant_id = $1',
    [req.tenantId]
  );
  res.json(domains);
});
```

#### 3. Access Control
- **Owner**: Full access to tenant resources
- **Admin**: Manage domains and users, no billing
- **User**: Access webmail only (future role)

### Security Best Practices
- ✅ HTTPS only (TLS 1.3)
- ✅ JWT tokens with short expiry
- ✅ Password hashing (bcrypt, cost factor 12)
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (content security policy)
- ✅ Audit logging for all sensitive operations

---

## 📊 DNS VERIFICATION FLOW

### Step-by-Step Process

#### 1. User Adds Domain
```javascript
POST /api/domains
{
  "domain": "kumar.com"
}
```

#### 2. System Generates DNS Records
```javascript
// Generate DKIM keys
const { publicKey, privateKey } = await generateDKIMKeys();

// Create DNS records
const dnsRecords = {
  MX: [
    { priority: 10, value: "mail.deftmail.com" }
  ],
  SPF: {
    name: "@",
    type: "TXT",
    value: "v=spf1 mx include:deftmail.com ~all"
  },
  DKIM: {
    name: `default._domainkey`,
    type: "TXT",
    value: publicKey
  },
  DMARC: {
    name: "_dmarc",
    type: "TXT",
    value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@deftmail.com"
  }
};
```

#### 3. Display Instructions to User
```
Please add the following DNS records to kumar.com:

MX Record:
  Priority: 10
  Value: mail.deftmail.com

TXT Records:
  Name: @
  Value: v=spf1 mx include:deftmail.com ~all

  Name: default._domainkey
  Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA...

  Name: _dmarc
  Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@deftmail.com
```

#### 4. Background Verification Job
```javascript
const dns = require('dns').promises;

async function verifyDNS(domain, expectedRecords) {
  const results = {
    mx: false,
    spf: false,
    dkim: false,
    dmarc: false
  };

  // Check MX
  try {
    const mxRecords = await dns.resolveMx(domain);
    results.mx = mxRecords.some(r => r.exchange.includes('deftmail.com'));
  } catch (e) {}

  // Check SPF
  try {
    const txtRecords = await dns.resolveTxt(domain);
    const spf = txtRecords.flat().find(r => r.startsWith('v=spf1'));
    results.spf = spf && spf.includes('deftmail.com');
  } catch (e) {}

  // Check DKIM
  try {
    const dkimRecords = await dns.resolveTxt(`default._domainkey.${domain}`);
    results.dkim = dkimRecords.flat().some(r => r.includes('v=DKIM1'));
  } catch (e) {}

  // Check DMARC
  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    results.dmarc = dmarcRecords.flat().some(r => r.startsWith('v=DMARC1'));
  } catch (e) {}

  return results;
}
```

#### 5. Mark Domain as Verified
- All 4 checks pass → Status: `verified`
- Activate domain in Stalwart
- User can now create mailboxes

---

## ⚡ RATE LIMITING & ABUSE PROTECTION

### Rate Limit Tiers

| Limit Type | Free Plan | Starter Plan | Business Plan |
|------------|-----------|--------------|---------------|
| Emails/user/day | 50 | 300 | 1,000 |
| Emails/domain/day | 250 | 1,500 | 5,000 |
| Max domains | 1 | 3 | 10 |
| Max users/domain | 5 | 25 | 100 |

### Implementation Strategy

#### 1. Token Bucket Algorithm
```javascript
class RateLimiter {
  async checkLimit(userId, limitType) {
    const limit = await redis.get(`ratelimit:${userId}:${limitType}`);
    if (!limit) {
      await this.resetLimit(userId, limitType);
      return true;
    }
    
    const { count, max, resetAt } = JSON.parse(limit);
    
    if (Date.now() > resetAt) {
      await this.resetLimit(userId, limitType);
      return true;
    }
    
    if (count >= max) {
      return false; // Rate limit exceeded
    }
    
    await redis.set(
      `ratelimit:${userId}:${limitType}`,
      JSON.stringify({ count: count + 1, max, resetAt })
    );
    
    return true;
  }
}
```

#### 2. Abuse Detection
- Track sending patterns
- Flag suspicious activity (bulk sends, rapid sends)
- Temporary blocks (1 hour, 24 hours)
- Manual review queue

#### 3. Logging
- Log all email sends with metadata
- Track failed delivery attempts
- Monitor bounce rates
- Alert on anomalies

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Infrastructure Requirements

#### Production Setup
```
Load Balancer (Cloudflare/Nginx)
    │
    ├── Web App VPS (2 vCPU, 4GB RAM)
    │   └── Next.js Application
    │   └── Node.js API
    │
    ├── Mail Server VPS (4 vCPU, 8GB RAM)
    │   └── Stalwart Mail Server
    │   └── Port 25, 587, 143, 993, 8080
    │
    └── Database VPS (2 vCPU, 4GB RAM)
        └── PostgreSQL
        └── Redis
```

#### Object Storage
- Cloudflare R2 / DigitalOcean Spaces / AWS S3
- Store email attachments (>1MB)
- Store user uploads

#### Monitoring
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Log aggregation (Better Stack)
- Performance monitoring (Vercel Analytics)

### Backup Strategy
- **Database**: Daily automated backups, 30-day retention
- **Mail Data**: Incremental backups every 6 hours
- **Config Files**: Version-controlled (Git)

---

## 📋 MVP LAUNCH CHECKLIST

### Pre-Launch (Development)
- [ ] Database schema implemented
- [ ] Authentication system working
- [ ] Domain management complete
- [ ] DNS verification functional
- [ ] Stalwart integration tested
- [ ] Email user CRUD operations
- [ ] Webmail interface functional
- [ ] Rate limiting implemented
- [ ] Security audit completed
- [ ] Unit tests written (>70% coverage)

### Launch Preparation
- [ ] Production servers provisioned
- [ ] SSL certificates installed
- [ ] DNS configured (deftmail.com)
- [ ] Stalwart configured for production
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Monitoring tools configured
- [ ] Backup automation tested
- [ ] Email deliverability tested
- [ ] Load testing completed

### Legal & Compliance
- [ ] Privacy Policy written
- [ ] Terms of Service written
- [ ] GDPR compliance reviewed
- [ ] CAN-SPAM compliance checked
- [ ] Cookie consent implemented
- [ ] Data retention policy defined

### Marketing & Launch
- [ ] Landing page live
- [ ] Documentation written
- [ ] Pricing page finalized
- [ ] Payment processing (Stripe) tested
- [ ] Support email setup
- [ ] Beta users invited
- [ ] Launch announcement ready

---

## 💰 BUSINESS MODEL

### Pricing Strategy (Paid-Only)

#### Starter Plan - $9/month
- 1 custom domain
- 10 email accounts
- 10GB storage per account
- 300 emails/user/day
- Webmail access
- Email support

#### Business Plan - $29/month
- 5 custom domains
- 50 email accounts
- 50GB storage per account
- 1,000 emails/user/day
- Priority support
- API access

#### Enterprise Plan - Custom
- Unlimited domains
- Unlimited email accounts
- Custom storage
- Custom rate limits
- Dedicated support
- SLA guarantee
- White-label option

### Revenue Projections (Year 1)
- Target: 100 paying customers
- Average: $15/month (mix of plans)
- Monthly: $1,500
- Annual: $18,000

---

## 🔄 DEVELOPMENT PHASES

### Phase 1: Foundation (Weeks 1-2)
- Project setup & monorepo structure
- Database design & migrations
- Authentication system
- Basic UI components

### Phase 2: Domain Management (Weeks 3-4)
- Domain CRUD operations
- DNS record generation
- DNS verification logic
- Stalwart integration (domains)

### Phase 3: Email Users (Weeks 5-6)
- Mailbox CRUD operations
- Stalwart integration (users)
- Password management
- Quota tracking

### Phase 4: Webmail (Weeks 7-9)
- JMAP client implementation
- Inbox UI
- Compose/Reply functionality
- Attachment handling

### Phase 5: Polish & Launch (Weeks 10-12)
- Rate limiting
- Abuse protection
- Security hardening
- Testing & bug fixes
- Documentation
- Beta launch

---

## 🎯 SUCCESS METRICS

### Technical KPIs
- Email delivery rate: >99%
- DNS verification success: >95%
- Webmail uptime: >99.5%
- API response time: <200ms (p95)
- Zero critical security issues

### Business KPIs
- 10 paying customers in month 1
- 50 paying customers in month 3
- 100 paying customers in month 6
- Monthly Recurring Revenue (MRR): $1,500+
- Customer churn: <5%

---

## 🔗 INTEGRATION WITH HOSTELWEB

### Killer Feature: Automatic Email for Hosted Websites

When user purchases web hosting on HostelWeb:
1. Automatically suggest email hosting
2. Pre-fill domain name
3. One-click email setup
4. Bundled pricing discount

### Technical Integration
```javascript
// HostelWeb webhook
POST /api/integrations/hostelweb/provision
{
  "customer_id": "hw_12345",
  "domain": "kumar.com",
  "plan": "starter",
  "auto_setup": true
}

// DeftMail response
{
  "success": true,
  "tenant_id": "uuid",
  "domain_id": "uuid",
  "dns_records": {...},
  "setup_url": "https://deftmail.com/setup/xyz"
}
```

### Value Proposition
- **For HostelWeb**: Upsell opportunity, customer retention
- **For DeftMail**: Instant customer acquisition, lower CAC
- **For Customer**: Seamless experience, one provider

---

## 📚 TECHNOLOGY STACK

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes (initially)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma / Drizzle ORM
- **Caching**: Redis
- **Queue**: BullMQ (for background jobs)

### Mail Infrastructure
- **Mail Server**: Stalwart Mail Server
- **Protocol**: JMAP (webmail), SMTP/IMAP (compatibility)
- **DNS Libraries**: node:dns, dns-promises

### DevOps
- **Hosting**: VPS (Hetzner / DigitalOcean / Vultr)
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Better Stack, Sentry
- **Analytics**: Plausible / Umami

---

## 🎓 LEARNING RESOURCES

### Stalwart Documentation
- https://stalw.art/docs/
- https://github.com/stalwartlabs/mail-server

### JMAP Protocol
- https://jmap.io/
- RFC 8620 (JMAP Core)
- RFC 8621 (JMAP Mail)

### Email Best Practices
- SPF: RFC 7208
- DKIM: RFC 6376
- DMARC: RFC 7489
- Email deliverability guides

---

## ⚠️ RISKS & MITIGATION

### Technical Risks
1. **Email Deliverability**: Warm up IPs, monitor reputation
2. **Spam Abuse**: Strict rate limits, abuse detection
3. **Data Loss**: Automated backups, replication
4. **Downtime**: High availability setup, monitoring

### Business Risks
1. **Low Adoption**: Focus on HostelWeb integration first
2. **Competition**: Differentiate with better UX, integrations
3. **Regulatory**: Compliance from day 1 (GDPR, CAN-SPAM)
4. **Support Load**: Self-service docs, automated responses

---

## 🏁 CONCLUSION

This is a **realistic, buildable plan** for a competitive email hosting SaaS.

**Key Success Factors:**
1. Start with paid plans only (no free tier initially)
2. Focus on business customers, not consumers
3. Leverage HostelWeb integration as primary growth channel
4. Maintain high email deliverability (>99%)
5. Provide excellent customer support

**Timeline:** 12 weeks to MVP launch  
**Budget:** <$500/month infrastructure  
**Team:** 1-2 developers initially

---

**Next Steps:**
1. Review and validate this plan
2. Set up development environment
3. Create monorepo structure
4. Begin Phase 1 development

**Let's build this! 🚀**
