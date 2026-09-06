import React from 'react';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

const defaultFeatures: FeatureItem[] = [
  { icon: '🤖', title: 'AI Matching', desc: 'Automatic vision & text similarity identification' },
  { icon: '📍', title: 'Smart Location', desc: 'Geo-fenced lost and found discovery radius' },
  { icon: '📷', title: 'Image Search', desc: 'Upload pictures to find matching reported items' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'Real-time notifications when a potential match appears' },
  { icon: '❤️', title: 'Bookmark Items', desc: 'Save items and keep track of claim verifications' },
];

export function FeatureGrid({ features = defaultFeatures }: { features?: FeatureItem[] }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{ margin: '24px 0' }}
    >
      <tr>
        <td>
          <p
            style={{
              margin: '0 0 16px 0',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            What you can do with Orbit AI
          </p>
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
            {features.map((feat, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td style={{ width: '32px', fontSize: '20px', verticalAlign: 'top' }}>
                        {feat.icon}
                      </td>
                      <td style={{ paddingLeft: '12px' }}>
                        <p
                          style={{
                            margin: '0 0 2px 0',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                          }}
                        >
                          {feat.title}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: '#94a3b8',
                            fontSize: '11px',
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                          }}
                        >
                          {feat.desc}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            ))}
          </table>
        </td>
      </tr>
    </table>
  );
}
