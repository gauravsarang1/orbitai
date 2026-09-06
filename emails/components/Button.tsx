import React from 'react';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success';
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  let bgColor = '#4f46e5';
  let hoverBg = '#4338ca';

  if (variant === 'secondary') {
    bgColor = '#334155';
    hoverBg = '#475569';
  } else if (variant === 'success') {
    bgColor = '#059669';
    hoverBg = '#047857';
  }

  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ margin: '20px auto' }}>
      <tr>
        <td
          align="center"
          style={{
            backgroundColor: bgColor,
            borderRadius: '10px',
            padding: '12px 28px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
          }}
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
}
