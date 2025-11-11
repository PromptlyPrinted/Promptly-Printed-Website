import { getFlags } from '@repo/feature-flags/access';
import type { NextRequest } from 'next/server';

export const GET = (
  request: NextRequest,
  context: { params: Promise<{}> }
) => getFlags(request, context);
