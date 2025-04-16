'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call the logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control to prevent caching issues
        cache: 'no-store',
      });
      
      if (response.ok) {
        // Force clear client-side as well
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        
        // Add a delay to ensure cookie is processed
        setTimeout(() => {
          // Redirect to login page with clean URL
          router.push('/admin/login?logout=true');
          router.refresh();
        }, 100);
      } else {
        console.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm disabled:opacity-50"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
} 