// Script to seed the database directly
require('dotenv').config({ path: './.env.local' });
const { execSync } = require('child_process');

console.log('Running database seed script...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Use Next.js framework to run the API route
try {
  console.log('Executing seed operation...');
  
  // First, make sure we can connect to MongoDB
  execSync('npx tsx -e "import mongoose from \'mongoose\'; mongoose.connect(process.env.MONGODB_URI).then(() => console.log(\'Connected to MongoDB\')).catch(err => console.error(\'MongoDB connection error:\', err))"', 
    { stdio: 'inherit' });
  
  // Then run the actual seed function
  execSync('npx tsx -e "import { GET } from \'./app/api/seed-database/route\'; GET().then(res => console.log(\'Seed completed:\', res)).catch(err => console.error(\'Seed error:\', err))"', 
    { stdio: 'inherit' });
    
  console.log('Database seed completed successfully!');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} 