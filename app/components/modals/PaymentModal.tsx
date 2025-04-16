'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { formatAmount, formatDate } from '@/app/lib/utils'

interface Appointment {
  _id: string
  name: string
  snapchat: string
  whatsapp: string
  service: string
  date: string
  status: string
  phone: string
  preferredLength: string
  hairColor: string
  totalAmount: number
  amountPaid: number
  paymentStatus: 'unpaid' | 'partial' | 'full'
  paymentHistory: Array<{
    amount: number
    date: string
    method: string
    note?: string
  }>
  createdAt?: string
  updatedAt?: string
}

interface PaymentModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    amount: number
    paymentMethod: string
    note?: string
    totalAmount?: number
    resetPayment?: boolean
  }) => void
  formatServiceName: (service: string) => string
}

export default function PaymentModal({ appointment, isOpen, onClose, onSubmit, formatServiceName }: PaymentModalProps) {
  const [amount, setAmount] = useState<string>('0')
  const [totalAmount, setTotalAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [note, setNote] = useState<string>('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    if (appointment) {
      setTotalAmount(appointment.totalAmount ? appointment.totalAmount.toString() : '')
      setAmount('0')
      setPaymentMethod('cash')
      setNote('')
      setShowResetConfirm(false)
      setModalError(null)
    }
  }, [appointment])

  if (!isOpen || !appointment) return null

  const remainingBalance = (appointment.totalAmount || 0) - (appointment.amountPaid || 0)
  const currentAmount = parseFloat(amount || '0')
  const isFullPayment = currentAmount === remainingBalance

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setModalError(null)
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setModalError(null)
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setTotalAmount(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    try {
      const parsedAmount = parseFloat(amount || '0')
      const parsedTotalAmount = totalAmount ? parseFloat(totalAmount) : appointment.totalAmount

      if (parsedTotalAmount < 0) {
        setModalError('Total amount cannot be negative')
        return
      }

      if (parsedAmount < 0) {
        setModalError('Payment amount cannot be negative')
        return
      }

      onSubmit({
        amount: parsedAmount,
        paymentMethod,
        note,
        totalAmount: parsedTotalAmount
      })
    } catch (error) {
      setModalError('Invalid input values')
      console.error('Error in payment submission:', error)
    }
  }

  const handleResetPayment = () => {
    try {
      onSubmit({
        amount: 0,
        paymentMethod: 'reset',
        note: 'Payment history reset',
        totalAmount: appointment.totalAmount,
        resetPayment: true
      })
    } catch (error) {
      setModalError('Failed to reset payment history')
      console.error('Error in payment reset:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-lg border border-gray-700 shadow-xl max-w-md w-full mx-4 text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium font-['Noto_Serif_Display']">Update Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {modalError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 text-red-200 rounded-lg text-sm">
            {modalError}
          </div>
        )}

        {showResetConfirm ? (
          <div className="space-y-4">
            <p className="text-red-400 font-medium">Are you sure you want to reset all payment history for {appointment.name}?</p>
            <p className="text-gray-300">This will:</p>
            <ul className="list-disc list-inside text-gray-300 ml-2">
              <li>Clear all payment history</li>
              <li>Set amount paid to 0</li>
              <li>Reset payment status to unpaid</li>
            </ul>
            <p className="text-gray-300">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPayment}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Client:</span>
                  <p className="font-medium text-white">{appointment.name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Service:</span>
                  <p className="font-medium text-white">{formatServiceName(appointment.service)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Total Amount:</span>
                  <p className="font-medium text-white">GHS {formatAmount(appointment.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Amount Paid:</span>
                  <p className="font-medium text-white">GHS {formatAmount(appointment.amountPaid)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Remaining Balance:</span>
                  <p className="font-medium text-lg text-pink-300">GHS {formatAmount(remainingBalance)}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Update Total Cost (if needed)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={totalAmount}
                    onChange={handleTotalAmountChange}
                    className="w-full pl-3 pr-3 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-white"
                    placeholder="Enter new total amount in GHS"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Current total: GHS {formatAmount(appointment.totalAmount)}</p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Payment Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full pl-3 pr-3 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-white"
                    placeholder="Enter payment amount in GHS"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAmount(remainingBalance.toString())}
                    className="text-xs px-2 py-1 bg-pink-900/30 text-pink-200 rounded hover:bg-pink-800/40 transition"
                  >
                    Full Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('0')}
                    className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-white"
                >
                  <option value="cash" className="bg-gray-800 text-white">Cash</option>
                  <option value="mobile_money" className="bg-gray-800 text-white">Mobile Money</option>
                  <option value="bank_transfer" className="bg-gray-800 text-white">Bank Transfer</option>
                  <option value="card" className="bg-gray-800 text-white">Card Payment</option>
                  <option value="other" className="bg-gray-800 text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-white"
                  placeholder="Add payment note"
                  rows={3}
                ></textarea>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-sm text-red-400 hover:text-red-300 underline"
                >
                  Reset Payment
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
                  >
                    {isFullPayment ? 'Complete Payment' : 'Add Payment'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
} 