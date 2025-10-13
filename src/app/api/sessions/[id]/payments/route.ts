import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth.server";

export async function GET(
  request: NextRequest, // The request object must be the first argument
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { cash_session_id: sessionId },
      include: {
        customer: { select: { Fname: true, username: true } },
      },
      orderBy: { received_at: "asc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments for session." },
      { status: 500 }
    );
  }
}
