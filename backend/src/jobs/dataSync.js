import cron from 'node-cron';
import DistrictData from '../models/DistrictData.js';
import { fetchAllStateDataForMonth, transformApiData } from '../services/dataGovService.js';
import { DISTRICTS_CONFIG } from '../routes/districts.js'; 

// --- HELPER ---
// Map of month abbreviations to JS month index (0-11)
// This map remains the same (3-letter keys).
const MONTH_MAP = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

/**
 * Creates a valid Date object from the API's month string and financial year string.
 * Example: "Feb" and "2024-2025" becomes new Date(2025, 1, 1)
 * Example: "Apr" and "2024-2025" becomes new Date(2024, 3, 1)
 */
const getRecordDate = (monthStr, finYearStr) => {
  // --- FIX ---
  // Normalize the incoming month string from the API
  // 1. Check if monthStr is valid
  if (!monthStr || monthStr.length < 3) {
    throw new Error(`Invalid month string: ${monthStr}`);
  }
  // 2. Take the first 3 letters ("June" -> "Jun", "April" -> "Apr")
  const normalizedMonth = monthStr.substring(0, 3);
  // 3. Format it to match our map keys (e.g., "Jun", "Apr")
  // (Capitalize first letter, lowercase the rest)
  const monthKey = normalizedMonth.charAt(0).toUpperCase() + normalizedMonth.slice(1).toLowerCase();
  
  // 4. Look up using the normalized key
  const monthIndex = MONTH_MAP[monthKey]; 
  // --- END FIX ---

  const startYear = parseInt(finYearStr.split('-')[0]);

  if (monthIndex == null) {
    // Updated error to show what we tried to normalize
    throw new Error(`Invalid month string: ${monthStr} (Normalized to: ${monthKey})`);
  }

  // Financial year logic: Apr 2024 - Mar 2025
  // If month is Jan, Feb, or Mar (0, 1, 2), it belongs to the *second* year (2025).
  // Otherwise, it belongs to the *first* year (2024).
  const calendarYear = (monthIndex < 3) ? (startYear + 1) : startYear;

  // Set to 1st day of the month for consistency
  return new Date(calendarYear, monthIndex, 1); 
};
// --- END HELPER ---


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
  
  const financialYearsToSync = generateFinYearList(2018, currentFinYearStart);

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
          // Match on 'en' name, case-insensitive
          d.name.en.toLowerCase() === rawData.district_name.toLowerCase()
        );
        
        if (!districtConfig) {
          // This is normal if the API has districts we don't care about
          continue; 
        }

        const transformedData = transformApiData(rawData);
        
        const recordMonth = rawData.month;
        const recordFinYear = rawData.fin_year;
        const recordYear = parseInt(recordFinYear.split('-')[0]); 
        
        if (!recordMonth || !recordFinYear) {
           console.warn(`(Skipping) Record missing month or fin_year: ${rawData.district_name}`);
           continue;
        }

        // Generate the new, sortable Date object using our fixed function
        const recordDate = getRecordDate(recordMonth, recordFinYear);

        // 3. Save to database with the CORRECT month and year
        await DistrictData.findOneAndUpdate(
          { 
            districtCode: districtConfig.code, 
            month: recordMonth, 
            year: recordYear // Use old fields as the unique key
          },
          {
            districtCode: districtConfig.code,
            districtName: districtConfig.name.en, // Use our config's name
            month: recordMonth,
            year: recordYear,
            recordDate: recordDate, // <-- ADD THE NEW DATE FIELD
            data: transformedData,
            rawData,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );

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