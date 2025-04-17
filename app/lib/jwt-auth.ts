import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import logger from './logger';

// Constants
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here'
);
const TOKEN_NAME = 'auth-token';
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

// Types
export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}
// i just want to add a logo

/**
 * Sign a new JWT token
 */
export async function signToken(payload: Partial<JwtPayload>): Promise<string> {
  logger.auth.debug('Signing new JWT token', { sub: payload.sub, role: payload.role });
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + THIRTY_DAYS_IN_SECONDS; // 30 days

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(JWT_SECRET);
  
  logger.auth.tokenCreate(payload.sub || 'unknown');
  logger.auth.debug('Token signed successfully', { 
    sub: payload.sub,
    iat: new Date(iat * 1000).toISOString(),
    exp: new Date(exp * 1000).toISOString(),
    tokenLength: token.length
  });
  
  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    logger.auth.debug('Verifying JWT token');
    
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
      const jwtPayload = {
        sub: payload.sub,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp
      };
      
      logger.auth.tokenVerify(true, payload.sub);
      logger.auth.debug('Token verified successfully', {
        sub: payload.sub,
        role: payload.role,
        expires: new Date(Number(payload.exp) * 1000).toISOString()
      });
      
      return jwtPayload;
    }
    
    logger.auth.tokenVerify(false);
    logger.auth.warn('Token payload missing required fields', { 
      hasSub: typeof payload.sub === 'string',
      hasIat: typeof payload.iat === 'number',
      hasExp: typeof payload.exp === 'number',
      hasRole: typeof payload.role === 'string'
    });
    
    return null;
  } catch (error) {
    logger.auth.tokenVerify(false);
    logger.auth.error('Token verification failed', { error: String(error) });
    return null;
  }
}

/**
 * Store token in HTTP-only cookie
 */
export function setTokenCookie(token: string, response?: NextResponse): void {
  logger.auth.debug('Setting auth token cookie');
  const cookieStore = cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: THIRTY_DAYS_IN_SECONDS, // 30 days
    path: '/',
  };
  
  logger.auth.debug('Cookie options', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    maxAge: cookieOptions.maxAge
  });
  
  if (response) {
    // Set cookie in middleware response
    logger.auth.debug('Setting cookie in middleware response');
    response.cookies.set(TOKEN_NAME, token, cookieOptions);
  } else {
    // Set cookie in server action
    logger.auth.debug('Setting cookie in server action');
    cookieStore.set(TOKEN_NAME, token, cookieOptions);
  }
}

/**
 * Get token from cookie
 */
export function getTokenFromCookies(request?: NextRequest): string | null {
  logger.auth.debug('Retrieving token from cookies');
  
  if (request) {
    // Get from middleware request
    logger.auth.debug('Retrieving token from middleware request');
    const token = request.cookies.get(TOKEN_NAME)?.value;
    logger.auth.debug(token ? 'Token found in request cookies' : 'No token found in request cookies');
    return token || null;
  } 
  
  // Get from server action
  logger.auth.debug('Retrieving token from server action');
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  logger.auth.debug(token ? 'Token found in server cookies' : 'No token found in server cookies');
  return token || null;
}

/**
 * Clear token cookie
 */
export function clearTokenCookie(response?: NextResponse): void {
  logger.auth.debug('Clearing auth token cookie');
  const cookieStore = cookies();
  
  if (response) {
    // Clear in middleware response
    logger.auth.debug('Clearing cookie in middleware response');
    response.cookies.set(TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
  } else {
    // Clear in server action
    logger.auth.debug('Clearing cookie in server action');
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
  logger.auth.debug('Getting user from token');
  const token = getTokenFromCookies(request);
  
  if (!token) {
    logger.auth.debug('No token found, cannot get user');
    return null;
  }
  
  logger.auth.debug('Token found, verifying');
  const user = await verifyToken(token);
  
  if (user) {
    logger.auth.debug('User extracted from token', { 
      sub: user.sub,
      role: user.role
    });
  } else {
    logger.auth.warn('Failed to extract user from token');
  }
  
  return user;
} 