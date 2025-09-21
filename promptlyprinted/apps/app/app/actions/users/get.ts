'use server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { headers } from 'next/headers';
import { tailwind } from '@repo/tailwind-config';

export const getUsers = async (
  userIds: string[]
): Promise<
  | {
      data: Array<{
        name: string;
        id: string;
        avatar: string;
        color: string;
      }>;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      throw new Error('Not logged in');
    }

    // Get users from database
    const users = await database.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
      },
    });

    const data = users.map((user) => ({
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
      id: user.id,
      avatar: user.image || '',
      color: tailwind.theme.colors.blue[500], // Default color
    }));

    return { data };
  } catch (error) {
    return { error };
  }
};