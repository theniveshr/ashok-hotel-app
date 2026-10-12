import React from 'react';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* Top Navigation */}
      <header className="border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-[#2563EB] flex items-center justify-center font-extrabold text-white text-lg shadow-sm shadow-[#2563EB]/25">
            AR
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">
              Ashok Raj Lodge &amp; Restaurant
            </h1>
            <p className="text-xs text-[#2563EB] font-medium">
              அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் — Enterprise Console
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Design System Live &amp; Verified
          </span>
          <span className="text-[#64748B] font-medium text-xs">Kalaiyarkoil, Tamil Nadu</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#DBEAFE]/40 to-white p-8 border border-[#BFDBFE] shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#2563EB]">
              Hospitality Management Platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Ashok Raj Operations Hub
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Unified administration for room management, dine-in QR ordering, kitchen display, home delivery fleet, guest folios, and multi-branch analytics.
            </p>
          </div>
        </div>

        {/* Live Operational Hubs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              Live Operational Consoles
            </h3>
            <span className="text-xs text-[#16A34A] font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              Real-time WebSockets Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Dining & Table Management Card */}
            <a
              href="/tables"
              className="group bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2v20M6 2v20M4 6h4M4 10h4M16 6h4M16 10h4" />
                  </svg>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Floor Manager →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Dining &amp; Table Ops
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Live floor-by-floor table occupancy map, walk-in guest seating, online customer reservation approval, and QR codes.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#2563EB]">
                <span>● 10 Tables Active</span>
                <span>•</span>
                <span>Floor 1-3 Layout</span>
              </div>
            </a>

            {/* KDS Card */}
            <a
              href="/kitchen"
              className="group bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Kitchen Station →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Kitchen Display (KDS)
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Full-screen live order ticket stream, item customization pills, color-coded waiting time alerts, and bump workflow.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span>Live Elapsed</span>
                <span>•</span>
                <span>Audio Chimes</span>
              </div>
            </a>

            {/* Waiter Hub Card */}
            <a
              href="/waiter"
              className="group bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Waiter Console →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Waiter &amp; Floor Ops
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Table floor layout, live guest calls, food pickup queue, table-side ordering, and instant bill settlement.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span>Guest Calls</span>
                <span>•</span>
                <span>Settle Bills</span>
              </div>
            </a>

            {/* Delivery Hub Card */}
            <a
              href="/delivery"
              className="group bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Fleet Dispatch →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Fleet Dispatch Hub
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Live delivery kanban, auto &amp; manual driver assignment, zone pricing rules, and OTP delivery verification.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span>Zone Rules</span>
                <span>•</span>
                <span>Auto-Assign</span>
              </div>
            </a>

            {/* Delivery Partner Console Card */}
            <a
              href="/driver"
              className="group bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Driver Portal →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Delivery Partner Portal
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Live map navigation, order accept/reject radar, pickup confirmation, customer contact, OTP handoff, and earnings.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#64748B]">
                <span>GPS Radar</span>
                <span>•</span>
                <span>Daily Earnings</span>
              </div>
            </a>

            {/* Lodge Management Console Card */}
            <a
              href="/lodge"
              className="group bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                  </svg>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Lodge Console →
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Lodge Front-Desk &amp; Rooms
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Live 7-state visual room rack, 1-click status transitions, room types &amp; pricing manager, housekeeping &amp; maintenance tickets.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-[11px] font-bold text-[#2563EB]">
                <span>7 Room States</span>
                <span>•</span>
                <span>Housekeeping &amp; Folios</span>
              </div>
            </a>
          </div>
        </div>

        {/* System Status Grid */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
            Master Architecture Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'PostgreSQL Database',
                status: 'Schema Configured',
                detail: '30+ tables with full audit logging, multi-branch & soft deletion',
              },
              {
                title: 'Fastify API Backend',
                status: 'Port 3001 Ready',
                detail: 'REST, WebSockets, JWT rotation, Argon2, Rate limiting & Zod schemas',
              },
              {
                title: 'BullMQ Async Workers',
                status: 'Worker Infrastructure',
                detail: 'Notifications, email dispatch, housekeeping & delivery assignment queues',
              },
              {
                title: 'Expo Mobile App',
                status: 'SDK 52 Initialized',
                detail: 'React Native, TypeScript, Zustand, TanStack Query & Reanimated',
              },
              {
                title: 'Bilingual i18n Core',
                status: 'English + தமிழ்',
                detail: 'Complete zero-restart dynamic language switching architecture',
              },
              {
                title: 'Next.js 16 Admin',
                status: 'Port 3000 Active',
                detail: 'Tailwind CSS, Light Theme & Blue design system tokens',
              },
            ].map((module, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-[#2563EB]/50 transition-colors duration-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]">
                    {module.status}
                  </span>
                </div>
                <h4 className="font-semibold text-[#0F172A] text-base mb-1">
                  {module.title}
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {module.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
