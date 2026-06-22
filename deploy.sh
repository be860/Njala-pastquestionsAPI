#!/bin/bash

# Njala Past Questions API - Deployment Script for Linux (Ubuntu/Nginx)
# This script automates the deployment process
# Usage: ./deploy.sh [backend|frontend|all]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/var/www/njala-backend"
FRONTEND_DIR="/var/www/njala-frontend"
SERVICE_NAME="njala-backend.service"
PM2_APP_NAME="njala-frontend"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root"
        exit 1
    fi
}

deploy_backend() {
    print_info "Deploying backend..."
    
    # Check if backend directory exists
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    # Stop the service
    print_info "Stopping backend service..."
    sudo systemctl stop $SERVICE_NAME || true
    
    # Backup current deployment (optional)
    if [ -f "$BACKEND_DIR/NjalaAPI.dll" ]; then
        print_info "Creating backup..."
        BACKUP_DIR="$HOME/njala-backups/backend-$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp -r "$BACKEND_DIR"/* "$BACKUP_DIR/"
        print_success "Backup created at $BACKUP_DIR"
    fi
    
    # Note: Files should be transferred before running this script
    # This script assumes files are already in place
    
    # Set correct permissions
    print_info "Setting permissions..."
    sudo chown -R www-data:www-data "$BACKEND_DIR"
    sudo chmod -R 755 "$BACKEND_DIR"
    
    # Start the service
    print_info "Starting backend service..."
    sudo systemctl start $SERVICE_NAME
    
    # Check service status
    sleep 2
    if sudo systemctl is-active --quiet $SERVICE_NAME; then
        print_success "Backend service started successfully"
    else
        print_error "Backend service failed to start"
        sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
        exit 1
    fi
    
    print_success "Backend deployment completed"
}

deploy_frontend() {
    print_info "Deploying frontend..."
    
    # Check if frontend directory exists
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    # Navigate to frontend directory
    cd "$FRONTEND_DIR"
    
    # Backup current deployment (optional)
    if [ -d "$FRONTEND_DIR/.next" ]; then
        print_info "Creating backup..."
        BACKUP_DIR="$HOME/njala-backups/frontend-$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp -r "$FRONTEND_DIR"/* "$BACKUP_DIR/"
        print_success "Backup created at $BACKUP_DIR"
    fi
    
    # Install dependencies (if package.json changed)
    print_info "Installing dependencies..."
    npm install --production
    
    # Restart PM2 process
    print_info "Restarting frontend with PM2..."
    if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
        pm2 restart $PM2_APP_NAME
    else
        print_info "Starting new PM2 process..."
        pm2 start npm --name "$PM2_APP_NAME" -- start
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Check PM2 status
    sleep 2
    if pm2 describe $PM2_APP_NAME | grep -q "online"; then
        print_success "Frontend started successfully"
    else
        print_error "Frontend failed to start"
        pm2 logs $PM2_APP_NAME --lines 20 --nostream
        exit 1
    fi
    
    print_success "Frontend deployment completed"
}

restart_nginx() {
    print_info "Restarting Nginx..."
    
    # Test Nginx configuration
    if sudo nginx -t; then
        sudo systemctl restart nginx
        print_success "Nginx restarted successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

show_status() {
    print_info "Service Status:"
    echo ""
    
    echo "Backend Service:"
    sudo systemctl status $SERVICE_NAME --no-pager -l || true
    echo ""
    
    echo "Frontend (PM2):"
    pm2 status $PM2_APP_NAME || true
    echo ""
    
    echo "Nginx:"
    sudo systemctl status nginx --no-pager || true
}

show_logs() {
    print_info "Recent Logs:"
    echo ""
    
    echo "=== Backend Logs ==="
    sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
    echo ""
    
    echo "=== Frontend Logs ==="
    pm2 logs $PM2_APP_NAME --lines 20 --nostream
    echo ""
    
    echo "=== Nginx Error Logs ==="
    sudo tail -n 20 /var/log/nginx/njala-error.log
}

# Main script
check_root

case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        restart_nginx
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        print_info "Restarting all services..."
        sudo systemctl restart $SERVICE_NAME
        pm2 restart $PM2_APP_NAME
        restart_nginx
        print_success "All services restarted"
        ;;
    *)
        echo "Usage: $0 {backend|frontend|all|status|logs|restart}"
        echo ""
        echo "Commands:"
        echo "  backend   - Deploy backend only"
        echo "  frontend  - Deploy frontend only"
        echo "  all       - Deploy both backend and frontend"
        echo "  status    - Show status of all services"
        echo "  logs      - Show recent logs from all services"
        echo "  restart   - Restart all services"
        exit 1
        ;;
esac

print_success "Deployment script completed successfully!"
