import { SquareClient, SquareEnvironment } from 'square';

// Initialize Square client
export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

// Square location ID (you'll get this from Square dashboard)
export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!;

// Application ID for web payments SDK
export const SQUARE_APPLICATION_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!;
