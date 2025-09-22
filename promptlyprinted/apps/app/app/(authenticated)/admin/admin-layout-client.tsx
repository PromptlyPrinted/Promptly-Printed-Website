'use client';

import { usePathname } from 'next/navigation';
import { Header } from '../components/header';
import { UserButton } from '@repo/auth/components/user-button';

type AdminLayoutClientProps = {
  children: React.ReactNode;
};

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentPage = segments[segments.length - 1];
  const pages = segments
    .slice(1, -1)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <>
      <Header
        pages={pages}
        page={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
      >
        <div className="flex items-center gap-4 px-4">
          <UserButton showName={false} />
        </div>
      </Header>
      {children}
    </>
  );
}