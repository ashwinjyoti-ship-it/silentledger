/**
 * API endpoint for managing PDFs
 * Stores PDFs as base64 in D1 database
 */

export async function onRequest(context) {
    const { request, env } = context;
    const { pathname } = new URL(request.url);

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
        await db.batch([
            db.prepare(`
                CREATE TABLE IF NOT EXISTS pdfs (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    size TEXT,
                    size_bytes INTEGER,
                    data TEXT NOT NULL,
                    uploaded_at TEXT,
                    created_at TEXT
                )
            `)
        ]);
        console.log('PDFs table initialized');
    } catch (error) {
        console.error('Error creating pdfs table:', error);
        throw error;
    }
}

async function handleGet(db) {
    try {
        // Ensure table exists
        await initializeTables(db);
        
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

        // Check for size limits (D1 has 1MB per row limit)
        const MAX_SIZE = 1 * 1024 * 1024; // 1MB
        for (const pdf of pdfs) {
            const dataSize = pdf.data ? pdf.data.length : 0;
            if (dataSize > MAX_SIZE) {
                return new Response(JSON.stringify({ 
                    error: `PDF "${pdf.name}" is too large (${Math.round(dataSize/1024)}KB). Maximum size is 1MB.` 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
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
        return new Response(JSON.stringify({ 
            error: error.message,
            details: error.stack 
        }), {
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
