import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from './server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth.handler);

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://promptlyprinted.com',
  'https://app.promptlyprinted.com',
  'https://auth.promptlyprinted.com',
];

// Helper to add CORS headers
function addCorsHeaders(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    headers.set('Access-Control-Max-Age', '86400');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Wrap GET handler with CORS
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = await originalGET(request);
  return addCorsHeaders(response, origin);
}

// Wrap POST handler with CORS
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = await originalPOST(request);
  return addCorsHeaders(response, origin);
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, origin);
}