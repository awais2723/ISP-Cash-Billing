import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { sessionId, counted_total } = await req.json();

  if (!sessionId || counted_total === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const session = await prisma.cashSession.findUnique({ where: { id: sessionId }});
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  const variance = counted_total - session.expected_total;

  const updatedSession = await prisma.cashSession.update({
    where: { id: sessionId },
    data: {
      status: 'CLOSED',
      closed_at: new Date(),
      counted_total: Number(counted_total),
      variance,
    },
  });

  return NextResponse.json(updatedSession);
}