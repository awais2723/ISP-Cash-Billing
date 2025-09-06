'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { comparePasswords, createJwtToken } from '@/lib/auth';

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    // In a real app, you'd return an error state
    redirect('/login?error=Missing credentials');
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await comparePasswords(password, user.password))) {
    redirect('/login?error=Invalid credentials');
  }

  // Allow only Admin and Manager roles to access the panel
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    redirect('/login?error=Access denied');
  }

  const token = createJwtToken({ userId: user.id, role: user.role });

  (await cookies()).set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  redirect('/dashboard'); // Redirect to the main dashboard after login
}