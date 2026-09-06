import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/InfoCard';
import { Button } from './components/Button';

interface ClaimApprovedProps {
  name: string;
  itemName: string;
  referenceId: string;
  pickupLocation?: string;
  pickupDate?: string;
  instructions?: string;
  claimUrl?: string;
}

export function ClaimApproved({
  name,
  itemName,
  referenceId,
  pickupLocation = 'Campus Security Office - Gate B Desk',
  pickupDate = 'Available for pickup starting tomorrow 9:00 AM - 5:00 PM',
  instructions = 'Please bring a valid photo ID and present this claim reference number to the security desk officer upon arrival.',
  claimUrl = 'https://lostfoundai.com/claims',
}: ClaimApprovedProps) {
  return (
    <EmailLayout previewText={`🎉 Claim Approved: Your ownership for ${itemName} has been verified!`}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '44px', display: 'block', marginBottom: '8px' }}>🎉</span>
        <h2
          style={{
            margin: '0 0 6px 0',
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 800,
          }}
        >
          Your Claim Has Been Approved!
        </h2>
        <p style={{ margin: 0, color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
          Congratulations! Ownership has been verified successfully.
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
        Great news! The administrator/finder verified your ownership proof for <strong>{itemName}</strong>. You may now proceed to collect your item.
      </p>

      {/* Collection Details InfoCard */}
      <InfoCard
        title="📍 Item Collection & Pickup Details"
        rows={[
          { label: 'Claim Reference ID', value: referenceId, highlight: true },
          { label: 'Item Name', value: itemName },
          { label: 'Pickup Location', value: pickupLocation },
          { label: 'Pickup Hours/Date', value: pickupDate },
        ]}
      />

      <div
        style={{
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '10px',
          border: '1px solid #334155',
          margin: '20px 0',
        }}
      >
        <p style={{ margin: '0 0 6px 0', color: '#38bdf8', fontSize: '13px', fontWeight: 700 }}>
          📝 Collection Instructions:
        </p>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
          {instructions}
        </p>
      </div>

      <Button href={claimUrl} variant="success">
        View Collection Details
      </Button>
    </EmailLayout>
  );
}
