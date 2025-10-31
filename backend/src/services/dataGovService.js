import axios from 'axios';

const RESOURCE_ID = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722'; 

export const fetchAllStateDataForMonth = async (month, financialYear) => {
  const API_KEY = process.env.DATA_GOV_API_KEY || '';
  const BASE_URL = process.env.DATA_GOV_API_BASE;

  if (!API_KEY || !BASE_URL || RESOURCE_ID === 'your-resource-id') {
    console.error('Data.gov.in service is not configured. Check .env file and RESOURCE_ID.');
    return null;
  }
  
  const ACTIVE_API_KEY = API_KEY;
  const url = `${BASE_URL}${RESOURCE_ID}`;

  let allRecords = [];
  let offset = 0;
  const limit = 10000; // Get 100 records per API call
  let totalRecords = 0;

  console.log(`Fetching all state data for Financial Year ${financialYear}...`);

  try {
    do {
      const response = await axios.get(url, {
        params: {
          'api-key': ACTIVE_API_KEY,
          format: 'json',
          offset: offset,
          limit: limit,
          'filters[state_name]': 'CHHATTISGARH',
          'filters[fin_year]': financialYear
          // =================== FIX ===================
          // Removed 'filters[month]': month
          // The API returns all months for the fin_year, which is what we want.
          // ===============================================
        },
        timeout: 60000
      });
      
      if (response.data && response.data.records && response.data.records.length > 0) {
        allRecords.push(...response.data.records);
        if (totalRecords === 0) {
          totalRecords = response.data.total; 
        }
        offset += response.data.records.length;
      } else {
        break; // No more data
      }
      
    } while (offset < totalRecords && totalRecords > 0);

    console.log(`Successfully fetched ${allRecords.length} records.`);
    return allRecords;

  } catch (error) {
    console.error(`Data.gov.in API error:`, error.message);
    return null;
  }
};

// ... (transformApiData function is unchanged) ...
export const transformApiData = (rawData) => {
  return {
    householdsEmployed: Number(rawData.Total_Households_Worked) || 0,
    personDaysGenerated: Number(rawData.Persondays_of_Central_Liability_so_far) || 0,
    worksCompleted: Number(rawData.Number_of_Completed_Works) || 0,
    expenditure: rawData.Total_Exp ? Number(rawData.Total_Exp) / 100 : 0,
    activeWorkers: Number(rawData.Total_No_of_Active_Workers) || 0,
    womenEmployment: Number(rawData.Women_Persondays) || 0
  };
};