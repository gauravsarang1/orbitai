import { Role } from '@prisma/client';

export const ADMIN_EMAILS = [
  'gauravsarang223@gmail.com',
  'gauravsarang2003@gmail.com',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function resolveUserRole(email?: string | null, currentRole?: Role | string | null): Role {
  if (isAdminEmail(email)) {
    return Role.ADMIN;
  }
  if (currentRole === 'ADMIN' || currentRole === Role.ADMIN) {
    return Role.ADMIN;
  }
  return Role.USER;
}
