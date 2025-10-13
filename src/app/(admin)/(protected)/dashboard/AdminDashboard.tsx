import prisma from '@/lib/prisma';
import { StatCard } from './StatCard';
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, UserPlus, FileText, Activity } from 'lucide-react';
import { RecentCollectionsChart } from './RecentCollectionsChart';
import { AgingPieChart } from './AgingPieChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { RunBillingButton } from './RunBillingButton';

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // --- Data Fetching (No changes needed here) ---
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const currentPeriod = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const [
    collectionsMonthData,
    collectionsLastMonthData,
    billedMonthData,
    pendingSessionsCount,
    activeCustomersData,
    newCustomersData,
    topCollectorsData,
    agingData30,
    agingData60,
    agingData90,
    agingDataOver90,
    totalDuesData,
    activeSessionsCount,
  ] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { received_at: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { received_at: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { period: currentPeriod } }),
    prisma.cashSession.count({ where: { status: 'CLOSED' } }),
    prisma.customer.count({ where: { status: 'ACTIVE' } }),
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.groupBy({
      by: ['collector_id'],
      _sum: { amount: true },
      where: { received_at: { gte: startOfMonth } },
      orderBy: { _sum: { amount: 'desc' } },
      take: 3,
    }),
    prisma.invoice.aggregate({_sum: {amount: true}, where: {status: {in:['DUE','PARTIAL']}, due_date: { gte: new Date(new Date().setDate(new Date().getDate() - 30))}}}),
    prisma.invoice.aggregate({_sum: {amount: true}, where: {status: {in:['DUE','PARTIAL']}, due_date: { lt: new Date(new Date().setDate(new Date().getDate() - 30)), gte: new Date(new Date().setDate(new Date().getDate() - 60))}}}),
    prisma.invoice.aggregate({_sum: {amount: true}, where: {status: {in:['DUE','PARTIAL']}, due_date: { lt: new Date(new Date().setDate(new Date().getDate() - 60)), gte: new Date(new Date().setDate(new Date().getDate() - 90))}}}),
    prisma.invoice.aggregate({_sum: {amount: true}, where: {status: {in:['DUE','PARTIAL']}, due_date: { lt: new Date(new Date().setDate(new Date().getDate() - 90))}}}),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: { in: ['DUE', 'PARTIAL'] } } }),
    prisma.cashSession.count({ where: { status: 'OPEN' } }),
  ]);

  const collectorIds = topCollectorsData.map(c => c.collector_id);
  const collectors = await prisma.user.findMany({ where: { id: { in: collectorIds }}, select: { id: true, Fname: true } });
  const collectorMap = collectors.reduce((map, user) => { map[user.id] = user.Fname; return map; }, {} as Record<string, string>);
  const last7Days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d; }).reverse();
  const collectionsByDay = await Promise.all(
    last7Days.map(async (day) => {
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        const result = await prisma.payment.aggregate({ _sum: { amount: true }, where: { received_at: { gte: start, lt: end } } });
        return { name: start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), total: result._sum.amount || 0 };
    })
  );

  const formatCurrency = (amount: number | null | undefined) => `PKR ${Number(amount || 0).toLocaleString()}`;
  const totalCollectedMonth = collectionsMonthData._sum.amount || 0;
  const totalBilledMonth = billedMonthData._sum.amount || 0;
  const collectionRate = totalBilledMonth > 0 ? ((totalCollectedMonth / totalBilledMonth) * 100).toFixed(1) : '0.0';
  const lastMonthCollections = collectionsLastMonthData._sum.amount || 0;
  const percentageChange = lastMonthCollections > 0 ? (((totalCollectedMonth - lastMonthCollections) / lastMonthCollections) * 100).toFixed(1) : '0';
  const agingPieChartData = [
      { name: '0-30 Days', value: agingData30._sum.amount || 0 },
      { name: '31-60 Days', value: agingData60._sum.amount || 0 },
      { name: '61-90 Days', value: agingData90._sum.amount || 0 },
      { name: '90+ Days', value: agingDataOver90._sum.amount || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {" "}
      {/* ✅ Adjusted gap for mobile */}
      <header>
        {/* ✅ Responsive font size */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          An overview of your collection performance.
        </p>
        <RunBillingButton />
      </header>
      {/* KPI Cards Grid - This is already responsive by default */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Collections (This Month)"
          value={formatCurrency(totalCollectedMonth)}
          icon={TrendingUp}
          change={`+${percentageChange}% from last month`}
        />
        <StatCard
          title="Dues Billed (This Month)"
          value={formatCurrency(totalBilledMonth)}
          icon={FileText}
          description="Invoices generated"
        />
        <StatCard
          title="Total Outstanding Dues"
          value={formatCurrency(totalDuesData._sum.amount)}
          icon={AlertTriangle}
          description="Across all invoices"
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon={CheckCircle}
          description="Of amount billed this month"
        />
        <StatCard
          title="Total Active Customers"
          value={activeCustomersData}
          icon={Users}
          description="Currently subscribed"
        />
        <StatCard
          title="New Customers"
          value={`+${newCustomersData}`}
          icon={UserPlus}
          description="Joined this month"
        />
        <StatCard
          title="Active Collector Sessions"
          value={activeSessionsCount}
          icon={Activity}
          description="Currently on the field"
        />
        <StatCard
          title="Pending Reconciliations"
          value={pendingSessionsCount}
          icon={Clock}
          description="Sessions to be approved"
        />
      </div>
      {/* ✅ Main Grid for Charts and Tables - Now stacks on mobile and tablet */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentCollectionsChart data={collectionsByDay} />
        </div>
        <div className="lg:col-span-1">
          <AgingPieChart data={agingPieChartData} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Collectors</CardTitle>
          <CardDescription>Top performers this month.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ✅ Responsive wrapper for the table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collector</TableHead>
                  <TableHead className="text-right">Amount Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCollectorsData.map((collectorData) => (
                  <TableRow key={collectorData.collector_id}>
                    <TableCell>
                      {collectorMap[collectorData.collector_id] || "Unknown"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(collectorData._sum.amount)}
                    </TableCell>
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