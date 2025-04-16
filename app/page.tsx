'use client'

import Image from 'next/image'
import AppointmentForm from './components/AppointmentForm'
import { useState, useMemo, useCallback } from 'react'
import { Phone, Mail, Heart, Sparkles, CalendarDays, Star } from 'lucide-react'
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
          `
        }}
      />
      
      {/* Mobile view container */}
      <motion.div 
        className="mobile-view-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute top-4 right-4 text-pink-300/30 z-10"
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        >
          <Sparkles size={18} />
        </motion.div>
        <motion.div
          className="absolute top-[180px] right-8 text-pink-300/30 z-10" 
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        >
          <Sparkles size={12} />
        </motion.div>
        
        {/* Header section with background image and left-aligned text */}
        <div className="relative h-[180px] header-section overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0 photo-shimmer">
            <Image 
              src="/images/lash-background.jpg" 
              alt="Hair Engineer Background" 
              fill
              className="object-cover object-top"
              priority
              onLoad={handleImageLoad}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/70"></div>
          </div>
          
          {/* Left-aligned header text */}
          <div className="absolute top-10 left-6 z-10 text-left">
            <motion.h5 
              className="text-[10px] tracking-[0.3em] text-gray-300 mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              WELCOME TO
            </motion.h5>
            <motion.h1 
              className="font-['Noto_Serif_Display'] text-4xl font-bold tracking-widest mb-0 leading-none text-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              THE ΗΔΙR
            </motion.h1>
            <motion.h1 
              className="font-['Noto_Serif_Display'] text-4xl font-bold tracking-widest leading-none text-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              ΞNGIΝΞΞR
            </motion.h1>
          </div>
          
          {/* Subtle decorative border */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-300/20 to-transparent"></div>
        </div>
        
        {/* Mid section with profile image and text */}
        <div className="relative flex px-6 items-center mb-12 mid-section mt-9">
          {/* Profile image as ellipse that partially overlaps header */}
          <motion.div 
            className="w-[145px] h-[211px] elliptical-image overflow-hidden border border-pink-900/20 profile-border shadow-xl relative -top-16 z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Image 
              src="https://m.media-amazon.com/images/S/aplus-media-library-service-media/1118404b-0242-4525-9029-094b4b6b4261.__CR0,0,362,453_PT0_SX362_V1___.jpg" 
              alt="Hair Engineer Profile" 
              fill
              className="object-cover"
              priority
            />
            {/* Add subtle shadow/glow effect with light pink hue */}
            <div className="absolute inset-0 shadow-inner ring-1 ring-pink-300/10"></div>
          </motion.div>
          
          {/* Experience section pushed to the right */}
          <motion.div 
            className="text-right flex-1 pl-4 ml-2 relative top-6"
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h2 className="script-font text-3xl mb-2 font-light text-gradient">Experience The Best</h2>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              Thank you for choosing The Hair Engineer. Your trust and loyalty mean the world to me.
            </p>
            <div className="flex items-center justify-end">
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
          className="flex-1 flex flex-col px-6 serif-font"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Additional explanation text */}
          <motion.p 
            className="text-[11px] text-gray-400 mb-6 leading-relaxed text-center"
            variants={itemVariants}
          >
            To ensure you receive the best experience, please be sure to read the booking policies below!
          </motion.p>
          
          {/* Contact information with subtle styling */}
          <motion.div 
            className="flex justify-center space-x-5 mb-6"
            variants={itemVariants}
          >
            <a href="tel:(123)-456-7890" className="flex items-center text-gray-400 hover:text-pink-200 transition-colors duration-300 text-[10px]">
              <Phone size={12} className="mr-1" />
              (123)-456-7890
            </a>
            <a href="mailto:youremail@address.com" className="flex items-center text-gray-400 hover:text-pink-200 transition-colors duration-300 text-[10px]">
              <Mail size={12} className="mr-1" />
              thehairengineer.gh@gmail.com
            </a>
          </motion.div>
          
          {/* Booking policies in 2x2 grid with fine-tuned spacing and subtle pink accents */}
          <motion.div 
            className="grid grid-cols-2 gap-x-5 gap-y-6 mb-10 policy-grid bg-glossy"
            variants={itemVariants}
          >
            <motion.div 
              className="text-center p-3 rounded-sm hover:bg-pink-950/20 policy-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="serif-font font-bold text-sm uppercase mb-1.5 tracking-wider">Lateness</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi tenetur.
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 rounded-sm hover:bg-pink-950/20 policy-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="serif-font font-bold text-sm uppercase mb-1.5 tracking-wider">Payment</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi tenetur.
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 rounded-sm hover:bg-pink-950/20 policy-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="serif-font font-bold text-sm uppercase mb-1.5 tracking-wider">Reschedules</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi tenetur.
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 rounded-sm hover:bg-pink-950/20 policy-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="serif-font font-bold text-sm uppercase mb-1.5 tracking-wider">Prep</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi tenetur.
              </p>
            </motion.div>
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
          {acceptedTerms && <AppointmentForm />}
        </motion.section>
      </motion.div>
    </div>
  )
}

