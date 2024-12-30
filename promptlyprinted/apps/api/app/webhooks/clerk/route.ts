import { analytics } from '@repo/analytics/posthog/server';
import type {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
  WebhookEvent,
} from '@repo/auth/server';
import { database } from '@repo/database';
import { env } from '@repo/env';
import { log } from '@repo/observability/log';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

const handleUserCreated = async (data: UserJSON) => {
  // Create user in database
  await database.user.create({
    data: {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address ?? '',
      firstName: data.first_name ?? null,
      lastName: data.last_name ?? null,
    },
  });

  // Track analytics
  analytics.identify({
    distinctId: data.id,
    properties: {
      email: data.email_addresses.at(0)?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      avatar: data.image_url,
      phoneNumber: data.phone_numbers.at(0)?.phone_number,
    },
  });

  analytics.capture({
    event: 'User Created',
    distinctId: data.id,
  });

  return new Response('User created', { status: 201 });
};

const handleUserUpdated = async (data: UserJSON) => {
  // Update user in database
  await database.user.update({
    where: { clerkId: data.id },
    data: {
      email: data.email_addresses[0]?.email_address ?? '',
      firstName: data.first_name ?? null,
      lastName: data.last_name ?? null,
    },
  });

  analytics.identify({
    distinctId: data.id,
    properties: {
      email: data.email_addresses.at(0)?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      avatar: data.image_url,
      phoneNumber: data.phone_numbers.at(0)?.phone_number,
    },
  });

  analytics.capture({
    event: 'User Updated',
    distinctId: data.id,
  });

  return new Response('User updated', { status: 201 });
};

const handleUserDeleted = async (data: DeletedObjectJSON) => {
  if (data.id) {
    // Delete user from database
    await database.user.delete({
      where: { clerkId: data.id },
    });

    analytics.identify({
      distinctId: data.id,
      properties: {
        deleted: new Date(),
      },
    });

    analytics.capture({
      event: 'User Deleted',
      distinctId: data.id,
    });
  }

  return new Response('User deleted', { status: 201 });
};

const handleOrganizationCreated = (data: OrganizationJSON) => {
  analytics.groupIdentify({
    groupKey: data.id,
    groupType: 'company',
    distinctId: data.created_by,
    properties: {
      name: data.name,
      avatar: data.image_url,
    },
  });

  if (data.created_by) {
    analytics.capture({
      event: 'Organization Created',
      distinctId: data.created_by,
    });
  }

  return new Response('Organization created', { status: 201 });
};

const handleOrganizationUpdated = (data: OrganizationJSON) => {
  analytics.groupIdentify({
    groupKey: data.id,
    groupType: 'company',
    distinctId: data.created_by,
    properties: {
      name: data.name,
      avatar: data.image_url,
    },
  });

  if (data.created_by) {
    analytics.capture({
      event: 'Organization Updated',
      distinctId: data.created_by,
    });
  }

  return new Response('Organization updated', { status: 201 });
};

const handleOrganizationMembershipCreated = (
  data: OrganizationMembershipJSON
) => {
  analytics.groupIdentify({
    groupKey: data.organization.id,
    groupType: 'company',
    distinctId: data.public_user_data.user_id,
  });

  analytics.capture({
    event: 'Organization Member Created',
    distinctId: data.public_user_data.user_id,
  });

  return new Response('Organization membership created', { status: 201 });
};

const handleOrganizationMembershipDeleted = (
  data: OrganizationMembershipJSON
) => {
  // Need to unlink the user from the group

  analytics.capture({
    event: 'Organization Member Deleted',
    distinctId: data.public_user_data.user_id,
  });

  return new Response('Organization membership deleted', { status: 201 });
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = (await request.json()) as object;
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent | undefined;

  // Verify the payload with the headers
  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    log.error('Error verifying webhook:', { error });
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = event.data;
  const eventType = event.type;

  log.info('Webhook', { id, eventType, body });

  let response: Response = new Response('', { status: 201 });

  switch (eventType) {
    case 'user.created': {
      response = await handleUserCreated(event.data);
      break;
    }
    case 'user.updated': {
      response = await handleUserUpdated(event.data);
      break;
    }
    case 'user.deleted': {
      response = await handleUserDeleted(event.data);
      break;
    }
    case 'organization.created': {
      response = handleOrganizationCreated(event.data);
      break;
    }
    case 'organization.updated': {
      response = handleOrganizationUpdated(event.data);
      break;
    }
    case 'organizationMembership.created': {
      response = handleOrganizationMembershipCreated(event.data);
      break;
    }
    case 'organizationMembership.deleted': {
      response = handleOrganizationMembershipDeleted(event.data);
      break;
    }
    default: {
      break;
    }
  }

  await analytics.shutdown();

  return response;
};
