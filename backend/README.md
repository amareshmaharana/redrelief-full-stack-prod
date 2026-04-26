# RedRelief Backend 🩸

Backend service for RedRelief, implemented with Node.js, TypeScript, Express, and MongoDB.

This README documents what is currently implemented in this repository.

## What Is Implemented ✅

- Role-based APIs for `admin`, `donor`, `recipient`, `hospital`, and `clinic`
- JWT access + refresh token auth
- Direct registration flow (no OTP required for registration)
- Login with role auto-detection from stored user records only
- Role lookup endpoint for login UX (`check-email-role`)
- OTP endpoints for login/password-reset use cases only
- Forgot password via reset-link token flow
- Blood stock, camp, request, profile, notification, and public modules
- Socket.IO realtime notifications with optional Redis adapter
- Atlas-only MongoDB usage; no local fallback database

## Important Current Auth Behavior 🔐

- `POST /api/register` creates account and returns session tokens immediately.
- `POST /api/send-otp` with `purpose=register` is intentionally rejected.
- `POST /api/verify-otp` with `purpose=register` is intentionally rejected.
- `POST /api/login` does not accept a client role field; role is read from the matched database record.
- `POST /api/check-email-role` returns the detected role and whether password is required for that account.
- Password is required for `admin`, `hospital`, and `clinic` login.
- Password is optional for `donor` and `recipient` login.
- Registration is idempotent per role in current flow (existing same-role account can return session).
- Registration ignores stale profile-only phone rows and only blocks on real linked users.

## Stack 🧰

- Express
- Mongoose (MongoDB)
- Zod validation
- JWT (`jsonwebtoken`)
- Socket.IO
- Multer (memory storage)
- Resend/Nodemailer utilities for outbound email

## Project Layout 🗂️

```text
backend/
  src/
    app.ts
    server.ts
    config/
    middleware/
    models/
    modules/
    utils/
  docs/
  package.json
  tsconfig.json
```

## Run ▶️

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Environment ⚙️

Required:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Common defaults from code:

- `PORT=5000`
- `CORS_ORIGIN=http://localhost:8080`
- `JWT_ACCESS_EXPIRES=15m`
- `JWT_REFRESH_EXPIRES=7d`

MongoDB notes:

- Use Atlas as the primary database.
- If the SRV URI cannot resolve, set `MONGODB_URI_DIRECT` to the direct Atlas connection string.
- Do not use a local `mongodb://127.0.0.1:27017/...` fallback for this app.

Optional:

- `REDIS_URL` (Socket.IO adapter)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `FRONTEND_URL` (reset link base)

## Base Paths 🧭

- Health: `GET /health`
- API: `/api`

## Route Summary (Current) 🛣️

Auth (`/api`):

- `POST /register`
- `POST /login`
- `POST /check-email-role`
- `POST /send-otp`
- `POST /verify-otp`
- `POST /forgot-password/request`
- `POST /forgot-password/send-otp`
- `POST /forgot-password/reset`
- `POST /refresh-token`

Profile (`/api/user`):

- `GET /profile`
- `PATCH /profile`
- `POST /change-password`

Notifications (`/api/notifications`):

- `GET /`
- `POST /mark-read`

Donor (`/api/donor`):

- `GET /camps`
- `GET /request-status`
- `POST /donation-request`

Recipient (`/api/recipient`):

- `GET /stock`
- `GET /request-status`
- `POST /blood-request`

Hospital (`/api/hospital`):

- `GET /stock`
- `POST /stock`
- `PATCH /stock/:stockId`
- `DELETE /stock/:stockId`
- `GET /request-status`
- `POST /blood-request`

Clinic (`/api/clinic`):

- `GET /stock`
- `POST /stock`
- `PATCH /stock/:stockId`
- `DELETE /stock/:stockId`
- `GET /request-status`
- `POST /blood-request`

Admin (`/api/admin`):

- `GET /users`
- `PATCH /users/:userId/verification`
- `GET /camps`
- `POST /camps`
- `PATCH /camps/:campId`
- `DELETE /camps/:campId`
- `GET /requests`
- `PATCH /requests/donation/:requestId/review`
- `PATCH /requests/blood/:requestId/review`
- `GET /blood-stock`
- `POST /blood-stock`
- `PATCH /blood-stock/:stockId`
- `DELETE /blood-stock/:stockId`
- `GET /hospitals-list`
- `GET /clinics-list`
- `GET /dashboard-stats`

Public (`/api/public`):

- `GET /camps`
- `GET /stock-summary`
- `GET /stock-health`
- `POST /subscribe`

## Realtime 📡

- Socket.IO authenticates using access token in `socket.handshake.auth.token`.
- Users join room `user:<id>`.
- Notification event: `notification:new`.
- Redis adapter is enabled only when `REDIS_URL` is configured.

## Upload Handling 📎

- Multer memory storage, 5 MB max file size.
- Used in request submission endpoints (`medical_report`, `id_proof`).

## Notes 📝

- Global rate limit: 120 requests/minute/IP.
- CORS is controlled by `CORS_ORIGIN`.
- API responses follow the `{ success, data, message }` envelope.
- Empty mobile numbers should not be stored as `null`; missing phones are omitted to avoid false duplicate-key conflicts.
