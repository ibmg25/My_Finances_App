import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './auth';

// Refresh queue pattern: if multiple concurrent requests fail with 401,
// only ONE actually calls /token/refresh/ — the rest wait in the queue.
// This prevents a "thundering herd" of simultaneous refresh calls.
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null): void {
  refreshQueue.forEach(resolve => resolve(token));
  refreshQueue = [];
}

async function attemptRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    saveTokens(data.access, refreshToken);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status !== 401) return res;

  // 401 — attempt silent token refresh
  if (isRefreshing) {
    // Another request is already refreshing; wait in queue
    const newToken = await new Promise<string | null>(resolve => {
      refreshQueue.push(resolve);
    });
    if (!newToken) {
      clearTokens();
      window.location.href = '/login';
      return res;
    }
    return fetch(`/api${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
  }

  isRefreshing = true;
  const newToken = await attemptRefresh();
  isRefreshing = false;
  processQueue(newToken);

  if (!newToken) {
    clearTokens();
    window.location.href = '/login';
    return res;
  }

  return fetch(`/api${path}`, {
    ...options,
    headers: { ...headers, Authorization: `Bearer ${newToken}` },
  });
}
