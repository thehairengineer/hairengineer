'use client';

import { useEffect, useState } from 'react';

export default function ResetAuth() {
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    // Clear ALL cookies on client side
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    
    // Clear localStorage too
    localStorage.clear();
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect with clean params
          window.location.href = '/admin/login?reset=complete';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-bold mb-4">Resetting Authentication</h1>
      <p className="mb-8">Clearing all authentication data...</p>
      <div className="text-2xl">Redirecting in {countdown} seconds</div>
    </div>
  );
} 