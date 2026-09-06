import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function EmailLayout({
  children,
  previewText,
  headerTitle,
  headerSubtitle,
}: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Orbit AI</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#020617',
          color: '#f8fafc',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {previewText && (
          <div
            style={{
              display: 'none',
              fontSize: '1px',
              color: '#020617',
              lineHeight: '1px',
              maxHeight: '0px',
              maxWidth: '0px',
              opacity: 0,
              overflow: 'hidden',
            }}
          >
            {previewText}
          </div>
        )}

        {/* Main Wrapper Table */}
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            backgroundColor: '#020617',
            padding: '24px 12px',
            width: '100%',
          }}
        >
          <tr>
            <td align="center">
              {/* Container Card */}
              <table
                role="presentation"
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  maxWidth: '600px',
                  backgroundColor: '#1e293b',
                  borderRadius: '16px',
                  border: '1px solid #334155',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <tr>
                  <td>
                    <Header title={headerTitle} subtitle={headerSubtitle} />
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '32px 28px', backgroundColor: '#1e293b' }}>
                    {children}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td>
                    <Footer />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
