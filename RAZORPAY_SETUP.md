# Razorpay Payment Gateway — Dream Mantra

Online module payments use **Razorpay Checkout**. Manual UPI + admin verification remains available as a fallback.

## User flow

1. Dashboard → **Modules** → select module → **Proceed to payment**
2. On `/payment/:id`, choose **Pay via Razorpay**
3. Complete payment (UPI / card / netbanking)
4. Module unlocks **instantly** — no admin wait

## 1. Get Razorpay keys

1. Sign up / log in at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Settings → API Keys** → Generate keys
   - Use **Test mode** first (`rzp_test_...`)
   - Switch to **Live mode** when ready (`rzp_live_...`)

## 2. Create webhook

1. Dashboard → **Webhooks → + Add New Webhook**
2. URL: `https://dreammantra.in/api/payments/webhook/razorpay`
3. Event: **payment.captured**
4. Copy the **Webhook Secret** (`whsec_...`)

## 3. Configure Render (production)

### Option A — Script (recommended)

```powershell
$env:RENDER_API_KEY = "your_render_api_key"
$env:RAZORPAY_KEY_ID = "rzp_live_xxxxx"
$env:RAZORPAY_KEY_SECRET = "your_secret"
$env:RAZORPAY_WEBHOOK_SECRET = "whsec_xxxxx"
node scripts/setup-razorpay-render.js
```

### Option B — Render Dashboard

Web Service → **Environment** → add:

| Key | Value |
|-----|--------|
| `RAZORPAY_KEY_ID` | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | secret from Razorpay |
| `RAZORPAY_WEBHOOK_SECRET` | `whsec_...` from webhook |
| `PAYMENT_GATEWAY_ENABLED` | `true` (optional — auto-enables when keys exist) |

Remove or set `PAYMENT_GATEWAY_ENABLED=false` only if you want **manual-only** payments.

Redeploy after saving.

## 4. Verify

```bash
curl https://dreammantra.in/api/health
```

Expect:

```json
"payments": {
  "mode": "gateway",
  "gatewayEnabled": true,
  "razorpayKeyId": "rzp_live_...",
  "webhookConfigured": true
}
```

Book a test module → Razorpay button should be selected by default → complete test payment.

## Local development

In `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_test_secret
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
```

Run `npm run dev` and use Razorpay **test cards**: https://razorpay.com/docs/payments/payments/test-card-details/

## Force manual-only mode

Set `PAYMENT_GATEWAY_ENABLED=false` on Render. Users will only see Admin Verification (UPI + screenshot).
