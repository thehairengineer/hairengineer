'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { signIn, useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Clear cookies on page load to break redirect loops
  useEffect(() => {
    const clearCookies = () => {
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=')
        if (name && name.includes('next-auth')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
        }
      })
    }
    
    // Clear cookies if we detect we might be in a redirect loop
    const currentTime = new Date().getTime()
    const lastVisit = parseInt(localStorage.getItem('lastLoginVisit') || '0')
    
    if (currentTime - lastVisit < 2000) {
      // We're visiting the login page too quickly - likely a redirect loop
      clearCookies()
      localStorage.removeItem('lastLoginVisit')
    } else {
      localStorage.setItem('lastLoginVisit', currentTime.toString())
    }
    
    // Always clear session on load
    signOut({ redirect: false })
  }, [])

  // Reset any stuck sessions on manual reset
  const handleReset = async () => {
    setIsResetting(true)
    
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=')
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
    })
    
    // Clear localStorage 
    localStorage.clear()
    
    // Sign out without redirect
    await signOut({ redirect: false })
    
    // Force reload the page after a delay
    setTimeout(() => {
      window.location.href = '/admin/login'
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Clear any existing sessions first
      await signOut({ redirect: false });
      
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
        setLoading(false)
      } else if (result?.ok) {
        // Redirect after successful login with window.location for a complete refresh
        window.location.href = '/admin/dashboard'
      } else {
        setError('Authentication failed')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.')
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

          {isResetting ? (
            <div className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 border-t-4 border-pink-500 border-solid rounded-full animate-spin mx-auto"></div>
              </div>
              <h2 className="text-xl text-white mb-2">Resetting Session</h2>
              <p className="text-gray-400 text-sm">Clearing cookies and session data...</p>
            </div>
          ) : (
            <>
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

              {/* Reset Session Button */}
              <div className="text-center mt-6">
                <a 
                  href="/" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 mr-4"
                >
                  Back to Home
                </a>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 underline"
                >
                  Reset Session
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
} 