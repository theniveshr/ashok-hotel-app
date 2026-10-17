import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthTokens } from '@ashok-raj/types';
import { apiFetch, setAuthTokens, clearAuthTokens, getAuthTokens } from '../config/api';
import { useAddressStore } from './useAddressStore';
import { useTourStore } from './useTourStore';
import { useLocationStore } from './useLocationStore';

export type AppAuthState =
  | 'NEW_USER'
  | 'REGISTERED_LOGGED_OUT'
  | 'AUTHENTICATED'
  | 'SESSION_EXPIRED'
  | 'LOGGED_OUT';

interface AuthState {
  user: User | null;
  tokens: (AuthTokens & { sessionExpiresAt?: string }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authState: AppAuthState;
  sessionExpiresAt: string | null;

  setAuthState: (state: AppAuthState) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; debugOtp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: {
    phone: string;
    name: string;
    email?: string;
    otp?: string;
    password?: string;
    preferredLanguage?: 'en' | 'ta';
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithPassword: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: (allDevices?: boolean) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  updateProfile: (data: {
    name?: string;
    email?: string | null;
    preferredLanguage?: 'en' | 'ta';
  }) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

function normalizePhoneNumber(raw: string): string {
  let clean = (raw || '').replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+91')) {
    clean = clean.slice(3);
  } else if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }
  return clean.replace(/[^0-9]/g, '');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authState: 'NEW_USER',
      sessionExpiresAt: null,

      clearError: () => set({ error: null }),
      setAuthState: (authState: AppAuthState) => set({ authState }),

      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          const cleanPhone = normalizePhoneNumber(phone);
          const res = await apiFetch('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: cleanPhone }),
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Failed to send OTP. Please check your phone number.';
            set({ error: errorMsg });
            return { success: false, message: errorMsg, error: errorMsg };
          }

          return {
            success: true,
            message: data.data?.message || 'OTP sent successfully',
            debugOtp: data.data?.debugOtp,
          };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error while requesting OTP.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, message: errorMsg, error: errorMsg };
        }
      },

      verifyOtp: async (phone: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const cleanPhone = normalizePhoneNumber(phone);
          const cleanOtp = (otp || '').trim();
          const res = await apiFetch('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: cleanPhone, otp: cleanOtp }),
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Invalid OTP code. Please try again.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          const { user, tokens } = data.data;
          // Calculate 30-day session expiry (or use backend provided timestamp)
          const sessionExpiresAt =
            tokens?.sessionExpiresAt ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          setAuthTokens(tokens);
          set({
            user,
            tokens,
            isAuthenticated: true,
            authState: 'AUTHENTICATED',
            sessionExpiresAt,
            error: null,
          });

          return { success: true };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error during verification.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      register: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const payload = {
            ...input,
            phone: normalizePhoneNumber(input.phone),
          };
          const res = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
            timeoutMs: 20000,
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Registration failed.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          // Per specification: Registration complete, do NOT auto-login.
          // Save state as REGISTERED_LOGGED_OUT so device routes to Login on next app start.
          set({
            authState: 'REGISTERED_LOGGED_OUT',
            isAuthenticated: false,
            error: null,
          });

          return {
            success: true,
            message: data.data?.message || 'Registration successful! Please log in to continue.',
          };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error during registration.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      loginWithPassword: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const rawTarget = (identifier || '').trim();
          const isEmail = rawTarget.includes('@');
          const payload = isEmail
            ? { email: rawTarget.toLowerCase(), password }
            : { phone: normalizePhoneNumber(rawTarget), password };

          const res = await apiFetch('/auth/password-login', {
            method: 'POST',
            body: JSON.stringify(payload),
            timeoutMs: 20000,
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Invalid credentials. Please check your details.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          const { user, tokens } = data.data;
          // Calculate 30-day session expiry (or use backend provided timestamp)
          const sessionExpiresAt =
            tokens?.sessionExpiresAt ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          setAuthTokens(tokens);
          set({
            user,
            tokens,
            isAuthenticated: true,
            authState: 'AUTHENTICATED',
            sessionExpiresAt,
            error: null,
          });

          return { success: true };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error during login.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      resetPassword: async (phone: string, otp: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const cleanPhone = normalizePhoneNumber(phone);
          const res = await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              phone: cleanPhone,
              otp: otp.trim(),
              newPassword,
            }),
            timeoutMs: 20000,
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Password reset failed. Please check the OTP.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          return { success: true };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error resetting password.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      logout: async (allDevices = false) => {
        const { tokens } = get();
        try {
          if (tokens?.refreshToken) {
            await apiFetch('/auth/logout', {
              method: 'POST',
              body: JSON.stringify({
                refreshToken: tokens.refreshToken,
                allDevices,
              }),
            });
          }
        } catch {
          // Ignore network errors on logout to ensure local session is cleared
        } finally {
          clearAuthTokens();
          useAddressStore.getState().clearAddresses?.();
          useTourStore.getState().clearTourState?.();
          useLocationStore.getState().initLocation?.();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            authState: 'LOGGED_OUT',
            sessionExpiresAt: null,
            error: null,
          });
        }
      },

      restoreSession: async () => {
        const { tokens, sessionExpiresAt } = get();

        // 1. Check if token or session timestamp is missing
        if (!tokens?.accessToken) {
          const currentAuthState = get().authState;
          // Keep REGISTERED_LOGGED_OUT or LOGGED_OUT state if previously set
          if (currentAuthState !== 'NEW_USER' && currentAuthState !== 'REGISTERED_LOGGED_OUT') {
            set({ isAuthenticated: false, authState: 'LOGGED_OUT' });
          } else {
            set({ isAuthenticated: false });
          }
          return false;
        }

        // 2. Strict 30-Day Expiry Check
        if (sessionExpiresAt) {
          const expiryTime = new Date(sessionExpiresAt).getTime();
          if (Date.now() >= expiryTime) {
            clearAuthTokens();
            useAddressStore.getState().clearAddresses?.();
            useTourStore.getState().clearTourState?.();
            useLocationStore.getState().initLocation?.();
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
              authState: 'SESSION_EXPIRED',
              sessionExpiresAt: null,
              error: 'Your 30-day session has expired. Please log in again.',
            });
            return false;
          }
        }

        setAuthTokens(tokens);

        try {
          // 3. Validate session with backend /me endpoint
          const res = await apiFetch('/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.user) {
              set({
                user: data.data.user,
                isAuthenticated: true,
                authState: 'AUTHENTICATED',
              });
              return true;
            }
          }

          // 4. If /me failed, check if we have a refresh token to try recovery
          if (tokens.refreshToken) {
            const refreshRes = await apiFetch('/auth/refresh', {
              method: 'POST',
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.data?.tokens) {
                const newTokens = refreshData.data.tokens;
                const newSessionExpiry =
                  newTokens?.sessionExpiresAt ||
                  sessionExpiresAt ||
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

                setAuthTokens(newTokens);
                set({
                  tokens: newTokens,
                  isAuthenticated: true,
                  authState: 'AUTHENTICATED',
                  sessionExpiresAt: newSessionExpiry,
                });

                // Re-fetch user profile
                const meRes = await apiFetch('/auth/me');
                if (meRes.ok) {
                  const meData = await meRes.json();
                  if (meData.data?.user) {
                    set({ user: meData.data.user });
                  }
                }
                return true;
              }
            } else {
              const refreshData = await refreshRes.json().catch(() => null);
              if (refreshData?.error?.code === 'SESSION_EXPIRED' || refreshRes.status === 401) {
                clearAuthTokens();
                set({
                  user: null,
                  tokens: null,
                  isAuthenticated: false,
                  authState: 'SESSION_EXPIRED',
                  sessionExpiresAt: null,
                  error: 'Your 30-day session has expired. Please log in again.',
                });
                return false;
              }
            }
          }

          // Session invalid and unrefreshable
          clearAuthTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            authState: 'SESSION_EXPIRED',
            sessionExpiresAt: null,
          });
          return false;
        } catch {
          // In offline mode, retain existing saved session if token exists and within 30 days
          if (sessionExpiresAt && Date.now() < new Date(sessionExpiresAt).getTime()) {
            set({ isAuthenticated: true, authState: 'AUTHENTICATED' });
            return true;
          }
          set({ isAuthenticated: false, authState: 'SESSION_EXPIRED' });
          return false;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiFetch('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data),
          });

          const result = await res.json();
          set({ isLoading: false });

          if (!res.ok || !result.success) {
            const errorMsg = result?.error?.message || 'Failed to update profile.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          set({ user: result.data.user });
          return { success: true };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error updating profile.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },
    }),
    {
      name: '@ashok_raj/auth_session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        authState: state.authState,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
