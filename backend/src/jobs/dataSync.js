import cron from 'node-cron';
import DistrictData from '../models/DistrictData.js';
import { fetchDistrictData, transformApiData } from '../services/dataGovService.js';

const DISTRICTS = [
  'raipur', 'bilaspur', 'durg', 'rajnandgaon', 
  'korba', 'raigarh', 'janjgir-champa', 'mahasamund'
];

export const syncDistrictData = async () => {
  console.log('Starting data sync...');
  
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  
  for (const district of DISTRICTS) {
    try {
      // Fetch from data.gov.in
      const rawData = await fetchDistrictData(district, month, year);
      
      if (rawData) {
        const transformedData = transformApiData(rawData);
        
        // Upsert to MongoDB
        await DistrictData.findOneAndUpdate(
          { districtCode: district, month, year },
          {
            districtCode: district,
            districtName: district.charAt(0).toUpperCase() + district.slice(1),
            month,
            year,
            data: transformedData,
            rawData,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        
        console.log(`Synced data for ${district}`);
      }
      
      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error syncing ${district}:`, error.message);
    }
  }
  
  console.log('Data sync completed');
};

export const startDataSync = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', syncDistrictData);
  
  // Run immediately on startup
  syncDistrictData();
};