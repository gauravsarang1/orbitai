import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  sendLoginOTP,
} from '@/lib/otp/service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type, name, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (type === 'PASSWORD_RESET') {
      const res = await sendPasswordResetOTP(email);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (type === 'LOGIN') {
      const res = await sendLoginOTP({ email });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    const res = await sendEmailVerificationOTP({ email, name, password });
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (error: any) {
    console.error('API OTP Send error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send OTP.' },
      { status: 500 }
    );
  }
}
