import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import HairStyle from '@/app/models/HairStyle';
import ServiceCategory from '@/app/models/ServiceCategory';
import AvailableDate from '@/app/models/AvailableDate';
import Appointment from '@/app/models/Appointment';
import { revalidatePath } from 'next/cache';

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

export async function POST() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Clear all collections
    await Promise.all([
      HairStyle.deleteMany({}),
      ServiceCategory.deleteMany({}),
      AvailableDate.deleteMany({}),
      Appointment.deleteMany({})
    ]);
    
    // Revalidate paths
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    
    return NextResponse.json({
      success: true,
      message: 'Database has been cleared. Use the seed endpoint to add new data.'
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 