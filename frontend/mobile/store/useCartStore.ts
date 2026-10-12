import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OrderType } from '@ashok-raj/types';

export interface CartAddon {
  id: string;
  name: string;
  nameTa?: string;
  price: number;
}

export interface CartItem {
  id: string;
  name: string;
  nameTa?: string;
  price: number;
  discountPercentage?: number;
  isVeg?: boolean;
  quantity: number;
  addons?: Array<string | CartAddon>;
  notes?: string;
  imageUrl?: string | null;
}

export type AddCartItemInput = {
  id: string;
  name: string;
  nameTa?: string;
  price: number;
  discountPercentage?: number;
  isVeg?: boolean;
  quantity?: number;
  addons?: Array<string | CartAddon>;
  notes?: string;
  imageUrl?: string | null;
};

export interface DeliveryAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

interface CartState {
  items: CartItem[];
  deliveryType: OrderType;
  selectedAddress: DeliveryAddress | null;
  specialInstructions: string;
  couponCode: string | null;
  discountAmount: number;
  taxRate: number;

  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryType: (type: OrderType) => void;
  setSelectedAddress: (address: DeliveryAddress | null) => void;
  setSpecialInstructions: (notes: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: 'HOME_DELIVERY',
      selectedAddress: null,
      specialInstructions: '',
      couponCode: null,
      discountAmount: 0,
      taxRate: 0.05, // 5% GST

      addItem: (itemInput: AddCartItemInput) => {
        const { items } = get();
        const qtyToAdd = itemInput.quantity && itemInput.quantity > 0 ? itemInput.quantity : 1;
        const addons = itemInput.addons || [];

        const existingIndex = items.findIndex((i) => i.id === itemInput.id);

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const existing = updatedItems[existingIndex];
          updatedItems[existingIndex] = {
            ...existing,
            quantity: existing.quantity + qtyToAdd,
            addons: addons.length > 0 ? addons : existing.addons,
            price: itemInput.price ?? existing.price,
            notes: itemInput.notes || existing.notes,
          };
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            id: itemInput.id,
            name: itemInput.name,
            nameTa: itemInput.nameTa,
            price: itemInput.price,
            discountPercentage: itemInput.discountPercentage,
            isVeg: itemInput.isVeg,
            quantity: qtyToAdd,
            addons,
            notes: itemInput.notes,
            imageUrl: itemInput.imageUrl,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id: string, newQty: number) => {
        if (newQty <= 0) {
          set({ items: get().items.filter((item) => item.id !== id) });
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity: newQty } : item
            ),
          });
        }
      },

      setDeliveryType: (deliveryType: OrderType) => {
        set({ deliveryType });
      },

      setSelectedAddress: (selectedAddress: DeliveryAddress | null) => {
        set({ selectedAddress });
      },

      setSpecialInstructions: (specialInstructions: string) => {
        set({ specialInstructions });
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          discountAmount: 0,
          specialInstructions: '',
        });
      },

      applyCoupon: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === 'ASHOKRAJ20' || cleanCode === 'WELCOME50' || cleanCode === 'FEAST100') {
          const discount = cleanCode === 'FEAST100' ? 100 : cleanCode === 'WELCOME50' ? 50 : 40;
          set({ couponCode: cleanCode, discountAmount: discount });
          return true;
        }
        return false;
      },

      removeCoupon: () => {
        set({ couponCode: null, discountAmount: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          let itemAddonSum = 0;
          if (item.addons && Array.isArray(item.addons)) {
            for (const ad of item.addons) {
              if (typeof ad === 'object' && ad.price) {
                itemAddonSum += Number(ad.price);
              }
            }
          }
          return sum + (Number(item.price) + itemAddonSum) * item.quantity;
        }, 0);
      },

      getDeliveryFee: () => {
        const { deliveryType } = get();
        if (deliveryType !== 'HOME_DELIVERY') return 0;
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 300 ? 0 : 30;
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        return Math.round(subtotal * get().taxRate * 100) / 100;
      },

      getTotalAmount: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const tax = get().getTaxAmount();
        const deliveryFee = get().getDeliveryFee();
        const { discountAmount } = get();
        return Math.max(0, Math.round((subtotal + tax + deliveryFee - discountAmount) * 100) / 100);
      },

      getTotalCount: () => {
        return get().items.reduce((acc, curr) => acc + curr.quantity, 0);
      },
    }),
    {
      name: 'ashok-raj-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
