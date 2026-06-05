# MongoDB Atlas for Dream Mantra

Dream Mantra stores **users, logins, payments, bookings, assessments, and admin data** in MongoDB when `MONGODB_URI` is set. Without it, the server uses `backend/data.json` (data is **lost on Render redeploy**).

---

## Step 1 — Create Atlas cluster (your account)

1. Sign in at [MongoDB Atlas](https://cloud.mongodb.com) (same email as your other accounts).
2. Left sidebar → **All Projects** → **New Project** → name it `Dream Mantra`.
3. **Build a cluster:**
   - Click **Create** → **M Deploy** (free tier M0).
   - Provider: **AWS** (or Google Cloud).
   - Region: **Mumbai (ap-south-1)** — closest to India.
   - Cluster name: `dream-mantra-cluster`.
4. Wait ~3 minutes for the cluster to finish creating.

---

## Step 2 — Database user

1. Atlas → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `dreammantra`
4. Password: generate a strong password (save it)
5. Privileges: **Read and write to any database**
6. **Add User**

---

## Step 3 — Network access (allow Render)

1. Atlas → **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (`0.0.0.0/0`)  
   *(Required for Render — IP changes on free tier)*
3. Confirm

---

## Step 4 — Connection string

1. Atlas → **Database** → **Connect** on your cluster
2. Choose **Drivers** → **Node.js** → version 5.5 or later
3. Copy the connection string, e.g.:

```
mongodb+srv://dreammantra:<password>@dream-mantra-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

4. Replace `<password>` with your database user password.
5. Add database name before `?`:

```
mongodb+srv://dreammantra:YOUR_PASSWORD@dream-mantra-cluster.xxxxx.mongodb.net/dreammantra?retryWrites=true&w=majority
```

---

## Step 5 — Link to website

### Local development

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://dreammantra:YOUR_PASSWORD@....mongodb.net/dreammantra?retryWrites=true&w=majority
```

Start server:

```powershell
cd backend
node index.js
```

You should see: `Database: MongoDB Atlas`

### Render (production)

1. [Render Dashboard](https://dashboard.render.com/) → **dream-mantra** → **Environment**
2. Add variable:
   - **Key:** `MONGODB_URI`
   - **Value:** your full connection string
3. **Save Changes** → Render redeploys automatically.

Or send the connection string to your developer to add via API.

---

## Step 6 — Verify

Open:

```
https://dream-mantra.onrender.com/api/health
```

Look for:

```json
{
  "ok": true,
  "db": {
    "mode": "mongodb",
    "mongo": { "configured": true, "state": "connected", "ready": true }
  }
}
```

---

## Migrate existing local data (optional)

If you have data in `backend/data.json`:

```powershell
$env:MONGODB_URI = "mongodb+srv://..."
node backend/scripts/migrate-to-mongo.js
```

On first Render deploy with `MONGODB_URI` set, existing `data.json` on the server is auto-migrated to Atlas.

---

## API keys (optional — for automated setup only)

The old link `#/org/access/apiKeys` often shows **“Oops! Something went wrong”**. MongoDB moved API keys here:

1. [cloud.mongodb.com](https://cloud.mongodb.com) — make sure you are at **Organization** level (not inside a project).
2. Left sidebar → **Identity & Access** → **Applications**
3. Click **Add new API Key**
4. Description: `dream-mantra-setup`
5. Organization permission: **Organization Project Creator** (or **Organization Owner**)
6. Copy **Public Key** + **Private Key** (private key shown only once)
7. Add access list → **Use Current IP Address** → **Save** → **Done**

Paste those keys here and the automated script will create the cluster and link Render.

Docs: [Atlas programmatic access](https://www.mongodb.com/docs/atlas/configure-api-access/)

---

## Security

- **Never commit** `MONGODB_URI` to GitHub
- Store only in Render Environment and local `backend/.env`
- Revoke and rotate password if exposed in chat

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Database startup failed` | Check password in URI (URL-encode special chars like `@`, `#`) |
| `IP not whitelisted` | Network Access → allow `0.0.0.0/0` |
| Still shows `"mode": "file"` | `MONGODB_URI` not set on Render — add in Environment |
| Data missing after redeploy | MongoDB was not connected; add `MONGODB_URI` |
