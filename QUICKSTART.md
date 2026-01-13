# Quick Start Guide

## Run the App (30 seconds)

```bash
cd /Volumes/MiniExternal/Projects/Papa-Baby-Shares
python3 -m http.server 8000
```

Open browser: **http://localhost:8000**

---

## Your First Holding (1 minute)

1. Scroll to **"add holding"** section
2. Enter symbol: `AAPL`
3. Enter company: `Apple Inc.`
4. Enter shares: `100`
5. Click **"save holding"**

✅ Card appears below!

---

## Your First Ledger Entry (1 minute)

1. Find your holding card
2. Click **"add entry"** button
3. Select type: **buy**
4. Enter shares: `100`
5. Enter price: `150.00`
6. Add description: `Initial purchase`
7. Click **"save entry"**

✅ Entry saved!

---

## View Your Ledger (10 seconds)

1. Click **"show"** button in ledger section
2. See your entry with black border (buy type)
3. Click **"hide"** to collapse

---

## That's It!

You now know:
- ✅ How to add holdings
- ✅ How to add ledger entries
- ✅ How to view ledger history

For more details, see:
- `README.md` - Full documentation
- `LEDGER_GUIDE.md` - Complete ledger guide
- `CHANGELOG.md` - What's new

---

## Common Questions

**Q: Where is my data stored?**
A: In your browser's localStorage. Open DevTools → Application → Local Storage

**Q: Can I export my data?**
A: Coming soon! For now, data lives in your browser

**Q: What if I close the browser?**
A: Your data persists - it's saved automatically

**Q: Can I edit a holding or entry?**
A: Not yet - you can delete and re-add for now

**Q: Does this calculate anything?**
A: No - this is pure documentation, no math

---

## Next Steps

Try documenting one of your father's actual holdings:

1. Find a stock statement or document
2. Add the holding with basic info
3. Add ledger entries for each purchase date
4. Add notes about any context you remember

The ledger is most useful when you document the **history**, not just current state.
