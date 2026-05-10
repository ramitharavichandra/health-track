# HealthTrack — Full Stack Web Application

A modern health tracking application built with React, Node.js, Express, and MongoDB.

## Tech Stack
- **Frontend**: React 19 + Vite, React Router, Recharts, Lucide Icons, CSS Modules
- **Backend**: Node.js + Express (ESM), JWT Authentication, bcryptjs
- **Database**: MongoDB + Mongoose

## Features
- User registration & login (JWT auth)
- Log daily health metrics: steps, water, calories, sleep, weight, mood
- Dashboard with real-time progress bars against goals
- Charts: bar chart (steps), line chart (sleep & water trends)
- 30-day history table with delete
- Goal management (daily targets)
- BMI calculator on profile page

## How to Run

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Start MongoDB
```bash
mongod
```

### Install & Run Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| POST | /api/metrics | Log/update metric |
| GET | /api/metrics | Get all metrics |
| GET | /api/metrics/:date | Get by date |
| DELETE | /api/metrics/:date | Delete entry |
| GET | /api/goals | Get goals |
| PUT | /api/goals | Update goals |
