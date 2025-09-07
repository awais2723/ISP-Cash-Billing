'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const regionSchema = z.object({
  name: z.string().min(2, 'Region name must be at least 2 characters.'),
  parent_id: z.string().optional(),
});

export async function createRegion(data: z.infer<typeof regionSchema>) {
  const validatedFields = regionSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  const { name, parent_id } = validatedFields.data;

  try {
    await prisma.region.create({
      data: {
        name,
        parent_id: parent_id === 'none' || !parent_id ? null : parent_id,
      },
    });
    revalidatePath('/regions');
    return { success: true, message: 'Region created successfully.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to create region.' };
  }
}

export async function updateRegion(id: string, data: z.infer<typeof regionSchema>) {
   const validatedFields = regionSchema.safeParse(data);
   if (!validatedFields.success) {
     return { success: false, message: 'Invalid data provided.' };
   }

   const { name, parent_id } = validatedFields.data;
   
   try {
     await prisma.region.update({
         where: { id },
         data: {
            name,
            parent_id: parent_id === 'none' || !parent_id ? null : parent_id,
         },
     });
     revalidatePath('/regions');
     return { success: true, message: 'Region updated successfully.' };
   } catch (error) {
     return { success: false, message: 'Database Error: Failed to update region.' };
   }
}

// your deleteRegion action remains the same

export async function deleteRegion(regionId: string) {
  if (!regionId) {
    return { success: false, message: 'Region ID is missing.' };
  }

  try {
    // Check if the region has sub-regions or customers before deleting
    const region = await prisma.region.findUnique({
        where: { id: regionId },
        include: { _count: { select: { children: true, customers: true }}}
    });

    if (!region) {
        return { success: false, message: 'Region not found.' };
    }

    if (region._count.children > 0) {
        return { success: false, message: 'Cannot delete. This region has sub-regions assigned to it.' };
    }
    if (region._count.customers > 0) {
        return { success: false, message: 'Cannot delete. This region has customers assigned to it.' };
    }

    await prisma.region.delete({
      where: { id: regionId },
    });
    revalidatePath('/regions');
    return { success: true, message: 'Region deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to delete region.' };
  }
}