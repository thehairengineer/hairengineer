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
    // Cache static assets for 1 year
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return res;
};

// Middleware function
export default withAuth(
  function middleware(req: NextRequest) {
    // Get the response
    const res = NextResponse.next();
    
    // Add security headers
    securityHeaders.forEach(({ key, value }) => {
      res.headers.set(key, value);
    });
    
    // Add cache headers
    return addCacheHeaders(req, res);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow all requests regardless of auth status
        // The withAuth will still protect the routes in [...nextauth].ts
        return true;
      },
    },
  }
);

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
}; 