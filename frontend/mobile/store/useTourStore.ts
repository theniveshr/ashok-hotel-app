import { create } from 'zustand';
import type { TourStatus } from '@ashok-raj/types';
import { apiFetch } from '../config/api';

interface TourState {
  tourStatus: TourStatus | null;
  currentStep: number; // 1 to 6
  isTourActive: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchTourStatus: () => Promise<TourStatus>;
  updateTourStatus: (status: 'completed' | 'skipped') => Promise<boolean>;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  skipTour: () => Promise<boolean>;
  finishTour: () => Promise<boolean>;
  dismissTourTemporarily: () => void;
  clearTourState: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  tourStatus: null,
  currentStep: 1,
  isTourActive: false,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchTourStatus: async (): Promise<TourStatus> => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch('/customer/profile/tour-status');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.tourStatus) {
          const status = json.data.tourStatus as TourStatus;
          set({ tourStatus: status, isLoading: false });
          return status;
        }
      }
    } catch {
      // Offline fallback
    }

    const fallbackStatus: TourStatus = get().tourStatus || 'not_started';
    set({ tourStatus: fallbackStatus, isLoading: false });
    return fallbackStatus;
  },

  updateTourStatus: async (status: 'completed' | 'skipped'): Promise<boolean> => {
    set({ isSaving: true, error: null });
    try {
      const res = await apiFetch('/customer/profile/tour-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          set({
            tourStatus: status,
            isTourActive: false,
            isSaving: false,
          });
          return true;
        }
      }
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || 'Failed to save tour status';
      set({ error: errMsg, isSaving: false });
      return false;
    } catch (err: any) {
      // Handle network error
      set({
        tourStatus: status,
        isTourActive: false,
        isSaving: false,
        error: null,
      });
      return true;
    }
  },

  startTour: () => {
    set({ isTourActive: true, currentStep: 1, error: null });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 6) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step: number) => {
    if (step >= 1 && step <= 6) {
      set({ currentStep: step });
    }
  },

  skipTour: async (): Promise<boolean> => {
    return get().updateTourStatus('skipped');
  },

  finishTour: async (): Promise<boolean> => {
    return get().updateTourStatus('completed');
  },

  dismissTourTemporarily: () => {
    set({ isTourActive: false });
  },

  clearTourState: () => {
    set({
      tourStatus: null,
      currentStep: 1,
      isTourActive: false,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },
}));
