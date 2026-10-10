'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { KitchenOrder, KitchenOrderStatus } from '@ashok-raj/types';

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PLACED' | 'PREPARING' | 'READY' | 'DELAYED'>('ALL');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    en: {
      title: 'Kitchen Display System (KDS)',
      sub: 'Ashok Raj Lodge & Restaurant — Live Kitchen Station',
      all: 'All Active',
      placed: 'New Orders',
      preparing: 'Preparing',
      ready: 'Ready for Pickup',
      delayed: 'Delayed (>20m)',
      searchPlaceholder: 'Search order #, table, dish...',
      accept: 'Accept Order',
      startCooking: 'Start Cooking',
      markReady: 'Mark Ready & Alert Waiter',
      bump: 'Bump Next',
      specialInstructions: 'Special Instructions:',
      table: 'Table',
      room: 'Room',
      takeaway: 'Takeaway',
      delivery: 'Delivery',
      elapsed: 'Elapsed',
      mins: 'm',
      itemCount: 'Items',
      soundOn: 'Sound: ON',
      soundOff: 'Sound: OFF',
      live: 'LIVE WS',
      offline: 'OFFLINE',
      emptyTitle: 'Kitchen Queue Clear',
      emptySub: 'No pending orders in this filter. New customer orders will chime instantly.',
      quickServe: 'Served / Cleared',
    },
    ta: {
      title: 'சமையலறை காட்சி திரை (KDS)',
      sub: 'அசோக் ராஜ் உணவகம் — நேரலை சமையலறை இயக்கம்',
      all: 'அனைத்தும்',
      placed: 'புதிய ஆர்டர்கள்',
      preparing: 'சமைக்கப்படுகிறது',
      ready: 'பரிமாற தயார்',
      delayed: 'தாமதம் (>20நி)',
      searchPlaceholder: 'ஆர்டர் எண், மேஜை, உணவு தேடுக...',
      accept: 'ஏற்றுக்கொள்',
      startCooking: 'சமைக்க தொடங்கு',
      markReady: 'தயார் என அறிவியுங்கள்',
      bump: 'அடுத்த நிலைக்கு மாற்று',
      specialInstructions: 'சிறப்பு குறிப்பு:',
      table: 'மேஜை',
      room: 'அறை',
      takeaway: 'பார்சல்',
      delivery: 'டெலிவரி',
      elapsed: 'நேரம்',
      mins: 'நி',
      itemCount: 'உணவுகள்',
      soundOn: 'ஒலி: ஆன்',
      soundOff: 'ஒலி: ஆஃப்',
      live: 'நேரலை',
      offline: 'ஆஃப்லைன்',
      emptyTitle: 'சமையலறை வரிசை காலியாக உள்ளது',
      emptySub: 'ஆர்டர்கள் எதுவும் இல்லை. புதிய ஆர்டர்கள் வந்தவுடன் ஒலி எச்சரிக்கை எழும்.',
      quickServe: 'பரிமாறப்பட்டது',
    },
  }[lang];

  // Synthesize audio chime for incoming orders
  const playAlertChime = useCallback((type: 'new' | 'ready') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'new') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio playback restrictions fallback
    }
  }, [soundEnabled]);

  // Fetch kitchen orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/kitchen/orders', {
        headers: { 'x-staff-role': 'KITCHEN_STAFF' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOrders(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 10000); // 10s polling backup
    return () => clearInterval(timer);
  }, [fetchOrders]);

  // WebSocket Live Sync
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      try {
        ws = new WebSocket('ws://localhost:3001/ws/operations');
        ws.onopen = () => {
          setIsConnected(true);
        };
        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.channel === 'kitchen' || msg.event?.startsWith('kitchen:')) {
              if (msg.event === 'kitchen:new_order') {
                playAlertChime('new');
              }
              fetchOrders();
            }
          } catch {
            // Ignore parse errors
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
  }, [fetchOrders, playAlertChime]);

  // Advance Order Status
  const handleUpdateStatus = async (orderId: string, nextStatus: KitchenOrderStatus) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/kitchen/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'KITCHEN_STAFF',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        if (nextStatus === 'READY') playAlertChime('ready');
        fetchOrders();
      }
    } catch {
      // Direct optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    }
  };

  // Toggle item done
  const handleToggleItem = async (orderId: string, itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'READY' ? 'PREPARING' : 'READY';
    try {
      await fetch(`http://localhost:3001/api/v1/kitchen/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-role': 'KITCHEN_STAFF',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchOrders();
    } catch {
      // Optimistic
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            items: ord.items.map((it) => (it.id === itemId ? { ...it, status: nextStatus } : it)),
          };
        })
      );
    }
  };

  // 1-Tap Bump Order
  const handleBump = async (orderId: string) => {
    try {
      await fetch(`http://localhost:3001/api/v1/kitchen/orders/${orderId}/bump`, {
        method: 'POST',
        headers: { 'x-staff-role': 'KITCHEN_STAFF' },
      });
      fetchOrders();
    } catch {
      fetchOrders();
    }
  };

  // Filtered orders
  const displayedOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'PLACED') return o.status === 'PLACED';
      if (filter === 'PREPARING') return o.status === 'PREPARING' || o.status === 'ACCEPTED';
      if (filter === 'READY') return o.status === 'READY';
      if (filter === 'DELAYED') return o.elapsedMinutes > 20 && o.status !== 'READY';
      if (filter === 'ALL') return o.status !== 'SERVED' && o.status !== 'CANCELLED';
      return true;
    }).filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.tableNumber && o.tableNumber.includes(q)) ||
        (o.roomId && o.roomId.includes(q)) ||
        o.items.some((it) => it.name.toLowerCase().includes(q) || it.nameTa.includes(q))
      );
    });
  }, [orders, filter, search]);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'SERVED' && o.status !== 'CANCELLED');
    return {
      all: active.length,
      placed: active.filter((o) => o.status === 'PLACED').length,
      preparing: active.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING').length,
      ready: active.filter((o) => o.status === 'READY').length,
      delayed: active.filter((o) => o.elapsedMinutes > 20 && o.status !== 'READY').length,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#070B14] text-[#F8FAFC] font-sans flex flex-col selection:bg-[#3B82F6] selection:text-black">
      {/* Header Bar */}
      <header className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center font-black text-[#0A0F1E] text-xl shadow-md">
            
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
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-[#1E293B] border-[#334155] text-[#38BDF8] hover:bg-[#334155]'
                : 'bg-[#1E293B] border-[#334155] text-[#64748B]'
            }`}
          >
            {soundEnabled ? ' ' + t.soundOn : '🔕 ' + t.soundOff}
          </button>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3B82F6] text-[#0A0F1E] hover:bg-[#FBBF24] transition-colors shadow-sm"
          >
            🌐 {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>

          {/* Navigation link to Waiter Hub */}
          <a
            href="/waiter"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:text-white hover:border-[#3B82F6] transition-colors"
          >
             Waiter Station →
          </a>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <section className="bg-[#0B1120] border-b border-[#1E293B] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: t.all, count: stats.all, color: 'border-[#334155] text-white' },
            { id: 'PLACED', label: t.placed, count: stats.placed, color: 'border-[#3B82F6] text-[#60A5FA]' },
            { id: 'PREPARING', label: t.preparing, count: stats.preparing, color: 'border-[#F59E0B] text-[#FBBF24]' },
            { id: 'READY', label: t.ready, count: stats.ready, color: 'border-[#10B981] text-[#34D399]' },
            { id: 'DELAYED', label: t.delayed, count: stats.delayed, color: 'border-[#EF4444] text-[#F87171]' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                filter === f.id
                  ? 'bg-[#1E293B] border-2 shadow-md ' + f.color
                  : 'bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:border-[#334155]'
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ${f.count > 0 ? 'bg-[#334155] text-white' : 'text-[#64748B]'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] w-64"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1.5 text-xs text-[#64748B] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Orders Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-[#94A3B8] text-sm">
            <span className="animate-spin mr-3">⏳</span> Loading live kitchen orders...
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <div className="text-5xl mb-3">👨‍✨</div>
            <h3 className="text-lg font-bold text-white mb-1">{t.emptyTitle}</h3>
            <p className="text-xs text-[#94A3B8] max-w-md">{t.emptySub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayedOrders.map((order) => {
              const isUrgent = order.elapsedMinutes > 20;
              const isWarning = order.elapsedMinutes > 12 && order.elapsedMinutes <= 20;

              // Border & header color based on waiting time
              let timerBadgeColor = 'bg-[#064E3B] text-[#34D399] border-[#059669]';
              let cardBorderColor = 'border-[#1E293B]';

              if (isUrgent && order.status !== 'READY') {
                timerBadgeColor = 'bg-[#7F1D1D] text-[#FCA5A5] border-[#DC2626] animate-pulse';
                cardBorderColor = 'border-[#EF4444] shadow-red-950/40';
              } else if (isWarning && order.status !== 'READY') {
                timerBadgeColor = 'bg-[#78350F] text-[#DBEAFE] border-[#D97706]';
                cardBorderColor = 'border-[#F59E0B] shadow-amber-950/30';
              } else if (order.status === 'READY') {
                timerBadgeColor = 'bg-[#065F46] text-[#6EE7B7] border-[#10B981]';
                cardBorderColor = 'border-[#10B981] shadow-emerald-950/30';
              }

              return (
                <div
                  key={order.id}
                  className={`bg-[#0F172A] rounded-2xl border-2 ${cardBorderColor} flex flex-col justify-between overflow-hidden shadow-xl transition-all hover:scale-[1.01]`}
                >
                  {/* Card Top */}
                  <div>
                    {/* Header bar */}
                    <div className="bg-[#1E293B]/80 px-4 py-2.5 border-b border-[#334155] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base tracking-wide text-white">
                          {order.orderNumber}
                        </span>
                        {order.priority === 'RUSH' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-black uppercase tracking-wider">
                            RUSH
                          </span>
                        )}
                        {order.priority === 'VIP' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#3B82F6] text-black text-[10px] font-black uppercase tracking-wider">
                            VIP
                          </span>
                        )}
                      </div>

                      {/* Elapsed Timer */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${timerBadgeColor}`}>
                         {order.elapsedMinutes} {t.mins}
                      </span>
                    </div>

                    {/* Source / Destination details */}
                    <div className="px-4 py-2 bg-[#131E35] border-b border-[#1E293B] flex items-center justify-between text-xs">
                      <div className="font-bold text-[#3B82F6] flex items-center space-x-1.5">
                        {order.type === 'DINE_IN' && (
                          <span> {t.table} {order.tableNumber || '??'}</span>
                        )}
                        {order.type === 'ROOM_SERVICE' && (
                          <span> {t.room} {order.roomId || '??'}</span>
                        )}
                        {order.type === 'TAKEAWAY' && <span>{t.takeaway}</span>}
                        {order.type === 'HOME_DELIVERY' && <span> {t.delivery}</span>}
                      </div>
                      <span className="text-[#94A3B8] font-medium truncate max-w-[140px]">
                        {order.guestName || 'Guest'}
                      </span>
                    </div>

                    {/* Special Instructions Note */}
                    {order.notes && (
                      <div className="mx-3 mt-2.5 p-2 rounded-lg bg-[#78350F]/40 border border-[#D97706]/50 text-xs text-[#DBEAFE]">
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-[#F59E0B]">
                          ⚠️ {t.specialInstructions}
                        </span>
                        {order.notes}
                      </div>
                    )}

                    {/* Dish Items List */}
                    <div className="p-4 space-y-3">
                      {order.items.map((item) => {
                        const isDone = item.status === 'READY';
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(order.id, item.id, item.status)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isDone
                                ? 'bg-[#064E3B]/30 border-[#059669]/50 opacity-70 line-through text-[#94A3B8]'
                                : 'bg-[#1E293B]/60 border-[#334155] hover:border-[#3B82F6]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start space-x-2.5">
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                    isDone ? 'bg-[#10B981] text-black' : 'bg-[#3B82F6] text-black'
                                  }`}
                                >
                                  {item.quantity}x
                                </span>
                                <div>
                                  <span className="font-bold text-sm text-white block">
                                    {lang === 'ta' ? item.nameTa || item.name : item.name}
                                  </span>
                                  {item.note && (
                                    <span className="text-[11px] text-[#FBBF24] block mt-0.5 font-medium">
                                      📝 {item.note}
                                    </span>
                                  )}
                                  {/* Customization Addons */}
                                  {item.addons && item.addons.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.addons.map((a, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[10px] px-1.5 py-0.2 rounded bg-[#0F172A] text-[#38BDF8] border border-[#0284C7]/40"
                                        >
                                          + {lang === 'ta' ? a.nameTa || a.name : a.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span className="text-base shrink-0">
                                {isDone ? '✅' : '⚪'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Action Workflow Footer */}
                  <div className="p-3 bg-[#0B1120] border-t border-[#1E293B] flex items-center gap-2">
                    {order.status === 'PLACED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors shadow-md"
                      >
                        🔥 {t.accept}
                      </button>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-[#F59E0B] hover:bg-[#D97706] text-black transition-colors shadow-md"
                      >
                         {t.startCooking}
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-[#10B981] hover:bg-[#059669] text-black transition-colors shadow-md"
                      >
                         {t.markReady}
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-[#334155] hover:bg-[#475569] text-white transition-colors"
                      >
                        ✨ {t.quickServe}
                      </button>
                    )}

                    {/* Quick Bump Button */}
                    <button
                      onClick={() => handleBump(order.id)}
                      title="Bump to next state"
                      className="px-2.5 py-2 rounded-xl text-xs font-black bg-[#1E293B] border border-[#334155] hover:border-[#3B82F6] text-[#3B82F6] transition-colors"
                    >
                      ⏩
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
