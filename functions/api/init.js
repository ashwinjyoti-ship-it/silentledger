// API endpoint to initialize database tables
// This ensures tables exist before any operations

export async function onRequestPost({ env }) {
    try {
        // Create holdings table
        await env.DB.prepare(`
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
            )
        `).run();

        // Create ledger entries table
        await env.DB.prepare(`
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
            )
        `).run();

        // Create indexes
        await env.DB.prepare(`
            CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol)
        `).run();

        await env.DB.prepare(`
            CREATE INDEX IF NOT EXISTS idx_ledger_holding_id ON ledger_entries(holding_id)
        `).run();

        await env.DB.prepare(`
            CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger_entries(date)
        `).run();

        // Check if tables have data
        const { results: holdings } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM holdings'
        ).all();

        const { results: entries } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM ledger_entries'
        ).all();

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Database initialized successfully',
            holdings_count: holdings[0]?.count || 0,
            entries_count: entries[0]?.count || 0
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet({ env }) {
    try {
        // Return database status
        const { results: holdings } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM holdings'
        ).all();

        const { results: entries } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM ledger_entries'
        ).all();

        return new Response(JSON.stringify({ 
            success: true,
            connected: true,
            holdings_count: holdings[0]?.count || 0,
            entries_count: entries[0]?.count || 0
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false,
            connected: false,
            error: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
