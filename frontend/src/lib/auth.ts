const ACCESS_KEY = 'fin_access';
const REFRESH_KEY = 'fin_refresh';

export function saveTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  // Boolean presence cookie for Edge middleware — localStorage is not available in the Edge runtime.
  document.cookie = 'fin_auth=1; path=/; SameSite=Lax';
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = 'fin_auth=; path=/; max-age=0';
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}
