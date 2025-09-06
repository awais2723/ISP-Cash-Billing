'use client';
import { Cloud, CloudOff } from 'lucide-react';
import { useEffect, useState } from 'react';

// A simple hook to detect online status
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    // Set initial status
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);
  return isOnline;
};

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Collector Portal</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
          {isOnline ? <Cloud size={20} /> : <CloudOff size={20} className="text-yellow-300" />}
        </div>
      </header>
      <main className="flex-1 p-4">
        {!isOnline && (
            <div className="bg-yellow-200 text-yellow-800 p-2 text-center rounded-md mb-4">
                You are offline. Please check your connection.
            </div>
        )}
        {children}
      </main>
    </div>
  );
}