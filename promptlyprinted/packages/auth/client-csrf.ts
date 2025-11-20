let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch('/api/auth/csrf', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch CSRF token');
  const data = await res.json();
  cachedToken = data.csrfToken as string;
  return cachedToken || '';
}

export async function withCsrf(init?: RequestInit): Promise<RequestInit> {
  const token = await getCsrfToken();
  const headers = new Headers(init?.headers || {});
  headers.set('x-csrf-token', token);
  return { ...init, headers, credentials: 'include' as RequestCredentials };
}

