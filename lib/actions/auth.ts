'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Create session cookie after login
 */
export async function createSession(idToken: string) {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

/**
 * Destroy session cookie on logout
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
