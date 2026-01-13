# Holdings Ledger - User Guide

## What is the Holdings Ledger?

The Holdings Ledger is a **chronological history** of all activities related to each stock holding. Think of it as a journal where you document every buy, sell, transfer, or note about that specific stock.

## Why Use It?

- **Multiple Transactions**: Your father may have bought the same stock at different times and prices
- **Complete History**: Track when shares were sold, transferred, or gifted
- **Notes & Context**: Add dated notes like "Called broker about this" or "Planning to sell next month"
- **Audit Trail**: Never lose track of what happened when
- **No Math Required**: Just document the facts - no calculations, no analytics

---

## How to Use the Ledger

### 1. Add a Holding First

Before you can use the ledger, you need a holding to attach entries to:

1. Fill out the "add holding" form at the top
2. Enter at least the symbol (required)
3. Optionally add company name, shares, date, price, notes
4. Click "save holding"

The holding card will appear below.

---

### 2. Add Your First Ledger Entry

On each holding card, you'll see:
- **"add entry"** button - Click this to add a new ledger entry
- **"show/empty"** toggle button - Shows ledger status

**To add an entry:**

1. Click **"add entry"** on the holding card
2. A modal form will appear
3. Fill in the details:
   - **Date*** (required) - When this activity happened
   - **Entry Type*** (required) - Choose from:
     - `buy` - Purchased shares
     - `sell` - Sold shares
     - `transfer` - Transferred to/from another account
     - `note` - General note or observation
     - `other` - Anything else
   - **Shares** (optional) - Number of shares involved
   - **Price per share** (optional) - Price at which transaction occurred
   - **Description** (optional) - Freeform notes
4. Click **"save entry"**

The modal will close and the entry will be saved.

---

### 3. View Ledger Entries

Each holding card has a **"holdings ledger"** section with a toggle button:

- **"empty"** - No entries yet
- **"show"** - Click to reveal entries
- **"hide"** - Click to collapse entries

Entries are displayed **newest first** with:
- Entry type (in bold uppercase)
- Date (on the right)
- Shares and price (if provided)
- Description (if provided)
- Color-coded left border:
  - **Black** = buy
  - **Dark grey** = sell
  - **Medium grey** = transfer
  - **Light grey** = note/other

---

### 4. Delete a Ledger Entry

If you made a mistake or need to remove an entry:

1. Click **"show"** to reveal ledger entries
2. Find the entry you want to delete
3. Click the **"delete"** button on that entry
4. Confirm the deletion

**Warning:** This cannot be undone!

---

## Example Scenarios

### Scenario 1: Multiple Purchases Over Time

Your father bought Apple stock three times:

**Holding Card:**
- Symbol: AAPL
- Company: Apple Inc.

**Ledger Entries:**
1. **BUY** - 2015-03-15
   - 100 shares @ $120.00
   - Description: "Initial investment"

2. **BUY** - 2018-08-20
   - 50 shares @ $155.00
   - Description: "Added to position during dip"

3. **BUY** - 2020-12-10
   - 75 shares @ $130.00
   - Description: "Stock split adjusted purchase"

---

### Scenario 2: Partial Sale

Your father sold some shares but kept the rest:

**Ledger Entries:**
1. **BUY** - 2016-05-10
   - 200 shares @ $95.00

2. **SELL** - 2022-11-15
   - 75 shares @ $145.00
   - Description: "Needed funds for home repair"

3. **NOTE** - 2023-06-20
   - Description: "Holding remaining 125 shares for grandchildren"

---

### Scenario 3: Transfer to Trust

Your father transferred holdings to a trust:

**Ledger Entries:**
1. **BUY** - 2010-01-05
   - 500 shares @ $45.00

2. **TRANSFER** - 2021-03-30
   - 500 shares
   - Description: "Transferred to family trust, lawyer: John Smith"

---

### Scenario 4: Just Notes

Sometimes you just want to document decisions or context:

**Ledger Entries:**
1. **NOTE** - 2023-01-15
   - Description: "Company announced new CEO - monitoring closely"

2. **NOTE** - 2023-06-10
   - Description: "Dad mentioned he wants to hold this long-term"

3. **NOTE** - 2024-01-05
   - Description: "Reviewed with financial advisor, decided to keep"

---

## Best Practices

1. **Date Everything**: Always use the actual date the activity occurred
2. **Be Descriptive**: Add context in the description field - future you will thank you
3. **One Entry Per Event**: Create a new entry for each distinct activity
4. **Use the Right Type**: Choose the entry type that best fits (helps with visual scanning)
5. **Document Decisions**: Use "note" entries to capture why decisions were made

---

## What the Ledger Does NOT Do

❌ Calculate totals
❌ Compute current value
❌ Track gains/losses
❌ Provide tax information
❌ Connect to market data
❌ Auto-update anything

This is purely a **documentation tool** - you're the one doing the math and analysis (if needed).

---

## Tips

- **Start with a BUY entry** when you first add a holding (if you know the purchase details)
- **Use TRANSFER for gifts** received or given
- **Use NOTE liberally** - context is valuable
- **Include broker names** in descriptions when relevant
- **Reference documents** in descriptions (e.g., "See folder: Estate Docs 2020")

---

## Data Storage

All ledger entries are stored in your browser's localStorage as part of each holding object. They're saved automatically and persist between sessions.

**Backup**: Use the export feature (coming soon) to save a copy of all your data including ledger history.
