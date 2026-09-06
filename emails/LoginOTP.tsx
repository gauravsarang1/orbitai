import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { OTPCard } from './components/OTPCard';
import { Button } from './components/Button';
import { InfoCard } from './components/InfoCard';

interface LoginOTPProps {
  name: string;
  otp: string;
  browser?: string;
  location?: string;
  time?: string;
  ipAddress?: string;
  actionUrl?: string;
}

export function LoginOTP({
  name,
  otp,
  browser = 'Chrome / MacOS',
  location = 'California, USA',
  time = new Date().toLocaleString(),
  ipAddress = '192.168.1.1',
  actionUrl = 'https://lostfoundai.com/login',
}: LoginOTPProps) {
  return (
    <EmailLayout previewText={`Your Login Verification Code is ${otp}`}>
      <h2
        style={{
          margin: '0 0 12px 0',
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        Your Login Verification Code
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
        Someone is attempting to sign into your Orbit AI account. If this was you, please enter the OTP below to complete login authentication:
      </p>

      {/* OTP Card */}
      <OTPCard code={otp} expiryMinutes={5} />

      <Button href={actionUrl}>Continue Login</Button>

      {/* Login Attempt Meta Info */}
      <InfoCard
        title="🔒 Login Request Security Details"
        rows={[
          { label: 'Browser/Device', value: browser },
          { label: 'Approx. Location', value: location },
          { label: 'Time', value: time },
          { label: 'IP Address', value: ipAddress },
        ]}
      />

      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          color: '#ef4444',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        <p style={{ margin: 0 }}>
          🚨 <strong>Didn&apos;t attempt to log in?</strong> Someone else may have entered your email address. Change your password immediately or contact support if you suspect unauthorized access.
        </p>
      </div>
    </EmailLayout>
  );
}
