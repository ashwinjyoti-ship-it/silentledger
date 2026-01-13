// API endpoint for holdings CRUD operations

export async function onRequestGet({ env }) {
    try {
        // Get all holdings
        const { results: holdings } = await env.DB.prepare(
            'SELECT * FROM holdings ORDER BY created_at DESC'
        ).all();

        // Get all ledger entries
        const { results: entries } = await env.DB.prepare(
            'SELECT * FROM ledger_entries ORDER BY date DESC'
        ).all();

        // Attach ledger entries to their holdings
        holdings.forEach(holding => {
            holding.ledger_entries = entries.filter(e => e.holding_id === holding.id);
            // Parse numeric fields
            holding.shares_count = holding.shares_count ? parseFloat(holding.shares_count) : null;
            holding.purchase_price = holding.purchase_price ? parseFloat(holding.purchase_price) : null;

            holding.ledger_entries.forEach(entry => {
                entry.shares = entry.shares ? parseFloat(entry.shares) : null;
                entry.price_per_share = entry.price_per_share ? parseFloat(entry.price_per_share) : null;
            });
        });

        return new Response(JSON.stringify(holdings), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const holding = await request.json();

        // Insert holding
        await env.DB.prepare(`
            INSERT INTO holdings (id, symbol, company_name, shares_count, date_acquired,
                                purchase_price, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            holding.id,
            holding.symbol,
            holding.company_name || null,
            holding.shares_count || null,
            holding.date_acquired || null,
            holding.purchase_price || null,
            holding.notes || null,
            holding.created_at,
            holding.updated_at
        ).run();

        // Insert ledger entries if any
        if (holding.ledger_entries && holding.ledger_entries.length > 0) {
            for (const entry of holding.ledger_entries) {
                await env.DB.prepare(`
                    INSERT INTO ledger_entries (id, holding_id, date, entry_type,
                                              shares, price_per_share, description, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    entry.id,
                    holding.id,
                    entry.date,
                    entry.entry_type,
                    entry.shares || null,
                    entry.price_per_share || null,
                    entry.description || null,
                    entry.created_at
                ).run();
            }
        }

        return new Response(JSON.stringify({ success: true, id: holding.id }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete({ request, env }) {
    try {
        const { id } = await request.json();

        // Delete ledger entries first
        await env.DB.prepare('DELETE FROM ledger_entries WHERE holding_id = ?')
            .bind(id).run();

        // Delete holding
        await env.DB.prepare('DELETE FROM holdings WHERE id = ?')
            .bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
