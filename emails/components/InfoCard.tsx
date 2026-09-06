import React from 'react';

interface InfoRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface InfoCardProps {
  title?: string;
  rows: InfoRow[];
}

export function InfoCard({ title, rows }: InfoCardProps) {
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
        margin: '16px 0',
        padding: '16px 20px',
      }}
    >
      {title && (
        <tr>
          <td
            colSpan={2}
            style={{
              paddingBottom: '12px',
              borderBottom: '1px solid #1e293b',
              color: '#818cf8',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {title}
          </td>
        </tr>
      )}
      {rows.map((row, idx) => (
        <tr key={idx}>
          <td
            style={{
              padding: '8px 0',
              color: '#94a3b8',
              fontSize: '13px',
              width: '40%',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {row.label}
          </td>
          <td
            style={{
              padding: '8px 0',
              color: row.highlight ? '#38bdf8' : '#ffffff',
              fontSize: '13px',
              fontWeight: row.highlight ? 700 : 500,
              width: '60%',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {row.value}
          </td>
        </tr>
      ))}
    </table>
  );
}
