import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/auth.config';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { isAdminEmail } from '@/lib/auth/roles';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error('No account found with this email address.');
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error(`UNVERIFIED_EMAIL:${email}`);
        }

        if (!user.password) {
          throw new Error(
            'This account was registered using Google. Please sign in with Google or request a password reset to add password sign-in.'
          );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password.');
        }

        const role: Role = isAdminEmail(email) ? Role.ADMIN : user.role || Role.USER;

        // If user was USER role in DB but is now an admin email, update DB
        if (role === Role.ADMIN && user.role !== Role.ADMIN) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: Role.ADMIN },
          }).catch(() => {});
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email!,
          image: user.image,
          provider: user.provider,
          role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      const isAdmin = isAdminEmail(email);

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          const providerStr = account?.provider || 'google';
          let updatedProviders = existingUser.provider || '';

          if (!updatedProviders.includes(providerStr)) {
            updatedProviders = updatedProviders
              ? `${updatedProviders},${providerStr}`
              : providerStr;
          }

          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: existingUser.emailVerified || new Date(),
              name: existingUser.name || user.name,
              image: existingUser.image || user.image,
              role: isAdmin ? Role.ADMIN : existingUser.role,
              provider: updatedProviders,
            },
          });
        }
      } catch (err) {
        console.error('SignIn callback error:', err);
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.picture = user.image || token.picture;
        token.provider = user.provider || null;
        token.role = isAdminEmail(user.email) ? Role.ADMIN : (user.role as Role) || Role.USER;
      }

      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name || (token.name as string);
            token.picture = dbUser.image || (token.picture as string);
            token.provider = dbUser.provider || (token.provider as string);
            token.role = isAdminEmail(dbUser.email) ? Role.ADMIN : dbUser.role;
          }
        } catch (e) {
          console.error('JWT callback db error:', e);
        }
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
        session.user.provider = (token.provider as string) || null;
        session.user.role = isAdminEmail(token.email) ? Role.ADMIN : ((token.role as Role) || Role.USER);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
