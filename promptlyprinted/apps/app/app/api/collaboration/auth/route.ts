import { auth } from '@repo/auth/server';
import { authenticate } from '@repo/collaboration/auth';
import { tailwind } from '@repo/tailwind-config';

const COLORS = [
  tailwind.theme.colors.red[500],
  tailwind.theme.colors.orange[500],
  tailwind.theme.colors.amber[500],
  tailwind.theme.colors.yellow[500],
  tailwind.theme.colors.lime[500],
  tailwind.theme.colors.green[500],
  tailwind.theme.colors.emerald[500],
  tailwind.theme.colors.teal[500],
  tailwind.theme.colors.cyan[500],
  tailwind.theme.colors.sky[500],
  tailwind.theme.colors.blue[500],
  tailwind.theme.colors.indigo[500],
  tailwind.theme.colors.violet[500],
  tailwind.theme.colors.purple[500],
  tailwind.theme.colors.fuchsia[500],
  tailwind.theme.colors.pink[500],
  tailwind.theme.colors.rose[500],
];

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return authenticate({
    userId: session.user.id,
    orgId: 'default-org', // Since Better Auth doesn't have organizations, use a default
    userInfo: {
      name: session.user.name ?? session.user.email ?? undefined,
      avatar: session.user.image ?? undefined,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  });
};
