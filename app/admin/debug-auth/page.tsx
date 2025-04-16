import { cookies } from 'next/headers';
import { getUserFromToken } from '@/app/lib/jwt-auth';
import Link from 'next/link';

export default async function DebugAuthPage() {
  // Get all cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  // Try to get user from token
  let user = null;
  let authError = null;
  
  try {
    user = await getUserFromToken();
  } catch (error) {
    authError = String(error);
  }
  
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Authentication Status</h2>
        <div className="bg-gray-800 p-4 rounded">
          <p>Is Authenticated: <span className={user ? "text-green-400" : "text-red-400"}>{user ? "YES" : "NO"}</span></p>
          {user && (
            <div className="mt-2">
              <p>Username: {user.sub}</p>
              <p>Role: {user.role}</p>
              <p>Token Expires: {new Date(user.exp * 1000).toLocaleString()}</p>
            </div>
          )}
          {authError && (
            <div className="mt-2 text-red-400">
              <p>Error: {authError}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Cookies ({allCookies.length})</h2>
        <div className="bg-gray-800 p-4 rounded">
          {allCookies.length === 0 ? (
            <p className="text-yellow-400">No cookies found</p>
          ) : (
            <ul className="space-y-2">
              {allCookies.map((cookie, index) => (
                <li key={index} className="border-b border-gray-700 pb-2">
                  <p><strong>Name:</strong> {cookie.name}</p>
                  <p><strong>Value:</strong> {cookie.value.substring(0, 40)}{cookie.value.length > 40 ? '...' : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Link href="/admin/login" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Go to Login
        </Link>
        <Link href="/admin/reset-auth" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
          Reset Auth
        </Link>
        <Link href="/admin/dashboard" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
} 