import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import AppointmentModel from '@/app/models/Appointment';

/**
 * This is a test-only endpoint that provides information about appointments with specific reference
 * It should not be exposed in production!
 */
export async function POST(request: Request) {
  try {
    const { reference } = await request.json();
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }
    
    console.log('Testing verification for reference:', reference);
    
    // Connect to database
    await connectDB();
    
    // Check for appointment with this reference
    const appointment = await AppointmentModel.findOne({ paystackReference: reference });
    
    if (!appointment) {
      // If no appointment found, count total appointments
      const count = await AppointmentModel.countDocuments();
      
      // Get a sample of appointments if any exist
      const sampleAppointments = await AppointmentModel.find({}, 'paystackReference').limit(5);
      
      return NextResponse.json({
        exists: false,
        message: 'No appointment found with this reference',
        totalAppointments: count,
        sampleReferences: sampleAppointments.map(a => a.paystackReference)
      });
    }
    
    // Return appointment details if found
    return NextResponse.json({
      exists: true,
      appointment: {
        id: appointment._id,
        name: appointment.name,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        reference: appointment.paystackReference,
        date: appointment.date,
        service: appointment.service,
        createdAt: appointment.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error testing verification:', error);
    return NextResponse.json(
      { error: 'Test failed', details: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
} 