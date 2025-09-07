'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import { LogOut, Menu } from "lucide-react";
import hsLogo from "@/images/hs.png";
import { logout } from '@/app/actions';
import { type NavLink, icons } from './config';

export default function ProtectedClientLayout({
  session,
  navLinks,
  children,
}: {
  session: { role: string, Fname: string};
  navLinks: NavLink[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white p-2 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="mb-4 mt-0 text-center">
            <Image src={hsLogo} alt="Logo" width={100} height={80} className="mb-0 mx-auto" priority />
            <h2 className="text-xl font-bold mt-0 mr-6 opacity-70 mb-4" style={{ color: '#3498db', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              HS-Network
            </h2>
          </div>
          <nav className="flex flex-col space-y-2">
            {(navLinks || []).map(({ href, label, iconName }) => {
              const Icon = icons[iconName];
              if (!Icon) return null;
              return (
                <Link key={href} href={href} className="flex items-center p-2 rounded hover:bg-gray-700">
                  <Icon className="mr-2 h-4 w-4" /> {label}
                </Link>
              )
            })}
            
            {/* ✅ Logout button moved here with new styling */}
          <form action={logout} className="mt-6 px-2">
  <button 
    className="
      flex 
      items-center 
      justify-center 
      w-full 
      p-2 
      rounded-md 
      border 
      border-gray-600 
      text-gray-400 
      font-medium 
      hover:bg-gray-700 
      hover:text-white 
      transition-colors 
      duration-200
    "
  >
    {/* ✅ Fixed icon width from w-2 to w-4 */}
    <LogOut className="mr-2 h-4 w-4" />
    Logout
  </button>
</form>
          </nav>
        </div>

        {/* ❌ Old logout button form is now removed from the bottom */}
      </aside>

      <main className="flex-1 p-4 sm:p-6">
        <header className="bg-white shadow p-4 mb-6 rounded-md flex justify-between items-center">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Welcome, {session.Fname}</h1>
        </header>
        {children}
        <Toaster richColors />
      </main>
    </div>
  );
}