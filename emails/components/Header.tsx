import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = 'Orbit AI',
  subtitle = 'Smart AI Powered Lost & Found Platform',
}: HeaderProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        padding: '32px 24px',
        textAlign: 'center',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      <tr>
        <td align="center">
          <table role="presentation" cellPadding="0" cellSpacing="0">
            <tr>
              <td
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'inline-block',
                }}
              >
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  }}
                >
                  🔍 {title}
                </span>
              </td>
            </tr>
          </table>
          <p
            style={{
              margin: '8px 0 0 0',
              color: '#e0e7ff',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {subtitle}
          </p>
        </td>
      </tr>
    </table>
  );
}
