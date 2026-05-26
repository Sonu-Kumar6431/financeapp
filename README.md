# FinTrack — Personal Finance Management Platform
> DevBits PS-1 | UDYAM'25 | Electronics Engineering Society, IIT (BHU) Varanasi

A full-stack web application to track income, expenses, budgets, goals, and bill reminders — with rich analytics and CSV import/export.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18 + Vite, TailwindCSS, Recharts, Lucide  |
| Backend    | Node.js + Express.js                            |
| Database   | MongoDB Atlas (Mongoose ODM)                    |
| Auth       | JWT (Bearer token)                              |
| Deploy     | Vercel (frontend) + Render (backend)            |

---

## Project Structure

```
financeapp/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/           # Axios instance + all API calls
│       ├── components/    # Reusable UI components
│       ├── context/       # AuthContext
│       ├── pages/         # Route-level pages
│       └── utils/         # Formatters, constants
└── server/          # Express backend
    ├── config/        # MongoDB connection
    ├── controllers/   # Business logic
    ├── middleware/    # Auth guard, error handler
    ├── models/        # Mongoose schemas
    ├── routes/        # Express routers
    └── services/      # Cron jobs
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/your-team/fintrack.git
cd fintrack
npm install          # installs root deps (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
# In /server — copy the example and fill in your values
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/financeapp
JWT_SECRET=pick_a_long_random_string_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run both servers

```bash
# From project root
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## API Reference

### Auth
| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /api/auth/register | Register new user  |
| POST   | /api/auth/login    | Login, get JWT     |
| GET    | /api/auth/me       | Get profile        |
| PUT    | /api/auth/me       | Update profile     |

### Transactions
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/transactions             | List (filter/sort/page)  |
| POST   | /api/transactions             | Create transaction       |
| PUT    | /api/transactions/:id         | Update transaction       |
| DELETE | /api/transactions/:id         | Delete transaction       |
| POST   | /api/transactions/import      | Import CSV               |
| GET    | /api/transactions/export      | Export CSV               |

### Analytics
| Method | Endpoint                              | Description               |
|--------|---------------------------------------|---------------------------|
| GET    | /api/analytics/summary?month=YYYY-MM  | KPI totals for a month    |
| GET    | /api/analytics/monthly-trend?months=6 | Monthly income/expense    |
| GET    | /api/analytics/category-breakdown     | Pie chart data            |
| GET    | /api/analytics/recent                 | Last 5 transactions       |

### Budgets, Goals, Reminders
Standard CRUD on `/api/budgets`, `/api/goals`, `/api/reminders`.  
Special: `POST /api/goals/:id/contribute` and `POST /api/reminders/:id/pay`.

---

## Deployment

### Backend → Render (Free Tier)

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `server`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all env vars from `.env` in Render's **Environment** tab
7. Copy the service URL (e.g. `https://fintrack-api.onrender.com`)

### Frontend → Vercel

1. Create new project on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Framework preset: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL=https://fintrack-api.onrender.com
   ```
5. Update `client/src/api/axiosInstance.js` baseURL to use `import.meta.env.VITE_API_URL`
6. Also update Render backend env: `CLIENT_URL=https://your-vercel-app.vercel.app`

---

## Features Implemented

### Core (Required)
- [x] User Authentication (Register / Login / JWT)
- [x] Income & Expense Tracking with categories
- [x] Dashboard with KPI cards (income, expense, savings, savings rate)
- [x] Interactive Charts (monthly trend bar, category pie/donut, 12-month line)
- [x] CSV Import (with sample template) + Export
- [x] Transaction Management — search, filter by type/category, sort, paginate
- [x] Budget Tracking — per-category monthly limits with % progress bars
- [x] Financial Goal Setting — progress tracking + contribution
- [x] Bill Reminders — with recurring support + overdue grouping
- [x] Data Security — bcrypt password hashing, JWT auth, user-scoped data

### Optional / Bonus
- [x] Analytics deep-dive page — 12-month line chart, horizontal category bar, income sources
- [x] Recurring transactions support
- [x] Smart budget sync — budget spent amount auto-updates on transaction CRUD
- [x] Daily cron job for reminder notifications
- [x] Responsive mobile layout with collapsible sidebar
- [x] Multi-currency support (INR, USD, EUR, GBP)

---

## Team

| Member | Responsibility                              |
|--------|---------------------------------------------|
| You    | Architecture, analytics, integration, deploy |
| Durga  | Frontend UI (auth, dashboard, charts)        |
| Soham  | Backend APIs, CSV service, reminders cron    |

---

## Judging Criteria Checklist

| Criteria                    | How we address it                                            |
|-----------------------------|--------------------------------------------------------------|
| Functionality               | All 8 core + 2 optional features implemented                 |
| Code Quality                | MVC pattern, error handling middleware, modular components   |
| UI/UX & Responsiveness      | TailwindCSS, mobile sidebar, empty states, loading spinners  |
| Deployment & Performance    | Vercel + Render, MongoDB Atlas, compound DB indexes          |
| Innovation & Scalability    | Budget auto-sync, cron reminders, multi-currency             |
| Final Presentation          | Clean README, demo account, sample CSV                       |
