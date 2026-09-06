import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/InfoCard';
import { Button } from './components/Button';

interface ClaimRejectedProps {
  name: string;
  itemName: string;
  referenceId: string;
  reason?: string;
  uploadUrl?: string;
}

export function ClaimRejected({
  name,
  itemName,
  referenceId,
  reason = 'The submitted photo proof or serial number did not sufficiently match the verified characteristics of the item on record.',
  uploadUrl = 'https://lostfoundai.com/claims',
}: ClaimRejectedProps) {
  return (
    <EmailLayout previewText={`Claim Notice regarding ${itemName} (${referenceId})`}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>📑</span>
        <h2
          style={{
            margin: '0 0 6px 0',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          Claim Verification Update
        </h2>
        <p style={{ margin: 0, color: '#f87171', fontSize: '14px', fontWeight: 600 }}>
          Ownership verification requires additional information.
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
        Thank you for submitting a claim for <strong>{itemName}</strong>. Unfortunately, we could not verify ownership based on the current information provided.
      </p>

      {/* Info Card */}
      <InfoCard
        title="⚠️ Claim Review Summary"
        rows={[
          { label: 'Claim Reference ID', value: referenceId, highlight: true },
          { label: 'Item Name', value: itemName },
          { label: 'Review Status', value: 'Requires Additional Verification' },
        ]}
      />

      <div
        style={{
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '10px',
          border: '1px solid #334155',
          margin: '16px 0',
        }}
      >
        <p style={{ margin: '0 0 6px 0', color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>
          Reason for Review Decision:
        </p>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
          {reason}
        </p>
      </div>

      <p
        style={{
          margin: '16px 0',
          color: '#cbd5e1',
          fontSize: '13px',
          lineHeight: '1.5',
        }}
      >
        Don&apos;t worry! You can upload additional proof of ownership (e.g. purchase receipt, original box photo, serial number record, or distinct marking description) to re-evaluate your claim:
      </p>

      <Button href={`${uploadUrl}/${referenceId}`}>Upload Additional Documents</Button>
    </EmailLayout>
  );
}
