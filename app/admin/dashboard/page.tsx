import { Suspense } from 'react';
import AdminPanel from '@/app/components/AdminPanel';
import { cookies } from 'next/headers';

export default function AdminDashboard() {
  // Get auth status from cookies (this is server-side)
  const cookieStore = cookies();
  const hasAuthToken = cookieStore.has('auth-token');
  const hasNextAuthToken = cookieStore.has('next-auth.session-token');

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-pink-300 font-['Noto_Serif_Display']">Admin Dashboard</h1>
        
        {/* Authentication Debug Info */}
        <div className="bg-black p-3 sm:p-4 mb-4 sm:mb-8 rounded border border-pink-500/20 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-pink-200 font-['Noto_Serif_Display']">Auth Status</h2>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="text-gray-300">Auth Token Present:</div>
            <div className={hasAuthToken ? "text-green-400" : "text-red-400"}>
              {hasAuthToken ? "Yes" : "No"}
            </div>
            <div className="text-gray-300">NextAuth Token Present:</div>
            <div className={hasNextAuthToken ? "text-green-400" : "text-red-400"}>
              {hasNextAuthToken ? "Yes" : "No"}
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="w-full">
            <Suspense fallback={
              <div className="text-center py-8 bg-black rounded-lg border border-pink-500/20 animate-pulse">
                <div className="text-pink-300">Loading admin panel...</div>
              </div>
            }>
              <AdminPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 