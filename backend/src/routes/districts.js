import express from 'express';
import DistrictData from '../models/DistrictData.js';
import { getCachedData, setCachedData } from '../services/cacheService.js';
import logger from '../utils/logger.js'; // IMPORT LOGGER

const router = express.Router();

// Chhattisgarh districts configuration
export const DISTRICTS_CONFIG = [
  { code: 'balod', name: { en: 'BALOD', hi: 'बालोद' }, coordinates: { lat: 20.728, lng: 81.206 } },
  { code: 'baloda-bazar', name: { en: 'BALODA BAZAR', hi: 'बलौदा बाजार' }, coordinates: { lat: 21.65, lng: 82.17 } },
  { code: 'balrampur', name: { en: 'BALRAMPUR', hi: 'बलरामपुर' }, coordinates: { lat: 23.61, lng: 83.6 } },
  { code: 'bastar', name: { en: 'BASTAR', hi: 'बस्तर' }, coordinates: { lat: 19.0688, lng: 81.9598 } },
  { code: 'bemetara', name: { en: 'BEMETARA', hi: 'बेमेतरा' }, coordinates: { lat: 21.72, lng: 81.53 } },
  { code: 'bijapur', name: { en: 'BIJAPUR', hi: 'बीजापुर' }, coordinates: { lat: 18.79, lng: 80.82 } },
  { code: 'bilaspur', name: { en: 'BILASPUR', hi: 'बिलासपुर' }, coordinates: { lat: 22.0797, lng: 82.1409 } },
  { code: 'dantewada', name: { en: 'DANTEWADA', hi: 'दंतेवाड़ा' }, coordinates: { lat: 18.9, lng: 81.35 } },
  { code: 'dhamtari', name: { en: 'DHAMTARI', hi: 'धमतरी' }, coordinates: { lat: 20.71, lng: 81.55 } },
  { code: 'durg', name: { en: 'DURG', hi: 'दुर्ग' }, coordinates: { lat: 21.1904, lng: 81.2849 } },
  { code: 'gariaband', name: { en: 'GARIYABAND', hi: 'गरियाबंद' }, coordinates: { lat: 20.63, lng: 82.06 } },
  { code: 'gaurela-pendra-marwahi', name: { en: 'GAURELA PENDRA MARWAHI', hi: 'गौरेला-पेंड्रा-मरवाही' }, coordinates: { lat: 22.75, lng: 81.9 } },
  { code: 'janjgir-champa', name: { en: 'JANJGIR-CHAMPA', hi: 'जांजगीर-चांपा' }, coordinates: { lat: 22.0156, lng: 82.5772 } },
  { code: 'jashpur', name: { en: 'JASHPUR', hi: 'जशपुर' }, coordinates: { lat: 22.8858, lng: 84.1411 } },
  { code: 'kanker', name: { en: 'KANKER', hi: 'कांकेर' }, coordinates: { lat: 20.27, lng: 81.49 } },
  { code: 'kabirdham', name: { en: 'KAWARDHA', hi: 'कबीरधाम' }, coordinates: { lat: 22.09, lng: 81.33 } },
  { code: 'khairagarh-chhuikhadan-gandai', name: { en: 'KHAIRAGARH CHHUIKHADAN GANDAI', hi: 'खैरागढ़-छुईखदान-गंडई' }, coordinates: { lat: 21.42, lng: 80.98 } },
  { code: 'kondagaon', name: { en: 'KONDAGAON', hi: 'कोंडागांव' }, coordinates: { lat: 19.6, lng: 81.67 } },
  { code: 'korba', name: { en: 'KORBA', hi: 'कोरबा' }, coordinates: { lat: 22.3595, lng: 82.7501 } },
  { code: 'koriya', name: { en: 'KOREA', hi: 'कोरिया' }, coordinates: { lat: 23.27, lng: 82.25 } },
  { code: 'mahasamund', name: { en: 'MAHASAMUND', hi: 'महासमुंद' }, coordinates: { lat: 21.1078, lng: 82.0984 } },
  { code: 'manendragarh-chirmiri-bharatpur', name: { en: 'MANENDRAGARH CHIRMIRI BHARATPUR', hi: 'मनेंद्रगढ़-चिरमिरी-भरतपुर' }, coordinates: { lat: 23.21, lng: 82.2 } },
  { code: 'mohla-manpur-ambagarh-chowki', name: { en: 'MOHLA MANPUR AMBAGARH CHOWKI', hi: 'मोहला-मानपुर-अंबागढ़ चौकी' }, coordinates: { lat: 20.59, lng: 80.73 } },
  { code: 'mungeli', name: { en: 'MUNGELI', hi: 'मुंगेली' }, coordinates: { lat: 22.07, lng: 81.68 } },
  { code: 'narayanpur', name: { en: 'NARAYANPUR', hi: 'नारायणपुर' }, coordinates: { lat: 19.72, lng: 81.25 } },
  { code: 'raigarh', name: { en: 'RAIGARH', hi: 'रायगढ़' }, coordinates: { lat: 21.8974, lng: 83.395 } },
  { code: 'raipur', name: { en: 'RAIPUR', hi: 'रायपुर' }, coordinates: { lat: 21.2514, lng: 81.6296 } },
  { code: 'rajnandgaon', name: { en: 'RAJNANDAGON', hi: 'राजनांदगांव' }, coordinates: { lat: 21.0974, lng: 81.0379 } },
  { code: 'sakti', name: { en: 'SAKTI', hi: 'सक्ति' }, coordinates: { lat: 22.03, lng: 82.96 } },
  { code: 'sarangarh-bilaigarh', name: { en: 'SARANGARH BILAIGARH', hi: 'सारंगढ़-बिलाईगढ़' }, coordinates: { lat: 21.59, lng: 83.08 } },
  { code: 'sukma', name: { en: 'SUKMA', hi: 'सुकमा' }, coordinates: { lat: 18.4, lng: 81.67 } },
  { code: 'surajpur', name: { en: 'SURAJPUR', hi: 'सूरजपुर' }, coordinates: { lat: 23.22, lng: 82.85 } },
  { code: 'surguja', name: { en: 'SURGUJA', hi: 'सरगुजा' }, coordinates: { lat: 23.12, lng: 83.2 } }
];


