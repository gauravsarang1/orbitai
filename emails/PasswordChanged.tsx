import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/InfoCard';
import { Button } from './components/Button';

interface PasswordChangedProps {
  name: string;
  time?: string;
  device?: string;
  browser?: string;
  location?: string;
  securityUrl?: string;
}

export function PasswordChanged({
  name,
  time = new Date().toLocaleString(),
  device = 'Desktop / Mac OS',
  browser = 'Chrome',
  location = 'California, USA',
  securityUrl = 'https://lostfoundai.com/settings/security',
}: PasswordChangedProps) {
  return (
    <EmailLayout previewText="Security Notice: Your Orbit AI password was successfully changed">
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🔐</span>
        <h2
          style={{
            margin: '0 0 6px 0',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          Your Password Was Changed
        </h2>
        <p style={{ margin: 0, color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
          Your account credentials have been updated successfully.
        </p>
      </div>

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
        This email confirms that your password for <strong>Orbit AI</strong> was successfully updated.
      </p>

      {/* Audit Info Card */}
      <InfoCard
        title="🕒 Update Audit Log"
        rows={[
          { label: 'Time Updated', value: time },
          { label: 'Device', value: device },
          { label: 'Browser', value: browser },
          { label: 'Approx. Location', value: location },
        ]}
      />

      <div
        style={{
          margin: '20px 0',
          padding: '16px',
          backgroundColor: '#450a0a',
          borderRadius: '10px',
          border: '1px solid #7f1d1d',
          color: '#fca5a5',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        <p style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '13px' }}>
          🚨 Didn&apos;t perform this password change?
        </p>
        <p style={{ margin: 0 }}>
          If you did not authorize this change, someone may have compromised your account. Please click below to secure your account immediately:
        </p>
      </div>

      <Button href={securityUrl} variant="secondary">
        Secure My Account
      </Button>
    </EmailLayout>
  );
}
