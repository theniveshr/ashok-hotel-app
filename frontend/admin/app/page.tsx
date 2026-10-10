import React from 'react';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-[#FAFAF7] font-sans antialiased">
      {/* Top Navigation */}
      <header className="border-b border-[#162549] bg-[#0D1526] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-[#0A0F1E] text-lg">
            AR
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#FAFAF7]">
              Ashok Raj Lodge &amp; Restaurant
            </h1>
            <p className="text-xs text-[#3B82F6]">
              அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் — Admin Console
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0D4A2E] text-[#4CAF82] border border-[#1A7A4A]">
            Phase 0 Foundation Ready
          </span>
          <span className="text-[#928D82]">Kalaiyarkoil, Tamil Nadu</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111D38] via-[#162549] to-[#0D1526] p-8 border border-[#1C305E] shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-[#2563EB]">
              Hospitality Management Platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Ashok Raj Operations Hub
            </h2>
            <p className="text-sm text-[#B8C4E0] leading-relaxed">
              Unified administration for room management, dine-in QR ordering, kitchen display, home delivery fleet, guest folios, and multi-branch analytics.
            </p>
          </div>
        </div>

        {/* Phase 7 Live Operational Hubs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3B82F6]">
               Live Operational Consoles (Phase 7)
            </h3>
            <span className="text-xs text-[#34D399] font-bold">● Real-time WebSockets Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KDS Card */}
            <a
              href="/kitchen"
              className="group bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-[#334155] hover:border-[#3B82F6] rounded-2xl p-6 transition-all shadow-xl hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-3xl font-black text-black shadow-lg">
                  
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/40">
                  Kitchen Station →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-white group-hover:text-[#3B82F6] transition-colors">
                Kitchen Display (KDS)
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Full-screen live order ticket stream, item customization pills, color-coded waiting time alerts, and bump workflow.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span> Live Elapsed</span>
                <span>•</span>
                <span> Audio Chimes</span>
              </div>
            </a>

            {/* Waiter Hub Card */}
            <a
              href="/waiter"
              className="group bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-[#334155] hover:border-[#38BDF8] rounded-2xl p-6 transition-all shadow-xl hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-3xl font-black text-black shadow-lg">
                  
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#0284C7]/20 text-[#BAE6FD] border border-[#0284C7]/40">
                  Waiter Console →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-white group-hover:text-[#38BDF8] transition-colors">
                Waiter &amp; Floor Ops
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Table floor layout, live guest calls, food pickup queue, table-side ordering, and instant bill settlement.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span> Guest Calls</span>
                <span>•</span>
                <span> Settle</span>
              </div>
            </a>

            {/* Delivery Hub Card (Phase 8) */}
            <a
              href="/delivery"
              className="group bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-[#334155] hover:border-[#10B981] rounded-2xl p-6 transition-all shadow-xl hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-3xl font-black text-black shadow-lg">
                  
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#10B981]/20 text-[#A7F3D0] border border-[#10B981]/40">
                  Fleet Dispatch →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-white group-hover:text-[#10B981] transition-colors">
                Fleet Dispatch Hub
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Live delivery kanban, auto &amp; manual driver assignment, zone pricing rules, and OTP delivery verification.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span> Zone Rules</span>
                <span>•</span>
                <span> Auto-Assign</span>
              </div>
            </a>

            {/* Delivery Partner Console Card (Phase 9) */}
            <a
              href="/driver"
              className="group bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-[#334155] hover:border-[#34D399] rounded-2xl p-6 transition-all shadow-xl hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#059669] flex items-center justify-center text-3xl font-black text-black shadow-lg">
                  
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/40">
                  Driver Portal →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-white group-hover:text-[#34D399] transition-colors">
                Delivery Partner Portal
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                mapcn.dev live map navigation, order accept/reject radar, pickup confirmation, customer contact, OTP handoff, and earnings.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span> mapcn.dev</span>
                <span>•</span>
                <span> Daily Earnings</span>
              </div>
            </a>

            {/* Lodge Management Console Card (Phase 10) */}
            <a
              href="/lodge"
              className="group bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-[#334155] hover:border-[#3B82F6] rounded-2xl p-6 transition-all shadow-xl hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-3xl font-black text-black shadow-lg">
                  
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#3B82F6]/20 text-[#DBEAFE] border border-[#3B82F6]/40">
                  Lodge Console →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-white group-hover:text-[#3B82F6] transition-colors">
                Lodge Front-Desk &amp; Rooms
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Live 7-state visual room rack, 1-click status transitions, room types &amp; pricing manager, housekeeping &amp; maintenance tickets.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span> 7 Room States</span>
                <span>•</span>
                <span> Maintenance</span>
              </div>
            </a>
          </div>
        </div>

        {/* System Status Grid */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#928D82] mb-4">
            Master Architecture Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'PostgreSQL Database',
                status: 'Schema Configured',
                detail: '30+ tables with full audit logging, multi-branch & soft deletion',
                icon: '',
              },
              {
                title: 'Fastify API Backend',
                status: 'Port 3001 Ready',
                detail: 'REST, WebSockets, JWT rotation, Argon2, Rate limiting & Zod schemas',
                icon: '',
              },
              {
                title: 'BullMQ Async Workers',
                status: 'Redis Connected',
                detail: 'Notifications, email dispatch, housekeeping & delivery assignment queues',
                icon: '',
              },
              {
                title: 'Expo Mobile App',
                status: 'SDK 52 Initialized',
                detail: 'React Native, TypeScript, Zustand, TanStack Query & Reanimated',
                icon: '',
              },
              {
                title: 'Bilingual i18n Core',
                status: 'English + தமிழ்',
                detail: 'Complete zero-restart dynamic language switching architecture',
                icon: '🌐',
              },
              {
                title: 'Next.js 14 Admin',
                status: 'Port 3000 Active',
                detail: 'Tailwind CSS, dark luxury theme, responsive layout & real-time readiness',
                icon: '💻',
              },
            ].map((module, idx) => (
              <div
                key={idx}
                className="bg-[#0D1526] border border-[#162549] rounded-xl p-5 hover:border-[#2563EB] transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{module.icon}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#162549] text-[#3B82F6]">
                    {module.status}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-base mb-1">
                  {module.title}
                </h4>
                <p className="text-xs text-[#928D82] leading-relaxed">
                  {module.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Roadmap Overview */}
        <div className="bg-[#0D1526] border border-[#162549] rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#928D82] mb-4">
            Next Implementation Sequence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { phase: 'PHASE 1', name: 'Design System & Premium UI' },
              { phase: 'PHASE 2', name: 'Authentication & Security' },
              { phase: 'PHASE 3', name: 'Customer Home & Navigation' },
              { phase: 'PHASE 4', name: 'Restaurant Menu' },
              { phase: 'PHASE 5', name: 'Cart & Food Ordering' },
              { phase: 'PHASE 6', name: 'Dine-in QR Ordering' },
              { phase: 'PHASE 7', name: 'Kitchen + Waiter Operations' },
              { phase: 'PHASE 8', name: 'Home Delivery & Tracking' },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#111D38] p-3 rounded-lg border border-[#1C305E]">
                <span className="font-mono text-[10px] text-[#2563EB] font-bold block">
                  {item.phase}
                </span>
                <span className="text-[#FAFAF7] font-medium mt-0.5 block">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
