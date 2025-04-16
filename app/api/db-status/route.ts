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

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get counts from each collection
    const categoriesCount = await ServiceCategory.countDocuments({});
    const hairStylesCount = await HairStyle.countDocuments({});
    const availableDatesCount = await AvailableDate.countDocuments({});
    const appointmentsCount = await Appointment.countDocuments({});
    
    // Get connection status
    const connectionStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return NextResponse.json({
      success: true,
      connection: {
        status: connectionStatus,
        statusText: statusMap[connectionStatus as keyof typeof statusMap] || 'unknown'
      },
      count: {
        categories: categoriesCount,
        hairStyles: hairStylesCount,
        availableDates: availableDatesCount,
        appointments: appointmentsCount
      }
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 