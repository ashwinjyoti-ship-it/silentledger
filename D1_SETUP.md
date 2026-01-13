# D1 Database Setup Instructions

The D1 database is created but needs to be connected to Cloudflare Pages Functions.

## Manual Setup Required

1. Go to: https://dash.cloudflare.com
2. Select your account
3. Go to **Pages** → **silentledger** → **Settings** → **Functions**
4. Scroll down to **D1 database bindings**
5. Click **Add binding**
6. Configure:
   - **Variable name**: `DB`
   - **D1 database**: Select `silentledger-db`
7. Click **Save**

## After Binding is Added

1. Go to https://silentledger.pages.dev
2. Click **"sync to cloud"** - your 7 holdings will upload to D1
3. On iPad: Click **"load from cloud"** - your data will download

## Database Info

- **Database ID**: c7916f4e-3dcb-4cd5-8888-3686f355b364
- **Database Name**: silentledger-db
- **Tables**: holdings, ledger_entries
- **API Endpoints**: /api/holdings, /api/sync

## Verify Database

Check if data synced:
```bash
npx wrangler d1 execute silentledger-db --command "SELECT COUNT(*) FROM holdings;" --remote
```

View all holdings:
```bash
npx wrangler d1 execute silentledger-db --command "SELECT * FROM holdings;" --remote
```
