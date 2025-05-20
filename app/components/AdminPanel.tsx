'use client'

import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { X, Check, Download as DownloadIcon, Trash2, DollarSign, LogOut as LogOutIcon, Users, Settings, Star, Plus, Home, Database as DatabaseIcon, Clock, Edit, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, isWithinInterval, isSameDay, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
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

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        // Redirect to login page
        window.location.href = '/admin/login?logout=true';
      } else {
        console.error('Failed to logout');
        toast.error('Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

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

  const updateSystemSettings = async () => {
    if (updatingSettings) return;
    
    try {
      setUpdatingSettings(true);
      setError(null);
      
      // Create a clean copy of the system settings without any potential circular references
      const settingsToUpdate = {
        paymentRequired: systemSettings.paymentRequired,
        paymentTimeoutMinutes: systemSettings.paymentTimeoutMinutes,
        defaultAppointmentStatus: systemSettings.defaultAppointmentStatus,
        defaultPrice: systemSettings.defaultPrice
      };
      
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsToUpdate)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update system settings');
      }
      
      const data = await response.json();
      setSystemSettings(data.settings || settingsToUpdate);
      setSuccess('System settings updated successfully');
      
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setUpdatingSettings(false);
    }
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

  const renderAppointmentTable = useCallback((appointments: Appointment[], title: string) => {
    return (
      <div className="bg-black border border-pink-500/20 rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="px-4 py-3 bg-black/60 border-b border-pink-500/20">
          <h3 className="font-['Noto_Serif_Display'] text-lg font-semibold text-pink-300">{title} ({appointments.length})</h3>
        </div>
        
        <div className="table-fixed-height custom-scrollbar">
          <table className="min-w-full divide-y divide-pink-500/10 table-sticky-header table-zebra table-hover">
            <thead className="bg-black sticky top-0 z-10">
              <tr className="font-['Noto_Serif_Display'] text-pink-300 text-sm">
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Client</th>
                <th className="py-2 px-3 text-left hidden sm:table-cell">Service</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-500/10">
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
                    transition={{ duration: 0.2 }}
                    className="hover:bg-pink-500/5"
                  >
                    <td className="py-2 px-3 text-sm">
                      {format(new Date(appointment.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">{appointment.name}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[150px]">
                          {appointment.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[120px] sm:max-w-[200px]">
                          {formatServiceName(appointment.service)}
                        </span>
                        <span className={`text-xs ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                          {getPaymentStatusText(appointment.paymentStatus)}
                          {appointment.paymentStatus === 'partial' && ` (${formatAmount(appointment.amountPaid)} / ${formatAmount(appointment.totalAmount)})`}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                            setShowPaymentModal(true);
                        }}
                          className="p-1 text-pink-300 hover:text-pink-100 hover:bg-pink-900/30 rounded"
                          title="Update Payment"
                      >
                          <DollarSign size={16} />
                        </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                            setShowPaymentHistory(true);
                        }}
                          className="p-1 text-blue-300 hover:text-blue-100 hover:bg-blue-900/30 rounded"
                          title="View Payment History"
                      >
                          <History size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                            setShowClientDetails(true);
                        }}
                          className="p-1 text-green-300 hover:text-green-100 hover:bg-green-900/30 rounded"
                          title="View Client Details"
                      >
                          <Users size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment._id)}
                          className="p-1 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded"
                          title="Delete Appointment"
                      >
                        <Trash2 size={16} />
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
  }, [deletingAppointmentId]);

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

  // Fix the addAvailableDate function
  const addAvailableDate = async () => {
    if (!newDate) {
      setError('Please select a date');
      return;
    }

    try {
      setError(null);
      setAddingDate(true);
      
      const response = await fetch('/api/available-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: newDate,
          maxAppointments
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add date');
      }

      await fetchAvailableDates();
      setNewDate('');
      setMaxAppointments(1);
      setAddingDate(false);
      setSuccess('Date added successfully');
    } catch (error) {
      console.error('Error adding date:', error);
      setError(error instanceof Error ? error.message : 'Failed to add date');
      setAddingDate(false);
    }
  };

  // Fix method for deleting dates
  const handleDeleteDate = async (dateId: string) => {
    if (!dateId) return;
    
    try {
      setDeletingDateId(dateId);
      setError(null);
      
      const response = await fetch(`/api/available-dates?id=${dateId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete date');
      }
      
      await fetchAvailableDates();
      setSuccess('Date deleted successfully');
    } catch (error) {
      console.error('Error deleting date:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete date');
    } finally {
      setDeletingDateId(null);
    }
  };

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

  const renderTabs = () => {
    return (
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex flex-wrap gap-1 sm:gap-2 bg-black border border-pink-500/20 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === 'overview' 
                ? 'bg-pink-500/20 text-pink-300' 
                : 'hover:bg-pink-500/10 text-gray-300 hover:text-pink-200'
            }`}
          >
            <Home size={16} className="mr-1.5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === 'appointments' 
                ? 'bg-pink-500/20 text-pink-300' 
                : 'hover:bg-pink-500/10 text-gray-300 hover:text-pink-200'
            }`}
          >
            <Clock size={16} className="mr-1.5" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === 'dates' 
                ? 'bg-pink-500/20 text-pink-300' 
                : 'hover:bg-pink-500/10 text-gray-300 hover:text-pink-200'
            }`}
          >
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            Available Dates
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === 'styles' 
                ? 'bg-pink-500/20 text-pink-300' 
                : 'hover:bg-pink-500/10 text-gray-300 hover:text-pink-200'
            }`}
          >
            <Star size={16} className="mr-1.5" />
            Hair Styles
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === 'settings' 
                ? 'bg-pink-500/20 text-pink-300' 
                : 'hover:bg-pink-500/10 text-gray-300 hover:text-pink-200'
            }`}
          >
            <Settings size={16} className="mr-1.5" />
            Settings
          </button>
        </div>
        
        {/* Logout button */}
          <button
          onClick={handleLogout}
          className="flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-black border border-pink-500/20 hover:bg-pink-500/10 text-pink-300 transition-all duration-200"
        >
          <LogOutIcon size={16} className="mr-1.5" />
          Logout
        </button>
      </div>
    );
  };

  const renderAvailableDatesTab = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-pink-300">Available Dates</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowMultiDatePicker(true)}
              className="flex items-center px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-md text-sm shadow-sm"
            >
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              Add Multiple Dates
            </button>
            <button
              onClick={() => setAddingDate(!addingDate)}
              className="flex items-center px-3 py-1.5 bg-black border border-pink-500/40 hover:bg-pink-500/10 text-pink-300 rounded-md text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add Single Date
          </button>
        </div>
      </div>

        {addingDate && (
          <div className="p-4 mb-4 border border-pink-500/20 rounded-lg bg-black">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium mb-1 text-gray-300">Select Date</label>
                <DatePicker
                  selected={newDate ? new Date(newDate) : null}
                  onChange={(date: Date) => setNewDate(date.toISOString())}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  className="px-3 py-2 bg-black border border-pink-500/20 rounded-md w-full text-sm"
                  placeholderText="Select date..."
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium mb-1 text-gray-300">Max Appointments</label>
                <input
                  type="number"
                  min="1"
                  value={maxAppointments}
                  onChange={(e) => setMaxAppointments(parseInt(e.target.value) || 1)}
                  className="px-3 py-2 bg-black border border-pink-500/20 rounded-md w-full text-sm"
                />
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={addAvailableDate}
                  disabled={!newDate}
                  className="px-3 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-500/50 text-white rounded-md text-sm flex-1"
                >
                  Add Date
                </button>
                <button
                  onClick={() => setAddingDate(false)}
                  className="px-3 py-2 bg-black border border-pink-500/20 hover:bg-pink-500/10 text-pink-300 rounded-md text-sm flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
        </div>
      )}

        <div className="bg-black border border-pink-500/20 rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-black/60 border-b border-pink-500/20">
            <h3 className="font-['Noto_Serif_Display'] text-lg font-semibold text-pink-300">Available Dates ({availableDates.length})</h3>
        </div>
          
          <div className="table-fixed-height custom-scrollbar">
            <table className="min-w-full divide-y divide-pink-500/10 table-sticky-header table-zebra table-hover">
              <thead className="bg-black sticky top-0 z-10">
                <tr className="font-['Noto_Serif_Display'] text-pink-300 text-sm">
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-center">Appointments</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-500/10">
                {availableDates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 font-['Noto_Serif_Display'] italic">
                      No available dates set. Add some dates to allow appointments.
                    </td>
                  </tr>
                ) : (
                  availableDates.map(date => (
                    <motion.tr 
                    key={date._id}
                      initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: deletingDateId === date._id ? 0.3 : 1,
                        y: 0,
                        x: deletingDateId === date._id ? 50 : 0,
                      backgroundColor: deletingDateId === date._id ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                    }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-pink-500/5"
                    >
                      <td className="py-3 px-3">
                        {format(new Date(date.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-16 rounded-full text-xs px-1.5 py-0.5 ${date.currentAppointments >= date.maxAppointments ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
                          {date.currentAppointments} / {date.maxAppointments}
                            </span>
                      </td>
                      <td className="py-3 px-3 text-right">
            <button
                          onClick={() => handleDeleteDate(date._id)}
                        disabled={deletingDateId === date._id}
                          className="p-1 text-red-300 hover:text-red-200 hover:bg-red-900/30 rounded disabled:opacity-50"
                          title="Delete Date"
                        >
                          <Trash2 size={16} />
            </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      </div>
            </div>
    );
  }

  const renderSettingsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-bold text-pink-300 mb-4">System Settings</h2>
        
        <div className="bg-black border border-pink-500/20 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
              <h3 className="text-lg font-semibold mb-3 text-pink-200">Payment Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
            <input
              type="checkbox"
                    id="paymentRequired"
              checked={systemSettings.paymentRequired}
                    onChange={(e) => {
                      setSystemSettings({
                        ...systemSettings,
                        paymentRequired: e.target.checked
                      });
                    }}
                    className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-600 rounded"
                  />
                  <label htmlFor="paymentRequired" className="ml-2 text-sm text-gray-300">
                    Require payment to book appointment
                  </label>
        </div>
        
                <div>
                  <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-300 mb-1">
                    Default Deposit Amount (GHC)
                  </label>
                <input
                  type="number"
                    id="defaultPrice"
                min="0"
                    step="1"
                value={systemSettings.defaultPrice}
                    onChange={(e) => {
                      setSystemSettings({
                        ...systemSettings,
                        defaultPrice: Math.max(0, parseInt(e.target.value) || 0)
                      });
                    }}
                    className="px-3 py-2 bg-black border border-pink-500/20 rounded-md w-32 text-sm"
                  />
        </div>
        
                <div>
                  <label htmlFor="paymentTimeout" className="block text-sm font-medium text-gray-300 mb-1">
                    Payment Timeout (minutes)
                  </label>
            <input
              type="number"
                    id="paymentTimeout"
                  min="1"
              max="60"
              value={systemSettings.paymentTimeoutMinutes}
                    onChange={(e) => {
                      setSystemSettings({
                        ...systemSettings,
                        paymentTimeoutMinutes: Math.max(1, parseInt(e.target.value) || 10)
                      });
                    }}
                    className="px-3 py-2 bg-black border border-pink-500/20 rounded-md w-32 text-sm"
                  />
                </div>
              </div>
        </div>
        
            <div>
              <h3 className="text-lg font-semibold mb-3 text-pink-200">Appointment Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="defaultStatus" className="block text-sm font-medium text-gray-300 mb-1">
                    Default Appointment Status
            </label>
                  <select
                    id="defaultStatus"
                    value={systemSettings.defaultAppointmentStatus}
                    onChange={(e) => {
                      setSystemSettings({
                        ...systemSettings,
                        defaultAppointmentStatus: e.target.value
                      });
                    }}
                    className="px-3 py-2 bg-black border border-pink-500/20 rounded-md w-full text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
          </div>
        </div>
      </div>
    </div>
          
          <div className="flex justify-end">
              <button
              onClick={updateSystemSettings}
              disabled={updatingSettings}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                updatingSettings
                  ? 'bg-pink-400 cursor-not-allowed'
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white transition-colors duration-200`}
            >
              {updatingSettings ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>Save Settings</>
              )}
            </button>
          </div>
          </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto pb-20 hide-scrollbar">
      {/* Top navigation bar with tabs and logout button */}
      <div className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-pink-500/20 px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto hide-scrollbar">
            {renderTabs()}
          </div>
                      </div>
                      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        {/* Status Messages */}
        <AnimatePresence>
        {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded-md"
            >
            {error}
            </motion.div>
      )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-green-500/20 border border-green-500/40 text-green-200 rounded-md"
          >
            {success}
          </motion.div>
        )}
        </AnimatePresence>

          {/* Tab content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Different content based on active tab */}
          {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-pink-500/20 p-4 hover:border-pink-500/40 transition-colors duration-200">
                      <div className="font-['Noto_Serif_Display'] text-pink-300 text-sm mb-1">Today</div>
                      <div className="text-xl font-bold">{categorizedAppointments.today.length}</div>
                </div>
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-pink-500/20 p-4 hover:border-pink-500/40 transition-colors duration-200">
                      <div className="font-['Noto_Serif_Display'] text-pink-300 text-sm mb-1">Upcoming</div>
                      <div className="text-xl font-bold">{categorizedAppointments.upcoming.length}</div>
                </div>
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-pink-500/20 p-4 hover:border-pink-500/40 transition-colors duration-200">
                      <div className="font-['Noto_Serif_Display'] text-pink-300 text-sm mb-1">Available Dates</div>
                      <div className="text-xl font-bold">{availableDates.length}</div>
                </div>
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-pink-500/20 p-4 hover:border-pink-500/40 transition-colors duration-200">
                      <div className="font-['Noto_Serif_Display'] text-pink-300 text-sm mb-1">Total Clients</div>
                      <div className="text-xl font-bold">{appointments.length}</div>
                </div>
              </div>

                    {/* Appointment Tables */}
                    {renderAppointmentTable(categorizedAppointments.today, "Today's")}
                    {renderAppointmentTable(categorizedAppointments.upcoming, "Upcoming")}
                </div>
          )}

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
          </>
        )}
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


