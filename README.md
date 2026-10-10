# AshokRaj Groups Hospitality App

Premium light-mode hospitality platform for restaurant ordering, bakery, pure-veg dining, lodge bookings, mini-hall reservations, dine-in service, delivery operations, kitchen operations and waiter operations.

## Workspace

- `frontend/mobile` — Expo / React Native customer application
- `frontend/admin` — Next.js operations console
- `backend/api` — Fastify API, PostgreSQL/Prisma and WebSockets
- `backend/worker` — background jobs
- `packages/ui` — shared design tokens
- `packages/types` — shared TypeScript types
- `packages/config` — shared configuration
- `packages/validation` — shared validation

## Customer mobile design direction

- Light mode only
- Cobalt blue primary brand color
- Premium glassmorphism surfaces
- Soft blue-tinted shadows and translucent cards
- Centered `AshokRaj Groups` brand lockup on the home header
- Large hospitality hero carousel
- Fast horizontal service and popular-item cards
- Persistent cart state
- Tamil/English UI
- Haptic feedback on important interactions
- Physical-device LAN API configuration through Expo environment variables

## Main local commands

```powershell
npm install
npm run api
npm run mobile
npm run admin
```

Type checks:

```powershell
npm run typecheck:api
npm run mobile:typecheck
npm run typecheck:admin
```

Database:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Physical Android testing

Read `EXPO_GO_SETUP.md` for the exact LAN setup, firewall rule and Expo Go workflow.

## Important

Do not commit `.env` files containing real credentials. Use `.env.example` files as templates.


## Typography

The mobile app uses **M PLUS U** as its primary typeface. The variable font is bundled locally at `frontend/mobile/assets/fonts/MPLUSU-VariableFont_wght.ttf`, so the app does not depend on a remote font download. The light-only premium UI uses M PLUS U across headings, body text, buttons, cards and navigation, with the AshokRaj Groups wordmark using a heavier weight.
