import React from 'react';

interface FooterProps {
  supportEmail?: string;
  websiteUrl?: string;
}

export function Footer({
  supportEmail = 'support@lostfoundai.com',
  websiteUrl = 'https://lostfoundai.com',
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{
        backgroundColor: '#0f172a',
        padding: '28px 24px',
        textAlign: 'center',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        borderTop: '1px solid #1e293b',
      }}
    >
      <tr>
        <td align="center">
          <p
            style={{
              margin: '0 0 12px 0',
              color: '#94a3b8',
              fontSize: '12px',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            © {currentYear} <strong>Orbit AI</strong>. All rights reserved.
          </p>
          <p
            style={{
              margin: '0 0 12px 0',
              color: '#64748b',
              fontSize: '11px',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            <a
              href={websiteUrl}
              style={{ color: '#818cf8', textDecoration: 'none', marginRight: '12px' }}
            >
              Website
            </a>
            •
            <a
              href={`mailto:${supportEmail}`}
              style={{ color: '#818cf8', textDecoration: 'none', margin: '0 12px' }}
            >
              Support
            </a>
            •
            <a
              href={`${websiteUrl}/privacy`}
              style={{ color: '#818cf8', textDecoration: 'none', margin: '0 12px' }}
            >
              Privacy Policy
            </a>
            •
            <a
              href={`${websiteUrl}/terms`}
              style={{ color: '#818cf8', textDecoration: 'none', marginLeft: '12px' }}
            >
              Terms
            </a>
          </p>
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontSize: '10px',
              fontStyle: 'italic',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            This is an automated security notification. Please do not reply directly to this email.
          </p>
        </td>
      </tr>
    </table>
  );
}
