import { SquareClient, SquareEnvironment, SquareError } from 'square';

// Square environment is chosen explicitly. NODE_ENV is "production" on every
// Vercel deployment, previews included, so it cannot tell live from test.
//   SQUARE_ENVIRONMENT=production  → live payments
//   anything else / unset          → sandbox
export const SQUARE_IS_PRODUCTION = process.env.SQUARE_ENVIRONMENT === 'production';

let client: SquareClient | null = null;

export function getSquare(): SquareClient {
  if (!client) {
    if (!process.env.SQUARE_ACCESS_TOKEN) throw new Error('SQUARE_ACCESS_TOKEN is not configured');
    client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: SQUARE_IS_PRODUCTION ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });
  }
  return client;
}

export function squareLocationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error('SQUARE_LOCATION_ID is not configured');
  return id;
}

/** Human-readable message from a Square API error (card declined etc.). */
export function squareErrorMessage(error: unknown): string {
  if (error instanceof SquareError && error.errors?.length) {
    return error.errors.map((e) => e.detail ?? e.code).join('; ');
  }
  return error instanceof Error ? error.message : 'Payment failed';
}
