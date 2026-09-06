import type { NextAuthConfig } from 'next-auth';
import { isAdminEmail } from '@/lib/auth/roles';

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.picture = user.image || token.picture;
        token.provider = (user as any).provider || null;
        token.role = isAdminEmail(user.email) ? 'ADMIN' : ((user as any).role || 'USER');
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        (session.user as any).provider = (token.provider as string) || null;
        (session.user as any).role = isAdminEmail(token.email) ? 'ADMIN' : ((token.role as string) || 'USER');
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
