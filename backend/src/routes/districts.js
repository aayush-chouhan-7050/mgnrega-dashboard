import express from 'express';
import DistrictData from '../models/DistrictData.js';
import { getCachedData, setCachedData } from '../services/cacheService.js';

const router = express.Router();

// Chhattisgarh districts configuration
export const DISTRICTS_CONFIG = [
  { code: 'raipur', name: { en: 'Raipur', hi: 'रायपुर' }, coordinates: { lat: 21.2514, lng: 81.6296 } },
  { code: 'bilaspur', name: { en: 'Bilaspur', hi: 'बिलासपुर' }, coordinates: { lat: 22.0797, lng: 82.1409 } },
  { code: 'durg', name: { en: 'Durg', hi: 'दुर्ग' }, coordinates: { lat: 21.1904, lng: 81.2849 } },
  { code: 'rajnandgaon', name: { en: 'RAJNANDAGON', hi: 'राजनांदगांव' }, coordinates: { lat: 21.0974, lng: 81.0379 } },
  { code: 'korba', name: { en: 'Korba', hi: 'कोरबा' }, coordinates: { lat: 22.3595, lng: 82.7501 } },
  { code: 'raigarh', name: { en: 'Raigarh', hi: 'रायगढ़' }, coordinates: { lat: 21.8974, lng: 83.3950 } },
  { code: 'janjgir-champa', name: { en: 'Janjgir-Champa', hi: 'जांजगीर-चांपा' }, coordinates: { lat: 22.0156, lng: 82.5772 } },
  { code: 'mahasamund', name: { en: 'Mahasamund', hi: 'महासमुंद' }, coordinates: { lat: 21.1078, lng: 82.0984 } },
  { code: 'bastar', name: { en: 'Bastar', hi: 'बस्तर' }, coordinates: { lat: 19.0688, lng: 81.9598 } },
  { code: 'jashpur', name: { en: 'Jashpur', hi: 'जशपुर' }, coordinates: { lat: 22.8858, lng: 84.1411 } },
  { code: 'balod', name: { en: 'Balod', hi: 'बालोद' }, coordinates: { lat: 20.728, lng: 81.206 } },
  { code: 'baloda-bazar', name: { en: 'BALODA BAZAR', hi: 'बलौदा बाजार' }, coordinates: { lat: 21.65, lng: 82.17 } },
  { code: 'balrampur', name: { en: 'Balrampur', hi: 'बलरामपुर' }, coordinates: { lat: 23.61, lng: 83.60 } },
  { code: 'bemetara', name: { en: 'Bemetara', hi: 'बेमेतरा' }, coordinates: { lat: 21.72, lng: 81.53 } },
  { code: 'bijapur', name: { en: 'Bijapur', hi: 'बीजापुर' }, coordinates: { lat: 18.79, lng: 80.82 } },
  { code: 'dantewada', name: { en: 'DANTEWADA', hi: 'दंतेवाड़ा' }, coordinates: { lat: 18.90, lng: 81.35 } },
  { code: 'dhamtari', name: { en: 'Dhamtari', hi: 'धमतरी' }, coordinates: { lat: 20.71, lng: 81.55 } },
  { code: 'gariaband', name: { en: 'GARIYABAND', hi: 'गरियाबंद' }, coordinates: { lat: 20.63, lng: 82.06 } },
  { code: 'gaurela-pendra-marwahi', name: { en: 'GAURELA PENDRA MARWAHI', hi: 'गौरेला-पेंड्रा-मरवाही' }, coordinates: { lat: 22.75, lng: 81.90 } },
  { code: 'kanker', name: { en: 'KANKER', hi: 'कांकेर' }, coordinates: { lat: 20.27, lng: 81.49 } },
  { code: 'kabirdham', name: { en: 'KAWARDHA', hi: 'कबीरधाम' }, coordinates: { lat: 22.09, lng: 81.33 } },
  { code: 'khairagarh-chhuikhadan-gandai', name: { en: 'KHAIRAGARH CHHUIKHADAN GANDAI', hi: 'खैरागढ़-छुईखदान-गंडई' }, coordinates: { lat: 21.42, lng: 80.98 } },
  { code: 'kondagaon', name: { en: 'Kondagaon', hi: 'कोंडागांव' }, coordinates: { lat: 19.60, lng: 81.67 } },
  { code: 'koriya', name: { en: 'KOREA', hi: 'कोरिया' }, coordinates: { lat: 23.27, lng: 82.25 } },
  { code: 'manendragarh-chirmiri-bharatpur', name: { en: 'MANENDRAGARH CHIRMIRI BHARATPUR', hi: 'मनेंद्रगढ़-चिरमिरी-भरतपुर' }, coordinates: { lat: 23.21, lng: 82.20 } },
  { code: 'mohla-manpur-ambagarh-chowki', name: { en: 'MOHLA MANPUR AMBAGARH CHOWKI', hi: 'मोहला-मानपुर-अंबागढ़ चौकी' }, coordinates: { lat: 20.59, lng: 80.73 } },
  { code: 'mungeli', name: { en: 'Mungeli', hi: 'मुंगेली' }, coordinates: { lat: 22.07, lng: 81.68 } },
  { code: 'narayanpur', name: { en: 'Narayanpur', hi: 'नारायणपुर' }, coordinates: { lat: 19.72, lng: 81.25 } },
  { code: 'sukma', name: { en: 'Sukma', hi: 'सुकमा' }, coordinates: { lat: 18.40, lng: 81.67 } },
  { code: 'surajpur', name: { en: 'Surajpur', hi: 'सूरजपुर' }, coordinates: { lat: 23.22, lng: 82.85 } },
  { code: 'surguja', name: { en: 'Surguja', hi: 'सरगुजा' }, coordinates: { lat: 23.12, lng: 83.20 } },
  { code: 'sakti', name: { en: 'Sakti', hi: 'सक्ति' }, coordinates: { lat: 22.03, lng: 82.96 } },
  { code: 'sarangarh-bilaigarh', name: { en: 'SARANGARH BILAIGARH', hi: 'सारंगढ़-बिलाईगढ़' }, coordinates: { lat: 21.59, lng: 83.08 } }
];

