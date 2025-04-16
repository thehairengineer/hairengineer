import { redirect } from 'next/navigation';
import { getUserFromToken } from '@/app/lib/jwt-auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Get user data from token
    const user = await getUserFromToken();
    
    // Redirect to login if not authenticated or not admin
    if (!user || user.role !== 'admin') {
      console.log('Dashboard layout: User not authenticated, redirecting to login');
      // Add a timestamp parameter to prevent caching of the redirect
      return redirect(`/admin/login?from=dashboard&t=${Date.now()}`);
    }
    
    // If we get here, user is authenticated so render the dashboard
    return (
      <div className="flex min-h-screen max-h-screen flex-col bg-gray-950 text-white overflow-hidden">
        {/* Main content */}
        <main className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Authentication error in dashboard layout:', error);
    return redirect(`/admin/login?error=auth_failed&t=${Date.now()}`);
  }
} 