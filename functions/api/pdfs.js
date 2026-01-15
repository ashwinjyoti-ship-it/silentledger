/**
 * API endpoint for managing PDFs
 * Stores PDFs as base64 in D1 database
 */

export async function onRequest(context) {
    const { request, env } = context;
    const { pathname } = new URL(request.url);
    
    // Initialize database tables if they don't exist
    await initializeTables(env.DB);

    if (request.method === 'GET') {
        return handleGet(env.DB);
    } else if (request.method === 'POST') {
        return handlePost(request, env.DB);
    } else if (request.method === 'DELETE') {
        return handleDelete(request, env.DB);
    }

    return new Response('Method not allowed', { status: 405 });
}

async function initializeTables(db) {
    try {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS pdfs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                size TEXT,
                size_bytes INTEGER,
                data TEXT NOT NULL,
                uploaded_at TEXT,
                created_at TEXT
            )
        `);
    } catch (error) {
        console.error('Error creating pdfs table:', error);
    }
}

async function handleGet(db) {
    try {
        const result = await db.prepare('SELECT * FROM pdfs ORDER BY created_at DESC').all();
        
        return new Response(JSON.stringify(result.results || []), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error getting PDFs:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handlePost(request, db) {
    try {
        const { pdfs } = await request.json();
        
        if (!Array.isArray(pdfs)) {
            return new Response(JSON.stringify({ error: 'pdfs must be an array' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete all existing PDFs
        await db.prepare('DELETE FROM pdfs').run();

        // Insert all PDFs
        for (const pdf of pdfs) {
            await db.prepare(`
                INSERT INTO pdfs (id, name, size, size_bytes, data, uploaded_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                pdf.id,
                pdf.name,
                pdf.size,
                pdf.sizeBytes || 0,
                pdf.data,
                pdf.uploadedAt,
                new Date().toISOString()
            ).run();
        }

        return new Response(JSON.stringify({ 
            success: true, 
            synced: pdfs.length 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error syncing PDFs:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleDelete(request, db) {
    try {
        const { id } = await request.json();
        
        await db.prepare('DELETE FROM pdfs WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error deleting PDF:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
