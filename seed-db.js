// Direct MongoDB seeding script
require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define schemas for our models
const ServiceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const HairStyleSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AvailableDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  maxAppointments: { type: Number, default: 5 },
  currentAppointments: { type: Number, default: 0 }
}, { timestamps: true });

const PaymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'momo', 'other'], default: 'cash' },
  note: { type: String, default: '' }
});

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  snapchat: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  service: { type: String, required: true },
  hairColor: { type: String, default: '' },
  preferredLength: { type: String, default: '' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  paymentHistory: [PaymentHistorySchema]
}, { timestamps: true });

// Register models
const ServiceCategory = mongoose.model('ServiceCategory', ServiceCategorySchema);
const HairStyle = mongoose.model('HairStyle', HairStyleSchema);
const AvailableDate = mongoose.model('AvailableDate', AvailableDateSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Default data
const defaultCategories = [
  { name: 'LOCS', description: 'Various styles of locs', order: 1 },
  { name: 'TWIST', description: 'Various twisting techniques', order: 2 },
  { name: 'SEW IN', description: 'Sew-in extensions and weaves', order: 3 },
  { name: 'BRAIDS', description: 'Various braiding styles', order: 4 },
  { name: 'CORNROWS', description: 'Cornrow braiding styles', order: 5 },
  { name: 'NATURAL', description: 'Natural hairstyles', order: 6 },
  { name: 'COLORING', description: 'Hair coloring services', order: 7 },
];

// Default hair styles - included directly
const defaultHairStyles = [
  // LOCS
  { category: 'LOCS', name: 'Soft Locs', value: 'locs-soft-locs' },
  { category: 'LOCS', name: 'Faux Locs - Small', value: 'locs-faux-locs-small' },
  { category: 'LOCS', name: 'Faux Locs - Medium', value: 'locs-faux-locs-medium' },
  { category: 'LOCS', name: 'Faux Locs - Large', value: 'locs-faux-locs-large' },
  { category: 'LOCS', name: 'Faux Locs - Jumbo', value: 'locs-faux-locs-jumbo' },
  { category: 'LOCS', name: 'Invisible Locs - Medium', value: 'locs-invisible-locs-medium' },
  { category: 'LOCS', name: 'Invisible Locs - Large', value: 'locs-invisible-locs-large' },
  { category: 'LOCS', name: 'Butterfly Locs - Medium', value: 'locs-butterfly-locs-medium' },
  { category: 'LOCS', name: 'Butterfly Locs - Large', value: 'locs-butterfly-locs-large' },
  { category: 'LOCS', name: 'Goddess Locs - Medium', value: 'locs-goddess-locs-medium' },
  { category: 'LOCS', name: 'Goddess Locs - Large', value: 'locs-goddess-locs-large' },
  { category: 'LOCS', name: 'Boho Locs - Medium', value: 'locs-boho-locs-medium' },
  { category: 'LOCS', name: 'Boho Locs - Large', value: 'locs-boho-locs-large' },
  { category: 'LOCS', name: 'Ocean Locs - Medium', value: 'locs-ocean-locs-medium' },
  { category: 'LOCS', name: 'Ocean Locs - Large', value: 'locs-ocean-locs-large' },
  
  // TWIST
  { category: 'TWIST', name: 'Island Twist - Small', value: 'twist-island-twist-small' },
  { category: 'TWIST', name: 'Island Twist - Medium', value: 'twist-island-twist-medium' },
  { category: 'TWIST', name: 'Island Twist - Large', value: 'twist-island-twist-large' },
  { category: 'TWIST', name: 'Island Twist - Jumbo', value: 'twist-island-twist-jumbo' },
  { category: 'TWIST', name: 'Passion Twist - Small', value: 'twist-passion-twist-small' },
  { category: 'TWIST', name: 'Passion Twist - Medium', value: 'twist-passion-twist-medium' },
  { category: 'TWIST', name: 'Passion Twist - Large', value: 'twist-passion-twist-large' },
  { category: 'TWIST', name: 'Passion Twist - Jumbo', value: 'twist-passion-twist-jumbo' },
  { category: 'TWIST', name: 'Senegalese Twist - Medium', value: 'twist-senegalese-twist-medium' },
  { category: 'TWIST', name: 'Marley Twist - Medium', value: 'twist-marley-twist-medium' },
  
  // SEW IN
  { category: 'SEW IN', name: 'Closure Sew-in', value: 'sew-in-closure-sew-in' },
  { category: 'SEW IN', name: 'Versatile Sew-in - with Middle & Side Part & Bun', value: 'sew-in-versatile-sew-in-full' },
  { category: 'SEW IN', name: 'Versatile Sew-in - with Middle Part & Bun', value: 'sew-in-versatile-sew-in-middle' },
  { category: 'SEW IN', name: 'Versatile Sew-in - Side Part & Bun', value: 'sew-in-versatile-sew-in-side' },
  { category: 'SEW IN', name: 'Vixen Sew-in', value: 'sew-in-vixen-sew-in' },
  { category: 'SEW IN', name: 'Frontal Sew-in', value: 'sew-in-frontal-sew-in' },
  
  // BRAIDS
  { category: 'BRAIDS', name: 'Knotless Braids - Small', value: 'braids-knotless-braids-small' },
  { category: 'BRAIDS', name: 'Knotless Braids - Medium', value: 'braids-knotless-braids-medium' },
  { category: 'BRAIDS', name: 'Knotless Braids - Large', value: 'braids-knotless-braids-large' },
  { category: 'BRAIDS', name: 'Knotless Braids - Jumbo', value: 'braids-knotless-braids-jumbo' },
  { category: 'BRAIDS', name: 'Boho Braids - Small', value: 'braids-boho-braids-small' },
  { category: 'BRAIDS', name: 'Boho Braids - Medium', value: 'braids-boho-braids-medium' },
  { category: 'BRAIDS', name: 'Boho Braids - Large', value: 'braids-boho-braids-large' },
  { category: 'BRAIDS', name: 'Boho Braids - Jumbo', value: 'braids-boho-braids-jumbo' },
  { category: 'BRAIDS', name: 'Goddess Braids - Small', value: 'braids-goddess-braids-small' },
  { category: 'BRAIDS', name: 'Goddess Braids - Medium', value: 'braids-goddess-braids-medium' },
  { category: 'BRAIDS', name: 'Goddess Braids - Large', value: 'braids-goddess-braids-large' },
  { category: 'BRAIDS', name: 'Goddess Braids - Jumbo', value: 'braids-goddess-braids-jumbo' },
  { category: 'BRAIDS', name: 'Feed-in Braids', value: 'braids-feed-in-braids' },
  
  // CORNROWS
  { category: 'CORNROWS', name: 'Stitch Cornrows (All Back)', value: 'cornrows-stitch-cornrows-all-back' },
  { category: 'CORNROWS', name: 'Stitch Cornrows with Braid', value: 'cornrows-stitch-cornrows-with-braid' },
  { category: 'CORNROWS', name: 'Lemonade Braids', value: 'cornrows-lemonade-braids' },
  { category: 'CORNROWS', name: 'Ghana Braids', value: 'cornrows-ghana-braids' },
  
  // NATURAL
  { category: 'NATURAL', name: 'Silk Press', value: 'natural-silk-press' },
  { category: 'NATURAL', name: 'Wash and Set', value: 'natural-wash-set' },
  { category: 'NATURAL', name: 'Twist Out', value: 'natural-twist-out' },
  { category: 'NATURAL', name: 'Bantu Knots', value: 'natural-bantu-knots' },
  
  // COLORING
  { category: 'COLORING', name: 'Full Hair Color', value: 'coloring-full-hair' },
  { category: 'COLORING', name: 'Highlights', value: 'coloring-highlights' },
  { category: 'COLORING', name: 'Balayage', value: 'coloring-balayage' },
  { category: 'COLORING', name: 'Ombre', value: 'coloring-ombre' }
];

// Generate available dates (next 30 days)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate dates for the next 30 days
  for (let i = 1; i <= 30; i++) {
    // Skip some random days to make it more realistic
    if (Math.random() > 0.7) continue;
    
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Random max appointments between 2-5
    const maxAppointments = Math.floor(Math.random() * 4) + 2;
    
    dates.push({
      date: date,
      maxAppointments,
      currentAppointments: 0
    });
  }
  
  return dates;
};

