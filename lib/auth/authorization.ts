import { auth } from '@/auth';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  provider?: string | null;
}

/**
 * Ensures the caller is authenticated. Throws or returns user session.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session || !session.user || !session.user.id || !session.user.email) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const role = (session.user.role as Role) || Role.USER;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role,
  };
}

/**
 * Ensures the caller is an authenticated ADMIN.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== Role.ADMIN) {
    throw new Error('Forbidden: Administrative privileges required.');
  }

  return user;
}

/**
 * Ensures the caller has one of the specified roles.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Required role in [${allowedRoles.join(', ')}]`);
  }

  return user;
}

/**
 * Ensures the caller is either the owner of the resource or an Admin.
 */
export async function requireOwnership(resourceUserId: string): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== Role.ADMIN && user.id !== resourceUserId) {
    throw new Error('Forbidden: You do not have permission to access or modify this resource.');
  }

  return user;
}
