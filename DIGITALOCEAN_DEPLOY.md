# Deploy on DigitalOcean App Platform

Migrate Dream Mantra from Render to **DigitalOcean App Platform** (Singapore region, ~$5/month basic tier).

One URL serves everything: pages, login, dashboard, admin, chatbot, payments.

---

## Before you start

1. **DigitalOcean account** — https://cloud.digitalocean.com
2. **API token** — https://cloud.digitalocean.com/account/api/tokens (Read + Write)
3. **GitHub connected** — DigitalOcean → Apps → Create → connect **DreamsMantra/dream-mantra**
4. **(Optional)** Render API key — to auto-copy secrets (`MONGODB_URI`, payment keys, etc.)

---

## Quick deploy (automated)

```powershell
cd "D:\dream-mantra-main"

# Required
$env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_your_token_here"

# Optional — copies secrets from Render automatically
$env:RENDER_API_KEY = "rnd_your_render_key"

node scripts/deploy-digitalocean.js
```

Wait 10–15 minutes for the first build. Track progress in the [DigitalOcean dashboard](https://cloud.digitalocean.com/apps).

Your live URL will be like: **`https://dream-mantra-xxxxx.ondigitalocean.app`**

---

## Point dreammantra.in to DigitalOcean

After the app is **ACTIVE** and `/api/health` works on the `.ondigitalocean.app` URL:

### Option A — Automated (GoDaddy API)

```powershell
$env:GODADDY_API_KEY = "your_key"
$env:GODADDY_API_SECRET = "your_secret"
$env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_..."
node scripts/setup-godaddy-dns-digitalocean.js
```

### Option B — Manual in GoDaddy

1. DigitalOcean → your app → **Settings** → **Domains**
2. Copy the DNS records DigitalOcean shows for `dreammantra.in` and `www`
3. GoDaddy → **dreammantra.in** → **DNS** → update records:
   - Remove old Render `A @ → 216.24.57.1`
   - Remove old `CNAME www → dream-mantra.onrender.com`
   - Add the records from DigitalOcean (usually CNAME to your app hostname)

Propagation: 10–60 minutes.

---

## Remove from Render (after DO is live)

**Only after** https://dreammantra.in/api/health shows the new DigitalOcean deployment:

```powershell
$env:RENDER_API_KEY = "rnd_..."
$env:TEARDOWN_RENDER_CONFIRM = "yes"
node scripts/teardown-render.js
```

Also delete the Blueprint in Render Dashboard if it still exists.

---

## Manual deploy (doctl)

```powershell
winget install DigitalOcean.Doctl
doctl auth init   # paste API token
doctl apps create --spec .do/app.yaml
# Updates:
doctl apps update <app-id> --spec .do/app.yaml
```

---

## App configuration

| Setting | Value |
|---------|--------|
| Region | Singapore (`sgp`) |
| Build | `bash scripts/digitalocean-build.sh` |
| Start | `node backend/index.js` |
| Health | `/api/health` |
| Plan | Basic XXS (~$5/mo) |
| Cron | WhatsApp hourly (`Asia/Kolkata`) |

Secrets are **not** in Git. They are set via `deploy-digitalocean.js` (from Render) or manually in DO Dashboard → App → Settings → Environment Variables.

---

## Auto-deploy on git push

DigitalOcean auto-deploys when `deploy_on_push: true` in `.do/app.yaml` (enabled by default). No GitHub Actions hook needed.

To disable Render auto-deploy, remove `RENDER_DEPLOY_HOOK` from GitHub secrets and delete `.github/workflows/render-deploy.yml` after migration.

---

## Verify live

```powershell
curl.exe -s https://dreammantra.in/api/health
```

Should show `"ok":true` and your latest git commit hash in `"version"`.

---

## Notes

- DigitalOcean has **no free tier** for App Platform — Basic XXS is ~$5/month (no cold starts unlike Render free).
- MongoDB Atlas connection (`MONGODB_URI`) is unchanged — same database, new host.
- Rotate API keys if you shared them in chat (Render, DigitalOcean, GoDaddy).
