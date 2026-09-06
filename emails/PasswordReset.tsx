import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { OTPCard } from './components/OTPCard';
import { Button } from './components/Button';

interface PasswordResetProps {
  name: string;
  otp: string;
  resetUrl?: string;
}

export function PasswordReset({
  name,
  otp,
  resetUrl = 'https://lostfoundai.com/reset-password',
}: PasswordResetProps) {
  return (
    <EmailLayout previewText={`Password Reset OTP Code: ${otp}`}>
      <h2
        style={{
          margin: '0 0 12px 0',
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        Reset Your Password
      </h2>
      <p
        style={{
          margin: '0 0 16px 0',
          color: '#cbd5e1',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        Hi <strong>{name}</strong>,
      </p>
      <p
        style={{
          margin: '0 0 16px 0',
          color: '#cbd5e1',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        Someone requested a password reset for your Orbit AI account. Please use the verification code below to authorize your password change:
      </p>

      {/* OTP Card */}
      <OTPCard code={otp} expiryMinutes={5} />

      <Button href={`${resetUrl}?otp=${otp}`}>Reset Password Now</Button>

      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          color: '#94a3b8',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        <p style={{ margin: 0 }}>
          🔒 <strong>Security Warning:</strong> If you did not request a password reset, please ignore this message. Your password will remain unchanged and secure.
        </p>
      </div>
    </EmailLayout>
  );
}
