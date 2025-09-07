'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions'; // Ensure you have this global logout action

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold">Collector Portal</h1>
        <form action={logout}>
          <button type="submit" className="flex items-center text-sm p-2 rounded-md hover:bg-indigo-700 transition-colors">
            <LogOut size={16} className="mr-1.5" />
            Logout
          </button>
        </form>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}