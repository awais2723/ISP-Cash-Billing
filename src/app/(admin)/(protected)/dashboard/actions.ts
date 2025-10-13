"use server";

import { revalidatePath } from "next/cache";
import { createBillingCycles, processBillingCycles } from "@/lib/billing";
import { getSession } from "@/lib/auth.server";

export async function runBillingEngine() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") throw new Error("Unauthorized");

    const now = new Date();
    const period = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    // Run Phase 1: Create the to-do list
    const { created } = await createBillingCycles(period);

    // Run Phase 2: Process the to-do list
    const { invoicesCreated } = await processBillingCycles(period);

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Billing run complete. New cycles: ${created}. Invoices generated: ${invoicesCreated}.`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred." };
  }
}
