import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { isAdminEmail } from '@/lib/auth/roles';
import {
  sendVerificationOTPEmail,
  sendPasswordResetOTPEmail,
  sendLoginOTPEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
} from '@/lib/email/service';

const OTP_EXPIRATION_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const TRUSTED_DEVICE_DAYS = 30;

export function generate6DigitOTP(): string {
  // Crypto-secure random 6-digit code between 100000 and 999999
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Timing-safe string equality check to prevent side-channel timing attacks.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf-8'), Buffer.from(b, 'utf-8'));
}

/**
 * Generate and store an Email Verification OTP, then send via email.
 */
export async function sendEmailVerificationOTP({
  email,
  name,
  password,
}: {
  email: string;
  name?: string;
  password?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  resendCooldownSeconds?: number;
  devOtp?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();

  // Cleanup old expired OTPs proactively
  cleanupExpiredOTPs().catch(() => {});

  // Check if user already exists and is verified with password
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser && existingUser.emailVerified && existingUser.password) {
    return {
      success: false,
      error: 'An account with this email is already registered and verified. Please sign in.',
    };
  }

  // Check resend cooldown
  const existingOTP = await prisma.emailVerificationOTP.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingOTP) {
    const secondsSinceLastUpdate = Math.floor(
      (Date.now() - new Date(existingOTP.updatedAt).getTime()) / 1000
    );

    if (secondsSinceLastUpdate < RESEND_COOLDOWN_SECONDS) {
      const waitTime = RESEND_COOLDOWN_SECONDS - secondsSinceLastUpdate;
      return {
        success: false,
        error: `Please wait ${waitTime} seconds before requesting a new verification code.`,
        resendCooldownSeconds: waitTime,
      };
    }
  }

  const rawOTP = generate6DigitOTP();
  const hashedOTP = hashOTP(rawOTP);
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // Upsert OTP record
  await prisma.emailVerificationOTP.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      name: name?.trim(),
      hashedPassword,
      hashedOTP,
      expiresAt,
      attempts: 0,
    },
    update: {
      name: name?.trim(),
      hashedPassword: hashedPassword || existingOTP?.hashedPassword,
      hashedOTP,
      expiresAt,
      attempts: 0,
    },
  });

  // Send Email
  await sendVerificationOTPEmail({
    email: normalizedEmail,
    name: name || existingUser?.name || 'User',
    otp: rawOTP,
  });

  return {
    success: true,
    message: `A 6-digit verification code has been sent to ${normalizedEmail}. Code expires in 5 minutes.`,
    devOtp: rawOTP,
  };
}

/**
 * Verify Email Verification OTP and create / verify User.
 */
