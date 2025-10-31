import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DistrictData from '../models/DistrictData.js';

dotenv.config();

const DISTRICTS = [
  // ... (DISTRICTS array remains the same)
];

const MONTHS = [
  // ... (MONTHS array remains the same)
];

// --- NEW HELPER ---
// Map of month abbreviations to JS month index (0-11)
const MONTH_MAP = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};
// --- END HELPER ---

function generateDistrictData(districtCode, districtName, month, year, index) {
  // ... (Base value, multipliers, etc. remain the same)
  
  const baseValue = (Math.random() * 5000 + 8000) * multiplier * seasonalMultiplier * trendMultiplier;
  
  // --- IMPROVEMENT ---
  // Create the new recordDate for sorting
  const recordDate = new Date(year, MONTH_MAP[month], 1);
  // --- END IMPROVEMENT ---
  
  return {
    districtCode,
    districtName,
    state: 'Chhattisgarh',
    month,
    year,
    recordDate: recordDate, // <-- ADD THE NEW FIELD
    data: {
      householdsEmployed: Math.floor(baseValue * 0.75),
      personDaysGenerated: Math.floor(baseValue * 11),
      worksCompleted: Math.floor(baseValue * 0.04),
      expenditure: parseFloat((baseValue * 0.12).toFixed(2)),
      activeWorkers: Math.floor(baseValue * 0.55),
      womenEmployment: Math.floor(baseValue * 6.5)
    },
    rawData: {},
    lastUpdated: new Date()
  };
}

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await DistrictData.deleteMany({});
    console.log('✅ Existing data cleared');

    // Generate and insert data
    console.log('📊 Generating sample data...');
    const dataToInsert = [];

    for (const district of DISTRICTS) {
      for (let i = 0; i < MONTHS.length; i++) {
        const monthData = MONTHS[i];
        const data = generateDistrictData(
          district.code,
          district.name,
          monthData.name,
          monthData.year,
          i
        );
        dataToInsert.push(data);
      }
    }

    console.log(`📥 Inserting ${dataToInsert.length} records...`);
    await DistrictData.insertMany(dataToInsert);
    console.log('✅ Sample data inserted successfully');

    // ... (Summary logging and closing connection remain the same)

    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();