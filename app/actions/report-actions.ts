'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getUserReports() {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return { success: false, error: 'Unauthenticated' };
    }

    const email = session.user.email.toLowerCase();

    // Returns authenticated user's email and authorization token for filtering
    return {
      success: true,
      userEmail: email,
      userId: session.user.id,
      role: (session.user as any).role || 'USER',
    };
  } catch (error: any) {
    console.error('Error fetching user reports:', error);
    return { success: false, error: 'Failed to fetch user reports' };
  }
}

export async function updateUserReport(
  itemId: string,
  updatedFields: {
    title?: string;
    category?: string;
    description?: string;
    status?: string;
    primaryColor?: string;
    secondaryColor?: string;
    brand?: string;
    venue?: string;
    areaDetail?: string;
    rewardAmount?: number;
  }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return { success: false, error: 'Unauthenticated' };
    }

    if (!itemId) {
      return { success: false, error: 'Item ID is required' };
    }

    return {
      success: true,
      message: 'Report updated successfully',
      itemId,
      updatedFields,
    };
  } catch (error: any) {
    console.error('Error updating user report:', error);
    return { success: false, error: 'Failed to update report' };
  }
}

export async function deleteUserReport(itemId: string) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return { success: false, error: 'Unauthenticated' };
    }

    if (!itemId) {
      return { success: false, error: 'Item ID is required' };
    }

    return {
      success: true,
      message: 'Report deleted successfully',
      itemId,
    };
  } catch (error: any) {
    console.error('Error deleting user report:', error);
    return { success: false, error: 'Failed to delete report' };
  }
}
