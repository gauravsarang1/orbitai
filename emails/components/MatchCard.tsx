/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface MatchCardProps {
  lostItemName: string;
  foundItemName: string;
  confidence: number;
  date?: string;
  location?: string;
  reportedBy?: string;
  imageUrl?: string;
}

export function MatchCard({
  lostItemName,
  foundItemName,
  confidence,
  date,
  location,
  reportedBy,
  imageUrl,
}: MatchCardProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '12px',
        margin: '20px 0',
        padding: '20px',
      }}
    >
      <tr>
        <td>
          {/* Badge */}
          <div style={{ marginBottom: '12px', textAlign: 'right' }}>
            <span
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-block',
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              🤖 Matched using Lost&Found AI Engine
            </span>
          </div>

          {imageUrl && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src={imageUrl}
                alt={foundItemName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '180px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '1px solid #334155',
                }}
              />
            </div>
          )}

          {/* Details */}
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td style={{ padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                <strong>Your Item:</strong>
              </td>
              <td style={{ padding: '6px 0', color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>
                {lostItemName}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                <strong>Matched Item:</strong>
              </td>
              <td style={{ padding: '6px 0', color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>
                {foundItemName}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                <strong>AI Confidence Score:</strong>
              </td>
              <td style={{ padding: '6px 0' }}>
                <span
                  style={{
                    backgroundColor: confidence >= 90 ? '#059669' : '#d97706',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {confidence}% Match
                </span>
              </td>
            </tr>
            {date && (
              <tr>
                <td style={{ padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                  <strong>Found Date:</strong>
                </td>
                <td style={{ padding: '6px 0', color: '#cbd5e1', fontSize: '13px' }}>{date}</td>
              </tr>
            )}
            {location && (
              <tr>
                <td style={{ padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                  <strong>Location:</strong>
                </td>
                <td style={{ padding: '6px 0', color: '#cbd5e1', fontSize: '13px' }}>{location}</td>
              </tr>
            )}
            {reportedBy && (
              <tr>
                <td style={{ padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                  <strong>Reported By:</strong>
                </td>
                <td style={{ padding: '6px 0', color: '#cbd5e1', fontSize: '13px' }}>{reportedBy}</td>
              </tr>
            )}
          </table>
        </td>
      </tr>
    </table>
  );
}
