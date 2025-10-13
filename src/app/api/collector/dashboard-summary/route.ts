// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getSession } from '@/lib/auth.server';

// export async function GET() {
//   const session = await getSession();
//   if (session?.role !== 'COLLECTOR') {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//   }

//   try {
//     const now = new Date();
//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     // 1. Get all of today's sessions (open or closed) to calculate total collected
//     const todaysSessions = await prisma.cashSession.findMany({
//       where: {
//         collector_id: session.userId,
//         opened_at: { gte: startOfToday }
//       },
//       select: { id: true }
//     });
//     const todaysSessionIds = todaysSessions.map(s => s.id);

//     const paymentsToday = await prisma.payment.aggregate({
//       _sum: { amount: true },
//       where: { cash_session_id: { in: todaysSessionIds } }
//     });
//     const totalCollectedToday = paymentsToday._sum.amount || 0;

  
//      const activeSession = await prisma.cashSession.findFirst({
//        where: { collector_id: session.userId, status: "OPEN" },
//        select: {
//          id: true,
//          opened_at: true,
//          expected_total: true,
//          collector_id: true, // <-- ADD THIS LINE
//        },
//      });
    
//     // 3. Get assigned regions
//     const assignments = await prisma.assignment.findMany({
//       where: { user_id: session.userId },
//       include: { region: true }
//     });
//     const assignedRegions = assignments.map(a => a.region);

//     // 4. ✅ Return the single active session object, not an array
//     return NextResponse.json({ assignedRegions, totalCollectedToday, activeSession });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth.server";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "COLLECTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // --- Calculate "Total Collected Today" (from all sessions) ---
    const todaysSessions = await prisma.cashSession.findMany({
      where: { collector_id: session.userId, opened_at: { gte: startOfToday } },
      select: { id: true },
    });
    const todaysSessionIds = todaysSessions.map((s) => s.id);
    const paymentsToday = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { cash_session_id: { in: todaysSessionIds } },
    });
    const totalCollectedToday = paymentsToday._sum.amount || 0;

    // --- Find the single active session ---
    let activeSessionData = await prisma.cashSession.findFirst({
      where: { collector_id: session.userId, status: "OPEN" },
    });

    let activeSession = null;
    if (activeSessionData) {
      // ✅ If a session is active, calculate the amount collected just for THAT session
      const paymentsInThisSession = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { cash_session_id: activeSessionData.id },
      });
      activeSession = {
        ...activeSessionData,
        collected_in_session: paymentsInThisSession._sum.amount || 0,
      };
    }

    // Get assigned regions
    const assignments = await prisma.assignment.findMany({
      where: { user_id: session.userId },
      include: { region: true },
    });
    const assignedRegions = assignments.map((a) => a.region);

    return NextResponse.json({
      assignedRegions,
      totalCollectedToday,
      activeSession,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}