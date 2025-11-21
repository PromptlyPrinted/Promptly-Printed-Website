import { auth } from '@repo/auth/server';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { env } from '@repo/env';
import { showBetaFeature } from '@repo/feature-flags';
import { secure } from '@repo/security';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { GlobalSidebar } from './components/sidebar';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const requestHeaders = await headers();

  // Debug: Log cookies being sent
  const cookieHeader = requestHeaders.get('cookie');
  console.log('[AppLayout] Cookies received:', cookieHeader?.split(';').map(c => c.trim().split('=')[0]));

  const session = await auth.api.getSession({ headers: requestHeaders });
  const betaFeature = await showBetaFeature();

  console.log('[AppLayout] Session result:', { hasSession: !!session, userId: session?.user?.id });

  if (!session?.user) {
    console.log('[AppLayout] No session, redirecting to sign-in');
    redirect('/sign-in');
  }

  return (
    <SidebarProvider>
      <GlobalSidebar>
        {betaFeature && (
          <div className="m-4 rounded-full bg-success p-1.5 text-center text-sm text-success-foreground">
            Beta feature now available
          </div>
        )}
        {children}
      </GlobalSidebar>
      <PostHogIdentifier />
    </SidebarProvider>
  );
};

export default AppLayout;
