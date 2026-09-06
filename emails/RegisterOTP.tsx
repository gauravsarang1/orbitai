import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { OTPCard } from './components/OTPCard';
import { Button } from './components/Button';

interface RegisterOTPProps {
  name: string;
  otp: string;
  expiryMinutes?: number;
  actionUrl?: string;
}

export function RegisterOTP({
  name,
  otp,
  expiryMinutes = 5,
  actionUrl = 'https://lostfoundai.com/verify-email',
}: RegisterOTPProps) {
  return (
    <EmailLayout previewText={`Your verification code is ${otp}`}>
      <h2
        style={{
          margin: '0 0 12px 0',
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        Verify Your Email Address
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
        Welcome to <strong>Orbit AI</strong>! You&apos;re just one step away from creating your account. Use the 6-digit verification code below to verify your email address:
      </p>

      {/* OTP Card */}
      <OTPCard code={otp} expiryMinutes={expiryMinutes} />

      <p
        style={{
          margin: '20px 0 8px 0',
          color: '#94a3b8',
          fontSize: '13px',
          textAlign: 'center',
        }}
      >
        Or click the button below to go directly to the verification page:
      </p>

      <Button href={`${actionUrl}?otp=${otp}`}>Verify Account</Button>

      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          color: '#64748b',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        <p style={{ margin: 0 }}>
          🔒 <strong>Security Note:</strong> If you didn&apos;t request this registration, please ignore this email. No account will be created without this verification code.
        </p>
      </div>
    </EmailLayout>
  );
}
