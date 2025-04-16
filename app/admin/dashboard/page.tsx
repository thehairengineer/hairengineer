import { Suspense } from 'react';
import AdminPanel from '@/app/components/AdminPanel';
import DatabaseStatus from '@/app/components/DatabaseStatus';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-center mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Database Management</h2>
            <Suspense fallback={<div>Loading database status...</div>}>
              <DatabaseStatus />
            </Suspense>
          </div>
          
          <div>
            <h2 className="text-2xl font-serif mb-4">Appointments & Availability</h2>
            <Suspense fallback={<div>Loading admin panel...</div>}>
              <AdminPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 