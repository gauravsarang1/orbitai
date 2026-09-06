import { Role } from '@prisma/client';

export type Permission =
  | 'manage:users'
  | 'manage:reports'
  | 'view:admin-dashboard'
  | 'create:report'
  | 'claim:item'
  | 'manage:own-profile';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    'manage:users',
    'manage:reports',
    'view:admin-dashboard',
    'create:report',
    'claim:item',
    'manage:own-profile',
  ],
  [Role.USER]: [
    'create:report',
    'claim:item',
    'manage:own-profile',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isOwnerOrAdmin(userId: string, resourceOwnerId: string, role: Role): boolean {
  if (role === Role.ADMIN) return true;
  return userId === resourceOwnerId;
}
