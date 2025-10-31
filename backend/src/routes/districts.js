import express from 'express';
import DistrictData from '../models/DistrictData.js';
import { getCachedData, setCachedData } from '../services/cacheService.js';

const router = express.Router();

// Chhattisgarh districts configuration
const DISTRICTS_CONFIG = [
  { 
    code: 'raipur', 
    name: { en: 'Raipur', hi: 'रायपुर' },
    coordinates: { lat: 21.2514, lng: 81.6296 }
  },
  { 
    code: 'bilaspur', 
    name: { en: 'Bilaspur', hi: 'बिलासपुर' },
    coordinates: { lat: 22.0797, lng: 82.1409 }
  },
  { 
    code: 'durg', 
    name: { en: 'Durg', hi: 'दुर्ग' },
    coordinates: { lat: 21.1904, lng: 81.2849 }
  },
  { 
    code: 'rajnandgaon', 
    name: { en: 'Rajnandgaon', hi: 'राजनांदगांव' },
    coordinates: { lat: 21.0974, lng: 81.0379 }
  },
  { 
    code: 'korba', 
    name: { en: 'Korba', hi: 'कोरबा' },
    coordinates: { lat: 22.3595, lng: 82.7501 }
  },
  { 
    code: 'raigarh', 
    name: { en: 'Raigarh', hi: 'रायगढ़' },
    coordinates: { lat: 21.8974, lng: 83.3950 }
  },
  { 
    code: 'janjgir-champa', 
    name: { en: 'Janjgir-Champa', hi: 'जांजगीर-चांपा' },
    coordinates: { lat: 22.0156, lng: 82.5772 }
  },
  { 
    code: 'mahasamund', 
    name: { en: 'Mahasamund', hi: 'महासमुंद' },
    coordinates: { lat: 21.1078, lng: 82.0984 }
  },
  { 
    code: 'bastar', 
    name: { en: 'Bastar', hi: 'बस्तर' },
    coordinates: { lat: 19.0688, lng: 81.9598 }
  },
  { 
    code: 'jashpur', 
    name: { en: 'Jashpur', hi: 'जशपुर' },
    coordinates: { lat: 22.8858, lng: 84.1411 }
  }
];

// Get all districts
router.get('/', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      districts: DISTRICTS_CONFIG 
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

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
    
    // If no data exists, create sample data
    if (!data) {
      const sampleData = generateSampleDistrictData(districtCode, currentMonth, currentYear);
      data = await DistrictData.create(sampleData);
      data = data.toObject();
    }
    
    // Cache the result
    await setCachedData(cacheKey, data, 3600); // 1 hour cache
    
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
      .sort({ year: -1, month: -1 })
      .limit(12)
      .lean();
    
    // If no data, generate sample data for last 6 months
    if (data.length === 0) {
      const months = ['Oct', 'Sep', 'Aug', 'Jul', 'Jun', 'May'];
      const year = new Date().getFullYear();
      
      for (const month of months) {
        const sampleData = generateSampleDistrictData(districtCode, month, year);
        await DistrictData.create(sampleData);
      }
      
      data = await DistrictData.find({ districtCode })
        .sort({ year: -1, month: -1 })
        .limit(12)
        .lean();
    }
    
    // Cache the result
    await setCachedData(cacheKey, data, 7200); // 2 hours cache
    
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
      
      if (!data) {
        const sampleData = generateSampleDistrictData(district.code, currentMonth, currentYear);
        data = await DistrictData.create(sampleData);
        data = data.toObject();
      }
      
      compareData.push({
        districtCode: district.code,
        districtName: district.name,
        data: data.data
      });
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

// Helper function to generate sample data
function generateSampleDistrictData(districtCode, month, year) {
  const baseValue = Math.floor(Math.random() * 10000) + 5000;
  const multiplier = DISTRICTS_CONFIG.find(d => d.code === districtCode) ? 1 : 0.8;
  
  return {
    districtCode,
    districtName: DISTRICTS_CONFIG.find(d => d.code === districtCode)?.name.en || districtCode,
    state: 'Chhattisgarh',
    month,
    year,
    data: {
      householdsEmployed: Math.floor(baseValue * multiplier * 0.8),
      personDaysGenerated: Math.floor(baseValue * multiplier * 12),
      worksCompleted: Math.floor(baseValue * multiplier * 0.05),
      expenditure: parseFloat((baseValue * multiplier * 0.15).toFixed(2)),
      activeWorkers: Math.floor(baseValue * multiplier * 0.6),
      womenEmployment: Math.floor(baseValue * multiplier * 7)
    },
    lastUpdated: new Date()
  };
}

export default router;