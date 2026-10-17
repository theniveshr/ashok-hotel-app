import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from './useCartStore';
import { useAddressStore } from './useAddressStore';
import { apiFetch } from '../config/api';
import type { Address } from '@ashok-raj/types';

export interface DeliveryLocation {
  id: string;
  label: 'Home' | 'Work' | 'Other' | 'Current Location' | string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isCurrentGps?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  houseNumber?: string;
  buildingName?: string;
  streetName?: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDeliverable?: boolean;
  distanceKm?: number | null;
  estimatedMinutes?: number;
  deliveryFee?: number;
  nearestBranchName?: string;
}

export interface GeocodedPlace {
  id: string;
  name: string;
  formattedAddress: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  houseNumber?: string;
  streetName?: string;
}

export type CoverageStatus = 'AVAILABLE' | 'OUTSIDE_COVERAGE' | 'UNVERIFIABLE';
export type DistanceType = 'road' | 'straight_line';

export interface DeliveryCoverage {
  status: CoverageStatus;
  statusTitle: string;
  statusTitleTa?: string;
  isDeliverable: boolean;
  nearestBranchName: string;
  nearestBranchAddress?: string;
  nearestBranchMapsUrl?: string;
  distanceKm: number | null;
  distanceType: DistanceType | null;
  distanceLabel: string | null;
  distanceLabelTa?: string | null;
  estimatedMinutes: number | null;
  message: string;
  messageTa?: string;
  deliveryFee: number | null;
  freeDeliveryThreshold?: number | null;
  minOrderAmount?: number | null;
  eligibleBranches?: Array<{ id: string; name: string; distanceKm?: number }>;
  matchedZoneName?: string | null;
}

// Configured Ashok Raj Branches coordinates
export const ASHOK_RAJ_BRANCHES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Ashok Raj Lodge & Restaurant A/C',
    nameTa: 'அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் குளிரூட்டி',
    address: 'No-1412, Madurai to Thondi Main Road, Kalaiyarkoil, opposite Petrol Pump',
    lat: 9.8465627,
    lon: 78.6356551,
    city: 'Kalaiyarkoil',
    deliveryRadiusKm: 25,
    mapsUrl: 'https://www.google.com/maps/place/Ashok+Raj+Lodge+%26+Restaurant+A%2FC/@9.8465627,78.6356551,17z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Ashok Raj Madurai City (Anna Nagar)',
    nameTa: 'அசோக் ராஜ் மதுரை நகரம் (அண்ணா நகர்)',
    address: 'Anna Nagar Main Road, Madurai',
    lat: 9.9252,
    lon: 78.1198,
    city: 'Madurai',
    deliveryRadiusKm: 25,
    mapsUrl: 'https://maps.google.com/?q=9.9252,78.1198',
  },
];

// Curated instant localities across Madurai, Sivaganga, and Kalaiyarkoil
export const POPULAR_LOCALITIES: GeocodedPlace[] = [
  {
    id: 'loc-1',
    name: 'Anna Nagar, Madurai',
    formattedAddress: 'Anna Nagar Main Road, Madurai, Tamil Nadu 625020',
    area: 'Anna Nagar',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625020',
    latitude: 9.9252,
    longitude: 78.1198,
  },
  {
    id: 'loc-2',
    name: 'KK Nagar, Madurai',
    formattedAddress: 'KK Nagar East 2nd Street, Madurai, Tamil Nadu 625020',
    area: 'KK Nagar',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625020',
    latitude: 9.9298,
    longitude: 78.1402,
  },
  {
    id: 'loc-3',
    name: 'Mattuthavani, Madurai',
    formattedAddress: 'Mattuthavani Bus Stand Road, Madurai, Tamil Nadu 625007',
    area: 'Mattuthavani',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625007',
    latitude: 9.9482,
    longitude: 78.1567,
  },
  {
    id: 'loc-4',
    name: 'Simmakkal / Meenakshi Temple, Madurai',
    formattedAddress: 'North Veli Street, Simmakkal, Madurai, Tamil Nadu 625001',
    area: 'Simmakkal',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625001',
    latitude: 9.9238,
    longitude: 78.1215,
  },
  {
    id: 'loc-5',
    name: 'Kalaiyarkoil Town',
    formattedAddress: 'Madurai - Thondi Highway, Kalaiyarkoil, Sivaganga, Tamil Nadu 630551',
    area: 'Kalaiyarkoil',
    city: 'Kalaiyarkoil',
    state: 'Tamil Nadu',
    pincode: '630551',
    latitude: 9.8491,
    longitude: 78.6366,
  },
  {
    id: 'loc-6',
    name: 'Sivaganga Bus Stand Area',
    formattedAddress: 'Town Center, Sivaganga, Tamil Nadu 630561',
    area: 'Sivaganga Town',
    city: 'Sivaganga',
    state: 'Tamil Nadu',
    pincode: '630561',
    latitude: 9.8433,
    longitude: 78.4809,
  },
  {
    id: 'loc-7',
    name: 'Ilayangudi Main',
    formattedAddress: 'Paramakudi - Ilayangudi Road, Sivaganga, Tamil Nadu 630702',
    area: 'Ilayangudi',
    city: 'Ilayangudi',
    state: 'Tamil Nadu',
    pincode: '630702',
    latitude: 9.6385,
    longitude: 78.6368,
  },
];

