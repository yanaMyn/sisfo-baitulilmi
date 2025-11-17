import { cookies } from 'next/headers';
import { adminAuth } from './admin';

/**
 * Server-side authentication helper
 * Verifies the user's session cookie and returns the user if authenticated
 */
export async function getServerUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session.value, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated on server
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return !!user;
}
