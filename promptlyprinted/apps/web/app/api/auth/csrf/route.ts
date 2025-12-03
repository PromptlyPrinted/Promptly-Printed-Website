import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Must match the cookie name in server.ts (better-auth.csrf_token with underscore)
  const token = request.cookies.get('better-auth.csrf_token')?.value || '';
  return NextResponse.json({ csrfToken: token });
}

