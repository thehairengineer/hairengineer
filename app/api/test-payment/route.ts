import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import AppointmentModel from '@/app/models/Appointment';
import AvailableDate from '@/app/models/AvailableDate';
import { revalidatePath } from 'next/cache';

/**
 * This is a test-only endpoint that simulates a successful Paystack payment
 * It should not be used in production!
 */
export async function POST(request: Request) {
  try {
    const { reference, amount } = await request.json();
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }
    
    console.log('Processing test payment with reference:', reference);
    
    // Connect to database
    await connectDB();
    
    // Find the existing appointment with this reference
    const appointment = await AppointmentModel.findOne({ paystackReference: reference });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'No appointment found with this reference' },
        { status: 404 }
      );
    }
    
    try {
      // Use findOneAndUpdate for atomic update - prevents version conflicts
      const updateResult = await AppointmentModel.findOneAndUpdate(
        { paystackReference: reference },
        {
          $set: {
            status: 'confirmed',
            paymentStatus: 'full',
            amountPaid: amount || appointment.totalAmount || 100
          },
          $push: {
            paymentHistory: {
              amount: amount || appointment.totalAmount || 100,
              date: new Date(),
              method: 'mobile_money',
              reference: reference,
              note: 'Test payment (no real money used)'
            }
          }
        },
        { new: true } // Return the updated document
      );
      
      if (!updateResult) {
        return NextResponse.json(
          { error: 'Failed to update appointment after test payment' },
          { status: 500 }
        );
      }
      
      // Update available date counter
      const selectedDate = new Date(appointment.date);
      await AvailableDate.findOneAndUpdate(
        {
          date: {
            $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
          }
        },
        { $inc: { currentAppointments: 1 } }
      );
      
      revalidatePath('/api/appointments');
      
      return NextResponse.json({
        success: true,
        message: 'Test payment processed and appointment updated',
        data: {
          appointmentId: updateResult._id.toString(),
          reference: reference,
          amount: amount || updateResult.totalAmount || 100
        }
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      return NextResponse.json({
        error: 'Failed to update appointment',
        details: (error instanceof Error) ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing test payment:', error);
    return NextResponse.json(
      { error: 'Test payment failed', details: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
} 