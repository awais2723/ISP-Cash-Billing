import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth.server";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  const session = await getSession();

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find the session to be closed. It already contains the expected_total.
    const sessionToClose = await prisma.cashSession.findUnique({
      where: { id: sessionId, collector_id: session.userId },
    });
    if (!sessionToClose) {
      return NextResponse.json(
        { error: "Session not found or does not belong to user." },
        { status: 404 }
      );
    }

    // 2. ✅ Calculate the 'counted_total': the actual sum of payments made in this session.
    const collectedData = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { cash_session_id: sessionId },
    });
    const counted_total = collectedData._sum.amount || 0;

    // 3. ✅ Calculate the variance based on the pre-saved expected amount and the new counted amount.
    const variance = counted_total - sessionToClose.expected_total;

    // 4. ✅ Update the session with the correct, distinct values.
    const updatedSession = await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        closed_at: new Date(),
        counted_total: counted_total, // This is the actual collected amount
        variance: variance, // This is the calculated difference
        // We do NOT update expected_total here, preserving the original snapshot.
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Failed to close session:", error);
    return NextResponse.json(
      { error: "Failed to close session" },
      { status: 500 }
    );
  }
}
