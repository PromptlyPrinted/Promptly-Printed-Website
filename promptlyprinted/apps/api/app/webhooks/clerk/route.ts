import { analytics } from '@repo/analytics/posthog/server';
// Clerk types removed - this webhook should be replaced with Better Auth webhooks
// import type {
//   DeletedObjectJSON,
//   OrganizationJSON,
//   OrganizationMembershipJSON,
//   UserJSON,
//   WebhookEvent,
// } from '@repo/auth/server';

// Temporary types for legacy Clerk webhook (should be replaced with Better Auth)
type DeletedObjectJSON = { id?: string };
type UserJSON = {
  id: string;
  email_addresses: Array<{ email_address?: string }>;
  first_name?: string;
  last_name?: string;
  created_at: number;
  image_url?: string;
  phone_numbers: Array<{ phone_number?: string }>;
};
type OrganizationJSON = {
  id: string;
  name: string;
  image_url?: string;
  created_by: string;
};
type OrganizationMembershipJSON = {
  organization: { id: string };
  public_user_data: { user_id: string };
};
type WebhookEvent = {
  type: string;
  data: any;
};

import { database } from '@repo/database';
import { env } from '@repo/env';
import { log } from '@repo/observability/log';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

// Legacy Clerk webhook handlers - removed after migration to Better Auth
// All user management is now handled by Better Auth directly

export const POST = async (request: Request): Promise<Response> => {
  // Legacy Clerk webhook - disabled after migration to Better Auth
  log.info('Legacy Clerk webhook called - returning disabled status');
  
  return NextResponse.json({ 
    message: 'Clerk webhook disabled - migrated to Better Auth', 
    ok: false,
    status: 'disabled'
  }, { status: 410 }); // 410 Gone - resource no longer available
};

export const GET = async () => {
  return new Response(
    'Legacy Clerk webhook endpoint - disabled after migration to Better Auth. This endpoint is no longer in use.',
    {
      status: 410, // Gone
    }
  );
};
