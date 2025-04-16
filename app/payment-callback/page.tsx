'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center my-6">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
  </div>
)

function PaymentCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Get the reference from the URL query parameters
    const reference = searchParams.get('reference')
    
    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference was found. Please contact support.')
      return
    }
    
    // Verify the payment with our backend
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reference })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setMessage('Your payment was successful! Your appointment has been confirmed.')
        } else {
          setStatus('failed')
          setMessage(data.message || 'Payment verification failed. Please contact support.')
        }
      })
      .catch(error => {
        console.error('Error verifying payment:', error)
        setStatus('failed')
        setMessage('An error occurred while verifying your payment. Please contact support.')
      })
  }, [searchParams])
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/background.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-['Noto_Serif_Display'] mb-2">Payment {status === 'loading' ? 'Processing' : status === 'success' ? 'Successful' : 'Failed'}</h1>
            <p className="text-gray-400">{message}</p>
          </div>
          
          {status === 'loading' && (
            <LoadingSpinner />
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center my-6">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-300 text-center mb-4">
                We have sent a confirmation message to your WhatsApp number. Please save this for reference.
              </p>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="flex flex-col items-center my-6">
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-gray-300 text-center mb-4">
                If you believe this is an error, please contact us via WhatsApp or phone.
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Link href="/" className="w-full py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-center font-['Noto_Serif_Display'] uppercase tracking-wider hover:from-gray-600 hover:to-gray-800 rounded">
              Return to Home
            </Link>
            
            <a href="https://wa.me/message/Z6BZWWQ3Q5FKG1" className="w-full py-2 bg-green-900 text-white text-center font-['Noto_Serif_Display'] uppercase tracking-wider hover:bg-green-800 rounded">
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the main component with Suspense boundary
export default function PaymentCallback() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentCallbackContent />
    </Suspense>
  )
} 