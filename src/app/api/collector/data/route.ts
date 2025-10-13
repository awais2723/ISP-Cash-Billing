import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth.server';

export async function GET() {
  const session = await getSession();
  if (session?.role !== 'COLLECTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: { user_id: session.userId },
      select: { region_id: true }
    });
    const regionIds = assignments.map(a => a.region_id);
    
    const customers = await prisma.customer.findMany({
      where: { region_id: { in: regionIds }, status: 'ACTIVE' },
      // ✅ Added 'address' to the selected fields
      select: { 
        id: true, 
        Fname: true, 
        username: true, 
        phone: true, 
        address: true, // <-- ADDED
        region: { select: { name: true } } 
      }
    });

    const customerIds = customers.map(c => c.id);
    const invoices = await prisma.invoice.findMany({
      where: { customer_id: { in: customerIds }, status: { in: ['DUE', 'PARTIAL'] } },
      select: { customer_id: true, amount: true, extra_amount: true, paid_amount: true }
    });

    const dueMap = new Map<string, number>();
    invoices.forEach(inv => {
      const due = (inv.amount + inv.extra_amount) - inv.paid_amount;
      dueMap.set(inv.customer_id, (dueMap.get(inv.customer_id) || 0) + due);
    });

    const customersWithDues = customers.map(customer => ({
      ...customer,
      dues: dueMap.get(customer.id) || 0
    }));
    
    customersWithDues.sort((a, b) => b.dues - a.dues);

    return NextResponse.json(customersWithDues);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}