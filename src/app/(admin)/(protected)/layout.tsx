import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth.server';
import ProtectedClientLayout from './ProtectedClientLayout';
// ✅ Import from the new config file
import { adminNavLinks, managerNavLinks } from './config';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    redirect("/login");
  }
  
  const navLinks = session.role === 'ADMIN' ? adminNavLinks : managerNavLinks;

  return (
    <ProtectedClientLayout session={session} navLinks={navLinks}>
      {children}
    </ProtectedClientLayout>
  );
}