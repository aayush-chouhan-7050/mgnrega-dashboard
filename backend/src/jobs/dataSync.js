import cron from 'node-cron';
import DistrictData from '../models/DistrictData.js';
import { fetchAllStateDataForMonth, transformApiData } from '../services/dataGovService.js';
import { DISTRICTS_CONFIG } from '../routes/districts.js'; 

/**
 * Gets the current financial year (e.g., 2025 for 2025-2026)
 */
const getCurrentFinancialYearStart = (now) => {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11 (Jan=0, Apr=3)
  if (currentMonth >= 3) { // April (3) or later
    return currentYear;
  } else { // Jan, Feb, March
    return currentYear - 1;
  }
};

/**
 * Generates a list of financial year strings, e.g., ["2018-2019", "2019-2020", ...]
 */
const generateFinYearList = (startYear, endYear) => {
  const years = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(`${y}-${y + 1}`);
  }
  return years;
};

export const syncDistrictData = async () => {
  console.log('Starting FULL historical data sync. This may take several minutes...');
  
  const now = new Date();
  const currentFinYearStart = getCurrentFinancialYearStart(now);
  
  // =================== THIS IS THE FIX ===================
  // Create a list of all years to sync, based on your CSVs
  const financialYearsToSync = generateFinYearList(2018, currentFinYearStart);
  // =======================================================

  console.log(`Will sync all data for financial years: ${financialYearsToSync.join(', ')}`);

  for (const finYear of financialYearsToSync) {
    console.log(`--- Fetching all data for financial year: ${finYear} ---`);
    
    // 1. Fetch ALL records for the entire financial year
    const allDistrictData = await fetchAllStateDataForMonth(null, finYear); // Pass null for month

    if (!allDistrictData || allDistrictData.length === 0) {
      console.warn(`No data returned from API for ${finYear}.`);
      continue; // Skip to next year
    }

    console.log(`Fetched ${allDistrictData.length} records for ${finYear}. Now saving to database...`);

    // 2. Loop through every record and save it
    for (const rawData of allDistrictData) {
      try {
        // Find the matching district 'code' from our config
        const districtConfig = DISTRICTS_CONFIG.find(d => 
          d.name.en.toLowerCase() === rawData.district_name.toLowerCase()
        );
        
        if (!districtConfig) {
          // This is normal if the API has districts we don't care about
          continue;
        }

        const transformedData = transformApiData(rawData);
        
        // =================== THIS IS THE 2ND FIX ===================
        // Use the month and year *from the API record* (rawData),
        // not the script's current month/year.
        
        // The API provides the month (e.g., "Feb")
        const recordMonth = rawData.month;
        // The API provides the fin_year (e.g., "2024-2025")
        // We'll use the *first* year as the "year" for simplicity
        const recordYear = parseInt(rawData.fin_year.split('-')[0]); 
        
        if (!recordMonth || !recordYear) {
           console.warn(`(Skipping) Record missing month or year: ${rawData.district_name}`);
           continue;
        }

        // 3. Save to database with the CORRECT month and year
        await DistrictData.findOneAndUpdate(
          { 
            districtCode: districtConfig.code, 
            month: recordMonth, 
            year: recordYear 
          },
          {
            districtCode: districtConfig.code,
            districtName: districtConfig.name.en,
            month: recordMonth,
            year: recordYear,
            data: transformedData,
            rawData,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        // =======================================================

      } catch (e) {
        console.error(`Error processing record for ${rawData.district_name}: ${e.message}`);
      }
    }
    console.log(`--- Finished sync for ${finYear} ---`);
  }
  
  console.log('Full historical data sync completed');
};

export const startDataSync = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', syncDistrictData);
  // Run immediately on startup
  syncDistrictData();
};