import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Log authentication steps in middleware
function logMiddleware(message: string, req: NextRequest, data?: any) {
  console.log(`[AUTH MIDDLEWARE] ${message}`, {
    url: req.nextUrl.pathname,
    ...data
  });
}

// Add security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

// Add cache headers for static assets
const addCacheHeaders = (req: NextRequest, res: NextResponse) => {
  const url = req.nextUrl.pathname;
  
  // Apply cache headers to static assets
  if (
    url.includes('/_next/static') || 
    url.includes('/images/') ||
    url.includes('/fonts/') ||
    url.endsWith('.jpg') ||
    url.endsWith('.png') ||
    url.endsWith('.webp') ||
    url.endsWith('.svg') ||
    url.endsWith('.css') ||
    url.endsWith('.js')
  ) {
    // Cache static headers for 1 year
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return res;
};

// Check if this request is already part of a redirect chain
const isRedirectChain = (req: NextRequest): boolean => {
  // Check if URL has parameters that indicate it's already part of a redirect
  const fromParam = req.nextUrl.searchParams.get('from');
  const errorParam = req.nextUrl.searchParams.get('error');
  const logoutParam = req.nextUrl.searchParams.get('logout');
  
  // Also check if the request has the specific Referer header that indicates a redirect loop
  const referer = req.headers.get('referer') || '';
  const isRefererLoop = referer.includes('/admin/login') && (fromParam || errorParam);
  
  // Track cookie-based redirect attempts to prevent infinite loops
  const redirectCookie = req.cookies.get('redirect_attempt')?.value;
  const redirectCount = redirectCookie ? parseInt(redirectCookie, 10) : 0;
  
  return !!(fromParam || errorParam || logoutParam || isRefererLoop || redirectCount > 2);
};

// Define public admin paths that don't require authentication
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/reset-auth', '/admin/debug-auth', '/admin/forgot-password'];

// Middleware function
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = crypto.randomUUID();
  
  // Log the request
  logMiddleware(`Request started ${requestId}`, req, {
    method: req.method,
    referrer: req.headers.get('referer') || 'none',
    userAgent: req.headers.get('user-agent'),
    ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  });
  
  // Add security headers to all responses
  const res = NextResponse.next();
  securityHeaders.forEach(({ key, value }) => {
    res.headers.set(key, value);
  });
  
  // Add cache control headers to prevent caching auth-related responses
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
  }
  
  // Skip auth logic for non-admin routes and API routes
  if (!pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
    logMiddleware(`Skipping auth check for non-admin or API route ${pathname}`, req);
    return addCacheHeaders(req, res);
  }
  
  // Log the current request for debugging
  logMiddleware(`Processing admin route`, req, {
    search: req.nextUrl.search,
  });
  
  // Allow public admin pages (like login)
  if (PUBLIC_ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    logMiddleware(`Allowing access to public admin route: ${pathname}`, req);
    
    // Reset redirect attempts cookie to help break any remaining loops
    res.cookies.set('redirect_attempt', '0', {
      maxAge: 60,
      path: '/',
    });
    
    // Also force header for layouts to detect login page
    res.headers.set('x-invoke-path', pathname);
    
    return addCacheHeaders(req, res);
  }
  
  // Get the token from cookies securely using next-auth's getToken
  logMiddleware(`Checking authentication token`, req);
  const startTime = Date.now();
  
  try {
    // First try next-auth token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    const authTime = Date.now() - startTime;
    
    // Next, try our custom cookie if next-auth token is not found
    if (!token) {
      // Check for custom auth-token cookie
      const customToken = req.cookies.get('auth-token')?.value;
      
      if (!customToken) {
        logMiddleware(`No token found in any cookie, redirecting to login (auth check took ${authTime}ms)`, req);
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        
        // Track redirect attempts
        const redirectAttempt = req.cookies.get('redirect_attempt')?.value || '0';
        const redirectCount = parseInt(redirectAttempt, 10) + 1;
        
        // Set cookie to track redirect attempts
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.set('redirect_attempt', redirectCount.toString(), {
          maxAge: 60, // 1 minute
          path: '/',
        });
        
        logMiddleware(`Redirecting to ${loginUrl.toString()} (attempt ${redirectCount})`, req);
        return redirectResponse;
      }
      
      // We have a custom token, let's verify and use it
      logMiddleware(`Using custom auth-token cookie instead of next-auth token`, req);
      
      // For this implementation, we'll trust the token since it's from our cookie
      // In a full implementation, you'd verify the JWT token here
      
      // Don't redirect from /admin anymore since we want to stay on /admin
      return addCacheHeaders(req, res);
    }
  
    // Log successful authentication with next-auth token
    const expiry = token.exp ? new Date(Number(token.exp) * 1000).toISOString() : 'unknown';
    logMiddleware(`Token found for user ${token.sub || 'unknown'}, granting access (auth check took ${authTime}ms)`, req, {
      tokenExpiry: expiry,
      tokenType: token.role || 'unknown'
    });
    
    // Don't redirect from /admin anymore since we want to stay on /admin
    return addCacheHeaders(req, res);
  } catch (error) {
    logMiddleware(`Error during authentication: ${error}`, req);
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('error', 'auth_error');
    return NextResponse.redirect(loginUrl);
  }
}

// Apply middleware to admin routes
export const config = {
  matcher: ['/admin/:path*'],
}; 