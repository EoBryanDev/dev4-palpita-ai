export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/csrf');
    if (!res.ok) return null;
    const data = await res.json();
    return data.csrfToken ?? null;
  } catch {
    return null;
  }
}

export function getCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}
