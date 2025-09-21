'use server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { headers } from 'next/headers';
import Fuse from 'fuse.js';

export const searchUsers = async (
  query: string
): Promise<
  | {
      data: string[];
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

    // Get all users from database (in a real app, you might want pagination)
    const users = await database.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
      },
      take: 100, // Limit to 100 users for performance
    });

    // Transform to searchable format
    const searchableUsers = users.map((user) => ({
      id: user.id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      imageUrl: user.image,
    }));

    const fuse = new Fuse(searchableUsers, {
      keys: ['name'],
      minMatchCharLength: 1,
      threshold: 0.3,
    });

    const results = fuse.search(query);
    const data = results.map((result) => result.item.id);

    return { data };
  } catch (error) {
    return { error };
  }
};
