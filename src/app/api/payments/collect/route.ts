import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth.server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { amount, customer_id, invoice_ids, cash_session_id } = await req.json();
  let paymentAmount = Number(amount);

  if (
    !paymentAmount ||
    !customer_id ||
    !invoice_ids ||
    !cash_session_id ||
    !Array.isArray(invoice_ids) ||
    invoice_ids.length === 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required fields." },
      { status: 400 }
    );
  }

  try {
    // 1. SECURITY CHECK: Verify the session belongs to the logged-in collector and is open.
    const activeSession = await prisma.cashSession.findUnique({
      where: {
        id: cash_session_id,
        collector_id: session.userId, // Ensures the session belongs to this user
        status: "OPEN",
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "Invalid or inactive session for this user." },
        { status: 403 }
      );
    }

    // 2. TRANSACTION: Perform all database operations in a transaction for data integrity.
    await prisma.$transaction(async (tx) => {
      // Fetch all invoices the user selected to pay, oldest first.
      const invoicesToPay = await tx.invoice.findMany({
        where: {
          id: { in: invoice_ids },
          customer_id: customer_id,
          status: { in: ["DUE", "PARTIAL"] },
        },
        orderBy: { due_date: "asc" },
      });

      if (invoicesToPay.length === 0) {
        throw new Error("No valid due invoices found for payment.");
      }

      // 3. PAYMENT DISTRIBUTION LOGIC
      for (const invoice of invoicesToPay) {
        if (paymentAmount <= 0) break; // Stop if the collected cash is fully applied.

        const balanceDue =
          invoice.amount + invoice.extra_amount - invoice.paid_amount;
        const amountToApply = Math.min(paymentAmount, balanceDue);

        // Create a unique payment record for the amount applied to this invoice.
        await tx.payment.create({
          data: {
            amount: amountToApply,
            invoice_id: invoice.id,
            customer_id: customer_id,
            cash_session_id: cash_session_id,
            collector_id: session.userId,
            receipt_no: `RCPT-${Date.now()}-${randomBytes(4)
              .toString("hex")
              .toUpperCase()}`,
          },
        });

        // Update the invoice's paid amount and status.
        const newPaidAmount = invoice.paid_amount + amountToApply;
        const newStatus =
          newPaidAmount >= invoice.amount + invoice.extra_amount
            ? "PAID"
            : "PARTIAL";

        await tx.invoice.update({
          where: { id: invoice.id },
          data: { paid_amount: newPaidAmount, status: newStatus },
        });

        // Decrease the remaining cash amount to be applied.
        paymentAmount -= amountToApply;
      }

      // If there's leftover cash after paying all selected invoices, throw an error.
      // In a more advanced system, this could be recorded as customer credit.
      if (paymentAmount > 0.01) {
        // Use a small threshold for floating point inaccuracies
        throw new Error(
          "Payment amount exceeds the total due for the selected invoices."
        );
      }
    });

    return NextResponse.json(
      { message: "Payment processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment transaction failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Payment transaction failed.", details: errorMessage },
      { status: 500 }
    );
  }
}
