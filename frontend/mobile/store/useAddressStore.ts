import { create } from 'zustand';
import type { Address } from '@ashok-raj/types';
import type { CreateAddressInput, UpdateAddressInput } from '@ashok-raj/validation';
import { apiFetch } from '../config/api';

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  addAddress: (data: CreateAddressInput) => Promise<Address | null>;
  updateAddress: (id: string, data: UpdateAddressInput) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  selectAddress: (id: string) => void;
  getDefaultAddress: () => Address | null;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch('/customer/addresses');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          set({
            addresses: json.data,
            isLoading: false,
            selectedAddressId:
              json.data.find((a: Address) => a.isDefault)?.id ||
              json.data[0]?.id ||
              null,
          });
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    set({ isLoading: false });
  },

  addAddress: async (data: CreateAddressInput): Promise<Address | null> => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch('/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newAddr = json.data;
          set((state) => {
            const updated = data.isDefault
              ? state.addresses.map((a) => ({ ...a, isDefault: false }))
              : [...state.addresses];
            return {
              addresses: [newAddr, ...updated],
              selectedAddressId: newAddr.id,
              isLoading: false,
            };
          });
          return newAddr;
        }
      }
    } catch {
      // Offline fallback
    }

    // Local fallback
    const fallbackAddr: Address = {
      id: `addr_${Date.now()}`,
      userId: 'guest-user-1',
      label: data.label,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      lat: (data as any).lat != null ? Number((data as any).lat) : null,
      lng: (data as any).lng != null ? Number((data as any).lng) : null,
      isDefault: Boolean(data.isDefault),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const updated = data.isDefault
        ? state.addresses.map((a) => ({ ...a, isDefault: false }))
        : [...state.addresses];
      return {
        addresses: [fallbackAddr, ...updated],
        selectedAddressId: fallbackAddr.id,
        isLoading: false,
      };
    });

    return fallbackAddr;
  },

  updateAddress: async (id: string, data: UpdateAddressInput): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/customer/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          set((state) => ({
            addresses: state.addresses.map((a) =>
              a.id === id
                ? { ...a, ...json.data }
                : data.isDefault
                ? { ...a, isDefault: false }
                : a
            ),
            isLoading: false,
          }));
          return true;
        }
      }
    } catch {
      // Offline fallback
    }

    set((state) => ({
      addresses: state.addresses.map((a) =>
        a.id === id
          ? { ...a, ...data, updatedAt: new Date().toISOString() }
          : data.isDefault
          ? { ...a, isDefault: false }
          : a
      ),
      isLoading: false,
    }));
    return true;
  },

  deleteAddress: async (id: string): Promise<boolean> => {
    try {
      await apiFetch(`/customer/addresses/${id}`, { method: 'DELETE' });
    } catch {
      // Best effort
    }

    set((state) => {
      const filtered = state.addresses.filter((a) => a.id !== id);
      const wasSelected = state.selectedAddressId === id;
      return {
        addresses: filtered,
        selectedAddressId: wasSelected ? filtered[0]?.id || null : state.selectedAddressId,
      };
    });
    return true;
  },

  setDefaultAddress: async (id: string): Promise<boolean> => {
    return get().updateAddress(id, { isDefault: true });
  },

  selectAddress: (id: string) => {
    set({ selectedAddressId: id });
  },

  getDefaultAddress: (): Address | null => {
    const list = get().addresses;
    return list.find((a) => a.isDefault) || list[0] || null;
  },

  clearAddresses: () => {
    set({
      addresses: [],
      selectedAddressId: null,
      isLoading: false,
      error: null,
    });
  },
}));
