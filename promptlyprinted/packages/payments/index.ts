import 'server-only';
import { env } from '@repo/env';
import { Client, Environment } from 'square';

// Initialize Square client
export const square = new Client({
  accessToken: env.SQUARE_ACCESS_TOKEN,
  environment: env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

// Export Square types
export type { Client as Square } from 'square';
export { Environment as SquareEnvironment } from 'square';
