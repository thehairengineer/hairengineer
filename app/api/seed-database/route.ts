import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import HairStyle from '@/app/models/HairStyle';
import ServiceCategory from '@/app/models/ServiceCategory';
import AvailableDate from '@/app/models/AvailableDate';
import Appointment from '@/app/models/Appointment';

// Connect to MongoDB
const connectToDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Define types based on models
interface IServiceCategory {
  name: string;
  description: string;
  isActive: boolean;
  order: number;
}

interface IHairStyle {
  category: mongoose.Types.ObjectId | string;
  name: string;
  value: number;
  isActive: boolean;
}

interface IAvailableDate {
  date: Date;
  maxAppointments: number;
  currentAppointments: number;
}

interface IAppointment {
  name: string;
  phone: string;
  snapchat?: string;
  whatsapp: string;
  service: string;
  hairColor: string;
  preferredLength: 'shoulder' | 'armpit' | 'bra' | 'waist' | 'butt';
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'unpaid' | 'partial' | 'full';
  paymentHistory: Array<{
    amount: number;
    date: Date;
    method: 'cash' | 'momo' | 'other';
    note?: string;
  }>;
}

// Default service categories
const defaultCategories: IServiceCategory[] = [
  {
    name: 'REGULAR SERVICES',
    description: 'Standard hair styling services',
    isActive: true,
    order: 1
  },
  {
    name: 'PREMIUM SERVICES',
    description: 'Premium hair styling services',
    isActive: true,
    order: 2
  },
  {
    name: 'SPECIAL OCCASIONS',
    description: 'Hair styling for special events',
    isActive: true,
    order: 3
  }
];

// Generate available dates (next 30 days)
const generateAvailableDates = (): IAvailableDate[] => {
  const dates: IAvailableDate[] = [];
  const today = new Date();
  
  // Create available dates for the next 30 days
  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // Skip Sundays (0 is Sunday in JavaScript)
    if (date.getDay() !== 0) {
      dates.push({
        date: new Date(date.setHours(0, 0, 0, 0)),
        maxAppointments: 5,
        currentAppointments: 0
      });
    }
  }
  
  return dates;
};

// Generate dummy appointments based on available dates and hair styles
const generateAppointments = (
  availableDates: IAvailableDate[],
  hairStyles: IHairStyle[]
): IAppointment[] => {
  const appointments: IAppointment[] = [];
  
  // Names for dummy data
  const names = ['Emma Johnson', 'Olivia Smith', 'Ava Williams', 'Sophia Brown', 'Isabella Jones'];
  
  // Only create appointments for 10 random days
  const randomDates = availableDates
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);
  
  randomDates.forEach(dateObj => {
    // Create 1-3 appointments per date
    const appointmentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < appointmentCount; i++) {
      const randomHairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const totalAmount = randomHairStyle.value;
      const amountPaid = Math.random() > 0.5 ? totalAmount : totalAmount / 2;
      
      const appointment: IAppointment = {
        name: randomName,
        phone: `+233${Math.floor(Math.random() * 900000000) + 100000000}`,
        whatsapp: `+233${Math.floor(Math.random() * 900000000) + 100000000}`,
        service: randomHairStyle.name,
        hairColor: ['black', 'brown', 'blonde'][Math.floor(Math.random() * 3)],
        preferredLength: ['shoulder', 'armpit', 'bra', 'waist', 'butt'][Math.floor(Math.random() * 5)] as 'shoulder' | 'armpit' | 'bra' | 'waist' | 'butt',
        date: new Date(dateObj.date),
        status: ['pending', 'confirmed'][Math.floor(Math.random() * 2)] as 'pending' | 'confirmed',
        totalAmount,
        amountPaid,
        paymentStatus: amountPaid === 0 ? 'unpaid' : amountPaid < totalAmount ? 'partial' : 'full',
        paymentHistory: amountPaid > 0 ? [{
          amount: amountPaid,
          date: new Date(),
          method: ['cash', 'momo'][Math.floor(Math.random() * 2)] as 'cash' | 'momo',
          note: 'Initial payment'
        }] : []
      };
      
      // Add snapchat for some appointments
      if (Math.random() > 0.5) {
        appointment.snapchat = `${randomName.toLowerCase().replace(' ', '')}`;
      }
      
      appointments.push(appointment);
    }
  });
  
  return appointments;
};

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Clear existing data
    await ServiceCategory.deleteMany({});
    await HairStyle.deleteMany({});
    await AvailableDate.deleteMany({});
    await Appointment.deleteMany({});
    
    // Insert service categories
    const categories = await ServiceCategory.insertMany(defaultCategories);
    
    // Create hair styles based on categories
    const hairStyles: IHairStyle[] = [];
    
    // Regular services
    const regularCategoryId = categories[0]._id;
    hairStyles.push(
      { category: regularCategoryId, name: 'Braids - Small', value: 200, isActive: true },
      { category: regularCategoryId, name: 'Braids - Medium', value: 150, isActive: true },
      { category: regularCategoryId, name: 'Braids - Large', value: 100, isActive: true },
      { category: regularCategoryId, name: 'Hair Cut', value: 50, isActive: true }
    );
    
    // Premium services
    const premiumCategoryId = categories[1]._id;
    hairStyles.push(
      { category: premiumCategoryId, name: 'Styling - Deluxe', value: 300, isActive: true },
      { category: premiumCategoryId, name: 'Color Treatment', value: 250, isActive: true },
      { category: premiumCategoryId, name: 'Hair Extensions', value: 400, isActive: true }
    );
    
    // Special occasion services
    const specialCategoryId = categories[2]._id;
    hairStyles.push(
      { category: specialCategoryId, name: 'Wedding Package', value: 500, isActive: true },
      { category: specialCategoryId, name: 'Event Styling', value: 350, isActive: true }
    );
    
    // Insert hair styles
    const createdHairStyles = await HairStyle.insertMany(hairStyles);
    
    // Insert available dates
    const availableDates = generateAvailableDates();
    const createdAvailableDates = await AvailableDate.insertMany(availableDates);
    
    // Insert appointments
    const appointments = generateAppointments(availableDates, createdHairStyles);
    const createdAppointments = await Appointment.insertMany(appointments);
    
    // Update currentAppointments count for each available date
    for (const appointment of createdAppointments) {
      const appointmentDate = new Date(appointment.date).setHours(0, 0, 0, 0);
      
      await AvailableDate.updateOne(
        { date: new Date(appointmentDate) },
        { $inc: { currentAppointments: 1 } }
      );
    }
    
    // Revalidate paths
    revalidatePath('/admin');
    revalidatePath('/');
    
    return NextResponse.json({
      success: true,
      count: {
        categories: categories.length,
        hairStyles: createdHairStyles.length,
        availableDates: createdAvailableDates.length,
        appointments: createdAppointments.length
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Allow seeding via POST request as well
export async function POST() {
  return GET();
} 