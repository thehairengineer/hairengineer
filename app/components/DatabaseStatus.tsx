'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DatabaseIcon, RefreshCw, Trash2 } from 'lucide-react';

interface DbStatus {
  success: boolean;
  connection: {
    status: number;
    statusText: string;
  };
  count: {
    categories: number;
    hairStyles: number;
    availableDates: number;
    appointments: number;
  };
  error?: string;
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching DB status:', error);
      toast.error('Failed to fetch database status');
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setSeedLoading(true);
    try {
      const response = await fetch('/api/seed-database', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Database seeded successfully!');
        fetchStatus(); // Refresh the status
      } else {
        toast.error(data.error || 'Failed to seed database');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error('Failed to seed database');
    } finally {
      setSeedLoading(false);
    }
  };

  const resetDatabase = async () => {
    setResetLoading(true);
    try {
      const response = await fetch('/api/reseed', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Database reset successfully!');
        setShowConfirm(false);
        fetchStatus(); // Refresh the status
      } else {
        toast.error(data.error || 'Failed to reset database');
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Failed to reset database');
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-center">Database Status</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 rounded-full bg-blue-600 bg-opacity-20 hover:bg-opacity-40 transition-all"
            title="Refresh status"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : status?.success ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-lg">Connection:</span>
            <span className={`px-3 py-1 rounded ${
              status.connection.status === 1 
                ? 'bg-green-500 bg-opacity-20 text-green-300' 
                : 'bg-red-500 bg-opacity-20 text-red-300'
            }`}>
              {status.connection.statusText}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black bg-opacity-20 p-3 rounded">
              <div className="text-sm opacity-70">Categories</div>
              <div className="text-2xl font-serif">{status.count.categories}</div>
            </div>
            <div className="bg-black bg-opacity-20 p-3 rounded">
              <div className="text-sm opacity-70">Hair Styles</div>
              <div className="text-2xl font-serif">{status.count.hairStyles}</div>
            </div>
            <div className="bg-black bg-opacity-20 p-3 rounded">
              <div className="text-sm opacity-70">Available Dates</div>
              <div className="text-2xl font-serif">{status.count.availableDates}</div>
            </div>
            <div className="bg-black bg-opacity-20 p-3 rounded">
              <div className="text-sm opacity-70">Appointments</div>
              <div className="text-2xl font-serif">{status.count.appointments}</div>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            {showConfirm ? (
              <div className="flex items-center space-x-2 bg-red-900 bg-opacity-20 p-2 rounded">
                <span className="text-sm">Are you sure?</span>
                <button 
                  onClick={resetDatabase}
                  disabled={resetLoading}
                  className="px-3 py-1 bg-red-600 bg-opacity-30 hover:bg-opacity-50 rounded-sm transition-all text-xs"
                >
                  {resetLoading ? "Resetting..." : "Yes, Reset"}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1 bg-gray-600 bg-opacity-30 hover:bg-opacity-50 rounded-sm transition-all text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 bg-red-600 bg-opacity-30 hover:bg-opacity-50 rounded transition-all flex items-center space-x-2"
              >
                <Trash2 size={14} />
                <span>Reset DB</span>
              </button>
            )}
            
            <button 
              onClick={seedDatabase}
              disabled={seedLoading}
              className="px-4 py-2 bg-purple-600 bg-opacity-30 hover:bg-opacity-50 rounded transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {seedLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                  <span>Seeding...</span>
                </>
              ) : (
                <>
                  <DatabaseIcon size={14} />
                  <span>Seed Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red-500 bg-opacity-20 p-4 rounded">
          <p className="text-red-300">Error: {status?.error || 'Unknown error occurred'}</p>
          <button 
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 bg-blue-600 bg-opacity-30 hover:bg-opacity-50 rounded transition-all"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
} 