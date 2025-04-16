import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import SystemSettings from '@/app/models/SystemSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { Model } from 'mongoose';

// Define interface with static methods for the model
interface SystemSettingsModel extends Model<any> {
  getCurrentSettings(): Promise<any>;
}

// GET handler to retrieve current system settings
export async function GET() {
  try {
    await connectDB();
    
    // Cast the model to include the static method
    const settings = await (SystemSettings as SystemSettingsModel).getCurrentSettings();
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
}

// POST handler to update system settings
export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    await connectDB();
    
    // Get current settings
    let settings = await (SystemSettings as SystemSettingsModel).getCurrentSettings();
    
    // Update settings with new values
    if (data.paymentRequired !== undefined) {
      settings.paymentRequired = data.paymentRequired;
    }
    
    if (data.paymentTimeoutMinutes !== undefined && data.paymentTimeoutMinutes > 0) {
      settings.paymentTimeoutMinutes = data.paymentTimeoutMinutes;
    }
    
    if (data.defaultAppointmentStatus !== undefined) {
      settings.defaultAppointmentStatus = data.defaultAppointmentStatus;
    }
    
    if (data.defaultPrice !== undefined && data.defaultPrice >= 0) {
      settings.defaultPrice = data.defaultPrice;
    }
    
    // Save updated settings
    await settings.save();
    
    return NextResponse.json({
      message: 'System settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
} 