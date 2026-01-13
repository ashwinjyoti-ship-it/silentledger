# Calculated Summary Feature

## What Gets Calculated

The app now automatically calculates holdings totals from your ledger entries.

### Calculations Performed

1. **Current Shares** = Total BUY shares - Total SELL shares
2. **Total Invested** = Sum of (BUY shares × price) in ₹
3. **Total Proceeds** = Sum of (SELL shares × price) in ₹
4. **Net Cost Basis** = Total Invested - Total Proceeds in ₹
5. **Average Cost Per Share** = Net Cost Basis ÷ Current Shares in ₹

---

## How It Works

### When You Add Ledger Entries

Every time you add a **BUY** or **SELL** entry with shares and price, the calculations update automatically.

**Example:**

**Ledger Entries:**
1. BUY: 100 shares @ ₹150
2. BUY: 50 shares @ ₹200
3. SELL: 25 shares @ ₹250

**Calculated Summary Shows:**
- **Current Shares:** 125 (100 + 50 - 25)
- **Total Invested:** ₹25,000 (100×150 + 50×200)
- **Total Proceeds:** ₹6,250 (25×250)
- **Net Cost Basis:** ₹18,750 (25,000 - 6,250)
- **Avg Cost/Share:** ₹150 (18,750 ÷ 125)

---

## What Gets Included

### BUY Entries
- Adds to share count
- Adds to total invested (if price specified)

### SELL Entries
- Subtracts from share count
- Adds to total proceeds (if price specified)

### TRANSFER, NOTE, OTHER Entries
- **Not included** in calculations
- Use these for documentation only

---

## Important Notes

### No Automatic Updates to Main Fields

The original holding fields (shares, purchase price) are **NOT updated** by calculations. They remain as you entered them.

**Why?**
- Original fields = "initial entry" or "summary" you manually entered
- Calculated summary = computed from detailed ledger history
- Both can coexist for reference

### Missing Prices

If you add a BUY/SELL entry **without a price**, the shares still count but the amount calculations won't include that transaction.

**Example:**
- BUY: 100 shares @ ₹150 ✓ (counts in shares AND amount)
- BUY: 50 shares (no price) ✓ (counts in shares only)
- Current Shares: 150
- Total Invested: ₹15,000 (only the first transaction)

### Zero or Negative Shares

If your SELL entries exceed BUY entries, current shares can be negative or zero. The app will show this - no validation preventing it.

**Why?** You might be documenting things in non-chronological order, or there might be transfers you haven't logged yet.

---

## Display Logic

### When Summary Shows

The "Calculated from Ledger" section appears **only if**:
- Ledger has at least one BUY or SELL entry

### When Summary Hides

If your holding only has NOTE or OTHER entries, no summary shows.

### What Shows in Summary

- **Current Shares**: Always shows if calculations exist
- **Total Invested**: Only if > 0
- **Total Proceeds**: Only if > 0
- **Net Cost Basis**: Only if > 0
- **Avg Cost/Share**: Only if > 0 and current shares > 0

---

## Example Scenarios

### Scenario 1: Simple Buy and Hold

**Ledger:**
- BUY: 200 shares @ ₹100

**Summary:**
- Current Shares: 200
- Total Invested: ₹20,000
- Avg Cost/Share: ₹100

*(No proceeds shown because nothing sold)*

---

### Scenario 2: Multiple Buys at Different Prices

**Ledger:**
- BUY: 100 shares @ ₹150
- BUY: 100 shares @ ₹200

**Summary:**
- Current Shares: 200
- Total Invested: ₹35,000
- Avg Cost/Share: ₹175

---

### Scenario 3: Buys and Sells

**Ledger:**
- BUY: 100 shares @ ₹150 (₹15,000)
- BUY: 50 shares @ ₹180 (₹9,000)
- SELL: 40 shares @ ₹220 (₹8,800)

**Summary:**
- Current Shares: 110
- Total Invested: ₹24,000
- Total Proceeds: ₹8,800
- Net Cost Basis: ₹15,200
- Avg Cost/Share: ₹138.18

---

### Scenario 4: All Sold

**Ledger:**
- BUY: 100 shares @ ₹150
- SELL: 100 shares @ ₹200

**Summary:**
- Current Shares: 0
- Total Invested: ₹15,000
- Total Proceeds: ₹20,000
- Net Cost Basis: -₹5,000 (profit)

*(Avg cost per share doesn't show when shares = 0)*

---

### Scenario 5: No Prices Specified

**Ledger:**
- BUY: 100 shares (no price)
- NOTE: "Inherited from grandfather"

**Summary:**
- Current Shares: 100

*(No amounts show because no prices specified)*

---

## Currency

All calculations use **Indian Rupees (₹)**.

The original app showed $ but now correctly uses ₹ throughout:
- Form placeholders
- Card displays
- Ledger entries
- Calculated summaries

---

## What This Does NOT Do

❌ Validate that you can't sell more than you own
❌ Track which specific shares were sold (FIFO/LIFO)
❌ Calculate capital gains or taxes
❌ Account for stock splits or dividends
❌ Connect to live market data
❌ Show current market value
❌ Calculate unrealized gains/losses

This is purely **cost basis tracking** from your documented transactions.

---

## Tips

1. **Always add prices** to BUY/SELL entries for accurate calculations
2. **Don't worry about the original fields** - they're just your initial reference
3. **Use NOTE entries** for context that doesn't affect numbers
4. **Check the summary** after adding ledger entries to verify calculations
5. **Document everything chronologically** for best results

---

## Technical Details

**Calculation happens in:** `storage.js` → `calculateHoldingSummary(holding)`

**Display happens in:** `app.js` → `createHoldingCard(holding)`

**Runs:** Every time holdings are displayed (after adding/deleting entries)

**Stored:** Calculations are NOT stored - they're computed on-the-fly from ledger entries
