'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Room, RoomType, RoomStatus, FrontDeskRackSummary, RoomMaintenance, Booking, BookingGuest } from '@ashok-raj/types';
import { LODGE } from '@ashok-raj/config';

export default function LodgeConsolePage() {
  const [lang, setLang] = useState<'EN' | 'TA'>('EN');
  const [activeTab, setActiveTab] = useState<'TODAY' | 'BOOKINGS' | 'RACK' | 'ROOM_TYPES' | 'MAINTENANCE' | 'POLICIES'>('TODAY');
  const [todaySubTab, setTodaySubTab] = useState<'ARRIVALS' | 'DEPARTURES' | 'IN_HOUSE'>('ARRIVALS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lodge Inventory State
  const [summary, setSummary] = useState<FrontDeskRackSummary | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<RoomMaintenance[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals & Drawers
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Forms
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomTypeId, setNewRoomTypeId] = useState('rt-standard-ac');
  const [newRoomNotes, setNewRoomNotes] = useState('');

  const [targetRoomId, setTargetRoomId] = useState('');
  const [roomChangeReason, setRoomChangeReason] = useState('');

  const [maintIssue, setMaintIssue] = useState('');
  const [maintType, setMaintType] = useState('GENERAL');
  const [maintPriority, setMaintPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  // Alerts
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const t = (en: string, ta: string) => (lang === 'TA' ? ta : en);

  // Status Colors & Labels
  const STATUS_CONFIG: Record<RoomStatus, { label: string; labelTa: string; bg: string; text: string; border: string; icon: string }> = {
    AVAILABLE: { label: 'Available', labelTa: 'கிடைக்கக்கூடியது', bg: 'bg-[#10B981]/15', text: 'text-[#34D399]', border: 'border-[#10B981]/40', icon: '🟢' },
    RESERVED: { label: 'Reserved', labelTa: 'முன்பதிவு', bg: 'bg-[#3B82F6]/15', text: 'text-[#DBEAFE]', border: 'border-[#3B82F6]/40', icon: '🟡' },
    OCCUPIED: { label: 'Occupied', labelTa: 'விருந்தினர்', bg: 'bg-[#EF4444]/15', text: 'text-[#FCA5A5]', border: 'border-[#EF4444]/40', icon: '🔴' },
    CLEANING: { label: 'Cleaning', labelTa: 'சுத்தம்', bg: 'bg-[#A855F7]/15', text: 'text-[#D8B4FE]', border: 'border-[#A855F7]/40', icon: '🟣' },
    INSPECTED: { label: 'Inspected', labelTa: 'ஆய்வு முடிந்தது', bg: 'bg-[#38BDF8]/15', text: 'text-[#BAE6FD]', border: 'border-[#38BDF8]/40', icon: '🔵' },
    MAINTENANCE: { label: 'Maintenance', labelTa: 'பராமரிப்பில்', bg: 'bg-[#F97316]/15', text: 'text-[#FDBA74]', border: 'border-[#F97316]/40', icon: '🟠' },
    BLOCKED: { label: 'Blocked', labelTa: 'முடக்கப்பட்டது', bg: 'bg-[#64748B]/15', text: 'text-[#CBD5E1]', border: 'border-[#64748B]/40', icon: '⚫' },
  };

  const todayStr = '2026-08-28';

  const updateRackSummary = useCallback((rooms: Room[], types: RoomType[]) => {
    const floorMap = new Map<number, Room[]>();
    rooms.forEach((r) => {
      const list = floorMap.get(r.floor) || [];
      list.push({
        ...r,
        type: types.find((t) => t.id === r.typeId),
      });
      floorMap.set(r.floor, list);
    });

    const floors = Array.from(floorMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([floorNumber, rList]) => ({
        floorNumber,
        floorName: floorNumber === 1 ? 'Ground Floor (தரைத்தளம்)' : `Floor ${floorNumber} (${floorNumber}-ஆம் தளம்)`,
        rooms: rList.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)),
      }));

    const statusCounts = {
      totalRooms: rooms.length,
      available: rooms.filter((r) => r.status === 'AVAILABLE').length,
      reserved: rooms.filter((r) => r.status === 'RESERVED').length,
      occupied: rooms.filter((r) => r.status === 'OCCUPIED').length,
      cleaning: rooms.filter((r) => r.status === 'CLEANING').length,
      inspected: rooms.filter((r) => r.status === 'INSPECTED').length,
      maintenance: rooms.filter((r) => r.status === 'MAINTENANCE').length,
      blocked: rooms.filter((r) => r.status === 'BLOCKED').length,
    };

    const occupancyRate = statusCounts.totalRooms > 0
      ? Math.round(((statusCounts.occupied + statusCounts.reserved) / statusCounts.totalRooms) * 100)
      : 0;

    setSummary({
      ...statusCounts,
      occupancyRate,
      floors,
    });
  }, []);

  // Initialize Sample Front-Desk Data
  useEffect(() => {
    const initialTypes: RoomType[] = LODGE.DEFAULT_ROOM_TYPES.map((rt) => ({
      id: rt.id,
      name: rt.name,
      nameTa: rt.nameTa,
      description: rt.description,
      descriptionTa: rt.descriptionTa,
      basePrice: rt.basePrice,
      weekendPrice: rt.weekendPrice,
      maxOccupancy: rt.maxOccupancy,
      bedType: rt.bedType,
      sizeSqFt: rt.sizeSqFt,
      imageUrls: [...rt.imageUrls],
      amenities: [...rt.amenities],
      amenitiesTa: [...rt.amenitiesTa],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setRoomTypes(initialTypes);

    const initialRooms: Room[] = [
      { id: 'room-101', branchId: 'branch-1', roomNumber: '101', floor: 1, typeId: 'rt-standard-ac', status: 'AVAILABLE', notes: 'Near Garden', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-102', branchId: 'branch-1', roomNumber: '102', floor: 1, typeId: 'rt-standard-ac', status: 'OCCUPIED', notes: 'Guest Mr. Anand (Departing today)', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-103', branchId: 'branch-1', roomNumber: '103', floor: 1, typeId: 'rt-deluxe-ac', status: 'CLEANING', notes: 'Checkout 11:00 AM', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-104', branchId: 'branch-1', roomNumber: '104', floor: 1, typeId: 'rt-deluxe-ac', status: 'OCCUPIED', notes: 'Housekeeping complete', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-105', branchId: 'branch-1', roomNumber: '105', floor: 1, typeId: 'rt-family-suite', status: 'RESERVED', notes: 'Arrival expected 4 PM', isActive: true, createdAt: '', updatedAt: '' },

      { id: 'room-201', branchId: 'branch-1', roomNumber: '201', floor: 2, typeId: 'rt-deluxe-ac', status: 'AVAILABLE', notes: 'Pool Facing', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-202', branchId: 'branch-1', roomNumber: '202', floor: 2, typeId: 'rt-deluxe-ac', status: 'OCCUPIED', notes: 'VIP Guest S. Kumar', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-203', branchId: 'branch-1', roomNumber: '203', floor: 2, typeId: 'rt-standard-ac', status: 'MAINTENANCE', notes: 'AC Sensor Servicing', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-204', branchId: 'branch-1', roomNumber: '204', floor: 2, typeId: 'rt-standard-ac', status: 'AVAILABLE', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-205', branchId: 'branch-1', roomNumber: '205', floor: 2, typeId: 'rt-family-suite', status: 'OCCUPIED', notes: 'Family 4 guests', isActive: true, createdAt: '', updatedAt: '' },

      { id: 'room-301', branchId: 'branch-1', roomNumber: '301', floor: 3, typeId: 'rt-family-suite', status: 'AVAILABLE', notes: 'Top Floor View', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-302', branchId: 'branch-1', roomNumber: '302', floor: 3, typeId: 'rt-deluxe-ac', status: 'BLOCKED', notes: 'Scheduled for Deep Painting', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-303', branchId: 'branch-1', roomNumber: '303', floor: 3, typeId: 'rt-deluxe-ac', status: 'AVAILABLE', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'room-304', branchId: 'branch-1', roomNumber: '304', floor: 3, typeId: 'rt-standard-ac', status: 'AVAILABLE', isActive: true, createdAt: '', updatedAt: '' },
    ];
    setRoomsList(initialRooms);
    updateRackSummary(initialRooms, initialTypes);

    const initialBookings: Booking[] = [
      {
        id: 'bkg-1045',
        bookingNumber: 'AR-BKG-1045',
        userId: 'user-2',
        roomId: 'room-105',
        checkIn: todayStr,
        checkOut: '2026-08-30',
        status: 'CONFIRMED',
        adultsCount: 4,
        childrenCount: 1,
        subtotal: 5200,
        taxAmount: 624,
        discountAmount: 500,
        totalAmount: 5324,
        advancePaid: 2000,
        paymentStatus: 'PARTIALLY_PAID',
        paymentMethod: 'CARD',
        couponId: 'LODGE15',
        specialRequests: 'Late arrival expected at 4:00 PM',
        extras: [{ name: 'Extra Bed / Rollaway Mattress', nameTa: 'கூடுதல் படுக்கை', price: 700 }],
        user: { id: 'user-2', name: 'Karthik Ramanathan', phone: '9443322110', email: 'karthik@example.com' },
        room: initialRooms.find((r) => r.id === 'room-105'),
        guests: [
          { id: 'g-1', bookingId: 'bkg-1045', name: 'Karthik Ramanathan', phone: '9443322110', idType: 'Aadhaar', idNumber: '8934 1290 4458', isPrimary: true, createdAt: '' },
          { id: 'g-2', bookingId: 'bkg-1045', name: 'Sowmya Karthik', isPrimary: false, createdAt: '' },
        ],
        statusHistory: [
          { id: 'h-1', bookingId: 'bkg-1045', status: 'CONFIRMED', note: 'Advance of ₹2,000 paid via Card', createdAt: '2026-08-27T10:00:00Z' },
        ],
        createdAt: '2026-08-27T10:00:00Z',
        updatedAt: '2026-08-27T10:00:00Z',
      },
      {
        id: 'bkg-1044',
        bookingNumber: 'AR-BKG-1044',
        userId: 'user-1',
        roomId: 'room-104',
        checkIn: '2026-08-27',
        checkOut: '2026-08-29',
        status: 'CHECKED_IN',
        adultsCount: 2,
        childrenCount: 0,
        subtotal: 3600,
        taxAmount: 432,
        discountAmount: 0,
        totalAmount: 4032,
        advancePaid: 4032,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        specialRequests: 'Ground floor room',
        extras: [{ name: 'South Indian Breakfast Buffet', nameTa: 'காலை உணவு பஃபே', price: 360 }],
        checkedInAt: '2026-08-27T14:20:00Z',
        user: { id: 'user-1', name: 'Sundar Rajan', phone: '9876543210', email: 'sundar@example.com' },
        room: initialRooms.find((r) => r.id === 'room-104'),
        guests: [
          { id: 'g-3', bookingId: 'bkg-1044', name: 'Sundar Rajan', phone: '9876543210', idType: 'Aadhaar', idNumber: '8923 4589 1204', isPrimary: true, createdAt: '' },
        ],
        statusHistory: [
          { id: 'h-2', bookingId: 'bkg-1044', status: 'CONFIRMED', note: 'Booked online', createdAt: '2026-08-26T12:00:00Z' },
          { id: 'h-3', bookingId: 'bkg-1044', status: 'CHECKED_IN', note: 'Checked in by Receptionist Sangeetha', changedBy: 'Sangeetha', createdAt: '2026-08-27T14:20:00Z' },
        ],
        createdAt: '2026-08-26T12:00:00Z',
        updatedAt: '2026-08-27T14:20:00Z',
      },
      {
        id: 'bkg-1042',
        bookingNumber: 'AR-BKG-1042',
        userId: 'user-3',
        roomId: 'room-102',
        checkIn: '2026-08-26',
        checkOut: todayStr,
        status: 'CHECKED_IN',
        adultsCount: 2,
        childrenCount: 0,
        subtotal: 2400,
        taxAmount: 288,
        discountAmount: 0,
        totalAmount: 2688,
        advancePaid: 2688,
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        specialRequests: null,
        extras: [],
        checkedInAt: '2026-08-26T15:00:00Z',
        user: { id: 'user-3', name: 'Anand Kumar', phone: '9789012345' },
        room: initialRooms.find((r) => r.id === 'room-102'),
        guests: [
          { id: 'g-4', bookingId: 'bkg-1042', name: 'Anand Kumar', phone: '9789012345', idType: 'PAN', idNumber: 'ABCDE1234F', isPrimary: true, createdAt: '' },
        ],
        statusHistory: [
          { id: 'h-4', bookingId: 'bkg-1042', status: 'CHECKED_IN', note: 'Checked in on 26 Aug', createdAt: '2026-08-26T15:00:00Z' },
        ],
        createdAt: '2026-08-26T15:00:00Z',
        updatedAt: todayStr,
      },
      {
        id: 'bkg-0980',
        bookingNumber: 'AR-BKG-0980',
        userId: 'user-1',
        roomId: 'room-201',
        checkIn: '2026-07-10',
        checkOut: '2026-07-12',
        status: 'CHECKED_OUT',
        adultsCount: 2,
        childrenCount: 0,
        subtotal: 3600,
        taxAmount: 432,
        discountAmount: 300,
        totalAmount: 3732,
        advancePaid: 3732,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        extras: [],
        checkedInAt: '2026-07-10T14:00:00Z',
        checkedOutAt: '2026-07-12T11:00:00Z',
        user: { id: 'user-1', name: 'Sundar Rajan', phone: '9876543210' },
        room: initialRooms.find((r) => r.id === 'room-201'),
        guests: [{ id: 'g-5', bookingId: 'bkg-0980', name: 'Sundar Rajan', isPrimary: true, createdAt: '' }],
        statusHistory: [
          { id: 'h-5', bookingId: 'bkg-0980', status: 'CHECKED_OUT', note: 'Checked out successfully', createdAt: '2026-07-12T11:00:00Z' },
        ],
        createdAt: '2026-07-10T14:00:00Z',
        updatedAt: '2026-07-12T11:00:00Z',
      },
    ];
    setBookings(initialBookings);

    setMaintenanceTickets([
      {
        id: 'maint-1',
        roomId: 'room-203',
        type: 'AC',
        issue: 'AC thermostat cooling sensor fluctuation',
        issueTa: 'ஏசி சென்சார் பழுது பார்க்கப்படுகிறது',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        cost: 650,
        reportedBy: 'Receptionist Sangeetha',
        assignedTo: 'AC Tech Saravanan',
        notes: 'Capacitor replacement underway',
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, [updateRackSummary]);

  // ── STAFF ACTIONS ──────────────────────────────────────────────────────────

  // 1-Click Check-in
  const handleCheckIn = (bookingId: string) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'CHECKED_IN' as const,
          checkedInAt: new Date().toISOString(),
          statusHistory: [
            ...(b.statusHistory || []),
            {
              id: `hist-${Date.now()}`,
              bookingId: b.id,
              status: 'CHECKED_IN' as const,
              note: 'Checked in by Reception Staff. ID verified.',
              changedBy: 'Reception Staff',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return b;
    });

    setBookings(updated);

    // Update Room to OCCUPIED
    const targetBkg = bookings.find((b) => b.id === bookingId);
    if (targetBkg && targetBkg.roomId) {
      const upRooms = roomsList.map((r) => (r.id === targetBkg.roomId ? { ...r, status: 'OCCUPIED' as const } : r));
      setRoomsList(upRooms);
      updateRackSummary(upRooms, roomTypes);
    }

    setAlertBanner(`✓ Guest #${targetBkg?.bookingNumber} checked in successfully!`);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 1-Click Check-out
  const handleCheckOut = (bookingId: string) => {
    const targetBkg = bookings.find((b) => b.id === bookingId);
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'CHECKED_OUT' as const,
          paymentStatus: 'PAID' as const,
          checkedOutAt: new Date().toISOString(),
          statusHistory: [
            ...(b.statusHistory || []),
            {
              id: `hist-${Date.now()}`,
              bookingId: b.id,
              status: 'CHECKED_OUT' as const,
              note: 'Checked out by Reception Staff. Room marked for cleaning.',
              changedBy: 'Reception Staff',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return b;
    });

    setBookings(updated);

    // Update Room to CLEANING
    if (targetBkg && targetBkg.roomId) {
      const upRooms = roomsList.map((r) => (r.id === targetBkg.roomId ? { ...r, status: 'CLEANING' as const } : r));
      setRoomsList(upRooms);
      updateRackSummary(upRooms, roomTypes);
    }

    setAlertBanner(`✓ Guest #${targetBkg?.bookingNumber} checked out. Room #${targetBkg?.room?.roomNumber} sent to Housekeeping Cleaning queue.`);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Room Assignment
  const handleAssignRoom = () => {
    if (!selectedBooking || !targetRoomId) return;
    const targetRoom = roomsList.find((r) => r.id === targetRoomId);
    if (!targetRoom) return;

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          roomId: targetRoom.id,
          room: targetRoom,
          statusHistory: [
            ...(b.statusHistory || []),
            {
              id: `hist-${Date.now()}`,
              bookingId: b.id,
              status: b.status,
              note: `Room assigned to #${targetRoom.roomNumber}`,
              changedBy: 'Reception Staff',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return b;
    });

    setBookings(updated);
    setShowAssignRoomModal(false);
    setAlertBanner(`✓ Room #${targetRoom.roomNumber} assigned to Booking #${selectedBooking.bookingNumber}`);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Room Transfer / Change during stay
  const handleRoomChange = () => {
    if (!selectedBooking || !targetRoomId || !roomChangeReason.trim()) {
      alert('Please select a target room and provide a reason for the transfer.');
      return;
    }

    const targetRoom = roomsList.find((r) => r.id === targetRoomId);
    if (!targetRoom) return;

    const oldRoomId = selectedBooking.roomId;

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          roomId: targetRoom.id,
          room: targetRoom,
          statusHistory: [
            ...(b.statusHistory || []),
            {
              id: `hist-${Date.now()}`,
              bookingId: b.id,
              status: b.status,
              note: `Room Transfer to #${targetRoom.roomNumber}. Reason: ${roomChangeReason}`,
              changedBy: 'Reception Staff',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return b;
    });

    setBookings(updated);

    // Old room becomes CLEANING, new room becomes OCCUPIED
    const upRooms = roomsList.map((r) => {
      if (r.id === oldRoomId) return { ...r, status: 'CLEANING' as const };
      if (r.id === targetRoom.id) return { ...r, status: 'OCCUPIED' as const };
      return r;
    });
    setRoomsList(upRooms);
    updateRackSummary(upRooms, roomTypes);

    setShowChangeRoomModal(false);
    setRoomChangeReason('');
    setAlertBanner(`✓ Guest successfully transferred to Room #${targetRoom.roomNumber}. Old room marked for cleaning.`);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Filtered Bookings for "ALL BOOKINGS" Tab
  const filteredBookings = bookings.filter((b) => {
    if (selectedStatusFilter !== 'ALL' && b.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.bookingNumber.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.user?.phone?.includes(q) ||
        b.room?.roomNumber.includes(q)
      );
    }
    return true;
  });

  // Today's counts
  const todaysArrivals = bookings.filter((b) => b.checkIn === todayStr && (b.status === 'CONFIRMED' || b.status === 'PENDING'));
  const todaysDepartures = bookings.filter((b) => b.checkOut === todayStr && b.status === 'CHECKED_IN');
  const inHouseList = bookings.filter((b) => b.status === 'CHECKED_IN');

  return (
    <div className="min-h-screen bg-[#070D18] text-[#F1F5F9] font-sans antialiased pb-20">
      {/* ── TOP HEADER ── */}
      <header className="border-b border-[#1E293B] bg-[#0A1324]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#B37D00] flex items-center justify-center font-bold text-[#070D18] text-lg shadow-lg shadow-[#3B82F6]/20">
              AR
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {t('Ashok Raj Lodge Front Desk', 'அசோக் ராஜ் தங்குமிடம் வரவேற்பறை')}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/40 font-semibold">
                  PHASE 11
                </span>
              </h1>
              <p className="text-xs text-[#94A3B8]">
                {t('PostgreSQL Double-Booking Lock & Front Desk Hub', 'இரட்டை முன்பதிவு தடுப்பு & வரவேற்பறை மேலாண்மை')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bilingual Toggle */}
            <button
              onClick={() => setLang(lang === 'EN' ? 'TA' : 'EN')}
              className="px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B]/70 text-xs font-semibold text-[#E2E8F0] hover:bg-[#334155] transition flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>{lang === 'EN' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── ALERT BANNER ── */}
      {alertBanner && (
        <div className="bg-[#10B981]/20 border-b border-[#10B981]/40 text-[#34D399] px-6 py-3 text-center text-sm font-semibold animate-fade-in">
          {alertBanner}
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Navigation Tabs */}
        <div className="flex border-b border-[#1E293B] gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'TODAY', label: t("Today's Front Desk", 'இன்றைய வரவேற்பறை'), badge: todaysArrivals.length + todaysDepartures.length },
            { key: 'BOOKINGS', label: t('All Bookings', 'அனைத்து முன்பதிவுகள்'), badge: bookings.length },
            { key: 'RACK', label: t('Floor Rack & Inventory', 'அறை பட்டியல் & நிலை') },
            { key: 'ROOM_TYPES', label: t('Room Types', 'அறை வகைகள்') },
            { key: 'MAINTENANCE', label: t('Maintenance', 'பராமரிப்பு'), badge: maintenanceTickets.length },
            { key: 'POLICIES', label: t('Policies & Reminders', 'கொள்கைகள் & நினைவூட்டல்') },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-[#1E293B] text-[#3B82F6] border-b-2 border-[#3B82F6]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/40'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#334155] text-[10px] text-white font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: TODAY'S FRONT DESK (ARRIVALS, DEPARTURES, IN-HOUSE)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'TODAY' && (
          <div>
            {/* Quick KPI Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8] uppercase font-bold">{t('Expected Arrivals', 'வரவேற்க வேண்டியவர்கள்')}</span>
                <div className="text-2xl font-black text-[#3B82F6] mt-1">{todaysArrivals.length}</div>
                <div className="text-[11px] text-[#64748B] mt-1">{t('Check-in starting 14:00', 'மதியம் 2:00 மணி முதல்')}</div>
              </div>
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8] uppercase font-bold">{t('Expected Departures', 'வெளியேறுபவர்கள்')}</span>
                <div className="text-2xl font-black text-[#F43F5E] mt-1">{todaysDepartures.length}</div>
                <div className="text-[11px] text-[#64748B] mt-1">{t('Check-out by 11:00 AM', 'காலை 11:00 மணி வரை')}</div>
              </div>
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8] uppercase font-bold">{t('In-House Guests', 'தங்கியுள்ள விருந்தினர்கள்')}</span>
                <div className="text-2xl font-black text-[#38BDF8] mt-1">{inHouseList.length}</div>
                <div className="text-[11px] text-[#64748B] mt-1">{t('Active occupied rooms', 'செயலில் உள்ள அறைகள்')}</div>
              </div>
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8] uppercase font-bold">{t('Occupancy Rate', 'ஆக்கிரமிப்பு விகிதம்')}</span>
                <div className="text-2xl font-black text-[#34D399] mt-1">{summary?.occupancyRate || 42}%</div>
                <div className="text-[11px] text-[#64748B] mt-1">{t('14 total inventory rooms', 'மொத்தம் 14 அறைகள்')}</div>
              </div>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex gap-2 mb-4 bg-[#0A1324] p-1 rounded-xl border border-[#1E293B] w-fit">
              {[
                { key: 'ARRIVALS', label: t("Today's Arrivals", 'இன்றைய வருகைகள்'), count: todaysArrivals.length },
                { key: 'DEPARTURES', label: t("Today's Departures", 'இன்றைய வெளியேறுதல்கள்'), count: todaysDepartures.length },
                { key: 'IN_HOUSE', label: t('In-House Guests', 'தங்கியிருப்பவர்கள்'), count: inHouseList.length },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setTodaySubTab(st.key as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    todaySubTab === st.key ? 'bg-[#3B82F6] text-[#070D18]' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${todaySubTab === st.key ? 'bg-[#070D18] text-[#3B82F6]' : 'bg-[#1E293B] text-white'}`}>
                    {st.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Sub-tab 1: ARRIVALS ── */}
            {todaySubTab === 'ARRIVALS' && (
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🛬</span> {t("Today's Arrivals Roster", 'இன்றைய வருகை பட்டியல்')}
                  </h3>
                  <span className="text-xs text-[#94A3B8]">{todayStr}</span>
                </div>

                {todaysArrivals.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B] text-xs">
                    {t('No pending arrivals for today', 'இன்று வருகை எதுவும் நிலுவையில் இல்லை')}
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E293B]">
                    {todaysArrivals.map((bkg) => (
                      <div key={bkg.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#1E293B]/20 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">#{bkg.bookingNumber}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/30">
                              {bkg.status}
                            </span>
                            <span className="text-xs font-semibold text-[#3B82F6]">
                              Room #{bkg.room?.roomNumber || 'Unassigned'} ({lang === 'TA' ? bkg.room?.type?.nameTa : bkg.room?.type?.name})
                            </span>
                          </div>
                          <div className="text-xs text-[#CBD5E1] mt-1 font-semibold">
                            👤 {bkg.user?.name} • 📞 {bkg.user?.phone} • 👥 {bkg.adultsCount} Guests
                          </div>
                          <div className="text-[11px] text-[#94A3B8] mt-0.5">
                            📅 {bkg.checkIn} → {bkg.checkOut} •  Advance: ₹{bkg.advancePaid} / Total: ₹{bkg.totalAmount}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <button
                            onClick={() => {
                              setSelectedBooking(bkg);
                              setShowAssignRoomModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B] text-xs font-bold text-[#E2E8F0] hover:bg-[#334155] transition"
                          >
                            {t('Assign Room', 'அறை ஒதுக்கு')}
                          </button>
                          <button
                            onClick={() => handleCheckIn(bkg.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition shadow-lg shadow-[#10B981]/20 flex items-center gap-1.5"
                          >
                            <span>✓</span>
                            <span>{t('1-Click Check-In', 'உள்நுழைவு செய்')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Sub-tab 2: DEPARTURES ── */}
            {todaySubTab === 'DEPARTURES' && (
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🛫</span> {t("Today's Departures & Folio Settlement", 'இன்றைய வெளியேறுதல்கள் & பில் கணக்கு')}
                  </h3>
                </div>

                {todaysDepartures.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B] text-xs">
                    {t('No departures scheduled for today', 'இன்று வெளியேறும் முன்பதிவுகள் இல்லை')}
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E293B]">
                    {todaysDepartures.map((bkg) => (
                      <div key={bkg.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#1E293B]/20 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">#{bkg.bookingNumber}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#BAE6FD] border border-[#38BDF8]/30">
                              Room #{bkg.room?.roomNumber}
                            </span>
                            <span className="text-xs text-[#CBD5E1] font-semibold">
                              👤 {bkg.user?.name} (📞 {bkg.user?.phone})
                            </span>
                          </div>
                          <div className="text-[11px] text-[#94A3B8] mt-1">
                            Stay: {bkg.checkIn} → {bkg.checkOut} • Folio: ₹{bkg.totalAmount} (Settled: ₹{bkg.advancePaid})
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCheckOut(bkg.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-bold transition shadow-lg shadow-[#F43F5E]/20 flex items-center gap-1.5"
                          >
                            <span>✓</span>
                            <span>{t('Check-Out & Clean Room', 'வெளியேறி சுத்தம் செய்')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Sub-tab 3: IN-HOUSE GUESTS ── */}
            {todaySubTab === 'IN_HOUSE' && (
              <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span></span> {t('In-House Guest Registry & Transfers', 'தங்கியுள்ள விருந்தினர்கள் & அறை மாற்றம்')}
                  </h3>
                </div>

                <div className="divide-y divide-[#1E293B]">
                  {inHouseList.map((bkg) => (
                    <div key={bkg.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#1E293B]/20 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">#{bkg.bookingNumber}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30">
                            Room #{bkg.room?.roomNumber}
                          </span>
                          <span className="text-xs text-[#E2E8F0] font-semibold">
                            👤 {bkg.user?.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] mt-1">
                          Stay: {bkg.checkIn} → {bkg.checkOut} • Special: {bkg.specialRequests || 'None'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(bkg);
                            setShowChangeRoomModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-xs font-bold text-[#BAE6FD] hover:bg-[#38BDF8]/20 transition"
                        >
                          {t('Change Room', 'அறை மாற்று')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: ALL BOOKINGS LEDGER & SEARCH
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'BOOKINGS' && (
          <div>
            {/* Filter & Search Bar */}
            <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by Booking #, Guest name, Phone, Room #...', 'முன்பதிவு எண், பெயர், தொலைபேசி எண் மூலம் தேடுங்கள்...')}
                  className="w-full bg-[#0A1324] border border-[#334155] rounded-lg px-4 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      selectedStatusFilter === st ? 'bg-[#3B82F6] text-[#070D18]' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A1324] text-[#94A3B8] uppercase text-[10px] font-bold border-b border-[#1E293B]">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Guest Info</th>
                    <th className="px-4 py-3">Room & Type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {filteredBookings.map((bkg) => (
                    <tr key={bkg.id} className="hover:bg-[#1E293B]/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-white">#{bkg.bookingNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#E2E8F0]">{bkg.user?.name}</div>
                        <div className="text-[11px] text-[#64748B]">{bkg.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#3B82F6]">Room #{bkg.room?.roomNumber || '-'}</span>
                        <div className="text-[10px] text-[#94A3B8]">{lang === 'TA' ? bkg.room?.type?.nameTa : bkg.room?.type?.name}</div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#CBD5E1]">
                        {bkg.checkIn} → {bkg.checkOut}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        ₹{bkg.totalAmount}
                        <div className="text-[10px] text-[#10B981]">Paid: ₹{bkg.advancePaid}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E293B] border border-[#334155]">
                          {bkg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bkg.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCheckIn(bkg.id)}
                              className="px-2.5 py-1 rounded bg-[#10B981] text-white text-[11px] font-bold"
                            >
                              Check-In
                            </button>
                          )}
                          {bkg.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleCheckOut(bkg.id)}
                              className="px-2.5 py-1 rounded bg-[#F43F5E] text-white text-[11px] font-bold"
                            >
                              Check-Out
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBooking(bkg)}
                            className="px-2.5 py-1 rounded bg-[#334155] text-[#E2E8F0] text-[11px] font-semibold"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: FLOOR RACK OVERVIEW
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'RACK' && (
          <div>
            {summary && (
              <div className="space-y-6">
                {summary.floors.map((floor) => (
                  <div key={floor.floorNumber} className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>🏢</span> {floor.floorName}
                      </h3>
                      <span className="text-xs text-[#94A3B8] font-mono">{floor.rooms.length} Rooms</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {floor.rooms.map((room) => {
                        const cfg = STATUS_CONFIG[room.status];
                        return (
                          <div
                            key={room.id}
                            className={`p-3.5 rounded-xl border ${cfg.bg} ${cfg.border} transition flex flex-col justify-between`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-black text-white font-mono">#{room.roomNumber}</span>
                              <span className="text-xs">{cfg.icon}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-[#CBD5E1] mt-1">
                              {lang === 'TA' ? room.type?.nameTa : room.type?.name}
                            </div>
                            <div className="mt-3 pt-2 border-t border-[#334155]/40 flex justify-between items-center">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                                {lang === 'TA' ? cfg.labelTa : cfg.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: ROOM TYPES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ROOM_TYPES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roomTypes.map((rt) => (
              <div key={rt.id} className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-white">{lang === 'TA' ? rt.nameTa : rt.name}</h3>
                    <span className="text-lg font-black text-[#3B82F6]">₹{rt.basePrice}</span>
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-1">{rt.bedType} • Max {rt.maxOccupancy} Guests</div>
                  <p className="text-xs text-[#CBD5E1] mt-3 line-clamp-3 leading-relaxed">
                    {lang === 'TA' ? rt.descriptionTa : rt.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1E293B] flex flex-wrap gap-1.5">
                  {(lang === 'TA' ? (rt.amenitiesTa || rt.amenities) : rt.amenities).map((am, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#1E293B] text-[10px] text-[#94A3B8]">
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: MAINTENANCE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'MAINTENANCE' && (
          <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
               {t('Room Maintenance Tickets', 'அறை பராமரிப்பு கோரிக்கைகள்')}
            </h3>
            <div className="divide-y divide-[#1E293B]">
              {maintenanceTickets.map((m) => (
                <div key={m.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white text-xs">Room #{m.roomId.replace('room-', '')} • {m.type}</span>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{lang === 'TA' ? m.issueTa || m.issue : m.issue}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#F97316]/20 text-[#FDBA74] border border-[#F97316]/30">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: POLICIES & REMINDERS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'POLICIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                📜 {t('Lodge Policies', 'தங்குமிடம் கொள்கைகள்')}
              </h3>
              <div className="space-y-3 text-xs text-[#CBD5E1]">
                <div>• Check-In Time: <span className="font-bold text-white">14:00 (2:00 PM)</span></div>
                <div>• Check-Out Time: <span className="font-bold text-white">11:00 (11:00 AM)</span></div>
                <div>• Cancellation: <span className="font-bold text-white">24-Hour Free Cancellation (50% thereafter)</span></div>
                <div>• GST: <span className="font-bold text-white">12% Room Tariff GST</span></div>
              </div>
            </div>

            <div className="bg-[#0D1829] border border-[#1E293B] rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                 {t('Automated Guest Reminders', 'தானியங்கி நினைவூட்டல் அமைப்புகள்')}
              </h3>
              <div className="space-y-2 text-xs text-[#94A3B8]">
                <div className="p-3 bg-[#0A1324] rounded-lg border border-[#1E293B]">
                  <span className="font-bold text-[#3B82F6]">24 Hours Prior:</span> WhatsApp message with check-in details & directions.
                </div>
                <div className="p-3 bg-[#0A1324] rounded-lg border border-[#1E293B]">
                  <span className="font-bold text-[#3B82F6]">2 Hours Prior:</span> Digital express check-in QR code.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── ASSIGN ROOM MODAL ── */}
      {showAssignRoomModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1829] border border-[#1E293B] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              {t('Assign Physical Room', 'அறை ஒதுக்குதல்')}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Booking #{selectedBooking.bookingNumber} • {selectedBooking.user?.name}
            </p>

            <label className="text-xs text-[#CBD5E1] font-semibold block mb-1">Select Clean / Available Room</label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full bg-[#0A1324] border border-[#334155] rounded-lg p-2 text-xs text-white mb-4"
            >
              <option value="">-- Choose Room --</option>
              {roomsList
                .filter((r) => r.status === 'AVAILABLE' || r.status === 'INSPECTED' || r.status === 'RESERVED')
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} ({r.type?.name || r.typeId}) - {r.status}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAssignRoomModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1E293B] text-xs font-semibold text-[#94A3B8]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRoom}
                className="px-4 py-2 rounded-lg bg-[#3B82F6] text-[#070D18] text-xs font-bold"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE ROOM MODAL ── */}
      {showChangeRoomModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1829] border border-[#1E293B] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              {t('Mid-Stay Room Transfer', 'தங்கியிருக்கும் போது அறை மாற்றம்')}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Current Room: #{selectedBooking.room?.roomNumber} • Guest: {selectedBooking.user?.name}
            </p>

            <label className="text-xs text-[#CBD5E1] font-semibold block mb-1">Target Clean Room</label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full bg-[#0A1324] border border-[#334155] rounded-lg p-2 text-xs text-white mb-3"
            >
              <option value="">-- Select Destination Room --</option>
              {roomsList
                .filter((r) => r.status === 'AVAILABLE' || r.status === 'INSPECTED')
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} ({r.type?.name || r.typeId}) - {r.status}
                  </option>
                ))}
            </select>

            <label className="text-xs text-[#CBD5E1] font-semibold block mb-1">Reason for Transfer *</label>
            <input
              type="text"
              value={roomChangeReason}
              onChange={(e) => setRoomChangeReason(e.target.value)}
              placeholder="e.g. Guest requested upper floor view / AC maintenance"
              className="w-full bg-[#0A1324] border border-[#334155] rounded-lg p-2 text-xs text-white mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowChangeRoomModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1E293B] text-xs font-semibold text-[#94A3B8]"
              >
                Cancel
              </button>
              <button
                onClick={handleRoomChange}
                className="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#070D18] text-xs font-bold"
              >
                Transfer Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
