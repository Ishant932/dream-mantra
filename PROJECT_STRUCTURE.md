# Dream Mantra — Project Structure

Production uses **`client/`** (React UI) + **`backend/`** (Express API). Render builds `client/dist` and serves it from the API on one URL.

```
Dream Mantra/
├── client/                     # ★ Frontend (Vite + React + Tailwind)
│   ├── src/
│   │   ├── pages/              # Routes: Home, Login, Dashboards, Partner…
│   │   ├── components/         # Reusable UI (Navbar, Chatbot, panels…)
│   │   ├── i18n/               # English & Hindi site copy
│   │   ├── data/               # Static content, images, module catalog
│   │   ├── context/            # Auth, language, theme providers
│   │   └── api.js              # HTTP client for backend
│   ├── public/                 # Team photos, certifications, careers.json
│   └── scripts/                # Image checks, dev utilities
│
├── backend/                    # ★ API server (Express + MongoDB/SQLite)
│   ├── index.js                # Entry — serves client/dist in production
│   ├── routes/                 # auth, admin, user, chatbot, payments…
│   ├── lib/                    # DB, reports, notifications, bot knowledge
│   ├── models/                 # MongoDB AppState schema
│   ├── middleware/             # JWT auth, rate limiting
│   └── utils/                  # Mail, OTP, password reset
│
├── scripts/                    # Build & deploy helpers (careers generator, DNS)
├── .github/workflows/          # Auto-trigger Render deploy on push to main
├── render.yaml                 # Render Blueprint (build + env vars)
├── package.json                # Root scripts: dev, build, start
├── README.md                   # Quick start guide
└── DEPLOY.md / RENDER_DEPLOY.md  # Deployment notes
```

## Removed / legacy (do not add back)

| Item | Reason |
|------|--------|
| `frontend/` | Duplicate of `client/` — removed to avoid confusion |
| Root `index.html`, `css/`, `js/` | Old static prototype — app lives in `client/` |

## Commands

```bash
# Install everything
npm run install:all

# Local development (API :5000 + UI :5173)
npm run dev

# Production build (same as Render)
npm install && npm install --prefix backend && npm install --prefix client && npm run build --prefix client
node backend/index.js
```

## Environment

Copy `backend/.env.example` → `backend/.env`

Key variables: `JWT_SECRET`, `MONGODB_URI`, `GEMINI_API_KEY`, `RESEND_API_KEY`

**Live site:** https://dreammantra.in
