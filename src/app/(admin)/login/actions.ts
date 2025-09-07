'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { comparePasswords, createJwtToken } from '@/lib/auth';

export async function loginUser(formData: FormData) {
  // ... username/password retrieval
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    redirect('/login?error=Missing credentials');
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await comparePasswords(password, user.password))) {
    redirect('/login?error=Invalid credentials');
  }

  // ... status checks ...
  if (user.status === 'SUSPENDED') { /* ... */ }
  if (user.status === 'INACTIVE') { /* ... */ }

  // ✅ Pass the user's Fname when creating the token
  const token = createJwtToken({ 
    userId: user.id, 
    role: user.role, 
    Fname: user.Fname 
  });
  
  (await cookies()).set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4,
    path: '/',
  });

  // ... role-based redirection logic ...
  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    redirect('/dashboard');
  } else if (user.role === 'COLLECTOR') {
    redirect('/collector/dashboard');
  } else {
    redirect('/login?error=Access denied');
  }
}