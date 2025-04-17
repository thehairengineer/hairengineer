import { NextRequest, NextResponse } from 'next/server';
import { signToken, setTokenCookie } from '@/app/lib/jwt-auth';
import logger from '@/app/lib/logger';

// Admin credentials (fallback for if environment variables aren't set)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'; 
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Hairengineer2025!';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
                   
  logger.auth.info(`Login attempt initiated [${requestId}]`, {
    ip: clientIp,
    userAgent: request.headers.get('user-agent') || 'unknown',
    referrer: request.headers.get('referer') || 'none'
  });
  
  try {
    // Parse form data or JSON body
    let username, password;
    const contentType = request.headers.get('content-type') || '';
    
    logger.auth.debug(`Processing ${contentType} request [${requestId}]`);
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username;
      password = body.password;
      logger.auth.debug(`JSON body parsed [${requestId}]`);
    } else {
      const formData = await request.formData();
      username = formData.get('username') as string;
      password = formData.get('password') as string;
      logger.auth.debug(`Form data parsed [${requestId}]`);
    }
    
    // Simple validation
    if (!username || !password) {
      logger.auth.warn(`Missing credentials in login attempt [${requestId}]`, {
        hasUsername: !!username,
        hasPassword: !!password
      });
      
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    logger.auth.attempt(username, clientIp);
    logger.auth.debug(`Validating credentials for "${username}" [${requestId}]`);
    
    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      logger.auth.info(`Successful credential validation for "${username}" [${requestId}]`);
      
      // Create JWT token for successful login
      const tokenStartTime = Date.now();
      const token = await signToken({
        sub: username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      });
      const tokenTime = Date.now() - tokenStartTime;
      
      logger.auth.debug(`JWT token created in ${tokenTime}ms [${requestId}]`);
      
      // Prepare success response
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Authentication successful',
          redirectTo: '/admin'
        },
        { status: 200 }
      );
      
      // Set the JWT token in a cookie
      setTokenCookie(token, response);
      logger.auth.debug(`Token cookie set [${requestId}]`);
      
      // Also set a direct cookie as a backup
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      logger.auth.debug(`Backup cookie set directly [${requestId}]`);
      
      // Also set a next-auth session token
      response.cookies.set('next-auth.session-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      logger.auth.debug(`NextAuth session token cookie set [${requestId}]`);
      
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      logger.auth.success(username, clientIp);
      logger.auth.info(`Login successful for "${username}" [${requestId}]`);
      
      return response;
    }
    
    // Invalid credentials
    logger.auth.failure(username, 'Invalid credentials', clientIp);
    logger.auth.warn(`Invalid credentials for "${username}" [${requestId}]`);
    
    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    logger.auth.error(`Login error [${requestId}]`, { error: String(error) });
    
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 