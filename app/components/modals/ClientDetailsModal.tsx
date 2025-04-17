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

interface ClientDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  formatServiceName: (service: string) => string;
}

export default function ClientDetailsModal({ appointment, isOpen, onClose, formatServiceName }: ClientDetailsModalProps) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-black/90 backdrop-blur-lg p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-['Noto_Serif_Display']">Client Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800/50">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="space-y-2">
            <h3 className="text-pink-400 text-xs sm:text-sm uppercase tracking-wider font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 gap-3 bg-gray-900/50 p-3 sm:p-4 rounded-lg border border-gray-800">
              <div>
                <span className="text-gray-400 text-xs block">Name</span>
                <span className="text-white font-medium">{appointment.name}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Phone</span>
                <span className="text-white">{appointment.phone}</span>
              </div>
              {appointment.whatsapp && (
                <div>
                  <span className="text-gray-400 text-xs block">WhatsApp</span>
                  <span className="text-white">{appointment.whatsapp}</span>
                </div>
              )}
              {appointment.snapchat && (
                <div>
                  <span className="text-gray-400 text-xs block">Snapchat</span>
                  <span className="text-white">{appointment.snapchat}</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-2">
            <h3 className="text-pink-400 text-xs sm:text-sm uppercase tracking-wider font-medium">Appointment Details</h3>
            <div className="grid grid-cols-1 gap-3 bg-gray-900/50 p-3 sm:p-4 rounded-lg border border-gray-800">
              <div>
                <span className="text-gray-400 text-xs block">Service</span>
                <span className="text-white font-medium">{formatServiceName(appointment.service)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Date</span>
                <span className="text-white">{formatDate(appointment.date)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-500/20 text-green-300' 
                    : appointment.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-2">
            <h3 className="text-pink-400 text-xs sm:text-sm uppercase tracking-wider font-medium">Payment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-900/50 p-3 sm:p-4 rounded-lg border border-gray-800">
              <div>
                <span className="text-gray-400 text-xs block">Total Amount</span>
                <span className="text-white font-medium">GHS {formatAmount(appointment.totalAmount)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Amount Paid</span>
                <span className="text-white">GHS {formatAmount(appointment.amountPaid)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Balance</span>
                <span className={`font-medium ${
                  appointment.paymentStatus === 'full' 
                    ? 'text-green-400' 
                    : appointment.paymentStatus === 'partial'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  GHS {formatAmount((appointment.totalAmount || 0) - (appointment.amountPaid || 0))}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Payment Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  appointment.paymentStatus === 'full' 
                    ? 'bg-green-500/20 text-green-300' 
                    : appointment.paymentStatus === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {appointment.paymentStatus === 'full' 
                    ? 'Paid' 
                    : appointment.paymentStatus === 'partial'
                    ? 'Partial'
                    : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <h3 className="text-pink-400 text-xs sm:text-sm uppercase tracking-wider font-medium">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-900/50 p-3 sm:p-4 rounded-lg border border-gray-800">
              <div>
                <span className="text-gray-400 text-xs block">Hair Color</span>
                <div className="flex items-center mt-1">
                  <span 
                    className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2" 
                    style={{backgroundColor: appointment.hairColor || 'black'}}
                  ></span>
                  <span className="text-white">{appointment.hairColor || 'Not specified'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">Preferred Length</span>
                <span className="text-white">{appointment.preferredLength || 'Not specified'}</span>
              </div>
              {appointment.createdAt && (
                <div>
                  <span className="text-gray-400 text-xs block">Booked On</span>
                  <span className="text-white text-sm">{formatDate(appointment.createdAt)}</span>
                </div>
              )}
              {appointment.updatedAt && appointment.updatedAt !== appointment.createdAt && (
                <div>
                  <span className="text-gray-400 text-xs block">Last Updated</span>
                  <span className="text-white text-sm">{formatDate(appointment.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition flex items-center gap-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 