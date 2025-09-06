'use server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

const CustomerSchema = z.object({
  Fname: z.string().min(3),
  username: z.string().min(3),
  phone: z.string(),
  address: z.string(),
  region_id: z.string(),
  plan_id: z.string(),
});

export async function createCustomer(prevState: any, formData: FormData) {
  const session = getSession();
  if (!session) return { message: 'Unauthorized' };

  const validatedFields = CustomerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { message: 'Invalid form data.' };
  }

  try {
    await prisma.customer.create({ data: validatedFields.data });
    revalidatePath('/customers');
    return { success: true, message: 'Customer created.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Create Customer.' };
  }
}

export async function updateCustomer(id: string, prevState: any, formData: FormData) {
   const session = getSession();
   if (!session) return { message: 'Unauthorized' };

   const validatedFields = CustomerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { message: 'Invalid form data.' };
  }
  
  try {
    await prisma.customer.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath('/customers');
    return { success: true, message: 'Customer updated.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }
}