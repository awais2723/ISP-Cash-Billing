import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// This is a simplified version. A production version would handle timezones better.
function getBillingPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
    return `${year}-${month}`;
}

export async function POST(req: NextRequest) {
  // In production, you'd secure this with a secret key, not a user session
  // const session = getSession(); 
  // if(session?.role !== 'ADMIN') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  // }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const period = getBillingPeriod();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 10); // Due 10 days from now

  try {
    const activeCustomers = await prisma.customer.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let invoicesCreated = 0;
    
    // Use a transaction to create all invoices at once
    await prisma.$transaction(async (tx) => {
        for (const customer of activeCustomers) {
            const existingInvoice = await tx.invoice.findFirst({
                where: { customer_id: customer.id, period: period }
            });

            if (!existingInvoice) {
                await tx.invoice.create({
                    data: {
                        customer_id: customer.id,
                        period: period,
                        due_date: dueDate,
                        amount: customer.plan.monthly_charge,
                        status: 'DUE',
                    }
                });
                invoicesCreated++;
            }
        }
    });

    return NextResponse.json({ message: 'Billing run completed.', invoicesCreated });
  } catch (error) {
    console.error("Billing run failed:", error);
    return NextResponse.json({ error: 'Billing run failed' }, { status: 500 });
  }
}