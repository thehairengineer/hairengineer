import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Constants
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here'
);
const TOKEN_NAME = 'auth-token';

// Types
export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Sign a new JWT token
 */
export async function signToken(payload: Partial<JwtPayload>): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 8 * 60 * 60; // 8 hours

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    
    // Safely convert the jose library payload to our JwtPayload type
    // by ensuring all required properties exist
    if (
      typeof payload.sub === 'string' && 
      typeof payload.iat === 'number' && 
      typeof payload.exp === 'number' &&
      payload.role && typeof payload.role === 'string'
    ) {
      return {
        sub: payload.sub,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Store token in HTTP-only cookie
 */
export function setTokenCookie(token: string, response?: NextResponse): void {
  const cookieStore = cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 8 * 60 * 60, // 8 hours
    path: '/',
  };
  
  if (response) {
    // Set cookie in middleware response
    response.cookies.set(TOKEN_NAME, token, cookieOptions);
  } else {
    // Set cookie in server action
    cookieStore.set(TOKEN_NAME, token, cookieOptions);
  }
}

/**
 * Get token from cookie
 */
export function getTokenFromCookies(request?: NextRequest): string | null {
  if (request) {
    // Get from middleware request
    const token = request.cookies.get(TOKEN_NAME)?.value;
    return token || null;
  } 
  
  // Get from server action
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  return token || null;
}

/**
 * Clear token cookie
 */
export function clearTokenCookie(response?: NextResponse): void {
  const cookieStore = cookies();
  
  if (response) {
    // Clear in middleware response
    response.cookies.set(TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
  } else {
    // Clear in server action
    cookieStore.set(TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
  }
}

/**
 * Utility to obtain user from JWT token
 */
export async function getUserFromToken(request?: NextRequest): Promise<JwtPayload | null> {
  const token = getTokenFromCookies(request);
  if (!token) return null;
  
  return verifyToken(token);
} 