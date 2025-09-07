'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth.server';

export async function approveSession(formData: FormData) {
  const session = getSession();
  const sessionId = formData.get('sessionId') as string;

  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }
  if (!sessionId) {
    return { error: 'Session ID is missing.' };
  }

  try {
    // A transaction isn't strictly needed here as we are only updating one record,
    // but it's good practice if you later add more logic (e.g., logging).
    await prisma.cashSession.update({
      where: {
        id: sessionId,
        status: 'CLOSED', // Ensure we can only approve a closed session
      },
      data: {
        status: 'APPROVED',
      },
    });

    revalidatePath('/reconciliation');
    return { success: 'Session approved.' };
  } catch (error) {
    console.error('Failed to approve session:', error);
    return { error: 'Database error: Could not approve session.' };
  }
}