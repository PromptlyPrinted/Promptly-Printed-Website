import 'server-only';
import { env } from '@repo/env';
import { SquareClient } from 'square';

// Initialize Square client
// Note: Square SDK's Environment enum doesn't export properly in some build contexts
// Using string literals 'production' and 'sandbox' instead
export const square = new SquareClient({
  token: env.SQUARE_ACCESS_TOKEN,
  environment: env.SQUARE_ENVIRONMENT === 'production'
    ? 'production' as any
    : 'sandbox' as any,
});

// Export Square types
export type { Client as Square } from 'square';
