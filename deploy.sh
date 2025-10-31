#!/bin/bash

echo "🚀 Starting MGNREGA Dashboard Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo -e "${BLUE}📦 Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node installation
node --version
npm --version

# Install MongoDB
echo -e "${BLUE}📦 Installing MongoDB...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod --no-pager

# Install Redis
echo -e "${BLUE}📦 Installing Redis...${NC}"
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
sudo systemctl status redis-server --no-pager

# Install Nginx
echo -e "${BLUE}📦 Installing Nginx...${NC}"
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
echo -e "${BLUE}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Clone repository
echo -e "${BLUE}📥 Cloning repository...${NC}"
cd ~
# Replace with your actual repository URL
git clone https://github.com/YOUR_USERNAME/mgnrega-dashboard.git
cd mgnrega-dashboard

# Setup Backend
echo -e "${BLUE}🔧 Setting up backend...${NC}"
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/mgnrega
REDIS_URL=redis://localhost:6379
DATA_GOV_API_BASE=https://api.data.gov.in/resource/
DATA_GOV_API_KEY=
CORS_ORIGIN=http://$(curl -s http://checkip.amazonaws.com)
EOF

echo -e "${GREEN}✅ Backend .env created${NC}"

# Seed database with sample data
echo -e "${BLUE}🌱 Seeding database...${NC}"
node src/jobs/seedData.js

# Start backend with PM2
echo -e "${BLUE}🚀 Starting backend with PM2...${NC}"
pm2 start src/app.js --name mgnrega-backend
pm2 save
pm2 startup

# Setup Frontend
echo -e "${BLUE}🔧 Setting up frontend...${NC}"
cd ../frontend
npm install

# Create frontend .env
cat > .env << EOF
VITE_API_URL=/api
EOF

# Build frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
npm run build

# Deploy frontend to nginx
echo -e "${BLUE}📤 Deploying frontend...${NC}"
sudo mkdir -p /var/www/mgnrega
sudo cp -r dist/* /var/www/mgnrega/
sudo chown -R www-data:www-data /var/www/mgnrega

# Configure Nginx
echo -e "${BLUE}⚙️  Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/mgnrega > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/mgnrega;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/css application/javascript application/json image/svg+xml;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/mgnrega_access.log;
    error_log /var/log/nginx/mgnrega_error.log;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/mgnrega /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# Setup firewall
echo -e "${BLUE}🔒 Configuring firewall...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

echo -e "${GREEN}"
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "🌐 Access your dashboard at:"
echo "   http://$PUBLIC_IP"
echo ""
echo "🔧 Backend API:"
echo "   http://$PUBLIC_IP/api/health"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Useful Commands:"
echo "   pm2 logs mgnrega-backend  # View logs"
echo "   pm2 restart mgnrega-backend  # Restart backend"
echo "   sudo systemctl status nginx  # Check Nginx"
echo "   sudo systemctl status mongod  # Check MongoDB"
echo ""
echo -e "${NC}"