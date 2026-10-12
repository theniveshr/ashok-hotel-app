# Developer Setup & Architecture Guide

## Ashok Raj Groups Hospitality & Delivery Monorepo

This repository is a production-grade hospitality and delivery monorepo serving:
- **Mobile Guest App**: React Native (Expo SDK 57, React 19)
- **Staff & Admin Operations Portal**: Next.js 16 (Turbopack, React 19)
- **Backend API & Real-time Hub**: Fastify 5 (TypeScript, WebSockets, Prisma, Supabase)
- **Shared Foundation Packages**: `@ashok-raj/config`, `@ashok-raj/types`, `@ashok-raj/validation`, `@ashok-raj/ui`

---

## 1. Prerequisites

- **Node.js**: `>= 20.0.0` (LTS recommended)
- **npm**: `>= 10.0.0`
- **PowerShell** (Windows native development)
- **Managed Database**: Supabase Cloud Project (PostgreSQL with transaction pooler)
  - *Note: Docker or a local PostgreSQL daemon is **not** required.*
  - *Redis is optional; in-memory / direct fallback is activated automatically when Redis is absent.*

---

## 2. Environment Variables Configuration

Copy example environment templates to their respective local files before starting services:

### 2.1 Backend API (`backend/api/.env`)
```bash
cp backend/api/.env.example backend/api/.env
```
Ensure the following variables are set:
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3001
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_ANON_KEY=[KEY]
```

### 2.2 Admin Portal (`frontend/admin/.env.local`)
```bash
cp frontend/admin/.env.example frontend/admin/.env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[KEY]
```

### 2.3 Mobile App (`frontend/mobile/.env`)
Run the automated Wi-Fi IP detection script to ensure physical Android / iOS Expo Go devices connect seamlessly:
```bash
npm run mobile:sync
```
This updates `frontend/mobile/.env` with your host machine's current Wi-Fi LAN IP (e.g. `192.168.1.x:3001`).

---

## 3. Running Services

Open separate terminals or run in background:

### Start Fastify API (Port 3001)
```bash
npm run api
```
- Listens on `http://0.0.0.0:3001`
- Includes WebSockets on `/ws/orders` and `/ws/operations`
- Real-time DB pooling via Prisma & Supabase

### Start Admin Console (Port 3000)
```bash
npm run admin
```
- Available at `http://localhost:3000`
- Sub-dashboards:
  - `/kitchen` — Live Kitchen Display System (KDS)
  - `/waiter` — Waiter floor call & ready dishes station
  - `/tables` — Live table layout & walk-in seating console
  - `/lodge` — 3-floor hotel front-desk rack & room management
  - `/delivery` — Delivery dispatch & rider map tracking

### Start Mobile Expo Dev Server (Port 8081)
```bash
npm run mobile
```
- Launch on physical device with Expo Go by scanning the terminal QR code.
- Or start for Android emulator: `npm run mobile:android`

---

## 4. Health Checks & Verification

### Safe Health Check Endpoints
```bash
# General Health Status
curl http://localhost:3001/health

# Versioned API Health
curl http://localhost:3001/api/v1/health
```
**Sample 200 OK Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-12T09:23:08.621Z",
  "version": "0.0.1",
  "services": {
    "database": "cloud_supabase_active",
    "supabase": "configured",
    "redis": "disconnected"
  }
}
```

---

## 5. Quality & Stability Verification Commands

All quality gates pass in the unified monorepo:

| Check | Command | Status |
| :--- | :--- | :--- |
| **API Typecheck** | `npm run typecheck:api` | Verified (Exit Code 0) |
| **Admin Typecheck** | `npm --workspace @ashok-raj/admin run typecheck` | Verified (Exit Code 0) |
| **API Linting** | `npm --workspace @ashok-raj/api run lint` | Verified (0 errors) |
| **Admin Linting** | `npm --workspace @ashok-raj/admin run lint` | Verified (0 errors) |
| **Auth & RBAC Test Suite** | `npm run test:auth` | Verified (24/24 Passed) |
| **API Build** | `npm --workspace @ashok-raj/api run build` | Verified (Exit Code 0) |
| **Admin Production Build** | `npm --workspace @ashok-raj/admin run build` | Verified (Exit Code 0) |

---

## 6. Database Operations (Prisma + Supabase)

All database schema files are managed in `backend/api/prisma/schema.prisma`.

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Apply migrations to Supabase
npm run db:migrate

# Open visual Prisma Studio inspector
npm run db:studio
```

---

## 7. External Setup & Production Readiness

- **Database**: Managed directly on Supabase PostgreSQL (AWS ap-south-1). No local Docker containers are required.
- **SMS / OTP**: Development mode uses test fallback OTP `123456`. For production, configure SMS gateway credentials.
- **Push Notifications**: Configure Firebase Cloud Messaging (`FCM_SERVICE_ACCOUNT_KEY`) in `backend/api/.env` when mobile push notifications are deployed to production app stores.
