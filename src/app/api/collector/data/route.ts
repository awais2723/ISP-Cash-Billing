import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = getSession();
  if (session?.role !== 'COLLECTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Find all regions assigned to this collector
    const assignments = await prisma.assignment.findMany({
      where: { user_id: session.userId, active_to: null }, // Assuming null active_to means currently active
      select: { region_id: true }
    });
    const regionIds = assignments.map(a => a.region_id);

    // Fetch active customers from those regions
    const customers = await prisma.customer.findMany({
      where: {
        region_id: { in: regionIds },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        Fname: true,
        address: true,
      }
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Failed to fetch collector data:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}