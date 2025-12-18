# 📧 DeftMail - Multi-Tenant Email Hosting SaaS

> **Professional email hosting for businesses that beats Zoho Mail Starter**

DeftMail is a modern, multi-tenant email hosting platform that allows businesses to use custom domains for professional email communication. Built with Next.js, powered by Stalwart Mail Server, and designed for scale.

---

## 🎯 Project Vision

A SaaS platform where users can:
- ✅ Sign up and create a tenant account (one account = one company)
- ✅ Add custom domains (e.g., `kumar.com`)
- ✅ Verify DNS configuration automatically
- ✅ Create email addresses (e.g., `care@kumar.com`)
- ✅ Use a modern webmail interface
- ✅ Manage their email infrastructure

**Target Market:** Small to medium businesses, web hosting customers (HostelWeb integration), agencies

---

## ✨ Key Features

### Phase 1: MVP (Current)
- [x] **Multi-tenant Architecture** - Complete tenant isolation
- [x] **Domain Management** - Add, verify, and manage custom domains
- [ ] **DNS Automation** - Auto-generate and verify MX, SPF, DKIM, DMARC records
- [ ] **Email User Management** - Create and manage mailboxes
- [ ] **Webmail Interface** - Gmail-like interface using JMAP
- [ ] **Rate Limiting** - Protect against abuse
- [ ] **Audit Logging** - Track all sensitive operations

### Phase 2: Growth (Future)
- [ ] Billing integration (Stripe)
- [ ] Email aliases and forwarding
- [ ] Auto-responders
- [ ] Email templates
- [ ] Mobile app
- [ ] API access
- [ ] White-label option

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Context / Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 20+
- **API:** Next.js API Routes
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Cache:** Redis
- **Queue:** BullMQ (background jobs)

### Mail Infrastructure
- **Mail Server:** [Stalwart Mail Server](https://stalw.art/)
- **Protocols:** SMTP, IMAP, JMAP
- **Security:** SPF, DKIM, DMARC

### DevOps
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, Better Stack
- **Hosting:** VPS (Hetzner/DigitalOcean)

---

## 📂 Project Structure

```
DeftMail/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── domain/           # Domain-related components
│   │   ├── email/            # Email-related components
│   │   └── webmail/          # Webmail components
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # Authentication helpers
│   │   ├── db.ts             # Database client
│   │   └── redis.ts          # Redis client
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── domain.service.ts
│   │   ├── mail-user.service.ts
│   │   ├── stalwart.service.ts
│   │   ├── jmap.service.ts
│   │   └── rate-limit.service.ts
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── scripts/
│   ├── setup.sh              # Initial setup
│   └── deploy.sh             # Deployment script
├── docs/
│   ├── PROJECT_PLAN.md       # Complete project plan
│   ├── IMPLEMENTATION_ROADMAP.md  # Sprint-by-sprint roadmap
│   └── ARCHITECTURE.md       # Technical architecture
├── docker-compose.yml        # Local development setup
├── Dockerfile               # Production container
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/deftmail.git
   cd deftmail
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start infrastructure (Docker)**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 📖 Documentation

- **[Project Plan](./PROJECT_PLAN.md)** - Complete business and technical plan
- **[Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)** - Sprint-by-sprint development guide
- **[Architecture](./ARCHITECTURE.md)** - Detailed technical architecture
- **API Documentation** - (Coming soon)
- **User Guide** - (Coming soon)

---

## 🗺️ Development Roadmap

### ✅ Completed
- [x] Project planning and architecture design
- [x] Documentation creation

### 🚧 In Progress (Sprint 1-2)
- [ ] Next.js project setup
- [ ] Database schema implementation
- [ ] Authentication system

### 📋 Upcoming (Sprint 3+)
- [ ] Domain management system
- [ ] DNS verification
- [ ] Stalwart integration
- [ ] Email user management
- [ ] Webmail interface
- [ ] Rate limiting
- [ ] Production deployment

**Timeline:** 12 weeks to MVP launch

---

## 🎯 Milestones

| Week | Milestone | Status |
|------|-----------|--------|
| Week 2 | Authentication Working | 🔄 Planning |
| Week 4 | Domain Management Complete | ⏳ Pending |
| Week 6 | Email Sending/Receiving Working | ⏳ Pending |
| Week 8 | User Management Complete | ⏳ Pending |
| Week 12 | Webmail Fully Functional | ⏳ Pending |
| Week 14 | Security Hardened | ⏳ Pending |
| Week 18 | Production Launch | ⏳ Pending |

---

## 💰 Business Model

### Pricing Plans

| Plan | Price/Month | Domains | Email Accounts | Storage | Emails/Day |
|------|------------|---------|----------------|---------|------------|
| **Starter** | $9 | 1 | 10 | 10GB/account | 300/user |
| **Business** | $29 | 5 | 50 | 50GB/account | 1,000/user |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom | Custom |

### Target Metrics (Year 1)
- **100 paying customers**
- **$1,500 MRR** (Month 6)
- **<5% churn rate**
- **>99% email deliverability**

---

## 🔐 Security

- ✅ HTTPS only (TLS 1.3)
- ✅ JWT authentication with short expiry
- ✅ Password hashing (bcrypt)
- ✅ Multi-tenant data isolation
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Audit logging
- ✅ Regular security audits

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Check code coverage
npm run test:coverage
```

**Coverage Goals:**
- Unit Tests: >80%
- Integration Tests: All API endpoints
- E2E Tests: Critical user journeys

---

## 📊 Monitoring

### Metrics Tracked
- Application performance (response times, error rates)
- Email deliverability (bounce rate, delivery rate)
- User activity (signups, logins, emails sent)
- System health (CPU, memory, disk usage)
- Business metrics (MRR, churn, active users)

### Tools
- **Uptime:** UptimeRobot
- **Errors:** Sentry
- **Logs:** Better Stack
- **Analytics:** Plausible

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Stalwart Mail Server](https://stalw.art/)** - Powerful, modern mail server
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **JMAP Protocol** - Modern email protocol

---

## 📞 Support

- **Email:** support@deftmail.com
- **Documentation:** https://docs.deftmail.com
- **Issues:** [GitHub Issues](https://github.com/yourusername/deftmail/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/deftmail/discussions)

---

## 🚀 Status

**Project Phase:** Planning & Documentation ✅  
**Current Sprint:** Ready to begin Sprint 1 🚀  
**Next Milestone:** Authentication system (Week 2)

---

<div align="center">

**Built with ❤️ for businesses that need professional email**

[Website](https://deftmail.com) • [Documentation](https://docs.deftmail.com) • [Blog](https://blog.deftmail.com)

</div>
