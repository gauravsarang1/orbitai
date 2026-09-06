import React from 'react';

interface OTPCardProps {
  code: string;
  expiryMinutes?: number;
}

export function OTPCard({ code, expiryMinutes = 5 }: OTPCardProps) {
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
        padding: '24px 16px',
        textAlign: 'center',
      }}
    >
      <tr>
        <td align="center">
          <p
            style={{
              margin: '0 0 6px 0',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            Verification Code
          </p>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 900,
              letterSpacing: '10px',
              color: '#818cf8',
              fontFamily: "'Courier New', Courier, monospace",
              padding: '8px 0',
            }}
          >
            {code}
          </div>
          <p
            style={{
              margin: '6px 0 0 0',
              color: '#64748b',
              fontSize: '12px',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            ⏱️ Expires in <strong>{expiryMinutes} minutes</strong>. Do not share this code.
          </p>
        </td>
      </tr>
    </table>
  );
}
