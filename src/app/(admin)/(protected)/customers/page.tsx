import prisma from '@/lib/prisma';
import { CustomerList } from './CustomerList';

const ITEMS_PER_PAGE = 15;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    region?: string;
    plan?: string;
    page?: string;
  };
}) {
  const search = searchParams?.search || '';
  const regionId = searchParams?.region || '';
  const planId = searchParams?.plan || '';
  const currentPage = Number(searchParams?.page) || 1;

  // Build the filter conditions for the Prisma query
  const whereClause: any = {};
  if (search || (regionId && regionId !== 'all') || (planId && planId !== 'all')) {
    whereClause.AND = [];
    if (search) {
      whereClause.AND.push({
        OR: [
          { Fname: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (regionId && regionId !== 'all') {
      whereClause.AND.push({ region_id: regionId });
    }
    if (planId && planId !== 'all') {
      whereClause.AND.push({ plan_id: planId });
    }
  }

  // Fetch the data and metadata for pagination concurrently
  const [customers, totalCustomers, plans, regions] = await Promise.all([
    prisma.customer.findMany({
      where: whereClause,
      include: { plan: true, region: true },
      orderBy: { Fname: 'asc' },
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
    }),
    prisma.customer.count({ where: whereClause }),
    prisma.plan.findMany({ orderBy: { name: 'asc' } }),
    prisma.region.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);

  return (
    <CustomerList
      customers={customers}
      totalCustomers={totalCustomers}
      totalPages={totalPages}
      plans={plans}
      regions={regions}
    />
  );
}