export async function verifyEmailVerificationOTP({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  user?: any;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOTP = otp.trim();

  const otpRecord = await prisma.emailVerificationOTP.findUnique({
    where: { email: normalizedEmail },
  });

  if (!otpRecord) {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.emailVerified) {
      return {
        success: true,
        message: 'Email address verified successfully! Your account is ready.',
        user: existingUser,
      };
    }

    return {
      success: false,
      error: 'No active verification code found for this email. Please request a new code.',
    };
  }

  // Check expiration
  if (new Date() > new Date(otpRecord.expiresAt)) {
    await prisma.emailVerificationOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check attempts limit
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await prisma.emailVerificationOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
    };
  }

  // Verify hash with timing-safe comparison
  const candidateHash = hashOTP(cleanOTP);
  if (!timingSafeEqualStrings(candidateHash, otpRecord.hashedOTP)) {
    const updatedAttempts = otpRecord.attempts + 1;
    const remaining = MAX_ATTEMPTS - updatedAttempts;

    if (remaining <= 0) {
      await prisma.emailVerificationOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return {
        success: false,
        error: 'Too many incorrect attempts. Code invalidated. Please request a new code.',
      };
    }

    await prisma.emailVerificationOTP.update({
      where: { id: otpRecord.id },
      data: { attempts: updatedAttempts },
    });

    return {
      success: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  // OTP is valid! Create or update User record.
  const role: Role = isAdminEmail(normalizedEmail) ? Role.ADMIN : Role.USER;

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  let user;

  if (existingUser) {
    const currentProvider = existingUser.provider || '';
    const updatedProvider = currentProvider
      ? currentProvider.includes('credentials')
        ? currentProvider
        : `${currentProvider},credentials`
      : 'credentials';

    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        name: existingUser.name || otpRecord.name,
        password: otpRecord.hashedPassword || existingUser.password,
        role: isAdminEmail(normalizedEmail) ? Role.ADMIN : existingUser.role || role,
        provider: updatedProvider,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: otpRecord.name || 'User',
        password: otpRecord.hashedPassword,
        emailVerified: new Date(),
        role,
        provider: 'credentials',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          otpRecord.name || normalizedEmail
        )}`,
      },
    });
  }

  // Cleanup OTP record immediately
  await prisma.emailVerificationOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});

  // Send Welcome email
  sendWelcomeEmail({ email: normalizedEmail, name: user.name || undefined }).catch(() => {});

  return {
    success: true,
    message: 'Email address verified successfully! Your account is ready.',
    user,
  };
}

/**
 * Send Password Reset OTP via email.
 */
export async function sendPasswordResetOTP(
  email: string
): Promise<{ success: boolean; message?: string; error?: string; devOtp?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  cleanupExpiredOTPs().catch(() => {});

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Return positive message for security
    return {
      success: true,
      message: 'If an account exists with this email, a 6-digit reset code has been sent.',
    };
  }

  // Check resend cooldown
  const existingOTP = await prisma.passwordResetOTP.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingOTP) {
    const secondsSinceLastUpdate = Math.floor(
      (Date.now() - new Date(existingOTP.updatedAt).getTime()) / 1000
    );

    if (secondsSinceLastUpdate < RESEND_COOLDOWN_SECONDS) {
      const waitTime = RESEND_COOLDOWN_SECONDS - secondsSinceLastUpdate;
      return {
        success: false,
        error: `Please wait ${waitTime} seconds before requesting a new reset code.`,
      };
    }
  }

  const rawOTP = generate6DigitOTP();
  const hashedOTP = hashOTP(rawOTP);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.passwordResetOTP.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      hashedOTP,
      expiresAt,
      attempts: 0,
    },
    update: {
      hashedOTP,
      expiresAt,
      attempts: 0,
    },
  });

  await sendPasswordResetOTPEmail({
    email: normalizedEmail,
    name: user.name || 'User',
    otp: rawOTP,
  });

  return {
    success: true,
    message: `A 6-digit password reset code has been sent to ${normalizedEmail}. Code expires in 5 minutes.`,
    devOtp: rawOTP,
  };
}

/**
 * Verify Password Reset OTP, update User password, and invalidate existing sessions.
 */
export async function verifyPasswordResetOTPAndSetPassword({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOTP = otp.trim();

  const otpRecord = await prisma.passwordResetOTP.findUnique({
    where: { email: normalizedEmail },
  });

  if (!otpRecord) {
    return {
      success: false,
      error: 'No active password reset code found for this email. Please request a new code.',
    };
  }

  if (new Date() > new Date(otpRecord.expiresAt)) {
    await prisma.passwordResetOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    return {
      success: false,
      error: 'Password reset code has expired. Please request a new code.',
    };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await prisma.passwordResetOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
    };
  }

  const candidateHash = hashOTP(cleanOTP);
  if (!timingSafeEqualStrings(candidateHash, otpRecord.hashedOTP)) {
    const updatedAttempts = otpRecord.attempts + 1;
    const remaining = MAX_ATTEMPTS - updatedAttempts;

    if (remaining <= 0) {
      await prisma.passwordResetOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return {
        success: false,
        error: 'Too many incorrect attempts. Reset code invalidated.',
      };
    }

    await prisma.passwordResetOTP.update({
      where: { id: otpRecord.id },
      data: { attempts: updatedAttempts },
    });

    return {
      success: false,
      error: `Invalid reset code. ${remaining} attempt(s) remaining.`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and ensure emailVerified is set
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      emailVerified: user.emailVerified || new Date(),
    },
  });

  // Invalidate all existing sessions to force re-login on all devices
  await prisma.session.deleteMany({
    where: { userId: user.id },
  }).catch(() => {});

  // Delete OTP record immediately
  await prisma.passwordResetOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});

  // Notify user via email
  sendPasswordChangedEmail({
    email: normalizedEmail,
    name: user.name || undefined,
  }).catch(() => {});

  return {
    success: true,
    message: 'Your password has been reset successfully. All existing sessions have been signed out. Please sign in with your new password.',
  };
}

/**
 * Send 2FA / Login OTP Email.
 */
export async function sendLoginOTP({
  email,
  browser,
  location,
}: {
  email: string;
  browser?: string;
  location?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  devOtp?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();

  cleanupExpiredOTPs().catch(() => {});

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return {
      success: false,
      error: 'Account not found.',
    };
  }

  // Check cooldown
  const existingOTP = await prisma.loginOTP.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingOTP) {
    const secondsSinceLastUpdate = Math.floor(
      (Date.now() - new Date(existingOTP.updatedAt).getTime()) / 1000
    );

    if (secondsSinceLastUpdate < RESEND_COOLDOWN_SECONDS) {
      const waitTime = RESEND_COOLDOWN_SECONDS - secondsSinceLastUpdate;
      return {
        success: false,
        error: `Please wait ${waitTime} seconds before requesting a new login code.`,
      };
    }
  }

  const rawOTP = generate6DigitOTP();
  const hashedOTP = hashOTP(rawOTP);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.loginOTP.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      hashedOTP,
      expiresAt,
      attempts: 0,
    },
    update: {
      hashedOTP,
      expiresAt,
      attempts: 0,
    },
  });

  await sendLoginOTPEmail({
    email: normalizedEmail,
    name: user.name || 'User',
    otp: rawOTP,
    browser,
    location,
  });

  return {
    success: true,
    message: `A 6-digit login verification code was sent to ${normalizedEmail}. Code expires in 5 minutes.`,
    devOtp: rawOTP,
  };
}

/**
 * Verify 2FA / Login OTP and handle "Remember Device".
 */
export async function verifyLoginOTP({
  email,
  otp,
  rememberDevice = false,
  deviceName,
  browser,
  ipAddress,
}: {
  email: string;
  otp: string;
  rememberDevice?: boolean;
  deviceName?: string;
  browser?: string;
  ipAddress?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  deviceToken?: string;
  user?: any;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOTP = otp.trim();

  const otpRecord = await prisma.loginOTP.findUnique({
    where: { email: normalizedEmail },
  });

  if (!otpRecord) {
    return {
      success: false,
      error: 'No active login verification code found. Please request a new code.',
    };
  }

  if (new Date() > new Date(otpRecord.expiresAt)) {
    await prisma.loginOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    return {
      success: false,
      error: 'Login verification code has expired. Please try signing in again.',
    };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await prisma.loginOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please try signing in again.',
    };
  }

  const candidateHash = hashOTP(cleanOTP);
  if (!timingSafeEqualStrings(candidateHash, otpRecord.hashedOTP)) {
    const updatedAttempts = otpRecord.attempts + 1;
    const remaining = MAX_ATTEMPTS - updatedAttempts;

    if (remaining <= 0) {
      await prisma.loginOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return {
        success: false,
        error: 'Too many incorrect attempts. Login code invalidated.',
      };
    }

    await prisma.loginOTP.update({
      where: { id: otpRecord.id },
      data: { attempts: updatedAttempts },
    });

    return {
      success: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  // Delete Login OTP record immediately
  await prisma.loginOTP.delete({ where: { id: otpRecord.id } }).catch(() => {});

  let deviceToken: string | undefined = undefined;

  if (rememberDevice) {
    deviceToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);

    await prisma.trustedDevice.create({
      data: {
        userId: user.id,
        deviceToken,
        deviceName: deviceName || 'Trusted Browser/Device',
        browser,
        ipAddress,
        expiresAt,
      },
    });
  }

  return {
    success: true,
    message: 'Login OTP verified successfully.',
    deviceToken,
    user,
  };
}

/**
 * Check if a device token is valid and trusted for a user.
 */
export async function isDeviceTrusted({
  userId,
  deviceToken,
}: {
  userId: string;
  deviceToken: string;
}): Promise<boolean> {
  if (!userId || !deviceToken) return false;

  const trusted = await prisma.trustedDevice.findUnique({
    where: { deviceToken },
  });

  if (!trusted || trusted.userId !== userId) {
    return false;
  }

  if (new Date() > new Date(trusted.expiresAt)) {
    await prisma.trustedDevice.delete({ where: { id: trusted.id } }).catch(() => {});
    return false;
  }

  // Update updatedAt to extend active usage visibility
  await prisma.trustedDevice.update({
    where: { id: trusted.id },
    data: { updatedAt: new Date() },
  }).catch(() => {});

  return true;
}

/**
 * Lazy cleanup function to remove expired OTP and trusted device records.
 */
export async function cleanupExpiredOTPs() {
  try {
    const now = new Date();
    await Promise.allSettled([
      prisma.emailVerificationOTP.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.passwordResetOTP.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.loginOTP.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.trustedDevice.deleteMany({ where: { expiresAt: { lt: now } } }),
    ]);
  } catch {
    // Safe background cleanup
  }
}
