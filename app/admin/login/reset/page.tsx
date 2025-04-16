'use client'

import { useEffect } from 'react'

export default function ResetPage() {
  useEffect(() => {
    // Clear cookies for this domain
    const cookies = document.cookie.split(';')
    
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=')
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
    })
    
    // Clear localStorage
    localStorage.clear()
    
    // Redirect to login page after 3 seconds
    setTimeout(() => {
      window.location.href = '/admin/login'
    }, 3000)
  }, [])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
      <h1 className="text-2xl mb-4">Session Reset in Progress</h1>
      <p className="mb-6">Clearing all cookies and session data...</p>
      <div className="w-16 h-16 border-t-4 border-pink-500 border-solid rounded-full animate-spin"></div>
      <p className="mt-6 text-gray-400">You will be redirected to the login page in a few seconds.</p>
    </div>
  )
} 