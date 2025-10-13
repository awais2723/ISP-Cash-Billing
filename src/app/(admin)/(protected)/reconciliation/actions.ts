"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth.server";

export async function approveSession(prevState: any, formData: FormData) {
  const session = await getSession();
  if (session?.role !== "ADMIN" && session?.role !== "MANAGER") {
    return { success: false, message: "Unauthorized" };
  }

  const sessionId = formData.get("sessionId") as string;
  const adminCountedAmount = Number(formData.get("admin_counted_amount"));

  if (!sessionId || isNaN(adminCountedAmount)) {
    return { success: false, message: "Invalid data submitted." };
  }

  try {
    const cashSession = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    });

    if (!cashSession) {
      return { success: false, message: "Session not found." };
    }

    // ✅ FIX: Compare the admin's input with the 'counted_total'.
    if (adminCountedAmount !== cashSession.counted_total) {
      return {
        success: false,
        message: `Amount mismatch. Collector submitted ${cashSession.counted_total}, but you entered ${adminCountedAmount}.`,
      };
    }

    // If amounts match, proceed with approval.
    await prisma.cashSession.update({
      where: { id: sessionId, status: "CLOSED" },
      data: { status: "APPROVED" },
    });

    revalidatePath("/reconciliation");
    return { success: true, message: "Session approved successfully." };
  } catch (error) {
    console.error("Failed to approve session:", error);
    return {
      success: false,
      message: "Database Error: Could not approve session.",
    };
  }
}
