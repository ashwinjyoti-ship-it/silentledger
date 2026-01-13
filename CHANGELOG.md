# Changelog

## v0.4 - Import & PDF Viewer

### Added
- **Tab Navigation**: Switch between Holdings, Import CSV, and View PDFs
- **CSV Import Feature**:
  - Upload CSV files with holdings data
  - Automatic column detection and mapping
  - Manual column mapping with sample values
  - Progress indicator during import
  - Import results summary
  - Validates required fields
- **PDF Viewer**:
  - Upload multiple PDF statements
  - Professional in-browser PDF viewing
  - PDF list with file names and sizes
  - Click to view any PDF
  - Delete PDFs from list
- Sample CSV file included for testing

### Technical
- New file: `import.js` - CSV parsing and import logic
- Auto-detect common column name patterns
- CSV parsing handles quoted fields and commas
- PDF viewing uses browser's native embed
- Temporary PDF storage (session-based)

---

## v0.3 - Calculated Summary Feature

### Added
- **Automatic Calculations**: Holdings cards now show calculated totals from ledger entries
  - Current shares (buy - sell)
  - Total invested (sum of buys)
  - Total proceeds (sum of sells)
  - Net cost basis
  - Average cost per share
- Calculations update automatically when ledger entries change
- Summary only shows if ledger has buy/sell entries
- Visual distinction with highlighted background

### Changed
- **Currency**: Changed from $ to ₹ (Indian Rupees) throughout app
  - Form placeholders
  - Card displays
  - Ledger entries
  - Calculated summaries

### Technical
- New function: `calculateHoldingSummary(holding)` in storage.js
- Calculations performed on-the-fly (not stored)
- Only BUY and SELL entries affect calculations
- TRANSFER, NOTE, OTHER entries ignored in calculations

---

## v0.2 - Holdings Ledger Feature

### Added
- **Holdings Ledger**: Chronological history tracking for each holding
  - Track buys, sells, transfers, notes, and other entries
  - Each entry includes date, type, shares, price, and description
  - View ledger history directly in holding cards

### Changes

#### Data Model
- Added `ledger_entries` array to holding object
- Each ledger entry contains:
  - `id`: Unique identifier
  - `date`: Entry date (YYYY-MM-DD)
  - `entry_type`: buy, sell, transfer, note, or other
  - `shares`: Number of shares (optional)
  - `price_per_share`: Price per share (optional)
  - `description`: Freeform text description
  - `created_at`: Timestamp when entry was created

#### UI Components
- **Add Entry button** on each holding card
- **Modal form** for creating new ledger entries
- **Toggle button** to show/hide ledger entries
- **Ledger entries display** with color-coded borders by type:
  - Buy: black border
  - Sell: dark grey border
  - Transfer: medium grey border
  - Note: light grey border
- **Delete buttons** for individual ledger entries

#### New Functions (storage.js)
- `addLedgerEntry(holdingId, entryData)` - Add new entry to a holding
- `deleteLedgerEntry(holdingId, entryId)` - Remove an entry
- `getLedgerEntries(holdingId)` - Get all entries for a holding

#### New Functions (app.js)
- `createLedgerEntriesHTML(holding)` - Generate HTML for ledger display
- `handleToggleLedger(event)` - Show/hide ledger entries
- `handleAddLedgerEntry(event)` - Open modal to add entry
- `closeLedgerModal()` - Close and reset modal
- `handleLedgerEntrySubmit(event)` - Save new ledger entry
- `handleDeleteLedgerEntry(event)` - Delete ledger entry with confirmation

### Why This Feature?

The Holdings Ledger provides a complete audit trail of all activities related to each stock holding:

1. **Multiple transactions**: Track when shares were bought/sold over time
2. **Transfers & gifts**: Document when holdings were transferred or received
3. **Notes & reminders**: Add dated notes about decisions, broker calls, etc.
4. **No calculations**: Just pure documentation (no automatic totals or analytics)
5. **Complete history**: Never lose track of what happened when

### Example Use Cases

- "Dad bought 100 AAPL shares in 2015 @ $120"
- "Sold 25 shares in 2020 @ $300"
- "Transferred 50 shares to trust in 2022"
- "Note: Considering selling remainder next quarter"

---

## v0.1 - Initial Release

### Features
- Add holdings with symbol, company, shares, date, price, notes
- View holdings as cards (teenage engineering inspired design)
- Delete holdings
- Local storage (browser localStorage)
- Minimalist black/white design
