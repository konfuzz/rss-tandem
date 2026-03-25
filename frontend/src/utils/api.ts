import { useAuthStore } from '../stores/auth';

const apiUrl = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const auth = useAuthStore();
  const token = auth.token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn('Сессия истекла или токен невалиден');
    auth.logout();
    return response;
  }

  return response;
}