// GET /api/districts/
// Get all districts list
router.get('/', async (req, res) => {
  try {
    // Return the static config, as it contains names and coordinates
    res.json({ 
      success: true, 
      districts: DISTRICTS_CONFIG 
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get districts list.' 
    });
  }
});

// GET /api/districts/:districtCode/current
// Get specific district current data
router.get('/:districtCode/current', async (req, res) => {
  try {
    const { districtCode } = req.params;
    const cacheKey = `district:${districtCode}:current`;
    
    // Check cache first
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json({ 
        success: true, 
        data: cachedData, 
        source: 'cache' 
      });
    }
    
    // Get current month data from database
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'short' });
    const currentYear = now.getFullYear();
    
    let data = await DistrictData.findOne({ 
      districtCode, 
      month: currentMonth, 
      year: currentYear 
    }).lean();
    
    // If no data, return 404. DO NOT create sample data.
    if (!data) {
      return res.status(404).json({
        success: false,
        error: `No current data found for ${districtCode}. Data may still be syncing.`
      });
    }
    
    // Cache the result (uses default 24h TTL)
    await setCachedData(cacheKey, data); 
    
    res.json({ 
      success: true, 
      data, 
      source: 'database' 
    });
  } catch (error) {
    console.error('Get district current data error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/districts/:districtCode/history
// Get district historical data (last 12 months)
router.get('/:districtCode/history', async (req, res) => {
  try {
    const { districtCode } = req.params;
    const cacheKey = `district:${districtCode}:history`;
    
    // Check cache
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json({ 
        success: true, 
        data: cachedData, 
        source: 'cache' 
      });
    }
    
    // Get last 12 months data
    let data = await DistrictData.find({ districtCode })
      .sort({ year: -1, month: -1 }) // Sorting is complex with month names, ensure this works
      .limit(12)
      .lean();
    
    // If no data, return empty array. DO NOT create sample data.
    if (data.length === 0) {
      return res.json({
        success: true,
        data: [], // Return empty array, frontend can handle this
        source: 'database',
        message: `No historical data found for ${districtCode}.`
      });
    }
    
    // Cache the result
    await setCachedData(cacheKey, data);
    
    res.json({ 
      success: true, 
      data, 
      source: 'database' 
    });
  } catch (error) {
    console.error('Get district history error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/districts/compare/all
// Compare all districts (for comparative analysis)
router.get('/compare/all', async (req, res) => {
  try {
    const cacheKey = 'districts:compare:all';
    
    // Check cache
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json({ 
        success: true, 
        data: cachedData, 
        source: 'cache' 
      });
    }
    
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'short' });
    const currentYear = now.getFullYear();
    
    const compareData = [];
    
    for (const district of DISTRICTS_CONFIG) {
      let data = await DistrictData.findOne({
        districtCode: district.code,
        month: currentMonth,
        year: currentYear
      }).lean();
      
      // If no data, push a null/empty entry instead of creating fake data
      if (!data) {
        compareData.push({
          districtCode: district.code,
          districtName: district.name,
          data: null // Frontend can show "N/A"
        });
      } else {
         compareData.push({
          districtCode: district.code,
          districtName: district.name,
          data: data.data
        });
      }
    }
    
    // Cache for 2 hours
    await setCachedData(cacheKey, compareData, 7200);
    
    res.json({ 
      success: true, 
      data: compareData, 
      source: 'database' 
    });
  } catch (error) {
    console.error('Compare districts error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;