# Dream Mantra

Full-stack **Education & Career Counselling** platform inspired by [Dreamz Roadmap](https://sites.google.com/view/dreamz-roadmap/home).

## Project layout

See **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** for the full folder map.

```
dreams-mantra/
├── client/       # React UI (Vite + Tailwind) — active frontend
├── backend/      # Express API + JWT + 2FA
├── scripts/      # Career generator & deploy utilities
└── package.json  # Root orchestration
```

## Features

- **React + Tailwind + Framer Motion** — modern animated UI
- **Hindi / English** toggle
- **JWT authentication** — email/phone + password signup & login
- **Two-factor authentication (2FA)** — Google Authenticator / Authy (optional)
- **1000+ Career Library** with roadmaps, salary, skills
- **AI Career Advisor** — Esh chatbot (Gemini) + dashboard guidance
- **User & Admin dashboards** — reports, bookings, assessments, payments
- **Mind Mapping, Skill Mapping, CRP** programmes

## Quick start

**Double-click `START.bat`** or:

```bash
npm run install:all
npm run dev
```

- UI: http://localhost:5173  
- API: http://localhost:5000  

## Production / Render

Render uses `render.yaml` — builds `client/`, runs `backend/index.js` on one port.

Live: **https://dreammantra.in**

See [DEPLOY.md](./DEPLOY.md) and [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for deployment details.