// Generate dummy appointments
const generateAppointments = (availableDates, hairStyles) => {
  const appointments = [];
  const names = [
    'Sophia Johnson', 'Emma Davis', 'Olivia Smith', 'Ava Wilson', 'Isabella Jones',
    'Mia Thomas', 'Charlotte Taylor', 'Amelia Anderson', 'Harper Brown', 'Evelyn Miller'
  ];
  
  const phoneNumbers = [
    '+233501234567', '+233507654321', '+233551234567', '+233559876543', '+233241234567'
  ];
  
  const hairColors = ['black', 'dark brown', 'brown', 'light brown', 'blonde', 'red'];
  const preferredLengths = ['shoulder', 'armpit', 'bra', 'waist', 'butt'];
  const statuses = ['pending', 'confirmed', 'cancelled'];
  const paymentMethods = ['cash', 'momo', 'other'];
  
  // Create 1-3 appointments for each available date (limited to avoid overloading)
  availableDates.slice(0, 10).forEach(dateObj => {
    const numAppointments = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numAppointments && i < dateObj.maxAppointments; i++) {
      // Randomly select a hair style
      const randomStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
      
      // Random status
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random price between 150-600 GH₵
      const totalAmount = Math.floor(Math.random() * 450) + 150;
      
      // Random payment (0%, 50%, or 100% of total)
      const paymentPercentage = [0, 0.5, 1][Math.floor(Math.random() * 3)];
      const amountPaid = Math.floor(totalAmount * paymentPercentage);
      
      // Create payment history if payment was made
      const paymentHistory = [];
      if (amountPaid > 0) {
        paymentHistory.push({
          amount: amountPaid,
          date: new Date(),
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          note: 'Initial payment'
        });
      }
      
      const nameIndex = Math.floor(Math.random() * names.length);
      const phoneIndex = Math.floor(Math.random() * phoneNumbers.length);
      
      appointments.push({
        name: names[nameIndex],
        phone: phoneNumbers[phoneIndex],
        snapchat: `@${names[nameIndex].split(' ')[0].toLowerCase()}`,
        whatsapp: phoneNumbers[phoneIndex],
        service: randomStyle.value,
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        preferredLength: preferredLengths[Math.floor(Math.random() * preferredLengths.length)],
        date: dateObj.date,
        status,
        totalAmount,
        amountPaid,
        paymentHistory
      });
      
      // Increment current appointments count
      dateObj.currentAppointments++;
    }
  });
  
  return appointments;
};

// Main function to seed database
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await ServiceCategory.deleteMany({});
    await HairStyle.deleteMany({});
    await AvailableDate.deleteMany({});
    await Appointment.deleteMany({});
    
    // Insert categories
    console.log('Inserting service categories...');
    const categories = await ServiceCategory.insertMany(defaultCategories);
    console.log(`Created ${categories.length} service categories`);
    
    // Insert hair styles
    console.log('Inserting hair styles...');
    const hairStyles = await HairStyle.insertMany(defaultHairStyles);
    console.log(`Created ${hairStyles.length} hair styles`);
    
    // Insert available dates
    console.log('Generating and inserting available dates...');
    const availableDates = generateAvailableDates();
    const insertedDates = await AvailableDate.insertMany(availableDates);
    console.log(`Created ${insertedDates.length} available dates`);
    
    // Insert appointments
    console.log('Generating and inserting appointments...');
    const appointments = generateAppointments(availableDates, defaultHairStyles);
    const insertedAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${insertedAppointments.length} appointments`);
    
    console.log('Database seeded successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedDatabase(); 