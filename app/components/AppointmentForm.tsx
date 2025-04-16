'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { X, Star, ChevronDown, Calendar, Clock, User, Phone, Scissors, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface AppointmentFormData {
  name: string
  snapchat: string
  whatsapp: string
  service: string
  date: Date | null
  serviceCategory: string
  phone: string
  preferredLength: string
  hairColor: string
  paystackReference?: string // For Paystack payment reference
  time?: string // Add time property to fix error
}

interface AvailableDate {
  _id: string
  date: string
}

interface ServiceCategory {
  _id: string
  name: string
  description: string
  isActive: boolean
  order: number
}

interface HairStyle {
  _id: string
  category: string
  name: string
  value: string
  isActive: boolean
  description?: string // Add description property
  price?: number // Add price property
}

interface ServiceOption {
  value: string
  label: string
  price?: number
}

interface CategoryOption {
  value: string
  label: string
}

interface GroupedHairStyles {
  [categoryId: string]: ServiceOption[]
}

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  paymentRequired: boolean
  appointmentStatus: string
}

// Add Paystack interface
interface PaystackConfig {
  reference: string
  email: string
  amount: number // amount in kobo (smallest currency unit)
  publicKey: string
  firstname: string
  phone: string
  label: string
  metadata: any
  onSuccess: (reference: string) => void
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void
      }
    }
  }
}

