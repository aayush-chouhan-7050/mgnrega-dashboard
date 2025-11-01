# 🇮🇳 MGNREGA Dashboard - Chhattisgarh

[![Production Ready](https://img.shields.io/badge/status-production--ready-brightgreen.svg)](https://mgnrega-dash.duckdns.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-success.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A production-ready, accessible web application designed for rural citizens of Chhattisgarh to track and understand MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) program performance across all 33 districts.

## 🌐 Live Demo

**[https://mgnrega-dash.duckdns.org/](https://mgnrega-dash.duckdns.org/)**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Production Deployment](#production-deployment)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Maintenance & Operations](#-maintenance--operations)
- [Accessibility Features](#-accessibility-features)
- [Performance Optimizations](#-performance-optimizations)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This dashboard makes critical MGNREGA employment data accessible to low-literacy rural populations through:

- **🎨 Visual-First Design**: Large icons, color-coded metrics, and minimal text
- **🌏 Bilingual Support**: Complete interface in English and Hindi (Devanagari)
- **📍 Smart Location Detection**: Automatic district identification via GPS
- **📊 Historical Analytics**: Multi-year trend analysis and comparisons
- **♿ Accessibility**: WCAG 2.1 Level AA compliant with ARIA labels
- **📱 Mobile Responsive**: Optimized for devices from 375px to 1920px+

**Target Users**: Rural citizens, MGNREGA workers, district officials, researchers, and policy makers

---

## ✨ Key Features

### For End Users

#### 1. **Multi-District Coverage**
- All 33 districts of Chhattisgarh
- Real-time data from data.gov.in API
- Historical data from 2018 onwards

#### 2. **Flexible Time Filtering**
- Last 12 Months view
- All-time historical data
- Financial year-specific filtering (2018-19 to present)

#### 3. **Intelligent Visualizations**
- Line charts for monthly trends
- Bar charts for comparisons
- District vs. State average benchmarking
- Automatic chart summaries with insights

#### 4. **Location Services**
- GPS-based automatic district detection
- Reverse geocoding with OpenStreetMap
- Fallback to manual selection

#### 5. **Language Support**
- Complete UI translation (English/Hindi)
- Devanagari font optimization
- Language-aware number formatting

### For System Administrators

#### 1. **Robust Caching**
- Redis-based response caching
- 24-hour TTL for district data
- Configurable cache expiration

#### 2. **Data Synchronization**
- Daily automated sync at 2 AM IST
- Manual sync capability via CLI
- Graceful API failure handling

#### 3. **Monitoring & Logging**
- Structured JSON logging
- Separate error log files
- PM2 process management
- Health check endpoints

#### 4. **Security**
- Helmet.js security headers
- CORS protection
- Rate limiting (100 req/15min)
- Input validation
- XSS prevention

#### 5. **Performance**
- Gzip compression
- MongoDB indexing
- Connection pooling
- Code splitting for frontend

---

## 🏗️ Architecture

### System Design

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────▶│    Nginx     │─────▶│   Express   │
│  (React)    │◀─────│  (Reverse    │◀─────│   Backend   │
└─────────────┘      │   Proxy)     │      └─────────────┘
                     └──────────────┘            │
                                                 │
                     ┌──────────────┐            │
                     │    Redis     │◀───────────┤
                     │   (Cache)    │            │
                     └──────────────┘            │
                                                 │
                     ┌──────────────┐            │
                     │   MongoDB    │◀───────────┤
                     │  (Database)  │            │
                     └──────────────┘            │
                                                 │
                     ┌──────────────┐            │
                     │ Data.gov.in  │◀───────────┘
                     │     API      │
                     └──────────────┘
```

### Data Flow

1. **User Request** → Nginx receives HTTP request
2. **Routing** → Nginx proxies `/api/*` to Express backend
3. **Cache Check** → Backend checks Redis cache
4. **Cache Hit** → Return cached data (fast path)
5. **Cache Miss** → Query MongoDB database
6. **Database Miss** → Fetch from data.gov.in API (fallback)
7. **Cache Update** → Store result in Redis
8. **Response** → Return JSON to frontend

### Cron Job Flow

```
Daily at 2:00 AM IST
       ↓
[Data Sync Service]
       ↓
Fetch all records for each financial year
       ↓
Transform API data to schema format
       ↓
Upsert records to MongoDB (by district, month, year)
       ↓
Update recordDate field for proper sorting
       ↓
[Sync Complete]
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Vite 5.0** - Build tool & dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **Recharts 2.10** - Data visualization
- **Lucide React 0.263** - Icon library
- **Axios 1.6** - HTTP client

### Backend
- **Node.js 20.x** - Runtime environment
- **Express 4.18** - Web framework
- **Mongoose 8.0** - MongoDB ODM
- **Redis 4.6** - Caching layer
- **Node-Cron 3.0** - Job scheduling
- **Helmet 7.1** - Security middleware
- **Compression 1.7** - Response compression
- **Express-Rate-Limit 7.1** - API rate limiting

### Infrastructure
- **MongoDB 7.0** - NoSQL database
- **Redis 7.x** - In-memory cache
- **Nginx** - Reverse proxy & static file server
- **PM2** - Process manager
- **Ubuntu 22.04** - Operating system
- **AWS EC2** - Cloud hosting

### External Services
- **Data.gov.in API** - MGNREGA data source
- **OpenStreetMap Nominatim** - Reverse geocoding
- **Let's Encrypt** - SSL certificates (optional)

---

## 📂 Project Structure

```
mgnrega-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection setup
│   │   │   └── redis.js             # Redis client configuration
│   │   ├── models/
│   │   │   └── DistrictData.js      # Mongoose schema with indexes
│   │   ├── routes/
│   │   │   ├── api.js               # Health check & stats endpoints
│   │   │   ├── districts.js         # District data routes
│   │   │   └── location.js          # Geolocation detection
│   │   ├── services/
│   │   │   ├── dataGovService.js    # Data.gov.in API client
│   │   │   ├── cacheService.js      # Redis caching wrapper
│   │   │   └── locationService.js   # GPS & reverse geocoding
│   │   ├── jobs/
│   │   │   ├── dataSync.js          # Daily data sync cron job
│   │   │   └── seedData.js          # Database seeding script
│   │   ├── utils/
│   │   │   └── logger.js            # Structured logging utility
│   │   ├── app.js                   # Express app & middleware
│   │   └── runSync.js               # Standalone sync CLI tool
│   ├── logs/                        # Auto-generated log files
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Main container component
│   │   │   ├── DistrictSelector.jsx # District picker + GPS
│   │   │   ├── MetricsCards.jsx     # KPI cards with ARIA labels
│   │   │   ├── Charts.jsx           # Recharts visualizations
│   │   │   ├── ComparisonChart.jsx  # District vs. State chart
│   │   │   ├── InfoSection.jsx      # MGNREGA explainer
│   │   │   ├── TimeFilter.jsx       # Date range selector
│   │   │   ├── LanguageToggle.jsx   # EN/HI switcher
│   │   │   └── ErrorBoundary.jsx    # Global error handler
│   │   ├── utils/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind imports
│   ├── public/
│   ├── index.html
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind customization
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── nginx/
│   └── mgnrega.conf                 # Nginx site configuration
├── deploy.sh                         # Automated deployment script
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js 20.x** - [Download](https://nodejs.org/)
- **MongoDB 7.0+** - [Install Guide](https://www.mongodb.com/docs/manual/installation/)
- **Redis 7.x** - [Install Guide](https://redis.io/docs/getting-started/)
- **Git** - [Download](https://git-scm.com/)

For production deployment, you'll also need:
- **Nginx** - Reverse proxy
- **PM2** - Process manager (`npm install -g pm2`)

---

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/aayush-chouhan-7050/mgnrega-dashboard.git
cd mgnrega-dashboard
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Configure `.env`:**

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mgnrega
REDIS_URL=redis://localhost:6379
DATA_GOV_API_BASE=https://api.data.gov.in/resource/
DATA_GOV_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:3000
```

**Seed the database:**

```bash
npm run seed
```

**Start development server:**

```bash
npm run dev
```

Backend will run on `http://localhost:5001`

#### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5001/api" > .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 4. Verify Setup

Visit `http://localhost:3000` in your browser. You should see:
- District selector dropdown
- Language toggle (EN/HI)
- Info section about MGNREGA

Select a district to view data!

---

### Production Deployment

#### Option 1: Automated Deployment (Recommended)

For AWS EC2 or any Ubuntu 22.04 server:

```bash
# SSH into your server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Clone repository
git clone https://github.com/aayush-chouhan-7050/mgnrega-dashboard.git
cd mgnrega-dashboard

# Make script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

The script will:
1. ✅ Install all dependencies (Node.js, MongoDB, Redis, Nginx, PM2)
2. ✅ Configure environment variables
3. ✅ Seed database with sample data
4. ✅ Build and deploy frontend
5. ✅ Setup Nginx reverse proxy
6. ✅ Start backend with PM2
7. ✅ Configure firewall rules
8. ✅ Display access URL

**Access your dashboard at:** `http://YOUR_EC2_IP`

#### Option 2: Manual Deployment

See the detailed [Manual Deployment Guide](docs/MANUAL_DEPLOYMENT.md) for step-by-step instructions.

#### Option 3: HTTPS Setup (Recommended for Production)

```bash
# Install Certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Update backend .env
nano ~/mgnrega-dashboard/backend/.env
# Change CORS_ORIGIN to https://your-domain.com

# Restart backend
pm2 restart mgnrega-backend
```

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:5001/api`
- **Production**: `https://your-domain.com/api`

### Endpoints

#### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "mongodb": {
      "status": "connected",
      "dbName": "mgnrega"
    },
    "redis": {
      "status": "connected"
    },
    "database": {
      "status": "ok",
      "recordCount": 12540
    }
  },
  "memory": {
    "rss": "125.45 MB",
    "heapUsed": "89.32 MB",
    "heapTotal": "110.15 MB"
  }
}
```

#### Get All Districts

```http
GET /api/districts
```

**Response:**
```json
{
  "success": true,
  "districts": [
    {
      "code": "raipur",
      "name": {
        "en": "RAIPUR",
        "hi": "रायपुर"
      },
      "coordinates": {
        "lat": 21.2514,
        "lng": 81.6296
      }
    }
    // ... 32 more districts
  ]
}
```

#### Get District History

```http
GET /api/districts/:districtCode/history/:yearKey
```

**Parameters:**
- `districtCode` (string): District code (e.g., "raipur")
- `yearKey` (string): Time filter
  - `12m` - Last 12 months
  - `all` - All historical data
  - `2020-2021` - Specific financial year

**Example:**
```bash
curl https://mgnrega-dash.duckdns.org/api/districts/raipur/history/12m
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "districtCode": "raipur",
      "districtName": "RAIPUR",
      "month": "Oct",
      "year": 2024,
      "recordDate": "2024-10-01T00:00:00.000Z",
      "data": {
        "householdsEmployed": 8542,
        "personDaysGenerated": 93962,
        "worksCompleted": 341,
        "expenditure": 1025.04,
        "activeWorkers": 4698,
        "womenEmployment": 55542
      },
      "lastUpdated": "2024-11-01T02:00:00.000Z"
    }
    // ... more months
  ],
  "source": "cache"
}
```

#### Get Available Financial Years

```http
GET /api/districts/:districtCode/financial-years
```

**Response:**
```json
{
  "success": true,
  "data": [
    "2024-2025",
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
    "2019-2020",
    "2018-2019"
  ],
  "source": "cache"
}
```

#### Compare All Districts

```http
GET /api/districts/compare/all
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "districtCode": "raipur",
      "districtName": {
        "en": "RAIPUR",
        "hi": "रायपुर"
      },
      "data": {
        "householdsEmployed": 8542,
        "personDaysGenerated": 93962,
        "worksCompleted": 341,
        "expenditure": 1025.04
      }
    }
    // ... 32 more districts
  ],
  "source": "database"
}
```

#### Detect District from Location

```http
POST /api/location/detect
Content-Type: application/json

{
  "lat": 21.2514,
  "lng": 81.6296
}
```

**Response:**
```json
{
  "success": true,
  "detectedDistrict": "raipur",
  "distance": 2.34,
  "confidence": "high",
  "geocodedLocation": {
    "district": "Raipur",
    "state": "Chhattisgarh",
    "country": "India",
    "fullAddress": "Raipur, Chhattisgarh, India"
  },
  "coordinates": {
    "lat": 21.2514,
    "lng": 81.6296
  }
}
```

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `5001` | No |
| `NODE_ENV` | Environment mode | `development` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mgnrega` | Yes |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | Yes |
| `DATA_GOV_API_BASE` | Data.gov.in API base URL | `https://api.data.gov.in/resource/` | Yes |
| `DATA_GOV_API_KEY` | Data.gov.in API key | - | No* |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` | Yes |

*Optional for data.gov.in, but recommended for higher rate limits

### Frontend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `/api` | Yes |

**Note:** In production with Nginx, use `/api` to leverage reverse proxy. In development, use full URL like `http://localhost:5001/api`.

---

## 🔧 Maintenance & Operations

### PM2 Commands

```bash
# View all processes
pm2 status

# View logs
pm2 logs mgnrega-backend
pm2 logs mgnrega-backend --lines 100

# Restart application
pm2 restart mgnrega-backend

# Stop application
pm2 stop mgnrega-backend

# Delete process
pm2 delete mgnrega-backend

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### MongoDB Operations

```bash
# Connect to MongoDB shell
mongosh mgnrega

# View collections
show collections

# Count total records
db.districtdatas.countDocuments()

# View latest records
db.districtdatas.find().sort({recordDate: -1}).limit(5).pretty()

# Check indexes
db.districtdatas.getIndexes()

# Database statistics
db.stats()

# Backup database
mongodump --db mgnrega --out /backup/mgnrega-$(date +%Y%m%d)

# Restore database
mongorestore --db mgnrega /backup/mgnrega-20241101/mgnrega
```

### Redis Operations

```bash
# Connect to Redis CLI
redis-cli

# View all keys
KEYS *

# Get cached data
GET "district:raipur:current"

# Check key expiration
TTL "district:raipur:current"

# Clear all cache
FLUSHALL

# Get Redis info
INFO

# Monitor Redis commands
MONITOR
```

### Nginx Operations

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View access logs
sudo tail -f /var/log/nginx/mgnrega_access.log

# View error logs
sudo tail -f /var/log/nginx/mgnrega_error.log

# Check Nginx status
sudo systemctl status nginx
```

### Data Synchronization

```bash
# Manual sync (standalone)
cd ~/mgnrega-dashboard/backend
npm run sync

# View sync logs
pm2 logs mgnrega-backend | grep "sync"

# Check last sync time
mongosh mgnrega --eval "db.districtdatas.find().sort({lastUpdated: -1}).limit(1).pretty()"
```

### Log Management

```bash
# View application logs
cd ~/mgnrega-dashboard/backend/logs

# Today's logs
cat app-$(date +%Y-%m-%d).log

# Error logs only
cat error-$(date +%Y-%m-%d).log

# Search logs
grep "error" app-*.log

# Tail logs in real-time
tail -f app-$(date +%Y-%m-%d).log

# Rotate old logs (manual)
find logs/ -name "*.log" -mtime +30 -delete
```

---

## ♿ Accessibility Features

This dashboard is built with accessibility as a core principle:

### ARIA Labels
- All interactive elements have descriptive labels
- Charts include `aria-labelledby` and text descriptions
- Form inputs properly associated with labels

### Keyboard Navigation
- Full keyboard support (Tab, Enter, Space, Arrows)
- Visible focus indicators
- Logical tab order

### Screen Reader Support
- Semantic HTML elements (`<article>`, `<section>`, `<nav>`)
- Live regions for dynamic content (`aria-live`)
- Status announcements for loading states

### Visual Accessibility
- High contrast color scheme (WCAG AA compliant)
- Large touch targets (44x44px minimum)
- Scalable fonts (responsive sizing)
- Clear visual hierarchy

### Language Support
- Full bilingual interface (EN/HI)
- Devanagari font optimization
- RTL-ready layout structure

---

## ⚡ Performance Optimizations

### Frontend
- **Code Splitting**: Vendor and chart libraries separated
- **Lazy Loading**: Components loaded on-demand
- **Image Optimization**: SVG icons instead of raster images
- **Bundle Minification**: Terser for production builds
- **Gzip Compression**: Enabled in Nginx

### Backend
- **Redis Caching**: 24-hour TTL reduces DB queries
- **MongoDB Indexing**: Compound indexes on common queries
- **Connection Pooling**: Reuse database connections
- **Response Compression**: Gzip middleware
- **Rate Limiting**: Prevents API abuse

### Database
```javascript
// Optimized indexes
{ districtCode: 1, recordDate: -1 }
{ districtCode: 1, year: 1, month: 1 }
```

### Network
- **CDN-Ready**: Static assets easily cacheable
- **HTTP/2**: Multiplexing for parallel requests
- **Keep-Alive**: Persistent connections

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs mgnrega-backend

# Common issues:
# 1. MongoDB not running
sudo systemctl status mongod
sudo systemctl start mongod

# 2. Redis not running
sudo systemctl status redis-server
sudo systemctl start redis-server

# 3. Port already in use
sudo lsof -i :5001
# Kill process using the port
sudo kill -9 <PID>

# 4. Environment variables missing
cat ~/mgnrega-dashboard/backend/.env

# Restart everything
pm2 restart mgnrega-backend
sudo systemctl restart mongod
sudo systemctl restart redis-server
```

### Frontend shows 502 Bad Gateway

```bash
# Backend is down or unreachable
pm2 status
pm2 restart mgnrega-backend

# Check Nginx proxy configuration
sudo nginx -t
sudo systemctl reload nginx

# Check backend logs
pm2 logs mgnrega-backend --lines 50
```

### Location detection not working

**Symptoms**: "Use My Location" button fails

**Causes**:
1. **HTTP instead of HTTPS**: Geolocation API requires secure context
   - Solution: Setup SSL certificate with Certbot
2. **Browser permissions denied**
   - Solution: Ask user to enable location services
3. **GPS unavailable**
   - Solution: Fallback to manual district selection (already implemented)

### Data not updating

```bash
# Check last sync time
mongosh mgnrega --eval "db.districtdatas.find().sort({lastUpdated: -1}).limit(1).pretty()"

# Run manual sync
cd ~/mgnrega-dashboard/backend
npm run sync

# Check cron job is running
pm2 logs mgnrega-backend | grep "cron\|sync"

# Clear Redis cache to force fresh data
redis-cli FLUSHALL
```

### High memory usage

```bash
# Check PM2 stats
pm2 monit

# Check system resources
free -h
df -h

# Restart backend to clear memory
pm2 restart mgnrega-backend

# Check for memory leaks
pm2 logs mgnrega-backend | grep "memory\|heap"
```

### Slow API responses

```bash
# Check Redis is working
redis-cli PING

# Monitor slow MongoDB queries
mongosh mgnrega
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ts: -1}).limit(10).pretty()

# Check database indexes
db.districtdatas.getIndexes()

# Analyze query performance
db.districtdatas.find({districtCode: "raipur"}).explain("executionStats")
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ministry of Rural Development** - MGNREGA program
- **Data.gov.in** - Open data platform
- **OpenStreetMap** - Reverse geocoding services
- **React Community** - Excellent documentation
- **Tailwind Labs** - Beautiful utility-first CSS

---

**Made with ❤️ for rural India** | **ग्रामीण भारत के लिए प्यार से बनाया गया**