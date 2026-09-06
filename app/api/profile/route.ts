import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.').optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
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
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('Error fetching profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = session.user.email.toLowerCase();

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        ...(parseResult.data.name && { name: parseResult.data.name }),
        ...(parseResult.data.image !== undefined && { image: parseResult.data.image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        provider: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
