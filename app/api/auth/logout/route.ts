import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/app/lib/jwt-auth';
import { cookies } from 'next/headers';

export async function POST() {
  // Create a response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  
  // Clear the auth token cookie
  clearTokenCookie(response);
  
  // Clear other possible auth cookies
  const cookieStore = cookies();
  const cookiesToClear = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    'admin_session'
  ];
  
  // Clear each cookie in our list
  cookiesToClear.forEach(cookieName => {
    if (cookieStore.has(cookieName)) {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      });
    }
  });
  
  // Set cache control to prevent caching
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  
  return response;
} 