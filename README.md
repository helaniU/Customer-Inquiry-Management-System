# Coffee Ninja — Customer Inquiry Management System

A full-stack web application for recording, filtering, and managing customer support inquiries through their operational lifecycle. Built as a technical assessment for Coffee Ninja (Pvt) Ltd.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React, Tailwind CSS v4, Axios |
| **Backend** | Node.js, Express.js, Prisma ORM, JWT, Zod Validation |
| **Database** | PostgreSQL (Neon Serverless) |
| **Testing** | Jest (frontend), Jest + Supertest (backend) |

---

## Features

- **Role-based access control** — Admins manage status; Agents can only submit and view
- **Inquiry lifecycle** — NEW → IN_PROGRESS → RESOLVED (with reopen support)
- **Search & filter** — by status, subject, or customer name
- **Dark / Light mode** — toggle persisted in localStorage
- **Dashboard** — summary stats (total / new / in-progress / resolved) + recent inquiries
- **JWT authentication** — enforced at the API level on every protected route

---

## Local Setup & Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL database **or** a [Neon](https://neon.tech) connection string

---

### 1. Clone the repository

```bash
git clone <repository-url>
cd coffee-ninja-assessment
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

Run database migrations and seed test accounts:

```bash
npx prisma migrate deploy
npm run db:seed
```

Start the backend dev server:

```bash
npm run dev
# Runs on http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
# Runs on http://localhost:3000
```

---

## Test Accounts

> These are seeded automatically by `npm run db:seed`

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@coffeeninja.com` | `Password123!` |
| **Agent** | `agent1@coffeeninja.com` | `Password123!` |

**Role differences:**
- **Admin** — can submit inquiries AND change status (New → In Progress → Resolved / Reopen)
- **Agent** — can submit and view inquiries only; status buttons are hidden in the UI and blocked at the API

---

## Running Tests

**Backend tests:**
```bash
cd backend
npm test
```

**Frontend tests:**
```bash
cd frontend
npm test
```

---

## Project Structure

```
coffee-ninja-assessment/
├── backend/
│   ├── prisma/           # Schema & seed
│   ├── src/
│   │   ├── routes/       # auth.js, inquiry.js
│   │   ├── middleware/   # auth.js (JWT + role guard)
│   │   └── app.js
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── dashboard/      # Home stats page
│       │   ├── inquiries/      # List, [id] detail, new form
│       │   └── login/
│       ├── components/
│       │   └── ThemeProvider   # Dark/light mode
│       └── lib/
│           └── api.ts          # Axios client with JWT interceptor
├── README.md
└── DECISIONS.md
```

---

## API Endpoints

| Method | Path | Auth | Role |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | — |
| `GET` | `/api/inquiries` | ✅ | Any |
| `POST` | `/api/inquiries` | ✅ | Any |
| `GET` | `/api/inquiries/:id` | ✅ | Any |
| `PATCH` | `/api/inquiries/:id/status` | ✅ | **Admin only** |