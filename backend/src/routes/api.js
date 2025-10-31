import express from 'express';

const router = express.Router();

// GET /api/
// Main API status endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'MGNREGA Dashboard API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health
// Health check endpoint for the frontend
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;