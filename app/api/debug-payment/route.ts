import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import AppointmentModel from '@/app/models/Appointment';

/**
 * Debug endpoint to help diagnose payment verification issues
 * This should be password protected or disabled in production
 */
export async function POST(request: Request) {
  try {
    const { reference, action, apiKey } = await request.json();
    
    // Simple API key check - in production use a proper authentication system
    const debugApiKey = process.env.DEBUG_API_KEY || 'debug_hair_engineer_2023';
    
    if (apiKey !== debugApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();
    
    // Log all parameters for debugging
    console.log(`Debug payment action: ${action} for reference: ${reference}`);

    if (action === 'check') {
      // Check if appointment exists with this reference
      const appointment = await AppointmentModel.findOne({ paystackReference: reference });
      
      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'No appointment found with this reference' },
          { status: 200 }
        );
      }
      
      return NextResponse.json({
        success: true,
        appointmentId: appointment._id,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        data: {
          reference,
          name: appointment.name,
          created: appointment.createdAt,
          paymentHistory: appointment.paymentHistory || []
        }
      });
    } 
    else if (action === 'list-recent') {
      // List recent appointments (last 10)
      const appointments = await AppointmentModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name status paymentStatus paystackReference createdAt');
      
      return NextResponse.json({
        success: true,
        count: appointments.length,
        appointments
      });
    }
    else if (action === 'force-confirm') {
      // Force confirm an appointment (admin action)
      const appointment = await AppointmentModel.findOne({ paystackReference: reference });
      
      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'No appointment found with this reference' },
          { status: 200 }
        );
      }
      
      try {
        // Use findOneAndUpdate for atomic updates
        const updateData: any = {
          $set: {
            status: 'confirmed',
            paymentStatus: 'full',
            amountPaid: appointment.totalAmount
          }
        };
        
        // Add payment history entry if not exists
        if (!appointment.paymentHistory || appointment.paymentHistory.length === 0) {
          updateData.$push = {
            paymentHistory: {
              amount: appointment.totalAmount,
              date: new Date(),
              method: 'manual',
              reference: reference,
              note: 'Payment manually confirmed by admin'
            }
          };
        }
        
        const updatedAppointment = await AppointmentModel.findOneAndUpdate(
          { paystackReference: reference },
          updateData,
          { new: true }
        );
        
        if (!updatedAppointment) {
          return NextResponse.json(
            { success: false, error: 'Failed to update appointment' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Appointment manually confirmed',
          appointmentId: updatedAppointment._id
        });
      } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update appointment', 
            details: (error instanceof Error) ? error.message : String(error) 
          },
          { status: 500 }
        );
      }
    }
    else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: check, list-recent, force-confirm' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in debug payment endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint error', 
        details: (error instanceof Error) ? error.message : String(error),
        stack: (error instanceof Error) ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 