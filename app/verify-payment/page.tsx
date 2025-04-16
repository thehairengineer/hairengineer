'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PaymentResult {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
  verification?: {
    status?: string;
    reference?: string;
    amount?: number;
    [key: string]: unknown;
  };
}

export default function VerifyPaymentTest() {
  const [reference, setReference] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedReferences, setSavedReferences] = useState<string[]>([])
  
  // Load any saved references from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('payment_references')
      if (saved) {
        setSavedReferences(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Error loading saved references:', err)
    }
  }, [])
  
  const saveReference = (ref: string) => {
    if (!ref || savedReferences.includes(ref)) return
    
    const newSavedRefs = [...savedReferences, ref]
    setSavedReferences(newSavedRefs)
    
    try {
      localStorage.setItem('payment_references', JSON.stringify(newSavedRefs))
    } catch (err) {
      console.error('Error saving reference:', err)
    }
  }
  
  const removeReference = (ref: string) => {
    const newSavedRefs = savedReferences.filter(r => r !== ref)
    setSavedReferences(newSavedRefs)
    
    try {
      localStorage.setItem('payment_references', JSON.stringify(newSavedRefs))
    } catch (err) {
      console.error('Error removing reference:', err)
    }
  }
  
  const handleVerifyPayment = async () => {
    if (!reference) {
      setError('Please enter a reference')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Save this reference for future use
      saveReference(reference)
      
      // Verify the payment
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference
        })
      })
      
      const verifyData = await verifyResponse.json()
      setResult(verifyData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center text-pink-400">Verify Payment Tool</h1>
        <p className="text-gray-400 mb-6 text-sm">
          This page lets you verify a payment reference from the Paystack checkout process.
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Reference</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="Enter Paystack reference"
              />
              <button
                onClick={handleVerifyPayment}
                disabled={isProcessing || !reference}
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition disabled:opacity-50"
              >
                {isProcessing ? '...' : 'Verify'}
              </button>
            </div>
          </div>
          
          {savedReferences.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Saved References</label>
              <div className="flex flex-wrap gap-2">
                {savedReferences.map((ref) => (
                  <div 
                    key={ref} 
                    className="flex items-center bg-gray-800 px-2 py-1 rounded border border-gray-700"
                  >
                    <button
                      onClick={() => setReference(ref)}
                      className="text-xs text-blue-400 hover:text-blue-300 mr-2"
                    >
                      {ref.substring(0, 12)}...
                    </button>
                    <button
                      onClick={() => removeReference(ref)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {result && (
          <div className="bg-gray-800 p-4 rounded border border-gray-700 overflow-auto">
            <h3 className="text-lg font-semibold mb-2 text-green-400">Verification Result:</h3>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to Home
          </Link>
          <Link href="/payment-test" className="text-blue-400 hover:text-blue-300 text-sm">
            Test Payment Page
          </Link>
        </div>
      </div>
    </div>
  )
} 