import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        Fname: true,
        address: true,
        status: true,
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        customer_id: id,
        status: { in: ['DUE', 'PARTIAL'] }
      },
      select: {
        id: true,
        period: true,
        amount: true,
        extra_amount: true,
        paid_amount: true,
        status: true,
      }
    });

    // Calculate total due for each invoice
    const invoicesWithTotal = invoices.map(inv => ({
        ...inv,
        total_due: inv.amount + inv.extra_amount
    }));

    return NextResponse.json({ customer, invoices: invoicesWithTotal });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
}