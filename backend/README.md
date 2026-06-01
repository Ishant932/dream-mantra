# Dream Mantra — Backend API

Express REST API: auth (OTP), users, admin, chatbot (Gemini), careers.

## Start

```bash
cd backend
npm install
cp .env.example .env
node index.js
```

API: `http://localhost:5000/api`

## Environment (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 5000) |
| `JWT_SECRET` | Auth tokens |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail app password — **live OTP to inbox** |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE` | **live OTP SMS** |
| `GEMINI_API_KEY` | Esha AI chatbot |

## Structure

```
backend/
├── index.js          # Entry + static client in production
├── db.js             # JSON database
├── data.json         # Users, consultations, OTP store
├── routes/           # auth, user, admin, chatbot, careers
├── middleware/       # JWT auth
└── utils/otp.js      # Email + SMS OTP
```
