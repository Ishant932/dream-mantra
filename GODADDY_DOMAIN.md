# Connect dreammantra.in (GoDaddy) → Render

Your Render service **dream-mantra** already has these custom domains added:

- `dreammantra.in` (main site)
- `www.dreammantra.in` (redirects to `dreammantra.in`)

**Do not share your GoDaddy password with anyone.** DNS is changed in your GoDaddy account in a few minutes.

---

## What is on the domain now?

`dreammantra.in` currently points to **Hostinger** (old website). You will **replace DNS records only** — no need to delete the domain from GoDaddy.

---

## Step 1 — Open GoDaddy DNS

1. Go to [https://www.godaddy.com](https://www.godaddy.com) and sign in (Customer #709291099).
2. **My Products** → find **dreammantra.in** → **DNS** or **Manage DNS**.

---

## Step 2 — Remove old records (empty the old site)

Delete **all** of these if they exist (old Hostinger / previous hosting):

| Type  | Name | Why remove |
|-------|------|------------|
| **A** | `@` | Old server IPs (e.g. 147.79.x, 91.108.x) |
| **AAAA** | `@` | IPv6 — Render uses IPv4 only |
| **CNAME** | `www` | Old `hstgr.net` / Hostinger target |
| **A** | `www` | Any www A record |
| **AAAA** | `www` | Any www IPv6 |

Also check:

- **Domain Forwarding** — turn **OFF** if enabled.
- **Nameservers** — should be GoDaddy defaults (e.g. `nsXX.domaincontrol.com`). If they point to Hostinger, either switch back to GoDaddy nameservers **or** change DNS at Hostinger instead.

Leave unrelated records (email MX, TXT for verification) unless you know you don't need them.

---

## Step 3 — Add Render DNS records

Add exactly these:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `216.24.57.1` | 600 seconds (or 1 Hour) |
| **CNAME** | `www` | `dream-mantra.onrender.com` | 600 seconds (or 1 Hour) |

**GoDaddy tips:**

- Name `@` = root domain (`dreammantra.in`).
- For CNAME `www`, some GoDaddy UIs show Name as `www` only.
- Do **not** add AAAA records.

---

## Step 4 — Verify on Render

1. Open [Render Dashboard](https://dashboard.render.com/) → **dream-mantra** → **Settings** → **Custom Domains**.
2. You should see `dreammantra.in` and `www.dreammantra.in`.
3. Wait **10–30 minutes** after DNS changes (sometimes up to a few hours).
4. Click **Verify** next to each domain.
5. When verified, Render issues free HTTPS (SSL) automatically.

---

## Step 5 — Test

- https://dreammantra.in
- https://www.dreammantra.in (should redirect to https://dreammantra.in)

Hard refresh on phone: clear browser cache or use private/incognito.

---

## Optional — hide onrender.com URL

Render → **dream-mantra** → **Settings** → **Custom Domains** → disable **Render Subdomain** so the site is only on `dreammantra.in`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Still shows old Hostinger site | DNS not propagated yet; wait 30–60 min. Check [dnschecker.org](https://dnschecker.org) for `dreammantra.in` A → `216.24.57.1`. |
| Verify fails on Render | Confirm old A/CNAME removed; only Render records remain. |
| 502 Bad Gateway | Wait 5–10 min after verify; Render is updating routing. |
| SSL certificate pending | Wait after verify; can take up to an hour. |

---

## Cancel old Hostinger hosting (optional)

Changing DNS **stops the old site from showing** on your domain. To stop paying Hostinger, cancel that hosting plan separately in your Hostinger account — that is separate from GoDaddy DNS.

---

## Need help?

After you update DNS in GoDaddy, tell us **“DNS updated”** and we can verify from here and click Verify on Render if needed.
