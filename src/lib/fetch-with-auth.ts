import { auth } from '@/lib/firebase/client';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = '';
  
  if (auth && auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn("Failed to get auth token", e);
    }
  }

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
