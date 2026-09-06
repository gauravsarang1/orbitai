'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AppStoreProvider } from '@/lib/store-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppStoreProvider>{children}</AppStoreProvider>
    </SessionProvider>
  );
}
