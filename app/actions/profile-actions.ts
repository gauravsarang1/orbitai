'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  phone: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match.',
    path: ['confirmPassword'],
  });

export async function getUserProfile() {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return { success: false, error: 'Unauthenticated' };
    }

    const email = session.user.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Determine activity count (e.g. items reported by this user or email if present)
    // We safely return metrics so frontend can display AI Usage or 'No activity yet'
    return {
      success: true,
      user: {
        ...user,
        username: `@${user.email?.split('@')[0] || 'user'}`,
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      },
      stats: {
        chats: 0,
        aiRequests: 0,
        projects: 0,
        tokensUsed: 0,
      },
    };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: 'Failed to load profile' };
  }
}

export async function updateUserProfile(data: { name: string; phone?: string }) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return { success: false, error: 'Unauthenticated' };
    }

    const parseResult = updateProfileSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const updated = await prisma.user.update({
      where: { email: session.user.email.toLowerCase() },
      data: {
        name: parseResult.data.name,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: updated.name,
        email: updated.email,
      },
    };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function changePassword(formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return { success: false, error: 'Unauthenticated' };
    }

    const parseResult = changePasswordSchema.safeParse(formData);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.password) {
      return {
        success: false,
        error: 'Your account uses Google login and has no password set.',
      };
    }

    const isPasswordValid = await bcrypt.compare(formData.currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect current password.' };
    }

    const hashedPassword = await bcrypt.hash(formData.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password changed successfully!' };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to change password.' };
  }
}
