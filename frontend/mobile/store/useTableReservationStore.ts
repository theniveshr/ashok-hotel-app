import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Table, TableReservation, TableArea } from '@ashok-raj/types';
import { apiFetch } from '../config/api';

export interface TimeSlotItem {
  slot: string;
  period: 'LUNCH' | 'DINNER';
  availableTables: number;
  isAvailable: boolean;
}

export interface AreaOption {
  key: TableArea;
  name: string;
  nameTa: string;
}

interface TableReservationState {
  tables: Table[];
  lunchSlots: TimeSlotItem[];
  dinnerSlots: TimeSlotItem[];
  areas: AreaOption[];
  selectedDate: string;
  selectedSlot: string;
  guestCount: number;
  selectedArea: TableArea;
  guestName: string;
  guestPhone: string;
  specialRequests: string;
  myReservations: TableReservation[];
  activeReservation: TableReservation | null;
  isLoading: boolean;
  error: string | null;

  setGuestCount: (count: number) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: string) => void;
  setSelectedArea: (area: TableArea) => void;
  setGuestDetails: (name: string, phone: string, specialRequests?: string) => void;
  setActiveReservation: (res: TableReservation | null) => void;

  fetchTables: () => Promise<void>;
  fetchSlots: (date?: string, area?: TableArea) => Promise<void>;
  createReservation: (customInput?: Partial<TableReservation>) => Promise<TableReservation | null>;
  fetchMyReservations: () => Promise<void>;
  cancelReservation: (id: string, reason?: string) => Promise<boolean>;
}

const defaultAreas: AreaOption[] = [
  { key: 'AC_HALL', name: 'A/C Dining Hall', nameTa: 'A/C டைனிங் ஹால்' },
  { key: 'MAIN_HALL', name: 'Main Hall', nameTa: 'மெயின் ஹால்' },
  { key: 'FAMILY_SECTION', name: 'Family Section', nameTa: 'குடும்ப பிரிவு' },
  { key: 'ROOFTOP', name: 'Rooftop Garden', nameTa: 'ரூஃப்டாப் தோட்டம்' },
];

const defaultLunchSlots: TimeSlotItem[] = [
  { slot: '12:00 PM', period: 'LUNCH', availableTables: 8, isAvailable: true },
  { slot: '12:30 PM', period: 'LUNCH', availableTables: 6, isAvailable: true },
  { slot: '01:00 PM', period: 'LUNCH', availableTables: 4, isAvailable: true },
  { slot: '01:30 PM', period: 'LUNCH', availableTables: 7, isAvailable: true },
  { slot: '02:00 PM', period: 'LUNCH', availableTables: 8, isAvailable: true },
  { slot: '02:30 PM', period: 'LUNCH', availableTables: 9, isAvailable: true },
];

