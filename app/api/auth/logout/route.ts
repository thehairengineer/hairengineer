import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookie, getUserFromToken } from '@/app/lib/jwt-auth';
import { cookies } from 'next/headers';
import logger from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  logger.auth.info(`Logout initiated [${requestId}]`, {
    ip: clientIp,
    userAgent: request.headers.get('user-agent') || 'unknown'
  });
  
  // Try to get the user before clearing cookies
  const user = await getUserFromToken(request);
  if (user) {
    logger.auth.info(`User "${user.sub}" logged out [${requestId}]`);
    logger.auth.logout(user.sub, clientIp);
  } else {
    logger.auth.info(`Anonymous user logged out (no valid session) [${requestId}]`);
  }
  
  // Create a response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  
  // Clear the auth token cookie
  clearTokenCookie(response);
  logger.auth.debug(`Auth token cookie cleared [${requestId}]`);
  
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
      logger.auth.debug(`Cleared cookie: ${cookieName} [${requestId}]`);
    }
  });
  
  // Set cache control to prevent caching
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  
  logger.auth.info(`Logout completed successfully [${requestId}]`);
  
  return response;
} 