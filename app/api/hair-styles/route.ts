import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import HairStyle from '@/app/models/HairStyle';

export async function GET() {
  try {
    const hairStyles = await withCache(
      'hair-styles',
      async () => {
        await connectDB();
        return HairStyle.find({}).sort({ category: 1, name: 1 }).lean();
      },
      false
    );
    return NextResponse.json(hairStyles);
  } catch (error) {
    console.error('Error fetching hair styles:', error);
    return NextResponse.json({ error: 'Failed to fetch hair styles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Validate required fields
    if (!body.category || !body.name || !body.value) {
      return NextResponse.json({ error: 'Category, name, and value are required' }, { status: 400 });
    }

    // Check if style with same value already exists
    const existingStyle = await HairStyle.findOne({ value: body.value });
    if (existingStyle) {
      return NextResponse.json({ error: 'A style with this value already exists' }, { status: 400 });
    }

    const hairStyle = await HairStyle.create(body);
    
    // Properly refresh the cache with the latest hairstyles instead of just invalidating
    const allHairStyles = await HairStyle.find({}).sort({ category: 1, name: 1 }).lean();
    await withCache('hair-styles', async () => allHairStyles, true);
    
    return NextResponse.json(hairStyle);
  } catch (error) {
    console.error('Error creating hair style:', error);
    return NextResponse.json({ error: 'Failed to create hair style' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    if (!body._id) {
      return NextResponse.json({ error: 'Hair style ID is required' }, { status: 400 });
    }

    const hairStyle = await HairStyle.findByIdAndUpdate(
      body._id,
      { $set: body },
      { new: true }
    );

    if (!hairStyle) {
      return NextResponse.json({ error: 'Hair style not found' }, { status: 404 });
    }

    // Properly refresh the cache with the latest hairstyles
    const allHairStyles = await HairStyle.find({}).sort({ category: 1, name: 1 }).lean();
    await withCache('hair-styles', async () => allHairStyles, true);

    return NextResponse.json(hairStyle);
  } catch (error) {
    console.error('Error updating hair style:', error);
    return NextResponse.json({ error: 'Failed to update hair style' }, { status: 500 });
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
    const hairStyle = await HairStyle.findByIdAndDelete(id);
    
    if (!hairStyle) {
      return NextResponse.json({ error: 'Hair style not found' }, { status: 404 });
    }
    
    // Properly refresh the cache with the latest hairstyles
    const allHairStyles = await HairStyle.find({}).sort({ category: 1, name: 1 }).lean();
    await withCache('hair-styles', async () => allHairStyles, true);
    
    return NextResponse.json({ message: 'Hair style deleted successfully' });
  } catch (error) {
    console.error('Error deleting hair style:', error);
    return NextResponse.json({ error: 'Failed to delete hair style' }, { status: 500 });
  }
} 