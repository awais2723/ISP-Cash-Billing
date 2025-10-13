"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth.server";

const customInvoiceSchema = z.object({
  customerId: z.string(),
  category: z.string().min(1, "Category is required."), // min(1) is better for selects
  notes: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be greater than 0."),
});

// ✅ The function now only expects one argument
export async function createCustomInvoice(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  const data = {
    customerId: formData.get("customerId"),
    category: formData.get("category"),
    notes: formData.get("notes"),
    amount: formData.get("amount"),
  };

  const validatedFields = customInvoiceSchema.safeParse(data);

  if (!validatedFields.success) {
    // ✅ This will print the exact validation error to your server terminal
    console.error(
      "Zod Validation Failed:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: "Invalid data. Please check all fields.",
    };
  }
  if (!validatedFields.success) {
    // ✅ THIS IS THE CRUCIAL DEBUGGING LINE
    console.error(
      "Zod Validation Failed:",
     
    );
    return {
      success: false,
      message: "Invalid data. Please check all fields.",
    };
  }

  try {
    await prisma.invoice.create({
      data: {
        customer_id: validatedFields.data.customerId,
        category: validatedFields.data.category,
        notes: validatedFields.data.notes,
        due_date: new Date(),
        amount: validatedFields.data.amount,
        status: "DUE",
        creator_id: session.userId,
      },
    });

    revalidatePath(`/collector/customers/${validatedFields.data.customerId}`);
    return { success: true, message: "Custom invoice added successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Failed to create custom invoice." };
  }
}
