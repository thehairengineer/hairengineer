'use client'

import { X } from 'lucide-react'
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

interface PaymentHistoryModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
}

export default function PaymentHistoryModal({ appointment, isOpen, onClose }: PaymentHistoryModalProps) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-black/90 backdrop-blur-lg p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-serif mb-4">Payment History</h2>
        {appointment.paymentHistory && appointment.paymentHistory.length > 0 ? (
          <div className="space-y-4 scroll-container-md">
            {appointment.paymentHistory.map((payment, index) => (
              <div key={index} className="bg-gray-900/80 p-3 rounded border border-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">Amount:</span>
                  <span className="text-white font-medium">${formatAmount(payment.amount)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">Date:</span>
                  <span className="text-white">{formatDate(payment.date)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">Method:</span>
                  <span className="text-white capitalize">{payment.method}</span>
                </div>
                {payment.note && (
                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <span className="text-gray-400 text-sm block mb-1">Note:</span>
                    <p className="text-white text-sm">{payment.note}</p>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
              <span className="text-gray-300">Total Paid:</span>
              <span className="text-white font-medium">GHS {formatAmount(appointment.amountPaid)}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No payment history available.</p>
        )}
        <button 
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
} 