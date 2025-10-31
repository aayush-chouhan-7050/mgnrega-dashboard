import express from 'express';
import { detectDistrict } from '../services/locationService.js';

const router = express.Router();

// POST /api/location/detect
// Detects the nearest district from latitude and longitude
router.post('/detect', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({
        success: false,
        error: 'Missing required "lat" and "lng" in request body.'
      });
    }

    const locationData = await detectDistrict(lat, lng);
    
    res.json({ 
      success: true, 
      ...locationData 
    });

  } catch (error) {
    console.error('Detect district error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to detect district from location.' 
    });
  }
});

export default router;