import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Orbit AI | Smart Lost & Found Management System',
  description: 'AI-powered smart lost and found recovery platform with visual matching, OCR extraction, location filtering, and secure verification.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full bg-slate-50 text-slate-900 antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


