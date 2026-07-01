# Resend email DNS for dreammantra.in (password reset OTP)

Until these records exist, Resend can **only** deliver to the Resend account owner (`eshalohiya45@gmail.com`). All other users get *"Could not send OTP email"* on forgot-password.

## Fastest fix (recommended) — 2 minutes

1. Open [Resend → Domains → dreammantra.in](https://resend.com/domains)
2. Click **Auto Configure**
3. Sign in to **GoDaddy** and approve DNS access
4. Wait ~5 minutes, then run:

```powershell
$env:RESEND_API_KEY = "re_..."
$env:RENDER_API_KEY = "rnd_..."
node scripts/complete-resend-email.js
```

That script sets `RESEND_FROM`, redeploys Render, and tests forgot-password.

## Manual DNS (GoDaddy)

GoDaddy → **dreammantra.in** → **DNS** → **Add** these **3 records**:

| Type | Name | Value | Priority | TTL |
|------|------|-------|----------|-----|
| **TXT** | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCp8krA6lzRnqD9RcyKSOvgWihXMuH5FoNtLSfavfhcM18x8b2h2CbyS5qZxG42m8+PiAbpzaKsLib2ZNPLqslHAdJBw9UU12cxW50Nt0D3tofLNtXCdREOsVBYYa0RI1MHwmHrTcY8gNc6ggd05xfaS5evF+j/DlkSe4TxTyxeSwIDAQAB` | — | 600 |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | — | 600 |
| **MX** | `send` | `feedback-smtp.us-east-1.amazonses.com` | **10** | 600 |

**GoDaddy tips:** use Name `send` only (not `send.dreammantra.in`). If MX priority 10 is taken, use 20.

Then in Resend → Domains → **Verify DNS Records**.

## After verification

On Render:

```
RESEND_FROM=Dream Mantra <noreply@dreammantra.in>
```

Or run `node scripts/complete-resend-email.js` (does this automatically).

## Automated (GoDaddy API)

Create fresh keys at [developer.godaddy.com/keys](https://developer.godaddy.com/keys) (Production):

```powershell
$env:GODADDY_API_KEY = "..."
$env:GODADDY_API_SECRET = "..."
$env:RESEND_API_KEY = "re_..."
$env:RENDER_API_KEY = "rnd_..."
node scripts/complete-resend-email.js
```

## Verify DNS propagated

```powershell
nslookup -type=TXT resend._domainkey.dreammantra.in
nslookup -type=TXT send.dreammantra.in
nslookup -type=MX send.dreammantra.in
```

Or use [dns.email](https://dns.email).
