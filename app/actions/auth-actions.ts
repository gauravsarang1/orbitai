'use server';

import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  registerSchema,
  loginSchema,
  loginOtpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '@/lib/validation/auth-schemas';
import {
  sendEmailVerificationOTP,
  verifyEmailVerificationOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTPAndSetPassword,
  sendLoginOTP,
  verifyLoginOTP,
  isDeviceTrusted,
} from '@/lib/otp/service';

export async function registerWithCredentials(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const parseResult = registerSchema.safeParse(formData);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return { success: false, error: firstIssue.message };
    }

    const { name, email, password } = parseResult.data;

    // Check if user exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified && existingUser.password) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        };
      }

      if (existingUser.emailVerified && !existingUser.password) {
        // User registered via Google; attach password after verification
        const result = await sendEmailVerificationOTP({
          email,
          name: existingUser.name || name,
          password,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          requiresOtp: true,
          email,
          message:
            'A 6-digit verification code has been sent to your email to link password sign-in.',
          devOtp: result.devOtp,
        };
      }
    }

    // Send OTP email (does not create user in User table until OTP is verified)
    const result = await sendEmailVerificationOTP({
      email,
      name,
      password,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      requiresOtp: true,
      email,
      message: result.message || 'Verification code sent to your email.',
      devOtp: result.devOtp,
    };
  } catch (error: any) {
    console.error('Registration action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during registration. Please try again.',
    };
  }
}

export async function verifyRegistrationOTP({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  try {
    const parseResult = verifyOtpSchema.safeParse({ email, otp });
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const res = await verifyEmailVerificationOTP({ email, otp });
    return res;
  } catch (error: any) {
    console.error('OTP verification action error:', error);
    return {
      success: false,
      error: 'Failed to verify code. Please try again.',
    };
  }
}

export async function resendRegistrationOTP(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const res = await sendEmailVerificationOTP({ email });
    return res;
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return { success: false, error: 'Failed to resend verification code.' };
  }
}

export async function loginWithCredentials(formData: {
  email: string;
  password?: string;
  deviceToken?: string;
  callbackUrl?: string;
}) {
  try {
    const parseResult = loginSchema.safeParse(formData);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const { email, password, deviceToken } = parseResult.data;

    // Validate email and password first
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (!user.emailVerified) {
      const otpRes = await sendEmailVerificationOTP({ email }).catch(() => null);
      return {
        success: false,
        isUnverified: true,
        email,
        devOtp: otpRes?.devOtp,
        error:
          'Your email address is not verified. Redirecting to email verification page...',
      };
    }

    if (!user.password) {
      return {
        success: false,
        error:
          'This account was registered using Google. Please sign in with Google or request a password reset to enable password login.',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Check if device is trusted
    let deviceIsTrusted = false;
    if (deviceToken) {
      deviceIsTrusted = await isDeviceTrusted({ userId: user.id, deviceToken });
    }

    if (deviceIsTrusted) {
      // Direct sign in
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        return { success: false, error: 'Authentication failed.' };
      }

      return { success: true, callbackUrl: formData.callbackUrl || '/' };
    }

    // Device not trusted: Trigger Login OTP (2FA)
    const otpResult = await sendLoginOTP({ email });
    if (!otpResult.success) {
      return { success: false, error: otpResult.error || 'Failed to send login OTP.' };
    }

    return {
      success: true,
      requiresLoginOtp: true,
      email,
      message: 'A 6-digit login verification code was sent to your email.',
      devOtp: otpResult.devOtp,
    };
  } catch (error: any) {
    console.error('Credentials login error:', error);
    return { success: false, error: 'Authentication failed. Please check your credentials.' };
  }
}

export async function verifyLoginOTPAndSignIn(formData: {
  email: string;
  password: string;
  otp: string;
  rememberDevice?: boolean;
  callbackUrl?: string;
}) {
  try {
    const parseResult = loginOtpVerifySchema.safeParse(formData);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const { email, password, otp, rememberDevice } = parseResult.data;

    // Verify Login OTP
    const verifyResult = await verifyLoginOTP({
      email,
      otp,
      rememberDevice,
    });

    if (!verifyResult.success) {
      return { success: false, error: verifyResult.error || 'Invalid verification code.' };
    }

    // Sign in
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      return { success: false, error: 'Login session creation failed.' };
    }

    return {
      success: true,
      callbackUrl: formData.callbackUrl || '/',
      deviceToken: verifyResult.deviceToken,
    };
  } catch (error: any) {
    console.error('Verify Login OTP error:', error);
    return { success: false, error: 'Failed to complete login verification.' };
  }
}

export async function loginWithGoogle(callbackUrl: string = '/') {
  await signIn('google', { redirectTo: callbackUrl });
}

export async function requestForgotPasswordOTP(email: string) {
  try {
    const parseResult = forgotPasswordSchema.safeParse({ email });
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const res = await sendPasswordResetOTP(parseResult.data.email);
    return res;
  } catch (error) {
    console.error('Forgot password action error:', error);
    return { success: false, error: 'Failed to request password reset. Please try again.' };
  }
}

export async function resetPasswordWithOTP(formData: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const parseResult = resetPasswordSchema.safeParse(formData);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }

    const { email, otp, newPassword } = parseResult.data;
    const res = await verifyPasswordResetOTPAndSetPassword({
      email,
      otp,
      newPassword,
    });

    return res;
  } catch (error) {
    console.error('Reset password action error:', error);
    return { success: false, error: 'Failed to reset password. Please try again.' };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: '/' });
}