// Haversine distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Compute coverage
export function evaluateCoverage(lat?: number | null, lon?: number | null, city?: string): DeliveryCoverage {
  if (
    lat != null &&
    lon != null &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  ) {
    let nearestBranch = ASHOK_RAJ_BRANCHES[0];
    let minDistance = Infinity;

    for (const b of ASHOK_RAJ_BRANCHES) {
      const d = calculateDistanceKm(lat, lon, b.lat, b.lon);
      if (d < minDistance) {
        minDistance = d;
        nearestBranch = b;
      }
    }

    const distanceLabel = `${minDistance} km (Straight-line distance)`;
    const distanceLabelTa = `${minDistance} கி.மீ (நேரடி தூரம்)`;

    if (minDistance <= 5.0) {
      return {
        status: 'AVAILABLE',
        statusTitle: 'Delivery Available',
        statusTitleTa: 'டெலிவரி கிடைக்கும்',
        isDeliverable: true,
        nearestBranchName: nearestBranch.name,
        nearestBranchAddress: nearestBranch.address,
        nearestBranchMapsUrl: nearestBranch.mapsUrl,
        distanceKm: minDistance,
        distanceType: 'straight_line',
        distanceLabel,
        distanceLabelTa,
        estimatedMinutes: 25,
        message: `Delivery available in ~25 mins from ${nearestBranch.name} (${distanceLabel})`,
        messageTa: `டெலிவரி கிடைக்கும்: ~25 நிமிடங்களில் (${distanceLabelTa})`,
        deliveryFee: 25,
        freeDeliveryThreshold: 250,
        minOrderAmount: 100,
        matchedZoneName: 'Kalaiyarkoil Town Core',
      };
    } else if (minDistance <= 15.0) {
      const est = Math.max(30, 25 + Math.round((minDistance - 5) * 1.5));
      return {
        status: 'AVAILABLE',
        statusTitle: 'Delivery Available',
        statusTitleTa: 'டெலிவரி கிடைக்கும்',
        isDeliverable: true,
        nearestBranchName: nearestBranch.name,
        nearestBranchAddress: nearestBranch.address,
        nearestBranchMapsUrl: nearestBranch.mapsUrl,
        distanceKm: minDistance,
        distanceType: 'straight_line',
        distanceLabel,
        distanceLabelTa,
        estimatedMinutes: est,
        message: `Delivery available in ~${est} mins from ${nearestBranch.name} (${distanceLabel})`,
        messageTa: `டெலிவரி கிடைக்கும்: ~${est} நிமிடங்களில் (${distanceLabelTa})`,
        deliveryFee: 40,
        freeDeliveryThreshold: 400,
        minOrderAmount: 150,
        matchedZoneName: 'Sivagangai Highway & Murthi Nagar',
      };
    } else if (minDistance <= 25.0) {
      const est = Math.max(45, 40 + Math.round((minDistance - 15) * 1.5));
      return {
        status: 'AVAILABLE',
        statusTitle: 'Delivery Available',
        statusTitleTa: 'டெலிவரி கிடைக்கும்',
        isDeliverable: true,
        nearestBranchName: nearestBranch.name,
        nearestBranchAddress: nearestBranch.address,
        nearestBranchMapsUrl: nearestBranch.mapsUrl,
        distanceKm: minDistance,
        distanceType: 'straight_line',
        distanceLabel,
        distanceLabelTa,
        estimatedMinutes: est,
        message: `Long-distance delivery available in ~${est} mins (${distanceLabel})`,
        messageTa: `நீண்ட தூர டெலிவரி கிடைக்கும்: ~${est} நிமிடங்களில் (${distanceLabelTa})`,
        deliveryFee: 60,
        freeDeliveryThreshold: 600,
        minOrderAmount: 250,
        matchedZoneName: 'Outer Villages & Surrounding Areas',
      };
    } else {
      return {
        status: 'OUTSIDE_COVERAGE',
        statusTitle: 'Outside Standard Delivery Area',
        statusTitleTa: 'நிலையான டெலிவரி பகுதிக்கு வெளியே உள்ளது',
        isDeliverable: false,
        nearestBranchName: nearestBranch.name,
        nearestBranchAddress: nearestBranch.address,
        nearestBranchMapsUrl: nearestBranch.mapsUrl,
        distanceKm: minDistance,
        distanceType: 'straight_line',
        distanceLabel,
        distanceLabelTa,
        estimatedMinutes: null,
        deliveryFee: null,
        freeDeliveryThreshold: null,
        minOrderAmount: null,
        matchedZoneName: null,
        message: `Delivery is currently unavailable at this address (${distanceLabel} from ${nearestBranch.name}). Standard delivery coverage is up to 25 km. Takeaway, Dine-in & Rooms available.`,
        messageTa: `இந்த முகவரியில் டெலிவரி தற்போது கிடைக்கவில்லை (${distanceLabelTa}). நிலையான டெலிவரி எல்லை 25 கி.மீ வரை மட்டுமே. பார்சல் மற்றும் உணவகத்தில் அமர்ந்து உண்ணும் வசதி உள்ளது.`,
      };
    }
  }

  return {
    status: 'UNVERIFIABLE',
    statusTitle: 'Unable to verify delivery availability',
    statusTitleTa: 'டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை',
    isDeliverable: false,
    nearestBranchName: 'Ashok Raj Lodge & Restaurant A/C',
    distanceKm: null,
    distanceType: null,
    distanceLabel: null,
    distanceLabelTa: null,
    estimatedMinutes: null,
    deliveryFee: null,
    freeDeliveryThreshold: null,
    minOrderAmount: null,
    matchedZoneName: null,
    message:
      'Unable to verify delivery availability without coordinates. Please detect your GPS location or select a specific address.',
    messageTa:
      'இந்த இருப்பிடத்திற்கு டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை. தயவுசெய்து உங்கள் ஜிபிஎஸ் இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்.',
  };
}

