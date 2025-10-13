// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;

//   try {
//     const customer = await prisma.customer.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         Fname: true,
//         address: true,
//         status: true,
//       }
//     });

//     if (!customer) {
//       return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
//     }

//     const invoices = await prisma.invoice.findMany({
//       where: {
//         customer_id: id,
//         status: { in: ['DUE', 'PARTIAL'] }
//       },
//       select: {
//         id: true,
//         period: true,
//         amount: true,
//         extra_amount: true,
//         paid_amount: true,
//         status: true,
//       }
//     });

//     // Calculate total due for each invoice
//     const invoicesWithTotal = invoices.map(inv => ({
//         ...inv,
//         total_due: inv.amount + inv.extra_amount
//     }));

//     return NextResponse.json({ customer, invoices: invoicesWithTotal });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth.server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // ✅ 1. Get the current collector's session
    const session = await getSession();
    if (!session || session.role !== "COLLECTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ 2. Find the regions this collector is assigned to
    const assignments = await prisma.assignment.findMany({
      where: { user_id: session.userId },
      select: { region_id: true },
    });
    const assignedRegionIds = assignments.map((a) => a.region_id);

    // ✅ 3. Find the customer ONLY IF they are in an assigned region
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        region_id: { in: assignedRegionIds },
      },
      select: { id: true, Fname: true, address: true, status: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found or not in your assigned region." },
        { status: 404 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: { customer_id: id, status: { in: ["DUE", "PARTIAL"] } },
      select: {
        id: true,
        period: true,
        category: true,
        notes: true,
        amount: true,
        extra_amount: true,
        paid_amount: true,
      },
      orderBy: { due_date: "asc" },
    });

    return NextResponse.json({ customer, invoices });
  } catch (error) {
    console.error(`Failed to fetch details for customer ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 }
    );
  }
}