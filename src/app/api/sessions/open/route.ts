
  import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth.server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if there is already an open session for this collector
  const existingOpenSession = await prisma.cashSession.findFirst({
    where: { collector_id: session.userId, status: "OPEN" },
  });
  
  try {
    // 1. Find the collector's assigned regions
    const assignments = await prisma.assignment.findMany({
      where: { user_id: session.userId },
      select: { region_id: true },
    });
    const regionIds = assignments.map((a) => a.region_id);

    // 2. Calculate the total outstanding dues in those regions
    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        customer: { region_id: { in: regionIds } },
        status: { in: ["DUE", "PARTIAL"] },
      },
    });

    const expected_total = outstandingInvoices.reduce((sum, inv) => {
      return sum + (inv.amount + inv.extra_amount - inv.paid_amount);
    }, 0);

    // 3. Create the new session with the calculated expected_total
    const newSession = await prisma.cashSession.create({
      data: {
        collector_id: session.userId,
        status: "OPEN",
        expected_total: parseFloat(expected_total.toFixed(2)), // Save the snapshot amount
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Failed to open session:", error);
    return NextResponse.json(
      { error: "Failed to open session" },
      { status: 500 }
    );
  }
}