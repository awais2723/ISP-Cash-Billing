import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth.server'; // Use the server-only auth file

export async function GET() {
  const session = await getSession();
  if (session?.role !== 'COLLECTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Find all regions assigned to this collector
    const assignments = await prisma.assignment.findMany({
      where: { user_id: session.userId, active_to: null },
      select: { region_id: true }
    });
    const regionIds = assignments.map(a => a.region_id);

    // Fetch all customers in those regions
    const customers = await prisma.customer.findMany({
      where: { region_id: { in: regionIds }, status: 'ACTIVE' },
      select: { id: true, Fname: true, address: true }
    });
    const customerIds = customers.map(c => c.id);

    // Find all invoices with dues for these customers
    const dueInvoices = await prisma.invoice.findMany({
        where: {
            customer_id: { in: customerIds },
            status: { in: ['DUE', 'PARTIAL']}
        },
        select: { customer_id: true }
    });

    // Create a Set for quick lookups of which customers have dues
    const customersWithDues = new Set(dueInvoices.map(inv => inv.customer_id));

    // Combine the data, adding a `hasDueInvoice` flag
    const customersWithDueStatus = customers.map(customer => ({
      ...customer,
      hasDueInvoice: customersWithDues.has(customer.id)
    }));

    return NextResponse.json(customersWithDueStatus);
  } catch (error) {
    console.error("Failed to fetch collector data:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}