const STORAGE_KEY = '@ashok_raj_delivery_location';

export const DEFAULT_DELIVERY_LOCATION: DeliveryLocation = {
  id: 'default-home',
  label: 'Home',
  address: 'Kalaiyarkoil Town, Sivaganga',
  area: 'Kalaiyarkoil',
  city: 'Kalaiyarkoil',
  state: 'Tamil Nadu',
  pincode: '630551',
  latitude: 9.8491,
  longitude: 78.6366,
  isCurrentGps: false,
};

interface LocationState {
  selectedLocation: DeliveryLocation;
  coverage: DeliveryCoverage;
  isDetectingGps: boolean;
  gpsError: string | null;
  searchResults: GeocodedPlace[];
  isSearching: boolean;
  searchError: string | null;
  isCheckingCoverage: boolean;

  initLocation: () => Promise<void>;
  detectGpsLocation: () => Promise<{ success: boolean; location?: DeliveryLocation; error?: string }>;
  checkServerCoverage: (
    lat?: number | null,
    lon?: number | null,
    address?: string,
    pincode?: string,
    addressId?: string
  ) => Promise<DeliveryCoverage>;
  saveDetailedDeliveryAddress: (details: {
    recipientName: string;
    recipientPhone: string;
    houseNumber: string;
    buildingName?: string;
    streetName: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    label: 'Home' | 'Work' | 'Other';
    deliveryInstructions?: string;
  }) => Promise<boolean>;
  selectLocation: (loc: DeliveryLocation) => Promise<void>;
  selectPlaceResult: (place: GeocodedPlace, label?: string) => Promise<void>;
  selectSavedAddress: (addr: Address) => Promise<void>;
  searchLocations: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  getDisplayAddress: () => string;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  selectedLocation: DEFAULT_DELIVERY_LOCATION,
  coverage: evaluateCoverage(DEFAULT_DELIVERY_LOCATION.latitude, DEFAULT_DELIVERY_LOCATION.longitude, DEFAULT_DELIVERY_LOCATION.city),
  isDetectingGps: false,
  gpsError: null,
  searchResults: [],
  isSearching: false,
  searchError: null,
  isCheckingCoverage: false,

