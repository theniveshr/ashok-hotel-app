import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../config/api';

export interface Branch {
  id: string;
  name: string;
  nameTa: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  isMainBranch?: boolean;
  isActive?: boolean;
}

interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;
  isLoading: boolean;
  error: string | null;
  fetchBranches: () => Promise<void>;
  selectBranch: (branch: Branch) => Promise<void>;
  initBranch: () => Promise<void>;
}

const STORAGE_KEY = '@ashok_raj_selected_branch';

export const DEFAULT_MAIN_BRANCH: Branch = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Ashok Raj Lodge & Restaurant A/C',
  nameTa: 'அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் குளிரூட்டி',
  phone: '04575 232 333',
  address: 'No-1412, Madurai to Thondi Main Road, Kalaiyarkoil',
  city: 'Kalayarkoil',
  state: 'Tamil Nadu',
  pincode: '630551',
  isMainBranch: true,
  isActive: true,
};

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [DEFAULT_MAIN_BRANCH],
  selectedBranch: DEFAULT_MAIN_BRANCH,
  isLoading: false,
  error: null,

  initBranch: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          set({ selectedBranch: parsed });
        }
      }
    } catch {
      // Use default main branch
    }
    await get().fetchBranches();
  },

  fetchBranches: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch('/customer/branches');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const branches: Branch[] = json.data;
          set({ branches });
          const current = get().selectedBranch;
          // If current is not found in latest branches, pick main or first
          if (!current || !branches.some((b) => b.id === current.id)) {
            const main = branches.find((b) => b.isMainBranch) || branches[0];
            set({ selectedBranch: main });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(main));
          }
          set({ isLoading: false });
          return;
        }
      }
    } catch (e: any) {
      set({ error: e?.message || 'Failed to fetch branches' });
    }
    set({ isLoading: false });
  },

  selectBranch: async (branch: Branch) => {
    set({ selectedBranch: branch });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(branch));
    } catch {
      // Storage error non-critical
    }
  },
}));
