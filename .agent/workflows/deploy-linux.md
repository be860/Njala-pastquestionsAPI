---
description: Deploy the Njala Past Questions API to Linux (Ubuntu/Nginx)
---

# Linux Deployment Workflow (Ubuntu/Nginx)

This workflow guides you through deploying the Njala Past Questions API to a Linux server running Ubuntu with Nginx as a reverse proxy.

## Prerequisites

Before starting deployment, ensure you have:

1. **Server Access**: SSH access to Ubuntu server (18.04+ recommended)
2. **Domain Name**: (Optional) A domain name pointing to your server IP
3. **Database**: SQL Server accessible from the Linux server
4. **Credentials**: All production credentials ready (JWT keys, SMTP, OAuth, etc.)

## Phase 1: Server Preparation

### 1.1 Update System Packages

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 1.2 Install Required Software

```bash
# Install .NET Runtime 8.0
sudo apt-get install -y wget apt-transport-https
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-runtime-8.0

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx
```

### 1.3 Create Application Directories

```bash
sudo mkdir -p /var/www/njala-backend
sudo mkdir -p /var/www/njala-frontend
sudo chown -R $USER:$USER /var/www/njala-backend
sudo chown -R $USER:$USER /var/www/njala-frontend
```

## Phase 2: Backend Deployment (ASP.NET Core)

### 2.1 Build and Publish Backend (On Development Machine)

```bash
cd backend
dotnet publish -c Release -o ./publish
```

### 2.2 Configure Production Settings

Before publishing, update `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SQL_SERVER;Database=NjalaPastQuestionsDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "your-production-jwt-secret-key-minimum-32-characters",
    "Issuer": "NjalaPastQA",
    "Audience": "NjalaStudents"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderName": "Njala Past Questions",
    "Password": "your-app-password"
  },
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    }
  }
}
```

### 2.3 Transfer Files to Server

```bash
# Using SCP
scp -r ./publish/* username@your-server-ip:/var/www/njala-backend/

# Or using rsync
rsync -avz --progress ./publish/ username@your-server-ip:/var/www/njala-backend/
```

### 2.4 Create Systemd Service

On the server, create `/etc/systemd/system/njala-backend.service`:

```bash
sudo nano /etc/systemd/system/njala-backend.service
```

Add the following content:

```ini
[Unit]
Description=Njala Past Questions API - ASP.NET Core Web API
After=network.target

[Service]
WorkingDirectory=/var/www/njala-backend
ExecStart=/usr/bin/dotnet /var/www/njala-backend/NjalaAPI.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=njala-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

### 2.5 Start Backend Service

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable njala-backend.service

# Start the service
sudo systemctl start njala-backend.service

# Check status
sudo systemctl status njala-backend.service

# View logs
sudo journalctl -u njala-backend.service -f
```

## Phase 3: Frontend Deployment (Next.js)

### 3.1 Configure Production Environment

Create `.env.production` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://your-domain.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3.2 Build Frontend (On Development Machine)

```bash
cd frontend
npm install
npm run build
```

### 3.3 Transfer Files to Server

```bash
# Transfer entire frontend directory
scp -r ./* username@your-server-ip:/var/www/njala-frontend/

# Or using rsync
rsync -avz --progress --exclude 'node_modules' ./ username@your-server-ip:/var/www/njala-frontend/
```

### 3.4 Install Dependencies on Server

```bash
ssh username@your-server-ip
cd /var/www/njala-frontend
npm install --production
```

### 3.5 Start with PM2

```bash
# Start the application
pm2 start npm --name "njala-frontend" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the instructions provided by the command above

# Check status
pm2 status
pm2 logs njala-frontend
```

## Phase 4: Nginx Configuration

### 4.1 Create Nginx Configuration

Create `/etc/nginx/sites-available/njala`:

```bash
sudo nano /etc/nginx/sites-available/njala
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend Proxy
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
    
    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Increase timeout for large file uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Increase max upload size
    client_max_body_size 50M;
}
```

