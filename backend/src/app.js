import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { startDataSync } from './jobs/dataSync.js';
import logger from './utils/logger.js'; // IMPORT LOGGER

// Import all route handlers
import apiRoutes from './routes/api.js';
import districtRoutes from './routes/districts.js';
import locationRoutes from './routes/location.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PROD ? 100 : 1000, // 100 requests in prod, 1000 in dev
  message: 'Too many requests from this IP, please try again later.'
});

// --- Middleware ---

// Security headers. Removed insecure `contentSecurityPolicy: false`
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// CORS
// In production, we STRICTLY require the CORS_ORIGIN env var.
// No fallback to '*' for better security.
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!IS_PROD || (IS_PROD && origin === process.env.CORS_ORIGIN)) {
      callback(null, true);
    } else {
      // Log CORS block in production
      if (IS_PROD && origin) {
        logger.warn('CORS blocked request from origin', { origin });
      }
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Apply rate limiting to all /api/ routes
app.use('/api', limiter);

// Mount all route handlers
// /api/ (for health)
app.use('/api', apiRoutes);
// /api/districts/* (for all district data)
app.use('/api/districts', districtRoutes);
// /api/location/* (for location detection)
app.use('/api/location', locationRoutes);

// Root endpoint (will be hit if Nginx isn't proxying)
app.get('/', (req, res) => {
  res.json({
    message: 'MGNREGA Dashboard API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler for any unmatched /api/ routes
app.use('/api/*', (req, res) => {
  logger.warn('404 Not Found', { path: req.originalUrl, ip: req.ip });
  res.status(404).json({
    success: false,
    error: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // USE LOGGER INSTEAD OF CONSOLE.ERROR
  logger.error(err.message, {
    stack: err.stack,
    status: err.status || 500,
    path: req.originalUrl,
    ip: req.ip
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// --- Start Server ---
const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();
    
    // Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      if (IS_PROD) {
        logger.info(`CORS Origin enabled for: ${process.env.CORS_ORIGIN}`);
      } else {
        logger.info('CORS enabled for development (any origin)');
      }
    });
    
    // Start daily data sync job
    if (IS_PROD) {
      logger.info('Starting data sync job...');
      startDataSync();
      logger.info('Data sync job started');
    }

    return server;
  } catch (error) {
    logger.error('Server startup error', { 
      message: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  }
};

startServer();