'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DriverActiveTask, PartnerAvailableDelivery, PartnerEarningsSummary } from '@ashok-raj/types';

// Dynamic Mapcn Map to ensure SSR compatibility
const MapView = dynamic(
  () => import('../../components/map/map-view').then((mod) => mod.MapView),
  { ssr: false }
);
const MapMarker = dynamic(
  () => import('../../components/map/marker').then((mod) => mod.MapMarker),
  { ssr: false }
);
const MapRoute = dynamic(
  () => import('../../components/map/route').then((mod) => mod.MapRoute),
  { ssr: false }
);
const MapControls = dynamic(
  () => import('../../components/map/controls').then((mod) => mod.MapControls),
  { ssr: false }
);

// Sample Driver Profiles
const DRIVERS = [
  { id: 'driver-101', name: 'Murugan Selvam', phone: '9842199881', vehicle: 'Hero Splendor (TN 63 AB 4589)', rating: 4.9 },
  { id: 'driver-102', name: 'Kavin Kumar', phone: '9842199882', vehicle: 'Honda Activa (TN 63 BC 1204)', rating: 4.8 },
  { id: 'driver-103', name: 'Senthil Nathan', phone: '9842199883', vehicle: 'TVS Jupiter (TN 63 D 8821)', rating: 4.7 },
];

