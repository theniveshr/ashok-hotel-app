import { Platform } from 'react-native';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:3001/api/v1`;
  }
  const configuredApi = (process.env.EXPO_PUBLIC_API_URL || '').trim();
  const apiRoot = trimTrailingSlash(configuredApi || 'http://localhost:3001');
  return apiRoot.endsWith('/api/v1') ? apiRoot : `${apiRoot}/api/v1`;
}

export function getWsBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `ws://${host}:3001`;
  }
  const configuredWs = (process.env.EXPO_PUBLIC_WS_URL || '').trim();
  const wsRoot = trimTrailingSlash(configuredWs || 'ws://localhost:3001');
  return wsRoot.endsWith('/api/v1') ? wsRoot.replace(/\/api\/v1$/, '') : wsRoot;
}

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();

export async function apiFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const timeoutMs = init?.timeoutMs ?? 2500;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${normalized}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}