### 4.2 Enable Site and Restart Nginx

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/njala /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

## Phase 5: SSL/HTTPS Setup (Optional but Recommended)

### 5.1 Install Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 5.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts to:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 5.3 Auto-Renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

## Phase 6: Database Setup

### 6.1 Run Migrations (If needed)

```bash
cd /var/www/njala-backend
sudo -u www-data dotnet ef database update
```

**Note**: Ensure your connection string in `appsettings.Production.json` is correctly configured.

## Phase 7: Verification

### 7.1 Check Services Status

```bash
# Backend service
sudo systemctl status njala-backend.service

# Frontend (PM2)
pm2 status

# Nginx
sudo systemctl status nginx
```

### 7.2 Test Endpoints

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000

# Test through Nginx
curl http://your-domain.com
curl http://your-domain.com/api/health
```

### 7.3 Check Logs

```bash
# Backend logs
sudo journalctl -u njala-backend.service -f

# Frontend logs
pm2 logs njala-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Phase 8: Post-Deployment Tasks

### 8.1 Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 8.2 Setup Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# Setup PM2 monitoring (optional)
pm2 install pm2-logrotate
```

### 8.3 Create Backup Script

Create `/home/username/backup-njala.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup backend
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz /var/www/njala-backend

# Backup frontend
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz /var/www/njala-frontend

# Keep only last 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable:

```bash
chmod +x /home/username/backup-njala.sh
```

Add to crontab for daily backups:

```bash
crontab -e
# Add: 0 2 * * * /home/username/backup-njala.sh
```

## Troubleshooting

### Backend Issues

**Service won't start:**
```bash
# Check detailed logs
sudo journalctl -u njala-backend.service -n 50 --no-pager

# Check file permissions
ls -la /var/www/njala-backend

# Test manually
cd /var/www/njala-backend
dotnet NjalaAPI.dll
```

**Database connection errors:**
- Verify connection string in `appsettings.Production.json`
- Ensure SQL Server is accessible from the Linux server
- Check firewall rules on SQL Server

### Frontend Issues

**PM2 process crashes:**
```bash
# View detailed logs
pm2 logs njala-frontend --lines 100

# Restart process
pm2 restart njala-frontend

# Delete and recreate
pm2 delete njala-frontend
pm2 start npm --name "njala-frontend" -- start
```

**Build errors:**
- Ensure all dependencies are installed: `npm install`
- Check `.env.production` file exists and is correct
- Verify Node.js version: `node --version` (should be 18+)

### Nginx Issues

**502 Bad Gateway:**
- Check if backend/frontend services are running
- Verify proxy_pass URLs in Nginx config
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

**Configuration errors:**
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

## Maintenance Commands

### Update Backend

```bash
# On development machine: build and publish
cd backend
dotnet publish -c Release -o ./publish

# Transfer to server
scp -r ./publish/* username@your-server-ip:/var/www/njala-backend/

# On server: restart service
sudo systemctl restart njala-backend.service
```

### Update Frontend

```bash
# On development machine: build
cd frontend
npm run build

# Transfer to server
rsync -avz --progress --exclude 'node_modules' ./ username@your-server-ip:/var/www/njala-frontend/

# On server: restart PM2
pm2 restart njala-frontend
```

### View Logs

```bash
# Backend
sudo journalctl -u njala-backend.service -f

# Frontend
pm2 logs njala-frontend --lines 200

# Nginx access
sudo tail -f /var/log/nginx/access.log

# Nginx errors
sudo tail -f /var/log/nginx/error.log
```

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSL/HTTPS enabled
- [ ] Strong passwords for all services
- [ ] Database access restricted
- [ ] Regular backups scheduled
- [ ] System updates automated
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled
- [ ] Fail2ban installed (optional)

## Performance Optimization

### Enable Nginx Caching

Add to Nginx config:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Enable Gzip Compression

Add to `/etc/nginx/nginx.conf`:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

## Additional Resources

- [ASP.NET Core Deployment](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
