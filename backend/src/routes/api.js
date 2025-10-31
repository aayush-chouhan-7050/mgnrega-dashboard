// backend/src/routes/api.js
import express from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';
import DistrictData from '../models/DistrictData.js';

const router = express.Router();

// GET /api/
router.get('/', (req, res) => {
  res.json({
    message: 'MGNREGA Dashboard API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health
// Comprehensive health check
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  try {
    // Check MongoDB
    health.services.mongodb = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      dbName: mongoose.connection.name
    };

    // Check Redis
    const redisClient = getRedisClient();
    try {
      await redisClient.ping();
      health.services.redis = {
        status: 'connected'
      };
    } catch (err) {
      health.services.redis = {
        status: 'error',
        error: err.message
      };
      health.status = 'degraded';
    }

    // Check database has data
    const dataCount = await DistrictData.countDocuments();
    health.services.database = {
      status: dataCount > 0 ? 'ok' : 'empty',
      recordCount: dataCount
    };

    if (dataCount === 0) {
      health.status = 'degraded';
      health.warning = 'Database is empty. Run seeding or sync.';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
    };

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// GET /api/stats
// Database statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await DistrictData.aggregate([
      {
        $group: {
          _id: '$districtCode',
          recordCount: { $sum: 1 },
          latestUpdate: { $max: '$lastUpdated' }
        }
      },
      { $sort: { recordCount: -1 } }
    ]);

    const totalRecords = await DistrictData.countDocuments();
    const distinctDistricts = stats.length;

    res.json({
      success: true,
      summary: {
        totalRecords,
        distinctDistricts,
        averageRecordsPerDistrict: Math.round(totalRecords / distinctDistricts)
      },
      districts: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;