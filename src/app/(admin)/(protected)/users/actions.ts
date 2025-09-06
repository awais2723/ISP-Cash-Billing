'use server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/auth';

const userSchema = z.object({
  Fname: z.string().min(3, 'Full name is required'),
  username: z.string().min(3, 'Username is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLECTOR']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  regionIds: z.array(z.string()).optional(),
});

export async function createUser(data: z.infer<typeof userSchema>) {
  const validatedFields = userSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const { Fname, username, phone, password, role, status, regionIds } = validatedFields.data;

  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  try {
    const hashedPassword = await hashPassword(password);
    
    await prisma.$transaction(async (tx: { user: { create: (arg0: { data: { Fname: string; username: string; phone: string; password: string; role: "ADMIN" | "MANAGER" | "COLLECTOR"; status: "ACTIVE" | "INACTIVE" | "SUSPENDED"; }; }) => any; }; assignment: { createMany: (arg0: { data: { user_id: any; region_id: string; active_from: Date; }[]; }) => any; }; }) => {
        const newUser = await tx.user.create({
            data: { Fname, username, phone, password: hashedPassword, role, status },
        });

        if (role === 'COLLECTOR' && regionIds && regionIds.length > 0) {
            await tx.assignment.createMany({
                data: regionIds.map(regionId => ({
                    user_id: newUser.id,
                    region_id: regionId,
                    active_from: new Date(),
                })),
            });
        }
    });

    revalidatePath('/users');
    return { success: true, message: 'User created successfully.' };
  } catch (error) {
    console.error(error);
    // Check for unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
        return { success: false, message: 'Username or phone number already exists.' };
    }
    return { success: false, message: 'Database Error: Failed to Create User.' };
  }
}

export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
   const validatedFields = userSchema.safeParse(data);
   if (!validatedFields.success) {
     return { success: false, message: 'Invalid form data.' };
   }

   const { Fname, username, phone, password, role, status, regionIds } = validatedFields.data;
   
   try {
     const userDataUpdate: any = { Fname, username, phone, role, status };
     
     if (password && password.length >= 6) {
       userDataUpdate.password = await hashPassword(password);
     }
     
     await prisma.$transaction(async (tx: { user: { update: (arg0: { where: { id: string; }; data: any; }) => any; }; assignment: { deleteMany: (arg0: { where: { user_id: string; } | { user_id: string; }; }) => any; createMany: (arg0: { data: { user_id: string; region_id: string; active_from: Date; }[]; }) => any; }; }) => {
         await tx.user.update({
             where: { id },
             data: userDataUpdate,
         });

         if (role === 'COLLECTOR') {
             // Delete existing assignments and create new ones.
             // This is the simplest way to manage many-to-many relationships.
             await tx.assignment.deleteMany({ where: { user_id: id }});
             if (regionIds && regionIds.length > 0) {
                 await tx.assignment.createMany({
                     data: regionIds.map(regionId => ({
                         user_id: id,
                         region_id: regionId,
                         active_from: new Date(),
                     })),
                 });
             }
         } else {
            // If user is no longer a collector, remove all assignments
            await tx.assignment.deleteMany({ where: { user_id: id }});
         }
     });

     revalidatePath('/users');
     return { success: true, message: 'User updated successfully.' };
   } catch (error) {
    console.error(error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
        return { success: false, message: 'Username or phone number already exists.' };
    }
       return { success: false, message: 'Database Error: Failed to Update User.' };
     }
  }