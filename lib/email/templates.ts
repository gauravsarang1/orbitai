import React from 'react';

import { RegisterOTP } from '@/emails/RegisterOTP';
import { LoginOTP } from '@/emails/LoginOTP';
import { Welcome } from '@/emails/Welcome';
import { MatchFound } from '@/emails/MatchFound';
import { LostItemReported } from '@/emails/LostItemReported';
import { FoundItemReported } from '@/emails/FoundItemReported';
import { PasswordReset } from '@/emails/PasswordReset';
import { PasswordChanged } from '@/emails/PasswordChanged';
import { ClaimApproved } from '@/emails/ClaimApproved';
import { ClaimRejected } from '@/emails/ClaimRejected';

/**
 * Dynamically import react-dom/server on demand so Next.js build does not flag top-level server imports
 */
async function renderComponentToHtml(element: React.ReactElement): Promise<string> {
  const ReactDOMServer = await import('react-dom/server');
  return `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`;
}

/**
 * 1. Registration OTP Verification Email
 */
export async function getVerificationEmailHtml({
  name = 'Valued User',
  otp,
  expiresMinutes = 5,
  actionUrl,
}: {
  name?: string;
  otp: string;
  expiresMinutes?: number;
  actionUrl?: string;
}): Promise<string> {
  const element = React.createElement(RegisterOTP, {
    name,
    otp,
    expiryMinutes: expiresMinutes,
    actionUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 2. Login OTP Verification Email
 */
export async function getLoginOTPEmailHtml({
  name = 'Valued User',
  otp,
  browser,
  location,
  time,
  ipAddress,
  actionUrl,
}: {
  name?: string;
  otp: string;
  browser?: string;
  location?: string;
  time?: string;
  ipAddress?: string;
  actionUrl?: string;
}): Promise<string> {
  const element = React.createElement(LoginOTP, {
    name,
    otp,
    browser,
    location,
    time,
    ipAddress,
    actionUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 3. Welcome / Account Successfully Created Email
 */
export async function getWelcomeEmailHtml({
  name = 'Valued User',
  email = 'user@example.com',
  registrationDate,
  dashboardUrl,
}: {
  name?: string;
  email?: string;
  registrationDate?: string;
  dashboardUrl?: string;
}): Promise<string> {
  const element = React.createElement(Welcome, {
    name,
    email,
    registrationDate,
    dashboardUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 4. Match Found Notification Email
 */
export async function getMatchFoundEmailHtml({
  name = 'Valued User',
  lostItemName,
  foundItemName,
  confidence,
  date,
  location,
  reportedBy,
  imageUrl,
  matchUrl,
  contactUrl,
}: {
  name?: string;
  lostItemName: string;
  foundItemName: string;
  confidence: number;
  date?: string;
  location?: string;
  reportedBy?: string;
  imageUrl?: string;
  matchUrl?: string;
  contactUrl?: string;
}): Promise<string> {
  const element = React.createElement(MatchFound, {
    name,
    lostItemName,
    foundItemName,
    confidence,
    date,
    location,
    reportedBy,
    imageUrl,
    matchUrl,
    contactUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 5. Item Successfully Reported (Lost Item)
 */
export async function getLostItemReportedEmailHtml({
  name = 'Valued User',
  reportId,
  itemName,
  category,
  location,
  date,
  trackUrl,
}: {
  name?: string;
  reportId: string;
  itemName: string;
  category: string;
  location: string;
  date?: string;
  trackUrl?: string;
}): Promise<string> {
  const element = React.createElement(LostItemReported, {
    name,
    reportId,
    itemName,
    category,
    location,
    date,
    trackUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 6. Item Successfully Submitted (Found Item)
 */
export async function getFoundItemReportedEmailHtml({
  name = 'Valued User',
  referenceNumber,
  itemName,
  category,
  location,
  date,
  submissionUrl,
}: {
  name?: string;
  referenceNumber: string;
  itemName: string;
  category: string;
  location: string;
  date?: string;
  submissionUrl?: string;
}): Promise<string> {
  const element = React.createElement(FoundItemReported, {
    name,
    referenceNumber,
    itemName,
    category,
    location,
    date,
    submissionUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 7. Password Reset OTP Email
 */
export async function getPasswordResetEmailHtml({
  name = 'Valued User',
  otp,
  resetUrl,
}: {
  name?: string;
  otp: string;
  resetUrl?: string;
}): Promise<string> {
  const element = React.createElement(PasswordReset, {
    name,
    otp,
    resetUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 8. Password Changed Successfully Email
 */
export async function getPasswordChangedEmailHtml({
  name = 'Valued User',
  time,
  device,
  browser,
  location,
  securityUrl,
}: {
  name?: string;
  time?: string;
  device?: string;
  browser?: string;
  location?: string;
  securityUrl?: string;
}): Promise<string> {
  const element = React.createElement(PasswordChanged, {
    name,
    time,
    device,
    browser,
    location,
    securityUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 9. Claim Approved Email
 */
export async function getClaimApprovedEmailHtml({
  name = 'Valued User',
  itemName,
  referenceId,
  pickupLocation,
  pickupDate,
  instructions,
  claimUrl,
}: {
  name?: string;
  itemName: string;
  referenceId: string;
  pickupLocation?: string;
  pickupDate?: string;
  instructions?: string;
  claimUrl?: string;
}): Promise<string> {
  const element = React.createElement(ClaimApproved, {
    name,
    itemName,
    referenceId,
    pickupLocation,
    pickupDate,
    instructions,
    claimUrl,
  });
  return renderComponentToHtml(element);
}

/**
 * 10. Claim Rejected Email
 */
export async function getClaimRejectedEmailHtml({
  name = 'Valued User',
  itemName,
  referenceId,
  reason,
  uploadUrl,
}: {
  name?: string;
  itemName: string;
  referenceId: string;
  reason?: string;
  uploadUrl?: string;
}): Promise<string> {
  const element = React.createElement(ClaimRejected, {
    name,
    itemName,
    referenceId,
    reason,
    uploadUrl,
  });
  return renderComponentToHtml(element);
}
