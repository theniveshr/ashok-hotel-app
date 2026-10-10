# Ashok Raj Lodge & Restaurant — corrected Expo workspace

## Expo mobile app

The customer mobile application is in `frontend/mobile`.

This project is aligned to Expo SDK 54, React 19.1, React Native 0.81.5, Reanimated 4.1.x, and the Expo SDK 54-compatible Worklets version.

## First setup

Requirements:

- Node.js 20.19.x or newer
- npm 10+
- Expo Go for physical-device testing

From the repository root:

```bash
npm install
npm run mobile
```

For a specific platform:

```bash
npm run mobile:android
npm run mobile:ios
```

Or:

```bash
cd frontend/mobile
npx expo start -c
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS when the corresponding simulator is available.

## Important Expo troubleshooting

If Expo reports a React Native, Reanimated, or Worklets mismatch:

```bash
# From repository root
rmdir /s /q node_modules
npm cache verify
npm install

cd frontend/mobile
npx expo start -c
```

On macOS/Linux, use:

```bash
rm -rf node_modules
npm cache verify
npm install
cd frontend/mobile
npx expo start -c
```

Do not install the newest `react-native-worklets` manually with Expo SDK 54. This project pins the SDK-54-compatible `~0.5.1` range to avoid Expo Go native/JavaScript Worklets mismatches.

## What was corrected

- Expo SDK 54 dependency alignment.
- React Native 0.81.5 alignment.
- Added the required Expo SDK 54-compatible `react-native-worklets` dependency.
- Reworked the mobile TypeScript configuration for Expo/Metro bundling.
- Simplified the monorepo Metro configuration.
- Removed the always-visible development navigation bar from production builds; it remains available in development.
- App now starts through the splash/onboarding/login flow instead of skipping directly to the main tabs.
- Restaurant cart badge now reads from the real cart store instead of a hard-coded value.
- Added dedicated root scripts for starting the Expo application.
- Removed committed local `.env` files from the corrected archive. Use `.env.example` as the template for local configuration.
- Excluded generated build output, `.next`, `.expo`, `node_modules`, and other machine-specific files from the source archive.

## Verification

The corrected mobile source was bundled successfully with Expo for Android and iOS using Metro. The bundle completed without JavaScript/TypeScript module-resolution errors.

## Notes

The mobile app currently contains UI/demo flows and local Zustand state. Backend API integration is separate from the Expo bundle and still needs the backend services and environment configuration when those live features are enabled.
