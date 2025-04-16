import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import ServiceCategory from '@/app/models/ServiceCategory';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const categories = await withCache(
      'service-categories',
      async () => {
        await connectDB();
        return ServiceCategory.find({}).sort({ order: 1, name: 1 }).lean();
      },
      false
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json({ error: 'Failed to fetch service categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Normalize the category name to uppercase and trim
    const categoryName = body.name.trim().toUpperCase();

    // Check if category already exists
    const existingCategory = await ServiceCategory.findOne({ name: categoryName });
    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    // Count categories to get the next order value
    const categoryCount = await ServiceCategory.countDocuments();

    // Create the new category
    const category = await ServiceCategory.create({
      ...body,
      name: categoryName,
      order: body.order || categoryCount + 1
    });
    
    // Refresh the cache with all categories
    const allCategories = await ServiceCategory.find({}).sort({ order: 1, name: 1 }).lean();
    await withCache('service-categories', async () => allCategories, true);
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating service category:', error);
    return NextResponse.json({ error: 'Failed to create service category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    if (!body._id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Normalize the category name to uppercase and trim if provided
    const updateData = { ...body };
    if (updateData.name) {
      updateData.name = updateData.name.trim().toUpperCase();
      
      // Check if updated name conflicts with existing category
      const existingCategory = await ServiceCategory.findOne({ 
        name: updateData.name,
        _id: { $ne: body._id }
      });
      
      if (existingCategory) {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
      }
    }

    const category = await ServiceCategory.findByIdAndUpdate(
      body._id,
      { $set: updateData },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Service category not found' }, { status: 404 });
    }

    // Refresh the cache with all categories
    const allCategories = await ServiceCategory.find({}).sort({ order: 1, name: 1 }).lean();
    await withCache('service-categories', async () => allCategories, true);

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating service category:', error);
    return NextResponse.json({ error: 'Failed to update service category' }, { status: 500 });
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
    
    // Check if the category is being used by any hair styles
    const HairStyle = mongoose.models.HairStyle;
    if (HairStyle) {
      const stylesWithCategory = await HairStyle.countDocuments({ category: id });
      if (stylesWithCategory > 0) {
        return NextResponse.json({ 
          error: 'Cannot delete this category because it is being used by one or more hair styles' 
        }, { status: 400 });
      }
    }
    
    const category = await ServiceCategory.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json({ error: 'Service category not found' }, { status: 404 });
    }
    
    // Refresh the cache with all categories
    const allCategories = await ServiceCategory.find({}).sort({ order: 1, name: 1 }).lean();
    await withCache('service-categories', async () => allCategories, true);
    
    return NextResponse.json({ message: 'Service category deleted successfully' });
  } catch (error) {
    console.error('Error deleting service category:', error);
    return NextResponse.json({ error: 'Failed to delete service category' }, { status: 500 });
  }
} 