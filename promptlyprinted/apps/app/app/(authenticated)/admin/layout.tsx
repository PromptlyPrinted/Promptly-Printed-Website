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
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Server-side role check
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user || user.role !== 'ADMIN') {
    // Redirect to web app home - no flash since this is server-side
    redirect('http://localhost:3001');
  }

  // Only render if user is admin
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
