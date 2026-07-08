# WhatsApp Setup for Dream Mantra

Dream Mantra supports **two providers** for WhatsApp automation:

| Provider | Best for | Own number needed? |
|----------|----------|------------------|
| **Twilio** (recommended) | Start free with sandbox — test bot + reminders today | No (uses Twilio sandbox number) |
| **Meta Cloud API** | Production with your own business line later | Yes (+91 number) |

You do **not** need 9680102276 to start. Use **Twilio sandbox** first, then move to your own number when ready.

---

## Option A — Twilio WhatsApp (recommended)

### What you get on free trial

- Twilio gives trial credit (~$15) — enough for hundreds of test messages
- **WhatsApp Sandbox** — no Meta business verification required to start
- Users join sandbox once; then you can send/receive messages
- Reminders & Esh bot work as plain text (no template approval wait)

### Step 1 — Create Twilio account

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Verify your email and phone
3. From Console home, copy:
   - **Account SID**
   - **Auth Token**

### Step 2 — Enable WhatsApp Sandbox

1. Console → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Note the sandbox number (usually `+1 415 523 8886`)
3. Note the join code (e.g. `join happy-tiger-42`)
4. From **your personal WhatsApp**, send that join code to the sandbox number

> Every tester must send the join code once from their WhatsApp.

### Step 3 — Environment variables

Add to Render → **dream-mantra** → Environment (and `backend/.env` locally):

```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886
TWILIO_WHATSAPP_SANDBOX=true
TWILIO_WHATSAPP_SANDBOX_CODE=join your-code-here
WHATSAPP_SITE_URL=https://dreammantra.in
CRON_SECRET=long-random-secret
```

Redeploy after saving.

### Step 4 — Webhook (two-way bot)

1. Twilio Console → **Messaging** → **WhatsApp sandbox settings**
2. **When a message comes in:** `https://dreammantra.in/api/webhooks/whatsapp`
3. Method: **POST**
4. Save

### Step 5 — Test

1. Register on dreammantra.in with your phone + WhatsApp opt-in checked
2. Or message the sandbox number after joining
3. Try: `MENU`, `HELP`, `pricing`, `ID`
4. Check health: `curl https://dreammantra.in/api/health` → `"whatsapp":{"provider":"twilio","configured":true,"sandbox":true}`

### Step 6 — Hourly reminders (cron)

**Automatic (recommended):** GitHub Actions runs every hour via `.github/workflows/whatsapp-cron.yml`.

One-time: add repo secret `CRON_SECRET` (same value as Render web service).

```bash
gh secret set CRON_SECRET --body "YOUR_CRON_SECRET" --repo DreamsMantra/dream-mantra
```

**Alternative:** cron-job.org — `node scripts/setup-cron-job-whatsapp.js` (needs `CRON_JOB_ORG_API_KEY`).

**Render cron** (paid): `dream-mantra-whatsapp` in `render.yaml`.

Manual test:

```bash
curl -X POST https://dreammantra.in/api/cron/whatsapp \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Free plan reality (current Dream Mantra setup)

**Free Twilio Sandbox can NEVER skip the join step.** This is a Meta/Twilio rule:

- Every user's WhatsApp must send `join <code>` once (lasts 72 hours)
- Signup auto-opens WhatsApp with the join text pre-filled → user only taps **Send**
- After that: registration welcome, reminders, notifications, and Esh chat work
- Email backup still sends instantly even if WhatsApp isn't joined yet

**No-join messaging for all users requires a paid WhatsApp Business sender** (Twilio upgrade + Meta verification). That is optional later — not part of the free plan.

---

## Option B — Meta Cloud API (direct)

Use this if you want full control with Meta directly and already have a verified business number.

### Requirements

1. [Meta Business Manager](https://business.facebook.com)
2. WhatsApp Business Account + phone verification
3. [Meta Developer](https://developers.facebook.com) app with WhatsApp product

### Environment variables

```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=meta
WHATSAPP_TOKEN=EAAx...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=your-chosen-secret
WHATSAPP_SITE_URL=https://dreammantra.in
CRON_SECRET=long-random-secret
```

### Webhook

1. Meta Developer → WhatsApp → Configuration
2. Callback URL: `https://dreammantra.in/api/webhooks/whatsapp`
3. Verify token: same as `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to `messages`

### Message templates (Meta approval required)

Create in WhatsApp Manager → Message templates (Utility):

| Name | Body |
|------|------|
| `dm_welcome` | Hi {{1}}, welcome to Dream Mantra! Your Dreams ID is {{2}}. Complete your profile: {{3}} |
| `dm_profile_reminder` | Hi {{1}}, your Dream Mantra profile is incomplete. Finish it here: {{2}} |
| `dm_payment_reminder` | Hi {{1}}, your {{2}} module payment is pending. Complete payment: {{3}} |
| `dm_session_reminder` | Reminder: your counselling session is on {{1}} at {{2}}. |
| `dm_report_ready` | Hi {{1}}, your {{2}} report is ready! View: {{3}} |

Approval takes 24–48 hours. Until then, use Twilio sandbox for testing.

---

## What the system does

### Welcome sequence (on signup with WhatsApp opt-in)

1. Immediate — welcome + Dreams ID
2. +2h — complete profile reminder
3. +24h — explore modules
4. +48h — book counselling info

### Automated reminders (hourly cron)

- Incomplete profile (24h+ after signup)
- Pending payment (6h / 24h)
- Payment proof pending (12h)
- Upcoming counselling (24h / 1h before)
- Report ready, test not started, CRP community join

### Two-way bot commands

| Message | Response |
|---------|----------|
| Any question | Esh AI (same as website chatbot) |
| `MENU` | Quick links |
| `HELP` | Human support contact |
| `ID` | Resend Dreams ID |

---

## What to send me (if you want help configuring)

For **Twilio** (easiest):

1. `TWILIO_ACCOUNT_SID`
2. `TWILIO_AUTH_TOKEN`
3. Sandbox join code from your Twilio console
4. Your test phone number (the one that joined sandbox)

**Never post Auth Token in public chat** — add it only in Render Environment variables.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Messages not sending (Twilio) | User must join sandbox first; check `TWILIO_WHATSAPP_FROM` |
| Webhook not receiving | URL must be `https://dreammantra.in/api/webhooks/whatsapp` |
| `configured: false` | Set `WHATSAPP_ENABLED=true` + Twilio SID/token/from |
| Cron does nothing | Set `CRON_SECRET` on web service and cron job |
| Wrong provider | Set `WHATSAPP_PROVIDER=twilio` or `meta` explicitly |

---

## Code reference

| Path | Role |
|------|------|
| `backend/lib/whatsapp/providers/twilio.js` | Twilio send + parse |
| `backend/lib/whatsapp/providers/meta.js` | Meta Cloud API |
| `backend/lib/whatsapp/outbox.js` | Message queue |
| `backend/lib/whatsapp/reminders.js` | Hourly scans |
| `backend/routes/whatsapp.js` | Webhook endpoint |
