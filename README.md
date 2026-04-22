# RedRelief — Blood Donation Management System 🔥

> A production-oriented full-stack platform that connects donors, recipients, hospitals, clinics, and admins in one real-time blood donation ecosystem.

[![Repo Stars](https://img.shields.io/github/stars/OWNER/REPO?style=social)](https://github.com/OWNER/REPO/stargazers)
[![Repo Forks](https://img.shields.io/github/forks/OWNER/REPO?style=social)](https://github.com/OWNER/REPO/network/members)
[![Issues](https://img.shields.io/github/issues/OWNER/REPO)](https://github.com/OWNER/REPO/issues)
[![License](https://img.shields.io/github/license/OWNER/REPO)](LICENSE)

[![Demo](https://img.shields.io/badge/Demo-Live%20Link-ff4d4f?style=for-the-badge)](https://redrelief.vercel.app/)
![API](https://img.shields.io/badge/API-REST-0ea5e9?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-22c55e?style=for-the-badge)

---

## 🩸 Project Description

**RedRelief** is a full-stack blood donation management system built to reduce delays in blood discovery, request handling, and emergency coordination.

The platform provides:

- Direct registration and login flows with database-driven role detection
- Role-based operational dashboards with role-themed button, hover, and profile styling
- Hospital and clinic stock workflows
- Admin review and request control
- Real-time notification delivery

### Why this project matters

In critical care scenarios, minutes matter. **RedRelief** helps bridge communication and inventory gaps between donors, recipients, and healthcare institutions through centralized, role-driven workflows.

---

## ✨ Features

- 🔐 JWT-based authentication with access + refresh tokens
- 👥 Role-based access control for Admin, Donor, Recipient, Hospital, Clinic
- 🧠 Login role is detected from the stored database record only
- 📝 Direct registration with immediate session issuance
- ✉️ Donor and recipient can log in with email only; admin, hospital, and clinic require password
- 🏥 Hospital/Clinic blood stock CRUD
- 🩸 Recipient/Hospital/Clinic blood request workflows
- ✅ Admin review pipelines for donation and blood requests
- 🔔 In-app notifications with read/mark-all-read support
- 📡 Socket.IO real-time notification events
- 🌐 Public endpoints for camps, stock summary, and stock health
- 📬 Newsletter subscription endpoint
- 📁 Multipart request handling for medical docs and proofs
- 🎨 Shared button and hover colors are themed per role across dashboards and profiles

---

## 🏗️ Architecture Overview

```text
Frontend (React + Vite + TypeScript)
  -> API Client Layer (token handling, refresh retry, error normalization, role lookup)
  -> Backend REST API (Express + TypeScript)
  -> MongoDB (Mongoose models)
  -> Socket.IO (realtime notifications)
  -> Redis Adapter (optional, for socket scaling)
```

- Frontend and backend are separated into dedicated folders (`frontend/`, `backend/`)
- Frontend consumes REST endpoints and listens to realtime events
- Backend applies role guards at route level and emits per-user events
- Frontend role dashboards inherit a role theme wrapper so shared buttons, hover states, and profile accents match the active role

---

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?logo=reactrouter&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154?logo=reactquery&logoColor=white)

Frontend notes:

- Login form uses live role lookup before submit feedback is shown
- Password visibility and required markers are handled through shared UI components
- Public role chooser routes users into the correct login/register flow

### Backend

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![REST API](https://img.shields.io/badge/API-REST-0ea5e9)
![JWT](https://img.shields.io/badge/Auth-JWT-f59e0b)

### Database & Realtime

![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Optional%20Adapter-DC382D?logo=redis&logoColor=white)

### Quality

![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)

---
<!-- 
## 📸 Screenshots / UI Preview

> Add actual screenshots here for best portfolio/recruiter impact.

- `docs/screenshots/landing.png`
- `docs/screenshots/login.png`
- `docs/screenshots/admin-dashboard.png`
- `docs/screenshots/request-workflow.png`

```md
![Landing](docs/screenshots/landing.png)
![Admin Dashboard](docs/screenshots/admin-dashboard.png)
```

--- -->

## ⚙️ Installation Guide

### 1) Clone repository

```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/your_db_name

JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-secret
JWT_ACCESS_EXPIRES=
JWT_REFRESH_EXPIRES=

CORS_ORIGIN=http://localhost:8080
FRONTEND_URL=http://localhost:8080

# Optional
REDIS_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Run backend:

```bash
npm run dev
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
```

Create `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

## 🚀 Usage Guide

1. Start backend server (`backend`, port `5000`)
2. Start frontend server (`frontend`, port `8080`)
3. Register/login with a role-specific account
4. Access role dashboard:
   - `/admin/*`
   - `/donor/*`
   - `/recipient/*`
   - `/hospital/*`
   - `/clinic/*`
5. Trigger request/stock actions and observe notification updates

---

## 🔐 Authentication & Roles

### Authentication

- Access token and refresh token are issued on login/register
- Frontend injects `Authorization: Bearer <token>` automatically
- On `401`, frontend attempts one refresh via `/api/refresh-token`
- Login uses the role stored in the matched database record, not a client-provided role field
- `donor` and `recipient` accounts can log in with email only
- `admin`, `hospital`, and `clinic` accounts require password during login

### Frontend auth UX

- `POST /api/check-email-role` is used by the login form to detect the role for a typed email
- The login UI shows `Login with <role>` after a valid email matches an account
- The password label becomes required automatically for `admin`, `hospital`, and `clinic`

### Roles

- **Admin**: user management, camp management, stock oversight, request review
- **Donor**: camp access, donation request flow, status tracking
- **Recipient**: blood request flow, stock visibility, status tracking
- **Hospital / Clinic**: stock management + request workflows
- Frontend role color mapping currently uses red for admin, emerald for donor, indigo for recipient, and amber for hospital/clinic

---

## 📡 API Endpoints

### Core endpoints

| Module | Method | Endpoint |
| --- | --- | --- |
| Health | GET | `/health` |
| Auth | POST | `/api/register` |
| Auth | POST | `/api/login` |
| Auth | POST | `/api/check-email-role` |
| Auth | POST | `/api/send-otp` |
| Auth | POST | `/api/verify-otp` |
| Auth | POST | `/api/forgot-password/request` |
| Auth | POST | `/api/forgot-password/reset` |
| Auth | POST | `/api/refresh-token` |
| Profile | GET | `/api/user/profile` |
| Profile | PATCH | `/api/user/profile` |
| Profile | POST | `/api/user/change-password` |
| Notifications | GET | `/api/notifications` |
| Notifications | POST | `/api/notifications/mark-read` |

### Admin endpoints

| Method | Endpoint |
| --- | --- |
| GET | `/api/admin/users` |
| PATCH | `/api/admin/users/:userId/verification` |
| GET | `/api/admin/camps` |
| POST | `/api/admin/camps` |
| PATCH | `/api/admin/camps/:campId` |
| DELETE | `/api/admin/camps/:campId` |
| GET | `/api/admin/requests` |
| PATCH | `/api/admin/requests/donation/:requestId/review` |
| PATCH | `/api/admin/requests/blood/:requestId/review` |
| GET | `/api/admin/blood-stock` |
| POST | `/api/admin/blood-stock` |
| PATCH | `/api/admin/blood-stock/:stockId` |
| DELETE | `/api/admin/blood-stock/:stockId` |
| GET | `/api/admin/hospitals-list` |
| GET | `/api/admin/clinics-list` |
| GET | `/api/admin/dashboard-stats` |

### Public endpoints

| Method | Endpoint |
| --- | --- |
| GET | `/api/public/camps` |
| GET | `/api/public/stock-summary` |
| GET | `/api/public/stock-health` |
| POST | `/api/public/subscribe` |

### Frontend routes of note

| Route | Purpose |
| --- | --- |
| `/login` | Login chooser |
| `/login/form` | Login form with live role detection |
| `/register` | Register chooser |
| `/register/form` | Role-specific registration form |
| `/admin/*` | Admin dashboard and management pages |
| `/donor/*` | Donor dashboard and request pages |
| `/recipient/*` | Recipient dashboard and request pages |
| `/hospital/*` | Hospital dashboard and stock/request pages |
| `/clinic/*` | Clinic dashboard and stock/request pages |

---

## 📂 Folder Structure

```text
bdms-academic-project/
  README.md
  backend/
    package.json
    tsconfig.json
    src/
      app.ts
      server.ts
      config/
      middleware/
      models/
      modules/
      types/
      utils/
  frontend/
    package.json
    vite.config.ts
    src/
      App.tsx
      components/
      hooks/
      lib/
      pages/
      test/
      types/
```

---

## 🌍 Deployment

### Demo / Live Link

- Frontend: `https://your-frontend-domain.com`
- Backend API: `https://your-api-domain.com`

### Deployment notes

- Set production-safe secrets for JWT and DB credentials
- Set strict CORS origin(s)
- Provide `REDIS_URL` for multi-instance Socket.IO scaling
- Configure process manager (PM2/systemd) or container runtime as needed

---

## 🧪 Testing

Frontend:

```bash
cd frontend
npm run test
npm run lint
```

Backend currently includes TypeScript build checks and runtime validation through Zod.

For an end-to-end check, start both apps locally and test registration, login, profile updates, request submission, and notification delivery.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Commit changes with clear messages
4. Push and open a Pull Request

Please keep API contracts, role checks, and docs synchronized when changing flows.
Keep role-aware UI tokens and shared component behavior synchronized when changing dashboard styling.

---

<!-- ## 📜 License

This project is currently intended for academic and portfolio use.
Add a LICENSE file if you plan public/open-source distribution.

--- -->

## 🙌 Acknowledgements

- Open-source community for ecosystem tooling
- Blood donation volunteers and healthcare workers
- Contributors and reviewers improving reliability and UX

<p align="center">Save lives, one drop at a time. Join the RedRelief community today.</p>

<!-- ---

## 📬 Contact / Author Info

- Author: `Your Name`
- Email: `your.email@example.com`
- LinkedIn: `https://linkedin.com/in/your-profile`
- GitHub: `https://github.com/your-username` -->
