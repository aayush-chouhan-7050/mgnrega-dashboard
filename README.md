# 🇮🇳 MGNREGA Dashboard - Chhattisgarh

A production-ready web application for rural citizens of Chhattisgarh to track and understand MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) program performance in their districts.

## 🎯 Project Overview

This dashboard makes MGNREGA data accessible to low-literacy rural populations through:
- **Visual-first design** with icons and charts
- **Multilingual support** (English & Hindi)
- **Location-based district detection**
- **Historical performance tracking**
- **Simple, intuitive interface**

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB 7.0
- **Cache**: Redis
- **Server**: AWS EC2 (Ubuntu 22.04, 16GB RAM)
- **Process Manager**: PM2
- **Web Server**: Nginx

### Key Design Decisions

1. **Caching Strategy**: Redis caches API responses for 24 hours to handle data.gov.in rate limits
2. **Database**: MongoDB stores historical data for trend analysis
3. **Daily Sync**: Cron job fetches latest data from data.gov.in daily at 2 AM
4. **Geolocation**: Automatic district detection using browser geolocation + reverse geocoding
5. **Multilingual**: All content available in English and Hindi
6. **Low-Literacy UX**: Visual cards, minimal text, icon-based navigation

---

## 📂 Project Structure

```
mgnrega-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── redis.js             # Redis connection
│   │   ├── models/
│   │   │   └── DistrictData.js      # MongoDB schema
│   │   ├── routes/
│   │   │   ├── api.js               # Main API routes
│   │   │   └── districts.js         # District-specific routes
│   │   ├── services/
│   │   │   ├── dataGovService.js    # data.gov.in API integration
│   │   │   ├── cacheService.js      # Redis caching logic
│   │   │   └── locationService.js   # Geolocation & geocoding
│   │   ├── jobs/
│   │   │   ├── dataSync.js          # Daily data sync cron job
│   │   │   └── seedData.js          # Database seeding script
│   │   └── app.js                   # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Main dashboard component
│   │   │   ├── DistrictSelector.jsx # District selection + location
│   │   │   ├── MetricsCards.jsx     # Key metrics display
│   │   │   ├── Charts.jsx           # Recharts visualizations
│   │   │   ├── InfoSection.jsx      # MGNREGA information
│   │   │   └── LanguageToggle.jsx   # Language switcher
│   │   ├── utils/
│   │   │   └── api.js               # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
├── nginx/
│   └── mgnrega.conf                 # Nginx configuration
├── deploy.sh                         # Automated deployment script
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20.x
- MongoDB 7.0
- Redis 7.x
- Git

### Backend Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/mgnrega-dashboard.git
cd mgnrega-dashboard/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mgnrega
REDIS_URL=redis://localhost:6379
DATA_GOV_API_BASE=https://api.data.gov.in/resource/
DATA_GOV_API_KEY=
CORS_ORIGIN=http://localhost:3000
EOF

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

---

## 🌐 Production Deployment (AWS EC2)

### Step 1: Prepare EC2 Instance

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Update system
sudo apt update && sudo apt upgrade -y
```

### Step 2: Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/mgnrega-dashboard.git
cd mgnrega-dashboard
```

### Step 3: Run Automated Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. ✅ Install Node.js, MongoDB, Redis, Nginx, PM2
2. ✅ Setup backend with environment variables
3. ✅ Seed database with sample data
4. ✅ Start backend with PM2
5. ✅ Build and deploy frontend
6. ✅ Configure Nginx as reverse proxy
7. ✅ Setup firewall rules
8. ✅ Display access URL

### Step 4: Access Dashboard

After deployment completes, access your dashboard at:
```
http://YOUR_EC2_IP
```

---

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

### Install Dependencies

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Redis
sudo apt install -y redis-server
sudo systemctl start redis-server && sudo systemctl enable redis-server

# Nginx
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# PM2
sudo npm install -g pm2
```

### Deploy Backend

