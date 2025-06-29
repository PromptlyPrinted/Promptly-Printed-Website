import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = await database.user.findUnique({
    where: { id: userId },
  });

  if (user?.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const logs = await database.log.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(logs);
}
