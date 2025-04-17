import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import jwt from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Added safety checks for environment variables
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'Hairengineer2025!';
const authSecret = process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Use our safely extracted environment variables
        if (credentials?.username === adminUsername && 
            credentials?.password === adminPassword) {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@hair-engineer.com',
            role: 'admin'
          } as ExtendedUser
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as ExtendedUser).role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Simplified cookie configuration to avoid issues
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Always use secure in production
      },
    },
  },
  secret: authSecret,
  debug: false, // Disable debug mode in production
  // Fix for Invalid Compact JWE error by using custom encode/decode
  jwt: {
    encode: async ({ secret, token }) => {
      return jwt.sign(token as any, secret);
    },
    decode: async ({ secret, token }) => {
      return jwt.verify(token as string, secret) as JWT;
    },
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}


