# CarbonIQ AI 🌿

### Your Digital Carbon Twin for a Sustainable Future

CarbonIQ AI is an AI-powered personal sustainability coach and emissions tracking dashboard. It builds a virtual **Digital Carbon Twin** of every user mapping daily lifestyle habits, forecasts future emission reductions, and generates weekly actionable missions.

This repository hosts a production-ready, full-stack monorepo featuring a React client, Node/Express server, PostgreSQL client integration, SQLite local database fallback, and client-side receipt scanning intelligence.

---

## ⚡ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (using CSS-first configuration directives)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Analytics**: Recharts (distribution pies, timeline areas, comparison bars)

### Backend & Database
- **Server**: Node.js + Express
- **Authentication**: JWT + bcryptjs Hashing
- **Database**: PostgreSQL integration + SQLite fallback (`carboniq.db` auto-created locally for frictionless local execution)
- **Unit Testing**: Pure ESM Assert-based unit tests

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (version 18+ recommended) installed on your system.

### 2. Install Dependencies
Run npm installations in both client and server subdirectories:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Variables
Create a `.env` file inside the `server/` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_session_key
DATABASE_URL=postgresql://user:password@localhost:5432/carboniq   # Optional: Falls back to local SQLite if left blank
```

### 4. Running Locally
Run the backend and frontend servers:

```bash
# Start backend Express server (starts on port 5000)
cd server
npm run dev

# Start frontend Vite development server (starts on port 3000, proxied to backend)
cd ../client
npm run dev
```

Open your browser to `http://localhost:3000` to interact with the platform.

---

## 🧪 Testing

We have included a comprehensive unit testing suite checking footprint calculations, score tiers, and receipt multipliers:

```bash
cd server
node db.test.js
```

---

## ☁️ Deployment

This project is configured with a root `vercel.json` and is ready for Vercel:
- **Build Commands**: Configured to bundle the client static outputs and initialize the server node handler.
- **API routes**: Pre-routed to point from `/api/*` to the Express backend.
