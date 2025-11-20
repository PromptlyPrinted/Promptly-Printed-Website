import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('better-auth.csrf-token')?.value || '';
  return NextResponse.json({ csrfToken: token });
}
