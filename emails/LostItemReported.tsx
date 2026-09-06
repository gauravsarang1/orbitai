import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/InfoCard';
import { Button } from './components/Button';

interface LostItemReportedProps {
  name: string;
  reportId: string;
  itemName: string;
  category: string;
  location: string;
  date?: string;
  trackUrl?: string;
}

export function LostItemReported({
  name,
  reportId,
  itemName,
  category,
  location,
  date = new Date().toLocaleDateString(),
  trackUrl = 'https://lostfoundai.com/my-items',
}: LostItemReportedProps) {
  return (
    <EmailLayout previewText={`Lost Item Report Submitted: ${itemName} (${reportId})`}>
      <h2
        style={{
          margin: '0 0 12px 0',
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        Your Lost Item Has Been Reported
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
        Thanks for submitting your report. Our AI matching algorithms are already scanning all current and new found item submissions across the network!
      </p>

      {/* Info Card */}
      <InfoCard
        title="📋 Submitted Report Details"
        rows={[
          { label: 'Report Reference ID', value: reportId, highlight: true },
          { label: 'Item Name', value: itemName },
          { label: 'Category', value: category },
          { label: 'Last Seen Location', value: location },
          { label: 'Reported Date', value: date },
        ]}
      />

      <Button href={trackUrl}>Track Report & Matches</Button>

      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '10px',
          border: '1px solid #334155',
        }}
      >
        <p style={{ margin: '0 0 6px 0', color: '#818cf8', fontSize: '13px', fontWeight: 600 }}>
          💡 What Happens Next?
        </p>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
          You will receive instant email notifications as soon as our AI detects a potential match for your item.
        </p>
      </div>
    </EmailLayout>
  );
}
