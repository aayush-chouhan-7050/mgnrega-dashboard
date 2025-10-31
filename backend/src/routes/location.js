import express from 'express';
import { detectDistrict } from '../services/locationService.js';
import logger from '../utils/logger.js'; // IMPORT LOGGER

const router = express.Router();

// POST /api/location/detect
// Detects the nearest district from latitude and longitude
router.post('/detect', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    logger.info('Request for location detection', { lat, lng });

    if (lat == null || lng == null) {
      logger.warn('Location detection failed: Missing lat/lng');
      return res.status(400).json({
        success: false,
        error: 'Missing required "lat" and "lng" in request body.'
      });
    }

    const locationData = await detectDistrict(lat, lng);
    
    logger.info('Location detection successful', { 
      detectedDistrict: locationData.detectedDistrict, 
      confidence: locationData.confidence 
    });
    
    res.json({ 
      success: true, 
      ...locationData 
    });

  } catch (error) {
    logger.error('Location detection error', { 
      message: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to detect district from location.' 
    });
  }
});

export default router;