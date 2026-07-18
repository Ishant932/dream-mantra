# PhonePe Payment Gateway — Dream Mantra

Replaces Razorpay. Uses PhonePe **Standard Checkout** (redirect).

## What you need from PhonePe Business / Developer dashboard

| Value | Env var | Where to find |
|-------|---------|----------------|
| Client ID | `PHONEPE_CLIENT_ID` | Merchant dashboard → API keys (Production or Test Mode) |
| Client Secret | `PHONEPE_CLIENT_SECRET` | Same |
| Client Version | `PHONEPE_CLIENT_VERSION` | Usually `1` |
| Environment | `PHONEPE_ENV` | `SANDBOX` for UAT, `PRODUCTION` for live |
| Webhook username | `PHONEPE_WEBHOOK_USERNAME` | You choose when creating the webhook |
| Webhook password | `PHONEPE_WEBHOOK_PASSWORD` | You choose when creating the webhook |

Also set:

```
APP_PUBLIC_URL=https://dreammantra.in
PAYMENT_GATEWAY_ENABLED=true
```

## Webhook (required for reliable confirm)

In PhonePe dashboard → Webhooks / Callbacks:

- **URL:** `https://dreammantra.in/api/payments/webhook/phonepe`
- Set a username + password (same values as the env vars above)
- Enable order completed / payment success events

## Flow

1. User clicks **Pay with PhonePe**
2. Backend creates order → returns PhonePe `redirectUrl`
3. User pays on PhonePe
4. PhonePe redirects to `/payment/:id?phonepe=return&orderId=...`
5. Frontend calls `POST /api/payments/verify` → backend checks order status → unlocks module
6. Webhook is a backup if the browser never returns

## Render

Dashboard → `dream-mantra` → Environment → add the `PHONEPE_*` keys above.  
Remove old `RAZORPAY_*` keys if still present. Redeploy after saving.

## Local test

```
# backend/.env
PHONEPE_CLIENT_ID=...
PHONEPE_CLIENT_SECRET=...
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX
PHONEPE_WEBHOOK_USERNAME=dreammantra
PHONEPE_WEBHOOK_PASSWORD=pick-a-strong-secret
APP_PUBLIC_URL=http://localhost:5174
PAYMENT_GATEWAY_ENABLED=true
```

Then `cd backend && npm install && npm run dev`.

## Docs

- [PhonePe Node SDK](https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/introduction)
- [npm `@phonepe-pg/pg-sdk-node`](https://www.npmjs.com/package/@phonepe-pg/pg-sdk-node)
