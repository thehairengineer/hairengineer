import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import AppointmentModel from '@/app/models/Appointment';
import AvailableDate from '@/app/models/AvailableDate';
import SystemSettings from '@/app/models/SystemSettings';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    // Get reference from request
    const { reference } = await request.json();
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    console.log(`Verifying payment with reference: ${reference}`);
    
    // Get config settings from environment variables
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service is not properly configured' },
        { status: 500 }
      );
    }
    
    // Connect to the database
    await connectDB();

    // Check if we already have an appointment with this reference
    console.log(`Looking for appointment with reference: ${reference}`)
    
    try {
      const existingAppointment = await AppointmentModel.findOne({ paystackReference: reference });
      
      if (!existingAppointment) {
        console.log(`No appointment found with reference: ${reference}`);
        
        // For debugging: Let's check if there are any appointments at all
        const allAppointments = await AppointmentModel.find({}, 'paystackReference').limit(5);
        console.log(`Found ${allAppointments.length} total appointments. Sample references:`, 
          allAppointments.map(a => a.paystackReference).join(', '));
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Appointment not found',
            message: 'No appointment record found with this payment reference.'
          }, 
          { status: 200 } // Using 200 status to allow frontend to handle gracefully
        );
      }

      // Verify the payment with Paystack
      const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Paystack verification error:', await response.text());
        return NextResponse.json(
          { error: 'Payment verification failed', details: 'Error connecting to payment provider' },
          { status: 500 }
        );
      }
      
      const data = await response.json();
      console.log('Paystack verification response:', JSON.stringify(data, null, 2));
      
      // Handle different payment statuses
      if (data.status) {
        if (data.data.status === 'success') {
          // Get payment information
          const paymentAmount = data.data.amount / 100; // Convert back from kobo/pesewas
          const paymentChannel = data.data.authorization?.channel || 'other';
          const paymentGateway = 'Paystack';
          const paymentDate = new Date(data.data.paid_at || Date.now());
          
          try {
            // Use findOneAndUpdate for atomic operations - this prevents version conflicts
            const updateResult = await AppointmentModel.findOneAndUpdate(
              { paystackReference: reference },
              {
                $set: {
                  status: 'confirmed',
                  amountPaid: paymentAmount,
                  paymentStatus: 'full',
                  paymentHistory: {
                    amount: paymentAmount,
                    date: paymentDate,
                    method: paymentChannel,
                    reference: reference,
                    note: `${paymentGateway} payment via ${paymentChannel}`
                  }
                }
              },
              { new: true } // Return updated document
            );
            
            if (!updateResult) {
              console.error('Failed to update appointment - not found after verification');
              return NextResponse.json(
                { error: 'Failed to update appointment', details: 'Appointment not found after verification' },
                { status: 500 }
              );
            }
            
            console.log('Appointment updated successfully with ID:', updateResult._id);
            
            // Update available date counter atomically
            const selectedDate = new Date(existingAppointment.date);
            await AvailableDate.findOneAndUpdate(
              {
                date: {
                  $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                  $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
                }
              },
              { $inc: { currentAppointments: 1 } }
            );
            
            // Revalidate the appointments API route
            revalidatePath('/api/appointments');
            
            return NextResponse.json({
              success: true,
              message: 'Payment verified and appointment confirmed',
              data: {
                appointmentId: updateResult._id,
                reference,
                amount: paymentAmount,
                status: 'confirmed'
              }
            });
          } catch (updateError) {
            console.error('Error updating appointment:', updateError);
            return NextResponse.json(
              { 
                error: 'Failed to update appointment with payment details', 
                details: (updateError instanceof Error) ? updateError.message : String(updateError)
              },
              { status: 500 }
            );
          }
        } else if (data.data.status === 'pending') {
          // Payment is still pending
          return NextResponse.json({
            success: false,
            message: 'Payment is still pending',
            data: {
              reference,
              status: 'pending'
            }
          });
        } else {
          // Payment failed or was abandoned
          return NextResponse.json({
            success: false,
            message: 'Payment was not successful',
            data: {
              reference,
              status: data.data.status
            }
          });
        }
      } else {
        // Verification failed
        return NextResponse.json(
          { error: 'Payment verification failed', details: data.message },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error during payment verification:', error);
      return NextResponse.json(
        { error: 'Failed to verify payment', details: (error instanceof Error) ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
} 