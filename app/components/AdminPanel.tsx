'use client'

import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { X, Check, Download as DownloadIcon, Trash2, DollarSign, LogOut as LogOutIcon, Users, Settings, Star, Plus, Home, Database as DatabaseIcon, Clock, Edit, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, isWithinInterval, isSameDay, isAfter, isBefore } from 'date-fns'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, UsersIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { Skeleton } from "@/app/components/ui/skeleton";
import { formatAmount, formatDate } from '@/app/lib/utils';

// Lazy load components that aren't needed immediately
const HairStylesManager = lazy(() => import('./HairStylesManager'))
const MultiDatePicker = lazy(() => import('./MultiDatePicker'))
// Import modals from barrel file
const PaymentModal = lazy(() => import('./modals/PaymentModal'))
const PaymentHistoryModal = lazy(() => import('./modals/PaymentHistoryModal'))
const ClientDetailsModal = lazy(() => import('./modals/ClientDetailsModal'))

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

interface AvailableDate {
  _id: string
  date: string
  maxAppointments: number
  currentAppointments: number
}

type TabType = 'overview' | 'appointments' | 'dates' | 'styles' | 'settings'

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [newDate, setNewDate] = useState('')
  const [maxAppointments, setMaxAppointments] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [deletingDateId, setDeletingDateId] = useState<string | null>(null)
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null)
  const [addingDate, setAddingDate] = useState(false)
  const [showMultiDatePicker, setShowMultiDatePicker] = useState(false)
  const [maxAppointmentsPerDate, setMaxAppointmentsPerDate] = useState<number>(1)
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    paymentRequired: true,
    paymentTimeoutMinutes: 10,
    defaultAppointmentStatus: 'pending',
    defaultPrice: 2
  });
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [categorizedAppointments, setCategorizedAppointments] = useState<{
    today: Appointment[];
    upcoming: Appointment[];
    past: Appointment[];
  }>({
    today: [],
    upcoming: [],
    past: []
  });

  // Load data in a single effect to reduce effect calls
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAppointments(), 
          fetchAvailableDates(),
          fetchSystemSettings()
        ]);
      } catch (error) {
        // Error is handled in individual fetch functions
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchAppointments();
      fetchAvailableDates();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Update categorized appointments when appointments change
  useEffect(() => {
    setCategorizedAppointments(categorizeAppointments(appointments));
  }, [appointments]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Use memoized function to avoid recreating on each render
  const categorizeAppointments = useCallback((appointments: Appointment[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const today = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      today: appointments.filter(app => new Date(app.date).toDateString() === today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      upcoming: appointments.filter(app => new Date(app.date) >= tomorrow)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      past: appointments.filter(app => new Date(app.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
    };
  }, []);

  // API functions
  const fetchAppointments = async () => {
    try {
      setError(null);
      const response = await fetch('/api/appointments', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch appointments';
      setError(message);
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchAvailableDates = async () => {
    try {
      setError(null);
      const response = await fetch('/api/available-dates', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch available dates');
      const data = await response.json();
      setAvailableDates(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch available dates';
      setError(message);
      console.error('Failed to fetch available dates:', error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/system-settings', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemSettings({
          paymentRequired: data.paymentRequired ?? true,
          paymentTimeoutMinutes: data.paymentTimeoutMinutes ?? 10,
          defaultAppointmentStatus: data.defaultAppointmentStatus ?? 'pending',
          defaultPrice: data.defaultPrice ?? 2
        });
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  const updateSystemSettings = async (newSettings: Partial<typeof systemSettings>) => {
    try {
      setError(null)
      setUpdatingSettings(true)
      
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update system settings')
      }
      
      const data = await response.json()
      setSystemSettings(data.settings)
      setSuccess('System settings updated successfully')
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update system settings'
      setError(message)
      console.error('Failed to update system settings:', error)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const togglePaymentRequired = () => {
    updateSystemSettings({ 
      paymentRequired: !systemSettings.paymentRequired 
    })
  }

  const updatePaymentTimeout = (minutes: number) => {
    if (minutes < 1) minutes = 1
    if (minutes > 60) minutes = 60
    
    updateSystemSettings({ 
      paymentTimeoutMinutes: minutes 
    })
  }

  const updateDefaultStatus = (status: 'pending' | 'confirmed') => {
    updateSystemSettings({ 
      defaultAppointmentStatus: status 
    })
  }

  const updateDefaultPrice = (price: number) => {
    if (price < 0) return;
    setUpdatingSettings(true);
    updateSystemSettings({ defaultPrice: price });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setError(null)
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: id, status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update appointment status')
      await fetchAppointments()
      setSuccess('Appointment status updated successfully')
    router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update appointment status'
      setError(message)
      console.error('Failed to update appointment status:', error)
    }
  }

  const handleAddDate = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    setAddingDate(true);
    try {
      // Format dates for API
      const formattedDates = selectedDates.map(date => ({
        date: date.toISOString(),
        maxAppointments: maxAppointmentsPerDate
      }));

      // Send bulk request
      const response = await fetch('/api/available-dates/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dates: formattedDates }),
      });

      if (!response.ok) {
        throw new Error('Failed to add dates');
      }

      toast.success(`Successfully added ${selectedDates.length} date(s)`);
      setShowMultiDatePicker(false);
      setSelectedDates([]);
      fetchAvailableDates();
    } catch (error) {
      console.error('Error adding dates:', error);
      toast.error('Failed to add dates');
    } finally {
      setAddingDate(false);
    }
  };

  const handleRemoveDate = async (dateToRemove: AvailableDate) => {
    try {
      setError(null)
      setSuccess(null) // Clear previous success message
      setDeletingDateId(dateToRemove._id) // Set the deleting state
      
      const response = await fetch(`/api/available-dates?id=${dateToRemove._id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove available date')
      
      // Wait a moment for animation to complete
      setTimeout(async () => {
      const data = await response.json()
      // Update the state with the new dates list from the response
      if (data.dates) {
        setAvailableDates(data.dates)
      } else {
        // Fallback to fetching dates if response doesn't include them
        await fetchAvailableDates()
      }
        setSuccess(`Date removed successfully: ${format(new Date(dateToRemove.date), 'MMM d, yyyy')}`)
        setDeletingDateId(null) // Reset deleting state
      }, 300)
    } catch (error) {
      setDeletingDateId(null) // Reset deleting state on error
      const message = error instanceof Error ? error.message : 'Failed to remove available date'
      setError(message)
      console.error('Failed to remove available date:', error)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      setDeletingAppointmentId(id); // Set deleting state
      
      // Create a slight delay before actual deletion to allow animation to be noticed
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      await fetchAppointments();
      setSuccess('Appointment deleted successfully');
      setDeletingAppointmentId(null); // Reset deleting state
    } catch (error) {
      setDeletingAppointmentId(null); // Reset deleting state on error
      const message = error instanceof Error ? error.message : 'Failed to delete appointment';
      setError(message);
      console.error('Failed to delete appointment:', error);
    }
  };

  const formatServiceName = (serviceValue: string) => {
    const serviceMap: { [key: string]: string } = {
      // LOCS
      'soft-locs': 'Soft Locs',
      'faux-locs-small': 'Faux Locs Small',
      'faux-locs-medium': 'Faux Locs Medium',
      'faux-locs-large': 'Faux Locs Large',
      'faux-locs-jumbo': 'Faux Locs Jumbo',
      'invisible-locs-medium': 'Invisible Locs Medium',
      'invisible-locs-large': 'Invisible Locs Large',
      'butterfly-locs-medium': 'Butterfly Locs Medium',
      'butterfly-locs-large': 'Butterfly Locs Large',
      'goddess-locs-medium': 'Goddess Locs Medium',
      'goddess-locs-large': 'Goddess Locs Large',
      'boho-locs-medium': 'Boho Locs Medium',
      'boho-locs-large': 'Boho Locs Large',
      'ocean-locs-medium': 'Ocean Locs Medium',
      'ocean-locs-large': 'Ocean Locs Large',
      // TWIST
      'island-twist-small': 'Island Twist Small',
      'island-twist-medium': 'Island Twist Medium',
      'island-twist-large': 'Island Twist Large',
      'island-twist-jumbo': 'Island Twist Jumbo',
      'passion-twist-small': 'Passion Twist Small',
      'passion-twist-medium': 'Passion Twist Medium',
      'passion-twist-large': 'Passion Twist Large',
      'passion-twist-jumbo': 'Passion Twist Jumbo',
      // SEW IN
      'closure-sew-in': 'Closure Sew-in',
      'versatile-sew-in-full': 'Versatile Sew-in Full',
      'versatile-sew-in-middle': 'Versatile Sew-in Middle',
      'versatile-sew-in-side': 'Versatile Sew-in Side',
      'vixen-sew-in': 'Vixen Sew-in',
      // BRAIDS
      'knotless-braids-small': 'Knotless Braids Small',
      'knotless-braids-medium': 'Knotless Braids Medium',
      'knotless-braids-large': 'Knotless Braids Large',
      'knotless-braids-jumbo': 'Knotless Braids Jumbo',
      'boho-braids-small': 'Boho Braids Small',
      'boho-braids-medium': 'Boho Braids Medium',
      'boho-braids-large': 'Boho Braids Large',
      'boho-braids-jumbo': 'Boho Braids Jumbo',
      'goddess-braids-small': 'Goddess Braids Small',
      'goddess-braids-medium': 'Goddess Braids Medium',
      'goddess-braids-large': 'Goddess Braids Large',
      'goddess-braids-jumbo': 'Goddess Braids Jumbo',
      // CORNROWS
      'stitch-cornrows-all-back': 'Stitch Cornrows All Back',
      'stitch-cornrows-with-braid': 'Stitch Cornrows with Braid'
    }
    return serviceMap[serviceValue] || serviceValue.replace(/-/g, ' ');
  }

  const getPaymentStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'full':
        return 'text-green-600'
      case 'partial':
        return 'text-yellow-600'
      default:
        return 'text-red-600'
    }
  }

  const getPaymentStatusText = (status: string | undefined) => {
    switch (status) {
      case 'full':
        return 'Paid'
      case 'partial':
        return 'Partial'
      default:
        return 'Unpaid'
    }
  }

  const renderAppointmentTable = (appointments: Appointment[], title: string) => (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4 mb-4">
      <h3 className="text-lg font-['Noto_Serif_Display'] mb-3">{title} Appointments</h3>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr className="font-['Noto_Serif_Display'] text-pink-300">
              <th className="cell-sm">Date</th>
              <th className="cell-md">Client</th>
              <th className="cell-lg">Service</th>
              <th className="cell-md text-right">Actions</th>
              </tr>
            </thead>
          <tbody>
              {appointments.length === 0 ? (
                <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400 font-['Noto_Serif_Display'] italic">No appointments found</td>
                </tr>
              ) : (
              appointments.map(appointment => (
                <motion.tr 
                  key={appointment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: deletingAppointmentId === appointment._id ? 0.3 : 1,
                    y: 0,
                    x: deletingAppointmentId === appointment._id ? 50 : 0,
                    scale: deletingAppointmentId === appointment._id ? 0.95 : 1,
                    backgroundColor: deletingAppointmentId === appointment._id ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <td className="font-['Noto_Serif_Display']">{formatDate(appointment.date)}</td>
                  <td>
                    <div className="font-medium">{appointment.name}</div>
                    <div className="text-xs text-gray-400">{appointment.phone}</div>
                    </td>
                  <td className="font-['Noto_Serif_Display'] text-pink-200">{formatServiceName(appointment.service)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-300' 
                            : appointment.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        } border-none focus:ring-0`}
                        disabled={deletingAppointmentId === appointment._id}
                      >
                        <option value="pending" className="bg-black text-yellow-300">Pending</option>
                        <option value="confirmed" className="bg-black text-green-300">Confirmed</option>
                        <option value="cancelled" className="bg-black text-red-300">Cancelled</option>
                      </select>
                      
                        <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowClientDetails(true);
                        }}
                        className="p-1 rounded-full text-blue-400 hover:bg-blue-500/10"
                        title="View Details"
                        disabled={deletingAppointmentId === appointment._id}
                      >
                        <Users size={16} />
                        </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowPaymentModal(true);
                        }}
                        className="p-1 rounded-full text-green-400 hover:bg-green-500/10"
                        title="Update Payment"
                        disabled={deletingAppointmentId === appointment._id}
                      >
                        <DollarSign size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowPaymentHistory(true);
                        }}
                        className="p-1 rounded-full text-purple-400 hover:bg-purple-500/10"
                        title="Payment History"
                        disabled={deletingAppointmentId === appointment._id}
                      >
                        <History size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        className="p-1 rounded-full text-red-400 hover:bg-red-500/10"
                        title="Delete"
                        disabled={deletingAppointmentId === appointment._id}
                      >
                        {deletingAppointmentId === appointment._id ? (
                          <span className="px-2 animate-pulse text-xs">Deleting...</span>
                        ) : (
                        <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                    </td>
                </motion.tr>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  )

  const downloadCSV = () => {
    // Define CSV headers
    const headers = [
      'Name',
      'Phone',
      'WhatsApp',
      'Snapchat',
      'Service',
      'Hair Color',
      'Preferred Length',
      'Date',
      'Status',
      'Created At',
      'Updated At'
    ]

    // Convert appointments to CSV rows
    const csvRows = appointments.map(appointment => [
      appointment.name,
      appointment.phone,
      appointment.whatsapp,
      appointment.snapchat || '',
      formatServiceName(appointment.service),
      appointment.hairColor,
      appointment.preferredLength,
      new Date(appointment.date).toLocaleDateString(),
      appointment.status,
      appointment.createdAt ? new Date(appointment.createdAt).toLocaleString() : '',
      appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleString() : ''
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `hair-engineer-appointments-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePaymentUpdate = async (paymentData: {
    amount: number
    paymentMethod: string
    note?: string
    totalAmount?: number
    resetPayment?: boolean
  }) => {
    if (!selectedAppointment) {
      setError('No appointment selected')
      return
    }

    try {
      setError(null)
      setSuccess(null)

      if (paymentData.totalAmount && paymentData.totalAmount < 0) {
        setError('Total amount cannot be negative')
        return
      }

      if (paymentData.amount < 0) {
        setError('Payment amount cannot be negative')
        return
      }

      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: selectedAppointment._id,
          paymentUpdate: true,
          ...paymentData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment')
      }

      await fetchAppointments()
      setSuccess('Payment updated successfully')
      setShowPaymentModal(false)
      setSelectedAppointment(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update payment'
      setError(message)
      console.error('Failed to update payment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-y-auto pb-20 hide-scrollbar">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
          <div className="text-center py-4">
            <Skeleton className="h-8 w-48 mx-auto mb-2 bg-gray-800" />
            <Skeleton className="h-4 w-64 mx-auto mb-4 bg-gray-800" />
            <div className="flex flex-wrap justify-center gap-2 px-4">
              <Skeleton className="h-7 w-24 rounded-full bg-gray-800" />
              <Skeleton className="h-7 w-24 rounded-full bg-gray-800" />
              <Skeleton className="h-7 w-24 rounded-full bg-gray-800" />
              <Skeleton className="h-7 w-24 rounded-full bg-gray-800" />
            </div>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar border-t border-gray-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24 bg-gray-800 mx-1" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-gray-800" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg bg-gray-800 mb-4" />
          <Skeleton className="h-96 w-full rounded-lg bg-gray-800" />
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    { id: 'overview', label: 'Overview', icon: <Star className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Users className="w-4 h-4" /> },
    { id: 'dates', label: 'Available Dates', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'styles', label: 'Hair Styles', icon: <Settings className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const renderAvailableDatesTab = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-['Noto_Serif_Display']">Available Dates</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowMultiDatePicker(!showMultiDatePicker)}
            className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center space-x-1.5"
          >
            <CalendarIcon className="h-3 w-3" />
            <span>Add Dates</span>
          </button>
        </div>
      </div>

      {showMultiDatePicker && (
        <div className="mb-8 p-5 border border-gray-700 rounded-lg bg-black/60">
          <MultiDatePicker
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            maxAppointments={maxAppointmentsPerDate}
            setMaxAppointments={setMaxAppointmentsPerDate}
            handleSave={handleAddDate}
          />
        </div>
      )}

      {/* Available dates section with month grouping */}
      {availableDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarIcon className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-gray-400">No available dates found</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Dates" to add new available dates</p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar relative">
          {/* Scroll indicator */}
          <div className="absolute bottom-2 right-2 animate-bounce-slow opacity-75 text-gray-400 hidden md:block">
            <ChevronDownIcon className="h-4 w-4" />
          </div>
          {/* Group dates by month */}
          {Object.entries(
            availableDates.reduce((acc: Record<string, AvailableDate[]>, date) => {
              const monthYear = format(new Date(date.date), 'MMMM yyyy');
              if (!acc[monthYear]) acc[monthYear] = [];
              acc[monthYear].push(date);
              return acc;
            }, {})
          ).map(([monthYear, dates]) => (
            <div key={monthYear} className="mb-4">
              <h4 className="text-sm font-['Noto_Serif_Display'] text-pink-400 mb-2 pl-1 border-l-2 border-pink-500 sticky top-0 bg-black/80 backdrop-blur-sm py-1 z-10 rounded-sm">{monthYear}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dates.map(date => (
                  <motion.div
                    key={date._id}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ 
                      opacity: deletingDateId === date._id ? 0.3 : 1,
                      scale: deletingDateId === date._id ? 0.95 : 1,
                      backgroundColor: deletingDateId === date._id ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative bg-black/60 border border-gray-700 hover:border-gray-600 rounded-lg p-3 hover:bg-black/80 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-['Noto_Serif_Display'] text-white text-sm">{format(new Date(date.date), 'EEE, d, MMMM, yyyy')}</div>
                        <div className="flex mt-2 space-y-1 flex-col">
                          <div className="flex items-center text-xs text-gray-400">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            <span className={
                              date.currentAppointments >= date.maxAppointments 
                                ? "text-red-400"
                                : date.currentAppointments >= date.maxAppointments * 0.75
                                ? "text-yellow-400"
                                : "text-green-400"
                            }>
                              {date.maxAppointments - date.currentAppointments} of {date.maxAppointments} slots
                            </span>
                          </div>
                        </div>
                      </div>
            <button
                        onClick={() => handleRemoveDate(date)}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-1 rounded-full transition-colors"
                        disabled={deletingDateId === date._id}
                        title="Remove date"
                      >
                        {deletingDateId === date._id ? (
                          <span className="text-xs animate-pulse">...</span>
                        ) : (
                          <TrashIcon className="h-3 w-3" />
                        )}
            </button>
        </div>
                  </motion.div>
                ))}
      </div>
            </div>
          ))}
            </div>
          )}
    </div>
  )

  const renderSettingsTab = () => (
    <div className="bg-gradient-to-b from-gray-900 to-black shadow-md rounded-lg p-6 mt-4 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-white font-['Noto_Serif_Display']">System Settings</h3>
      
      <div className="space-y-6">
        {/* Payment Requirement Toggle */}
        <div className="flex justify-between items-center">
      <div>
            <h4 className="text-lg font-medium text-gray-200">Require Payment</h4>
            <p className="text-sm text-gray-400">
              {systemSettings.paymentRequired 
                ? "Customers must complete payment to book appointments" 
                : "Customers can book appointments without payment"}
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              name="payment-toggle"
              id="payment-toggle"
              checked={systemSettings.paymentRequired}
              onChange={togglePaymentRequired}
              disabled={updatingSettings}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="payment-toggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                systemSettings.paymentRequired ? 'bg-pink-500' : 'bg-gray-700'
              }`}
            ></label>
              </div>
        </div>
        
        {/* Default Price Setting */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-gray-200">Default Price</h4>
          <p className="text-sm text-gray-400">
            The default price to use when a service has no price specified
          </p>
          <div className="flex items-center space-x-3">
            <div className="relative">
                <input
                  type="number"
                min="0"
                step="0.01"
                value={systemSettings.defaultPrice}
                onChange={(e) => updateDefaultPrice(parseFloat(e.target.value))}
                disabled={updatingSettings}
                className="w-28 pl-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-white"
              />
              <span className="ml-2 text-gray-300">$</span>
            </div>
          </div>
        </div>
        
        {/* Payment Timeout Setting */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-gray-200">Payment Timeout</h4>
          <p className="text-sm text-gray-400">
            How long to wait for payment verification before timing out
          </p>
          <div className="flex items-center space-x-3">
            <input
              type="number"
                  min="1"
              max="60"
              value={systemSettings.paymentTimeoutMinutes}
              onChange={(e) => updatePaymentTimeout(parseInt(e.target.value, 10))}
              disabled={updatingSettings}
              className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-white"
            />
            <span className="text-gray-300">minutes</span>
              </div>
        </div>
        
        {/* Default Appointment Status */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-gray-200">Default Appointment Status</h4>
          <p className="text-sm text-gray-400">
            The default status for new appointments when payment is not required
          </p>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-pink-600 bg-gray-800 border-gray-700"
                checked={systemSettings.defaultAppointmentStatus === 'pending'}
                onChange={() => updateDefaultStatus('pending')}
                disabled={updatingSettings}
              />
              <span className="ml-2 text-gray-300">Pending</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-pink-600 bg-gray-800 border-gray-700"
                checked={systemSettings.defaultAppointmentStatus === 'confirmed'}
                onChange={() => updateDefaultStatus('confirmed')}
                disabled={updatingSettings}
              />
              <span className="ml-2 text-gray-300">Confirmed</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Add some CSS for the toggle switch */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ec4899;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #ec4899;
        }
        .toggle-label {
          transition: background-color 0.2s ease;
        }
      `}</style>
    </div>
  )

  return (
    <div className="min-h-screen w-full overflow-y-auto pb-20 hide-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="text-center py-4">
          <h1 className="text-2xl font-['Noto_Serif_Display'] text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-400 mb-4">
            Manage appointments and available dates
          </p>
          <div className="flex flex-wrap justify-center gap-2 px-4">
            <Link 
              href="/"
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-200 text-xs rounded-full hover:bg-blue-500/30 transition"
            >
              <Home size={14} />
              Home Page
            </Link>
              <button
              onClick={downloadCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/20 text-pink-200 text-xs rounded-full hover:bg-pink-500/30 transition"
              >
              <DownloadIcon size={14} />
              Export CSV
          </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full hover:bg-gray-700 transition"
            >
              <LogOutIcon size={14} />
              Sign Out
            </button>
          </div>
          </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar border-t border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccess(null); // Clear success message when switching tabs
              }}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-200
                ${activeTab === tab.id 
                  ? 'text-pink-500 border-b-2 border-pink-500' 
                  : 'text-gray-400 hover:text-pink-200 border-b-2 border-transparent'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
                      </div>
                      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 text-red-200 rounded-lg text-sm">
            {error}
                    </div>
      )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-green-900/30 border border-green-700/50 text-green-200 rounded-lg text-sm"
          >
            {success}
          </motion.div>
        )}
        
        {/* Wrap lazy-loaded components with Suspense for better loading experience */}
        <Suspense fallback={
          <div className="p-4 rounded-lg border border-gray-800 animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-800 rounded mb-4"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
          </div>
        }>
          {/* Tab content */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-3">
                  <h3 className="text-gray-400 text-xs font-['Noto_Serif_Display']">Today</h3>
                  <p className="text-xl text-white mt-1">{categorizedAppointments.today.length}</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-3">
                  <h3 className="text-gray-400 text-xs font-['Noto_Serif_Display']">Upcoming</h3>
                  <p className="text-xl text-white mt-1">{categorizedAppointments.upcoming.length}</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-3">
                  <h3 className="text-gray-400 text-xs font-['Noto_Serif_Display']">Past</h3>
                  <p className="text-xl text-white mt-1">{categorizedAppointments.past.length}</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-3">
                  <h3 className="text-gray-400 text-xs font-['Noto_Serif_Display']">Available</h3>
                  <p className="text-xl text-white mt-1">{availableDates.length}</p>
                </div>
              </div>

              {/* Upcoming Appointments (previously "Recent") */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                <h2 className="text-lg font-['Noto_Serif_Display'] text-white mb-3">Upcoming Appointments</h2>
                <div className="overflow-x-auto">
                  {renderAppointmentTable(categorizedAppointments.upcoming.slice(0, 3), '')}
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs */}
          {activeTab === 'appointments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                <div className="overflow-x-auto">
                  {renderAppointmentTable(categorizedAppointments.today, "Today's")}
                  {renderAppointmentTable(categorizedAppointments.upcoming, 'Upcoming')}
                  {renderAppointmentTable(categorizedAppointments.past, 'Past')}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'dates' && renderAvailableDatesTab()}

          {activeTab === 'styles' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <HairStylesManager />
            </motion.div>
          )}

          {activeTab === 'settings' && renderSettingsTab()}
        </Suspense>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {showPaymentModal && (
          <PaymentModal
            appointment={selectedAppointment}
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSubmit={handlePaymentUpdate}
            formatServiceName={formatServiceName}
          />
        )}
        
        {showPaymentHistory && (
          <PaymentHistoryModal
            appointment={selectedAppointment}
            isOpen={showPaymentHistory}
            onClose={() => {
              setShowPaymentHistory(false);
              setSelectedAppointment(null);
            }}
          />
        )}

        {/* Client Details Modal */}
        {showClientDetails && (
          <ClientDetailsModal
            appointment={selectedAppointment}
            isOpen={showClientDetails}
            onClose={() => setShowClientDetails(false)}
            formatServiceName={formatServiceName}
          />
        )}
      </Suspense>
    </div>
  )
}


