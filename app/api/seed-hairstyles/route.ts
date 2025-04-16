import { NextResponse } from 'next/server';
import connectDB, { withCache } from '@/app/lib/mongodb';
import HairStyle from '@/app/models/HairStyle';

// Default hairstyles to seed the database
const defaultHairStyles = [
  // LOCS
  { category: 'LOCS', name: 'Soft Locs', value: 'locs-soft-locs' },
  { category: 'LOCS', name: 'Faux Locs - Small', value: 'locs-faux-locs-small' },
  { category: 'LOCS', name: 'Faux Locs - Medium', value: 'locs-faux-locs-medium' },
  { category: 'LOCS', name: 'Faux Locs - Large', value: 'locs-faux-locs-large' },
  { category: 'LOCS', name: 'Faux Locs - Jumbo', value: 'locs-faux-locs-jumbo' },
  { category: 'LOCS', name: 'Invisible Locs - Medium', value: 'locs-invisible-locs-medium' },
  { category: 'LOCS', name: 'Invisible Locs - Large', value: 'locs-invisible-locs-large' },
  { category: 'LOCS', name: 'Butterfly Locs - Medium', value: 'locs-butterfly-locs-medium' },
  { category: 'LOCS', name: 'Butterfly Locs - Large', value: 'locs-butterfly-locs-large' },
  { category: 'LOCS', name: 'Goddess Locs - Medium', value: 'locs-goddess-locs-medium' },
  { category: 'LOCS', name: 'Goddess Locs - Large', value: 'locs-goddess-locs-large' },
  { category: 'LOCS', name: 'Boho Locs - Medium', value: 'locs-boho-locs-medium' },
  { category: 'LOCS', name: 'Boho Locs - Large', value: 'locs-boho-locs-large' },
  { category: 'LOCS', name: 'Ocean Locs - Medium', value: 'locs-ocean-locs-medium' },
  { category: 'LOCS', name: 'Ocean Locs - Large', value: 'locs-ocean-locs-large' },
  
  // TWIST
  { category: 'TWIST', name: 'Island Twist - Small', value: 'twist-island-twist-small' },
  { category: 'TWIST', name: 'Island Twist - Medium', value: 'twist-island-twist-medium' },
  { category: 'TWIST', name: 'Island Twist - Large', value: 'twist-island-twist-large' },
  { category: 'TWIST', name: 'Island Twist - Jumbo', value: 'twist-island-twist-jumbo' },
  { category: 'TWIST', name: 'Passion Twist - Small', value: 'twist-passion-twist-small' },
  { category: 'TWIST', name: 'Passion Twist - Medium', value: 'twist-passion-twist-medium' },
  { category: 'TWIST', name: 'Passion Twist - Large', value: 'twist-passion-twist-large' },
  { category: 'TWIST', name: 'Passion Twist - Jumbo', value: 'twist-passion-twist-jumbo' },
  
  // SEW IN
  { category: 'SEW IN', name: 'Closure Sew-in', value: 'sew-in-closure-sew-in' },
  { category: 'SEW IN', name: 'Versatile Sew-in - with Middle & Side Part & Bun', value: 'sew-in-versatile-sew-in-full' },
  { category: 'SEW IN', name: 'Versatile Sew-in - with Middle Part & Bun', value: 'sew-in-versatile-sew-in-middle' },
  { category: 'SEW IN', name: 'Versatile Sew-in - Side Part & Bun', value: 'sew-in-versatile-sew-in-side' },
  { category: 'SEW IN', name: 'Vixen Sew-in', value: 'sew-in-vixen-sew-in' },
  
  // BRAIDS
  { category: 'BRAIDS', name: 'Knotless Braids - Small', value: 'braids-knotless-braids-small' },
  { category: 'BRAIDS', name: 'Knotless Braids - Medium', value: 'braids-knotless-braids-medium' },
  { category: 'BRAIDS', name: 'Knotless Braids - Large', value: 'braids-knotless-braids-large' },
  { category: 'BRAIDS', name: 'Knotless Braids - Jumbo', value: 'braids-knotless-braids-jumbo' },
  { category: 'BRAIDS', name: 'Boho Braids - Small', value: 'braids-boho-braids-small' },
  { category: 'BRAIDS', name: 'Boho Braids - Medium', value: 'braids-boho-braids-medium' },
  { category: 'BRAIDS', name: 'Boho Braids - Large', value: 'braids-boho-braids-large' },
  { category: 'BRAIDS', name: 'Boho Braids - Jumbo', value: 'braids-boho-braids-jumbo' },
  { category: 'BRAIDS', name: 'Goddess Braids - Small', value: 'braids-goddess-braids-small' },
  { category: 'BRAIDS', name: 'Goddess Braids - Medium', value: 'braids-goddess-braids-medium' },
  { category: 'BRAIDS', name: 'Goddess Braids - Large', value: 'braids-goddess-braids-large' },
  { category: 'BRAIDS', name: 'Goddess Braids - Jumbo', value: 'braids-goddess-braids-jumbo' },
  
  // CORNROWS
  { category: 'CORNROWS', name: 'Stitch Cornrows (All Back)', value: 'cornrows-stitch-cornrows-all-back' },
  { category: 'CORNROWS', name: 'Stitch Cornrows with Braid', value: 'cornrows-stitch-cornrows-with-braid' }
];

export async function GET() {
  try {
    await connectDB();
    
    // Check if we already have hairstyles in the database
    const existingCount = await HairStyle.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: `Database already has ${existingCount} hairstyles. No seeding needed.`,
        count: existingCount
      });
    }
    
    // Insert all default hairstyles
    const result = await HairStyle.insertMany(defaultHairStyles);
    
    // Invalidate cache
    await withCache('hair-styles', async () => {
      return HairStyle.find({}).sort({ category: 1, name: 1 }).lean();
    }, true);
    
    return NextResponse.json({ 
      message: `Successfully seeded ${result.length} hairstyles`,
      count: result.length
    });
  } catch (error) {
    console.error('Error seeding hairstyles:', error);
    return NextResponse.json({ 
      error: 'Failed to seed hairstyles',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// This route allows force-seeding by deleting all existing styles first
export async function POST(request: Request) {
  try {
    const { force } = await request.json();
    
    await connectDB();
    
    if (force) {
      // Delete all existing hairstyles first
      await HairStyle.deleteMany({});
    }
    
    // Insert all default hairstyles
    const result = await HairStyle.insertMany(defaultHairStyles);
    
    // Invalidate cache
    await withCache('hair-styles', async () => {
      return HairStyle.find({}).sort({ category: 1, name: 1 }).lean();
    }, true);
    
    return NextResponse.json({ 
      message: `Successfully ${force ? 'force-' : ''}seeded ${result.length} hairstyles`,
      count: result.length
    });
  } catch (error) {
    console.error('Error seeding hairstyles:', error);
    return NextResponse.json({ 
      error: 'Failed to seed hairstyles',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 