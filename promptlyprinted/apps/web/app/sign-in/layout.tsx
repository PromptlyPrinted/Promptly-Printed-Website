import type { ReactNode } from 'react';

// Layout for sign-in page - no header/footer
export default function SignInLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
