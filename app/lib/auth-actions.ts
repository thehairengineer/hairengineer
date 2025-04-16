'use server'

import { signToken, clearTokenCookie, setTokenCookie, getUserFromToken } from './jwt-auth';
import { redirect } from 'next/navigation';

// Admin credentials with fallback
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Hairengineer2025!';

/**
 * Login action - validate credentials and create JWT
 */
export async function loginAction(formData: FormData) {
  // Get form data
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Validate inputs
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  // Validate credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Create JWT token
    const token = await signToken({
      sub: username,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    });

    // Store token in HTTP-only cookie
    setTokenCookie(token);

    // Instead of returning success and letting client handle redirect,
    // perform the redirect directly on the server
    redirect('/admin/dashboard');
  }

  // Invalid credentials
  return { success: false, error: 'Invalid username or password' };
}

/**
 * Logout action
 */
export async function logoutAction() {
  // Clear auth token cookie
  clearTokenCookie();
  
  // Redirect to login
  redirect('/admin/login');
}

/**
 * Check whether user has admin role - redirects if not authorized
 */
export async function requireAdmin() {
  // Get user from token
  const user = await getUserFromToken();
  
  // If not authenticated or not admin, redirect to login
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }
  
  // Return the user if they are an admin
  return user;
} 