interface PaymentConfirmationProps {
  formData: AppointmentFormData;
  selectedService: HairStyle | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function PaymentConfirmation({ formData, selectedService, onConfirm, onCancel }: PaymentConfirmationProps) {
  if (!selectedService) return null;
  
  const formattedDate = formData.date ? format(formData.date, 'EEEE, MMMM d, yyyy') : 'Not selected';
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-lg border border-gray-700 shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-white font-['Noto_Serif_Display']">Payment Confirmation</h3>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md">
            <h4 className="text-gray-300 font-medium mb-2">Appointment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <Calendar className="text-gray-400 mr-2 h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-white">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-gray-400 mr-2 h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-white">{formData.time || 'Not selected'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="text-gray-400 mr-2 h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-white">{formData.name}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="text-gray-400 mr-2 h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-white">{formData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Scissors className="text-gray-400 mr-2 h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-white">{selectedService.name}</p>
                  <p className="text-gray-400 text-xs">{selectedService.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md">
            <h4 className="text-gray-300 font-medium mb-2">Payment Details</h4>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Service Fee:</span>
              <span className="text-white">${selectedService.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-300">Total Amount:</span>
              <span className="text-white">${selectedService.price?.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>By proceeding with payment, you agree to our terms and cancellation policy.</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition flex items-center justify-center"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Proceed to Payment
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 rounded-md text-gray-300 font-medium border border-gray-700 hover:bg-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ isOpen, onClose, paymentRequired, appointmentStatus }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-lg border border-gray-700 shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out scale-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2 font-['Noto_Serif_Display']">
            {paymentRequired ? 'Payment Successful!' : 'Appointment Booked!'}
          </h3>
          <div className="mt-2">
            {paymentRequired ? (
              <>
                <p className="text-gray-300 mb-4">
                  Your appointment has been booked and payment has been received. We'll be in touch via WhatsApp with further details.
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Make sure to save this confirmation. You'll receive a confirmation message shortly.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-4">
                  Your appointment has been successfully booked. 
                  {appointmentStatus === 'confirmed' 
                    ? ' Your slot is confirmed!'
                    : ' We will review and confirm your appointment soon.'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  We'll be in touch via WhatsApp with further details. No payment was required for this booking.
                </p>
              </>
            )}
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={onClose}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentForm() {
  const [formData, setFormData] = useState<AppointmentFormData>({
    name: '',
    snapchat: '',
    whatsapp: '',
    service: '',
    date: null,
    serviceCategory: '',
    phone: '',
    preferredLength: '',
    hairColor: 'black'
  })
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const availableDatesSet = useMemo(() => {
    return new Set(availableDates.map(date => date.getTime()))
  }, [availableDates])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [serviceCategories, setServiceCategories] = useState<CategoryOption[]>([])
  const [hairStylesByCategory, setHairStylesByCategory] = useState<GroupedHairStyles>({})
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [servicePrice, setServicePrice] = useState(2) // Default service price in GHS
  const [systemSettings, setSystemSettings] = useState({
    paymentRequired: true,
    paymentTimeoutMinutes: 10,
    defaultAppointmentStatus: 'pending',
    defaultPrice: 2
  })
  const [appointmentStatus, setAppointmentStatus] = useState('pending')

  const isDateAvailable = useCallback((date: Date) => {
    return availableDatesSet.has(date.getTime())
  }, [availableDatesSet])

  const renderDayContents = useCallback((day: number, date: Date) => {
    const isAvailable = isDateAvailable(date)
    
    return (
      <div className="relative flex items-center justify-center">
        <span>{day}</span>
        {isAvailable && (
          <div className="absolute -top-1.5 right-0 text-yellow-400">
            <Star size={10} fill="currentColor" />
          </div>
        )}
      </div>
    )
  }, [isDateAvailable])

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const [categoriesResponse, stylesResponse, datesResponse, settingsResponse] = await Promise.all([
          fetch('/api/service-categories'),
          fetch('/api/hair-styles'),
          fetch('/api/available-dates'),
          fetch('/api/system-settings')
        ])

        if (!mounted) return

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSystemSettings({
            paymentRequired: settingsData.paymentRequired ?? true,
            paymentTimeoutMinutes: settingsData.paymentTimeoutMinutes ?? 10,
            defaultAppointmentStatus: settingsData.defaultAppointmentStatus ?? 'pending',
            defaultPrice: settingsData.defaultPrice ?? 2
          });
          // Update the default service price based on system settings
          setServicePrice(settingsData.defaultPrice ?? 2);
        }

        if (categoriesResponse.ok && stylesResponse.ok) {
          const categoriesData: ServiceCategory[] = await categoriesResponse.json()
          const stylesData: HairStyle[] = await stylesResponse.json()
          
          console.log('Categories data:', categoriesData)
          console.log('Hair styles data:', stylesData)
          
          // Format categories for dropdown
          const formattedCategories = categoriesData
            .filter(category => category.isActive)
            .sort((a, b) => a.order - b.order)
            .map(category => ({
              value: category.name, // Use category name as value since hair styles reference it by name
              label: category.name
            }))
          
          setServiceCategories(formattedCategories)
          
          // Group hair styles by category name (not by ID)
          const groupedStyles: GroupedHairStyles = {}
          
          stylesData.forEach(style => {
            if (style.isActive) {
              if (!groupedStyles[style.category]) {
                groupedStyles[style.category] = []
              }
              
              groupedStyles[style.category].push({
                value: style.value,
                label: style.name,
                price: style.price
              })
            }
          })
          
          console.log('Grouped styles:', groupedStyles)
          setHairStylesByCategory(groupedStyles)
        }

        if (datesResponse.ok) {
          const datesData = await datesResponse.json()
          const dates = datesData.map((item: AvailableDate) => new Date(item.date))
          setAvailableDates(dates)
          
          // Check if there are any available slots
          setNoSlotsAvailable(dates.length === 0)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
        setError('Failed to load appointment data. Please refresh the page or try again later.')
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  const validatePhoneNumber = (phone: string) => {
    return phone.length >= 10
  }

  // Function to initialize Paystack payment
  const initializePayment = useCallback(() => {
    if (!formData.name || !formData.phone || !formData.whatsapp || 
        !formData.service || !formData.date || !formData.preferredLength) {
      setError('Please fill in all required fields')
      return
    }
    
    if (!validatePhoneNumber(formData.phone)) {
      setPhoneError('Please enter a valid phone number')
      return
    }
    
    setIsProcessingPayment(true)
    
    // Find the selected hair style to get details
    const selectedCategory = formData.serviceCategory;
    const styles = hairStylesByCategory[selectedCategory] || [];
    const selectedStyleValue = formData.service;
    const selectedStyle = styles.find(style => style.value === selectedStyleValue);
    
    // Get the service price (use selectedStyle.price if available, otherwise use default)
    const priceToCharge = (selectedStyle?.price !== undefined && selectedStyle?.price !== null) 
      ? selectedStyle.price 
      : servicePrice;
    
    console.log('Selected service:', selectedStyle);
    console.log('Price to charge:', priceToCharge);
    
    // Use our server-side endpoint to initialize payment
    fetch('/api/initialize-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `${formData.phone}@bookings.hair-engineer.com`, // Use a generated email if client doesn't provide one
        amount: priceToCharge,
        name: formData.name,
        phone: formData.phone,
        serviceId: selectedStyleValue, // Sending the value, not the MongoDB ID
        metadata: {
          service: formData.service,
          serviceCategory: formData.serviceCategory,
          date: formData.date?.toISOString(),
          preferredLength: formData.preferredLength,
          snapchat: formData.snapchat,
          whatsapp: formData.whatsapp,
          hairColor: formData.hairColor || 'black',
          currency: 'GHS',
          price: priceToCharge
        }
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(`Failed to initialize payment: ${errorData.error || errorData.details || 'Unknown error'}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Payment initialization successful:', data);
      
      // Store the reference for later
      setFormData(prev => ({...prev, paystackReference: data.data.reference}));
      
      // Open Paystack checkout in new tab
      const paymentWindow = window.open(data.data.authorization_url, '_blank');
      
      // Calculate timeout based on system settings
      const timeoutMs = systemSettings.paymentTimeoutMinutes * 60 * 1000;
      
      // Show processing status
      setError(null);
      setIsProcessingPayment(true);
      
      // Check payment status after a short delay to give user time to complete payment
      const checkInterval = setInterval(() => {
        fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reference: data.data.reference
          })
        })
        .then(response => {
          // First check if the response is OK
          if (!response.ok) {
            // Log the status code and statusText
            console.error(`Payment verification HTTP error: ${response.status} - ${response.statusText}`);
            return response.json().then(errData => {
              throw new Error(`Payment verification failed: ${errData.error || errData.details || response.statusText}`);
            });
          }
          return response.json();
        })
        .then(verifyData => {
          console.log('Payment verification check:', verifyData);
          
          if (verifyData.success) {
            // Payment successful
            clearInterval(checkInterval);
            setIsProcessingPayment(false);
            
            // Set appointment status for the success modal
            setAppointmentStatus('confirmed');
            
            // Show success modal
            setSubmitStatus('success');
            setShowSuccessModal(true);
            
            // Clear form data for a new booking
            setFormData({
              name: '',
              snapchat: '',
              whatsapp: '',
              service: '',
              date: null,
              serviceCategory: '',
              phone: '',
              preferredLength: '',
              hairColor: 'black'
            });
          } else if (verifyData.data && verifyData.data.status === 'pending') {
            // Payment still pending, continue waiting
            console.log('Payment still pending, checking again soon...');
            setError('Payment is being processed. Please wait...');
          } else if (verifyData.error === 'Appointment not found') {
            console.error('Appointment not found with reference:', data.data.reference);
            // This is unexpected, handle as an error
            clearInterval(checkInterval);
            setIsProcessingPayment(false);
            setError(`Payment verification issue: System couldn't find your booking. Please contact support with reference: ${data.data.reference}`);
          } else {
            // Payment failed or there was some other issue
            console.error('Payment verification failed:', verifyData);
            setError(`Payment status: ${verifyData.message || 'Verification in progress...'}`);
          }
        })
        .catch(error => {
          console.error('Error checking payment status:', error);
          setError(`Payment verification error: ${error.message}. Please contact support with reference: ${data.data.reference}`);
        });
      }, 5000); // Check every 5 seconds
      
      // Set timeout to stop checking after the configured timeout period
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsProcessingPayment(false);
        setError(`Payment verification unsuccessful after ${systemSettings.paymentTimeoutMinutes} minutes. Your payment may still be processing. Please contact support with reference: ${data.data.reference}`);
      }, timeoutMs);
    })
    .catch(error => {
      console.error('Payment initialization error:', error);
      setError(`Payment gateway error: ${error.message}`);
      setIsProcessingPayment(false);
    });
  }, [formData, servicePrice, hairStylesByCategory, systemSettings.paymentTimeoutMinutes, validatePhoneNumber]);
  
  // Function to submit the form after successful payment
  const submitFormWithPayment = async (reference: string, paymentNote: string = '') => {
    setSubmitStatus('loading')
    
    try {
      // Find the selected hair style to get details
      const selectedCategory = formData.serviceCategory;
      const styles = hairStylesByCategory[selectedCategory] || [];
      const selectedStyleValue = formData.service;
      const selectedStyle = styles.find(style => style.value === selectedStyleValue);
      
      // Get the actual price from the selected service
      const actualPrice = (selectedStyle?.price !== undefined && selectedStyle?.price !== null)
        ? selectedStyle.price
        : servicePrice;
      
      // Create payment history entry
      const paymentHistoryEntry = {
        amount: actualPrice,
        date: new Date().toISOString(),
        method: 'Paystack',
        reference: reference,
        note: paymentNote || 'Online payment via Paystack'
      };
      
      // Prepare data for submission with payment reference and defaults
      const submissionData = {
        ...formData,
        paystackReference: reference,
        hairColor: formData.hairColor || 'black',
        totalAmount: actualPrice,
        amountPaid: actualPrice, // Mark as fully paid
        paymentStatus: 'full',
        status: 'confirmed', // Set status to confirmed when payment is successful
        paymentHistory: [paymentHistoryEntry] // Add payment history
      }
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      // Clear the form on successful submission
      setFormData({
        name: '',
        snapchat: '',
        whatsapp: '',
        service: '',
        date: null,
        serviceCategory: '',
        phone: '',
        preferredLength: '',
        hairColor: 'black'
      })
      
      // Update appointment status for modal
      setAppointmentStatus('confirmed')
      
      setSubmitStatus('success')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error creating appointment:', error)
      setSubmitStatus('error')
      setError(error instanceof Error ? error.message : 'Failed to create your appointment. Please try again.')
    }
  }

  // Function to handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.whatsapp || 
        !formData.service || !formData.date || !formData.preferredLength) {
      setError('Please fill in all required fields')
      return
    }

    if (!validatePhoneNumber(formData.phone)) {
      setPhoneError('Please enter a valid phone number')
      return
    }
    
    // Check if payment is required
    if (systemSettings.paymentRequired) {
      // Start the payment process
      initializePayment()
    } else {
      // If payment is not required, submit the form directly with confirmed status
      submitFormWithoutPayment()
    }
  }, [formData, systemSettings.paymentRequired, validatePhoneNumber, initializePayment])

  // New function to submit the form without payment
  const submitFormWithoutPayment = async () => {
    setSubmitStatus('loading')
    
    try {
      // Find the selected hair style to get details
      const selectedCategory = formData.serviceCategory;
      const styles = hairStylesByCategory[selectedCategory] || [];
      const selectedStyleValue = formData.service;
      const selectedStyle = styles.find(style => style.value === selectedStyleValue);
      
      // Get the actual price from the selected service
      const actualPrice = (selectedStyle?.price !== undefined && selectedStyle?.price !== null)
        ? selectedStyle.price
        : servicePrice;
      
      // Prepare data for submission without payment
      const submissionData = {
        ...formData,
        hairColor: formData.hairColor || 'black',
        totalAmount: actualPrice,
        amountPaid: 0, // No payment made
        paymentStatus: 'unpaid',
        // Use the default status from system settings, default to 'confirmed' if not payment required
        status: systemSettings.defaultAppointmentStatus || 'confirmed'
      }
      
      // Update appointment status for modal
      setAppointmentStatus(systemSettings.defaultAppointmentStatus || 'confirmed')

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      // Clear the form on successful submission
      setFormData({
        name: '',
        snapchat: '',
        whatsapp: '',
        service: '',
        date: null,
        serviceCategory: '',
        phone: '',
        preferredLength: '',
        hairColor: 'black'
      })
      
      setSubmitStatus('success')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error creating appointment:', error)
      setSubmitStatus('error')
      setError(error instanceof Error ? error.message : 'Failed to create your appointment. Please try again.')
    }
  }

  // Filter function for available dates
  const filterAvailableDates = useCallback((date: Date) => {
    return availableDates.some(
      availableDate => 
        availableDate.getDate() === date.getDate() && 
        availableDate.getMonth() === date.getMonth() && 
        availableDate.getFullYear() === date.getFullYear()
    );
  }, [availableDates]);

  // Add a function to update the service price when service is selected
  const updateServicePrice = useCallback((selectedServiceValue: string, selectedCategory: string) => {
    // First check if we have the styles for this category
    if (!hairStylesByCategory[selectedCategory]) {
      setServicePrice(systemSettings.defaultPrice);
      return;
    }
    
    // Find the full hair style object to get the price
    const stylesInCategory = hairStylesByCategory[selectedCategory];
    const selectedStyle = stylesInCategory.find(style => style.value === selectedServiceValue);
    
    if (selectedStyle && selectedStyle.price !== undefined && selectedStyle.price !== null) {
      setServicePrice(selectedStyle.price);
    } else {
      // Fall back to default price from system settings if not found or price not set
      setServicePrice(systemSettings.defaultPrice);
    }
  }, [hairStylesByCategory, systemSettings.defaultPrice]);

  // Function to handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | Date | null, fieldName?: string) => {
    if (e === null || e instanceof Date) {
      // Handle date object directly
      setFormData(prev => ({ ...prev, date: e }));
    } else {
      // Handle regular input change
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
    if (name === 'serviceCategory') {
        console.log('Service category changed to:', value);
        console.log('Available hair styles for this category:', hairStylesByCategory[value]);
        setFormData(prev => ({ ...prev, service: '' }));
        setServicePrice(systemSettings.defaultPrice); // Reset to default price from settings when category changes
      }
      
      if (name === 'service') {
        // Update price based on selected service
        const category = formData.serviceCategory;
        updateServicePrice(value, category);
      }
      
      if (name === 'phone') {
        setPhoneError(null);
      }
    }
  }, [hairStylesByCategory, formData.serviceCategory, updateServicePrice, systemSettings.defaultPrice]);

  // Add script tag for Paystack in the component
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Add event listener for postMessage from payment success page
  useEffect(() => {
    // Function to handle messages from other windows/tabs
    const handleMessage = (event: MessageEvent) => {
      // Validate message origin for security (in production, restrict to your domain)
      // if (event.origin !== window.location.origin) return;
      
      const data = event.data;
      
      // Check if this is a payment success message
      if (data && data.type === 'PAYMENT_SUCCESS' && data.reference) {
        console.log('Received payment success message:', data);
        
        // Update UI to show success
        setIsProcessingPayment(false);
        setAppointmentStatus('confirmed');
        setSubmitStatus('success');
        setShowSuccessModal(true);
        
        // Clear form data
        setFormData({
          name: '',
          snapchat: '',
          whatsapp: '',
          service: '',
          date: null,
          serviceCategory: '',
          phone: '',
          preferredLength: '',
          hairColor: 'black'
        });
      }
    };
    
    // Add event listener
    window.addEventListener('message', handleMessage);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (loading) {
    return (
      <div className="py-10 px-5 text-center">
        <h2 className="font-['Noto_Serif_Display'] text-3xl mb-6">Loading Appointment Form...</h2>
        <p className="text-gray-400">Please wait while we load the available services and dates.</p>
      </div>
    )
  }

  return (
    <div className="py-10 px-5">
      <h2 className="font-['Noto_Serif_Display'] text-3xl mb-6 text-center">Appointment Details</h2>
      
      {/* Add scroll indicator for new users */}
      <div className="w-full flex flex-col items-center justify-center mb-6 animate-bounce-slow">
        <p className="text-gray-400 text-sm mb-2">Scroll down to book your appointment</p>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-gray-400"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </div>
      
      {noSlotsAvailable ? (
        <div className="text-center py-8 bg-gradient-to-b from-black to-gray-900 rounded-md border border-gray-800">
          <h3 className="text-lg font-medium mb-2">No Available Slots</h3>
          <p className="text-gray-400 text-sm mb-4">
            There are currently no available appointment slots. Please check back later or contact us directly.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="tel:(123)-456-7890" 
              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded text-sm hover:bg-gray-700 transition-colors duration-300"
            >
              Call Us
            </a>
            <a 
              href="https://wa.me/message/Z6BZWWQ3Q5FKG1" 
              className="px-4 py-2 bg-gradient-to-r from-green-800 to-green-900 border border-green-700 rounded text-sm hover:bg-green-700 transition-colors duration-300"
            >
              WhatsApp
            </a>
        </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-gradient-to-b from-black to-gray-900 p-6 rounded-md border border-gray-800 shadow-lg">
          {/* Name field */}
      <div>
            <label htmlFor="name" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Your Full Name
            </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
              className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat']"
              placeholder="Enter your full name"
        />
      </div>
          
          {/* Phone field with validation */}
          <div>
            <label htmlFor="phone" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className={`lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat'] ${phoneError ? 'border-red-500' : ''}`}
              placeholder="Enter your phone number"
            />
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>
          
          {/* Social Media fields */}
          <div className="grid grid-cols-2 gap-4">
      <div>
              <label htmlFor="snapchat" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
                Snapchat (Optional)
        </label>
        <input
          type="text"
          id="snapchat"
          name="snapchat"
          value={formData.snapchat}
          onChange={handleInputChange}
                className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat']"
          placeholder="Your Snapchat username"
        />
      </div>
      <div>
              <label htmlFor="whatsapp" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
                WhatsApp Number
        </label>
        <input
          type="text"
          id="whatsapp"
          name="whatsapp"
          required
          value={formData.whatsapp}
          onChange={handleInputChange}
                className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat']"
          placeholder="Your WhatsApp number"
        />
      </div>
      </div>
          
          {/* Service Category Selection */}
      <div>
            <label htmlFor="serviceCategory" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Service Category
            </label>
        <select
          id="serviceCategory"
          name="serviceCategory"
          required
          value={formData.serviceCategory}
          onChange={handleInputChange}
              className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat'] text-white"
            >
              <option value="" disabled>Select a service category</option>
              {serviceCategories.map(category => (
                <option key={category.value} value={category.value} className="bg-gray-900 text-white">
                  {category.label}
                </option>
          ))}
        </select>
            <p className="text-xs text-gray-500 mt-1">
              {serviceCategories.length === 0 ? 'Loading service categories...' : `${serviceCategories.length} categories available`}
            </p>
      </div>

          {/* Service Selection (dependent on category) */}
        <div>
            <label htmlFor="service" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Service Type
            </label>
          <select
            id="service"
            name="service"
            required
            value={formData.service}
            onChange={handleInputChange}
              disabled={!formData.serviceCategory}
              className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat'] text-white"
            >
              <option value="" disabled>
                {formData.serviceCategory ? 'Select a service type' : 'Select a category first'}
              </option>
              {formData.serviceCategory && hairStylesByCategory[formData.serviceCategory] && 
                hairStylesByCategory[formData.serviceCategory].map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                {option.label}
              </option>
            ))}
          </select>
            <p className="text-xs text-gray-500 mt-1">
              {!formData.serviceCategory ? 'Please select a category first' : 
                !hairStylesByCategory[formData.serviceCategory] ? 'No services found for this category' : 
                `${hairStylesByCategory[formData.serviceCategory].length} services available`}
            </p>
          </div>
          
          {/* Hair Length Selection */}
          <div>
            <label htmlFor="preferredLength" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Preferred Length
            </label>
            <select
              id="preferredLength"
              name="preferredLength"
              value={formData.preferredLength}
              onChange={handleInputChange}
              className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat'] text-white"
            >
              <option value="" disabled className="bg-gray-900 text-white">Select preferred length</option>
              <option value="shoulder" className="bg-gray-900 text-white">Shoulder</option>
              <option value="bra" className="bg-gray-900 text-white">Bra</option>
              <option value="waist" className="bg-gray-900 text-white">Waist</option>
              <option value="butt" className="bg-gray-900 text-white">Butt</option>
          </select>
        </div>

          {/* Hair Color Text Input instead of dropdown */}
      <div>
            <label htmlFor="hairColor" className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Hair Color
            </label>
        <input
          type="text"
          id="hairColor"
          name="hairColor"
          value={formData.hairColor}
          onChange={handleInputChange}
              className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat']"
              placeholder="Enter your preferred hair color"
        />
      </div>

          {/* Date Picker - reverted to original styling */}
          <div className="relative">
            <label className="block text-sm font-['Noto_Serif_Display'] text-gray-300 mb-1">
              Appointment Date
            </label>
        <DatePicker
          selected={formData.date}
              onChange={(date: Date | null) => handleInputChange(date)}
              minDate={new Date()}
              filterDate={filterAvailableDates}
              placeholderText="Select an available date"
              className="lash-input bg-gray-900 focus:ring-1 focus:ring-gray-400 font-['Montserrat']"
              dayClassName={(date: Date) => {
                return isDateAvailable(date) ? "text-amber-200 font-bold" : null;
              }}
              renderDayContents={renderDayContents}
        />
      </div>
          
          {/* Submit button - show different text based on payment requirement */}
      <button
        type="submit"
            disabled={submitStatus === 'loading' || isProcessingPayment}
            className="w-full py-3 mt-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-['Noto_Serif_Display'] uppercase tracking-wider hover:from-gray-600 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-300 rounded"
          >
            {submitStatus === 'loading' 
              ? 'Processing...' 
              : isProcessingPayment 
                ? 'Verifying Payment... (1:45 timeout)' 
                : systemSettings.paymentRequired
                  ? `Pay $${servicePrice} to Book`
                  : 'Book Appointment'}
      </button>
          
          {systemSettings.paymentRequired && (
            <p className="text-sm text-center text-gray-400">
              Your slot will be reserved after successful payment of $${servicePrice}
            </p>
          )}
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      )}
      
      {/* Success Modal - update the modal to reflect payment */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        paymentRequired={systemSettings.paymentRequired}
        appointmentStatus={appointmentStatus}
      />
    </div>
  )
}