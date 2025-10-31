import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DistrictData from '../models/DistrictData.js';

dotenv.config();

const DISTRICTS = [
  { code: 'raipur', name: 'Raipur' },
  { code: 'bilaspur', name: 'Bilaspur' },
  { code: 'durg', name: 'Durg' },
  { code: 'rajnandgaon', name: 'RAJNANDAGON' },
  { code: 'korba', name: 'Korba' },
  { code: 'raigarh', name: 'Raigarh' },
  { code: 'janjgir-champa', name: 'Janjgir-Champa' },
  { code: 'mahasamund', name: 'Mahasamund' },
  { code: 'bastar', name: 'Bastar' },
  { code: 'jashpur', name: 'Jashpur' },
  { code: 'balod', name: 'Balod' },
  { code: 'baloda-bazar', name: 'BALODA BAZAR' },
  { code: 'balrampur', name: 'Balrampur' },
  { code: 'bemetara', name: 'Bemetara' },
  { code: 'bijapur', name: 'Bijapur' },
  { code: 'dantewada', name: 'DANTEWADA' },
  { code: 'dhamtari', name: 'Dhamtari' },
  { code: 'gariaband', name: 'GARIYABAND' },
  { code: 'gaurela-pendra-marwahi', name: 'GAURELA PENDRA MARWAHI' },
  { code: 'kanker', name: 'KANKER' },
  { code: 'kabirdham', name: 'KAWARDHA' },
  { code: 'khairagarh-chhuikhadan-gandai', name: 'KHAIRAGARH CHHUIKHADAN GANDAI' },
  { code: 'kondagaon', name: 'Kondagaon' },
  { code: 'koriya', name: 'KOREA' },
  { code: 'manendragarh-chirmiri-bharatpur', name: 'MANENDRAGARH CHIRMIRI BHARATPUR' },
  { code: 'mohla-manpur-ambagarh-chowki', name: 'MOHLA MANPUR AMBAGARH CHOWKI' },
  { code: 'mungeli', name: 'Mungeli' },
  { code: 'narayanpur', name: 'Narayanpur' },
  { code: 'sukma', name: 'Sukma' },
  { code: 'surajpur', name: 'Surajpur' },
  { code: 'surguja', name: 'Surguja' },
  { code: 'sakti', name: 'Sakti' },
  { code: 'sarangarh-bilaigarh', name: 'SARANGARH BILAIGARH' }
];

const MONTHS = [
  { name: 'Oct', year: 2024 },
  { name: 'Sep', year: 2024 },
  { name: 'Aug', year: 2024 },
  { name: 'Jul', year: 2024 },
  { name: 'Jun', year: 2024 },
  { name: 'May', year: 2024 },
  { name: 'Apr', year: 2024 },
  { name: 'Mar', year: 2024 },
  { name: 'Feb', year: 2024 },
  { name: 'Jan', year: 2024 }
];

function generateDistrictData(districtCode, districtName, month, year, index) {
  // Base value varies by district (larger cities have higher numbers)
  const districtMultipliers = {
    'raipur': 1.5,
    'bilaspur': 1.3,
    'durg': 1.2,
    'rajnandgaon': 1.0,
    'korba': 0.9,
    'raigarh': 0.9,
    'janjgir-champa': 0.8,
    'mahasamund': 0.8,
    'bastar': 1.1,
    'jashpur': 0.7
  };

  const multiplier = districtMultipliers[districtCode] || 1.0;
  
  // Add seasonal variation (monsoon months have more work)
  const seasonalMultiplier = ['Jun', 'Jul', 'Aug', 'Sep'].includes(month) ? 1.2 : 1.0;
  
  // Add trend (recent months have slightly higher values)
  const trendMultiplier = 1 + (index * 0.02);
  
  const baseValue = (Math.random() * 5000 + 8000) * multiplier * seasonalMultiplier * trendMultiplier;
  
  return {
    districtCode,
    districtName,
    state: 'Chhattisgarh',
    month,
    year,
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

    // Display summary
    console.log('\n📈 Database Summary:');
    console.log(`   Districts: ${DISTRICTS.length}`);
    console.log(`   Months per district: ${MONTHS.length}`);
    console.log(`   Total records: ${dataToInsert.length}`);

    // Sample data check
    const sampleData = await DistrictData.findOne({ districtCode: 'raipur' });
    console.log('\n📋 Sample Record (Raipur):');
    console.log(JSON.stringify(sampleData, null, 2));

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