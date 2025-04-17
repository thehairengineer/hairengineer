import { cookies } from 'next/headers';

/**
 * Check authentication credentials
 */
export const validateCredentials = (username: string, password: string) => {
  // In a real app, you'd check against a database or use an auth service
  return username === 'admin' && password === 'password';
};

/**
 * Create a new session
 */
export const createSession = (username: string) => {
  return {
    id: Math.random().toString(36).substring(2, 15),
    username,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };
};

/**
 * Store the session in cookies
 */
export const storeSession = (session: any) => {
  cookies().set('admin_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30*60 * 60 * 24, // 30 days
    path: '/',
  });
};

/**
 * Clear the session from cookies
 */
export const clearSession = () => {
  cookies().set('admin_session', '', {
    expires: new Date(0),
  });
};

