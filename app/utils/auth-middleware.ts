import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/app/lib/jwt-auth';

/**
 * Middleware to protect admin routes
 */
export async function withAuth(request: NextRequest) {
  const cookieStore = cookies();
  const hasAuthToken = cookieStore.has('auth-token');
  
  // Verify the token is actually valid before redirecting
  const user = hasAuthToken ? await getUserFromToken(request) : null;
  const isValidAdmin = user && user.role === 'admin';
  
  // If accessing admin dashboard without a valid session, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') && !isValidAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // If accessing login with a valid admin session, redirect to dashboard
  if (request.nextUrl.pathname === '/admin/login' && isValidAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
} 