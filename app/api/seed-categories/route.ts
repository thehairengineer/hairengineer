import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import ServiceCategory from '@/app/models/ServiceCategory';

// Default service categories
const defaultCategories = [
  { name: 'LOCS', description: 'Various styles of locs', order: 1 },
  { name: 'TWIST', description: 'Various twisting techniques', order: 2 },
  { name: 'SEW IN', description: 'Sew-in extensions and weaves', order: 3 },
  { name: 'BRAIDS', description: 'Various braiding styles', order: 4 },
  { name: 'CORNROWS', description: 'Cornrow braiding styles', order: 5 }
];

export async function GET() {
  try {
    await connectDB();
    
    // Check if we already have categories in the database
    const existingCount = await ServiceCategory.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: `Database already has ${existingCount} service categories. No seeding needed.`,
        count: existingCount
      });
    }
    
    // Insert default categories
    const result = await ServiceCategory.insertMany(defaultCategories);
    
    // Invalidate cache
    await withCache('service-categories', async () => {
      return ServiceCategory.find({}).sort({ order: 1, name: 1 }).lean();
    }, true);
    
    return NextResponse.json({ 
      message: `Successfully seeded ${result.length} service categories`,
      count: result.length
    });
  } catch (error) {
    console.error('Error seeding service categories:', error);
    return NextResponse.json({ 
      error: 'Failed to seed service categories',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Force-seeding by deleting all existing categories first
export async function POST(request: Request) {
  try {
    const { force } = await request.json();
    
    await connectDB();
    
    if (force) {
      // Delete all existing categories first
      await ServiceCategory.deleteMany({});
    }
    
    // Insert default categories
    const result = await ServiceCategory.insertMany(defaultCategories);
    
    // Invalidate cache
    await withCache('service-categories', async () => {
      return ServiceCategory.find({}).sort({ order: 1, name: 1 }).lean();
    }, true);
    
    return NextResponse.json({ 
      message: `Successfully ${force ? 'force-' : ''}seeded ${result.length} service categories`,
      count: result.length
    });
  } catch (error) {
    console.error('Error seeding service categories:', error);
    return NextResponse.json({ 
      error: 'Failed to seed service categories',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 