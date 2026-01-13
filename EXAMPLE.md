# Example: Complete Walkthrough

This document shows a complete example of documenting your father's holding with calculations.

---

## Step 1: Add the Holding

Fill in the main form:
- **Symbol:** RELIANCE
- **Company Name:** Reliance Industries Limited
- **Shares:** 100 *(initial reference - won't auto-update)*
- **Date Acquired:** 2018-01-15
- **Purchase Price:** ₹1,200
- **Notes:** Initial purchase through ICICI Direct

Click **"save holding"**

**Card shows:**
```
RELIANCE
Reliance Industries Limited
─────────────────────
shares: 100
acquired: Jan 15, 2018
price/share: ₹1,200
─────────────────────
notes:
Initial purchase through ICICI Direct
```

*(No calculated summary yet - need ledger entries)*

---

## Step 2: Add First Ledger Entry (Initial Purchase)

Click **"add entry"** button on the card

**Fill in modal:**
- Date: 2018-01-15
- Entry Type: **buy**
- Shares: 100
- Price per share: 1200
- Description: Initial purchase through ICICI Direct

Click **"save entry"**

**Card now shows calculated summary:**
```
RELIANCE
Reliance Industries Limited
─────────────────────
shares: 100
acquired: Jan 15, 2018
price/share: ₹1,200
─────────────────────
notes:
Initial purchase through ICICI Direct
─────────────────────
CALCULATED FROM LEDGER
━━━━━━━━━━━━━━━━━━━━━
current shares:     100
total invested: ₹120,000
avg cost/share:   ₹1,200
─────────────────────
holdings ledger [show]
```

---

## Step 3: Add Second Purchase

Click **"add entry"** again

**Fill in modal:**
- Date: 2020-05-10
- Entry Type: **buy**
- Shares: 50
- Price per share: 1500
- Description: Added during COVID dip

Click **"save entry"**

**Card summary updates:**
```
CALCULATED FROM LEDGER
━━━━━━━━━━━━━━━━━━━━━
current shares:     150
total invested: ₹195,000
avg cost/share:   ₹1,300
```

**How it calculated:**
- Current Shares: 100 + 50 = 150
- Total Invested: (100 × ₹1,200) + (50 × ₹1,500) = ₹195,000
- Avg Cost: ₹195,000 ÷ 150 = ₹1,300

---

## Step 4: Add a Partial Sale

Click **"add entry"** again

**Fill in modal:**
- Date: 2021-08-20
- Entry Type: **sell**
- Shares: 40
- Price per share: 2100
- Description: Partial sale for home renovation

Click **"save entry"**

**Card summary updates:**
```
CALCULATED FROM LEDGER
━━━━━━━━━━━━━━━━━━━━━
current shares:     110
total invested: ₹195,000
total proceeds:  ₹84,000
net cost basis: ₹111,000
avg cost/share:   ₹1,009
```

**How it calculated:**
- Current Shares: 100 + 50 - 40 = 110
- Total Invested: ₹195,000 (unchanged)
- Total Proceeds: 40 × ₹2,100 = ₹84,000
- Net Cost Basis: ₹195,000 - ₹84,000 = ₹111,000
- Avg Cost: ₹111,000 ÷ 110 = ₹1,009.09

---

## Step 5: Add Context Note

Click **"add entry"** again

**Fill in modal:**
- Date: 2024-01-10
- Entry Type: **note**
- Shares: *(leave empty)*
- Price per share: *(leave empty)*
- Description: Dad says hold remaining for grandchildren's education

Click **"save entry"**

**Summary doesn't change** - note entries don't affect calculations.

But now when you click **"show"** in the ledger section, you see the complete history:

```
holdings ledger [hide]
─────────────────────
NOTE | Jan 10, 2024
"Dad says hold remaining for grandchildren's education"
[delete]

SELL | Aug 20, 2021
40 shares @ ₹2,100
"Partial sale for home renovation"
[delete]

BUY | May 10, 2020
50 shares @ ₹1,500
"Added during COVID dip"
[delete]

BUY | Jan 15, 2018
100 shares @ ₹1,200
"Initial purchase through ICICI Direct"
[delete]
```

---

## Final Card View

```
┌─────────────────────────────────────┐
│ RELIANCE                            │
│ Reliance Industries Limited         │
├─────────────────────────────────────┤
│ shares:      100                    │
│ acquired:    Jan 15, 2018           │
│ price/share: ₹1,200                 │
├─────────────────────────────────────┤
│ notes:                              │
│ Initial purchase through ICICI      │
│ Direct                              │
├─────────────────────────────────────┤
│ ▓▓▓ CALCULATED FROM LEDGER ▓▓▓      │
│                                     │
│ current shares:     110             │
│ total invested: ₹195,000            │
│ total proceeds:  ₹84,000            │
│ net cost basis: ₹111,000            │
│ avg cost/share:   ₹1,009            │
├─────────────────────────────────────┤
│ holdings ledger            [show]   │
├─────────────────────────────────────┤
│ [add entry]  [delete]               │
└─────────────────────────────────────┘
```

---

## Key Observations

### Original Fields vs Calculated
- **Original "shares: 100"** = what you manually entered (static)
- **Calculated "current shares: 110"** = computed from ledger (dynamic)
- Both coexist - use original as reference, calculated as truth

### What Gets Calculated
- Only BUY and SELL entries with shares and prices
- NOTE entry doesn't affect numbers
- Updates automatically when you add/delete entries

### Net Cost Basis
This shows your actual money still in the investment:
- Started with ₹195,000
- Got back ₹84,000 from sale
- Net invested: ₹111,000

### Average Cost Per Share
Your effective cost per share based on remaining holdings:
- ₹111,000 net cost ÷ 110 shares = ₹1,009/share
- This is your "break-even" price

---

## Real-World Use Case

If your father wants to know:
- **"How many shares do I have?"** → Current Shares: 110
- **"How much did I invest total?"** → Total Invested: ₹195,000
- **"What did I get back from selling?"** → Total Proceeds: ₹84,000
- **"How much money is still in it?"** → Net Cost Basis: ₹111,000
- **"What's my average price?"** → Avg Cost: ₹1,009

All answers come from the calculated summary!

---

## Try It Yourself

1. Open the app
2. Add RELIANCE holding
3. Follow steps above
4. See calculations update in real-time
5. Try clicking "show" to see full ledger history

**Pro tip:** Add actual dates from your father's statements for accurate historical records.
