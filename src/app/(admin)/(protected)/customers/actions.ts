'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from "@/lib/auth.server";
import { billNewCustomer } from "@/lib/billing";

// ✅ Updated schema to include the 'status' field
const CustomerSchema = z.object({
  Fname: z.string().min(3),
  username: z.string().min(3),
  phone: z.string(),
  address: z.string(),
  region_id: z.string(),
  plan_id: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(), // Status is now part of the update
});

export async function createCustomer(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized" };

  const validatedFields = CustomerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { status, ...customerData } = validatedFields.data;

  try {
    const newCustomer = await prisma.customer.create({
      data: { ...customerData, status: "ACTIVE" },
    });
    await billNewCustomer(newCustomer.id);
    revalidatePath("/customers");
    return {
      success: true,
      message: "Customer created and initial bill generated.",
    };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: "A customer with this username already exists.",
      };
    }
    return {
      success: false,
      message: "Database Error: Failed to create customer.",
    };
  }
}

export async function updateCustomer(
  id: string,
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized" };

  const validatedFields = CustomerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  try {
    await prisma.customer.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath("/customers");
    return { success: true, message: "Customer updated successfully." };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: "A customer with this username already exists.",
      };
    }
    return {
      success: false,
      message: "Database Error: Failed to update customer.",
    };
  }
}

// ✅ NEW: Action to delete a customer
export async function deleteCustomer(customerId: string) {
  if (!customerId) {
    return { success: false, message: 'Customer ID is missing.' };
  }

  try {
    // Safety Check: Prevent deleting a customer who has invoices
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { _count: { select: { invoices: true } } },
    });

    if ((customer?._count.invoices ?? 0) > 0) {
      return { success: false, message: 'Cannot delete customer. They have existing invoices.' };
    }
    
    await prisma.customer.delete({
      where: { id: customerId },
    });
    revalidatePath('/customers');
    return { success: true, message: 'Customer deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to delete customer.' };
  }
}