```bash
cd ~/mgnrega-dashboard/backend
npm install

# Create .env (replace YOUR_EC2_IP)
cat > .env << EOF
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/mgnrega
REDIS_URL=redis://localhost:6379
DATA_GOV_API_BASE=https://api.data.gov.in/resource/
CORS_ORIGIN=http://YOUR_EC2_IP
EOF

# Seed database
node src/jobs/seedData.js

# Start with PM2
pm2 start src/app.js --name mgnrega-backend
pm2 save
pm2 startup
```

### Deploy Frontend

```bash
cd ~/mgnrega-dashboard/frontend
npm install

# Create .env
echo "VITE_API_URL=/api" > .env

# Build
npm run build

# Deploy to Nginx
sudo mkdir -p /var/www/mgnrega
sudo cp -r dist/* /var/www/mgnrega/
sudo chown -R www-data:www-data /var/www/mgnrega
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/mgnrega
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/mgnrega;
        try_files $uri $uri/ /index.html;
        gzip on;
        gzip_types text/css application/javascript application/json;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:

```bash
sudo ln -sf /etc/nginx/sites-available/mgnrega /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Setup Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

---

## 📊 API Endpoints

### Districts
- `GET /api/districts` - List all districts
- `GET /api/districts/:code/current` - Current month data
- `GET /api/districts/:code/history` - Last 12 months
- `GET /api/districts/compare/all` - Compare all districts

### Location
- `POST /api/location/detect` - Detect district from coordinates
  ```json
  { "lat": 21.2514, "lng": 81.6296 }
  ```

### System
- `GET /api/health` - Health check
- `GET /api/stats` - Database statistics

---

## 🎨 Features

### For Users (Low-Literacy Focus)

1. **Visual Metrics Cards**
   - Large colorful cards with icons
   - Big numbers, minimal text
   - Color-coded by category

2. **Interactive Charts**
   - Line charts for trends
   - Bar charts for comparisons
   - Tooltip explanations

3. **Multilingual Interface**
   - Toggle between English and Hindi
   - All content translated
   - Unicode support for Devanagari

4. **Location Detection**
   - Automatic district detection
   - GPS-based geolocation
   - Fallback to manual selection

5. **What is MGNREGA?**
   - Simple explanation box
   - Icon-based visual aid
   - Easy-to-understand language

### For System (Production-Ready)

1. **Caching Layer**
   - Redis caches API responses
   - 24-hour TTL for district data
   - Reduces load on data.gov.in

2. **Error Handling**
   - Graceful API failures
   - Sample data fallback
   - User-friendly error messages

3. **Performance**
   - Gzip compression
   - MongoDB indexing
   - Connection pooling
   - PM2 clustering

4. **Security**
   - Helmet.js security headers
   - CORS protection
   - Rate limiting (100 req/15min)
   - Input validation

5. **Monitoring**
   - PM2 process management
   - Nginx access logs
   - MongoDB query logs
   - Redis metrics

---

## 🔄 Daily Data Sync

The system automatically syncs data from data.gov.in daily at 2 AM IST.

**Manual sync:**
```bash
npm run sync
```

**Cron schedule** (in `dataSync.js`):
```javascript
cron.schedule('0 2 * * *', syncDistrictData);
```

