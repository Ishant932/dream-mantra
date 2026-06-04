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

## Custom domain — dreammantra.in (GoDaddy)

**Already added on Render:** `dreammantra.in` + `www.dreammantra.in`

Follow the full guide: **[GODADDY_DOMAIN.md](./GODADDY_DOMAIN.md)**

Quick DNS at GoDaddy (after removing old Hostinger A/AAAA/CNAME records):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `216.24.57.1` |
| CNAME | `www` | `dream-mantra.onrender.com` |

Then Render Dashboard → **dream-mantra** → **Settings** → **Custom Domains** → **Verify**.

**Never share GoDaddy passwords** — only DNS record changes are needed.

---

## Site not updating after git push?

Render is still running the **previous build** until a new deploy finishes. Check:

1. **Render Dashboard** → **dream-mantra** → **Events** — is there a deploy for your latest commit?
2. If **no deploy** after push: **Settings** → confirm repo is `DreamsMantra/dream-mantra`, branch `main`, **Auto-Deploy** is ON.
3. **Manual redeploy (fastest fix):** **Manual Deploy** → **Deploy latest commit** → enable **Clear build cache** → Deploy.
4. **Deploy hook (auto redeploy on every push):**
   - Render → **dream-mantra** → **Settings** → **Deploy Hook** → copy URL
   - GitHub → repo **Settings** → **Secrets and variables** → **Actions** → add `RENDER_DEPLOY_HOOK` with that URL
   - Next push to `main` triggers deploy via `.github/workflows/render-deploy.yml`

**Verify live site:** View page source on https://dream-mantra.onrender.com — updated build uses **Plus Jakarta Sans** fonts (not DM Sans / Outfit).

**CLI redeploy** (optional):

```powershell
$env:RENDER_API_KEY = "rnd_your_key_from_render_dashboard"
node scripts/deploy-render.js
```

---

## Notes

- Do **not** put passwords in GitHub — set them only in Render Environment
- `data.json` (users/payments) is created on the server automatically
- Redeploys reset data on free tier unless you add a paid persistent disk later
