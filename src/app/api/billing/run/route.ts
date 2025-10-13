import { NextRequest, NextResponse } from "next/server";
import { createBillingCycles, processBillingCycles } from "@/lib/billing";

/**
 * The main billing engine API endpoint, triggered by a secure Cron Job.
 * It orchestrates the two-phase billing process.
 */
export async function POST(req: NextRequest) {
  // 1. Security Check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const period = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    // 2. Run Phase 1: Create the "to-do list" of pending billing cycles.
    const { created } = await createBillingCycles(period);

    // 3. Run Phase 2: Process the "to-do list" and generate the invoices.
    const { invoicesCreated } = await processBillingCycles(period);

    // 4. Formulate the final summary
    const summary = `Billing run for ${period} complete. New cycles prepared: ${created}. Invoices generated from queue: ${invoicesCreated}.`;
    console.log(summary);

    return NextResponse.json({
      message: "Billing run completed successfully.",
      summary: summary,
    });
  } catch (error) {
    console.error("CRITICAL: Automated billing run failed!", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred during the billing run." },
      { status: 500 }
    );
  }
}
