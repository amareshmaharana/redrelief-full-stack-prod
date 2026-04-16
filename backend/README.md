# RedRelief Backend

Production-ready REST and realtime backend for the RedRelief blood donation platform.

## Overview

This service provides authentication, role-based workflows, blood stock management, request processing, notifications, and public data endpoints for the RedRelief frontend.

## Core Capabilities

- Role-based access control for `admin`, `donor`, `recipient`, `hospital`, and `clinic` users.
- JWT access and refresh token authentication.
- OTP-based registration, login, and password reset flows.
- Password login for privileged organization roles.
- Camp publishing and public camp listing.
- Blood stock CRUD for hospitals, clinics, and administrators.
- Donation request and blood request workflows with admin review.
- In-app notification persistence with mark-read support.
- Socket.IO realtime notification delivery.
- Public stock summary and health endpoints.
- Newsletter subscription and welcome email delivery.
- Multipart request handling for medical reports and ID proofs.

## Technology Stack

- Node.js
- TypeScript
- Express
- MongoDB with Mongoose
- Zod validation
- JSON Web Tokens
- Socket.IO
- Redis adapter for optional Socket.IO scaling
- Resend for outbound email
- Multer for multipart parsing

## Repository Layout

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── modules/
│   └── utils/
├── docs/
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- Optional Redis instance for Socket.IO scaling
- Optional Resend account for OTP and password reset emails

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create a `.env` file in `backend/`.

3. Start the development server.

```bash
npm run dev
```

4. Build the production bundle.

```bash
npm run build
```

5. Start the compiled server.

```bash
npm start
```

## Available Scripts

- `npm run dev` runs the server with `ts-node-dev`.
- `npm run build` compiles TypeScript to `dist/`.
- `npm start` runs the compiled application.

## Environment Variables

Required:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Common:

- `NODE_ENV` defaults to `development`
- `PORT` defaults to `5000`
- `JWT_ACCESS_EXPIRES` defaults to `15m`
- `JWT_REFRESH_EXPIRES` defaults to `7d`
- `CORS_ORIGIN` defaults to `http://localhost:8080`
- `FRONTEND_URL` is used in password reset links

MongoDB fallback and DNS options:

- `MONGODB_URI_FALLBACK`
- `MONGODB_URI_DIRECT`
- `MONGODB_DNS_SERVERS`

Optional realtime scaling:

- `REDIS_URL`

Email configuration:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

SMTP variables are present in config, but the implemented mail flow currently uses Resend.

## Runtime Endpoints

- Health check: `GET /health`
- API base path: `/api`

## Authentication

All protected routes require an access token in the Authorization header.

```http
Authorization: Bearer <access_token>
```

### Auth Routes

- `POST /api/register`
- `POST /api/login`
- `POST /api/send-otp`
- `POST /api/verify-otp`
- `POST /api/forgot-password/request`
- `POST /api/forgot-password/send-otp`
- `POST /api/forgot-password/reset`
- `POST /api/refresh-token`

## API Modules

### Profile

Base path: `/api/user`

- `GET /profile`
- `PATCH /profile`
- `POST /change-password`

### Notifications

Base path: `/api/notifications`

- `GET /`
- `POST /mark-read`

### Donor

Base path: `/api/donor`

- `GET /camps`
- `GET /request-status`
- `POST /donation-request`

### Recipient

Base path: `/api/recipient`

- `GET /stock`
- `GET /request-status`
- `POST /blood-request`

### Hospital

Base path: `/api/hospital`

- `GET /stock`
- `POST /stock`
- `PATCH /stock/:stockId`
- `DELETE /stock/:stockId`
- `GET /request-status`
- `POST /blood-request`

### Clinic

Base path: `/api/clinic`

- `GET /stock`
- `POST /stock`
- `PATCH /stock/:stockId`
- `DELETE /stock/:stockId`
- `GET /request-status`
- `POST /blood-request`

### Admin

Base path: `/api/admin`

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

### Public

Base path: `/api/public`

- `GET /camps`
- `GET /stock-summary`
- `GET /stock-health`
- `POST /subscribe`

## Realtime Notifications

Socket.IO is initialized with the HTTP server.

Client connection example:

```ts
const socket = io("http://localhost:5000", {
  auth: { token: accessToken },
});
```

Behavior:

- Users are joined to a per-user room on connect.
- Notification updates are emitted as `notification:new`.
- Redis is used only when configured; the server runs without it.

## Request Lifecycle

- Donation requests and blood requests are created in a pending state.
- Admin users can approve or reject requests.
- Review actions create notifications and publish realtime updates to the requester.
- Blood stock summary aggregates units by blood group.

## File Uploads

Multer is configured with in-memory storage and a 5 MB file size limit.

Current upload-enabled routes:

- Donor donation request: `medical_report`
- Hospital blood request: `medical_report`
- Clinic blood request: `medical_report`
- Recipient blood request: `medical_report` and `id_proof`

Persistent file storage is not implemented in this backend. The current setup only parses multipart form-data for request submission.

## Response Shape

Success response:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "data": {}
}
```

## Production Notes

- Global rate limiting is enabled at 120 requests per minute per IP.
- CORS is credential-aware and controlled through `CORS_ORIGIN`.
- MongoDB connection fallback is supported for Atlas DNS or URI failover scenarios.
- Socket.IO continues operating even if Redis is unavailable.