// GET /api/districts/
// Get all districts list
router.get('/', async (req, res) => {
  try {
    logger.info('Request for /api/districts');
    res.json({ 
      success: true, 
      districts: DISTRICTS_CONFIG 
    });
  } catch (error) {
    logger.error('Failed to get /api/districts', { message: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get districts list.' 
    });
  }
});

// GET /api/districts/:districtCode/current
// Get specific district *latest* data (This is now used for the "Last Updated" text)
router.get('/:districtCode/current', async (req, res) => {
  const { districtCode } = req.params;
  const cacheKey = `district:${districtCode}:current`;
  
  try {
    logger.info(`Request for current data: ${districtCode}`);
    
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json({ 
        success: true, 
        data: cachedData, 
        source: 'cache' 
      });
    }
    
    logger.debug(`Cache miss for ${cacheKey}, querying database...`);
    let data = await DistrictData.findOne({ districtCode })
      .sort({ recordDate: -1 })
      .lean();
    
    if (!data) {
      logger.warn(`No current data found for ${districtCode}`);
      return res.status(404).json({
        success: false,
        error: `No current data found for ${districtCode}. Data may still be syncing.`
      });
    }
    
    await setCachedData(cacheKey, data); 
    
    res.json({ 
      success: true, 
      data, 
      source: 'database' 
    });
  } catch (error) {
    logger.error(`Get district current data error: ${districtCode}`, { 
      message: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// *** NEW ENDPOINT ***
// GET /api/districts/:districtCode/financial-years
// Get a list of available financial years for filtering
router.get('/:districtCode/financial-years', async (req, res) => {
  const { districtCode } = req.params;
  const cacheKey = `district:${districtCode}:finYears`;

  try {
    logger.info(`Request for financial years: ${districtCode}`);

    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json({ success: true, data: cachedData, source: 'cache' });
    }

    logger.debug(`Cache miss for ${cacheKey}, querying database...`);
    const distinctYears = await DistrictData.distinct('year', { districtCode });

    if (!distinctYears || distinctYears.length === 0) {
      logger.warn(`No financial years found for ${districtCode}`);
      return res.json({ success: true, data: [] });
    }

    // Sort them numerically
    distinctYears.sort((a, b) => b - a); // Descending (latest first)

    // Format them as "2020-2021"
    const formattedYears = distinctYears.map(year => `${year}-${year + 1}`);

    await setCachedData(cacheKey, formattedYears, 86400); // Cache for 1 day

    res.json({ success: true, data: formattedYears, source: 'database' });
  } catch (error) {
    logger.error(`Get financial years error: ${districtCode}`, { 
      message: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ success: false, error: error.message });
  }
});


// *** MODIFIED ENDPOINT ***
// This replaces the old '/history' endpoint with a more flexible one
// GET /api/districts/:districtCode/history/:yearKey
// Get district historical data. 
// yearKey can be:
// '12m'   (Last 12 months)
// 'all'   (All-time history)
// '2020-2021' (Specific financial year)
router.get('/:districtCode/history/:yearKey', async (req, res) => {
  const { districtCode, yearKey } = req.params;
  const cacheKey = `district:${districtCode}:history:${yearKey}`;
  
  try {
    logger.info(`Request for history: ${districtCode}, ${yearKey}`);
    
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json({ 
        success: true, 
        data: cachedData, 
        source: 'cache' 
      });
    }
    
    logger.debug(`Cache miss for ${cacheKey}, querying database...`);
    let query = { districtCode };
    let limit = 0; // 0 = no limit

    if (yearKey === '12m') {
      limit = 12;
    } else if (yearKey === 'all') {
      limit = 0; // No limit
    } else {
      // It's a financial year, e.g., "2020-2021"
      const startYear = parseInt(yearKey.split('-')[0]);
      const endYear = startYear + 1;
      
      // Fin year is April 1 (startYear) to March 31 (endYear)
      const startDate = new Date(startYear, 3, 1); // April 1st
      const endDate = new Date(endYear, 3, 0);   // March 31st (day 0 of April)

      query.recordDate = { $gte: startDate, $lte: endDate };
      logger.info(`Date range query for ${yearKey}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }
    
    let data = await DistrictData.find(query)
      .sort({ recordDate: -1 }) // Always sort latest-first
      .limit(limit)
      .lean();
    
    if (data.length === 0) {
      logger.warn(`No historical data found for ${districtCode} with filter ${yearKey}.`);
      return res.json({
        success: true,
        data: [],
        source: 'database',
        message: `No historical data found for ${districtCode} with filter ${yearKey}.`
      });
    }
    
    await setCachedData(cacheKey, data, 3600); // Cache for 1 hour
    
    res.json({ 
      success: true, 
      data, 
      source: 'database' 
    });
  } catch (error) {
    logger.error(`Get district history error: ${districtCode}, ${yearKey}`, { 
      message: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// GET /api/districts/compare/all
// (This endpoint remains unchanged, still shows latest for all districts)
router.get('/compare/all', async (req, res) => {
  const cacheKey = 'districts:compare:all';
  
  try {
    logger.info('Request for /api/districts/compare/all');
    
    let cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json({ 
        success: true, 
        data: cachedData, 
        source: 'cache' 
      });
    }
    
    logger.debug(`Cache miss for ${cacheKey}, querying database...`);
    const latestDataPerDistrict = await DistrictData.aggregate([
      { $sort: { recordDate: -1 } },
      {
        $group: {
          _id: '$districtCode',
          latestRecord: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestRecord' } }
    ]);
    
    const compareData = DISTRICTS_CONFIG.map(district => {
      const foundData = latestDataPerDistrict.find(
        d => d.districtCode === district.code
      );
      
      if (!foundData) {
        return {
          districtCode: district.code,
          districtName: district.name,
          data: null
        };
      } else {
         return {
          districtCode: district.code,
          districtName: district.name,
          data: foundData.data
        };
      }
    });
    
    await setCachedData(cacheKey, compareData, 7200); // Cache for 2 hours
    
    res.json({ 
      success: true, 
      data: compareData, 
      source: 'database' 
    });
  } catch (error) {
    logger.error('Compare districts error', { 
      message: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;