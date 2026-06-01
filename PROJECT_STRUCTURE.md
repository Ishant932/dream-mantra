# Dreams Mantra — Project Structure

```
dreams-mantra/
├── frontend/              # React + Vite + Tailwind (UI) — currently at `client/` until folder rename
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, Chatbot, SecuritySettings…)
│   │   ├── pages/         # Route pages (Home, Login, Dashboard…)
│   │   ├── context/       # Auth, Theme, Language
│   │   ├── data/          # Static content & careers metadata
│   │   ├── api.js         # API client
│   │   └── App.jsx        # Routes
│   ├── public/data/       # careers.json (950+ careers)
│   └── package.json
│
├── backend/               # Express API + JWT auth + 2FA
│   ├── index.js           # Server entry (port 5000)
│   ├── routes/            # auth, user, admin, careers, chatbot, payments
│   ├── middleware/        # JWT authRequired, adminRequired
│   ├── utils/             # TOTP 2FA helpers
│   ├── lib/               # database, careersData
│   ├── config/            # products config
│   ├── data/              # careers.json copy, products
│   └── data.json          # JSON database (users, bookings…)
│
├── scripts/               # Utility scripts
│   └── generateCareers.js # Generate 950+ careers JSON
│
├── node_modules/          # Root dev dependencies (concurrently)
├── package.json           # Root scripts: dev, build, start
├── START.bat              # Windows launcher
├── render.yaml            # Deploy config
└── README.md
```

## Quick commands

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install root + backend + frontend deps |
| `npm run dev` | Dev: frontend :5173 + backend :5000 |
| `npm start` | Build frontend + serve on :5000 |
| `npm run generate:careers` | Regenerate careers JSON |

## Auth (JWT + 2FA)

- **Register:** `POST /api/auth/register` — name, email/phone, password → JWT
- **Login:** `POST /api/auth/login` — identifier + password → JWT (or 2FA challenge)
- **2FA verify:** `POST /api/auth/verify-2fa` — tempToken + 6-digit TOTP code
- **Enable 2FA:** Dashboard → Security tab → scan QR with Authenticator app

> **Note:** The UI lives in `client/` today (Windows file lock). Scripts use `client/`; `frontend/` is the planned name. Backend auto-detects both paths.
