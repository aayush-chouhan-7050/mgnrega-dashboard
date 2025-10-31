import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all districts
export const getDistricts = async () => {
  try {
    const response = await api.get('/districts');
    return response.data;
  } catch (error) {
    console.error('Get districts error:', error);
    throw error;
  }
};

// *** DEPRECATED/REPLACED ***
// We now use getHistoryByYear('12m')
export const getDistrictHistory = async (districtCode) => {
  try {
    // const response = await api.get(`/districts/${districtCode}/history`);
    // Reroute old call to new flexible endpoint
    const response = await api.get(`/districts/${districtCode}/history/12m`);
    return response.data;
  } catch (error) {
    console.error('Get district history error:', error);
    throw error;
  }
};

// *** NEW FUNCTION ***
// yearKey can be '12m', 'all', or '2020-2021'
export const getHistoryByYear = async (districtCode, yearKey) => {
  try {
    const response = await api.get(`/districts/${districtCode}/history/${yearKey}`);
    return response.data;
  } catch (error) {
    console.error(`Get district history for ${yearKey} error:`, error);
    throw error;
  }
};

// *** NEW FUNCTION ***
export const getAvailableFinancialYears = async (districtCode) => {
  try {
    const response = await api.get(`/districts/${districtCode}/financial-years`);
    return response.data;
  } catch (error) {
    console.error('Get financial years error:', error);
    throw error;
  }
};


// Get district current data
export const getDistrictCurrent = async (districtCode) => {
  try {
    const response = await api.get(`/districts/${districtCode}/current`);
    return response.data;
  } catch (error) {
    console.error('Get district current data error:', error);
    throw error;
  }
};

// Compare all districts
export const compareDistricts = async () => {
  try {
    const response = await api.get('/districts/compare/all');
    return response.data;
  } catch (error) {
    console.error('Compare districts error:', error);
    throw error;
  }
};

// Detect district from location
export const detectDistrictFromLocation = async (lat, lng) => {
  try {
    const response = await api.post('/location/detect', { lat, lng });
    return response.data;
  } catch (error) {
    console.error('Detect district error:', error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};


export default api;