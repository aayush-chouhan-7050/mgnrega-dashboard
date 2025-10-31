import axios from 'axios';

const API_KEY = process.env.DATA_GOV_API_KEY || '';
const BASE_URL = process.env.DATA_GOV_API_BASE;

export const fetchDistrictData = async (districtCode, month, year) => {
  try {
    // Construct API URL for MGNREGA data
    const url = `${BASE_URL}your-resource-id/records`;
    
    const response = await axios.get(url, {
      params: {
        'api-key': API_KEY,
        format: 'json',
        filters: {
          district: districtCode,
          month: month,
          year: year
        }
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Data.gov.in API error:', error.message);
    return null;
  }
};

export const transformApiData = (rawData) => {
  // Transform API response to our format
  return {
    householdsEmployed: rawData.households_provided_employment || 0,
    personDaysGenerated: rawData.persondays_generated || 0,
    worksCompleted: rawData.works_completed || 0,
    expenditure: rawData.total_exp_rs_in_lakhs ? rawData.total_exp_rs_in_lakhs / 100 : 0,
    activeWorkers: rawData.active_workers || 0,
    womenEmployment: rawData.women_persondays || 0
  };
};