import { NextRequest, NextResponse } from 'next/server';
import { signToken, setTokenCookie } from '@/app/lib/jwt-auth';

// Admin credentials (fallback for if environment variables aren't set)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'; 
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Hairengineer2025!';

export async function POST(request: NextRequest) {
  try {
    // Parse form data or JSON body
    let username, password;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username;
      password = body.password;
    } else {
      const formData = await request.formData();
      username = formData.get('username') as string;
      password = formData.get('password') as string;
    }
    
    // Simple validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create JWT token for successful login
      const token = await signToken({
        sub: username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
      });
      
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
      
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    }
    
    // Invalid credentials
    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 