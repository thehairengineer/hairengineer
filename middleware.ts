import { NextResponse, NextRequest } from 'next/server';
import { getUserFromToken } from '@/app/lib/jwt-auth';

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

// Middleware function
export default async function middleware(req: NextRequest) {
  // Create the initial response
  const res = NextResponse.next();
  
  // Add security headers
  securityHeaders.forEach(({ key, value }) => {
    res.headers.set(key, value);
  });
  
  // Add cache control headers to prevent caching auth-related responses
  if (req.nextUrl.pathname.startsWith('/admin') || 
      req.nextUrl.pathname.startsWith('/api/auth')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
  }
  
  // Skip auth logic for non-admin routes and API routes
  if (!req.nextUrl.pathname.startsWith('/admin') || 
      req.nextUrl.pathname.startsWith('/api/')) {
    return addCacheHeaders(req, res);
  }
  
  // Log the current request for debugging
  console.log('Middleware handling:', {
    url: req.nextUrl.pathname,
    search: req.nextUrl.search,
    referer: req.headers.get('referer') || 'none'
  });
  
  // List of paths that should NEVER be redirected
  const noAuthPaths = [
    '/admin/login',
    '/admin/reset-auth',
    '/admin/debug-auth'
  ];
  
  // ALWAYS allow access to these paths without any redirects
  if (noAuthPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    console.log('Allowing access to auth-exempt path:', req.nextUrl.pathname);
    
    // Reset redirect attempts cookie to help break any remaining loops
    res.cookies.set('redirect_attempt', '0', {
      maxAge: 60,
      path: '/',
    });
    
    // Also force header for layouts to detect login page
    res.headers.set('x-invoke-path', req.nextUrl.pathname);
    
    return addCacheHeaders(req, res);
  }
  
  // For other admin routes (not in noAuthPaths), check auth
  // Try to get user from JWT token
  const user = await getUserFromToken(req);
  
  // If not authenticated or not admin, redirect to login
  if (!user || user.role !== 'admin') {
    console.log('Middleware: User not authenticated, redirecting to login');
    // Add timestamp to prevent caching
    const url = new URL(`/admin/login?from=middleware&t=${Date.now()}`, req.url);
    return NextResponse.redirect(url);
  }
  
  // Add cache headers for static assets
  return addCacheHeaders(req, res);
}

// Apply middleware to specific routes, completely excluding auth routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|admin/login).*)',
  ],
}; 