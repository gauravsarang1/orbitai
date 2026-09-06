import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';
import { InfoCard } from './components/InfoCard';
import { FeatureGrid } from './components/FeatureGrid';

interface WelcomeProps {
  name: string;
  email: string;
  registrationDate?: string;
  dashboardUrl?: string;
}

export function Welcome({
  name,
  email,
  registrationDate = new Date().toLocaleDateString(),
  dashboardUrl = 'https://lostfoundai.com/dashboard',
}: WelcomeProps) {
  return (
    <EmailLayout previewText={`Welcome to Orbit AI, ${name}!`}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span
          style={{
            fontSize: '48px',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          🎉
        </span>
        <h1
          style={{
            margin: '0 0 8px 0',
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 800,
          }}
        >
          Welcome to Orbit AI!
        </h1>
        <p
          style={{
            margin: 0,
            color: '#818cf8',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          Your account has been successfully created and verified.
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
        Thank you for joining Orbit AI! Our AI-powered intelligence platform helps connect lost items with their rightful owners using computer vision, geo-tagging, and automated match discovery.
      </p>

      {/* Account Info Card */}
      <InfoCard
        title="👤 Verified Account Profile"
        rows={[
          { label: 'Name', value: name },
          { label: 'Email', value: email },
          { label: 'Registered On', value: registrationDate },
          { label: 'Account Status', value: 'Verified ✅', highlight: true },
        ]}
      />

      <Button href={dashboardUrl} variant="success">
        Go to Dashboard
      </Button>

      {/* Features Grid */}
      <FeatureGrid />

      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '10px',
          border: '1px solid #334155',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>
          💬 Need assistance getting started?
        </p>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
          Contact our support team anytime at{' '}
          <a href="mailto:support@lostfoundai.com" style={{ color: '#818cf8', textDecoration: 'none' }}>
            support@lostfoundai.com
          </a>
        </p>
      </div>
    </EmailLayout>
  );
}
