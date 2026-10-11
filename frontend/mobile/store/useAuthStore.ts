import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthTokens } from '@ashok-raj/types';
import { apiFetch, setAuthTokens, clearAuthTokens, getAuthTokens } from '../config/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; debugOtp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: {
    phone: string;
    name: string;
    email?: string;
    otp?: string;
    password?: string;
    preferredLanguage?: 'en' | 'ta';
    autoLogin?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: (allDevices?: boolean) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  updateProfile: (data: {
    name?: string;
    email?: string | null;
    preferredLanguage?: 'en' | 'ta';
  }) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiFetch('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
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
            message: data.data.message,
            debugOtp: data.data.debugOtp,
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
          const res = await apiFetch('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Invalid OTP code. Please try again.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          const { user, tokens } = data.data;
          setAuthTokens(tokens);
          set({
            user,
            tokens,
            isAuthenticated: true,
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
          const { autoLogin, ...payload } = input;
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

          // If autoLogin is false, do not set auth tokens or log the user in immediately
          if (autoLogin === false) {
            return { success: true };
          }

          const { user, tokens } = data.data;
          setAuthTokens(tokens);
          set({
            user,
            tokens,
            isAuthenticated: true,
            error: null,
          });

          return { success: true };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error during registration.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      loginWithPassword: async (phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiFetch('/auth/password-login', {
            method: 'POST',
            body: JSON.stringify({ phone, password }),
            timeoutMs: 20000,
          });

          const data = await res.json();
          set({ isLoading: false });

          if (!res.ok || !data.success) {
            const errorMsg = data?.error?.message || 'Invalid phone number or password.';
            set({ error: errorMsg });
            return { success: false, error: errorMsg };
          }

          const { user, tokens } = data.data;
          setAuthTokens(tokens);
          set({
            user,
            tokens,
            isAuthenticated: true,
            error: null,
          });

          return { success: true };
        } catch (err: any) {
          const errorMsg = err?.message || 'Network error during login.';
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
          // Ignore network errors on logout to allow clean local state clearing
        } finally {
          clearAuthTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      restoreSession: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) {
          set({ isAuthenticated: false });
          return false;
        }

        setAuthTokens(tokens);

        try {
          // Validate session with backend /me endpoint
          const res = await apiFetch('/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.user) {
              set({
                user: data.data.user,
                isAuthenticated: true,
              });
              return true;
            }
          }

          // If /me failed, check if we have a refresh token to try recovery
          if (tokens.refreshToken) {
            const refreshRes = await apiFetch('/auth/refresh', {
              method: 'POST',
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.data?.tokens) {
                const newTokens = refreshData.data.tokens;
                setAuthTokens(newTokens);
                set({ tokens: newTokens, isAuthenticated: true });

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
            }
          }

          // Session invalid and unrefreshable
          clearAuthTokens();
          set({ user: null, tokens: null, isAuthenticated: false });
          return false;
        } catch {
          // In offline mode, retain existing saved session if token format is valid
          set({ isAuthenticated: true });
          return true;
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
      }),
    }
  )
);
