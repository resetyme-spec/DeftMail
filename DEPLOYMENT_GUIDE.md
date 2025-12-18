# 🚀 DeftMail VPS Deployment Guide

**Server Details:**
- IP Address: `94.249.213.80`
- OS: Ubuntu 22.04 LTS
- Support PIN: `57585`
- Provider: HOST.CO.IN

---

## 📋 Phase 1: Connect to Your VPS (5 min)

### Step 1: Get Root Password
The password was shared via the secure link (o4Szsx9#TM1UT2i). Copy it.

### Step 2: Connect via SSH

**On Windows (PowerShell):**
```powershell
ssh root@94.249.213.80
```

When prompted:
- Type `yes` to accept fingerprint
- Paste the root password

**First time SSH might ask:**
```
The authenticity of host can't be established.
Are you sure you want to continue? (yes/no)
```
Type: `yes`

---

## 🔒 Phase 2: Secure Your Server (10 min)

### Step 1: Update System
```bash
apt update && apt upgrade -y
```

### Step 2: Create Non-Root User
```bash
# Create user
adduser deftmail

# When prompted, set a password and press Enter for other fields

# Add to sudo group
usermod -aG sudo deftmail

# Test sudo access
su - deftmail
sudo ls
# Enter password when prompted
```

### Step 3: Configure Firewall
```bash
# Allow SSH, HTTP, HTTPS, and Mail ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 25/tcp    # SMTP
sudo ufw allow 587/tcp   # SMTP Submission
sudo ufw allow 143/tcp   # IMAP
sudo ufw allow 993/tcp   # IMAPS
sudo ufw allow 8080/tcp  # JMAP/Admin

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 4: Secure SSH (Optional but Recommended)
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and change these lines:
# PermitRootLogin no
# PasswordAuthentication yes (change to 'no' after setting up SSH keys)

# Save: Ctrl+O, Enter, Ctrl+X

# Restart SSH
sudo systemctl restart sshd
```

---

## 🐳 Phase 3: Install Docker (10 min)

### Step 1: Install Docker
```bash
# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes
exit
su - deftmail
```

### Step 2: Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## 📦 Phase 4: Deploy DeftMail (30 min)

### Step 1: Install Git and Clone Repository
```bash
# Install Git
sudo apt install -y git

# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository
git clone https://github.com/YOUR_USERNAME/DeftMail.git
cd DeftMail
```

**⚠️ If you haven't pushed to GitHub yet:**
```bash
# On your local machine (in DeftMail directory):
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/DeftMail.git
git push -u origin main
```

### Step 2: Create Environment File
```bash
# Copy example env
cp .env.example .env

# Edit environment variables
nano .env
```

**Add these values to `.env`:**
```env
# App
NODE_ENV=production
PORT=3000
APP_URL=https://yourdomain.com

# Database (SQLite for now, can migrate to PostgreSQL later)
DATABASE_URL=file:./prisma/dev.db

# JWT
JWT_SECRET=GENERATE_RANDOM_STRING_HERE_32_CHARS
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Stalwart
STALWART_API_URL=http://stalwart:8080
STALWART_ADMIN_TOKEN=GENERATE_RANDOM_TOKEN_HERE

# Mail Server
NEXT_PUBLIC_MAIL_SERVER=mail.yourdomain.com
STALWART_HOSTNAME=mail.yourdomain.com

# Redis (optional for now)
REDIS_URL=redis://redis:6379
```

**Generate random secrets:**
```bash
# Generate JWT secret (32 chars)
openssl rand -base64 32

# Generate Stalwart token
openssl rand -hex 32
```

### Step 3: Update Docker Compose for Production
```bash
nano docker-compose.yml
```

Make sure it looks like this (SQLite for MVP):
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: deftmail-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  stalwart:
    image: stalwartlabs/mail-server:latest
    container_name: deftmail-stalwart
    restart: unless-stopped
    ports:
      - "25:25"
      - "587:587"
      - "143:143"
      - "993:993"
      - "8080:8080"
    volumes:
      - stalwart-data:/opt/stalwart-mail/data
    environment:
      - STALWART_HOSTNAME=mail.yourdomain.com

  app:
    build: .
    container_name: deftmail-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - NODE_ENV=production
    volumes:
      - ./prisma:/app/prisma
    depends_on:
      - redis
      - stalwart

volumes:
  redis-data:
  stalwart-data:
```

### Step 4: Create Dockerfile
```bash
nano Dockerfile
```

Add:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 5: Build and Start Services
```bash
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Initialize database
docker-compose exec app npx prisma db push
```

---

## 🌐 Phase 5: Domain & DNS Setup (20 min)

### Step 1: Point Your Domain to VPS

In your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:

```
Type    Name    Value               TTL
A       @       94.249.213.80       3600
A       mail    94.249.213.80       3600
A       www     94.249.213.80       3600
```

### Step 2: Install Nginx & SSL
```bash
# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace yourdomain.com)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d mail.yourdomain.com
```

### Step 3: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/deftmail
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/deftmail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Phase 6: Verify Deployment

### Check Services
```bash
# Check Docker containers
docker ps

# Check Next.js logs
docker-compose logs app

# Check Stalwart logs
docker-compose logs stalwart

# Test web app
curl http://localhost:3000

# Test from browser
# Visit: https://yourdomain.com
```

### Test Email Configuration
Once DNS propagates (24-48 hours):
1. Login to DeftMail
2. Add your domain
3. Verify DNS records
4. Create email user
5. Test sending/receiving

---

## 🔧 Useful Commands

### Docker Management
```bash
# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Rebuild app
docker-compose up -d --build app

# Stop all
docker-compose down

# Stop and remove volumes (DANGER: deletes data)
docker-compose down -v
```

### Database Management
```bash
# Access Prisma Studio (local only)
npx prisma studio

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View database
docker-compose exec app npx prisma studio
```

### Server Management
```bash
# View resource usage
htop

# Check disk space
df -h

# Check memory
free -h

# View firewall status
sudo ufw status numbered
```

---

## 🆘 Troubleshooting

### App won't start
```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Can't connect to database
```bash
# Check DATABASE_URL in .env
# Regenerate Prisma client
docker-compose exec app npx prisma generate
docker-compose restart app
```

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 [PID]
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring Setup (Optional)

### Install monitoring tools
```bash
# Install htop
sudo apt install -y htop

# Install netdata (real-time monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at: http://94.249.213.80:19999
```

---

## 🔄 Updates & Maintenance

### Update DeftMail
```bash
cd ~/apps/DeftMail
git pull
docker-compose down
docker-compose up -d --build
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### Backup Database
```bash
# Backup SQLite
cp ~/apps/DeftMail/prisma/dev.db ~/backups/dev.db.$(date +%Y%m%d)

# Backup Docker volumes
docker run --rm -v deftmail_stalwart-data:/data -v ~/backups:/backup alpine tar czf /backup/stalwart-$(date +%Y%m%d).tar.gz /data
```

---

## 🎉 Success Checklist

- [ ] SSH connection working
- [ ] Docker installed and running
- [ ] DeftMail containers running
- [ ] Nginx configured with SSL
- [ ] Domain pointing to VPS
- [ ] Can access https://yourdomain.com
- [ ] Can create tenant account
- [ ] Can add domain
- [ ] Can create email user
- [ ] Firewall configured
- [ ] Backups scheduled

---

**Need help?** Check logs, review environment variables, and ensure all services are running!

🚀 **Your DeftMail is ready to serve customers!**
