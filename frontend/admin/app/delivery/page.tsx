'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DeliveryRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  zoneName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  partnerId?: string | null;
  partnerName?: string | null;
  partnerPhone?: string | null;
  partnerVehicle?: string | null;
  otp: string;
  createdAt: string;
  estimatedMinutes: number;
  distanceKm: number;
  cancellationReason?: string;
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
  activeDeliveryId?: string | null;
}

interface DeliveryZone {
  id: string;
  name: string;
  nameTa: string;
  baseFee: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryMinutes: number;
  radiusKm: number;
  isActive: boolean;
}

export default function DeliveryDispatchConsole() {
  const [isTamil, setIsTamil] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initial Sample Fleet & Deliveries
  useEffect(() => {
    const initialPartners: DeliveryPartner[] = [
      {
        id: 'driver-101',
        name: 'Murugan Selvam',
        phone: '9842199881',
        vehicleType: 'BIKE',
        vehicleNumber: 'TN 63 AB 4589',
        isOnline: true,
        rating: 4.9,
        totalDeliveries: 342,
        activeDeliveryId: 'del-201',
      },
      {
        id: 'driver-102',
        name: 'Kavin Kumar',
        phone: '9842199882',
        vehicleType: 'SCOOTER',
        vehicleNumber: 'TN 63 BC 1204',
        isOnline: true,
        rating: 4.8,
        totalDeliveries: 215,
        activeDeliveryId: null,
      },
      {
        id: 'driver-103',
        name: 'Senthil Nathan',
        phone: '9842199883',
        vehicleType: 'BIKE',
        vehicleNumber: 'TN 63 D 8821',
        isOnline: true,
        rating: 4.7,
        totalDeliveries: 189,
        activeDeliveryId: null,
      },
      {
        id: 'driver-104',
        name: 'Vignesh Raja',
        phone: '9842199884',
        vehicleType: 'SCOOTER',
        vehicleNumber: 'TN 63 E 9912',
        isOnline: false,
        rating: 4.9,
        totalDeliveries: 412,
        activeDeliveryId: null,
      },
    ];

    const initialZones: DeliveryZone[] = [
      {
        id: 'zone-kalaiyarkoil-town',
        name: 'Kalaiyarkoil Town Core',
        nameTa: 'காளையார்கோவில் நகர் மையம்',
        baseFee: 25,
        minOrderAmount: 100,
        freeDeliveryThreshold: 250,
        estimatedDeliveryMinutes: 25,
        radiusKm: 3.5,
        isActive: true,
      },
      {
        id: 'zone-sivagangai-rd',
        name: 'Sivagangai Highway & Murthi Nagar',
        nameTa: 'சிவகங்கை நெடுஞ்சாலை & மூர்த்தி நகர்',
        baseFee: 40,
        minOrderAmount: 150,
        freeDeliveryThreshold: 400,
        estimatedDeliveryMinutes: 35,
        radiusKm: 7.0,
        isActive: true,
      },
      {
        id: 'zone-outer-villages',
        name: 'Outer Villages & Surrounding Areas',
        nameTa: 'வெளிப்புற கிராமங்கள் & சுற்றுப்புறங்கள்',
        baseFee: 60,
        minOrderAmount: 250,
        freeDeliveryThreshold: 600,
        estimatedDeliveryMinutes: 45,
        radiusKm: 12.0,
        isActive: true,
      },
    ];

    const initialDeliveries: DeliveryRecord[] = [
      {
        id: 'del-201',
        orderId: 'ord-101',
        orderNumber: 'AR-DEL-8801',
        customerName: 'Anandhan Meiyappan',
        customerPhone: '9840123456',
        addressLine: 'No 45, Sivan Koil North Car Street, Kalaiyarkoil (630551)',
        zoneName: 'Kalaiyarkoil Town Core',
        items: [
          { name: 'Chettinad Chicken Biryani', quantity: 2, price: 260 },
          { name: 'Mutton Chukka', quantity: 1, price: 280 },
          { name: 'Madurai Bun Parotta (2 pcs)', quantity: 2, price: 120 },
        ],
        subtotal: 1040,
        deliveryFee: 0, // Free delivery (> 250)
        total: 1092,
        status: 'EN_ROUTE',
        partnerId: 'driver-101',
        partnerName: 'Murugan Selvam',
        partnerPhone: '9842199881',
        partnerVehicle: 'TN 63 AB 4589 (Bike)',
        otp: '482915',
        createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        estimatedMinutes: 8,
        distanceKm: 2.4,
      },
      {
        id: 'del-202',
        orderId: 'ord-102',
        orderNumber: 'AR-DEL-8802',
        customerName: 'Saravanan Pitchai',
        customerPhone: '9840987654',
        addressLine: 'Plot 12, Murthi Nagar 2nd Street, Sivagangai Road (630551)',
        zoneName: 'Sivagangai Highway & Murthi Nagar',
        items: [
          { name: 'Nattukozhi Soup', quantity: 2, price: 140 },
          { name: 'Ghee Roast Dosa', quantity: 3, price: 110 },
        ],
        subtotal: 610,
        deliveryFee: 0,
        total: 640.5,
        status: 'ASSIGNED',
        partnerId: 'driver-102',
        partnerName: 'Kavin Kumar',
        partnerPhone: '9842199882',
        partnerVehicle: 'TN 63 BC 1204 (Scooter)',
        otp: '739104',
        createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        estimatedMinutes: 22,
        distanceKm: 4.8,
      },
      {
        id: 'del-203',
        orderId: 'ord-103',
        orderNumber: 'AR-DEL-8803',
        customerName: 'Kavitha Sundaram',
        customerPhone: '9840555666',
        addressLine: 'Door 8, Gandhi Road, Opp Indian Bank, Kalaiyarkoil',
        zoneName: 'Kalaiyarkoil Town Core',
        items: [
          { name: 'Seeraga Samba Mutton Biryani', quantity: 1, price: 340 },
          { name: 'Chicken 65 (Bone-in)', quantity: 1, price: 210 },
        ],
        subtotal: 550,
        deliveryFee: 0,
        total: 577.5,
        status: 'PENDING',
        otp: '812940',
        createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
        estimatedMinutes: 30,
        distanceKm: 1.8,
      },
      {
        id: 'del-204',
        orderId: 'ord-104',
        orderNumber: 'AR-DEL-8799',
        customerName: 'Ramesh Balaji',
        customerPhone: '9840111222',
        addressLine: '14, Periyar Nagar, Kalaiyarkoil',
        zoneName: 'Kalaiyarkoil Town Core',
        items: [{ name: 'Veggies Meals with Payasam', quantity: 2, price: 160 }],
        subtotal: 320,
        deliveryFee: 0,
        total: 336,
        status: 'DELIVERED',
        partnerId: 'driver-101',
        partnerName: 'Murugan Selvam',
        partnerPhone: '9842199881',
        otp: '319042',
        createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        estimatedMinutes: 0,
        distanceKm: 1.5,
      },
    ];

    setPartners(initialPartners);
    setZones(initialZones);
    setDeliveries(initialDeliveries);
  }, []);

  // Quick sound alert helper
  const playAlertSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio not supported in environment
    }
  };

  // Assign Partner Action
  const handleAssignDriver = (deliveryId: string, driverId?: string) => {
    let assignedPartner: DeliveryPartner | undefined;

    if (driverId) {
      assignedPartner = partners.find((p) => p.id === driverId);
    } else {
      // Auto-assign: online, highest rating, without active deliveries
      assignedPartner = partners.find((p) => p.isOnline && !p.activeDeliveryId);
      if (!assignedPartner) {
        assignedPartner = partners.find((p) => p.isOnline);
      }
    }

    if (!assignedPartner) {
      alert(isTamil ? 'செயலில் உள்ள ஓட்டுநர்கள் எவரும் இல்லை!' : 'No online drivers available right now!');
      return;
    }

    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: 'ASSIGNED',
              partnerId: assignedPartner!.id,
              partnerName: assignedPartner!.name,
              partnerPhone: assignedPartner!.phone,
              partnerVehicle: `${assignedPartner!.vehicleNumber} (${assignedPartner!.vehicleType})`,
            }
          : d
      )
    );

    setPartners((prev) =>
      prev.map((p) =>
        p.id === assignedPartner!.id ? { ...p, activeDeliveryId: deliveryId } : p
      )
    );

    playAlertSound();
    setShowAssignModal(false);
    setSelectedDelivery(null);
  };

  // Toggle Driver Online
  const toggleDriverOnline = (driverId: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === driverId ? { ...p, isOnline: !p.isOnline } : p))
    );
  };

  // Bump Delivery Status
  const handleAdvanceStatus = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== deliveryId) return d;
        let nextStatus = d.status;
        if (d.status === 'PENDING') nextStatus = 'ASSIGNED';
        else if (d.status === 'ASSIGNED') nextStatus = 'PICKED_UP';
        else if (d.status === 'PICKED_UP') nextStatus = 'EN_ROUTE';
        else if (d.status === 'EN_ROUTE') nextStatus = 'DELIVERED';

        if (nextStatus === 'DELIVERED' && d.partnerId) {
          setPartners((partnersPrev) =>
            partnersPrev.map((p) =>
              p.id === d.partnerId
                ? { ...p, activeDeliveryId: null, totalDeliveries: p.totalDeliveries + 1 }
                : p
            )
          );
        }

        return { ...d, status: nextStatus };
      })
    );
    playAlertSound();
  };

  // Filtered deliveries
  const filtered = deliveries.filter((d) =>
    filterZone === 'ALL' ? true : d.zoneName.toLowerCase().includes(filterZone.toLowerCase())
  );

  const pendingList = filtered.filter((d) => d.status === 'PENDING');
  const assignedList = filtered.filter((d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP');
  const enRouteList = filtered.filter((d) => d.status === 'EN_ROUTE');
  const deliveredList = filtered.filter((d) => d.status === 'DELIVERED');

  const onlineDriversCount = partners.filter((p) => p.isOnline).length;

  return (
    <main className="min-h-screen bg-[#070B14] text-[#FAFAF7] font-sans antialiased flex flex-col">
      {/* ── Top App Bar ──────────────────────────────────────────────────────── */}
      <header className="border-b border-[#1A2642] bg-[#0B132B]/90 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs font-bold text-[#94A3B8] hover:text-[#3B82F6] transition-colors flex items-center space-x-1"
          >
            <span>←</span>
            <span>{isTamil ? 'முதன்மை பக்கம்' : 'Hub'}</span>
          </Link>
          <div className="h-4 w-px bg-[#1A2642]" />
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#B45309] flex items-center justify-center font-black text-black text-lg shadow-md">
              
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  {isTamil ? 'வீட்டு டெலிவரி மேலாண்மை & ஃப்ளீட்' : 'Home Delivery & Fleet Dispatch'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40">
                  {isTamil ? 'செயலில் உள்ளது' : 'LIVE'}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Ashok Raj Lodge &amp; Restaurant • Kalaiyarkoil Operations
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-3 text-xs font-semibold">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center space-x-1.5 ${
              soundEnabled
                ? 'bg-[#1E293B] border-[#334155] text-[#38BDF8]'
                : 'bg-[#1E293B]/50 border-transparent text-[#64748B]'
            }`}
          >
            <span>{soundEnabled ? '' : '🔕'}</span>
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Zones Config Button */}
          <button
            onClick={() => setShowZoneModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#F8FAFC] transition-all flex items-center space-x-1.5 shadow"
          >
            <span></span>
            <span>{isTamil ? 'டெலிவரி பகுதிகள்' : 'Delivery Zones'}</span>
          </button>

          {/* Tamil / English Toggle */}
          <button
            onClick={() => setIsTamil(!isTamil)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold transition-all shadow hover:brightness-110 flex items-center space-x-1"
          >
            <span>🌐</span>
            <span>{isTamil ? 'English' : 'தமிழ்'}</span>
          </button>
        </div>
      </header>

      {/* ── Fleet & Metrics Ribbon ───────────────────────────────────────────── */}
      <div className="bg-[#0D152A] border-b border-[#1A2642] px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Fleet Status Avatars */}
          <div className="flex items-center space-x-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {isTamil ? 'ஓட்டுநர் அணி' : 'Fleet Active'}: ({onlineDriversCount}/{partners.length})
            </span>
            <div className="flex items-center space-x-2">
              {partners.map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleDriverOnline(p.id)}
                  title={`${p.name} (${p.vehicleNumber}) - Click to toggle online/offline`}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    p.isOnline
                      ? p.activeDeliveryId
                        ? 'bg-[#0284C7]/20 border-[#38BDF8]/50 text-[#BAE6FD]'
                        : 'bg-[#10B981]/20 border-[#34D399]/50 text-[#A7F3D0]'
                      : 'bg-[#1E293B]/40 border-[#334155] text-[#64748B]'
                  }`}
                >
                  <span className="text-sm">
                    {p.vehicleType === 'SCOOTER' ? '' : '🏍️'}
                  </span>
                  <span className="font-bold">{p.name.split(' ')[0]}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      p.isOnline
                        ? p.activeDeliveryId
                          ? 'bg-[#38BDF8] animate-pulse'
                          : 'bg-[#10B981]'
                        : 'bg-[#64748B]'
                    }`}
                  />
                  {p.activeDeliveryId && (
                    <span className="text-[9px] font-black uppercase bg-[#0284C7] px-1 rounded text-white">
                      Busy
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[#94A3B8]">{isTamil ? 'மொத்த ஆர்டர்கள்' : 'Today Orders'}:</span>
              <span className="font-extrabold text-white text-sm">{deliveries.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#94A3B8]">{isTamil ? 'வழியில் உள்ளவை' : 'On Road'}:</span>
              <span className="font-extrabold text-[#38BDF8] text-sm">{enRouteList.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#94A3B8]">{isTamil ? 'டெலிவரி முடிந்தது' : 'Delivered'}:</span>
              <span className="font-extrabold text-[#34D399] text-sm">{deliveredList.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Kanban Columns ──────────────────────────────────────────────── */}
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 min-w-[1050px] h-full">
          {/* Column 1: Needs Driver */}
          <div className="flex flex-col bg-[#0D152A] rounded-2xl border border-[#1A2642] p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A2642]">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-[#EF4444] animate-ping" />
                <h3 className="font-extrabold text-sm text-white">
                  {isTamil ? 'ஓட்டுநர் ஒதுக்கப்பட வேண்டும்' : 'Needs Driver'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#EF4444]/20 text-[#FCA5A5]">
                {pendingList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {pendingList.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1E293B] rounded-xl text-[#64748B]">
                  <span className="text-2xl mb-1">✨</span>
                  <p className="text-xs">
                    {isTamil ? 'காத்திருக்கும் ஆர்டர்கள் இல்லை' : 'All orders have assigned drivers'}
                  </p>
                </div>
              ) : (
                pendingList.map((del) => (
                  <div
                    key={del.id}
                    className="bg-[#111C38] border border-[#233560] rounded-xl p-4 space-y-3 shadow-md hover:border-[#3B82F6] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#3B82F6]">{del.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8]">
                        {del.zoneName}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{del.customerName}</h4>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-1">{del.addressLine}</p>
                    </div>

                    <div className="bg-[#090E1D] p-2 rounded-lg text-xs space-y-1">
                      {del.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[#CBD5E1]">
                          <span>
                            {it.quantity}x {it.name}
                          </span>
                          <span className="font-semibold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-[#1E293B] pt-1 flex justify-between font-black text-white text-xs">
                        <span>Total</span>
                        <span className="text-[#34D399]">₹{del.total}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleAssignDriver(del.id)}
                        className="py-2 px-3 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#D97706] hover:brightness-110 text-black font-extrabold text-xs transition-all shadow"
                      >
                         {isTamil ? 'தானியங்கி ஒதுக்கீடு' : 'Auto-Assign'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDelivery(del);
                          setShowAssignModal(true);
                        }}
                        className="py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white font-bold text-xs transition-all"
                      >
                        {isTamil ? 'ஓட்டுநரைத் தேர்ந்தெடு' : 'Select Driver'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Driver Assigned / Picking Up */}
          <div className="flex flex-col bg-[#0D152A] rounded-2xl border border-[#1A2642] p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A2642]">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                <h3 className="font-extrabold text-sm text-white">
                  {isTamil ? 'ஓட்டுநர் பெற வருகிறார்' : 'Assigned / Picking Up'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#F59E0B]/20 text-[#DBEAFE]">
                {assignedList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {assignedList.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1E293B] rounded-xl text-[#64748B]">
                  <p className="text-xs">{isTamil ? 'ஆர்டர்கள் இல்லை' : 'No pending pickups'}</p>
                </div>
              ) : (
                assignedList.map((del) => (
                  <div
                    key={del.id}
                    className="bg-[#111C38] border border-[#233560] rounded-xl p-4 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#F59E0B]">{del.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#DBEAFE] border border-[#F59E0B]/30">
                        {del.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{del.customerName}</h4>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-1">{del.addressLine}</p>
                    </div>

                    {/* Partner Card */}
                    <div className="bg-[#081023] border border-[#1E293B] p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg"></span>
                        <div>
                          <p className="font-bold text-xs text-white">{del.partnerName}</p>
                          <p className="text-[10px] text-[#94A3B8]">{del.partnerVehicle}</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${del.partnerPhone}`}
                        className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] rounded text-[10px] font-bold text-[#38BDF8]"
                      >
                        📞 Call
                      </a>
                    </div>

                    <button
                      onClick={() => handleAdvanceStatus(del.id)}
                      className="w-full py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs transition-all shadow"
                    >
                       {isTamil ? 'வழியில் அனுப்பப்பட்டது என மாற்று' : 'Mark En Route'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: En Route (Out for Delivery) */}
          <div className="flex flex-col bg-[#0D152A] rounded-2xl border border-[#1A2642] p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A2642]">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-[#38BDF8] animate-pulse" />
                <h3 className="font-extrabold text-sm text-white">
                  {isTamil ? 'வழியில் வந்து கொண்டிருக்கிறது' : 'En Route (Live GPS)'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#38BDF8]/20 text-[#BAE6FD]">
                {enRouteList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {enRouteList.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1E293B] rounded-xl text-[#64748B]">
                  <p className="text-xs">{isTamil ? 'ஆர்டர்கள் இல்லை' : 'No drivers on the road'}</p>
                </div>
              ) : (
                enRouteList.map((del) => (
                  <div
                    key={del.id}
                    className="bg-[#111C38] border border-[#0284C7] rounded-xl p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#38BDF8]">{del.orderNumber}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8]">
                         ~{del.estimatedMinutes}m ETA
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{del.customerName}</h4>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-2">{del.addressLine}</p>
                    </div>

                    {/* OTP Badge & Driver */}
                    <div className="bg-[#081023] p-2.5 rounded-xl space-y-1.5 border border-[#1E293B]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#94A3B8]">Driver:</span>
                        <span className="font-bold text-white">{del.partnerName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-[#1A2642] pt-1">
                        <span className="text-[#94A3B8]">Delivery OTP:</span>
                        <span className="font-mono font-black text-[#3B82F6] tracking-widest">
                          {del.otp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdvanceStatus(del.id)}
                      className="w-full py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs transition-all shadow"
                    >
                      ✓ {isTamil ? 'டெலிவரி முடிந்தது (OTP சரிபார்)' : 'Verify OTP & Complete'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Delivered Today */}
          <div className="flex flex-col bg-[#0D152A] rounded-2xl border border-[#1A2642] p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A2642]">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-[#10B981]" />
                <h3 className="font-extrabold text-sm text-white">
                  {isTamil ? 'இன்று டெலிவரி செய்யப்பட்டது' : 'Delivered Today'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#10B981]/20 text-[#A7F3D0]">
                {deliveredList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {deliveredList.map((del) => (
                <div
                  key={del.id}
                  className="bg-[#111C38]/60 border border-[#1A2642] rounded-xl p-3.5 space-y-2 opacity-85"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#94A3B8]">{del.orderNumber}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399]">
                      ✓ DELIVERED
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{del.customerName}</h4>
                    <p className="text-[10px] text-[#64748B]">Driver: {del.partnerName || 'Staff'}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[#1E293B]">
                    <span className="text-[#64748B]">{del.zoneName}</span>
                    <span className="font-bold text-[#34D399]">₹{del.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Assign Partner Modal ─────────────────────────────────────────────── */}
      {showAssignModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E172F] border border-[#233560] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#1E293B]">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {isTamil ? 'ஓட்டுநரை ஒதுக்கு' : 'Assign Delivery Partner'}
                </h3>
                <p className="text-xs text-[#3B82F6]">{selectedDelivery.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-[#94A3B8] hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#94A3B8]">
                {isTamil ? 'கிடைக்கக்கூடிய ஓட்டுநரை தேர்வு செய்யவும்:' : 'Select an online driver from the fleet:'}
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedDriverId(partner.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedDriverId === partner.id
                        ? 'bg-[#0284C7]/20 border-[#38BDF8]'
                        : 'bg-[#081023] border-[#1E293B] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {partner.vehicleType === 'SCOOTER' ? '' : '🏍️'}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{partner.name}</h4>
                        <p className="text-[11px] text-[#94A3B8]">
                          {partner.vehicleNumber} • ⭐ {partner.rating} ({partner.totalDeliveries} trips)
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        partner.isOnline
                          ? partner.activeDeliveryId
                            ? 'bg-[#0284C7]/30 text-[#BAE6FD]'
                            : 'bg-[#10B981]/20 text-[#34D399]'
                          : 'bg-[#1E293B] text-[#64748B]'
                      }`}
                    >
                      {partner.isOnline ? (partner.activeDeliveryId ? 'Busy' : 'Available') : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignDriver(selectedDelivery.id, selectedDriverId)}
                disabled={!selectedDriverId}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#D97706] disabled:opacity-50 text-black text-xs font-black transition-all shadow"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Zones & Pricing Modal ────────────────────────────────────────────── */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E172F] border border-[#233560] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#1E293B]">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {isTamil ? 'டெலிவரி பகுதிகள் & கட்டண விதிகள்' : 'Delivery Zones & Pricing Rules'}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Configure minimum orders, base fees, and free delivery thresholds
                </p>
              </div>
              <button
                onClick={() => setShowZoneModal(false)}
                className="text-[#94A3B8] hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {zones.map((z) => (
                <div
                  key={z.id}
                  className="bg-[#081023] border border-[#1E293B] rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-white">{z.name}</h4>
                      <p className="text-xs text-[#3B82F6]">{z.nameTa}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#10B981]/20 text-[#34D399]">
                      Radius: {z.radiusKm} km
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 bg-[#0D152A] p-3 rounded-lg text-center text-xs">
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Min Order</span>
                      <span className="font-extrabold text-white text-sm">₹{z.minOrderAmount}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Base Fee</span>
                      <span className="font-extrabold text-[#F59E0B] text-sm">₹{z.baseFee}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Free Delivery &gt;</span>
                      <span className="font-extrabold text-[#10B981] text-sm">₹{z.freeDeliveryThreshold}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Est. Time</span>
                      <span className="font-extrabold text-[#38BDF8] text-sm">{z.estimatedDeliveryMinutes} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowZoneModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#D97706] text-black font-extrabold text-xs transition-all shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
