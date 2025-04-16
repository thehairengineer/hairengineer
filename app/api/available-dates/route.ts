import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import AvailableDate from '@/app/models/AvailableDate';
import Appointment from '@/app/models/Appointment';

// Function to clean up past dates
async function cleanupPastDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    await connectDB();
    await AvailableDate.deleteMany({ date: { $lt: today } });
  } catch (error) {
    console.error('Error cleaning up past dates:', error);
  }
}

// Function to update appointment counts
async function updateAppointmentCounts() {
  try {
    await connectDB();
    const availableDates = await AvailableDate.find({});
    
    for (const date of availableDates) {
      const appointmentCount = await Appointment.countDocuments({
        date: {
          $gte: new Date(date.date).setHours(0, 0, 0, 0),
          $lt: new Date(date.date).setHours(23, 59, 59, 999)
        },
        status: { $ne: 'cancelled' }
      });

      if (appointmentCount >= date.maxAppointments) {
        // Remove date if it has reached capacity
        await AvailableDate.findByIdAndDelete(date._id);
        console.log(`Removed date ${date.date} as it reached capacity (${appointmentCount}/${date.maxAppointments})`);
      } else {
        // Update current appointment count
        await AvailableDate.findByIdAndUpdate(date._id, {
          currentAppointments: appointmentCount
        });
      }
    }
  } catch (error) {
    console.error('Error updating appointment counts:', error);
  }
}

export async function GET() {
  try {
    // Clean up past dates first
    await cleanupPastDates();
    // Update appointment counts
    await updateAppointmentCounts();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = await withCache(
      'available-dates',
      async () => {
        await connectDB();
        return AvailableDate.find({
          date: { $gte: today }
        }).sort({ date: 1 }).lean();
      },
      true
    );
    
    return NextResponse.json(dates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch available dates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Set default maxAppointments to 1 if not provided or invalid
    const maxAppointments = (!body.maxAppointments || body.maxAppointments < 1) ? 1 : body.maxAppointments;

    const date = await AvailableDate.create({
      date: body.date,
      maxAppointments,
      currentAppointments: 0
    });
    
    // Invalidate cache after modification
    await withCache('available-dates', async () => {
      return AvailableDate.find({}).sort({ date: 1 }).lean();
    }, true);
    
    return NextResponse.json(date);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create available date' }, { status: 500 });
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
    const date = await AvailableDate.findByIdAndDelete(id);
    
    if (!date) {
      return NextResponse.json({ error: 'Date not found' }, { status: 404 });
    }
    
    // Invalidate cache after modification
    await withCache('available-dates', async () => {
      return AvailableDate.find({}).sort({ date: 1 }).lean();
    }, true);
    
    return NextResponse.json({ message: 'Date removed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete available date' }, { status: 500 });
  }
}