# Physical Android / Expo Go Setup

## 1. Requirements

- Node.js 20+
- npm 10+
- Android phone with Expo Go
- Windows PC and phone on the same Wi-Fi
- PostgreSQL is optional for the mobile fallback demo, but required for persistent production data
- Redis is optional locally; the API has an in-memory fallback

## 2. Install dependencies

From the project root:

```powershell
npm install
```

## 3. Configure the backend

Create `backend/api/.env` from the root `.env.example` and set at least:

```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
DATABASE_URL="postgresql://postgres:password@localhost:5432/ashok_raj_db?schema=public"
JWT_SECRET="replace-with-a-long-development-secret"
JWT_REFRESH_SECRET="replace-with-a-different-development-secret"
```

If PostgreSQL is available:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 4. Find the PC LAN address

```powershell
ipconfig
```

Use the Wi-Fi adapter's IPv4 address, for example:

```text
192.168.1.10
```

## 5. Configure Expo

Create `frontend/mobile/.env`:

```env
EXPO_PUBLIC_API_URL="http://192.168.1.10:3001"
EXPO_PUBLIC_WS_URL="ws://192.168.1.10:3001"
EXPO_PUBLIC_RAZORPAY_KEY_ID=""
```

Replace `192.168.1.10` with the PC's real IPv4 address.

## 6. Allow the API through Windows Firewall

Run PowerShell as Administrator:

```powershell
New-NetFirewallRule -DisplayName "Ashok Raj API 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

## 7. Start the API

Terminal 1:

```powershell
npm run api
```

The API listens on `0.0.0.0:3001`, so it is reachable from the phone on the LAN.

## 8. Verify from the phone

Open Chrome on the phone and visit:

```text
http://192.168.1.10:3001/health
```

Replace the IP with the PC's IP.

If the page responds, the phone can reach the backend.

## 9. Start Expo

Terminal 2:

```powershell
npm run mobile
```

Then scan the Expo QR code with Expo Go.

If LAN discovery fails:

```powershell
npx expo start --tunnel
```

## 10. Important networking rule

Never use `localhost` for the backend URL inside the mobile app when testing on a physical phone.

Correct:

```text
http://192.168.1.10:3001
```

Incorrect:

```text
http://localhost:3001
```

`localhost` on the phone refers to the phone itself.

## 11. Production build

For an installed Android build, keep the same API networking rule during LAN development. For production, replace the LAN URL with your HTTPS API domain.
