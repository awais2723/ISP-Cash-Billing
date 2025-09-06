import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Home, Users, Map, FileText, CheckSquare } from 'lucide-react';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // ✅ FIX: Await the async function call
  const session = await getSession();

  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">ISP Panel</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard" className="flex items-center p-2 rounded hover:bg-gray-700"><Home className="mr-2 h-4 w-4" />Dashboard</Link>
          <Link href="/customers" className="flex items-center p-2 rounded hover:bg-gray-700"><Users className="mr-2 h-4 w-4" />Customers</Link>
          <Link href="/regions" className="flex items-center p-2 rounded hover:bg-gray-700"><Map className="mr-2 h-4 w-4" />Regions</Link>
          <Link href="/plans" className="flex items-center p-2 rounded hover:bg-gray-700"><FileText className="mr-2 h-4 w-4" />Plans</Link>
          <Link href="/reconciliation" className="flex items-center p-2 rounded hover:bg-gray-700"><CheckSquare className="mr-2 h-4 w-4" />Reconciliation</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <header className="bg-white shadow p-4 mb-6 rounded-md">
            <h1 className="text-xl font-semibold">Welcome, {session.role}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}