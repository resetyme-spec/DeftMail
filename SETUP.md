# DeftMail Setup Guide

## Quick Start (Without Docker)

Since Docker isn't installed, here are alternative setup options:

### Option 1: Local PostgreSQL & Redis (Recommended for Development)

1. **Install PostgreSQL 15+**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, set password and remember it
   - Default port: 5432

2. **Install Redis**
   - Download from: https://github.com/microsoftarchive/redis/releases
   - Or use Windows Subsystem for Linux (WSL)
   - Alternative: Skip Redis for now (we'll handle gracefully)

3. **Update .env file**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/deftmail?schema=public"
   REDIS_URL="redis://localhost:6379"
   ```

4. **Initialize Database**
   ```powershell
   npx prisma db push
   npx prisma generate
   ```

5. **Start Development Server**
   ```powershell
   npm run dev
   ```

### Option 2: Use SQLite (Easiest for Testing)

1. **Update prisma/schema.prisma**
   Change:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Update .env**
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Initialize**
   ```powershell
   npx prisma db push
   npx prisma generate
   npm run dev
   ```

### Option 3: Install Docker Desktop

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and restart computer
3. Run: `docker compose up -d`
4. Continue with normal setup

## Current Status

✅ Project structure created
✅ Dependencies installed
✅ Environment file created
⏳ Database setup needed
⏳ Development server ready to start

## Next Steps

Choose one of the options above, then:
```powershell
npm run dev
```

Visit: http://localhost:3000
