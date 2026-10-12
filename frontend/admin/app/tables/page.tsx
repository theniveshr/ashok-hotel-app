'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '@/utils/config';

interface TableSession {
  tableId: string;
  tableNumber: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  seatedAt: string;
  ordersCount?: number;
  totalAmount?: number;
  reservationNumber?: string;
}

interface TableReservation {
  id: string;
  reservationNumber: string;
  userId?: string;
  tableId: string;
  tableNumber: string;
  tableName: string;
  tableNameTa: string;
  branchId: string;
  guestCount: number;
  reservationDate: string;
  timeSlot: string;
  seatingArea: string;
  guestName: string;
  guestPhone: string;
  specialRequests?: string;
  status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  allocatedAt: string;
  createdAt: string;
}

interface TableItem {
  id: string;
  tableNumber: string;
  branchId: string;
  floor: number;
  capacity: number;
  isAc: boolean;
  seatingArea: 'AC_HALL' | 'MAIN_HALL' | 'FAMILY_SECTION' | 'ROOFTOP';
  name: string;
  nameTa: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  qrToken?: string;
  qrDeepLink?: string;
  activeReservation?: TableReservation | null;
  activeSession?: TableSession | null;
}

export default function TableManagementPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'FLOOR' | 'RESERVATIONS'>('FLOOR');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Modals
  const [seatingTable, setSeatingTable] = useState<TableItem | null>(null);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinCount, setWalkinCount] = useState('2');

  const [qrModalTable, setQrModalTable] = useState<TableItem | null>(null);

  const t = {
    en: {
      title: 'Live Dining & Table Operations',
      subtitle: 'Ashok Raj Groups — Floor-by-Floor Live Allocation & Reservation Console',
      floorTab: 'Floor Plan Layout',
      resTab: 'Online Reservations Queue',
      allFloors: 'All Floors',
      floor1: 'Ground Floor (A/C & Main)',
      floor2: '1st Floor (Family Suites)',
      floor3: '2nd Floor (Rooftop Garden)',
      allAreas: 'All Areas',
      acHall: 'A/C Hall',
      mainHall: 'Main Hall',
      family: 'Family Section',
      rooftop: 'Rooftop Garden',
      statusAvailable: 'Available',
      statusOccupied: 'Occupied',
      statusReserved: 'Reserved',
      statusCleaning: 'Cleaning',
      seatGuest: 'Seat Walk-in',
      seatReserved: 'Seat Guest',
      clearTable: 'Clear & Clean',
      markAvailable: 'Mark Ready',
      viewQr: 'QR Token',
      guestCapacity: 'Guests',
      seatedSince: 'Seated',
      reservationFor: 'Reserved for',
      modalSeatTitle: 'Seat Guests at Table',
      guestName: 'Guest Name',
      mobileNumber: 'Mobile Number',
      partySize: 'Number of Guests',
      confirmSeat: 'Confirm Seating',
      cancel: 'Cancel',
      close: 'Close',
      liveSync: 'LIVE SYNCED',
      offline: 'OFFLINE',
    },
    ta: {
      title: 'நேரலை மேஜை நிர்வாகம் & கட்டுப்பாட்டகம்',
      subtitle: 'அசோக் ராஜ் உணவகம் — தளம் வாரியாக மேஜை ஒதுக்கீடு மற்றும் முன்பதிவு',
      floorTab: 'மேஜை தள அமைப்பு',
      resTab: 'ஆன்லைன் முன்பதிவுகள்',
      allFloors: 'அனைத்து தளங்கள்',
      floor1: 'தரைத்தளம் (A/C & மெயின்)',
      floor2: 'முதல் தளம் (குடும்ப சூட்)',
      floor3: 'இரண்டாம் தளம் (ரூஃப்டாப்)',
      allAreas: 'அனைத்து பகுதிகள்',
      acHall: 'A/C ஹால்',
      mainHall: 'மெயின் ஹால்',
      family: 'குடும்ப பகுதி',
      rooftop: 'ரூஃப்டாப் தோட்டம்',
      statusAvailable: 'காலியாக உள்ளது',
      statusOccupied: 'விருந்தினர் உள்ளனர்',
      statusReserved: 'முன்பதிவு செய்யப்பட்டுள்ளது',
      statusCleaning: 'சுத்தம் செய்யப்படுகிறது',
      seatGuest: 'விருந்தினரை அமர்த்த',
      seatReserved: 'அழைத்து அமர்த்த',
      clearTable: 'சுத்தம் செய்',
      markAvailable: 'தயார் செய்',
      viewQr: 'QR குறியீடு',
      guestCapacity: 'இருக்கைகள்',
      seatedSince: 'அமர்ந்த நேரம்',
      reservationFor: 'முன்பதிவு செய்தவர்',
      modalSeatTitle: 'மேஜையில் விருந்தினரை அமர்த்துக',
      guestName: 'விருந்தினர் பெயர்',
      mobileNumber: 'கைபேசி எண்',
      partySize: 'நபர்களின் எண்ணிக்கை',
      confirmSeat: 'அமர்த்தலை உறுதிசெய்',
      cancel: 'ரத்து',
      close: 'மூடுக',
      liveSync: 'நேரலை இணைப்பில்',
      offline: 'இணைப்பில்லை',
    },
  }[lang];

  // Fetch Tables & Reservations from API
  const fetchData = useCallback(async () => {
    try {
      const [tblRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/dine-in/tables`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/api/v1/admin/dine-in/reservations`, {
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      if (tblRes.ok) {
        const json = await tblRes.json();
        if (json.success && Array.isArray(json.data)) {
          setTables(json.data);
          setIsConnected(true);
        }
      }

      if (resRes.ok) {
        const json = await resRes.json();
        if (json.success && Array.isArray(json.data)) {
          setReservations(json.data);
        }
      }
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Actions
  const handleUpdateStatus = async (tableId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dine-in/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSeatWalkin = async () => {
    if (!seatingTable) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dine-in/tables/${seatingTable.id}/seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: walkinName.trim() || 'Walk-in Guest',
          guestPhone: walkinPhone.trim(),
          guestCount: parseInt(walkinCount, 10) || 2,
        }),
      });

      if (res.ok) {
        setSeatingTable(null);
        setWalkinName('');
        setWalkinPhone('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to seat guest', err);
    }
  };

  const handleClearTable = async (tableId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dine-in/tables/${tableId}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to clear table', err);
    }
  };

  const handleReservationStatus = async (resId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dine-in/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update reservation status', err);
    }
  };

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (selectedFloor !== 'ALL' && t.floor !== selectedFloor) return false;
      if (selectedArea !== 'ALL' && t.seatingArea !== selectedArea) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      return true;
    });
  }, [tables, selectedFloor, selectedArea, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === 'AVAILABLE').length;
    const occupied = tables.filter((t) => t.status === 'OCCUPIED').length;
    const reserved = tables.filter((t) => t.status === 'RESERVED').length;
    const cleaning = tables.filter((t) => t.status === 'CLEANING').length;
    const activeResCount = reservations.filter((r) => r.status === 'CONFIRMED').length;
    return { total, available, occupied, reserved, cleaning, activeResCount };
  }, [tables, reservations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OCCUPIED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESERVED':
        return 'bg-blue-50 text-[#2563EB] border-[#BFDBFE]';
      case 'CLEANING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* Top Header Bar */}
      <header className="border-b border-[#E2E8F0] bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-[#2563EB] flex items-center justify-center font-black text-white text-lg shadow-sm">
            AR
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#0F172A] flex items-center gap-2">
              {t.title}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]">
                KALAIYARKOIL
              </span>
            </h1>
            <p className="text-xs text-[#64748B]">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live WS Pill */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {isConnected ? t.liveSync : t.offline}
          </span>

          {/* Lang Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold border border-[#CBD5E1] text-[#0F172A] transition-colors"
          >
            {lang === 'en' ? 'தமிழ் (TA)' : 'English (EN)'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Real-time KPI Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Tables</span>
            <div className="text-2xl font-black text-[#0F172A] mt-1">{stats.total}</div>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">{t.statusAvailable}</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.available}</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{t.statusOccupied}</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.occupied}</div>
          </div>
          <div className="bg-white border border-[#BFDBFE] rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">{t.statusReserved}</span>
            <div className="text-2xl font-black text-[#2563EB] mt-1">{stats.reserved}</div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{t.statusCleaning}</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.cleaning}</div>
          </div>
          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]/40 border border-[#BFDBFE] rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Online Booking Queue</span>
            <div className="text-2xl font-black text-[#0F172A] mt-1">{stats.activeResCount}</div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-[#E2E8F0] gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('FLOOR')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'FLOOR'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>🍽️ {t.floorTab}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-xs font-extrabold text-[#2563EB]">
              {tables.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'RESERVATIONS'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>📅 {t.resTab}</span>
            {stats.activeResCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-xs font-black text-white">
                {stats.activeResCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'FLOOR' ? (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              {/* Floor Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#64748B] font-bold uppercase mr-1">Floor:</span>
                {[
                  { id: 'ALL', label: t.allFloors },
                  { id: 1, label: t.floor1 },
                  { id: 2, label: t.floor2 },
                  { id: 3, label: t.floor3 },
                ].map((fl) => (
                  <button
                    key={fl.id}
                    onClick={() => setSelectedFloor(fl.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedFloor === fl.id
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>

              {/* Status & Area Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="bg-white border border-[#CBD5E1] text-xs text-[#0F172A] rounded-lg px-3 py-1.5 font-bold focus:outline-none"
                >
                  <option value="ALL">{t.allAreas}</option>
                  <option value="AC_HALL">{t.acHall}</option>
                  <option value="MAIN_HALL">{t.mainHall}</option>
                  <option value="FAMILY_SECTION">{t.family}</option>
                  <option value="ROOFTOP">{t.rooftop}</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-[#CBD5E1] text-xs text-[#0F172A] rounded-lg px-3 py-1.5 font-bold focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">{t.statusAvailable}</option>
                  <option value="OCCUPIED">{t.statusOccupied}</option>
                  <option value="RESERVED">{t.statusReserved}</option>
                  <option value="CLEANING">{t.statusCleaning}</option>
                </select>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTables.map((tbl) => (
                <div
                  key={tbl.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-sm relative ${
                    tbl.status === 'OCCUPIED'
                      ? 'border-blue-400'
                      : tbl.status === 'RESERVED'
                      ? 'border-blue-300'
                      : tbl.status === 'CLEANING'
                      ? 'border-amber-300'
                      : 'border-[#E2E8F0] hover:border-emerald-400'
                  }`}
                >
                  {/* Top Bar: Table Number & Status Pill */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                        {lang === 'ta' ? `மேசை ${tbl.tableNumber}` : `Table ${tbl.tableNumber}`}
                      </span>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5">
                        {lang === 'ta' ? tbl.nameTa : tbl.name}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${getStatusColor(tbl.status)}`}>
                      {tbl.status === 'AVAILABLE'
                        ? t.statusAvailable
                        : tbl.status === 'OCCUPIED'
                        ? t.statusOccupied
                        : tbl.status === 'RESERVED'
                        ? t.statusReserved
                        : t.statusCleaning}
                    </span>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] font-bold text-[#475569]">
                      👥 {tbl.capacity} {t.guestCapacity}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] font-bold text-[#475569]">
                      🏢 {tbl.floor === 1 ? 'Floor 1' : tbl.floor === 2 ? 'Floor 2' : 'Floor 3'}
                    </span>
                    {tbl.isAc ? (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-[11px] font-bold text-cyan-700 border border-cyan-200">
                        ❄️ A/C
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] font-bold text-[#64748B]">
                        Non-A/C
                      </span>
                    )}
                  </div>

                  {/* Dynamic Status Detail Box */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4 text-xs space-y-1.5 border border-[#E2E8F0]">
                    {tbl.status === 'OCCUPIED' ? (
                      <>
                        <div className="flex justify-between text-[#64748B]">
                          <span>{t.guestName}:</span>
                          <span className="font-bold text-[#0F172A]">{tbl.activeSession?.guestName || 'Seated Guests'}</span>
                        </div>
                        <div className="flex justify-between text-[#64748B]">
                          <span>Party Size:</span>
                          <span className="font-bold text-[#0F172A]">{tbl.activeSession?.guestCount || 2} persons</span>
                        </div>
                        {tbl.activeSession?.seatedAt && (
                          <div className="flex justify-between text-[#64748B]">
                            <span>{t.seatedSince}:</span>
                            <span className="font-bold text-blue-600">
                              {new Date(tbl.activeSession.seatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </>
                    ) : tbl.status === 'RESERVED' && tbl.activeReservation ? (
                      <>
                        <div className="flex justify-between text-[#64748B]">
                          <span>{t.reservationFor}:</span>
                          <span className="font-bold text-[#2563EB]">{tbl.activeReservation.guestName}</span>
                        </div>
                        <div className="flex justify-between text-[#64748B]">
                          <span>Slot:</span>
                          <span className="font-bold text-[#0F172A]">{tbl.activeReservation.timeSlot}</span>
                        </div>
                        <div className="flex justify-between text-[#64748B]">
                          <span>Code:</span>
                          <span className="font-mono text-[10px] text-gray-500">{tbl.activeReservation.reservationNumber}</span>
                        </div>
                      </>
                    ) : tbl.status === 'CLEANING' ? (
                      <div className="text-amber-600 font-semibold text-center py-1">
                        🧹 Sanitization in progress
                      </div>
                    ) : (
                      <div className="text-emerald-600 font-semibold text-center py-1">
                        ✨ Clean & Ready for walk-in
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {tbl.status === 'AVAILABLE' ? (
                      <>
                        <button
                          onClick={() => setSeatingTable(tbl)}
                          className="px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black transition-colors"
                        >
                          {t.seatGuest}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(tbl.id, 'CLEANING')}
                          className="px-3 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-bold transition-colors"
                        >
                          Clean
                        </button>
                      </>
                    ) : tbl.status === 'OCCUPIED' ? (
                      <>
                        <button
                          onClick={() => handleClearTable(tbl.id)}
                          className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors"
                        >
                          {t.clearTable}
                        </button>
                        <button
                          onClick={() => setQrModalTable(tbl)}
                          className="px-3 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold transition-colors"
                        >
                          {t.viewQr}
                        </button>
                      </>
                    ) : tbl.status === 'RESERVED' ? (
                      <>
                        <button
                          onClick={() => {
                            if (tbl.activeReservation) {
                              handleReservationStatus(tbl.activeReservation.id, 'SEATED');
                            } else {
                              handleUpdateStatus(tbl.id, 'OCCUPIED');
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black transition-colors"
                        >
                          {t.seatReserved}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(tbl.id, 'AVAILABLE')}
                          className="px-3 py-2 rounded-xl bg-[#F1F5F9] text-[#64748B] text-xs font-bold hover:text-[#0F172A]"
                        >
                          Release
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(tbl.id, 'AVAILABLE')}
                          className="col-span-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors"
                        >
                          {t.markAvailable}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Online Reservations Queue Tab */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">Live Customer Online Reservations</h3>
                <p className="text-xs text-[#64748B]">Submitted via customer mobile app with automatic capacity allocation</p>
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#BFDBFE]">
                Total: {reservations.length} records
              </span>
            </div>

            {reservations.length === 0 ? (
              <div className="p-12 text-center text-[#64748B]">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm font-bold">No active reservations found in queue.</p>
                <p className="text-xs text-[#94A3B8] mt-1">New reservations made in the mobile app appear here immediately.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Guest</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Guests</th>
                      <th className="py-3.5 px-4">Area & Table</th>
                      <th className="py-3.5 px-4">Date & Slot</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                          {res.reservationNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                          {res.guestName}
                          {res.specialRequests && (
                            <span className="block text-[10px] text-[#64748B] font-normal italic">
                              &quot;{res.specialRequests}&quot;
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#475569]">{res.guestPhone}</td>
                        <td className="py-3.5 px-4 font-bold text-[#0F172A]">{res.guestCount}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-600">Table {res.tableNumber}</span>
                          <span className="block text-[10px] text-[#64748B]">{res.seatingArea}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#0F172A]">{res.reservationDate}</span>
                          <span className="block text-[11px] text-[#2563EB] font-semibold">{res.timeSlot}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              res.status === 'CONFIRMED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : res.status === 'SEATED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : res.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {res.status === 'CONFIRMED' ? (
                            <>
                              <button
                                onClick={() => handleReservationStatus(res.id, 'SEATED')}
                                className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs transition-colors"
                              >
                                Seat Guest
                              </button>
                              <button
                                onClick={() => handleReservationStatus(res.id, 'CANCELLED')}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seat Walk-in Guest Modal */}
      {seatingTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-lg font-black text-[#0F172A]">
                {t.modalSeatTitle} {seatingTable.tableNumber}
              </h3>
              <button
                onClick={() => setSeatingTable(null)}
                className="text-[#64748B] hover:text-[#0F172A] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">{t.guestName}</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">{t.mobileNumber}</label>
                <input
                  type="text"
                  placeholder="e.g. 9842100000"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  {t.partySize} (Max capacity: {seatingTable.capacity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={seatingTable.capacity}
                  value={walkinCount}
                  onChange={(e) => setWalkinCount(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSeatingTable(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-xs"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSeatWalkin}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs transition-colors"
              >
                {t.confirmSeat}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View QR Code Token Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-[#0F172A]">Table {qrModalTable.tableNumber} QR Token</h3>
            <p className="text-xs text-[#64748B]">Customer Dine-in QR token & deep link for table orders</p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center">
              {/* Simulated visual QR symbol with Table Number */}
              <div className="text-center text-[#0F172A]">
                <div className="text-5xl font-black mb-1"># {qrModalTable.tableNumber}</div>
                <div className="text-[10px] font-mono tracking-widest uppercase">ASHOK RAJ DINE-IN</div>
                <div className="text-[9px] font-mono text-gray-500 mt-1">qr_kal_tbl_{qrModalTable.tableNumber}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-left">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">Deep Link URI:</span>
              <code className="text-xs text-[#2563EB] font-mono break-all block">
                {qrModalTable.qrDeepLink || `ashokraj://dine-in?token=qr_kal_tbl_${qrModalTable.tableNumber}`}
              </code>
            </div>

            <button
              onClick={() => setQrModalTable(null)}
              className="w-full py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-bold text-xs transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
