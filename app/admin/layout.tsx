import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserFromToken } from '@/app/lib/jwt-auth'

// Split layout into two components: one for login and one for dashboard
// This ensures we don't even try to authenticate on the login page

// Create a separate component specifically for the login page
function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// And a component for dashboard pages that requires authentication
async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await getUserFromToken();
    
    if (!user || user.role !== 'admin') {
      console.log('Layout: User not authenticated, redirecting to login');
      redirect('/admin/login');
    }
    
    return <>{children}</>;
  } catch (error) {
    console.error('Auth error in layout:', error);
    redirect('/admin/login?error=auth_error');
  }
}

// Main layout that routes between the two
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get headers to try to determine the current path
  const headersList = headers();
  
  // In Next.js App Router, we can get the current path from various headers
  const requestUrl = headersList.get('x-invoke-path') || headersList.get('x-matched-path') || '';
  console.log('Path detection headers:', { 
    'x-invoke-path': headersList.get('x-invoke-path'),
    'x-matched-path': headersList.get('x-matched-path'),
    'x-url': headersList.get('x-url'),
    'x-pathname': headersList.get('x-pathname')
  });
  
  // Determine if this is the login or reset page
  const isLoginOrResetPage = 
    requestUrl.includes('/login') || 
    requestUrl.includes('/reset-auth');
  
  console.log('Path check:', { requestUrl, isLoginOrResetPage });
    
  // For login/reset pages, skip auth check completely
  if (isLoginOrResetPage) {
    console.log('On login/reset page - skipping auth check');
    return <>{children}</>;
  }
  
  // For all other admin routes, verify the user is authenticated
  try {
    console.log('Performing auth check for protected route');
    
    // Get user from token
    const user = await getUserFromToken();
    
    console.log('Auth result:', { 
      authenticated: !!user, 
      role: user?.role || 'none',
      user: user?.sub || 'none'
    });
    
    // Check if user is authenticated and has admin role
    if (!user || user.role !== 'admin') {
      console.log('Auth failed - redirecting to login');
      
      // Add a timestamp to prevent redirect caching
      return redirect(`/admin/login?from=layout&t=${Date.now()}`);
    }
    
    // User is authenticated and has admin role
    return <>{children}</>;
  } catch (error) {
    console.error('Auth error in layout:', error);
    
    // Add a timestamp to prevent redirect caching
    return redirect(`/admin/login?error=auth_error&t=${Date.now()}`);
  }
} 