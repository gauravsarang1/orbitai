import { getEmailTransporter, EMAIL_FROM } from './transporter';
import {
  getVerificationEmailHtml,
  getLoginOTPEmailHtml,
  getWelcomeEmailHtml,
  getMatchFoundEmailHtml,
  getLostItemReportedEmailHtml,
  getFoundItemReportedEmailHtml,
  getPasswordResetEmailHtml,
  getPasswordChangedEmailHtml,
  getClaimApprovedEmailHtml,
  getClaimRejectedEmailHtml,
} from './templates';

/**
 * 1. Send Registration OTP Verification Email
 */
export async function sendVerificationOTPEmail({
  email,
  name,
  otp,
}: {
  email: string;
  name?: string;
  otp: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getEmailTransporter();

  console.log('----------------------------------------------------');
  console.log(`✉️ [Registration OTP] Verification code for ${email}: ${otp}`);
  console.log('----------------------------------------------------');

  if (!transporter) {
    return { success: true, messageId: 'dev_console_log' };
  }

  try {
    const html = await getVerificationEmailHtml({ name, otp, expiresMinutes: 5 });
    const info = await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: `Verify Your Email • Orbit AI`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    return {
      success: true,
      error: error?.message || 'SMTP delivery failed, but OTP logged to server console.',
    };
  }
}

/**
 * 2. Send Login OTP Verification Email
 */
export async function sendLoginOTPEmail({
  email,
  name,
  otp,
  browser,
  location,
}: {
  email: string;
  name?: string;
  otp: string;
  browser?: string;
  location?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getEmailTransporter();

  console.log('----------------------------------------------------');
  console.log(`✉️ [Login OTP] Verification code for ${email}: ${otp}`);
  console.log('----------------------------------------------------');

  if (!transporter) {
    return { success: true, messageId: 'dev_console_log' };
  }

  try {
    const html = await getLoginOTPEmailHtml({ name, otp, browser, location });
    const info = await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: `Your Login Verification Code`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending login OTP email:', error);
    return { success: true, error: error?.message };
  }
}

/**
 * 3. Send Welcome Email
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name?: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getWelcomeEmailHtml({ name, email });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: '🎉 Welcome to Orbit AI!',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false };
  }
}

/**
 * 4. Send Match Found Notification Email
 */
export async function sendMatchFoundEmail({
  email,
  name,
  lostItemName,
  foundItemName,
  confidence,
  location,
  imageUrl,
}: {
  email: string;
  name?: string;
  lostItemName: string;
  foundItemName: string;
  confidence: number;
  location?: string;
  imageUrl?: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getMatchFoundEmailHtml({
      name,
      lostItemName,
      foundItemName,
      confidence,
      location,
      imageUrl,
    });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: '🎉 We Found a Possible Match!',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending match found email:', error);
    return { success: false };
  }
}

/**
 * 5. Send Lost Item Reported Email
 */
export async function sendLostItemReportedEmail({
  email,
  name,
  reportId,
  itemName,
  category,
  location,
}: {
  email: string;
  name?: string;
  reportId: string;
  itemName: string;
  category: string;
  location: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getLostItemReportedEmailHtml({
      name,
      reportId,
      itemName,
      category,
      location,
    });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Your Lost Item Has Been Reported',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending lost item email:', error);
    return { success: false };
  }
}

/**
 * 6. Send Found Item Submitted Email
 */
export async function sendFoundItemReportedEmail({
  email,
  name,
  referenceNumber,
  itemName,
  category,
  location,
}: {
  email: string;
  name?: string;
  referenceNumber: string;
  itemName: string;
  category: string;
  location: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getFoundItemReportedEmailHtml({
      name,
      referenceNumber,
      itemName,
      category,
      location,
    });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Thank You For Reporting a Found Item',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending found item email:', error);
    return { success: false };
  }
}

/**
 * 7. Send Password Reset OTP Email
 */
export async function sendPasswordResetOTPEmail({
  email,
  name,
  otp,
}: {
  email: string;
  name?: string;
  otp: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getEmailTransporter();

  console.log('----------------------------------------------------');
  console.log(`🔐 [Reset OTP Email] Password reset code for ${email}: ${otp}`);
  console.log('----------------------------------------------------');

  if (!transporter) {
    return { success: true, messageId: 'dev_console_log' };
  }

  try {
    const html = await getPasswordResetEmailHtml({ name, otp });
    const info = await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: `Reset Your Password`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);
    return {
      success: true,
      error: error?.message || 'SMTP delivery failed, but OTP logged to server console.',
    };
  }
}

/**
 * 8. Send Password Changed Email
 */
export async function sendPasswordChangedEmail({
  email,
  name,
  device,
  location,
}: {
  email: string;
  name?: string;
  device?: string;
  location?: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getPasswordChangedEmailHtml({ name, device, location });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Your Password Was Changed',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password changed email:', error);
    return { success: false };
  }
}

/**
 * 9. Send Claim Approved Email
 */
export async function sendClaimApprovedEmail({
  email,
  name,
  itemName,
  referenceId,
  pickupLocation,
  pickupDate,
}: {
  email: string;
  name?: string;
  itemName: string;
  referenceId: string;
  pickupLocation?: string;
  pickupDate?: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getClaimApprovedEmailHtml({
      name,
      itemName,
      referenceId,
      pickupLocation,
      pickupDate,
    });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Your Claim Has Been Approved',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending claim approved email:', error);
    return { success: false };
  }
}

/**
 * 10. Send Claim Rejected Email
 */
export async function sendClaimRejectedEmail({
  email,
  name,
  itemName,
  referenceId,
  reason,
}: {
  email: string;
  name?: string;
  itemName: string;
  referenceId: string;
  reason?: string;
}): Promise<{ success: boolean }> {
  const transporter = getEmailTransporter();
  if (!transporter) return { success: true };

  try {
    const html = await getClaimRejectedEmailHtml({
      name,
      itemName,
      referenceId,
      reason,
    });
    await transporter.sendMail({
      from: `"Orbit AI" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Claim Verification Failed',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending claim rejected email:', error);
    return { success: false };
  }
}
