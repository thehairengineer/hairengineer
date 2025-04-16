import { Suspense } from 'react';
import AdminPanel from '@/app/components/AdminPanel';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <Suspense fallback={<div>Loading admin panel...</div>}>
              <AdminPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 