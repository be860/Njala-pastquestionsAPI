# Pre-Deployment Checklist for Njala Past Questions API

## Server Requirements

### Hardware/Infrastructure
- [ ] Ubuntu 18.04+ server provisioned
- [ ] Minimum 2GB RAM, 2 CPU cores
- [ ] At least 20GB disk space available
- [ ] SSH access configured
- [ ] Static IP address or domain name configured
- [ ] Firewall rules reviewed

### Software Prerequisites
- [ ] .NET Runtime 8.0 installed
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] SQL Server accessible (local or remote)

## Configuration Files

### Backend Configuration
- [ ] `appsettings.Production.json` created with production values
- [ ] Database connection string configured
- [ ] JWT secret key set (minimum 32 characters)
- [ ] SMTP email settings configured
- [ ] Google OAuth credentials configured (if using)
- [ ] File upload paths verified

### Frontend Configuration
- [ ] `.env.production` file created
- [ ] `NEXT_PUBLIC_API_URL` set to production API URL
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` configured (if using OAuth)

## Security Credentials

### Required Secrets
- [ ] SQL Server credentials
- [ ] JWT secret key (32+ characters)
- [ ] SMTP password/app password
- [ ] Google OAuth Client ID
- [ ] Google OAuth Client Secret

### Security Measures
- [ ] All secrets stored securely (not in source control)
- [ ] Strong passwords generated for all services
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled on server
- [ ] Firewall rules configured

## Database

### Database Setup
- [ ] SQL Server instance accessible from Linux server
- [ ] Database created: `NjalaPastQuestionsDB`
- [ ] Database user created with appropriate permissions
- [ ] Connection tested from Linux server
- [ ] Migrations ready to apply

### Network Access
- [ ] SQL Server port (1433) accessible
- [ ] Firewall rules allow Linux server IP
- [ ] TrustServerCertificate setting configured

## Build Artifacts

### Backend
- [ ] Backend built in Release mode
- [ ] `dotnet publish -c Release` completed successfully
- [ ] Published files ready to transfer
- [ ] `NjalaAPI.dll` present in publish folder
- [ ] `appsettings.Production.json` included

### Frontend
- [ ] Dependencies installed (`npm install`)
- [ ] Production build completed (`npm run build`)
- [ ] `.next` folder generated
- [ ] `node_modules` ready (or will install on server)
- [ ] `.env.production` file ready

## Deployment Preparation

### File Transfer
- [ ] SCP/RSYNC access to server configured
- [ ] Backend files ready to transfer to `/var/www/njala-backend`
- [ ] Frontend files ready to transfer to `/var/www/njala-frontend`
- [ ] File transfer method tested

### Service Configuration
- [ ] Systemd service file prepared for backend
- [ ] PM2 configuration planned for frontend
- [ ] Nginx configuration file prepared
- [ ] Service user accounts reviewed (www-data)

## Domain & SSL

### Domain Configuration
- [ ] Domain name registered (if applicable)
- [ ] DNS A record pointing to server IP
- [ ] DNS propagation verified
- [ ] Domain accessible via browser

### SSL Certificate (Optional but Recommended)
- [ ] Certbot installed
- [ ] Email for SSL notifications ready
- [ ] Domain ownership verified
- [ ] Auto-renewal configured

## Testing Plan

### Pre-Deployment Testing
- [ ] Backend tested locally in Production mode
- [ ] Frontend tested locally with production build
- [ ] API endpoints tested with Postman/Swagger
- [ ] Database migrations tested
- [ ] File uploads tested

### Post-Deployment Testing
- [ ] Backend health endpoint accessible
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] OTP email delivery works
- [ ] Document upload works (Admin)
- [ ] Document download works (Student)
- [ ] Google OAuth works (if configured)

## Backup & Recovery

### Backup Strategy
- [ ] Backup script created
- [ ] Backup location configured
- [ ] Backup schedule planned (cron job)
- [ ] Database backup strategy defined
- [ ] Recovery procedure documented

### Rollback Plan
- [ ] Previous version backup available
- [ ] Rollback procedure documented
- [ ] Database rollback strategy defined

## Monitoring & Maintenance

### Logging
- [ ] Backend logging configured
- [ ] Frontend logging configured
- [ ] Nginx logging configured
- [ ] Log rotation configured
- [ ] Log monitoring plan defined

### Monitoring Tools
- [ ] PM2 monitoring enabled
- [ ] Systemd service monitoring configured
- [ ] Uptime monitoring planned
- [ ] Error alerting configured

## Documentation

### Deployment Documentation
- [ ] Deployment workflow reviewed
- [ ] Server credentials documented securely
- [ ] Configuration files documented
- [ ] Troubleshooting guide reviewed

### Operational Documentation
- [ ] Restart procedures documented
- [ ] Update procedures documented
- [ ] Backup/restore procedures documented
- [ ] Emergency contacts listed

## Final Checks

### Pre-Go-Live
- [ ] All services start successfully
- [ ] All endpoints respond correctly
- [ ] SSL certificate valid (if using HTTPS)
- [ ] Performance tested under load
- [ ] Security scan completed
- [ ] Stakeholders notified of deployment

### Post-Go-Live
- [ ] Monitor logs for errors
- [ ] Verify user access
- [ ] Test critical user flows
- [ ] Confirm email delivery
- [ ] Check database connections
- [ ] Verify file uploads/downloads

## Contacts & Support

### Key Personnel
- [ ] System administrator contact
- [ ] Database administrator contact
- [ ] Development team contact
- [ ] Support team contact

### Escalation Path
- [ ] Level 1 support defined
- [ ] Level 2 support defined
- [ ] Emergency escalation procedure defined

---

## Notes

**Important Reminders:**
1. Always backup before making changes
2. Test in staging environment first (if available)
3. Schedule deployment during low-traffic periods
4. Have rollback plan ready
5. Monitor closely for first 24-48 hours after deployment

**Common Issues to Watch:**
- Database connection timeouts
- File permission errors
- Port conflicts
- SSL certificate issues
- CORS configuration errors
- Memory/CPU usage spikes

**Post-Deployment Tasks:**
- Update documentation with actual deployment details
- Schedule regular security updates
- Plan for monitoring and alerting
- Schedule regular backups
- Plan for scaling if needed
