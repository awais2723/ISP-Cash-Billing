import prisma from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";

/**
 * PHASE 1: Creates a "to-do list" of pending billing cycles for the current month.
 */
export async function createBillingCycles(period: string) {
  console.log(`[Phase 1] Preparing billing cycles for period: ${period}...`);

  const activeCustomers = await prisma.customer.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });
  const customerIds = activeCustomers.map((c) => c.id);

  const existingCycles = await prisma.billingCycle.findMany({
    where: { customer_id: { in: customerIds }, period: period },
    select: { customer_id: true },
  });
  const alreadyProcessedIds = new Set(existingCycles.map((c) => c.customer_id));

  const customersToProcess = activeCustomers.filter(
    (c) => !alreadyProcessedIds.has(c.id)
  );

  if (customersToProcess.length === 0) {
    console.log("[Phase 1] No new billing cycles needed.");
    return { created: 0 };
  }

  const cyclesToCreate = customersToProcess.map((customer) => ({
    customer_id: customer.id,
    period: period,
    status: "PENDING",
  }));

  const result = await prisma.billingCycle.createMany({ data: cyclesToCreate });
  console.log(`[Phase 1] Created ${result.count} new PENDING billing cycles.`);
  return { created: result.count };
}

/**
 * PHASE 2: Processes the "to-do list" of pending cycles and generates invoices.
 */
export async function processBillingCycles(period: string) {
  console.log(
    `[Phase 2] Processing PENDING billing cycles for period: ${period}...`
  );

  const pendingCycles = await prisma.billingCycle.findMany({
    where: { period: period, status: "PENDING" },
    include: { customer: { include: { plan: true } } },
  });

  if (pendingCycles.length === 0) {
    console.log("[Phase 2] No pending cycles to process.");
    return { invoicesCreated: 0 };
  }

  let invoicesCreated = 0;

  for (const cycle of pendingCycles) {
    const { customer } = cycle;
    if (!customer || !customer.plan) continue;

    await prisma.$transaction(async (tx) => {
      // Create the invoice and connect it back to the billing cycle
      await tx.invoice.create({
        data: {
          customer_id: customer.id,
          period: period,
          due_date: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + 10
          ),
          amount: customer.plan.monthly_charge,
          status: InvoiceStatus.DUE,
          billingCycle_id: cycle.id, // ✅ This correctly links the invoice to the cycle
        },
      });

      // ✅ FIX: Update the cycle's status ONLY. Do not set invoice_id here.
      await tx.billingCycle.update({
        where: { id: cycle.id },
        data: {
          status: "BILLED",
        },
      });
    });

    invoicesCreated++;
  }

  console.log(`[Phase 2] Successfully created ${invoicesCreated} invoices.`);
  return { invoicesCreated };
}
/**
 * Handles immediate billing for a brand new customer using the full plan amount.
 */
export async function billNewCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { plan: true },
  });
  if (!customer || !customer.plan) return;

  const now = new Date();
  const period = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  const fullAmount = customer.plan.monthly_charge;

  // ✅ FIX: Use a transaction to create both records in the correct order.
  await prisma.$transaction(async (tx) => {
    // STEP 1: Create the "BILLED" BillingCycle record first to get its ID.
    const newBillingCycle = await tx.billingCycle.create({
      data: {
        customer_id: customer.id,
        period: period,
        status: "BILLED",
      },
    });

    // STEP 2: Create the invoice and link it to the new billing cycle.
    await tx.invoice.create({
      data: {
        customer_id: customer.id,
        period: period,
        due_date: new Date(now.setDate(now.getDate() + 10)),
        amount: fullAmount,
        status: InvoiceStatus.DUE,
        category: "First Bill",
        billingCycle_id: newBillingCycle.id, // ✅ Correctly link the invoice to the cycle
      },
    });
  });

  console.log(
    `Immediately billed new customer ${
      customer.username
    } the full amount of ${fullAmount.toFixed(2)}.`
  );
}