const defaultDinnerSlots: TimeSlotItem[] = [
  { slot: '07:00 PM', period: 'DINNER', availableTables: 8, isAvailable: true },
  { slot: '07:30 PM', period: 'DINNER', availableTables: 5, isAvailable: true },
  { slot: '08:00 PM', period: 'DINNER', availableTables: 3, isAvailable: true },
  { slot: '08:30 PM', period: 'DINNER', availableTables: 6, isAvailable: true },
  { slot: '09:00 PM', period: 'DINNER', availableTables: 7, isAvailable: true },
  { slot: '09:30 PM', period: 'DINNER', availableTables: 8, isAvailable: true },
  { slot: '10:00 PM', period: 'DINNER', availableTables: 9, isAvailable: true },
];

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useTableReservationStore = create<TableReservationState>()(
  persist(
    (set, get) => ({
      tables: [],
      lunchSlots: defaultLunchSlots,
      dinnerSlots: defaultDinnerSlots,
      areas: defaultAreas,
      selectedDate: getTodayString(),
      selectedSlot: '07:30 PM',
      guestCount: 2,
      selectedArea: 'AC_HALL',
      guestName: '',
      guestPhone: '',
      specialRequests: '',
      myReservations: [],
      activeReservation: null,
      isLoading: false,
      error: null,

      setGuestCount: (count: number) => set({ guestCount: Math.max(1, Math.min(20, count)) }),
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
        get().fetchSlots(date, get().selectedArea);
      },
      setSelectedSlot: (slot: string) => set({ selectedSlot: slot }),
      setSelectedArea: (area: TableArea) => {
        set({ selectedArea: area });
        get().fetchSlots(get().selectedDate, area);
      },
      setGuestDetails: (guestName: string, guestPhone: string, specialRequests?: string) => {
        set({ guestName, guestPhone, specialRequests: specialRequests ?? get().specialRequests });
      },
      setActiveReservation: (res: TableReservation | null) => set({ activeReservation: res }),

      fetchTables: async () => {
        try {
          const res = await apiFetch('/customer/tables/tables');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              set({ tables: json.data });
            }
          }
        } catch {
          // Offline fallback
        }
      },

      fetchSlots: async (date?: string, area?: TableArea) => {
        const queryDate = date || get().selectedDate || getTodayString();
        const queryArea = area || get().selectedArea;

        try {
          const res = await apiFetch(`/customer/tables/slots?date=${queryDate}&area=${queryArea}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              set({
                lunchSlots: json.data.lunch || defaultLunchSlots,
                dinnerSlots: json.data.dinner || defaultDinnerSlots,
                areas: json.data.areas || defaultAreas,
              });
              return;
            }
          }
        } catch {
          // Fallback to defaults
        }
      },

      createReservation: async (customInput?: Partial<TableReservation>): Promise<TableReservation | null> => {
        set({ isLoading: true, error: null });

        const payload = {
          guestCount: customInput?.guestCount ?? get().guestCount,
          reservationDate: customInput?.reservationDate ?? get().selectedDate,
          timeSlot: customInput?.timeSlot ?? get().selectedSlot,
          seatingArea: customInput?.seatingArea ?? get().selectedArea,
          guestName: customInput?.guestName ?? get().guestName,
          guestPhone: customInput?.guestPhone ?? get().guestPhone,
          specialRequests: customInput?.specialRequests ?? get().specialRequests,
        };

        try {
          const res = await apiFetch('/customer/tables/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const newRes = json.data as TableReservation;
              set((state) => ({
                myReservations: [newRes, ...state.myReservations],
                activeReservation: newRes,
                isLoading: false,
              }));
              return newRes;
            }
          } else {
            const errJson = await res.json().catch(() => null);
            const msg = errJson?.error?.message || 'Table reservation failed';
            set({ error: msg, isLoading: false });
            return null;
          }
        } catch (err: any) {
          console.log('Reservation API error, using offline reservation:', err.message);
        }

        // Offline / dev fallback reservation creation
        const fallbackRes: TableReservation = {
          id: `res_${Date.now()}`,
          reservationNumber: `AR-RES-${Date.now().toString().slice(-6)}`,
          userId: 'guest-user-1',
          tableId: payload.seatingArea === 'AC_HALL' ? 'tbl-2' : 'tbl-8',
          tableNumber: payload.seatingArea === 'AC_HALL' ? '02' : '08',
          branchId: 'branch-kalaiyarkoil',
          guestCount: payload.guestCount,
          reservationDate: payload.reservationDate,
          timeSlot: payload.timeSlot,
          seatingArea: payload.seatingArea,
          guestName: payload.guestName,
          guestPhone: payload.guestPhone,
          specialRequests: payload.specialRequests || null,
          status: 'CONFIRMED',
          allocatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          myReservations: [fallbackRes, ...state.myReservations],
          activeReservation: fallbackRes,
          isLoading: false,
        }));

        return fallbackRes;
      },

      fetchMyReservations: async () => {
        set({ isLoading: true });
        try {
          const res = await apiFetch('/customer/tables/my-reservations');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              set({ myReservations: json.data, isLoading: false });
              return;
            }
          }
        } catch {
          // Keep local cached
        }
        set({ isLoading: false });
      },

      cancelReservation: async (id: string, reason?: string) => {
        try {
          const res = await apiFetch(`/customer/tables/reservations/${id}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          });

          if (res.ok) {
            set((state) => ({
              myReservations: state.myReservations.map((r) =>
                r.id === id ? { ...r, status: 'CANCELLED' } : r
              ),
              activeReservation:
                state.activeReservation?.id === id
                  ? { ...state.activeReservation, status: 'CANCELLED' }
                  : state.activeReservation,
            }));
            return true;
          }
        } catch {
          // Fallback local update
        }

        set((state) => ({
          myReservations: state.myReservations.map((r) =>
            r.id === id ? { ...r, status: 'CANCELLED' } : r
          ),
          activeReservation:
            state.activeReservation?.id === id
              ? { ...state.activeReservation, status: 'CANCELLED' }
              : state.activeReservation,
        }));
        return true;
      },
    }),
    {
      name: 'ashok-raj-table-reservations',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
