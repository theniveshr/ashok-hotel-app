import { create } from 'zustand';
import type { LoyaltyProfileResponse } from '@ashok-raj/types';
import { apiFetch } from '../config/api';

const defaultLoyalty: LoyaltyProfileResponse = {
  points: 0,
  tier: 'BRONZE',
  totalEarned: 0,
  totalRedeemed: 0,
  rupeeEquivalent: 0,
  nextTier: 'SILVER',
  pointsToNextTier: 500,
  perks: [
    {
      title: 'Complimentary Welcome Drink',
      titleTa: 'இலவச வரவேற்பு பானம்',
      description: 'Free signature filter coffee or fresh fruit juice on every dine-in visit',
      descriptionTa: 'ஒவ்வொரு உணவக வருகையிலும் இலவச ஃபில்டர் காபி அல்லது பழச்சாறு',
      iconName: 'Coffee',
    },
    {
      title: '15% Off Room Booking',
      titleTa: 'அறை முன்பதிவில் 15% தள்ளுபடி',
      description: 'Exclusive 15% discount on all Deluxe & Suite room bookings at Ashok Raj Lodge',
      descriptionTa: 'அனைத்து டீலக்ஸ் & சூட் அறைகளுக்கும் 15% பிரத்யேக தள்ளுபடி',
      iconName: 'BedDouble',
    },
    {
      title: 'Priority Food Delivery',
      titleTa: 'முன்னுரிமை உணவு டெலிவரி',
      description: 'Fast-track kitchen preparation and zero delivery fee on orders over ₹299',
      descriptionTa: 'விரைவான சமையல் தயாரிப்பு மற்றும் ₹299க்கு மேல் இலவச டெலிவரி',
      iconName: 'Zap',
    },
    {
      title: 'Late Checkout Privilege',
      titleTa: 'தாமத செக்-அவுட் சலுகை',
      description: 'Complimentary 2-hour extended checkout on room stays (subject to availability)',
      descriptionTa: 'அறைகளில் 2 மணிநேர இலவச தாமத செக்-அவுட் சலுகை',
      iconName: 'Clock',
    },
  ],
  recentTransactions: [],
};

interface LoyaltyState {
  loyalty: LoyaltyProfileResponse;
  isLoading: boolean;
  error: string | null;
  fetchLoyalty: () => Promise<void>;
}

export const useLoyaltyStore = create<LoyaltyState>((set) => ({
  loyalty: defaultLoyalty,
  isLoading: false,
  error: null,

  fetchLoyalty: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch('/customer/loyalty');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          set({ loyalty: json.data, isLoading: false });
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    set({ isLoading: false });
  },
}));
