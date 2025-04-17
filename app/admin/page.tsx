'use client'

import AdminPanel from '@/app/components/AdminPanel'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-black relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/background.jpg"
          alt="Admin Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full"
      >
        <AdminPanel />
      </motion.div>
    </div>
  )
}

