# Project QA / Engineering Pass

## Completed in this revision

### Mobile UX
- Reworked the customer home screen around the supplied visual reference.
- Light mode is explicitly enforced in Expo configuration and theme context.
- Cobalt blue is the primary brand color; gold is no longer used as the mobile primary color.
- Added a centered `AshokRaj Groups` header lockup with greeting and profile action.
- Added a swipeable hospitality hero carousel with active pagination.
- Converted service, offers, popular items and recent activity areas into real navigation actions.
- Restaurant and Lodge screens now expose back navigation.
- Home food cards use the plus action to add directly to the persistent cart.
- Food detail passes selected add-ons and image data into the cart.
- Room detail now reflects the selected room instead of always displaying the same room.
- Cart starts empty for a new installation instead of showing fabricated items immediately.
- Cart, checkout, order, booking, profile, settings, language and notification routes remain connected through the app shell.
- Removed malformed Tamil/Unicode mojibake from source files.
- Removed unsupported `backdropFilter` React Native styling.
- Added missing semantic palette values used by existing screens.
- Added compatibility for both `rightAction` and older `rightElement` header calls.

### Networking
- Added `frontend/mobile/config/api.ts` as the single mobile API URL layer.
- Removed mobile hard-coded localhost API URLs.
- Physical-device development now uses the PC LAN IP from `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_WS_URL`.
- Backend listens on `0.0.0.0` by default.
- Development CORS accepts LAN/Expo requests; production remains environment-controlled.
- Added exact physical Android / Expo Go setup instructions.

### Backend / operations
- Local health status remains useful when Redis is unavailable; PostgreSQL is still reported as the primary health dependency.
- Fixed the local setup PowerShell script path from the obsolete `apps/api` location to `backend/api`.
- Added root scripts for API, admin and package type-check commands.
- Kept existing PostgreSQL/Prisma, Redis fallback, WebSocket and operational routes intact.

### Admin
- Removed remaining emoji-only UI glyphs from source.
- Normalized the remaining gold brand accents to the blue brand direction.

## Validation performed

- Parsed all non-generated `package.json` files successfully.
- Parsed mobile Metro JavaScript configuration successfully with Node syntax checking.
- Checked relative imports for mobile/packages/backend source; backend `.js` ESM imports are intentional for the TypeScript runtime build.
- Checked that all referenced `Palette.*` values now exist.
- Checked for hard-coded mobile `localhost`/`127.0.0.1` API endpoints; none remain.
- Checked for malformed Tamil/Unicode mojibake; none remains in application source.
- Checked for the targeted UI emoji set; none remains in application source.

## Runtime verification note

The supplied archive contains generated dependency/cache artifacts but the current execution environment does not contain a usable root TypeScript compiler binary, and external package installation is unavailable. Therefore a full `npm install`, Metro bundle, Expo Android build, Prisma connection and device test cannot be honestly claimed as executed here.

After extracting the cleaned project, run:

```powershell
npm install
npm run mobile:typecheck
npm run typecheck:api
npm run typecheck:admin
npm run api
npm run mobile
```

Then follow `EXPO_GO_SETUP.md` for physical-device testing.
