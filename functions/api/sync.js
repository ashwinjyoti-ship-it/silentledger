// API endpoint for syncing all data

export async function onRequestPost({ request, env }) {
    try {
        const { holdings } = await request.json();

        // Begin transaction by processing all holdings
        for (const holding of holdings) {
            // Check if holding exists
            const { results } = await env.DB.prepare(
                'SELECT id FROM holdings WHERE id = ?'
            ).bind(holding.id).all();

            if (results.length === 0) {
                // Insert new holding
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
            } else {
                // Update existing holding
                await env.DB.prepare(`
                    UPDATE holdings
                    SET symbol = ?, company_name = ?, shares_count = ?, date_acquired = ?,
                        purchase_price = ?, notes = ?, updated_at = ?
                    WHERE id = ?
                `).bind(
                    holding.symbol,
                    holding.company_name || null,
                    holding.shares_count || null,
                    holding.date_acquired || null,
                    holding.purchase_price || null,
                    holding.notes || null,
                    holding.updated_at,
                    holding.id
                ).run();
            }

            // Sync ledger entries
            if (holding.ledger_entries) {
                for (const entry of holding.ledger_entries) {
                    const { results: entryResults } = await env.DB.prepare(
                        'SELECT id FROM ledger_entries WHERE id = ?'
                    ).bind(entry.id).all();

                    if (entryResults.length === 0) {
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
            }
        }

        return new Response(JSON.stringify({ success: true, synced: holdings.length }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
