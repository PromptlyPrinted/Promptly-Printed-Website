import 'server-only';
import { auth } from '@repo/auth/server';
import { env } from '@repo/env';
import { headers } from 'next/headers';
import { Svix } from 'svix';

export const send = async (eventType: string, payload: object) => {
  if (!env.SVIX_TOKEN) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(env.SVIX_TOKEN);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return;
  }

  const userId = session.user.id;
  return svix.message.create(userId, {
    eventType,
    payload: {
      eventType,
      ...payload,
    },
    application: {
      name: userId,
      uid: userId,
    },
  });
};

export const getAppPortal = async () => {
  if (!env.SVIX_TOKEN) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(env.SVIX_TOKEN);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return;
  }

  const userId = session.user.id;
  return svix.authentication.appPortalAccess(userId, {
    application: {
      name: userId,
      uid: userId,
    },
  });
};
