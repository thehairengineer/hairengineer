'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResetButton, setShowResetButton] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if there's an error parameter
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'auth_failed') {
        setError('Authentication failed. Please try again.')
      } else {
        setError('An error occurred. Please try again.')
      }
    }
  }, [searchParams])

  // Redirect if already authenticated through the API
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Don't check auth if we're explicitly resetting or have just logged out
    const isResettingAuth = 
      urlParams.has('reset') || 
      urlParams.has('logout') || 
      urlParams.has('error');
    
    // Log what we're doing
    console.log('Login page initial check:', { 
      isResettingAuth, 
      hasParams: urlParams.toString() !== '',
      url: window.location.href
    });
    
    // Skip auth check if explicitly resetting auth
    if (isResettingAuth) {
      console.log('Skipping auth check due to parameters:', urlParams.toString());
      return;
    }
    
    // Check authentication status through our API
    const checkAuthStatus = async () => {
      try {
        console.log('Checking auth status...');
        
        // Add a timeout to the fetch to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Auth check timeout - aborting');
          controller.abort();
        }, 3000);
        
        const response = await fetch('/api/auth/status', {
          headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log('Auth check returned non-OK response:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Auth status result:', data);
        
        if (response.ok && data.authenticated) {
          // Check for a loop by counting navigations in a short time period
          const lastNavTime = parseInt(localStorage.getItem('lastNavTime') || '0', 10);
          const navCount = parseInt(localStorage.getItem('navCount') || '0', 10);
          const now = Date.now();
          
          // If we've navigated too many times in a short period, reset auth to break the loop
          if (now - lastNavTime < 2000 && navCount > 2) {
            console.warn('Detected possible redirect loop, clearing session data');
            localStorage.removeItem('navCount');
            localStorage.removeItem('lastNavTime');
            // Force signout to break loop and add reset parameter to prevent immediate recheck
            window.location.href = '/admin/login?reset=true';
            return;
          }
          
          // Track navigation
          localStorage.setItem('lastNavTime', now.toString());
          localStorage.setItem('navCount', (navCount + 1).toString());
          
          // Continue with normal redirect with a slight delay to prevent flash
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 100);
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
      }
    };
    
    checkAuthStatus();
  }, [router]);

  // Add forced reset on login page first load
  useEffect(() => {
    // Clear cookie on first load if there's a loop detected
    if (document.referrer.includes('/admin/login')) {
      document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, []);

  // Clear any redirect counters on component mount
  useEffect(() => {
    // Clear the redirect attempt cookie to fix potential redirect loops
    document.cookie = 'redirect_attempt=0; Path=/; Max-Age=60';
    
    // Reset navigation tracking after 5 seconds of inactivity
    const timer = setTimeout(() => {
      localStorage.removeItem('navCount');
      localStorage.removeItem('lastNavTime');
    }, 5000);
    
    // Show reset button if page loads multiple times
    const pageLoads = parseInt(localStorage.getItem('pageLoads') || '0', 10);
    localStorage.setItem('pageLoads', (pageLoads + 1).toString());
    
    if (pageLoads > 2) {
      setShowResetButton(true);
    }
    
    // Reset page loads counter after 10 seconds
    const resetTimer = setTimeout(() => {
      localStorage.setItem('pageLoads', '0');
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(resetTimer);
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Only use our direct API endpoint for login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
        cache: 'no-store'
      });
      
      const data = await loginResponse.json();
      
      if (loginResponse.ok && data.success) {
        // Successful login via our API
        router.push(data.redirectTo || '/admin/dashboard');
        router.refresh();
      } else {
        // Login failed
        setError(data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/background.jpg"
          alt="Admin Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-['Noto_Serif_Display'] mb-2">ΗΔΙR ΞNΓIΝΣΣR</h1>
            <p className="text-gray-400">Admin Dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-300 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-3 bg-gray-900/50 border border-gray-800 rounded focus:outline-none focus:border-gray-700 text-white"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 bg-gray-900/50 border border-gray-800 rounded focus:outline-none focus:border-gray-700 text-white"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-['Noto_Serif_Display'] uppercase tracking-wider hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="text-center mt-6 flex flex-col gap-2">
            <a 
              href="/" 
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Back to Home
            </a>
            
            {/* Always show reset link but with low visibility */}
            <a 
              href="/admin/reset-auth" 
              className={`text-xs ${showResetButton ? 'text-red-400 hover:text-red-300' : 'text-gray-800 hover:text-gray-600'} transition-colors duration-200 mt-2`}
            >
              Reset Authentication
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 