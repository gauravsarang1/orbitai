import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/InfoCard';
import { Button } from './components/Button';

interface FoundItemReportedProps {
  name: string;
  referenceNumber: string;
  itemName: string;
  category: string;
  location: string;
  date?: string;
  submissionUrl?: string;
}

export function FoundItemReported({
  name,
  referenceNumber,
  itemName,
  category,
  location,
  date = new Date().toLocaleDateString(),
  submissionUrl = 'https://lostfoundai.com/my-items',
}: FoundItemReportedProps) {
  return (
    <EmailLayout previewText={`Thank You for Reporting a Found Item: ${itemName}`}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🤝</span>
        <h2
          style={{
            margin: '0 0 6px 0',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          Thank You For Reporting a Found Item!
        </h2>
        <p style={{ margin: 0, color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
          Your kindness helps someone recover their lost belongings.
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
        Your found item report has been recorded in the Orbit AI network. Our system is indexing the visual and text details to alert matching owners.
      </p>

      {/* Info Card */}
      <InfoCard
        title="📦 Found Item Submission Details"
        rows={[
          { label: 'Reference Number', value: referenceNumber, highlight: true },
          { label: 'Item Name', value: itemName },
          { label: 'Category', value: category },
          { label: 'Found Location', value: location },
          { label: 'Submission Date', value: date },
        ]}
      />

      <Button href={submissionUrl} variant="primary">
        View Submission Status
      </Button>
    </EmailLayout>
  );
}
