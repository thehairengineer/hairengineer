'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PaymentResult {
  success?: boolean;
  message?: string;
  data?: any;
  verification?: any;
}

export default function PaymentTest() {
  const [reference, setReference] = useState(`TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`)
  const [amount, setAmount] = useState<number>(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [createAppointment, setCreateAppointment] = useState(false)
  
  const handleSimulatePayment = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Prepare data for the test payment
      const requestData: any = {
        reference,
        amount
      }
      
      // If creating a test appointment, add appointment data
      if (createAppointment) {
        // Include all required fields for a valid appointment
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        requestData.appointmentData = {
          name: "Test User",
          phone: "0551234567",
          whatsapp: "0551234567",
          service: "locs-faux-locs-medium",
          hairColor: "black",
          preferredLength: "shoulder",
          date: tomorrow.toISOString(),
          status: "pending",
          totalAmount: amount,
          amountPaid: 0,
          paymentStatus: "unpaid"
        }
      }
      
      // Simulate a successful payment
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      setResult(data)
      
      // Now verify the payment
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
      setResult((prev: PaymentResult | null) => prev ? { ...prev, verification: verifyData } : null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center text-pink-400">Mobile Money Test Tool</h1>
        <p className="text-gray-400 mb-6 text-sm">
          This page lets you test mobile money payments without using real money. It simulates the payment process and verification.
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="createAppointment"
              checked={createAppointment}
              onChange={(e) => setCreateAppointment(e.target.checked)}
              className="h-4 w-4 bg-gray-800 border-gray-700 rounded mr-2"
            />
            <label htmlFor="createAppointment" className="text-sm font-medium text-gray-400">
              Create test appointment with this payment
            </label>
          </div>
          
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Simulate Successful Payment'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {result && (
          <div className="bg-gray-800 p-4 rounded border border-gray-700 overflow-auto">
            <h3 className="text-lg font-semibold mb-2 text-green-400">Result:</h3>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to Home
          </Link>
          <button
            onClick={() => {
              setReference(`TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`)
              setResult(null)
              setError(null)
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
} 