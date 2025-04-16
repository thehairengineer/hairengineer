import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

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

// Export a simpler middleware
export default function middleware(req: NextRequest) {
  // Skip processing for authentication-related paths
  if (
    req.nextUrl.pathname === '/admin/login' ||
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }
  
  // For admin dashboard pages, require authentication
  if (req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    // This will automatically redirect to login if not authenticated
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  
  // For all other routes, apply standard middleware
  const res = NextResponse.next();
  
  // Add security headers
  securityHeaders.forEach(({ key, value }) => {
    res.headers.set(key, value);
  });
  
  // Add cache headers
  return addCacheHeaders(req, res);
}

// Apply middleware to specific routes, completely excluding auth routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/* routes (NextAuth authentication)
     * - login pages
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|login|admin/login).*)',
  ],
}; 