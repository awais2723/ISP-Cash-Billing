'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  // Delete the session cookie
  (await
    // Delete the session cookie
    cookies()).delete('session_token');
  
  // Redirect to the login page
  redirect('/login');
}