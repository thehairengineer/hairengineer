import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/app/lib/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    // Get user info from token
    const user = await getUserFromToken(request);
    
    // Prepare response data
    const responseData = user ? {
      authenticated: true,
      user: {
        username: user.sub,
        role: user.role
      },
      timestamp: new Date().toISOString()
    } : {
      authenticated: false,
      message: 'Not authenticated'
    };
    
    // Create response with proper status
    const response = NextResponse.json(
      responseData,
      { status: user ? 200 : 401 }
    );
    
    // Add cache control headers to prevent browser caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Auth status error:', error);
    
    // Error response with cache headers
    const response = NextResponse.json(
      { 
        authenticated: false, 
        message: 'Authentication error',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
} 