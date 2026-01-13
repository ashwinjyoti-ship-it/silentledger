# Import & PDF Guide

## CSV Import Feature

### Overview
Import multiple holdings at once from a CSV file with automatic column mapping.

### How to Use

#### Step 1: Prepare Your CSV File

**Format Requirements:**
- First row must be headers
- At minimum, include a Symbol column
- Additional columns for Company, Shares, Date, Price, Notes

**Example CSV:**
```csv
Symbol,Company Name,Shares,Date Acquired,Purchase Price,Notes
RELIANCE,Reliance Industries,100,2018-01-15,1200,Initial purchase
TCS,Tata Consultancy Services,50,2019-06-10,2500,Long term hold
```

#### Step 2: Navigate to Import Tab

1. Click **"import csv"** tab in navigation
2. You'll see the file upload area

#### Step 3: Upload CSV

1. Click **"choose csv file"** or drag file
2. Select your CSV file
3. File is parsed automatically

#### Step 4: Map Columns

The app will attempt to auto-detect your columns:
- **Symbol** → Matches: symbol, ticker, stock, code
- **Company Name** → Matches: company, name
- **Shares** → Matches: shares, quantity, qty, units
- **Date Acquired** → Matches: date, acquired, purchase date
- **Purchase Price** → Matches: price, cost, rate
- **Notes** → Matches: notes, remarks, description

**Review and Adjust:**
- Check the "sample value" column
- Change mappings using dropdowns if needed
- Symbol field is REQUIRED

#### Step 5: Confirm Import

1. Review all mappings
2. Click **"import data"**
3. Watch progress bar
4. See results summary

#### Step 6: View Results

Results show:
- Total rows processed
- Successfully imported
- Errors (if any)

Click **"import another file"** to import more data.

---

## Column Mapping Details

### Auto-Detection

The app recognizes common column names:

| Field | Matches These Names |
|-------|-------------------|
| Symbol | symbol, ticker, stock, code, scrip |
| Company | company, name, companyname, company name |
| Shares | shares, quantity, qty, units, share, no of shares |
| Date | date, acquired, purchase date, buy date, date acquired |
| Price | price, cost, purchase price, buy price, rate, price per share |
| Notes | notes, remarks, description, memo, comments |

### Manual Mapping

If auto-detection fails:
1. Use dropdown for each field
2. Select corresponding CSV column
3. View sample value to confirm
4. Only Symbol is required

---

## PDF Viewer Feature

### Overview
Upload and view PDF statements (broker statements, Rediff Money reports, etc.) without leaving the app.

### How to Use

#### Step 1: Navigate to PDFs Tab

Click **"view pdfs"** tab in navigation

#### Step 2: Upload PDFs

1. Click **"upload pdf statements"**
2. Select one or multiple PDF files
3. PDFs are loaded immediately

#### Step 3: View PDFs

**PDF List (left side):**
- Shows all uploaded PDFs
- Displays file name and size
- Click any PDF to view it

**PDF Viewer (right side):**
- Shows selected PDF
- Full page display
- Native browser PDF controls (zoom, page navigation, etc.)

#### Step 4: Delete PDFs

- Click **"delete"** button on any PDF in list
- Confirmation required
- PDF is removed from list and viewer

---

## Use Cases

### Use Case 1: Import Existing Portfolio

**Scenario:** You have holdings in a spreadsheet

**Steps:**
1. Open your spreadsheet (Excel, Google Sheets)
2. Ensure first row has headers
3. Save as CSV
4. Import to Silent Ledger
5. Review imported holdings in Holdings tab

### Use Case 2: Import from Broker Statement

**Scenario:** Downloaded CSV from broker

**Steps:**
1. Download holdings CSV from broker website
2. Go to Import CSV tab
3. Upload the CSV
4. Map broker's columns to app fields
5. Import
6. Add ledger entries for historical transactions

### Use Case 3: View PDF Statements

**Scenario:** Keep PDF records for reference

**Steps:**
1. Download PDF statements from Rediff Money/broker
2. Go to View PDFs tab
3. Upload PDFs
4. Click to view anytime
5. Reference while entering data manually

### Use Case 4: Mixed Workflow

**Scenario:** Some data in CSV, some needs manual entry

**Steps:**
1. Import bulk data from CSV
2. Switch to Holdings tab
3. Manually add missing holdings
4. Add detailed ledger entries to each
5. Keep PDFs for reference in PDF tab

---

## Tips & Best Practices

### CSV Import Tips

1. **Clean your data first**
   - Remove empty rows
   - Ensure consistent date formats (YYYY-MM-DD best)
   - Remove special characters from numbers

2. **Test with small file**
   - Import 2-3 rows first
   - Verify mapping is correct
   - Then import full file

3. **Symbol is key**
   - Always include Symbol column
   - Use standard ticker symbols
   - Uppercase recommended (app does this automatically)

4. **Optional fields**
   - Can leave Company, Shares, Price blank
   - Fill in manually later
   - Or add via ledger entries

5. **Duplicate symbols**
   - App allows duplicate symbols
   - Useful if bought same stock multiple times
   - Use notes to differentiate

### PDF Viewer Tips

1. **File size**
   - Smaller PDFs load faster
   - No size limit but large files may slow browser

2. **Organization**
   - Use descriptive file names
   - Name pattern: "Broker-Statement-2024-01.pdf"
   - Easier to find later

3. **Browser support**
   - Works in all modern browsers
   - Chrome/Edge recommended for best PDF rendering

4. **Multiple PDFs**
   - Can upload many at once
   - All stored in browser session
   - Clear when you close/refresh page (temporary storage)

---

## Troubleshooting

### CSV Import Issues

**"CSV file is empty"**
- Check file has content
- Ensure it's actually CSV format
- Try opening in text editor to verify

**"No column mapped to Symbol"**
- Symbol column is required
- Manually select Symbol column from dropdown
- Or add Symbol column to your CSV

**"No valid symbols found in data"**
- All Symbol cells are empty
- Check your CSV data
- At least one row must have a symbol

**Partial import success**
- Some rows imported, some failed
- Check results summary
- Failed rows likely missing required data
- Re-import failed rows after fixing

### PDF Viewer Issues

**PDF not displaying**
- Check file is actually PDF format
- Try different browser
- File might be corrupted

**PDF controls not working**
- Use browser's built-in PDF controls
- Right-click for options
- Zoom with Ctrl/Cmd + mouse wheel

**PDFs disappeared**
- PDFs only stored temporarily
- Refreshing page clears them
- Re-upload when needed
- We'll add persistent storage in future version

---

## What's NOT Supported Yet

### CSV Import
- ❌ Import ledger entries from CSV (only holdings)
- ❌ Update existing holdings (always creates new)
- ❌ Validation of date formats
- ❌ Bulk edit after import
- ❌ Import preview before confirming

### PDF Viewer
- ❌ PDF text extraction (read-only view)
- ❌ PDF annotation
- ❌ PDF editing
- ❌ Persistent PDF storage (cleared on refresh)
- ❌ PDF data extraction to holdings

These features may come in future versions!

---

## Sample CSV File

A sample CSV is included: `sample-holdings.csv`

Contains:
- 5 example Indian stocks
- All fields filled
- Ready to import for testing

Try importing it to see how the feature works!
