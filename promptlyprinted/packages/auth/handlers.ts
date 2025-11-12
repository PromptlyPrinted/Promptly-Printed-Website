import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from './server';
import { NextResponse } from 'next/server';

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

  console.log('[CORS] Origin:', origin);
  console.log('[CORS] Allowed origins:', ALLOWED_ORIGINS);
  console.log('[CORS] Origin allowed?', origin && ALLOWED_ORIGINS.includes(origin));

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    headers.set('Access-Control-Max-Age', '86400');
    console.log('[CORS] Headers added for origin:', origin);
  } else {
    console.log('[CORS] Origin not allowed, no CORS headers added');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Wrap GET handler with CORS
export async function GET(...args: Parameters<typeof originalGET>) {
  const [request] = args;
  const origin = request.headers.get('origin');
  console.log('[AUTH GET] Request from origin:', origin);

  const response = await originalGET(...args);
  console.log('[AUTH GET] Response status:', response.status);

  return addCorsHeaders(response, origin);
}

// Wrap POST handler with CORS
export async function POST(...args: Parameters<typeof originalPOST>) {
  const [request] = args;
  const origin = request.headers.get('origin');
  console.log('[AUTH POST] Request from origin:', origin);

  const response = await originalPOST(...args);
  console.log('[AUTH POST] Response status:', response.status);

  return addCorsHeaders(response, origin);
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  console.log('[AUTH OPTIONS] Preflight request from origin:', origin);

  const response = new NextResponse(null, { status: 204 });
  const corsResponse = addCorsHeaders(response, origin);

  console.log('[AUTH OPTIONS] Response headers:', Object.fromEntries(corsResponse.headers.entries()));

  return corsResponse;
}