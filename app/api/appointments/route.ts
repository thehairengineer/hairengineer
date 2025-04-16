import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import Appointment from '@/app/models/Appointment';
import AvailableDate from '@/app/models/AvailableDate';

export async function GET() {
  try {
    const appointments = await withCache(
      'appointments',
      async () => {
        await connectDB();
        return Appointment.find({}).sort({ date: 1 }).lean();
      },
      true
    );
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Check if the date is available and has slots
    const appointmentDate = new Date(body.date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    const availableDate = await AvailableDate.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!availableDate) {
      return NextResponse.json({ error: 'Selected date is not available for booking' }, { status: 400 });
    }

    // Count existing appointments for this date
    const existingAppointments = await Appointment.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' }
    });

    if (existingAppointments >= availableDate.maxAppointments) {
      return NextResponse.json({ error: 'No available slots for selected date' }, { status: 400 });
    }

    // Create the appointment
    const appointment = await Appointment.create(body);
    
    // Update current appointments count
    await AvailableDate.findByIdAndUpdate(availableDate._id, {
      currentAppointments: existingAppointments + 1
    });

    // If we've reached max appointments, remove the date from available dates
    if (existingAppointments + 1 >= availableDate.maxAppointments) {
      await AvailableDate.findByIdAndDelete(availableDate._id);
    }
    
    // Invalidate caches
    await withCache('appointments', async () => appointment, true);
    await withCache('available-dates', async () => {
      return AvailableDate.find({}).sort({ date: 1 }).lean();
    }, true);
    
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, status, paymentUpdate, amount, paymentMethod, note, totalAmount, resetPayment } = body;

    await connectDB();
    const appointment = await Appointment.findById(_id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (paymentUpdate) {
      if (resetPayment) {
        // Reset all payment information
        while(appointment.paymentHistory.length > 0) {
          appointment.paymentHistory.pop();
        }
        appointment.amountPaid = 0;
        appointment.paymentStatus = 'unpaid';
      } else {
        // Update total amount first if provided
        if (totalAmount !== undefined) {
          appointment.totalAmount = totalAmount;
        }

        // Add new payment to history
        appointment.paymentHistory.push({
          amount,
          date: new Date().toISOString(),
          method: paymentMethod,
          note
        });
        // Calculate total paid amount
        appointment.amountPaid = appointment.paymentHistory.reduce((sum: number, payment: { amount?: number }) => {
          return sum + (payment?.amount || 0);
        }, 0);

        // Update payment status
        if (appointment.amountPaid >= appointment.totalAmount) {
          appointment.paymentStatus = 'full';
        } else if (appointment.amountPaid > 0) {
          appointment.paymentStatus = 'partial';
        } else {
          appointment.paymentStatus = 'unpaid';
        }
      }
    } else if (status) {
      appointment.status = status;
    }

    // Use validateBeforeSave: false to skip validation for fields not being modified
    await appointment.save({ validateBeforeSave: false });
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Invalidate cache
    await withCache('appointments', async () => {
      return Appointment.find({}).sort({ date: 1 }).lean();
    }, true);
    
    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}