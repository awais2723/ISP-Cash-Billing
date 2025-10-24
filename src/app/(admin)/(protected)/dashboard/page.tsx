import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth.server';
import { StatCard } from './StatCard';
import { Users, UserPlus, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminDashboard from './AdminDashboard'; // We'll move the admin view to its own component

// --- Manager Dashboard Component ---
async function ManagerDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeCustomers, newCustomers, regionsWithCount] = await Promise.all([
    prisma.customer.count({ where: { status: 'ACTIVE' } }),
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.region.findMany({
      include: {
        _count: {
          select: { customers: true },
        },
      },
      orderBy: {
        name: 'asc'
      }
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manager Dashboard</h1>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* <StatCard title="Total Active Customers" value={activeCustomers} icon={Users} description="Currently subscribed" /> */}
        <StatCard title="New Customers" value={`+${newCustomers}`} icon={UserPlus} description="Joined this month" />
      </div>

      {/* Region-wise Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers by Region</CardTitle>
          <CardDescription>Total number of customers in each defined region.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region Name</TableHead>
                  <TableHead className="text-right">Total Customers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionsWithCount.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {region.name}
                    </TableCell>
                    <TableCell className="text-right font-bold">{region._count.customers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// --- Main Page Component ---
export default async function DashboardPage() {
  const session = await getSession();

  // Render the correct dashboard based on the user's role
  if (session?.role === 'ADMIN') {
    // For admins, we'll render the full-featured dashboard
    // Note: The old content of this page should be moved to a new component: AdminDashboard.tsx
    return <AdminDashboard />;
  }

  if (session?.role === 'MANAGER') {
    return <ManagerDashboard />;
  }
  
  // Fallback, though the layout should prevent this
  return <div>Access Denied</div>;
}