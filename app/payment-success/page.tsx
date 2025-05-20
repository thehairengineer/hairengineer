'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
  </div>
)

// Define PaymentDetails interface
interface PaymentDetails {
  reference?: string;
  email?: string;
  amount?: number;
  status?: string;
  [key: string]: any; // For other properties that might be present
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({})
  
  // Create refs to track verification status and prevent duplicate API calls
  const verificationAttemptedRef = useRef(false)
  const isRetryingRef = useRef(false)

  // Function to send window message to parent when verification completes
  const sendVerificationMessage = (success: boolean, reference: string) => {
    try {
      // Send message to parent window (if in iframe or opened from another window)
      if (window.opener) {
        window.opener.postMessage(
          { 
            type: 'PAYMENT_SUCCESS',
            success,
            reference
          }, 
          '*'
        )
        console.log('Sent message to opener window')
      } else {
        console.log('No opener window found')
      }
    } catch (e) {
      console.error('Error sending message to parent window:', e)
    }
  }

  // Function to verify payment
  const verifyPayment = async (reference: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      })

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Verification response:', data)

      if (data.success) {
        setPaymentVerified(true)
        setPaymentDetails(data.data || {})
        
        // Send message to parent window
        sendVerificationMessage(true, reference)
        
        // Auto close after 5 seconds (if opened as popup)
        setTimeout(() => {
          if (window.opener) {
            window.close()
          }
        }, 5000)
      } else if (data.data && data.data.status === 'pending') {
        // Payment still pending
        setError('Payment is still being processed. Please wait...')
        
        // Retry after a delay if within retry limit
        if (retryCount < 3) {
          // Set retrying flag before scheduling the retry
          isRetryingRef.current = true
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 3000)
        } else {
          setError('Payment verification timed out. If you completed payment, your booking will be confirmed shortly.')
          setIsLoading(false)
        }
      } else {
        setError(data.message || 'Payment verification failed')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setError((error as Error).message || 'Failed to verify payment')
      setIsLoading(false)
    }
  }

  // Verify payment when reference changes or on retry
  useEffect(() => {
    // Prevent verification if no reference exists
    if (!reference) {
      setError('No payment reference provided')
      setIsLoading(false)
      return;
    }
    
    // Initial load: Check if this is the first verification attempt
    if (!verificationAttemptedRef.current) {
      // Mark as attempted to prevent duplicate calls on re-renders
      verificationAttemptedRef.current = true;
      verifyPayment(reference);
    } 
    // Handle retries: Only verify again if retryCount changed and we're actually retrying
    else if (isRetryingRef.current) {
      // Reset the retrying flag since we're handling this retry now
      isRetryingRef.current = false;
      verifyPayment(reference);
    }
    
    // Cleanup function
    return () => {
      // No cleanup needed, but included for completeness
    };
    
    // Only depend on reference and retryCount, verifyPayment is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, retryCount]);

  if (isLoading && !paymentVerified) {
    return (
      <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-md w-full p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-xl border border-gray-800">
          <h1 className="text-2xl font-medium text-center mb-6 font-['Noto_Serif_Display']">Verifying Payment</h1>
          <LoadingSpinner />
          <p className="text-center text-gray-400">Please wait while we confirm your payment...</p>
          {error && <p className="text-amber-400 text-center mt-4">{error}</p>}
        </div>
      </div>
    )
  }

  if (error && !paymentVerified) {
    return (
      <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-md w-full p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-xl border border-gray-800">
          <div className="text-center mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-medium font-['Noto_Serif_Display']">Payment Verification Failed</h1>
          </div>
          <p className="text-center text-red-400 mb-6">{error}</p>
          <div className="flex justify-center">
            <a 
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Payment verified successfully
  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-md w-full p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-xl border border-gray-800">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-medium font-['Noto_Serif_Display']">Payment Successful!</h1>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md mb-6">
          <p className="text-gray-300 text-center text-sm mb-4">
            Your payment has been confirmed and your appointment is now booked.
          </p>
          
          <div className="text-sm border-t border-gray-700 pt-4 mt-4">
            <p>Reference: {reference}</p>
            {paymentDetails && paymentDetails.amount && (
              <p>Amount: ${paymentDetails.amount}</p>
            )}
            <p className="mt-2 text-xs italic">This window will close automatically in a few seconds.</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <a 
            href="/"
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}

// Export the main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentSuccessContent />
    </Suspense>
  )
} 