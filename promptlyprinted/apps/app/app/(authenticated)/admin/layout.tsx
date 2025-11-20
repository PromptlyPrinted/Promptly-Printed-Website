import { auth } from '@repo/auth/server';
import { prisma } from '@repo/database';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from './admin-layout-client';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Server-side auth check
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  console.log('[Admin Layout] Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    cookies: requestHeaders.get('cookie')?.split(';').map(c => c.trim().split('=')[0]),
  });

  if (!session?.user) {
    console.log('[Admin Layout] No session found, redirecting to sign-in');
    redirect('/sign-in');
  }

  // Server-side role check
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  console.log('[Admin Layout] User role check:', {
    userId: session.user.id,
    role: user?.role,
    isAdmin: user?.role === 'ADMIN',
  });

  if (!user || user.role !== 'ADMIN') {
    // Redirect to web app home - no flash since this is server-side
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://promptlyprinted.com';
    console.log('[Admin Layout] User is not admin, redirecting to:', webUrl);
    redirect(webUrl);
  }

  // Only render if user is admin
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
