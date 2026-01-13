-- Schema for Silent Ledger database

-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT,
    shares_count REAL,
    date_acquired TEXT,
    purchase_price REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Ledger entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    holding_id TEXT NOT NULL,
    date TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    shares REAL,
    price_per_share REAL,
    description TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_ledger_holding_id ON ledger_entries(holding_id);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger_entries(date);
