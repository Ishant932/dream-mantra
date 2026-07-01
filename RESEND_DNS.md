# Resend email DNS for dreammantra.in (password reset OTP)

Add these records in **GoDaddy → dreammantra.in → DNS** so Resend can send OTP to **any** registered user email.

| Type | Name | Value | Priority |
|------|------|-------|----------|
| **TXT** | `resend._domainkey` | *(copy from Resend dashboard → Domains → dreammantra.in)* | — |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | — |
| **MX** | `send` | `feedback-smtp.us-east-1.amazonses.com` | **10** |

After saving, wait 5–15 minutes, then in [Resend → Domains](https://resend.com/domains) click **Verify** on `dreammantra.in`.

Then set on Render:

```
RESEND_FROM=Dream Mantra <noreply@dreammantra.in>
```

## Automated (GoDaddy API)

```powershell
$env:GODADDY_API_KEY = "..."
$env:GODADDY_API_SECRET = "..."
$env:RESEND_API_KEY = "re_..."
node scripts/setup-resend-dns.js
```

Until domain is verified, Resend can only deliver to the Resend account owner email (`eshalohiya45@gmail.com`) for testing.
