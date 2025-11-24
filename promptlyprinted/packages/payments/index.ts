import 'server-only';
import { SquareClient } from 'square';

// Lazy initialization to avoid module evaluation errors in build environments
// where environment variables may not be available
let _square: SquareClient | null = null;

function getSquareClient(): SquareClient {
  if (!_square) {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT === 'production'
      ? 'production'
      : 'sandbox';

    if (!token) {
      throw new Error('SQUARE_ACCESS_TOKEN is not configured');
    }

    _square = new SquareClient({
      token,
      environment: environment as any,
    });
  }
  return _square;
}

// Export a proxy that lazily initializes the client
export const square = new Proxy({} as SquareClient, {
  get(_target, prop) {
    const client = getSquareClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Export Square types
export type { Client as Square } from 'square';
