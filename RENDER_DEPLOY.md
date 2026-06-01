# Deploy on Render (complete website — frontend + API)

One URL serves everything: pages, login, dashboard, admin, chatbot, payments.

---

## Quick deploy (you are on Render now)

1. Click **+ New** (top right)
2. Choose **Blueprint**
3. Connect **GitHub** → select repo **`DreamsMantra/dream-mantra`**
4. Render reads `render.yaml` automatically
5. When prompted, enter:
   - **GEMINI_API_KEY** — from https://aistudio.google.com/apikey
   - **ADMIN_PASSWORD** — your admin login password (not GitHub password)
6. Click **Apply** / **Deploy**

Wait 5–10 minutes for the first build.

Your live URL will be like: **`https://dream-mantra.onrender.com`**

---

## Manual deploy (if Blueprint is not available)

1. **+ New** → **Web Service**
2. Repo: **dream-mantra**
3. Settings:

| Field | Value |
|-------|--------|
| Name | dream-mantra |
| Region | Singapore (closest to India) |
| Branch | main |
| Runtime | Node |
| Build Command | `npm run install:all && npm run build` |
| Start Command | `cd backend && node index.js` |
| Plan | Free |

4. **Environment variables:**

| Key | Value |
|-----|--------|
| NODE_ENV | production |
| JWT_SECRET | (auto-generate or any long random string) |
| GEMINI_API_KEY | your Google AI key |
| ADMIN_EMAIL | admin@dreamsmantra.com |
| ADMIN_PASSWORD | choose a strong admin password |
| ADMIN_PHONE | 9680102276 |
| SEED_SAMPLE_SLOTS | true |

5. **Create Web Service**

---

## After deploy

- Open your Render URL — full website loads
- Admin login: **admin@dreamsmantra.com** + your **ADMIN_PASSWORD**
- Free tier sleeps after ~15 min idle — first visit may take 30–60 seconds to wake up

---

## Custom domain (optional)

Render dashboard → your service → **Settings** → **Custom Domains** → add `dreammantra.in`

---

## Notes

- Do **not** put passwords in GitHub — set them only in Render Environment
- `data.json` (users/payments) is created on the server automatically
- Redeploys reset data on free tier unless you add a paid persistent disk later
