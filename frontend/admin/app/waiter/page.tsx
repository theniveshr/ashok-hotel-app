'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WaiterTableSummary, TableServiceRequest, WaiterOrderSummary } from '@ashok-raj/types';

export default function WaiterDashboardPage() {
  const [tables, setTables] = useState<WaiterTableSummary[]>([]);
  const [serviceRequests, setServiceRequests] = useState<(TableServiceRequest & { tableName: string; elapsedMinutes: number })[]>([]);
  const [readyOrders, setReadyOrders] = useState<WaiterOrderSummary[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OCCUPIED' | 'AVAILABLE' | 'CALLS'>('ALL');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'TABLES' | 'CALLS' | 'READY_ORDERS'>('TABLES');

  // Modal states
  const [punchingTable, setPunchingTable] = useState<WaiterTableSummary | null>(null);
  const [billingTable, setBillingTable] = useState<WaiterTableSummary | null>(null);
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [orderItemName, setOrderItemName] = useState('Seeraga Samba Mutton Biryani');
  const [orderItemQty, setOrderItemQty] = useState(1);
  const [orderItemNote, setOrderItemNote] = useState('');

  const t = {
    en: {
      title: 'Floor & Waiter Operations Hub',
      sub: 'Ashok Raj Lodge & Restaurant — Live Table & Guest Service',
      tablesTab: 'Floor Tables',
      callsTab: 'Guest Calls',
      readyTab: 'Ready to Serve',
      floorAll: 'All Floors',
      floor1: 'Ground / Floor 1',
      floor2: 'A/C Family / Floor 2',
      tableAvailable: 'Available',
      tableOccupied: 'Occupied',
      tableReserved: 'Reserved',
      tableCleaning: 'Cleaning',
      serviceCallAlert: 'Active Guest Calls',
      readyFoodAlert: 'Kitchen Dishes Ready for Pickup',
      guests: 'Guests',
      activeOrder: 'Orders',
      total: 'Bill Total',
      sessionTime: 'Active',
      mins: 'mins',
      takeOrder: '+ Take Order',
      settleBill: 'Settle Bill',
      markClean: 'Mark Clean / Available',
      acknowledge: 'Acknowledge',
      markServed: 'Mark Delivered to Table',
      resolveCall: 'Resolve Call',
      callType: {
        CALL_WAITER: ' Waiter Needed',
        WATER: 'Water Request',
        ASSISTANCE: '🙋 Assistance Needed',
        BILL: ' Bill Requested',
        CUTLERY: '🍴 Cutlery / Plates',
        CLEAN_TABLE: '🧹 Clean Table',
      },
      close: 'Close',
      dispatchKitchen: 'Send to Kitchen',
      finalizePayment: 'Confirm Settlement',
      live: 'LIVE WS',
      offline: 'OFFLINE',
    },
    ta: {
      title: 'உணவக பரிமாறுநர் கட்டுப்பாட்டகம்',
      sub: 'அசோக் ராஜ் உணவகம் — நேரலை மேஜை மற்றும் விருந்தினர் சேவை',
      tablesTab: 'மேஜைகள்',
      callsTab: 'விருந்தினர் அழைப்புகள்',
      readyTab: 'பரிமாற தயார்',
      floorAll: 'அனைத்து தளங்கள்',
      floor1: 'தரைத்தளம் / தளம் 1',
      floor2: 'குளிரூட்டப்பட்ட குடும்ப தளம் 2',
      tableAvailable: 'காலியாக உள்ளது',
      tableOccupied: 'விருந்தினர்கள் உள்ளனர்',
      tableReserved: 'முன்பதிவு',
      tableCleaning: 'சுத்தம் செய்யப்படுகிறது',
      serviceCallAlert: 'செயலில் உள்ள அழைப்புகள்',
      readyFoodAlert: 'பரிமாற தயார் நிலையில் உள்ள உணவுகள்',
      guests: 'நபர்கள்',
      activeOrder: 'ஆர்டர்கள்',
      total: 'மொத்த பில்',
      sessionTime: 'நேரம்',
      mins: 'நிமிடம்',
      takeOrder: '+ ஆர்டர் எடு',
      settleBill: 'பில் செலுத்தவும்',
      markClean: 'சுத்தம் செய்யப்பட்டது',
      acknowledge: 'பார்த்தேன்',
      markServed: 'மேஜையில் பரிமாறப்பட்டது',
      resolveCall: 'சேவை முடிந்தது',
      callType: {
        CALL_WAITER: ' பரிமாறுநர் அழைப்பு',
        WATER: 'குடிநீர் தேவை',
        ASSISTANCE: '🙋 உதவி தேவை',
        BILL: ' பில் தேவை',
        CUTLERY: '🍴 தட்டுகள் / கரண்டிகள்',
        CLEAN_TABLE: '🧹 மேஜை சுத்தம் செய்',
      },
      close: 'மூடு',
      dispatchKitchen: 'சமையலறைக்கு அனுப்பு',
      finalizePayment: 'பில் உறுதிப்படுத்து',
      live: 'நேரலை',
      offline: 'ஆஃப்லைன்',
    },
  }[lang];

  // Synthesize audio chime for waiter alerts
  const playAlertChime = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Fetch waiter state
  const fetchData = useCallback(async () => {
    try {
      const [tblRes, reqRes, readyRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/waiter/tables', {
          headers: { 'x-staff-role': 'WAITER' },
        }),
        fetch('http://localhost:3001/api/v1/waiter/requests', {
          headers: { 'x-staff-role': 'WAITER' },
        }),
        fetch('http://localhost:3001/api/v1/waiter/orders/ready', {
          headers: { 'x-staff-role': 'WAITER' },
        }),
      ]);

      if (tblRes.ok) {
        const json = await tblRes.json();
        if (json.success) setTables(json.data);
      }
      if (reqRes.ok) {
        const json = await reqRes.json();
        if (json.success) setServiceRequests(json.data);
      }
      if (readyRes.ok) {
        const json = await readyRes.json();
        if (json.success) setReadyOrders(json.data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // WebSocket Live Sync
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      try {
        ws = new WebSocket('ws://localhost:3001/ws/operations');
        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.channel === 'waiter' || msg.event?.startsWith('waiter:') || msg.event?.startsWith('table:')) {
              if (msg.event === 'waiter:service_call' || msg.event === 'waiter:order_ready') {
                playAlertChime();
              }
              fetchData();
            }
          } catch {
            // Ignore
          }
        };
        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWS, 3000);
        };
      } catch {
        setIsConnected(false);
      }
    };

    connectWS();
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [fetchData, playAlertChime]);

  // Resolve Service Request
  const handleResolveRequest = async (requestId: string, status: 'ACKNOWLEDGED' | 'COMPLETED') => {
    try {
      await fetch(`http://localhost:3001/api/v1/waiter/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'WAITER',
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch {
      fetchData();
    }
  };

  // Mark Food Served to Table
  const handleMarkServed = async (orderId: string) => {
    try {
      await fetch(`http://localhost:3001/api/v1/waiter/orders/${orderId}/serve`, {
        method: 'PATCH',
        headers: { 'x-staff-role': 'WAITER' },
      });
      fetchData();
    } catch {
      fetchData();
    }
  };

  // Submit Table Order
  const handlePunchOrder = async () => {
    if (!punchingTable) return;
    try {
      await fetch(`http://localhost:3001/api/v1/waiter/tables/${punchingTable.id}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'WAITER',
        },
        body: JSON.stringify({
          tableId: punchingTable.id,
          items: [
            {
              menuItemId: 'mi-custom',
              name: orderItemName,
              quantity: orderItemQty,
              note: orderItemNote || undefined,
            },
          ],
          notes: orderItemNote || undefined,
        }),
      });
      setPunchingTable(null);
      setOrderItemNote('');
      fetchData();
    } catch {
      setPunchingTable(null);
    }
  };

  // Settle Bill
  const handleSettleBill = async () => {
    if (!billingTable) return;
    try {
      await fetch(`http://localhost:3001/api/v1/waiter/tables/${billingTable.id}/bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'WAITER',
        },
        body: JSON.stringify({
          tableId: billingTable.id,
          discountAmount: parseFloat(discountAmount) || 0,
          discountReason: discountReason || undefined,
          paymentMethod,
        }),
      });
      setBillingTable(null);
      setDiscountAmount('0');
      setDiscountReason('');
      fetchData();
    } catch {
      setBillingTable(null);
    }
  };

  // Reset Table to Available
  const handleResetStatus = async (tableId: string) => {
    try {
      await fetch(`http://localhost:3001/api/v1/waiter/tables/${tableId}/reset-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'WAITER',
        },
        body: JSON.stringify({ status: 'AVAILABLE' }),
      });
      fetchData();
    } catch {
      fetchData();
    }
  };

  // Filtered tables
  const displayedTables = useMemo(() => {
    return tables.filter((t) => {
      if (selectedFloor !== 'ALL' && t.floor !== selectedFloor) return false;
      if (statusFilter === 'OCCUPIED') return t.status === 'OCCUPIED';
      if (statusFilter === 'AVAILABLE') return t.status === 'AVAILABLE';
      if (statusFilter === 'CALLS') return t.hasPendingCall;
      return true;
    });
  }, [tables, selectedFloor, statusFilter]);

  const activeCallsCount = serviceRequests.length;
  const readyOrdersCount = readyOrders.length;

  return (
    <main className="min-h-screen bg-[#070B14] text-[#F8FAFC] font-sans flex flex-col selection:bg-[#3B82F6] selection:text-black">
      {/* Header Bar */}
      <header className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center font-black text-black text-xl shadow-md">
            
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">{t.title}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  isConnected ? 'bg-[#064E3B] text-[#34D399] border border-[#059669]' : 'bg-[#7F1D1D] text-[#F87171]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-[#34D399] animate-pulse' : 'bg-[#F87171]'}`} />
                {isConnected ? t.live : t.offline}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">{t.sub}</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-[#1E293B] border-[#334155] text-[#38BDF8] hover:bg-[#334155]'
                : 'bg-[#1E293B] border-[#334155] text-[#64748B]'
            }`}
          >
            {soundEnabled ? ' Sound ON' : '🔕 Sound OFF'}
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3B82F6] text-[#0A0F1E] hover:bg-[#FBBF24] transition-colors shadow-sm"
          >
            🌐 {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>

          <a
            href="/kitchen"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:text-white hover:border-[#3B82F6] transition-colors"
          >
             Kitchen Display (KDS) →
          </a>
        </div>
      </header>

      {/* Top Banner Alert Strip if Calls or Ready Food exist */}
      {(activeCallsCount > 0 || readyOrdersCount > 0) && (
        <div className="bg-[#111C35] border-b border-[#1E293B] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {activeCallsCount > 0 && (
              <div
                onClick={() => setActiveTab('CALLS')}
                className="flex items-center space-x-2 bg-[#DC2626]/20 border border-[#EF4444] px-3 py-1 rounded-full text-xs font-extrabold text-[#FCA5A5] cursor-pointer hover:bg-[#DC2626]/30 transition-colors animate-pulse"
              >
                <span>🚨 {activeCallsCount} {t.serviceCallAlert}</span>
              </div>
            )}

            {readyOrdersCount > 0 && (
              <div
                onClick={() => setActiveTab('READY_ORDERS')}
                className="flex items-center space-x-2 bg-[#059669]/20 border border-[#10B981] px-3 py-1 rounded-full text-xs font-extrabold text-[#6EE7B7] cursor-pointer hover:bg-[#059669]/30 transition-colors"
              >
                <span> {readyOrdersCount} {t.readyFoodAlert}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Switcher & Floor Selector */}
      <section className="bg-[#0B1120] border-b border-[#1E293B] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Main Navigation Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('TABLES')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'TABLES'
                ? 'bg-[#3B82F6] text-black shadow-md'
                : 'bg-[#0F172A] text-[#94A3B8] border border-[#1E293B] hover:text-white'
            }`}
          >
            🪑 {t.tablesTab} ({tables.length})
          </button>

          <button
            onClick={() => setActiveTab('CALLS')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all ${
              activeTab === 'CALLS'
                ? 'bg-[#EF4444] text-white shadow-md'
                : 'bg-[#0F172A] text-[#94A3B8] border border-[#1E293B] hover:text-white'
            }`}
          >
            <span> {t.callsTab}</span>
            {activeCallsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-black text-[10px] font-black">
                {activeCallsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('READY_ORDERS')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all ${
              activeTab === 'READY_ORDERS'
                ? 'bg-[#10B981] text-black shadow-md'
                : 'bg-[#0F172A] text-[#94A3B8] border border-[#1E293B] hover:text-white'
            }`}
          >
            <span> {t.readyTab}</span>
            {readyOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black text-[#10B981] text-[10px] font-black">
                {readyOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Sub Filters for Tables View */}
        {activeTab === 'TABLES' && (
          <div className="flex items-center space-x-2 text-xs">
            {/* Floor selector */}
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))}
              className="bg-[#0F172A] border border-[#1E293B] text-white rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="ALL">🏢 {t.floorAll}</option>
              <option value="1">1️⃣ {t.floor1}</option>
              <option value="2">2️⃣ {t.floor2}</option>
            </select>

            {/* Status Filter */}
            <div className="flex rounded-lg border border-[#1E293B] overflow-hidden">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'OCCUPIED', label: 'Occupied' },
                { id: 'AVAILABLE', label: 'Available' },
                { id: 'CALLS', label: 'Has Calls' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-2.5 py-1.5 font-bold transition-colors ${
                    statusFilter === st.id ? 'bg-[#1E293B] text-[#3B82F6]' : 'bg-[#0F172A] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Main Tab Views */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* VIEW 1: FLOOR TABLES GRID */}
        {activeTab === 'TABLES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedTables.map((table) => {
              const isOccupied = table.status === 'OCCUPIED';
              const isCleaning = table.status === 'CLEANING';
              const isAvailable = table.status === 'AVAILABLE';

              let statusBadgeColor = 'bg-[#064E3B] text-[#34D399] border-[#059669]';
              let statusLabel = t.tableAvailable;
              let cardBorder = 'border-[#1E293B]';

              if (isOccupied) {
                statusBadgeColor = 'bg-[#1E3A8A] text-[#93C5FD] border-[#3B82F6]';
                statusLabel = t.tableOccupied;
                cardBorder = 'border-[#2563EB]/60';
              } else if (isCleaning) {
                statusBadgeColor = 'bg-[#78350F] text-[#DBEAFE] border-[#D97706]';
                statusLabel = t.tableCleaning;
                cardBorder = 'border-[#D97706]/60';
              } else if (table.status === 'RESERVED') {
                statusBadgeColor = 'bg-[#581C87] text-[#D8B4FE] border-[#9333EA]';
                statusLabel = t.tableReserved;
              }

              if (table.hasPendingCall) {
                cardBorder = 'border-[#EF4444] shadow-red-900/30';
              }

              return (
                <div
                  key={table.id}
                  className={`bg-[#0F172A] rounded-2xl border-2 ${cardBorder} p-4 flex flex-col justify-between shadow-xl transition-all hover:scale-[1.01]`}
                >
                  <div>
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-black text-white">
                          #{table.tableNumber}
                        </span>
                        {table.isAc && (
                          <span className="px-1.5 py-0.5 rounded bg-[#0284C7]/30 text-[#38BDF8] text-[10px] font-black uppercase">
                            A/C
                          </span>
                        )}
                        <span className="text-xs text-[#94A3B8]">Floor {table.floor}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${statusBadgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Active call warning banner inside card */}
                    {table.hasPendingCall && (
                      <div className="mb-3 p-2 rounded-xl bg-[#DC2626]/20 border border-[#EF4444] text-xs text-[#FCA5A5] flex items-center justify-between font-bold animate-pulse">
                        <span>
                          {(t.callType as any)[table.pendingRequests[0]?.type] || ' Guest Call'}
                        </span>
                        <button
                          onClick={() => handleResolveRequest(table.pendingRequests[0]!.id, 'COMPLETED')}
                          className="px-2 py-0.5 bg-[#EF4444] text-white rounded-lg text-[10px] hover:bg-[#DC2626]"
                        >
                          Resolve
                        </button>
                      </div>
                    )}

                    {/* Occupancy details */}
                    {isOccupied ? (
                      <div className="bg-[#1E293B]/60 rounded-xl p-3 space-y-1.5 text-xs mb-3">
                        <div className="flex justify-between text-[#94A3B8]">
                          <span>👥 {t.guests}:</span>
                          <span className="font-bold text-white">{table.guestCount || 2} persons</span>
                        </div>
                        <div className="flex justify-between text-[#94A3B8]">
                          <span> {t.sessionTime}:</span>
                          <span className="font-bold text-[#3B82F6]">{table.sessionDurationMinutes || 10} {t.mins}</span>
                        </div>
                        <div className="flex justify-between text-[#94A3B8]">
                          <span> {t.total}:</span>
                          <span className="font-black text-white text-sm">₹{table.totalAmount || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-xs text-[#64748B] italic">
                        {isCleaning ? '🧹 Table is being sanitized...' : '✨ Ready for seating new guests (Capacity: ' + table.capacity + ')'}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#1E293B] flex items-center gap-2">
                    {isOccupied && (
                      <>
                        <button
                          onClick={() => setPunchingTable(table)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-extrabold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors"
                        >
                          {t.takeOrder}
                        </button>
                        <button
                          onClick={() => {
                            setBillingTable(table);
                            setDiscountAmount('0');
                          }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-extrabold bg-[#3B82F6] hover:bg-[#FBBF24] text-black transition-colors"
                        >
                          {t.settleBill}
                        </button>
                      </>
                    )}

                    {isCleaning && (
                      <button
                        onClick={() => handleResetStatus(table.id)}
                        className="w-full py-1.5 rounded-lg text-xs font-extrabold bg-[#10B981] hover:bg-[#059669] text-black transition-colors"
                      >
                        ✅ {t.markClean}
                      </button>
                    )}

                    {isAvailable && (
                      <button
                        onClick={() => setPunchingTable(table)}
                        className="w-full py-1.5 rounded-lg text-xs font-extrabold bg-[#1E293B] border border-[#334155] text-white hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
                      >
                        🪑 Seat &amp; Take Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: GUEST CALLS QUEUE */}
        {activeTab === 'CALLS' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <span>🚨 {t.callsTab} ({serviceRequests.length})</span>
            </h2>

            {serviceRequests.length === 0 ? (
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-12 text-center text-[#94A3B8]">
                <div className="text-4xl mb-2">🎉</div>
                <h4 className="font-bold text-white text-base">All Guest Requests Resolved</h4>
                <p className="text-xs text-[#64748B] mt-1">No active table calls pending right now.</p>
              </div>
            ) : (
              serviceRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#0F172A] border-2 border-[#EF4444] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-[#DC2626]/20 border border-[#EF4444] flex items-center justify-center text-2xl font-black text-[#FCA5A5]">
                      
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-lg text-white">{req.tableName}</span>
                        <span className="px-2 py-0.5 rounded bg-[#DC2626] text-white text-xs font-bold">
                          {(t.callType as any)[req.type] || req.type}
                        </span>
                      </div>
                      {req.note && <p className="text-xs text-[#DBEAFE] mt-0.5 font-medium">💬 {req.note}</p>}
                      <span className="text-[11px] text-[#94A3B8] mt-1 block">
                         Called {req.elapsedMinutes} {t.mins} ago
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveRequest(req.id, 'ACKNOWLEDGED')}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1E293B] text-white border border-[#334155] hover:border-[#3B82F6]"
                    >
                      👍 {t.acknowledge}
                    </button>
                    <button
                      onClick={() => handleResolveRequest(req.id, 'COMPLETED')}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#10B981] hover:bg-[#059669] text-black shadow-md"
                    >
                      ✅ {t.resolveCall}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 3: READY FOOD PICKUP QUEUE */}
        {activeTab === 'READY_ORDERS' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <span> {t.readyTab} ({readyOrders.length})</span>
            </h2>

            {readyOrders.length === 0 ? (
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-12 text-center text-[#94A3B8]">
                <div className="text-4xl mb-2">👨‍</div>
                <h4 className="font-bold text-white text-base">No Orders Waiting for Pickup</h4>
                <p className="text-xs text-[#64748B] mt-1">Dishes cooked by the kitchen will appear here instantly for serving.</p>
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#0F172A] border-2 border-[#10B981] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 rounded-xl bg-[#064E3B] text-[#34D399] border border-[#059669] font-extrabold text-sm">
                         Table {ord.tableNumber || ord.roomId || '??'}
                      </span>
                      <span className="font-bold text-sm text-[#94A3B8]">{ord.orderNumber}</span>
                    </div>

                    <div className="space-y-1.5">
                      {ord.items.map((it) => (
                        <div key={it.id} className="text-xs font-bold text-white flex items-center space-x-2">
                          <span className="w-5 h-5 rounded bg-[#3B82F6] text-black text-[11px] font-black flex items-center justify-center">
                            {it.quantity}x
                          </span>
                          <span>{lang === 'ta' ? it.nameTa || it.name : it.name}</span>
                          {it.note && <span className="text-[#FBBF24] font-normal">({it.note})</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMarkServed(ord.id)}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#10B981] hover:bg-[#059669] text-black shadow-lg transition-transform active:scale-95"
                  >
                     {t.markServed}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL: TAKE ORDER TABLE-SIDE */}
      {punchingTable && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#334155] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-black text-white">
                📝 Take Order — Table #{punchingTable.tableNumber}
              </h3>
              <button
                onClick={() => setPunchingTable(null)}
                className="text-[#94A3B8] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Select Dish</label>
                <select
                  value={orderItemName}
                  onChange={(e) => setOrderItemName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Seeraga Samba Mutton Biryani">Seeraga Samba Mutton Biryani (₹320)</option>
                  <option value="Chettinad Special Chicken Biryani">Chettinad Special Chicken Biryani (₹240)</option>
                  <option value="Nattu Kozhi Chettinad Gravy">Nattu Kozhi Chettinad Gravy (₹280)</option>
                  <option value="Madurai Bun Parotta (Set of 2)">Madurai Bun Parotta (₹80)</option>
                  <option value="Kalaiyarkoil Special Mutton Chukka">Kalaiyarkoil Special Mutton Chukka (₹260)</option>
                  <option value="South Indian Filter Coffee">South Indian Filter Coffee (₹35)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <div className="w-28">
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Quantity</label>
                  <div className="flex items-center border border-[#334155] rounded-xl bg-[#1E293B] overflow-hidden">
                    <button
                      onClick={() => setOrderItemQty(Math.max(1, orderItemQty - 1))}
                      className="px-2.5 py-1.5 text-white font-bold hover:bg-[#334155]"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-black text-xs text-white">{orderItemQty}</span>
                    <button
                      onClick={() => setOrderItemQty(orderItemQty + 1)}
                      className="px-2.5 py-1.5 text-white font-bold hover:bg-[#334155]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Special Cooking Notes</label>
                  <input
                    type="text"
                    value={orderItemNote}
                    onChange={(e) => setOrderItemNote(e.target.value)}
                    placeholder="e.g. Less spicy, extra salna"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex gap-3">
              <button
                onClick={() => setPunchingTable(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1E293B] text-[#94A3B8] hover:text-white"
              >
                {t.close}
              </button>
              <button
                onClick={handlePunchOrder}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#3B82F6] hover:bg-[#FBBF24] text-black shadow-lg"
              >
                 {t.dispatchKitchen}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SETTLE BILL */}
      {billingTable && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#334155] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-black text-white">
                 Settle Bill — Table #{billingTable.tableNumber}
              </h3>
              <button
                onClick={() => setBillingTable(null)}
                className="text-[#94A3B8] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Gross Table Subtotal:</span>
                <span className="font-bold text-white">₹{billingTable.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Discount:</span>
                <span className="font-bold text-[#F87171]">- ₹{discountAmount || 0}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm border-t border-[#334155] pt-2">
                <span>Net Payable:</span>
                <span className="text-[#34D399]">
                  ₹{Math.max(0, (billingTable.totalAmount || 0) - (parseFloat(discountAmount) || 0))}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#94A3B8] mb-1">Discount Amount (₹)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              {parseFloat(discountAmount) > 0 && (
                <div>
                  <label className="block font-bold text-[#94A3B8] mb-1">Discount Reason (Audit Log)</label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="e.g. Regular patron, manager courtesy"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#94A3B8] mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'CASH', 'CARD'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-xl font-extrabold border transition-all ${
                        paymentMethod === m
                          ? 'bg-[#3B82F6] text-black border-[#3B82F6]'
                          : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex gap-3">
              <button
                onClick={() => setBillingTable(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1E293B] text-[#94A3B8] hover:text-white"
              >
                {t.close}
              </button>
              <button
                onClick={handleSettleBill}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#10B981] hover:bg-[#059669] text-black shadow-lg"
              >
                ✅ {t.finalizePayment}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
