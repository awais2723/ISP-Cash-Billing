import prisma from '@/lib/prisma';
import { StatCard } from './StatCard';
import { DollarSign, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { RecentCollectionsChart } from './RecentCollectionsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function DashboardPage() {
  // --- Data Fetching ---

  // 1. Get current date ranges
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 2. Fetch KPI data concurrently for performance
  const [
    collectionsTodayData,
    collectionsMonthData,
    outstandingData,
    activeCustomersData,
    pendingSessionsData
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { received_at: { gte: startOfToday } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { received_at: { gte: startOfMonth } },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['DUE', 'PARTIAL'] } },
    }),
    prisma.customer.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.cashSession.findMany({
        where: { status: 'CLOSED' },
        include: { collector: { select: { Fname: true }}},
        orderBy: { closed_at: 'desc' },
        take: 5
    })
  ]);

  // 3. Fetch data for the bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const collectionsByDay = await Promise.all(
    last7Days.map(async (day) => {
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        const result = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { received_at: { gte: start, lt: end } },
        });
        return {
            name: start.toLocaleDateString('en-US', { weekday: 'short' }),
            total: result._sum.amount || 0,
        };
    })
  );


  // --- Data Formatting ---
  const formatCurrency = (amount: number | null | undefined) => `PKR ${Number(amount || 0).toLocaleString()}`;
  
  const collectionsToday = formatCurrency(collectionsTodayData._sum.amount);
  const collectionsMonth = formatCurrency(collectionsMonthData._sum.amount);
  const totalOutstanding = formatCurrency(outstandingData._sum.amount);
  const activeCustomers = activeCustomersData.toLocaleString();


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Collections Today" value={collectionsToday} icon={DollarSign} />
        <StatCard title="Collections This Month" value={collectionsMonth} icon={CreditCard} />
        <StatCard title="Total Outstanding" value={totalOutstanding} icon={AlertTriangle} />
        <StatCard title="Active Customers" value={activeCustomers} icon={Users} />
      </div>

      {/* Charts and Actionable Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentCollectionsChart data={collectionsByDay} />

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSessionsData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Collector</TableHead>
                            <TableHead>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingSessionsData.map(session => (
                            <TableRow key={session.id}>
                                <TableCell>{session.collector.Fname}</TableCell>
                                <TableCell>{formatCurrency(session.expected_total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-center text-gray-500 py-4">No pending sessions to approve.</p>
            )}
            <Link href="/reconciliation" className="text-sm text-indigo-600 hover:underline mt-4 block text-center">
              View All
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}