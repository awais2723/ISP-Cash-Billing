import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Redirect based on user role
  if (session.role === 'ADMIN' || session.role === 'MANAGER') {
    // The admin/manager dashboard lives inside the (admin) route group
    // and is accessible via /dashboard.
    redirect('/dashboard'); 
  }

  if (session.role === 'COLLECTOR') {
    // The collector dashboard lives inside the (collector) route group
    // and is also accessible via /dashboard.
    redirect('/dashboard');
  }

  // Fallback in case of an unknown role, though this shouldn't happen.
  redirect('/login');
}