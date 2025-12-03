let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (cachedToken) return cachedToken;
  
  // If there's already a fetch in progress, wait for it
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }
  
  // Fetch new token
  tokenFetchPromise = (async () => {
    try {
      const res = await fetch('/api/auth/csrf', { 
        credentials: 'include',
        cache: 'no-store' // Always fetch fresh token
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch CSRF token: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const token = data.csrfToken as string;
      if (!token || token.trim() === '') {
        console.error('[getCsrfToken] Empty token received from server');
        throw new Error('CSRF token not found in response. Please refresh the page and try again.');
      }
      cachedToken = token;
      console.log('[getCsrfToken] Token retrieved successfully, length:', token.length);
      return token;
    } catch (error) {
      // Clear promise on error so we can retry
      tokenFetchPromise = null;
      throw error;
    } finally {
      // Clear promise after a short delay to allow for retries if needed
      setTimeout(() => {
        tokenFetchPromise = null;
      }, 1000);
    }
  })();
  
  return tokenFetchPromise;
}

export async function withCsrf(init?: RequestInit): Promise<RequestInit> {
  const token = await getCsrfToken();
  const headers = new Headers(init?.headers || {});
  headers.set('x-csrf-token', token);
  return { ...init, headers, credentials: 'include' as RequestCredentials };
}

