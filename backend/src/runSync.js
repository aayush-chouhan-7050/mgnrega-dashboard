import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { syncDistrictData } from './jobs/dataSync.js';

// This will now work correctly because dataGovService.js
// waits for the function call to read the .env variables.
dotenv.config();

const runStandaloneSync = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for sync...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Run the sync function imported from dataSync.js
    await syncDistrictData();
    
    // Disconnect
    await mongoose.connection.close();
    console.log('\n✅ Database sync completed and connection closed.');
    process.exit(0); // Success
  } catch (error) {
    console.error('❌ Sync script failed:', error);
    // Ensure connection is closed even on failure
    await mongoose.connection.close().catch(() => {});
    process.exit(1); // Failure
  }
};

// Run the function
runStandaloneSync();