---

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000                              # Backend port
NODE_ENV=production                    # Environment
MONGODB_URI=mongodb://localhost:27017/mgnrega  # MongoDB connection
REDIS_URL=redis://localhost:6379       # Redis connection
DATA_GOV_API_BASE=https://api.data.gov.in/resource/  # API base URL
DATA_GOV_API_KEY=                      # API key (optional)
CORS_ORIGIN=http://YOUR_EC2_IP         # Frontend URL
```

### Frontend (.env)

```env
VITE_API_URL=/api                      # Backend API URL
```

---

## 🛠️ Maintenance Commands

### PM2 Management
```bash
pm2 status                    # Check status
pm2 logs mgnrega-backend      # View logs
pm2 restart mgnrega-backend   # Restart app
pm2 stop mgnrega-backend      # Stop app
pm2 delete mgnrega-backend    # Remove app
```

### MongoDB
```bash
sudo systemctl status mongod   # Check status
sudo systemctl restart mongod  # Restart
mongosh                        # MongoDB shell
use mgnrega                    # Switch database
db.districtdatas.find().limit(5)  # View data
```

### Redis
```bash
sudo systemctl status redis-server  # Check status
redis-cli                           # Redis CLI
KEYS *                              # List all keys
GET district:raipur:current         # Get cached data
FLUSHALL                            # Clear cache
```

### Nginx
```bash
sudo systemctl status nginx    # Check status
sudo nginx -t                  # Test configuration
sudo systemctl reload nginx    # Reload config
sudo tail -f /var/log/nginx/mgnrega_access.log  # View logs
```

---

## 🧪 Testing

### Health Check
```bash
curl http://YOUR_EC2_IP/api/health
```

### Get Districts
```bash
curl http://YOUR_EC2_IP/api/districts
```

### Get District Data
```bash
curl http://YOUR_EC2_IP/api/districts/raipur/current
```

### Test Location Detection
```bash
curl -X POST http://YOUR_EC2_IP/api/location/detect \
  -H "Content-Type: application/json" \
  -d '{"lat": 21.2514, "lng": 81.6296}'
```

---

## 📱 Mobile Responsive

The dashboard is fully responsive and works on:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

---

## 🌍 Supported Districts

1. Raipur (रायपुर)
2. Bilaspur (बिलासपुर)
3. Durg (दुर्ग)
4. Rajnandgaon (राजनांदगांव)
5. Korba (कोरबा)
6. Raigarh (रायगढ़)
7. Janjgir-Champa (जांजगीर-चांपा)
8. Mahasamund (महासमुंद)
9. Bastar (बस्तर)
10. Jashpur (जशपुर)

---

## 🎥 Loom Video Checklist

### Part 1: Live Demo (0:00-0:30)
- [ ] Show dashboard homepage
- [ ] Select district from dropdown
- [ ] Demonstrate location detection
- [ ] Toggle between English and Hindi
- [ ] Show all metrics cards updating

### Part 2: Technical Architecture (0:30-1:00)
- [ ] SSH into EC2 instance
- [ ] Show PM2 process running
- [ ] Display MongoDB data: `mongosh mgnrega`
- [ ] Show Redis cache: `redis-cli KEYS *`
- [ ] Check Nginx configuration

### Part 3: Code Walkthrough (1:00-1:40)
- [ ] Show project structure
- [ ] Explain backend API routes
- [ ] Show MongoDB schema
- [ ] Demonstrate caching service
- [ ] Show frontend components
- [ ] Explain location service

### Part 4: Production Features (1:40-2:00)
- [ ] Highlight error handling
- [ ] Show daily cron job
- [ ] Explain rate limiting
- [ ] Demonstrate responsive design
- [ ] Show GitHub repository

---

## 🚨 Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs mgnrega-backend

# Check MongoDB
sudo systemctl status mongod

# Check Redis
sudo systemctl status redis-server

# Restart everything
pm2 restart mgnrega-backend
sudo systemctl restart mongod
sudo systemctl restart redis-server
```

### Frontend not loading
```bash
# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check file permissions
ls -la /var/www/mgnrega

# Rebuild frontend
cd ~/mgnrega-dashboard/frontend
npm run build
sudo cp -r dist/* /var/www/mgnrega/
```

### Location detection not working
- Ensure browser supports geolocation
- Check HTTPS (geolocation requires HTTPS in production)
- Verify coordinates are within Chhattisgarh bounds

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Created as part of MGNREGA data accessibility initiative

---

## 🔗 Links

- **GitHub**: https://github.com/aayush-chouhan-7050/mgnrega-dashboard
- **Loom Video**: [Your Loom Link]
- **Live Demo**: http://YOUR_EC2_IP

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review PM2 logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/mgnrega_error.log`

---