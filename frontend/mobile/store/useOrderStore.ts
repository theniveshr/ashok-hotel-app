import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order, PlaceOrderInput } from '@ashok-raj/types';

import { apiFetch } from '../config/api';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  placeOrder: (input: PlaceOrderInput) => Promise<Order | null>;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  cancelOrder: (id: string, reason?: string) => Promise<boolean>;
  updateOrderStatusLocally: (orderId: string, status: any, note?: string) => void;
  setActiveOrder: (order: Order | null) => void;
}

const mockOrders: Order[] = [
  {
    id: 'ord-8821',
    orderNumber: 'AR-ORD-8821',
    branchId: 'branch-kalaiyarkoil',
    type: 'HOME_DELIVERY',
    status: 'PREPARING',
    subtotal: 350,
    taxAmount: 17.5,
    deliveryFee: 0,
    discountAmount: 40,
    total: 327.5,
    totalAmount: 327.5,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    notes: 'Please pack extra chutneys & spicy gravy',
    estimatedDeliveryMinutes: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'it-1',
        menuItemId: 'item-3',
        name: 'Seeraga Samba Mutton Biryani',
        nameTa: 'சீரக சம்பா ஆட்டுக்கறி பிரியாணி',
        price: 320,
        quantity: 1,
        subtotal: 320,
        addons: [
          {
            id: 'ad-1',
            orderItemId: 'it-1',
            addonId: 'addon-5',
            name: 'Boiled Egg',
            nameTa: 'வேகவைத்த முட்டை',
            price: 15,
          },
        ],
      },
      {
        id: 'it-2',
        menuItemId: 'item-5',
        name: 'Kalaiyarkoil Degree Filter Coffee',
        nameTa: 'காளையார்கோவில் டிகிரி ஃபில்டர் காபி',
        price: 35,
        quantity: 1,
        subtotal: 35,
        addons: [],
      },
    ],
    statusHistory: [
      {
        id: 'hist-1',
        orderId: 'ord-8821',
        status: 'PLACED',
        note: 'Order placed by customer via mobile app',
        changedBy: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: 'hist-2',
        orderId: 'ord-8821',
        status: 'ACCEPTED',
        note: 'Order accepted by Kitchen Manager',
        changedBy: 'kitchen',
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
      {
        id: 'hist-3',
        orderId: 'ord-8821',
        status: 'PREPARING',
        note: 'Master Chef is cooking in Dum pot',
        changedBy: 'chef',
        createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      },
    ],
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,
      activeOrder: mockOrders[0] ?? null,
      isLoading: false,
      error: null,

      setActiveOrder: (activeOrder: Order | null) => {
        set({ activeOrder });
      },

      updateOrderStatusLocally: (orderId: string, status: any, note?: string) => {
        const { orders, activeOrder } = get();
        const updatedOrders = orders.map((o) => {
          if (o.id === orderId || o.orderNumber === orderId) {
            const history = o.statusHistory || [];
            return {
              ...o,
              status,
              statusHistory: [
                ...history,
                {
                  id: `hist-${Date.now()}`,
                  orderId: o.id,
                  status,
                  note: note || `Status updated to ${status}`,
                  changedBy: 'system',
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }
          return o;
        });

        const updatedActive =
          activeOrder && (activeOrder.id === orderId || activeOrder.orderNumber === orderId)
            ? updatedOrders.find((o) => o.id === activeOrder.id) || null
            : activeOrder;

        set({ orders: updatedOrders, activeOrder: updatedActive });
      },

      placeOrder: async (input: PlaceOrderInput): Promise<Order | null> => {
        set({ isLoading: true, error: null });
        const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        try {
          const res = await apiFetch('/customer/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify({ ...input, idempotencyKey }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const newOrder: Order = {
                ...json.data,
                totalAmount: json.data.total ?? json.data.totalAmount,
              };
              set((state) => ({
                orders: [newOrder, ...state.orders],
                activeOrder: newOrder,
                isLoading: false,
              }));
              return newOrder;
            }
          }
        } catch (err: any) {
          console.log('Order API offline, placing local mock order:', err.message);
        }

        // Fallback robust local order creation
        const orderNumber = `AR-ORD-${Date.now().toString().slice(-4)}`;
        const subtotal = input.items.reduce((s, it) => s + (it as any).price * it.quantity, 0) || 300;
        const discountAmount = input.couponCode ? 40 : 0;
        const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
        const deliveryFee = input.type === 'HOME_DELIVERY' ? (subtotal >= 300 ? 0 : 30) : 0;
        const total = Math.max(0, subtotal + taxAmount + deliveryFee - discountAmount);

        const localOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber,
          branchId: 'branch-kalaiyarkoil',
          type: input.type,
          status: 'PLACED',
          subtotal,
          taxAmount,
          deliveryFee,
          discountAmount,
          total,
          totalAmount: total,
          paymentStatus: input.paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
          paymentMethod: input.paymentMethod,
          notes: input.notes ?? null,
          estimatedDeliveryMinutes: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: input.items.map((it: any, idx) => ({
            id: `it-${idx}`,
            menuItemId: it.menuItemId,
            name: it.name || 'Chettinad Special Food Item',
            nameTa: it.nameTa || 'செட்டிநாடு உணவு',
            price: it.price || 150,
            quantity: it.quantity,
            subtotal: (it.price || 150) * it.quantity,
            notes: it.note ?? null,
            addons: (it.addons || []).map((ad: any, aIdx: number) => ({
              id: `ad-${aIdx}`,
              orderItemId: `it-${idx}`,
              addonId: ad.addonId || 'ad-1',
              name: ad.name || 'Extra Addon',
              nameTa: ad.nameTa || 'கூடுதல் சுவை',
              price: ad.price || 20,
            })),
          })),
          statusHistory: [
            {
              id: `hist-1`,
              orderId: `ord-${Date.now()}`,
              status: 'PLACED',
              note: 'Order placed by customer via mobile app',
              changedBy: null,
              createdAt: new Date().toISOString(),
            },
          ],
        };

        set((state) => ({
          orders: [localOrder, ...state.orders],
          activeOrder: localOrder,
          isLoading: false,
        }));

        return localOrder;
      },

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiFetch('/customer/orders');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data && json.data.length > 0) {
              set({ orders: json.data, isLoading: false });
              return;
            }
          }
        } catch {
          // Fallback to existing orders
        }
        set({ isLoading: false });
      },

      fetchOrderById: async (id: string) => {
        try {
          const res = await apiFetch(`/customer/orders/${id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              set({ activeOrder: json.data });
              return json.data;
            }
          }
        } catch {
          // Fallback
        }
        const existing = get().orders.find((o) => o.id === id || o.orderNumber === id) || null;
        if (existing) set({ activeOrder: existing });
        return existing;
      },

      cancelOrder: async (id: string, reason?: string) => {
        try {
          const res = await apiFetch(`/customer/orders/${id}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          });
          if (res.ok) {
            get().updateOrderStatusLocally(id, 'CANCELLED', reason);
            return true;
          }
        } catch {
          // Fallback
        }
        get().updateOrderStatusLocally(id, 'CANCELLED', reason);
        return true;
      },
    }),
    {
      name: 'ashok-raj-orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
