'use client';

import { env } from '@repo/env';
import posthogRaw from 'posthog-js';
import type { PostHog } from 'posthog-js';
import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react';
import type { ReactNode } from 'react';

let analytics: PostHog | null = null;

if (typeof window !== 'undefined') {
  analytics = posthogRaw.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/ingest',
    ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only',
    persistence: 'localStorage',
    autocapture: false,
  });
}

type PostHogProviderProps = {
  readonly children: ReactNode;
};

export const PostHogProvider = (
  properties: Omit<PostHogProviderProps, 'client'>
) => <PostHogProviderRaw client={analytics} {...properties} />;

export { analytics };
