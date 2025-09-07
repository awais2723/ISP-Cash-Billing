import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth'; // We'll get this from the other auth file

// This function is now isolated in a server-only file
export async function getSession() {
    const cookieStore = cookies();
    const token = (await cookies()).get('session_token')?.value;
    if (!token) return null;
    return verifyJwtToken(token);
}