import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth.server';

export async function POST() {
  const session = await getSession();
  if (session?.role !== 'COLLECTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Check if there is already an open session for this collector
  const existingOpenSession = await prisma.cashSession.findFirst({
    where: { collector_id: session.userId, status: 'OPEN' }
  });

  if (existingOpenSession) {
    return NextResponse.json(existingOpenSession); // Return existing session
  }

  const newSession = await prisma.cashSession.create({
    data: {
      collector_id: session.userId,
      status: 'OPEN',
    },
  });

  return NextResponse.json(newSession, { status: 201 });
}