'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const planSchema = z.object({
  name: z.string().min(3, 'Plan name is required.'),
  monthly_charge: z.coerce.number().min(0, 'Monthly charge must be a positive number.'),
  tax_rate: z.coerce.number().min(0).max(100).optional().default(0),
  company: z.string().optional(),
  purch_price: z.coerce.number().min(0).optional().default(0),
  is_active: z.boolean().default(true),
});

export async function createPlan(data: z.infer<typeof planSchema>) {
  const validatedFields = planSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  try {
    await prisma.plan.create({ data: validatedFields.data });
    revalidatePath('/plans');
    return { success: true, message: 'Plan created successfully.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to create plan.' };
  }
}

export async function updatePlan(id: string, data: z.infer<typeof planSchema>) {
   const validatedFields = planSchema.safeParse(data);
   if (!validatedFields.success) {
     return { success: false, message: 'Invalid form data.' };
   }
   
   try {
     await prisma.plan.update({
         where: { id },
         data: validatedFields.data,
     });
     revalidatePath('/plans');
     return { success: true, message: 'Plan updated successfully.' };
   } catch (error) {
     return { success: false, message: 'Database Error: Failed to update plan.' };
   }
}

// ✅ ADD THE NEW DELETE ACTION
export async function deletePlan(planId: string) {
  if (!planId) {
    return { success: false, message: 'Plan ID is missing.' };
  }

  try {
    await prisma.plan.delete({
      where: { id: planId },
    });
    revalidatePath('/plans');
    return { success: true, message: 'Plan deleted successfully.' };
  } catch (error) {
    // This checks for a specific Prisma error when a foreign key constraint fails
    // (i.e., trying to delete a plan that customers are still assigned to)
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2003') {
      return { success: false, message: 'Cannot delete plan. It is currently in use by one or more customers.' };
    }
    return { success: false, message: 'Database Error: Failed to delete plan.' };
  }
}