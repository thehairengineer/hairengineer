import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Create a simpler authentication provider for admin login
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Get credentials from environment variables with fallbacks
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Hairengineer2025!';
        
        // Simple credential validation
        if (credentials?.username === adminUsername && credentials?.password === adminPassword) {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@example.com',
            role: 'admin',
          };
        }
        
        // Authentication failed
        return null;
      },
    }),
  ],
  
  // Session configuration - shorter session for testing
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours
  },
  
  // Pages - simple configuration
  pages: {
    signIn: '/admin/login',
  },
  
  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Add role to JWT token
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  // Security settings
  secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here',
  debug: process.env.NODE_ENV === 'development',
}; 