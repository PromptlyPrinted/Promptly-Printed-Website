'use client';

import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Better Auth manages session state automatically via cookies
  // No provider wrapper is needed, unlike Clerk
  return <>{children}</>;
};