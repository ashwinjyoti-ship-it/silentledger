# The Silent Ledger

A personal archival app for documenting stock holdings. Simple, offline-first, with teenage engineering inspired design.

## What This App Does

- Document your father's stock portfolio
- Add holdings with symbol, shares, dates, prices, and notes
- Track chronological history with the Holdings Ledger
- View all holdings in a clean card-based layout
- Delete holdings when needed
- All data stored locally in your browser

## Current Features (v0.4)

✅ Add holdings manually
✅ View holdings as cards
✅ Delete holdings
✅ **Holdings Ledger** - Track buy/sell/transfer/note entries for each holding
✅ View ledger history (show/hide toggle)
✅ Add/delete ledger entries
✅ **Calculated Summary** - Automatic calculations from ledger (shares, cost basis, avg price)
✅ **CSV Import** - Bulk import holdings with automatic column mapping
✅ **PDF Viewer** - Upload and view broker statements
✅ Tab navigation (Holdings / Import CSV / View PDFs)
✅ Indian Rupees (₹) currency support
✅ Local storage (browser localStorage)
✅ Minimalist UI inspired by teenage engineering

## How to Run Locally

### Option 1: Open Directly in Browser (Simplest)

1. Navigate to the project folder
2. Double-click `index.html`
3. It will open in your default browser
4. Start adding holdings!

### Option 2: Use a Local Server (Recommended)

This prevents any CORS issues and simulates how it will work when deployed.

**If you have Python installed:**

```bash
# Navigate to project folder
cd /path/to/Papa-Baby-Shares

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**If you have Node.js installed:**

```bash
# Install a simple server globally (one-time)
npm install -g http-server

# Run in project folder
http-server -p 8000
```

**If you have PHP installed:**

```bash
php -S localhost:8000
```

Then open your browser and go to: `http://localhost:8000`

## File Structure

```
Papa-Baby-Shares/
├── index.html      # Main HTML structure
├── styles.css      # All styling (teenage engineering aesthetic)
├── storage.js      # LocalStorage functions (data layer)
├── app.js          # Main application logic (UI interactions)
└── README.md       # This file
```

## How It Works

1. **index.html** - Contains the form and the container for holding cards
2. **styles.css** - Minimalist design with monospace fonts, black/white theme
3. **storage.js** - Handles all data operations using browser's localStorage
4. **app.js** - Connects the UI to the storage layer, creates cards, handles clicks

## Understanding the Code

### Adding a Holding (Flow)

1. User fills out form and clicks "save holding"
2. `app.js` → `handleFormSubmit()` captures the form data
3. Calls `storage.js` → `addHolding()` to save data
4. `addHolding()` creates a holding object with unique ID and timestamps
5. Saves to localStorage as JSON
6. `app.js` refreshes the display
7. New card appears on screen

### Deleting a Holding (Flow)

1. User clicks "delete" button on a card
2. `app.js` → `handleDelete()` asks for confirmation
3. Calls `storage.js` → `deleteHolding(id)` to remove data
4. `deleteHolding()` filters out the holding from the array
5. Saves updated array to localStorage
6. `app.js` refreshes the display
7. Card disappears from screen

### Adding a Ledger Entry (Flow)

1. User clicks "add entry" button on a holding card
2. Modal opens with form (pre-filled with today's date)
3. User selects entry type (buy/sell/transfer/note/other)
4. User enters optional shares, price, and description
5. `app.js` → `handleLedgerEntrySubmit()` captures form data
6. Calls `storage.js` → `addLedgerEntry(holdingId, entryData)`
7. Entry is added to holding's `ledger_entries` array
8. Modal closes, display refreshes
9. Entry appears in holding's ledger (click "show" to view)

## Data Storage

All data is stored in your browser's localStorage under the key: `silentLedger_holdings`

**To view your data:**
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to "Application" or "Storage" tab
3. Click "Local Storage" → your domain
4. Find `silentLedger_holdings`

**To clear all data:**
```javascript
// In browser console
localStorage.removeItem('silentLedger_holdings');
```

## Next Steps (Not Yet Implemented)

- Export holdings to JSON/CSV
- Import holdings from file
- Edit existing holdings
- Deploy to Cloudflare Pages
- Connect to Cloudflare D1 database

## Troubleshooting

**Cards not appearing?**
- Open DevTools console (F12) and check for errors
- Make sure you filled in the "symbol" field (required)

**Form not submitting?**
- Check browser console for errors
- Try refreshing the page

**Lost your data?**
- Data is stored in browser localStorage
- Clearing browser data will delete holdings
- Export feature coming soon for backups

## Browser Requirements

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Requires JavaScript enabled.
