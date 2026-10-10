import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Table, TableSession, ServiceRequestType, TableServiceRequest } from '@ashok-raj/types';

import { apiFetch } from '../config/api';

interface DineInState {
  table: Table | null;
  session: TableSession | null;
  isLoading: boolean;
  error: string | null;
  lastServiceRequest: TableServiceRequest | null;
  serviceRequestHistory: TableServiceRequest[];
  isPaid: boolean;
  receiptData: any | null;

  scanTableQr: (qrToken: string, guestCount?: number) => Promise<boolean>;
  sendServiceRequest: (type: ServiceRequestType, note?: string) => Promise<boolean>;
  requestBill: () => Promise<boolean>;
  payBill: (paymentMethod: string) => Promise<boolean>;
  addItemsToTable: (items: any[]) => Promise<boolean>;
  clearSession: () => void;
}

export const useDineInStore = create<DineInState>()(
  persist(
    (set, get) => ({
      table: null,
      session: null,
      isLoading: false,
      error: null,
      lastServiceRequest: null,
      serviceRequestHistory: [],
      isPaid: false,
      receiptData: null,

      scanTableQr: async (qrToken: string, guestCount: number = 2) => {
        set({ isLoading: true, error: null });

        try {
          const res = await apiFetch('/customer/dine-in/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrToken, guestCount }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              set({
                table: json.data.table,
                session: json.data.session,
                isLoading: false,
                isPaid: false,
                receiptData: null,
              });
              return true;
            }
          }
        } catch (err: any) {
          console.log('DineIn API offline, initializing local mock table session:', err.message);
        }

        // Mock Fallback Table Session
        const tableNumber = qrToken.replace(/\D/g, '').padStart(2, '0') || '04';
        const isAc = tableNumber === '04' || tableNumber === '12';
        const floor = tableNumber === '12' ? 2 : 1;

        const mockTable: Table = {
          id: `tbl-${tableNumber}`,
          branchId: 'branch-kalaiyarkoil',
          tableNumber,
          floor,
          capacity: tableNumber === '12' ? 8 : 4,
          status: 'OCCUPIED',
          isAc,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockSession: TableSession = {
          id: `session_tbl_${tableNumber}_${Date.now()}`,
          tableId: mockTable.id,
          tableNumber,
          branchId: 'branch-kalaiyarkoil',
          sessionToken: `stk_${Date.now()}`,
          openedAt: new Date().toISOString(),
          guestCount,
          status: 'OPEN',
          subtotal: 355,
          taxAmount: 17.75,
          total: 372.75,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          serviceRequests: [],
          orders: [
            {
              id: 'ord-tbl-1',
              orderNumber: `AR-TBL-${tableNumber}01`,
              branchId: 'branch-kalaiyarkoil',
              type: 'DINE_IN',
              status: 'PREPARING',
              subtotal: 355,
              taxAmount: 17.75,
              deliveryFee: 0,
              discountAmount: 0,
              total: 372.75,
              paymentStatus: 'PENDING',
              paymentMethod: 'CASH',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              items: [
                {
                  id: 'it-1',
                  menuItemId: 'item-1',
                  name: 'Special Ghee Roast Dosa',
                  nameTa: 'ஸ்பெஷல் நெய் ரோஸ்ட் தோசை',
                  price: 110,
                  quantity: 2,
                  subtotal: 220,
                  addons: [],
                },
                {
                  id: 'it-2',
                  menuItemId: 'item-4',
                  name: 'Paneer Butter Masala',
                  nameTa: 'பனீர் பட்டர் மசாலா',
                  price: 135,
                  quantity: 1,
                  subtotal: 135,
                  addons: [],
                },
              ],
            },
          ],
        };

        set({
          table: mockTable,
          session: mockSession,
          isLoading: false,
          isPaid: false,
          receiptData: null,
        });

        return true;
      },

      sendServiceRequest: async (type: ServiceRequestType, note?: string) => {
        const { session } = get();
        if (!session) return false;

        const newReq: TableServiceRequest = {
          id: `req_${Date.now()}`,
          tableSessionId: session.id,
          tableId: session.tableId,
          tableNumber: session.tableNumber,
          type,
          note: note || null,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };

        try {
          await apiFetch(`/customer/dine-in/session/${session.id}/service-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, note }),
          });
        } catch {
          // Fallback
        }

        set((state) => ({
          lastServiceRequest: newReq,
          serviceRequestHistory: [newReq, ...state.serviceRequestHistory],
        }));

        return true;
      },

      requestBill: async () => {
        const { session } = get();
        if (!session) return false;

        try {
          await apiFetch(`/customer/dine-in/session/${session.id}/request-bill`, {
            method: 'POST',
          });
        } catch {
          // Fallback
        }

        set((state) => ({
          session: state.session ? { ...state.session, status: 'BILL_REQUESTED' } : null,
        }));

        get().sendServiceRequest('BILL', 'Customer requested final bill');
        return true;
      },

      payBill: async (paymentMethod: string) => {
        const { session } = get();
        if (!session) return false;

        const receipt = {
          receiptNumber: `RCP-TBL-${Date.now().toString().slice(-6)}`,
          tableNumber: session.tableNumber,
          totalPaid: session.total,
          paymentMethod,
          paidAt: new Date().toISOString(),
        };

        try {
          await apiFetch(`/customer/dine-in/session/${session.id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentMethod }),
          });
        } catch {
          // Fallback
        }

        set((state) => ({
          isPaid: true,
          receiptData: receipt,
          session: state.session ? { ...state.session, status: 'PAID' } : null,
        }));

        return true;
      },

      addItemsToTable: async (items: any[]) => {
        const { session } = get();
        if (!session) return false;

        try {
          const res = await apiFetch(`/customer/dine-in/session/${session.id}/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              set({ session: json.data });
              return true;
            }
          }
        } catch {
          // Fallback
        }

        // Local aggregation
        const addedSubtotal = items.reduce((s, it) => s + (it.price || 100) * it.quantity, 0);
        const newOrder = {
          id: `ord-tbl-${Date.now()}`,
          orderNumber: `AR-TBL-${session.tableNumber}${session.orders.length + 1}`,
          branchId: 'branch-kalaiyarkoil',
          type: 'DINE_IN' as const,
          status: 'PREPARING' as const,
          subtotal: addedSubtotal,
          taxAmount: Math.round(addedSubtotal * 0.05 * 100) / 100,
          deliveryFee: 0,
          discountAmount: 0,
          total: Math.round(addedSubtotal * 1.05 * 100) / 100,
          paymentStatus: 'PENDING' as const,
          paymentMethod: 'CASH' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: items.map((it, i) => ({
            id: `it-${Date.now()}-${i}`,
            menuItemId: it.id,
            name: it.name,
            nameTa: it.nameTa,
            price: it.price,
            quantity: it.quantity,
            subtotal: it.price * it.quantity,
            addons: it.addons || [],
          })),
        };

        const updatedSubtotal = session.subtotal + addedSubtotal;
        const updatedTax = Math.round(updatedSubtotal * 0.05 * 100) / 100;

        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                orders: [...state.session.orders, newOrder],
                subtotal: updatedSubtotal,
                taxAmount: updatedTax,
                total: Math.round((updatedSubtotal + updatedTax) * 100) / 100,
              }
            : null,
        }));

        return true;
      },

      clearSession: () => {
        set({
          table: null,
          session: null,
          lastServiceRequest: null,
          serviceRequestHistory: [],
          isPaid: false,
          receiptData: null,
        });
      },
    }),
    {
      name: 'ashok-raj-dinein-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
