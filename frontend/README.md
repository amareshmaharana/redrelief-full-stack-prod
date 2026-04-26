# RedRelief Frontend ❤️

Production-grade frontend for the Blood Donation Management System (RedRelief), built with React, TypeScript, and Vite.

This application includes public informational pages, full authentication flows, and role-based operational dashboards for:

- Admin
- Donor
- Recipient
- Hospital
- Clinic

## Overview 🚀

The frontend is implemented as a complete multi-role web application with:

- Role-aware routing and guarded dashboards
- Real backend integration (REST + Socket.IO)
- JWT access/refresh session handling with automatic refresh retry
- Centralized API contracts and payload mapping
- Reusable UI system with Tailwind + shadcn/ui components

## Core Features ✨

- The login role badge only appears after the backend confirms a stored account for that email
- Registration/login now rely on Atlas-backed user records only; stale local-db data is no longer used

## Tech Stack 🧩

- React 18
- TypeScript 5
- Tailwind CSS + shadcn/ui (Radix primitives)
- Framer Motion
- Socket.IO client
- The UI no longer treats unsaved emails as a real role match.
- Missing mobile values are ignored instead of causing false `mobile already registered` errors.
## Project Structure 🗂️

```text
frontend/
  src/
- If login/register behaves oddly, restart the backend so it picks up the latest Atlas-only auth changes.
      dialogs/          # modal/dialog components
      ui/               # shadcn/ui primitives and wrappers
    pages/
      public/           # public-facing pages
      auth/             # login/register/password/otp pages
      admin/            # admin pages
      donor/            # donor pages
      recipient/        # recipient pages
      hospital/         # hospital pages
      clinic/           # clinic pages
    hooks/              # reusable hooks
    lib/                # api client, api domain wrappers, auth session
    test/               # vitest setup and tests
    types/              # shared types
  public/
  vite.config.ts
  vitest.config.ts
  tailwind.config.ts
  eslint.config.js
```

## Prerequisites ✅

- Node.js 18+
- npm 9+
- Backend API running locally

## Installation 📦

```bash
npm install
```

## Environment Variables ⚙️

Create a `.env` file in `frontend/`.

```env
VITE_API_BASE_URL=http://localhost:5000
```

Notes:

- `VITE_API_BASE_URL` is consumed by `src/lib/api-client.ts`.
- Variables must be prefixed with `VITE_` to be exposed in browser builds.

## Run Locally ▶️

```bash
npm run dev
```

Vite dev server is configured in `vite.config.ts` with:

- Host: `::`
- Port: `8080`

## Available Scripts 🧪

- `npm run dev`: Start development server
- `npm run build`: Production build to `dist/`
- `npm run build:dev`: Development-mode build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint
- `npm run test`: Run Vitest in CI mode
- `npm run test:watch`: Run Vitest in watch mode

## Routing and Access Control 🧭

Routing is centralized in `src/App.tsx`.

### Public Routes 🌍

- `/`
- `/about`
- `/camps`
- `/camps/:campId`
- `/contact`
- `/privacy-policy`
- `/terms-of-service`
- `/blood-stocks`

### Auth Routes 🔑

- `/login`
- `/login/form`
- `/register`
- `/register/form`
- `/register/form?role=recipient` (role-specific public entry supported in the chooser flow)
- `/verify-otp`
- `/forgot-password`
- `/reset-password`

### Role Areas 🧑‍⚕️

- `/admin/*`
- `/donor/*`
- `/recipient/*`
- `/hospital/*`
- `/clinic/*`

`ProtectedLayout` and `ProtectedHome` enforce authentication and role ownership of routes.

## Authentication and Session Model 🔒

Session state is managed in `src/lib/auth-session.ts`:

- Local storage key: `bdms_auth_session`
- Stores access token, refresh token, and user payload
- Emits `bdms-auth-change` for reactive session updates

Request behavior in `src/lib/api-client.ts`:

- Adds `Authorization: Bearer <token>` by default
- Retries one time on `401` using `/api/refresh-token`
- Clears invalid sessions on refresh failure
- Surfaces explicit network message when backend is offline

Login UX notes:

- `src/pages/auth/LoginForm.tsx` calls the backend role lookup endpoint before submit feedback is shown.
- The form shows `Login with <role>` after a valid email matches a stored user.
- The password label becomes required automatically for `admin`, `hospital`, and `clinic` accounts.

## API Layer 🔌

Domain APIs are centralized in `src/lib/backend-api.ts`:

- `authApi`
- `notificationApi`
- `adminApi`
- `donorApi`
- `recipientApi`
- `hospitalApi`
- `clinicApi`
- `profileApi`
- `publicApi`

`authApi` includes role lookup support used by the login form:

- `checkEmailRole(email)`

This keeps view components focused on UI and state, not endpoint wiring.

## Real-Time Notifications 📣

- Notification list and mark-read operations use REST endpoints.
- Live incoming notifications are handled via Socket.IO client.
- UI includes retry behavior for temporary backend connection outages.

## Testing 🧪

- Test runner: Vitest
- DOM environment: jsdom
- Setup file: `src/test/setup.ts`

Run tests:

```bash
npm run test
```

## Linting 🧹

```bash
npm run lint
```

## Build and Preview 🏗️

```bash
npm run build
npm run preview
```

## Troubleshooting 🩺

### Backend connection errors 🌐

- Ensure backend is running at `VITE_API_BASE_URL`
- Confirm port consistency (default backend: `5000`)
- Restart frontend dev server after changing `.env`

### 401 after inactivity ⏳

- Verify refresh token flow is working on backend
- Sign out and sign in again to reset local session

### Role redirect issues 🔁

- Clear `bdms_auth_session` in local storage
- Ensure backend user role matches frontend route namespace

### Notifications unavailable 🔕

- Check backend socket and REST endpoints
- Confirm valid access token is present

## Maintenance Notes 📝

- Keep route definitions and role nav items synchronized in `src/App.tsx`.
- Keep all endpoint contract changes reflected in `src/lib/backend-api.ts`.
- Update this README whenever auth flow, env defaults, or scripts change.
