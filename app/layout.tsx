'use client'

import './globals.css'
import { Montserrat } from 'next/font/google'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPressed, setIsLongPressed] = useState(false)

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setIsLongPressed(true)
      // Go through reset-auth to clear any cookies first
      router.push('/admin/reset-auth')
    }, 3000) // 3 second long press for admin
    setPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
    setIsLongPressed(false)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer)
      }
    }
  }, [pressTimer])

  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Herr+Von+Muellerhoff&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="font-montserrat bg-black text-white flex items-center justify-center min-h-screen overflow-x-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            },
          }}
        />
        <div className="w-full max-w-screen-lg mx-auto h-screen overflow-y-auto relative flex flex-col items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  )
}

