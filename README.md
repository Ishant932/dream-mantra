# Dream Mantra

Full-stack **Education & Career Counselling** platform inspired by [Dreamz Roadmap](https://sites.google.com/view/dreamz-roadmap/home).

## Project layout

See **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** for the full folder map.

```
dreams-mantra/
├── frontend/     # React UI (Vite + Tailwind)
├── backend/      # Express API + JWT + 2FA
├── scripts/      # Career generator & utilities
└── package.json  # Root orchestration
```

## Features

- **React + Tailwind + Framer Motion** — modern animated UI
- **Hindi / English** toggle
- **JWT authentication** — simple email/phone + password signup & login
- **Two-factor authentication (2FA)** — Google Authenticator / Authy (optional, from Dashboard → Security)
- **950+ Career Library** with roadmaps, salary, skills
- **AI Career Advisor** — personalised guidance in dashboard + Esh chatbot (Gemini)
- **User & Admin dashboards**
- **DMIT, Psychometric, CRP** programmes

## Quick start

**Double-click `START.bat`** or:

```powershell
cd "e:\Dream Mantra"
npm run install:all
npm start
```

Open **http://localhost:5000**

### Development (two ports)

```powershell
npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:5000  

## Auth

| Action | How |
|--------|-----|
| Sign up | `/signup` — name, email or phone, password |
| Login | `/login` — email/phone + password |
| Enable 2FA | Dashboard → **Security** → scan QR code |
| Admin | `admin@dreamsmantra.com` / `Admin@123` |

## Esh AI (Google Gemini)

1. Get API key: https://aistudio.google.com/apikey  
2. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your-key-here
   JWT_SECRET=your-long-random-secret
   ```
3. Restart backend.

## Backend env

Copy `backend/.env.example` → `backend/.env` and set:

- `JWT_SECRET` — required in production
- `GEMINI_API_KEY` — for AI chatbot & career advisor
- `RAZORPAY_*` — optional payments

## Deploy

Render.com uses `render.yaml` — builds frontend, runs `backend/index.js` on one port.
