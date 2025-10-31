import express from 'express';
import DistrictData from '../models/DistrictData.js';
import { getCachedData, setCachedData } from '../services/cacheService.js';

const router = express.Router();

// Get district data
router.get('/districts/:districtCode', async (req, res) => {
  try {
    const { districtCode } = req.params;
    const cacheKey = `district:${districtCode}`;
    
    // Check cache
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, source: 'cache' });
    }
    
    // Fetch from database
    const data = await DistrictData.find({ districtCode })
      .sort({ year: -1, month: -1 })
      .limit(12)
      .lean();
    
    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    
    // Cache the result
    await setCachedData(cacheKey, data);
    
    res.json({ success: true, data, source: 'database' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all districts list
router.get('/districts', async (req, res) => {
  try {
    const districts = await DistrictData.distinct('districtCode');
    res.json({ success: true, districts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reverse geocoding to get district
router.post('/location/district', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // Simple mapping for Chhattisgarh (enhance with actual geocoding API)
    const districtMap = {
      'raipur': { lat: 21.2514, lng: 81.6296 },
      'bilaspur': { lat: 22.0797, lng: 82.1409 },
      'durg': { lat: 21.1904, lng: 81.2849 }
    };
    
    // Find nearest district
    let nearestDistrict = 'raipur';
    let minDistance = Infinity;
    
    Object.entries(districtMap).forEach(([code, coords]) => {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestDistrict = code;
      }
    });
    
    res.json({ success: true, district: nearestDistrict });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;