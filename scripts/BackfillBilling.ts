const { PrismaClient, InvoiceStatus } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Define a type for the customer object we're fetching
type CustomerIdentifier = {
  id: string;
  username: string;
};

// ✅ Define a type for the cycle object we're fetching
type CycleIdentifier = {
  customer_id: string;
};

async function main() {
  console.log("🚀 Starting backfill process for unbilled customers...");

  const now = new Date();
  const period = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  const allActiveCustomers: CustomerIdentifier[] =
    await prisma.customer.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, username: true },
    });

  if (allActiveCustomers.length === 0) {
    console.log("No active customers found. Exiting.");
    return;
  }

  const existingCycles: CycleIdentifier[] = await prisma.billingCycle.findMany({
    where: {
      // ✅ Add the type annotation here
      customer_id: {
        in: allActiveCustomers.map((c: CustomerIdentifier) => c.id),
      },
      period: period,
    },
    select: { customer_id: true },
  });
  // ✅ Add the type annotation here
  const billedCustomerIds = new Set(
    existingCycles.map((c: CycleIdentifier) => c.customer_id)
  );

  // ✅ Add the type annotation here
  const unbilledCustomers = allActiveCustomers.filter(
    (c: CustomerIdentifier) => !billedCustomerIds.has(c.id)
  );

  if (unbilledCustomers.length === 0) {
    console.log(
      "✅ All active customers are already billed for this period. No action needed."
    );
    return;
  }

  console.log(
    `Found ${unbilledCustomers.length} unbilled customers for period ${period}.`
  );

  for (const customer of unbilledCustomers) {
    try {
      console.log(
        `   -> Billing new customer: ${customer.username} (ID: ${customer.id})`
      );

      const customerDetails = await prisma.customer.findUnique({
        where: { id: customer.id },
        include: { plan: true },
      });

      if (!customerDetails || !customerDetails.plan) {
        throw new Error("Customer or plan details not found.");
      }

      const fullAmount = customerDetails.plan.monthly_charge;

      await prisma.$transaction(async (tx: any) => {
        // Use 'any' for tx in this script context
        const newBillingCycle = await tx.billingCycle.create({
          data: {
            customer_id: customerDetails.id,
            period: period,
            status: "BILLED",
          },
        });

        await tx.invoice.create({
          data: {
            customer_id: customerDetails.id,
            period: period,
            due_date: new Date(new Date().setDate(now.getDate() + 10)),
            amount: fullAmount,
            status: InvoiceStatus.DUE,
            category: "First Bill (Backfilled)",
            billingCycle_id: newBillingCycle.id,
          },
        });
      });

      console.log(`   ✅ Successfully billed customer ${customer.username}.`);
    } catch (error: any) {
      // Use 'any' for error in this script context
      console.error(
        `   ❌ Failed to bill customer ${customer.username}:`,
        error.message
      );
    }
  }

  console.log("🎉 Backfill process completed.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
