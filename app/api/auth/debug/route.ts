import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken, verifyToken } from '@/app/lib/jwt-auth';

interface TokenInfo {
  valid: boolean;
  role?: string;
  username?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Get auth token specifically
    const authToken = cookieStore.get('auth-token')?.value;
    
    // Attempt to verify the token if it exists
    let tokenInfo: TokenInfo | null = null;
    let user = null;
    
    if (authToken) {
      try {
        tokenInfo = { valid: false };
        user = await getUserFromToken(request);
        if (user) {
          tokenInfo.valid = true;
          tokenInfo.role = user.role;
          tokenInfo.username = user.sub;
        }
      } catch (tokenError) {
        tokenInfo = { 
          valid: false, 
          error: String(tokenError) 
        };
      }
    }
    
    // Get request information
    const requestInfo = {
      path: request.nextUrl.pathname,
      search: request.nextUrl.search,
      referrer: request.headers.get('referer') || 'none',
      userAgent: request.headers.get('user-agent') || 'none'
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      request: requestInfo,
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        authToken: authToken ? 'present' : 'not found'
      },
      auth: {
        tokenPresent: !!authToken,
        tokenInfo,
        user
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug error',
        message: String(error),
        stack: process.env.NODE_ENV === 'development' ? (error as any).stack : undefined
      },
      { status: 500 }
    );
  }
} 