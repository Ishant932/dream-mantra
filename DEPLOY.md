# Deploy Dream Mantra

This app has two parts:
- **Frontend** (React/Vite) → **Vercel**
- **Backend** (Express API + database) → **Render** (free tier)

Vercel alone cannot run the full site because the API uses a persistent database file (`data.json`).

---

## Step 1 — Backend on Render (do this first)

1. Go to [render.com](https://render.com) → sign up with **eshalohiya45@gmail.com**
2. **New** → **Web Service** → connect **DreamsMantra/dream-mantra**
3. Settings:
   - **Build command:** `npm run install:all && npm run build`
   - **Start command:** `cd backend && node index.js`
4. Environment variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = long random string (32+ characters)
   - `GEMINI_API_KEY` = your Google AI key
   - `CORS_ORIGIN` = your Vercel URL (after Step 2)
5. Deploy → copy URL, e.g. `https://dream-mantra-api.onrender.com`

---

## Step 2 — Frontend on Vercel

1. [vercel.com/new](https://vercel.com/new) → import **dream-mantra**
2. **Root Directory:** `client`
3. **Framework:** Vite | **Build:** `npm run build` | **Output:** `dist`
4. Environment variable:
   - `VITE_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`
5. Deploy

---

## Step 3 — Link them

Set Render `CORS_ORIGIN` to your Vercel URL, then redeploy Render.

---

## All-in-one (single URL)

Use **Render only** with `render.yaml` — no Vercel needed.
