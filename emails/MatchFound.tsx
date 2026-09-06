import React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { MatchCard } from './components/MatchCard';
import { Button } from './components/Button';

interface MatchFoundProps {
  name: string;
  lostItemName: string;
  foundItemName: string;
  confidence: number;
  date?: string;
  location?: string;
  reportedBy?: string;
  imageUrl?: string;
  matchUrl?: string;
  contactUrl?: string;
}

export function MatchFound({
  name,
  lostItemName,
  foundItemName,
  confidence = 96,
  date = new Date().toLocaleDateString(),
  location = 'Main Campus Library - 2nd Floor',
  reportedBy = 'Verified Community Member',
  imageUrl,
  matchUrl = 'https://lostfoundai.com/matches',
  contactUrl = 'https://lostfoundai.com/claims',
}: MatchFoundProps) {
  return (
    <EmailLayout previewText={`🎉 AI Match Found: ${confidence}% match for your ${lostItemName}`}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '44px', display: 'block', marginBottom: '8px' }}>🎯</span>
        <h1
          style={{
            margin: '0 0 6px 0',
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 800,
          }}
        >
          Great News! AI Match Found!
        </h1>
        <p
          style={{
            margin: 0,
            color: '#818cf8',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Our AI engine identified a potential match for your reported lost item.
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
        Good news! Our smart AI engine evaluated visual features, description similarity, and geographic location to identify a <strong>{confidence}% match</strong> for your lost item:
      </p>

      {/* Match Card */}
      <MatchCard
        lostItemName={lostItemName}
        foundItemName={foundItemName}
        confidence={confidence}
        date={date}
        location={location}
        reportedBy={reportedBy}
        imageUrl={imageUrl}
      />

      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '20px 0' }}>
        <tr>
          <td align="center">
            <Button href={matchUrl} variant="primary">
              View Match Details
            </Button>
          </td>
        </tr>
      </table>

      <div
        style={{
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '10px',
          border: '1px solid #334155',
          marginTop: '16px',
        }}
      >
        <p
          style={{
            margin: '0 0 6px 0',
            color: '#f59e0b',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          ⚠️ Important Ownership Verification Steps:
        </p>
        <p
          style={{
            margin: 0,
            color: '#94a3b8',
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          Please verify full ownership details (such as unique marks, serial numbers, or photo proof) before initiating claim collection.
        </p>
      </div>
    </EmailLayout>
  );
}
