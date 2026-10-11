import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const STORAGE_KEY_CUSTOM_API = '@ashok_raj/custom_api_url';
let inMemoryCustomApiUrl: string | null = null;

// Initialize custom URL from AsyncStorage if previously saved by user
try {
  AsyncStorage.getItem(STORAGE_KEY_CUSTOM_API).then((stored) => {
    if (stored && stored.trim()) {
      inMemoryCustomApiUrl = trimTrailingSlash(stored.trim());
    }
  }).catch(() => {});
} catch {}

export async function setCustomApiUrl(url: string | null): Promise<void> {
  if (!url || !url.trim()) {
    inMemoryCustomApiUrl = null;
    await AsyncStorage.removeItem(STORAGE_KEY_CUSTOM_API);
  } else {
    const clean = trimTrailingSlash(url.trim());
    inMemoryCustomApiUrl = clean;
    await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_API, clean);
  }
}

export function getCustomApiUrl(): string | null {
  return inMemoryCustomApiUrl;
}

export function getApiBaseUrl(): string {
  // 1. Explicit user override from app Settings
  if (inMemoryCustomApiUrl) {
    const root = trimTrailingSlash(inMemoryCustomApiUrl);
    return root.endsWith('/api/v1') ? root : `${root}/api/v1`;
  }

  // 2. Web browser: use window.location.hostname
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:3001/api/v1`;
  }

  // 3. React Native on physical device: dynamically extract host from Expo bundle scriptURL
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:3001/api/v1`;
      }
    }
  } catch {}

  // 4. Fallback to EXPO_PUBLIC_API_URL or localhost
  const configuredApi = (process.env.EXPO_PUBLIC_API_URL || '').trim();
  const apiRoot = trimTrailingSlash(configuredApi || 'http://localhost:3001');
  return apiRoot.endsWith('/api/v1') ? apiRoot : `${apiRoot}/api/v1`;
}

export function getWsBaseUrl(): string {
  if (inMemoryCustomApiUrl) {
    const wsRoot = trimTrailingSlash(inMemoryCustomApiUrl).replace(/^http/, 'ws');
    return wsRoot.endsWith('/api/v1') ? wsRoot.replace(/\/api\/v1$/, '') : wsRoot;
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `ws://${host}:3001`;
  }

  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `ws://${match[1]}:3001`;
      }
    }
  } catch {}

  const configuredWs = (process.env.EXPO_PUBLIC_WS_URL || '').trim();
  const wsRoot = trimTrailingSlash(configuredWs || 'ws://localhost:3001');
  return wsRoot.endsWith('/api/v1') ? wsRoot.replace(/\/api\/v1$/, '') : wsRoot;
}

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();

// ── Auth Token Management ────────────────────────────────────────────────────
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let isRefreshing = false;

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string } | null): void {
  if (!tokens) {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
  } else {
    inMemoryAccessToken = tokens.accessToken;
    if (tokens.refreshToken) {
      inMemoryRefreshToken = tokens.refreshToken;
    }
  }
}

export function clearAuthTokens(): void {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
}

export function getAuthTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: inMemoryAccessToken,
    refreshToken: inMemoryRefreshToken,
  };
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number; skipAuth?: boolean }
): Promise<Response> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const timeoutMs = init?.timeoutMs ?? 15000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const authHeaders: Record<string, string> = {};
  if (!init?.skipAuth && inMemoryAccessToken) {
    authHeaders['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  try {
    let response = await fetch(`${baseUrl}${normalized}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders,
        ...(init?.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    // 401 Automatic Token Refresh Interception
    const isAuthEndpoint =
      normalized.includes('/auth/refresh') ||
      normalized.includes('/auth/login') ||
      normalized.includes('/auth/verify-otp') ||
      normalized.includes('/auth/logout');

    if (response.status === 401 && inMemoryRefreshToken && !isAuthEndpoint && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: inMemoryRefreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.tokens) {
            setAuthTokens(refreshData.data.tokens);

            // Retry original request with newly issued access token
            const retryController = new AbortController();
            const retryTimeout = setTimeout(() => retryController.abort(), timeoutMs);

            response = await fetch(`${baseUrl}${normalized}`, {
              ...init,
              signal: retryController.signal,
              headers: {
                Accept: 'application/json',
                ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
                Authorization: `Bearer ${refreshData.data.tokens.accessToken}`,
                ...(init?.headers || {}),
              },
            });
            clearTimeout(retryTimeout);
          }
        } else {
          clearAuthTokens();
        }
      } catch {
        // If refresh failed due to network, proceed with original response
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (
      err?.name === 'AbortError' ||
      err?.message?.toLowerCase().includes('canceled') ||
      err?.message?.toLowerCase().includes('abort')
    ) {
      throw new Error(
        `Server connection timed out (${Math.round(timeoutMs / 1000)}s). Could not reach ${baseUrl}. Please ensure your phone is connected to the same network (e.g. mobile hotspot).`
      );
    }
    if (err?.message?.toLowerCase().includes('network request failed')) {
      throw new Error(
        `Cannot reach server at ${baseUrl}. Please check Wi-Fi / mobile hotspot connection.`
      );
    }
    throw err;
  }
}

export async function testBackendConnection(urlOverride?: string): Promise<{
  ok: boolean;
  statusText: string;
  latencyMs: number;
  data?: any;
}> {
  const start = Date.now();
  try {
    let target = urlOverride ? trimTrailingSlash(urlOverride) : getApiBaseUrl();
    if (target.endsWith('/api/v1')) {
      target = target.replace(/\/api\/v1$/, '');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${target}/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    const json = await res.json().catch(() => null);

    return {
      ok: res.ok,
      statusText: res.ok ? 'Connected' : `HTTP ${res.status}`,
      latencyMs,
      data: json,
    };
  } catch (err: any) {
    return {
      ok: false,
      statusText: err?.name === 'AbortError' ? 'Connection timed out' : (err?.message || 'Connection failed'),
      latencyMs: Date.now() - start,
    };
  }
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}
