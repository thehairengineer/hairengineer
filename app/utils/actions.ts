'use server'

import { redirect } from 'next/navigation';
import { validateCredentials, createSession, storeSession, clearSession } from './auth';

/**
 * Login action - validates credentials and creates a session
 */
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Validate inputs
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  // Validate credentials
  if (!validateCredentials(username, password)) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Create and store session
  const session = createSession(username);
  storeSession(session);

  return { success: true };
}

/**
 * Logout action - clears the session
 */
export async function logoutAction() {
  clearSession();
  redirect('/admin/login');
} 