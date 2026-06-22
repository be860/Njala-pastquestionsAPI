# Linux Deployment Quick Reference

## 📋 Quick Links

- **Full Deployment Guide**: [.agent/workflows/deploy-linux.md](.agent/workflows/deploy-linux.md)
- **Pre-Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Systemd Service**: [backend/njala-backend.service](backend/njala-backend.service)
- **Nginx Config**: [nginx-njala.conf](nginx-njala.conf)
- **Deployment Script**: [deploy.sh](deploy.sh)

## 🚀 Quick Start Commands

### On Development Machine

#### Backend
```bash
cd backend
dotnet publish -c Release -o ./publish
scp -r ./publish/* user@server:/var/www/njala-backend/
```

#### Frontend
```bash
cd frontend
npm install
npm run build
rsync -avz --exclude 'node_modules' ./ user@server:/var/www/njala-frontend/
```

### On Linux Server

#### Initial Setup
```bash
# Install dependencies
sudo apt-get update && sudo apt-get install -y dotnet-runtime-8.0
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/www/njala-backend /var/www/njala-frontend
```

#### Backend Service
```bash
# Copy service file
sudo cp backend/njala-backend.service /etc/systemd/system/

# Start service
sudo systemctl daemon-reload
sudo systemctl enable njala-backend.service
sudo systemctl start njala-backend.service
```

#### Frontend Service
```bash
cd /var/www/njala-frontend
npm install --production
pm2 start npm --name "njala-frontend" -- start
pm2 save
pm2 startup systemd
```

#### Nginx Setup
```bash
# Copy and configure
sudo cp nginx-njala.conf /etc/nginx/sites-available/njala
# Edit server_name in the file
sudo nano /etc/nginx/sites-available/njala

# Enable site
sudo ln -s /etc/nginx/sites-available/njala /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Common Commands

### Service Management
```bash
# Backend
sudo systemctl status njala-backend.service
sudo systemctl restart njala-backend.service
sudo journalctl -u njala-backend.service -f

# Frontend
pm2 status
pm2 restart njala-frontend
pm2 logs njala-frontend

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/njala-error.log
```

### Using Deployment Script
```bash
# Make executable
chmod +x deploy.sh

# Deploy everything
./deploy.sh all

# Deploy specific component
./deploy.sh backend
./deploy.sh frontend

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# Restart services
./deploy.sh restart
```

## 🔐 Configuration Files

### Backend: `appsettings.Production.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=NjalaPastQuestionsDB;..."
  },
  "Jwt": {
    "Key": "your-32-char-secret-key",
    "Issuer": "NjalaPastQA",
    "Audience": "NjalaStudents"
  }
}
```

### Frontend: `.env.production`
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
```

## 🔍 Health Checks

```bash
# Backend API
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000

# Through Nginx
curl http://your-domain.com
curl http://your-domain.com/api/health
```

## 🆘 Troubleshooting

### Backend Won't Start
```bash
# Check logs
sudo journalctl -u njala-backend.service -n 50

# Test manually
cd /var/www/njala-backend
dotnet NjalaAPI.dll

# Check permissions
ls -la /var/www/njala-backend
```

### Frontend Won't Start
```bash
# Check PM2 logs
pm2 logs njala-frontend --lines 100

# Restart
pm2 restart njala-frontend

# Check Node version
node --version  # Should be 18+
```

### 502 Bad Gateway
```bash
# Check if services are running
sudo systemctl status njala-backend.service
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/njala-error.log

# Test Nginx config
sudo nginx -t
```

## 📊 Monitoring

```bash
# System resources
htop

# PM2 monitoring
pm2 monit

# Disk space
df -h

# Service status
systemctl list-units --type=service --state=running | grep njala
```

## 🔒 SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

## 📦 Updates

### Backend Update
```bash
# Build on dev machine
dotnet publish -c Release -o ./publish

# Transfer
scp -r ./publish/* user@server:/var/www/njala-backend/

# Restart on server
sudo systemctl restart njala-backend.service
```

### Frontend Update
```bash
# Build on dev machine
npm run build

# Transfer
rsync -avz ./ user@server:/var/www/njala-frontend/

# Restart on server
pm2 restart njala-frontend
```

## 📝 Important Notes

1. **Always backup before updates**: Use the backup script or manual backups
2. **Test configuration**: Run `sudo nginx -t` before restarting Nginx
3. **Monitor logs**: Watch logs after deployment for any errors
4. **Database migrations**: Run migrations before starting the backend service
5. **Environment variables**: Ensure all production secrets are configured
6. **Firewall**: Configure UFW to allow HTTP/HTTPS traffic
7. **SSL**: Enable HTTPS for production deployments

## 📞 Support

For detailed instructions, see:
- Full deployment guide: `.agent/workflows/deploy-linux.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`
- Frontend environment setup: `frontend/PRODUCTION_ENV.md`
