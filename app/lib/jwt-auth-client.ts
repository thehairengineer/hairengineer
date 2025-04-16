import { jwtVerify } from 'jose';

// Constants
// Note: Using a constant here since we can't use environment variables
// securely on the client side for JWT verification
const JWT_SECRET = new TextEncoder().encode(
  'your-super-secret-key-here' // Must match server secret for verification to work
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
 * Verify a JWT token on the client side
 */
export async function verifyTokenClient(token: string): Promise<JwtPayload | null> {
  try {
    // For client-side security, we can't verify the token cryptographically
    // since we can't expose the secret. Instead, we'll check with the server.
    const response = await fetch('/api/auth/status', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated && data.user) {
        return {
          sub: data.user.username,
          role: data.user.role,
          iat: 0, // We don't receive these from the API
          exp: 0
        };
      }
    }
    
    // Fallback to basic validation if API call fails
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      
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
    } catch (verifyError) {
      console.warn('Client token verification failed, using API response:', verifyError);
    }
    
    return null;
  } catch (error) {
    console.error('Client token verification failed:', error);
    return null;
  }
}

/**
 * Get token from cookie on the client side
 */
export function getTokenFromClientCookies(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${TOKEN_NAME}=`)) {
      return cookie.substring(TOKEN_NAME.length + 1);
    }
  }
  
  return null;
}

/**
 * Utility to obtain user from JWT token in client components
 */
export async function getUserFromClientToken(): Promise<JwtPayload | null> {
  try {
    // Make request with cache control headers to prevent stale data
    const response = await fetch('/api/auth/status', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Handle the updated response format
    if (data.authenticated && data.user) {
      return {
        sub: data.user.username,
        role: data.user.role,
        iat: 0, // We don't have these values from the API
        exp: 0  // for security reasons
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from client token:', error);
    return null;
  }
} 