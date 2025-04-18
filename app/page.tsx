'use client'

import Image from 'next/image'
import AppointmentForm from './components/AppointmentForm'
import { useState, useMemo, useCallback } from 'react'
import { Phone, Mail, Heart, Sparkles, CalendarDays, Star, Instagram, MessageCircle, Video } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

export default function Home() {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  // Memoize variants to prevent recreation on every render
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), [])
  
  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }), [])

  // Memoize sparkle animation variants
  const sparkleVariants = useMemo(() => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
      }
    }
  }), []) as Variants

  // Optimize image loading
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white bg-glossy">
      {/* Font imports for Noto Serif Display */}
      <div 
        dangerouslySetInnerHTML={{
          __html: `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
          `
        }}
      />
      
      {/* Hero Header Section */}
      <header className="relative w-full min-h-[70vh] flex items-center justify-center">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/profile_image.png" 
            alt="Hair Engineer Background" 
            fill
            className="object-cover object-center"
            priority
            onLoad={handleImageLoad}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        {/* Grouped Text + Logo positioned at bottom */}
        <div className="absolute bottom-[10px] w-full flex flex-col items-center justify-center text-center px-7 z-10">
          <motion.p 
            className="text-black-400 italic uppercase tracking-wide text-sm mb-2"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1.4 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Hello, Gorgeous Girlie! Thanks for booking with
          </motion.p>
          <motion.div
            className="w-40 sm:w-48 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Image
              src="/images/logo.png"
              alt="Hair Engineer Logo"
              width={340}
              height={220}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
        
        {/* Optional: subtle decorative elements */}
        <motion.div
          className="absolute top-5 right-4 text-pink-300/30 z-10"
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        >
          <Sparkles size={18} />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-8 text-pink-300/30 z-10" 
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        >
          <Sparkles size={12} />
        </motion.div>
      </header>
      
      {/* Responsive container for the rest of the content */}
      <motion.div 
        className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Mid section with profile image and text - since hero now has the profile image background, we don't need this part */}
        <div className="mt-10 mb-8">
          {/* Experience section */}
          <motion.div 
            className="text-center flex-1 mt-4 sm:mt-0"
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h2 className="script-font text-3xl mb-2 font-light text-gradient">Experience The Best</h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-400 mb-3 leading-relaxed">
              Thank you for choosing The Hair Engineer. Your trust and loyalty mean the world to me.
            </p>
            <div className="flex items-center justify-center">
              <p className="script-font text-xl font-light">-Vanessa</p>
              <motion.span 
                className="ml-1 text-pink-300/50 cursor-pointer hover:text-pink-300 transition-colors duration-200"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                onClick={() => window.location.href = '/admin'}
              >
                <Heart size={12} fill="currentColor" />
              </motion.span>
            </div>
          </motion.div>
        </div>
        
        {/* Main content section */}
        <motion.section 
          className="flex-1 flex flex-col px-4 sm:px-6 serif-font"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Additional explanation text */}
          <motion.p 
            className="text-[11px] sm:text-xs md:text-sm text-gray-400 mb-6 leading-relaxed text-center"
            variants={itemVariants}
          >
            To ensure you receive the best experience, please be sure to read the booking policies below!
          </motion.p>
          
          {/* Contact information with subtle styling */}
          <motion.div 
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6"
            variants={itemVariants}
          >
            <a href="tel:(123)-456-7890" className="flex items-center text-gray-400 hover:text-pink-200 transition-colors duration-300 text-[10px] sm:text-xs">
              <Phone size={12} className="mr-1" />
              (123)-456-7890
            </a>
            <a href="mailto:thehairengineer.gh@gmail.com" className="flex items-center text-gray-400 hover:text-pink-200 transition-colors duration-300 text-[10px] sm:text-xs">
              <Mail size={12} className="mr-1" />
              thehairengineer.gh@gmail.com
            </a>
          </motion.div>
          
          {/* NEW: Booking policies with updated card layout */}
          <motion.div 
            className="mb-10"
            variants={itemVariants}
          >
            <h2 className="text-center text-xl mb-6 font-semibold text-pink-400 serif-font">Booking Policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* PAYMENT */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">PAYMENT</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A non-refundable deposit is required to book your slot. Remaining balance must be paid in cash or MoMo at the time of service.
                </p>
              </motion.div>
              
              {/* LATENESS */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">LATENESS</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Please arrive on time. A 30-minute grace period is allowed. After 45 minutes, your appointment may be cancelled or rescheduled depending on availability.
                </p>
              </motion.div>
              
              {/* RESCHEDULES */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">RESCHEDULES</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  You may reschedule once, at least 24 hours in advance. Rescheduling within 24 hours may require a new deposit.
                </p>
              </motion.div>
              
              {/* PREP */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">PREP</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Hair must be clean, detangled, well blow-dried and free of product build-up.
                </p>
              </motion.div>
              
              {/* NO REFUNDS */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">NO REFUNDS</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  All deposits and payments are final. If unsatisfied, kindly raise concerns during the appointment so we can make adjustments.
                </p>
              </motion.div>
              
              {/* CANCELLATIONS */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">CANCELLATIONS</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Cancellations must be made 24 hours in advance. Last-minute cancellations result in loss of deposit.
                </p>
              </motion.div>
              
              {/* REVAMPS */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">REVAMPS</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Processing takes 3–5 working days. Drop-offs after 3PM count as next-day processing.
                </p>
              </motion.div>
              
              {/* INSTALLATIONS */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">INSTALLATIONS</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Please drop off your unit 1–2 days before your appointment to allow for prep.
                </p>
              </motion.div>
              
              {/* PONYTAILS */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">PONYTAILS</h3>
                <ul className="text-sm text-gray-300 leading-relaxed list-disc pl-5">
                  <li>For ponytail styles, hair must be freshly washed, detangled, and product-free.</li>
                  <li>Minimum hair length required is 6 inches—shorter lengths should book a consultation.</li>
                  <li>Styling products are provided; bring your own if you have sensitivities or preferences.</li>
                </ul>
              </motion.div>
              
              {/* WIG MAKING */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">WIG MAKING</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Custom units take 5–7 working days to complete.
                </p>
              </motion.div>
              
              {/* ADDITIONAL SERVICES */}
              <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="serif-font font-bold text-sm uppercase mb-2 tracking-wider text-pink-300">ADDITIONAL SERVICES</h3>
                <ul className="text-sm text-gray-300 leading-relaxed list-disc pl-5">
                  <li>Plucking & Knot Bleaching: Extra</li>
                  <li>All add-ons must be selected at booking.</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Conditional Scroll indicator that appears after clicking Book button */}
          {acceptedTerms && (
            <motion.div 
              className="w-full flex flex-col items-center justify-center mb-8 animate-bounce-slow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-400 text-xs mb-2">Scroll down to book your appointment</p>
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
            </motion.div>
          )}
          
          {/* Book button - enhanced with subtle gradient border */}
          <motion.button 
            onClick={() => setAcceptedTerms(true)}
            className="w-full py-2.5 text-center border border-transparent bg-gradient-to-r from-pink-900/20 via-pink-300/20 to-pink-900/20 uppercase tracking-widest mb-3 text-xs hover:text-pink-100 transition-all duration-300 rounded-sm"
            variants={itemVariants}
            whileHover={{ scale: 1.01, boxShadow: "0 0 10px rgba(236, 72, 153, 0.1)" }}
            whileTap={{ scale: 0.99 }}
          >
            Book Your Appointment
          </motion.button>
          
          {/* Terms text - extra small as in image */}
          <motion.p 
            className="text-[9px] text-center text-gray-500 uppercase tracking-widest mb-8"
            variants={itemVariants}
          >
            Please accept the terms and conditions below to confirm your appointment
          </motion.p>
          
          {/* Appointment form would appear when terms are accepted */}
          {acceptedTerms && (
            <div className="w-full max-w-2xl mx-auto">
              <AppointmentForm />
            </div>
          )}
        </motion.section>
      </motion.div>
      
      {/* New Footer Section */}
      <footer className="w-full bg-neutral-900 mt-20 pt-12 pb-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-pink-400 font-['Noto_Serif_Display'] text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm">Training Courses</a></li>
                <li><a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm">Luxury Hair Extensions</a></li>
              </ul>
            </div>
            
            {/* Explore */}
            <div>
              <h3 className="text-pink-400 font-['Noto_Serif_Display'] text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm">Client Reviews</a></li>
                <li><a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>
            
            {/* Connect With Us */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center lg:px-8">
              <h3 className="text-pink-400 font-['Noto_Serif_Display'] text-lg font-semibold mb-4">Connect With Us</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm flex items-center">
                    <Instagram size={16} className="mr-2" />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm flex items-center">
                    <Video size={16} className="mr-2" />
                    <span>TikTok</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pink-300 transition-colors text-sm flex items-center">
                    <MessageCircle size={16} className="mr-2" />
                    <span>WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright and Creator Credit */}
          <div className="mt-12 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm mb-2">© 2025 The Hair Engineer. All Rights Reserved.</p>
            <p className="text-gray-500 text-xs">Created by Dong Tech. Contact us on +233 2041 63714 to build your dream business together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

