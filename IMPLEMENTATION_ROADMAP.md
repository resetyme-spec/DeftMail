# DeftMail Implementation Roadmap

**Last Updated:** December 17, 2025  
**Status:** Ready to Begin Development

---

## 🎯 OVERVIEW

This roadmap breaks down the entire DeftMail project into actionable sprints with specific deliverables, estimated timelines, and dependencies.

---

## 📅 SPRINT BREAKDOWN (12 Weeks)

### SPRINT 1: Project Foundation (Week 1-2)

#### Goals
- Set up development environment
- Initialize monorepo structure
- Configure tooling and dependencies
- Set up database

#### Tasks

##### Week 1: Setup & Infrastructure
- [x] Create project plan document
- [ ] Initialize Git repository
- [ ] Set up Next.js monorepo with TypeScript
  - [ ] Configure ESLint, Prettier
  - [ ] Set up path aliases (@/, @/components, etc.)
  - [ ] Configure Tailwind CSS
- [ ] Install core dependencies
  - [ ] next, react, react-dom
  - [ ] typescript, @types/*
  - [ ] tailwindcss, shadcn/ui
  - [ ] prisma or drizzle-orm
  - [ ] zod, react-hook-form
- [ ] Create folder structure
  ```
  /src
    /app (Next.js app router)
    /components
    /lib
    /services
  /prisma (database schema)
  /scripts
  /docs
  ```

##### Week 2: Database & Authentication
- [ ] Design database schema in detail
- [ ] Set up PostgreSQL (local Docker)
- [ ] Set up Redis (local Docker)
- [ ] Create Prisma schema
- [ ] Run initial migrations
- [ ] Implement authentication system
  - [ ] User registration API
  - [ ] Login API
  - [ ] JWT token generation
  - [ ] Session management
  - [ ] Password hashing (bcrypt)
- [ ] Create auth middleware
- [ ] Build login/signup UI pages

#### Deliverables
- ✅ Working Next.js app with TypeScript
- ✅ Database running with initial schema
- ✅ Authentication system (signup, login, logout)
- ✅ Protected route middleware

#### Testing Checklist
- [ ] User can register
- [ ] User can login
- [ ] JWT tokens are generated correctly
- [ ] Protected routes redirect to login
- [ ] Passwords are hashed

---

### SPRINT 2: Domain Management System (Week 3-4)

#### Goals
- Build complete domain management workflow
- Implement DNS record generation
- Create domain verification logic
- Build domain management UI

#### Tasks

##### Week 3: Backend - Domain Operations
- [ ] Create domains table & migrations
- [ ] Build domain service layer
  - [ ] Add domain
  - [ ] Generate DNS records
  - [ ] Generate DKIM keys
  - [ ] Store domain configuration
- [ ] Implement DKIM key generation
  ```javascript
  const crypto = require('crypto');
  function generateDKIMKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
  }
  ```
- [ ] Create API endpoints
  - [ ] POST /api/domains (add domain)
  - [ ] GET /api/domains (list domains)
  - [ ] GET /api/domains/:id (get domain details)
  - [ ] DELETE /api/domains/:id (delete domain)
  - [ ] GET /api/domains/:id/dns-records
  - [ ] POST /api/domains/:id/verify

##### Week 4: DNS Verification & UI
- [ ] Implement DNS verification logic
  - [ ] Check MX records
  - [ ] Check SPF record
  - [ ] Check DKIM record
  - [ ] Check DMARC record
  ```javascript
  const dns = require('dns').promises;
  
  async function verifyMX(domain, expectedHost) {
    const records = await dns.resolveMx(domain);
    return records.some(r => r.exchange.includes(expectedHost));
  }
  ```
- [ ] Create background verification job (cron)
- [ ] Build domain management UI
  - [ ] Domain list page
  - [ ] Add domain modal/page
  - [ ] DNS setup instructions page
  - [ ] Domain status indicators
  - [ ] Verify button with loading states
- [ ] Add tenant isolation middleware
- [ ] Implement rate limiting for domain operations

#### Deliverables
- ✅ Domain CRUD operations
- ✅ DNS record generation
- ✅ DNS verification system
- ✅ Domain management UI
- ✅ Background verification job

#### Testing Checklist
- [ ] User can add domain
- [ ] DNS records are generated correctly
- [ ] DNS verification detects correct records
- [ ] DNS verification runs automatically
- [ ] Only tenant's domains are visible
- [ ] Domain status updates correctly

---

### SPRINT 3: Stalwart Integration (Week 5-6)

#### Goals
- Set up Stalwart Mail Server
- Integrate domain management with Stalwart
- Integrate user management with Stalwart
- Test email sending/receiving

#### Tasks

##### Week 5: Stalwart Setup & Domain Integration
- [ ] Set up Stalwart in Docker
  ```yaml
  version: '3.8'
  services:
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
      environment:
        - STALWART_HOSTNAME=mail.deftmail.local
  ```
- [ ] Configure Stalwart for multi-domain
- [ ] Create Stalwart service wrapper
  ```javascript
  class StalwartService {
    async addDomain(domain) {}
    async removeDomain(domain) {}
    async configureDKIM(domain, privateKey) {}
    async createUser(email, password, quota) {}
    async deleteUser(email) {}
    async updatePassword(email, newPassword) {}
  }
  ```
- [ ] Implement Stalwart CLI wrapper
- [ ] Test domain creation in Stalwart
- [ ] Integrate domain activation with Stalwart

##### Week 6: User Management Integration
- [ ] Create mail_users table & migrations
- [ ] Build email user service layer
- [ ] Implement user creation in Stalwart
- [ ] Implement user deletion in Stalwart
- [ ] Implement password management
- [ ] Add quota management
- [ ] Create API endpoints
  - [ ] POST /api/domains/:id/users
  - [ ] GET /api/domains/:id/users
  - [ ] GET /api/users/:id
  - [ ] PUT /api/users/:id
  - [ ] DELETE /api/users/:id
  - [ ] PUT /api/users/:id/password
  - [ ] PUT /api/users/:id/status

#### Deliverables
- ✅ Stalwart Mail Server running
- ✅ Domain management integrated with Stalwart
- ✅ Email user CRUD operations
- ✅ Email sending/receiving working
- ✅ Stalwart service wrapper library

#### Testing Checklist
- [ ] Domains are created in Stalwart
- [ ] DKIM keys are configured in Stalwart
- [ ] Email users are created in Stalwart
- [ ] Can send email via SMTP (test with telnet/swaks)
- [ ] Can receive email
- [ ] Password changes work
- [ ] User deletion removes access

---

### SPRINT 4: Email User Management UI (Week 7-8)

#### Goals
- Build email user management interface
- Implement quota tracking
- Add user status management
- Create user activity logs

#### Tasks

##### Week 7: User Management UI
- [ ] Build email user list page
  - [ ] Table with email, status, quota, created date
  - [ ] Search/filter functionality
  - [ ] Pagination
- [ ] Create "Add User" modal/form
  - [ ] Email input with validation
  - [ ] Password generator
  - [ ] Quota selector
  - [ ] Display name input
- [ ] Build user detail page
  - [ ] User information card
  - [ ] Quota usage chart
  - [ ] Activity log
  - [ ] Action buttons (disable, delete, reset password)
- [ ] Implement reset password modal
- [ ] Add confirmation dialogs for destructive actions

##### Week 8: Advanced Features
- [ ] Implement quota tracking
  - [ ] Background job to sync quota from Stalwart
  - [ ] Quota warning emails (90%, 100%)
- [ ] Create user activity logging
  - [ ] Log user creation, deletion, password resets
  - [ ] Log login attempts
  - [ ] Display in UI
- [ ] Add bulk operations
  - [ ] Bulk disable/enable users
  - [ ] Export user list (CSV)
- [ ] Implement user search
- [ ] Add user status indicators

#### Deliverables
- ✅ Complete email user management UI
- ✅ Quota tracking system
- ✅ User activity logs
- ✅ Bulk operations

#### Testing Checklist
- [ ] Can create email users from UI
- [ ] Password reset works
- [ ] User disable/enable works
- [ ] Quota is displayed correctly
- [ ] Activity log shows all actions
- [ ] Search filters users correctly
- [ ] Bulk operations work

---

### SPRINT 5: Webmail Interface - Foundation (Week 9-10)

#### Goals
- Set up JMAP client
- Build inbox listing
- Implement email reading
- Create basic navigation

#### Tasks

##### Week 9: JMAP Client & Inbox
- [ ] Research JMAP protocol
- [ ] Install JMAP client library or build custom
  ```javascript
  class JMAPClient {
    constructor(accountId, apiToken) {}
    async getMailboxes() {}
    async getMessages(mailboxId, limit) {}
    async getMessage(messageId) {}
    async sendMessage(message) {}
  }
  ```
- [ ] Create webmail layout
  - [ ] Sidebar with folders
  - [ ] Email list panel
  - [ ] Email detail panel
  - [ ] Compose panel (overlay)
- [ ] Implement inbox listing
  - [ ] Fetch emails via JMAP
  - [ ] Display sender, subject, date, preview
  - [ ] Mark read/unread
  - [ ] Star/flag emails
  - [ ] Pagination
- [ ] Add email search

##### Week 10: Email Reading & Actions
- [ ] Build email detail view
  - [ ] Full email content (HTML + plain text)
  - [ ] Attachments list
  - [ ] Sender/recipient details
  - [ ] Date/time
- [ ] Implement email actions
  - [ ] Mark as read/unread
  - [ ] Star/unstar
  - [ ] Delete
  - [ ] Move to folder
  - [ ] Archive
- [ ] Add keyboard shortcuts
  - [ ] j/k navigation
  - [ ] c compose
  - [ ] r reply
  - [ ] f forward
- [ ] Optimize performance (virtual scrolling)

#### Deliverables
- ✅ Working JMAP integration
- ✅ Inbox with email listing
- ✅ Email reading interface
- ✅ Basic email actions

#### Testing Checklist
- [ ] Inbox loads emails from Stalwart
- [ ] Can read email content
- [ ] Can mark as read/unread
- [ ] Can delete emails
- [ ] Can move emails to folders
- [ ] Search finds emails
- [ ] Keyboard shortcuts work

---

### SPRINT 6: Webmail - Compose & Reply (Week 11-12)

#### Goals
- Build email composition
- Implement reply/forward
- Add attachment handling
- Polish UI/UX

#### Tasks

##### Week 11: Compose & Send
- [ ] Build compose interface
  - [ ] To/Cc/Bcc fields with autocomplete
  - [ ] Subject field
  - [ ] Rich text editor or plain text
  - [ ] Attachment uploader
  - [ ] Send button with loading state
  - [ ] Save as draft
- [ ] Implement email sending via JMAP
- [ ] Add attachment upload
  - [ ] Upload to object storage (or Stalwart)
  - [ ] Size limits (25MB default)
  - [ ] File type validation
  - [ ] Progress indicator
- [ ] Implement drafts functionality
  - [ ] Auto-save drafts
  - [ ] Load draft for editing
  - [ ] Delete draft after sending

##### Week 12: Reply/Forward & Polish
- [ ] Implement reply functionality
  - [ ] Reply button
  - [ ] Pre-fill recipient
  - [ ] Quote original message
  - [ ] In-reply-to header
- [ ] Implement reply-all
- [ ] Implement forward
  - [ ] Forward attachments option
  - [ ] Add forward header
- [ ] Add email templates (optional)
- [ ] Implement contact autocomplete
- [ ] Polish UI/UX
  - [ ] Loading states
  - [ ] Error messages
  - [ ] Success notifications
  - [ ] Responsive design
  - [ ] Dark mode (optional)
- [ ] Add email signature feature

#### Deliverables
- ✅ Complete webmail interface
- ✅ Compose, reply, forward working
- ✅ Attachment handling
- ✅ Polished UI/UX

#### Testing Checklist
- [ ] Can compose and send email
- [ ] Can reply to email
- [ ] Can forward email
- [ ] Attachments upload and send
- [ ] Drafts are saved automatically
- [ ] Email signatures work
- [ ] UI is responsive
- [ ] All actions have feedback

---

### SPRINT 7: Rate Limiting & Security (Week 13-14)

#### Goals
- Implement comprehensive rate limiting
- Add abuse detection
- Harden security
- Conduct security audit

#### Tasks

##### Week 13: Rate Limiting
- [ ] Create rate_limits table
- [ ] Implement rate limiter service
  ```javascript
  class RateLimiter {
    async checkLimit(userId, limitType) {}
    async incrementLimit(userId, limitType) {}
    async resetLimit(userId, limitType) {}
    async getRemaining(userId, limitType) {}
  }
  ```
- [ ] Add rate limiting to email sending
  - [ ] Per-user daily limit
  - [ ] Per-domain daily limit
  - [ ] Per-IP hourly limit (API)
- [ ] Add rate limiting to API endpoints
  - [ ] Auth endpoints (login, signup)
  - [ ] Domain operations
  - [ ] User operations
- [ ] Create rate limit middleware
- [ ] Display rate limit info in UI
- [ ] Add rate limit headers to API responses

##### Week 14: Security Hardening
- [ ] Implement CSRF protection
- [ ] Add Content Security Policy
- [ ] Set up security headers
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Strict-Transport-Security
- [ ] Input validation on all endpoints
- [ ] Implement audit logging
  - [ ] Log all sensitive actions
  - [ ] Store IP, user agent, timestamp
- [ ] Add abuse detection
  - [ ] Flag rapid email sending
  - [ ] Flag mass user creation
  - [ ] Temporary account suspension
- [ ] Conduct security audit
  - [ ] Test for SQL injection
  - [ ] Test for XSS
  - [ ] Test for CSRF
  - [ ] Test authentication bypass
  - [ ] Test tenant isolation

#### Deliverables
- ✅ Comprehensive rate limiting
- ✅ Abuse detection system
- ✅ Security hardened application
- ✅ Audit logging

#### Testing Checklist
- [ ] Rate limits are enforced
- [ ] Rate limit exceeded shows error
- [ ] Abuse detection flags suspicious activity
- [ ] CSRF protection works
- [ ] Security headers are set
- [ ] Audit logs capture all actions
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

---

### SPRINT 8: Testing & Documentation (Week 15-16)

#### Goals
- Write comprehensive tests
- Create user documentation
- Create developer documentation
- Prepare for deployment

#### Tasks

##### Week 15: Testing
- [ ] Set up testing framework (Jest, Vitest)
- [ ] Write unit tests
  - [ ] Auth service
  - [ ] Domain service
  - [ ] User service
  - [ ] Rate limiter
  - [ ] DNS verification
- [ ] Write integration tests
  - [ ] API endpoints
  - [ ] Database operations
  - [ ] Stalwart integration
- [ ] Write E2E tests (Playwright)
  - [ ] User signup flow
  - [ ] Domain setup flow
  - [ ] Email user creation flow
  - [ ] Webmail flow
- [ ] Achieve >70% code coverage
- [ ] Fix all identified bugs

##### Week 16: Documentation
- [ ] Write user documentation
  - [ ] Getting started guide
  - [ ] Domain setup guide
  - [ ] DNS configuration guide
  - [ ] Email user management guide
  - [ ] Webmail user guide
  - [ ] FAQ
- [ ] Write developer documentation
  - [ ] Architecture overview
  - [ ] API documentation
  - [ ] Database schema documentation
  - [ ] Deployment guide
  - [ ] Contributing guide
- [ ] Create video tutorials (optional)
- [ ] Set up documentation site (Nextra/Docusaurus)

#### Deliverables
- ✅ Test suite with >70% coverage
- ✅ Comprehensive documentation
- ✅ Deployment guide

#### Testing Checklist
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage >70%
- [ ] Documentation is complete
- [ ] Documentation is clear and accurate

---

### SPRINT 9: Deployment & Launch Prep (Week 17-18)

#### Goals
- Set up production infrastructure
- Deploy application
- Configure monitoring
- Prepare for launch

#### Tasks

##### Week 17: Infrastructure Setup
- [ ] Provision production servers
  - [ ] Web app VPS (2 vCPU, 4GB RAM)
  - [ ] Mail server VPS (4 vCPU, 8GB RAM)
  - [ ] Database VPS (2 vCPU, 4GB RAM)
- [ ] Set up PostgreSQL production instance
- [ ] Set up Redis production instance
- [ ] Set up Stalwart on production
- [ ] Configure DNS for deftmail.com
  - [ ] A records
  - [ ] MX records
  - [ ] SPF, DKIM, DMARC
- [ ] Install SSL certificates (Let's Encrypt)
- [ ] Set up object storage (R2/S3)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up firewall rules

##### Week 18: Deployment & Monitoring
- [ ] Set up CI/CD pipeline (GitHub Actions)
  ```yaml
  name: Deploy
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Deploy to production
          run: ./scripts/deploy.sh
  ```
- [ ] Deploy application to production
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Set up monitoring
  - [ ] Uptime monitoring (UptimeRobot)
  - [ ] Error tracking (Sentry)
  - [ ] Log aggregation (Better Stack)
  - [ ] Performance monitoring
- [ ] Set up automated backups
  - [ ] Database backups (daily)
  - [ ] Mail data backups (6 hours)
- [ ] Configure alerts
  - [ ] Server down
  - [ ] Database errors
  - [ ] High CPU/memory
  - [ ] Email delivery failures
- [ ] Load testing
- [ ] Final security check

#### Deliverables
- ✅ Production infrastructure live
- ✅ Application deployed
- ✅ Monitoring configured
- ✅ Backups automated

#### Testing Checklist
- [ ] Application is accessible via HTTPS
- [ ] Database is running and connected
- [ ] Stalwart is sending/receiving email
- [ ] SSL certificates are valid
- [ ] Monitoring is capturing data
- [ ] Backups are running successfully
- [ ] Alerts are working
- [ ] Load testing passed

---

## 🚦 POST-LAUNCH ROADMAP

### Month 1: Beta & Iteration
- [ ] Invite 10 beta users
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Monitor deliverability
- [ ] Optimize performance

### Month 2: Feature Enhancements
- [ ] Email aliases
- [ ] Email forwarding
- [ ] Auto-responders
- [ ] Mobile-responsive improvements
- [ ] API documentation

### Month 3: Growth & Integration
- [ ] HostelWeb integration
- [ ] Billing system (Stripe)
- [ ] Referral program
- [ ] Marketing website
- [ ] SEO optimization

### Month 4-6: Scaling
- [ ] Mobile app (optional)
- [ ] Advanced spam filtering
- [ ] Email templates
- [ ] Team collaboration features
- [ ] White-label option

---

## 📊 DEPENDENCY MATRIX

| Task | Depends On |
|------|------------|
| Domain Verification | Domain Management |
| Stalwart Integration | Domain Management |
| Email User Management | Stalwart Integration |
| Webmail | Email User Management, JMAP Integration |
| Rate Limiting | Email Sending, User Management |
| Deployment | All Features Complete |

---

## ⚠️ CRITICAL PATH

These tasks are on the critical path and cannot be delayed:

1. Authentication System (Week 2)
2. Domain Management (Week 3-4)
3. Stalwart Integration (Week 5-6)
4. Email User Management (Week 7-8)
5. Webmail Core (Week 9-10)
6. Deployment (Week 17-18)

---

## 🎯 MILESTONES

- **Week 2**: ✅ Authentication Working
- **Week 4**: ✅ Domain Management Complete
- **Week 6**: ✅ Email Sending/Receiving Working
- **Week 8**: ✅ User Management Complete
- **Week 12**: ✅ Webmail Fully Functional
- **Week 14**: ✅ Security Hardened
- **Week 16**: ✅ Testing & Documentation Complete
- **Week 18**: ✅ Production Launch

---

## 📝 NOTES

### Development Principles
1. **Build incrementally**: Each sprint delivers working features
2. **Test continuously**: Write tests as you build
3. **Document as you go**: Don't leave docs for the end
4. **Security first**: Consider security in every decision
5. **User feedback**: Get feedback early and often

### Risk Management
- **Technical blockers**: Have backup solutions ready
- **Time slippage**: Focus on MVP first, defer nice-to-haves
- **Scope creep**: Stick to the plan, log feature requests for later

### Success Criteria
- ✅ All MVP features working
- ✅ No critical bugs
- ✅ >99% email deliverability
- ✅ <200ms API response time
- ✅ Security audit passed
- ✅ 10+ beta users happy

---

**Ready to start building? Let's go! 🚀**
