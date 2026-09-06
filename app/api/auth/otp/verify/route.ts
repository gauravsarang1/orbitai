import { NextRequest, NextResponse } from 'next/server';
import {
  verifyEmailVerificationOTP,
  verifyPasswordResetOTPAndSetPassword,
  verifyLoginOTP,
} from '@/lib/otp/service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, type, newPassword, rememberDevice } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP code are required.' },
        { status: 400 }
      );
    }

    if (type === 'PASSWORD_RESET') {
      if (!newPassword) {
        return NextResponse.json(
          { success: false, error: 'New password is required.' },
          { status: 400 }
        );
      }
      const res = await verifyPasswordResetOTPAndSetPassword({
        email,
        otp,
        newPassword,
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (type === 'LOGIN') {
      const res = await verifyLoginOTP({
        email,
        otp,
        rememberDevice: Boolean(rememberDevice),
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    const res = await verifyEmailVerificationOTP({ email, otp });
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (error: any) {
    console.error('API OTP Verify error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to verify OTP.' },
      { status: 500 }
    );
  }
}