export default function DriverConsolePage() {
  const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0]);
  const [isOnline, setIsOnline] = useState(true);
  const [lang, setLang] = useState<'EN' | 'TA'>('EN');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RADAR' | 'EARNINGS' | 'HISTORY'>('ACTIVE');

  // Active Task State
  const [activeTask, setActiveTask] = useState<DriverActiveTask | null>(null);
  const [availableOrders, setAvailableOrders] = useState<PartnerAvailableDelivery[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarningsSummary | null>(null);

  // OTP Verification Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Notification Banner
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const t = (en: string, ta: string) => (lang === 'TA' ? ta : en);

  // Initialize Data
  useEffect(() => {
    // Initial active task
    const mockTask: DriverActiveTask = {
      deliveryId: 'del-201',
      orderId: 'ord-del-101',
      orderNumber: 'AR-DEL-8801',
      status: 'EN_ROUTE',
      orderStatus: 'OUT_FOR_DELIVERY',
      stage: 'PICKED_UP_ON_WAY',
      restaurant: {
        name: 'Ashok Raj Lodge & Restaurant',
        address: 'Madurai-Thondi Main Road, Kalaiyarkoil, Tamil Nadu 630551',
        phone: '04575 232 333',
        coordinate: { lat: 9.8436, lng: 78.6548 },
      },
      customer: {
        nameMasked: 'S. Ramkumar (Guest)',
        phoneMasked: '98******81',
        phone: '9842199881',
        address: {
          label: 'Home',
          line1: 'No 45, Sivan Koil North Car Street',
          line2: 'Near Raja Theatres',
          city: 'Kalaiyarkoil',
          pincode: '630551',
        },
        coordinate: { lat: 9.8482, lng: 78.6585 },
      },
      driverLocation: { lat: 9.8455, lng: 78.6562 },
      routeCoordinates: [
        { lat: 9.8436, lng: 78.6548 }, // Restaurant
        { lat: 9.8445, lng: 78.6554 },
        { lat: 9.8455, lng: 78.6562 }, // Driver
        { lat: 9.8470, lng: 78.6575 },
        { lat: 9.8482, lng: 78.6585 }, // Customer
      ],
      distanceKm: 2.8,
      estimatedDeliveryMinutes: 14,
      payoutAmount: 48,
      itemsSummary: '2x Chettinad Chicken Biryani, 1x Mutton Chukka, 2x Parotta Set',
      itemCount: 5,
      totalOrderAmount: 499,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      specialInstructions: 'Customer requested contactless handover or call before ringing.',
      assignedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      pickedUpAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    };
    setActiveTask(mockTask);

    // Available Deliveries
    setAvailableOrders([
      {
        deliveryId: 'del-demo-301',
        orderId: 'ord-demo-301',
        orderNumber: 'AR-DEL-8805',
        zoneName: 'Kalaiyarkoil Town Core',
        zoneNameTa: 'காளையார்கோவில் நகர் மையம்',
        distanceKm: 3.1,
        payoutAmount: 45,
        itemCount: 3,
        itemsSummary: '3x Veg Fried Rice, 2x Gobi Manchurian',
        restaurantDistanceKm: 0.6,
        customerDistanceKm: 3.1,
        estimatedMinutes: 20,
        createdAt: new Date().toISOString(),
      },
      {
        deliveryId: 'del-demo-302',
        orderId: 'ord-demo-302',
        orderNumber: 'AR-DEL-8809',
        zoneName: 'Sivagangai Highway',
        zoneNameTa: 'சிவகங்கை நெடுஞ்சாலை',
        distanceKm: 5.8,
        payoutAmount: 65,
        itemCount: 4,
        itemsSummary: '4x Kal Dosa, 2x Kari Dosa, 1x Nattu Kozhi Soup',
        restaurantDistanceKm: 0.9,
        customerDistanceKm: 5.8,
        estimatedMinutes: 30,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Earnings Summary
    setEarnings({
      todayEarnings: 680,
      tripsCount: 14,
      onlineHours: 5.5,
      basePay: 490,
      tips: 90,
      distanceIncentives: 100,
      weeklyTotal: 4250,
      recentDeliveries: [
        { id: 'trip-1', orderNumber: 'AR-DEL-8798', deliveredAt: 'Today, 01:15 PM', payout: 45, tip: 20, distanceKm: 2.6, customerRating: 5 },
        { id: 'trip-2', orderNumber: 'AR-DEL-8785', deliveredAt: 'Today, 12:40 PM', payout: 50, tip: 0, distanceKm: 3.4, customerRating: 5 },
        { id: 'trip-3', orderNumber: 'AR-DEL-8772', deliveredAt: 'Today, 11:55 AM', payout: 40, tip: 10, distanceKm: 2.1, customerRating: 4 },
        { id: 'trip-4', orderNumber: 'AR-DEL-8760', deliveredAt: 'Today, 11:10 AM', payout: 45, tip: 0, distanceKm: 2.8, customerRating: 5 },
      ],
    });
  }, [selectedDriver]);

  // Handle Accept Order from Radar
  const handleAcceptOrder = (order: PartnerAvailableDelivery) => {
    const newTask: DriverActiveTask = {
      deliveryId: order.deliveryId,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      status: 'ASSIGNED',
      orderStatus: 'ACCEPTED',
      stage: 'NAVIGATING_TO_RESTAURANT',
      restaurant: {
        name: 'Ashok Raj Lodge & Restaurant',
        address: 'Madurai-Thondi Main Road, Kalaiyarkoil, Tamil Nadu 630551',
        phone: '04575 232 333',
        coordinate: { lat: 9.8436, lng: 78.6548 },
      },
      customer: {
        nameMasked: 'Customer (Verified)',
        phoneMasked: '98******00',
        phone: '9842199000',
        address: {
          label: 'Delivery Location',
          line1: 'Near Main Bazaar, Car Street',
          city: 'Kalaiyarkoil',
          pincode: '630551',
        },
        coordinate: { lat: 9.8475, lng: 78.6570 },
      },
      driverLocation: { lat: 9.8440, lng: 78.6545 },
      routeCoordinates: [
        { lat: 9.8436, lng: 78.6548 },
        { lat: 9.8440, lng: 78.6545 },
        { lat: 9.8475, lng: 78.6570 },
      ],
      distanceKm: order.distanceKm,
      estimatedDeliveryMinutes: order.estimatedMinutes,
      payoutAmount: order.payoutAmount,
      itemsSummary: order.itemsSummary,
      itemCount: order.itemCount,
      totalOrderAmount: 380,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      assignedAt: new Date().toISOString(),
    };

    setActiveTask(newTask);
    setAvailableOrders((prev) => prev.filter((o) => o.deliveryId !== order.deliveryId));
    setActiveTab('ACTIVE');
    setAlertBanner(t(`Order ${order.orderNumber} accepted! Head to restaurant.`, `ஆர்டர் ${order.orderNumber} ஏற்கப்பட்டது! உணவகத்திற்கு செல்லவும்.`));
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Handle Pickup Confirmation
  const handleConfirmPickup = () => {
    if (!activeTask) return;
    setActiveTask({
      ...activeTask,
      status: 'PICKED_UP',
      stage: 'PICKED_UP_ON_WAY',
      pickedUpAt: new Date().toISOString(),
    });
    setAlertBanner(t('Food Picked Up! Driving towards customer.', 'உணவு பெறப்பட்டது! வாடிக்கையாளர் முகவரிக்கு செல்லவும்.'));
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Handle Start En-Route
  const handleStartEnRoute = () => {
    if (!activeTask) return;
    setActiveTask({
      ...activeTask,
      status: 'EN_ROUTE',
      stage: 'PICKED_UP_ON_WAY',
    });
    setAlertBanner(t('En-Route to customer.', 'பயணம் துவங்கப்பட்டது.'));
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Handle Verify OTP
  const handleVerifyOtp = () => {
    if (!otpInput || otpInput.length !== 6) {
      setOtpError(t('Please enter valid 6-digit OTP', 'தயவுசெய்து 6 இலக்க OTP-ஐ உள்ளிடவும்'));
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    setTimeout(() => {
      setIsVerifying(false);
      setShowOtpModal(false);
      setOtpInput('');

      if (activeTask) {
        // Add to recent earnings
        if (earnings) {
          setEarnings({
            ...earnings,
            todayEarnings: earnings.todayEarnings + activeTask.payoutAmount,
            tripsCount: earnings.tripsCount + 1,
            recentDeliveries: [
              {
                id: `trip-${Date.now()}`,
                orderNumber: activeTask.orderNumber,
                deliveredAt: 'Just now',
                payout: activeTask.payoutAmount,
                tip: 0,
                distanceKm: activeTask.distanceKm,
                customerRating: 5,
              },
              ...earnings.recentDeliveries,
            ],
          });
        }

        setAlertBanner(t(`🎉 Delivery #${activeTask.orderNumber} completed! +₹${activeTask.payoutAmount} added to wallet.`, `🎉 ஆர்டர் #${activeTask.orderNumber} வெற்றிகரமாக முடிந்தது! +₹${activeTask.payoutAmount} வரவு வைக்கப்பட்டது.`));
        setActiveTask(null);
        setTimeout(() => setAlertBanner(null), 5000);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070B11] text-white flex flex-col">
      {/* ── Top Header & Status Bar ────────────────────────────────────────── */}
      <header className="bg-[#0F172A]/90 border-b border-[#1E293B] sticky top-0 z-30 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 font-black">
              
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  {t('Delivery Partner Console', 'டெலிவரி பார்ட்னர் போர்டல்')}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/40 uppercase">
                  Phase 9
                </span>
              </div>
              {/* Driver Selector */}
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span>{t('Driver:', 'ஓட்டுநர்:')}</span>
                <select
                  value={selectedDriver.id}
                  onChange={(e) => {
                    const d = DRIVERS.find((item) => item.id === e.target.value);
                    if (d) setSelectedDriver(d);
                  }}
                  className="bg-[#1E293B] text-white rounded px-2 py-0.5 text-xs font-semibold border border-[#334155] focus:outline-none focus:border-[#10B981]"
                >
                  {DRIVERS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.rating}⭐)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Action Bar: Status Toggle & Lang */}
          <div className="flex items-center space-x-3">
            {/* Online / Offline Switch */}
            <button
              onClick={() => {
                const nextStatus = !isOnline;
                setIsOnline(nextStatus);
                setAlertBanner(
                  nextStatus
                    ? t('🟢 You are now ONLINE & receiving orders', '🟢 நீங்கள் இப்போது ஆன்லைனில் உள்ளீர்கள்')
                    : t('⚪ You are now OFFLINE', '⚪ நீங்கள் இப்போது ஆஃப்லைனில் உள்ளீர்கள்')
                );
                setTimeout(() => setAlertBanner(null), 3000);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all shadow-md active:scale-95 ${
                isOnline
                  ? 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40 hover:bg-[#10B981]/30'
                  : 'bg-[#334155]/40 text-[#94A3B8] border-[#475569] hover:bg-[#334155]'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-[#10B981] animate-ping' : 'bg-gray-500'}`} />
              <span>{isOnline ? t('ONLINE', 'ஆன்லைன்') : t('OFFLINE', 'ஆஃப்லைன்')}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'EN' ? 'TA' : 'EN')}
              className="px-2.5 py-1 rounded-xl bg-[#1E293B] border border-[#334155] text-xs font-bold text-[#3B82F6] hover:bg-[#334155] transition-colors"
            >
              {lang === 'EN' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Alert Banner Notification ──────────────────────────────────────── */}
      {alertBanner && (
        <div className="bg-gradient-to-r from-[#065F46] to-[#047857] text-white px-4 py-2 text-center text-xs font-bold shadow-md animate-bounce">
          {alertBanner}
        </div>
      )}

      {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
      <nav className="bg-[#0B111E] border-b border-[#1E293B] px-4">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-6 overflow-x-auto py-2">
          {[
            { id: 'ACTIVE', label: t(' Active Navigation', ' நேரலை பயணம்'), badge: activeTask ? '1' : null },
            { id: 'RADAR', label: t('📡 Orders Radar', '📡 புதிய ஆர்டர்கள்'), badge: availableOrders.length.toString() },
            { id: 'EARNINGS', label: t(' Earnings & Payouts', ' வருமானம்'), badge: `₹${earnings?.todayEarnings || 0}` },
            { id: 'HISTORY', label: t('📜 Trip History', '📜 பயண வரலாறு'), badge: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#10B981] text-black shadow-lg shadow-emerald-500/20'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-black text-[#10B981]' : 'bg-[#1E293B] text-[#3B82F6]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main View Area ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col">
        {/* ── TAB 1: ACTIVE TRIP & NAVIGATION (mapcn.dev integration) ────────── */}
        {activeTab === 'ACTIVE' && (
          <div className="flex-1 flex flex-col gap-4">
            {!activeTask ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0F172A] rounded-2xl border border-[#1E293B]">
                <div className="h-20 w-20 rounded-full bg-[#1E293B] flex items-center justify-center text-4xl mb-4">
                  
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  {t('No Active Delivery Right Now', 'தற்போது எந்த ஒரு பயணமும் இல்லை')}
                </h3>
                <p className="text-xs text-[#94A3B8] max-w-md mt-1 mb-6">
                  {t('You are online and ready! Check the Orders Radar tab to accept incoming orders nearby.', 'புதிய ஆர்டர்களைப் பெற ஆர்டர் ரேடார் பகுதியை பார்க்கவும்.')}
                </p>
                <button
                  onClick={() => setActiveTab('RADAR')}
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs shadow-lg transition-all"
                >
                  {t('Check Orders Radar →', 'ஆர்டர் ரேடார் பார்க்க →')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                {/* Left 7 Columns: mapcn.dev Map Visualization Layer */}
                <div className="lg:col-span-7 flex flex-col gap-2 min-h-[420px]">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold text-[#3B82F6] uppercase tracking-wider flex items-center gap-1.5">
                      <span></span> {t('Live Route Navigation (mapcn.dev)', 'நேரலை வரைபடம்')}
                    </span>
                    <span className="text-[11px] text-[#34D399] font-bold">
                      ● {t('GPS Signal Locked', 'GPS இணைப்பு உள்ளது')}
                    </span>
                  </div>

                  <div className="flex-1 rounded-2xl overflow-hidden border border-[#334155] shadow-2xl relative">
                    <MapView
                      center={[activeTask.driverLocation.lng, activeTask.driverLocation.lat]}
                      zoom={14}
                      pitch={35}
                      bounds={[
                        [
                          Math.min(activeTask.restaurant.coordinate.lng, activeTask.customer.coordinate.lng) - 0.005,
                          Math.min(activeTask.restaurant.coordinate.lat, activeTask.customer.coordinate.lat) - 0.005,
                        ],
                        [
                          Math.max(activeTask.restaurant.coordinate.lng, activeTask.customer.coordinate.lng) + 0.005,
                          Math.max(activeTask.restaurant.coordinate.lat, activeTask.customer.coordinate.lat) + 0.005,
                        ],
                      ]}
                    >
                      {/* Restaurant Marker */}
                      <MapMarker
                        coordinate={[activeTask.restaurant.coordinate.lng, activeTask.restaurant.coordinate.lat]}
                        type="RESTAURANT"
                        title={t('Ashok Raj Kitchen', 'அசோக் ராஜ் உணவகம்')}
                      />

                      {/* Customer Destination Marker */}
                      <MapMarker
                        coordinate={[activeTask.customer.coordinate.lng, activeTask.customer.coordinate.lat]}
                        type="CUSTOMER"
                        title={t('Customer Dropoff', 'டெலிவரி முகவரி')}
                      />

                      {/* Live Driver Marker */}
                      <MapMarker
                        coordinate={[activeTask.driverLocation.lng, activeTask.driverLocation.lat]}
                        type="DRIVER"
                        heading={45}
                        title={selectedDriver.name}
                      />

                      {/* Glowing Route Polyline */}
                      <MapRoute
                        coordinates={activeTask.routeCoordinates.map((c) => [c.lng, c.lat])}
                        color="#10B981"
                        width={5}
                        isDashed={activeTask.status === 'EN_ROUTE'}
                      />

                      {/* Map Controls */}
                      <MapControls />
                    </MapView>
                  </div>
                </div>

                {/* Right 5 Columns: Trip Details, Actions & OTP Verification */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Status & ETA Header Card */}
                  <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/40">
                        #{activeTask.orderNumber}
                      </span>
                      <span className="text-xs font-black text-[#10B981] bg-[#10B981]/20 px-2.5 py-1 rounded-full border border-[#10B981]/40">
                        +₹{activeTask.payoutAmount} {t('Payout', 'சம்பளம்')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-[#94A3B8] uppercase">
                          {t('ESTIMATED ARRIVAL', 'தோராயமான நேரம்')}
                        </div>
                        <div className="text-2xl font-black text-white">
                          ~{activeTask.estimatedDeliveryMinutes} {t('mins', 'நிமி')} • {activeTask.distanceKm} km
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-2xl">
                        
                      </div>
                    </div>

                    {/* Progress Stage Tracker */}
                    <div className="mt-4 pt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-bold">
                      <span className={activeTask.status === 'ASSIGNED' ? 'text-[#3B82F6]' : 'text-[#10B981]'}>
                        1. {t('Assigned', 'ஏற்கப்பட்டது')} ✓
                      </span>
                      <span className="text-[#64748B]">→</span>
                      <span className={activeTask.status === 'PICKED_UP' || activeTask.status === 'EN_ROUTE' ? 'text-[#10B981]' : 'text-[#64748B]'}>
                        2. {t('Picked Up', 'எடுக்கப்பட்டது')} {activeTask.pickedUpAt ? '✓' : ''}
                      </span>
                      <span className="text-[#64748B]">→</span>
                      <span className={activeTask.status === 'EN_ROUTE' ? 'text-[#3B82F6] animate-pulse' : 'text-[#64748B]'}>
                        3. {t('En-Route', 'வழியில்')}
                      </span>
                    </div>
                  </div>

                  {/* Customer Destination Card */}
                  <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span className="text-xs font-bold text-[#94A3B8] uppercase">
                          {t('Delivery Address (Sanitized PII)', 'டெலிவரி முகவரி')}
                        </span>
                      </div>
                      {/* Customer Call */}
                      <a
                        href={`tel:${activeTask.customer.phone || '9842199881'}`}
                        className="px-3 py-1 rounded-full bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/40 text-xs font-bold text-[#38BDF8] flex items-center gap-1.5 transition-all"
                      >
                        <span>📞</span>
                        <span>{t('Call Customer', 'அழைக்க')}</span>
                      </a>
                    </div>

                    <div>
                      <div className="text-sm font-extrabold text-white">
                        {activeTask.customer.nameMasked}
                      </div>
                      <div className="text-xs text-[#CBD5E1] mt-0.5 leading-relaxed">
                        {activeTask.customer.address.line1}, {activeTask.customer.address.line2 || ''}
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {activeTask.customer.address.city} - {activeTask.customer.address.pincode}
                      </div>
                    </div>

                    {activeTask.specialInstructions && (
                      <div className="p-2.5 rounded-xl bg-[#1E293B]/80 border border-[#334155] text-xs text-[#DBEAFE]">
                        💬 <b>{t('Note:', 'குறிப்பு:')}</b> {activeTask.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Order Items Summary */}
                  <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4 shadow-xl">
                    <div className="text-xs font-bold text-[#94A3B8] uppercase mb-1">
                      {t('Order Items', 'உணவு பட்டியல்')} ({activeTask.itemCount} items)
                    </div>
                    <div className="text-xs text-[#E2E8F0] font-medium leading-relaxed">
                      {activeTask.itemsSummary}
                    </div>
                    <div className="mt-2 text-xs font-bold text-[#10B981]">
                      {t('Payment:', 'கட்டணம்:')} {activeTask.paymentMethod} • {activeTask.paymentStatus} (₹{activeTask.totalOrderAmount})
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-auto">
                    {activeTask.status === 'ASSIGNED' && (
                      <button
                        onClick={handleConfirmPickup}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#B27D00] hover:from-[#F59E0B] hover:to-[#D97706] text-black font-black text-sm shadow-xl transition-all active:scale-98"
                      >
                        ✓ {t('Confirm Food Picked Up from Kitchen', 'உணவு பெறப்பட்டது')}
                      </button>
                    )}

                    {activeTask.status === 'PICKED_UP' && (
                      <button
                        onClick={handleStartEnRoute}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0EA5E9] hover:to-[#0369A1] text-black font-black text-sm shadow-xl transition-all active:scale-98"
                      >
                         {t('Start Driving to Customer (En-Route)', 'பயணத்தை துவங்கவும்')}
                      </button>
                    )}

                    {(activeTask.status === 'EN_ROUTE' || activeTask.status === 'PICKED_UP') && (
                      <button
                        onClick={() => setShowOtpModal(true)}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#047857] hover:from-[#34D399] hover:to-[#059669] text-black font-black text-sm shadow-xl transition-all active:scale-98"
                      >
                        🔐 {t('Enter Customer OTP to Deliver', 'டெலிவரி OTP சரிபார்க்க')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: ORDERS RADAR (ACCEPT / REJECT) ──────────────────────────── */}
        {activeTab === 'RADAR' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>📡</span> {t('Available Deliveries Radar', 'புதிய ஆர்டர்கள் ரேடார்')}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {t('Orders ready for dispatch in Kalaiyarkoil and surrounding areas.', 'காளையார்கோவில் மற்றும் அருகிலுள்ள பகுதிகளுக்கான ஆர்டர்கள்.')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40">
                {availableOrders.length} {t('Ready', 'தயார்')}
              </span>
            </div>

            {availableOrders.length === 0 ? (
              <div className="p-12 text-center bg-[#0F172A] rounded-2xl border border-[#1E293B]">
                <div className="text-4xl mb-2">📡</div>
                <div className="text-sm font-bold text-white">
                  {t('No pending orders in your zone', 'தற்போது புதிய ஆர்டர்கள் இல்லை')}
                </div>
                <div className="text-xs text-[#94A3B8] mt-1">
                  {t('New incoming home delivery orders will appear here automatically.', 'புதிய ஆர்டர்கள் வந்ததும் இங்கு தோன்றும்.')}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOrders.map((order) => (
                  <div
                    key={order.deliveryId}
                    className="bg-[#0F172A] border-2 border-[#1E293B] hover:border-[#10B981] rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded text-xs font-black bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/40">
                          #{order.orderNumber}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-black text-[#10B981]">
                            +₹{order.payoutAmount}
                          </span>
                          <div className="text-[10px] text-[#94A3B8]">{t('Payout', 'வருமானம்')}</div>
                        </div>
                      </div>

                      <div className="text-sm font-bold text-white mb-1">
                        {lang === 'TA' ? order.zoneNameTa : order.zoneName}
                      </div>

                      <div className="text-xs text-[#94A3B8] mb-3 flex items-center gap-3">
                        <span>📍 {order.distanceKm} km {t('total', 'தூரம்')}</span>
                        <span>•</span>
                        <span> ~{order.estimatedMinutes} {t('mins', 'நிமி')}</span>
                        <span>•</span>
                        <span>{order.itemCount} {t('items', 'பொருட்கள்')}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#1E293B]/80 text-xs text-[#CBD5E1] border border-[#334155] mb-4 leading-relaxed">
                        {order.itemsSummary}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          setAvailableOrders((prev) => prev.filter((o) => o.deliveryId !== order.deliveryId));
                          setAlertBanner(t(`Order ${order.orderNumber} rejected`, `ஆர்டர் ${order.orderNumber} தவிர்க்கப்பட்டது`));
                          setTimeout(() => setAlertBanner(null), 3000);
                        }}
                        className="py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#EF4444] font-bold text-xs border border-[#334155] transition-all"
                      >
                        ✕ {t('Pass', 'தவிர்')}
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        className="py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs shadow-lg transition-all"
                      >
                        ✓ {t('Accept Order', 'ஏற்றுக்கொள்')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EARNINGS & PAYOUTS ──────────────────────────────────────── */}
        {activeTab === 'EARNINGS' && earnings && (
          <div className="flex flex-col gap-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
                <div className="text-[11px] font-bold text-[#94A3B8] uppercase">
                  {t("Today's Earnings", 'இன்றைய வருமானம்')}
                </div>
                <div className="text-3xl font-black text-[#10B981] mt-1">
                  ₹{earnings.todayEarnings}
                </div>
                <div className="text-[11px] text-[#34D399] mt-1 font-bold">
                  ● {earnings.tripsCount} {t('Trips Completed', 'பயணங்கள்')}
                </div>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
                <div className="text-[11px] font-bold text-[#94A3B8] uppercase">
                  {t('Base Pay', 'அடிப்படை கட்டணம்')}
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  ₹{earnings.basePay}
                </div>
                <div className="text-[11px] text-[#94A3B8] mt-1">
                  ₹35 / {t('trip avg', 'சராசரி')}
                </div>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
                <div className="text-[11px] font-bold text-[#94A3B8] uppercase">
                  {t('Tips & Incentives', 'டிப்ஸ் & ஊக்கத்தொகை')}
                </div>
                <div className="text-2xl font-black text-[#3B82F6] mt-1">
                  ₹{earnings.tips + earnings.distanceIncentives}
                </div>
                <div className="text-[11px] text-[#DBEAFE] mt-1 font-bold">
                  ₹{earnings.tips} tips + ₹{earnings.distanceIncentives} bonus
                </div>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
                <div className="text-[11px] font-bold text-[#94A3B8] uppercase">
                  {t('Weekly Total', 'வாராந்திர மொத்தம்')}
                </div>
                <div className="text-2xl font-black text-[#38BDF8] mt-1">
                  ₹{earnings.weeklyTotal}
                </div>
                <div className="text-[11px] text-[#38BDF8] mt-1 font-bold">
                  {t('Auto-Settled via UPI', 'UPI மூலம் வரவு')}
                </div>
              </div>
            </div>

            {/* Recent Trip Payouts */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">
                {t('Today Completed Deliveries', 'இன்று முடிக்கப்பட்ட டெலிவரிகள்')}
              </h4>

              <div className="divide-y divide-[#1E293B]">
                {earnings.recentDeliveries.map((d) => (
                  <div key={d.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">#{d.orderNumber}</span>
                        <span className="text-[10px] font-bold text-[#DBEAFE]">⭐ {d.customerRating || 5}.0</span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">
                        {d.deliveredAt} • {d.distanceKm} km
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#10B981]">
                        +₹{d.payout + (d.tip || 0)}
                      </div>
                      {d.tip > 0 && (
                        <div className="text-[10px] text-[#3B82F6] font-bold">
                          incl. ₹{d.tip} tip
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: TRIP HISTORY ────────────────────────────────────────────── */}
        {activeTab === 'HISTORY' && (
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">
              {t('Delivery Partner Trip History', 'முழு பயண வரலாறு')}
            </h3>

            <div className="space-y-3">
              {[
                { order: 'AR-DEL-8798', customer: 'K. Ramesh', area: 'Sivan Koil Street', payout: 45, tip: 20, time: 'Today, 01:15 PM', items: '2x Mutton Biryani, 1x Pepper Chicken', rating: 5 },
                { order: 'AR-DEL-8785', customer: 'M. Anand', area: 'Sivagangai Road', payout: 50, tip: 0, time: 'Today, 12:40 PM', items: '4x Parotta, 1x Chettinad Chicken Gravy', rating: 5 },
                { order: 'AR-DEL-8772', customer: 'S. Priya', area: 'Kallal Road', payout: 40, tip: 10, time: 'Today, 11:55 AM', items: '1x Veg Meals, 2x Paneer Butter Masala', rating: 4 },
                { order: 'AR-DEL-8760', customer: 'G. Suresh', area: 'Murthi Nagar', payout: 45, tip: 0, time: 'Today, 11:10 AM', items: '2x Chicken Biryani, 1x Kal Dosa', rating: 5 },
              ].map((trip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1E293B]/60 border border-[#334155] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#3B82F6]">#{trip.order}</span>
                      <span className="text-xs font-bold text-white">{trip.customer}</span>
                      <span className="text-[10px] text-[#DBEAFE] font-bold">⭐ {trip.rating}.0</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">
                      📍 {trip.area} •  {trip.time}
                    </div>
                    <div className="text-[11px] text-[#CBD5E1] mt-0.5">
                      {trip.items}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-[#10B981]">
                      +₹{trip.payout + trip.tip}
                    </div>
                    <div className="text-[10px] text-[#34D399] font-bold">
                      {t('Delivered', 'முடிக்கப்பட்டது')} ✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Delivery OTP Verification Modal ────────────────────────────────── */}
      {showOtpModal && activeTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border-2 border-[#10B981] rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn">
            <div className="text-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-3xl mx-auto mb-3">
                🔐
              </div>
              <h3 className="text-lg font-black text-white">
                {t('Verify Customer Delivery OTP', 'வாடிக்கையாளர் OTP சரிபார்க்க')}
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                {t('Ask the customer for the 6-digit OTP displayed on their order screen to confirm handover.', 'வாடிக்கையாளர் மொபைலில் உள்ள 6 இலக்க OTP குறியீட்டை கேட்கவும்.')}
              </p>
            </div>

            <div className="mb-4">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ''));
                  setOtpError('');
                }}
                placeholder="• • • • • •"
                className="w-full text-center text-2xl tracking-[0.4em] font-black py-3 rounded-2xl bg-[#1E293B] border-2 border-[#334155] focus:border-[#10B981] focus:outline-none text-white shadow-inner"
              />
              {otpError && (
                <div className="text-xs text-[#EF4444] font-bold text-center mt-2">
                  {otpError}
                </div>
              )}
            </div>

            {/* Demo Hint */}
            <div className="mb-4 p-2.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[11px] text-[#DBEAFE] text-center">
              💡 {t('Demo Delivery OTP:', 'டெமோ OTP:')} <b>482915</b>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput('');
                  setOtpError('');
                }}
                className="py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white font-bold text-xs border border-[#334155]"
              >
                {t('Cancel', 'ரத்து')}
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs shadow-lg transition-all"
              >
                {isVerifying ? t('Verifying...', 'சரிபார்க்கிறது...') : t('Complete ✓', 'முடிக்க ✓')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
