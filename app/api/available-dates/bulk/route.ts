import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import AvailableDate from '@/app/models/AvailableDate';

interface DateEntry {
  date: string;
  maxAppointments: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.dates || !Array.isArray(body.dates) || body.dates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: dates array is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Prepare dates for insertion
    const dates: DateEntry[] = body.dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };
    
    // Process each date
    for (const dateEntry of dates) {
      try {
        const dateObj = new Date(dateEntry.date);
        
        // Skip dates in the past
        if (dateObj < today) {
          results.skipped++;
          continue;
        }
        
        // Set default maxAppointments to 1 if not provided or invalid
        const maxAppointments = (!dateEntry.maxAppointments || dateEntry.maxAppointments < 1)
          ? 1
          : dateEntry.maxAppointments;
        
        // Check if date already exists
        const existingDate = await AvailableDate.findOne({
          date: {
            $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
            $lt: new Date(dateObj.setHours(23, 59, 59, 999))
          }
        });
        
        if (existingDate) {
          // Update existing date if found
          await AvailableDate.findByIdAndUpdate(existingDate._id, {
            maxAppointments: maxAppointments
          });
        } else {
          // Create new date if not found
          await AvailableDate.create({
            date: dateEntry.date,
            maxAppointments,
            currentAppointments: 0
          });
        }
        
        results.created++;
      } catch (error) {
        console.error('Error processing date:', dateEntry, error);
        results.errors.push(`Error processing date: ${dateEntry.date}`);
      }
    }
    
    // Invalidate cache after modification
    await withCache('available-dates', async () => {
      return AvailableDate.find({}).sort({ date: 1 }).lean();
    }, true);
    
    // Return success with results
    return NextResponse.json({
      message: `Successfully processed ${results.created} dates (${results.skipped} skipped)`,
      ...results
    });
  } catch (error) {
    console.error('Failed to create bulk available dates:', error);
    return NextResponse.json(
      { error: 'Failed to create available dates' },
      { status: 500 }
    );
  }
} 