  initLocation: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: DeliveryLocation = JSON.parse(stored);
        if (parsed && parsed.address) {
          // Auto-sanitize any stale old branch coordinates (10.085, 78.5671) saved as customer location
          if (parsed.latitude === 10.085 && parsed.longitude === 78.5671) {
            parsed.latitude = 9.8491;
            parsed.longitude = 78.6366;
          }
          set({ selectedLocation: parsed });
          // Background server coverage check
          get().checkServerCoverage(parsed.latitude, parsed.longitude, parsed.address, parsed.pincode, parsed.id);

          // Sync with cart store
          useCartStore.getState().setSelectedAddress({
            id: parsed.id,
            label: parsed.label,
            line1: parsed.address,
            city: parsed.city,
            pincode: parsed.pincode,
            recipientName: parsed.recipientName,
            recipientPhone: parsed.recipientPhone,
            houseNumber: parsed.houseNumber,
            buildingName: parsed.buildingName,
            landmark: parsed.landmark,
            deliveryInstructions: parsed.deliveryInstructions,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          });
          return;
        }
      }
    } catch {
      // Default fallback
    }

    // Default initialization
    set({
      selectedLocation: DEFAULT_DELIVERY_LOCATION,
      coverage: evaluateCoverage(DEFAULT_DELIVERY_LOCATION.latitude, DEFAULT_DELIVERY_LOCATION.longitude, DEFAULT_DELIVERY_LOCATION.city),
    });
  },

  checkServerCoverage: async (
    lat?: number | null,
    lon?: number | null,
    address?: string,
    pincode?: string,
    addressId?: string
  ): Promise<DeliveryCoverage> => {
    set({ isCheckingCoverage: true });
    try {
      const res = await apiFetch('/customer/delivery/check-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: lat ?? undefined,
          lng: lon ?? undefined,
          address: address || '',
          pincode: pincode || undefined,
          addressId: addressId || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const cov: DeliveryCoverage = {
            status: d.status || (d.isDeliverable ? 'AVAILABLE' : 'OUTSIDE_COVERAGE'),
            statusTitle: d.statusTitle || (d.isDeliverable ? 'Delivery Available' : 'Outside Standard Delivery Area'),
            statusTitleTa: d.statusTitleTa,
            isDeliverable: Boolean(d.isDeliverable),
            nearestBranchName: d.nearestBranch?.name || 'Ashok Raj Lodge & Restaurant A/C',
            nearestBranchAddress: d.nearestBranch?.address,
            nearestBranchMapsUrl: d.nearestBranch?.mapsUrl,
            distanceKm: d.distanceKm != null ? Number(d.distanceKm) : null,
            distanceType: d.distanceType || 'straight_line',
            distanceLabel: d.distanceLabel || (d.distanceKm != null ? `${d.distanceKm} km` : null),
            distanceLabelTa: d.distanceLabelTa,
            estimatedMinutes: d.estimatedMinutes != null ? Number(d.estimatedMinutes) : null,
            deliveryFee: d.deliveryFee != null ? Number(d.deliveryFee) : null,
            freeDeliveryThreshold: d.freeDeliveryThreshold != null ? Number(d.freeDeliveryThreshold) : null,
            minOrderAmount: d.minOrderAmount != null ? Number(d.minOrderAmount) : null,
            matchedZoneName: d.matchedZone?.name || null,
            message: d.message || (d.isDeliverable ? 'Delivery available' : 'Outside standard delivery area'),
            messageTa: d.messageTa,
            eligibleBranches: d.eligibleBranches || [],
          };
          set({ coverage: cov, isCheckingCoverage: false });
          return cov;
        }
      }
    } catch {
      // Backend unavailable, fallback to local rule calculation
    }

    const fallback = evaluateCoverage(lat, lon, address);
    set({ coverage: fallback, isCheckingCoverage: false });
    return fallback;
  },

  detectGpsLocation: async (): Promise<{ success: boolean; location?: DeliveryLocation; error?: string }> => {
    set({ isDetectingGps: true, gpsError: null });

    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        const err = 'GPS location is not supported on this device/browser. Please search manually.';
        set({ isDetectingGps: false, gpsError: err });
        resolve({ success: false, error: err });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Real reverse geocoding via OpenStreetMap Nominatim
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'AshokRajGroupsHotelApp/1.0',
                },
              }
            );

            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const houseNumber = addr.house_number || '';
              const streetName = addr.road || addr.street || addr.pedestrian || '';
              const area = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || 'Detected Area';
              const city = addr.city || addr.town || addr.village || addr.county || 'Madurai';
              const state = addr.state || 'Tamil Nadu';
              const pincode = addr.postcode || '625020';

              const fullAddress = [
                houseNumber ? `Door No ${houseNumber}` : '',
                streetName,
                area,
                city,
              ].filter(Boolean).join(', ');

              const newLoc: DeliveryLocation = {
                id: `gps-${Date.now()}`,
                label: 'Current Location',
                address: fullAddress || `${area}, ${city}`,
                area,
                city,
                state,
                pincode,
                latitude: lat,
                longitude: lon,
                isCurrentGps: true,
                houseNumber,
                streetName,
              };

              // 1. Automatically save to user's Saved Addresses (checking duplicates in backend/store)
              try {
                await useAddressStore.getState().addAddress({
                  label: 'Current Location',
                  line1: fullAddress || `${area}, ${city}`,
                  line2: streetName ? `${streetName}, ${area}` : area,
                  city,
                  state,
                  pincode,
                  lat,
                  lng: lon,
                  isDefault: false,
                });
              } catch {
                // Address store auto-save non-blocking
              }

              // 2. Query real server coverage
              const coverage = await get().checkServerCoverage(lat, lon, fullAddress, pincode);

              newLoc.isDeliverable = coverage.isDeliverable;
              newLoc.distanceKm = coverage.distanceKm;
              newLoc.estimatedMinutes = coverage.estimatedMinutes;
              newLoc.deliveryFee = coverage.deliveryFee;
              newLoc.nearestBranchName = coverage.nearestBranchName;

              set({ selectedLocation: newLoc, coverage, isDetectingGps: false, gpsError: null });
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));

              useCartStore.getState().setSelectedAddress({
                id: newLoc.id,
                label: newLoc.label,
                line1: newLoc.address,
                city: newLoc.city,
                pincode: newLoc.pincode,
                houseNumber,
                latitude: lat,
                longitude: lon,
              });

              resolve({ success: true, location: newLoc });
              return;
            }
          } catch {
            // Geocoding network fallback
          }

          // Fallback with coordinates
          const fallbackLoc: DeliveryLocation = {
            id: `gps-${Date.now()}`,
            label: 'Current Location',
            address: `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            area: 'Detected Location',
            city: 'Madurai',
            state: 'Tamil Nadu',
            pincode: '625001',
            latitude: lat,
            longitude: lon,
            isCurrentGps: true,
          };
          const cov = await get().checkServerCoverage(lat, lon, fallbackLoc.address, '625001');
          set({ selectedLocation: fallbackLoc, coverage: cov, isDetectingGps: false });
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackLoc));
          resolve({ success: true, location: fallbackLoc });
        },
        (error) => {
          let msg = 'Failed to detect location.';
          if (error.code === 1) {
            msg = 'Location permission was denied. Please allow location access or enter address manually.';
          } else if (error.code === 2) {
            msg = 'GPS signal unavailable. Please search your address manually.';
          } else if (error.code === 3) {
            msg = 'Location request timed out. Please try again or search manually.';
          }
          set({ isDetectingGps: false, gpsError: msg });
          resolve({ success: false, error: msg });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  },

  saveDetailedDeliveryAddress: async (details: {
    recipientName: string;
    recipientPhone: string;
    houseNumber: string;
    buildingName?: string;
    streetName: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    label: 'Home' | 'Work' | 'Other';
    deliveryInstructions?: string;
  }): Promise<boolean> => {
    const line1Parts = [details.houseNumber, details.buildingName, details.streetName].filter(Boolean);
    const line1 = line1Parts.join(', ');
    const line2Parts = [details.area, details.landmark].filter(Boolean);
    const line2 = line2Parts.join(', ');
    const fullAddress = `${line1}, ${line2 ? line2 + ', ' : ''}${details.city} - ${details.pincode}`;

    const currentCoords = get().selectedLocation;
    const lat = currentCoords.latitude;
    const lon = currentCoords.longitude;

    // 1. Verify Server Delivery Availability
    const coverage = await get().checkServerCoverage(lat, lon, fullAddress, details.pincode);

    // 2. Persist to Address Store (which routes through Fastify + Prisma in Supabase)
    const saved = await useAddressStore.getState().addAddress({
      label: details.label,
      line1: line1.length >= 5 ? line1 : `${line1}, ${details.area}`,
      line2: line2 || undefined,
      city: details.city.trim(),
      state: details.state.trim() || 'Tamil Nadu',
      pincode: details.pincode.trim(),
      lat: lat ?? undefined,
      lng: lon ?? undefined,
      isDefault: true,
    });

    const updatedLoc: DeliveryLocation = {
      id: saved ? saved.id : `addr-${Date.now()}`,
      label: details.label,
      address: fullAddress,
      area: details.area,
      city: details.city,
      state: details.state,
      pincode: details.pincode,
      latitude: lat,
      longitude: lon,
      isCurrentGps: false,
      recipientName: details.recipientName,
      recipientPhone: details.recipientPhone,
      houseNumber: details.houseNumber,
      buildingName: details.buildingName,
      streetName: details.streetName,
      landmark: details.landmark,
      deliveryInstructions: details.deliveryInstructions,
      isDeliverable: coverage.isDeliverable,
      distanceKm: coverage.distanceKm,
      estimatedMinutes: coverage.estimatedMinutes,
      deliveryFee: coverage.deliveryFee,
      nearestBranchName: coverage.nearestBranchName,
    };

    set({ selectedLocation: updatedLoc, coverage });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLoc));

    // 3. Sync with Cart Store for checkout
    useCartStore.getState().setSelectedAddress({
      id: updatedLoc.id,
      label: updatedLoc.label,
      line1: updatedLoc.address,
      city: updatedLoc.city,
      pincode: updatedLoc.pincode,
      recipientName: details.recipientName,
      recipientPhone: details.recipientPhone,
      houseNumber: details.houseNumber,
      buildingName: details.buildingName,
      landmark: details.landmark,
      deliveryInstructions: details.deliveryInstructions,
      latitude: lat,
      longitude: lon,
    });

    if (details.deliveryInstructions) {
      useCartStore.getState().setSpecialInstructions(details.deliveryInstructions);
    }

    return true;
  },

  selectLocation: async (loc: DeliveryLocation) => {
    set({ selectedLocation: loc });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {}

    const coverage = await get().checkServerCoverage(
      loc.latitude,
      loc.longitude,
      loc.address,
      loc.pincode,
      loc.id
    );
    set({ coverage });

    useCartStore.getState().setSelectedAddress({
      id: loc.id,
      label: loc.label,
      line1: loc.address,
      city: loc.city,
      pincode: loc.pincode,
      recipientName: loc.recipientName,
      recipientPhone: loc.recipientPhone,
      houseNumber: loc.houseNumber,
      buildingName: loc.buildingName,
      landmark: loc.landmark,
      deliveryInstructions: loc.deliveryInstructions,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
  },

  selectPlaceResult: async (place: GeocodedPlace, label: string = 'Other') => {
    const loc: DeliveryLocation = {
      id: `place-${place.id}`,
      label,
      address: place.formattedAddress,
      area: place.area,
      city: place.city,
      state: place.state,
      pincode: place.pincode,
      latitude: place.latitude,
      longitude: place.longitude,
      isCurrentGps: false,
      houseNumber: place.houseNumber,
      streetName: place.streetName,
    };
    await get().selectLocation(loc);
  },

  selectSavedAddress: async (addr: Address) => {
    let lat = addr.lat != null ? Number(addr.lat) : null;
    let lon = addr.lng != null ? Number(addr.lng) : null;

    // Purge any stale mistakenly cached old branch coordinates (10.085, 78.5671)
    if (lat === 10.085 && lon === 78.5671) {
      lat = 9.8491;
      lon = 78.6366;
    }

    // Match locality if coordinates are missing
    if (!lat || !lon) {
      const match = POPULAR_LOCALITIES.find(
        (p) =>
          (addr.line1 && p.formattedAddress.toLowerCase().includes(addr.line1.toLowerCase())) ||
          (addr.city && p.city.toLowerCase() === addr.city.toLowerCase()) ||
          (addr.pincode && p.pincode === addr.pincode)
      );
      if (match) {
        lat = match.latitude;
        lon = match.longitude;
      }
    }

    // Default coordinates based on destination city or pincode
    if (!lat || !lon) {
      const full = `${addr.line1} ${addr.line2 || ''} ${addr.city || ''}`.toLowerCase();
      if (full.includes('kalaiyarkoil') || full.includes('kalayarkoil') || addr.pincode === '630551') {
        lat = 9.8491;
        lon = 78.6366;
      } else if (full.includes('sivagangai') || full.includes('sivaganga') || addr.pincode === '630561') {
        lat = 9.8433;
        lon = 78.4809;
      } else if (full.includes('ilayangudi') || addr.pincode === '630702') {
        lat = 9.6385;
        lon = 78.6368;
      } else if (full.includes('madurai') || addr.pincode?.startsWith('625')) {
        lat = 9.9252;
        lon = 78.1198;
      }
    }

    const loc: DeliveryLocation = {
      id: addr.id,
      label: addr.label as any,
      address: `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city} - ${addr.pincode}`,
      area: addr.line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      latitude: lat,
      longitude: lon,
      isCurrentGps: false,
    };
    await get().selectLocation(loc);
  },

  searchLocations: async (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      set({ searchResults: [], isSearching: false, searchError: null });
      return;
    }

    set({ isSearching: true, searchError: null });

    // 1. Instant matching from local database
    const localMatches = POPULAR_LOCALITIES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.formattedAddress.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.pincode.includes(q)
    );

    // 2. Fetch from Nominatim if query >= 3 chars
    let remoteMatches: GeocodedPlace[] = [];
    if (q.length >= 3) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Tamil Nadu')}&countrycodes=in&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'AshokRajGroupsHotelApp/1.0',
            },
          }
        );
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            remoteMatches = list.map((item: any, idx: number) => {
              const a = item.address || {};
              const area = a.suburb || a.neighbourhood || a.road || item.display_name.split(',')[0];
              const city = a.city || a.town || a.village || a.county || 'Tamil Nadu';
              return {
                id: `nom-${item.place_id || idx}`,
                name: area,
                formattedAddress: item.display_name,
                area,
                city,
                state: a.state || 'Tamil Nadu',
                pincode: a.postcode || '625001',
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
              };
            });
          }
        }
      } catch {
        // Fallback to local
      }
    }

    const combined = [...localMatches, ...remoteMatches.filter((r) => !localMatches.some((l) => l.name === r.name))];

    set({
      searchResults: combined,
      isSearching: false,
      searchError: combined.length === 0 ? 'No matching places found. Try searching another landmark or PIN code.' : null,
    });
  },

  clearSearchResults: () => {
    set({ searchResults: [], searchError: null, isSearching: false });
  },

  getDisplayAddress: () => {
    const loc = get().selectedLocation;
    const label = loc.label ? `${loc.label} · ` : '';
    // Format: "Home · Anna Nagar, Madurai"
    const shortAddress = loc.area ? `${loc.area}, ${loc.city}` : loc.address;
    return `${label}${shortAddress}`;
  },
}));
