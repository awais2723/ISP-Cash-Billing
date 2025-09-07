import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth.server';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { amount, customer_id, invoice_ids, cash_session_id } = await req.json();

  if (!amount || !customer_id || !invoice_ids || !cash_session_id) {
    return NextResponse.json({ error: 'Missing required payment data' }, { status: 400 });
  }

  try {
    const paymentResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch the invoice to verify its status and amount due
      const invoice = await tx.invoice.findUnique({
        where: { id: invoice_ids[0] }, // Simplified to handle one invoice per payment
      });

      if (!invoice || invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
        throw new Error('Invoice is not available for payment.');
      }

      // 2. Create the Payment record
      const newPayment = await tx.payment.create({
        data: {
          amount: parseFloat(amount),
          customer_id: customer_id,
          invoice_id: invoice.id,
          cash_session_id: cash_session_id,
          collector_id: session.userId,
          receipt_no: `RCPT-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`,
        },
      });

      // 3. Update the Invoice's paid amount and status
      const totalPaid = invoice.paid_amount + newPayment.amount;
      const totalDue = invoice.amount + invoice.extra_amount;
      const newStatus = totalPaid >= totalDue ? 'PAID' : 'PARTIAL';
      
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paid_amount: totalPaid,
          status: newStatus,
        },
      });
      
      // 4. Update the cash session's expected total by incrementing it
      await tx.cashSession.update({
          where: { id: cash_session_id },
          data: {
              expected_total: {
                  increment: newPayment.amount
              }
          }
      });

      return newPayment;
    });

    return NextResponse.json(paymentResult, { status: 201 });
  } catch (error) {
    console.error('Payment transaction failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Transaction failed', details: errorMessage }, { status: 500 });
  }
}