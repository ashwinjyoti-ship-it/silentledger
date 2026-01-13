/**
 * API-STORAGE.JS
 * Handles data storage using Cloudflare D1 database via API
 * Falls back to localStorage if API is unavailable
 */

const API_BASE = '/api';
const STORAGE_KEY = 'silentLedger_holdings';

// Check if we're online and can reach the API
let useAPI = true;

/**
 * Generate a unique ID
 */
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Get current timestamp
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * SYNC local data to server
 */
async function syncToServer() {
    try {
        const localHoldings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        const response = await fetch(`${API_BASE}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ holdings: localHoldings })
        });

        if (!response.ok) throw new Error('Sync failed');

        const result = await response.json();
        console.log('Synced to server:', result);
        return true;
    } catch (error) {
        console.error('Sync error:', error);
        return false;
    }
}

/**
 * LOAD ALL HOLDINGS from API or localStorage
 */
async function loadHoldings() {
    try {
        if (useAPI) {
            const response = await fetch(`${API_BASE}/holdings`);

            if (response.ok) {
                const holdings = await response.json();
                // Update localStorage as cache
                localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
                return holdings;
            }
        }
    } catch (error) {
        console.warn('API unavailable, using localStorage:', error);
        useAPI = false;
    }

    // Fallback to localStorage
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading holdings:', error);
        return [];
    }
}

/**
 * SAVE ALL HOLDINGS to localStorage and API
 */
async function saveHoldings(holdings) {
    try {
        // Always save to localStorage first (instant)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));

        // Try to sync to API
        if (useAPI) {
            await syncToServer();
        }
    } catch (error) {
        console.error('Error saving holdings:', error);
    }
}

/**
 * ADD HOLDING
 */
async function addHolding(holdingData) {
    const newHolding = {
        id: generateId(),
        symbol: holdingData.symbol.toUpperCase(),
        company_name: holdingData.companyName || '',
        shares_count: holdingData.sharesCount || null,
        date_acquired: holdingData.dateAcquired || null,
        purchase_price: holdingData.purchasePrice || null,
        notes: holdingData.notes || '',
        ledger_entries: [],
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
    };

    const holdings = await loadHoldings();
    holdings.push(newHolding);
    await saveHoldings(holdings);

    // Try to post to API
    if (useAPI) {
        try {
            await fetch(`${API_BASE}/holdings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHolding)
            });
        } catch (error) {
            console.warn('Failed to post to API:', error);
        }
    }

    return newHolding;
}

/**
 * DELETE HOLDING
 */
async function deleteHolding(id) {
    const holdings = await loadHoldings();
    const filtered = holdings.filter(h => h.id !== id);
    await saveHoldings(filtered);

    // Try to delete from API
    if (useAPI) {
        try {
            await fetch(`${API_BASE}/holdings`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (error) {
            console.warn('Failed to delete from API:', error);
        }
    }
}

/**
 * ADD LEDGER ENTRY
 */
async function addLedgerEntry(holdingId, entryData) {
    const newEntry = {
        id: generateId(),
        date: entryData.date,
        entry_type: entryData.entryType,
        shares: entryData.shares || null,
        price_per_share: entryData.pricePerShare || null,
        description: entryData.description || '',
        created_at: getCurrentTimestamp()
    };

    const holdings = await loadHoldings();
    const holding = holdings.find(h => h.id === holdingId);

    if (holding) {
        if (!holding.ledger_entries) {
            holding.ledger_entries = [];
        }
        holding.ledger_entries.push(newEntry);
        holding.updated_at = getCurrentTimestamp();
        await saveHoldings(holdings);
    }

    return newEntry;
}

/**
 * DELETE LEDGER ENTRY
 */
async function deleteLedgerEntry(holdingId, entryId) {
    const holdings = await loadHoldings();
    const holding = holdings.find(h => h.id === holdingId);

    if (holding && holding.ledger_entries) {
        holding.ledger_entries = holding.ledger_entries.filter(e => e.id !== entryId);
        holding.updated_at = getCurrentTimestamp();
        await saveHoldings(holdings);
    }
}

/**
 * CALCULATE HOLDING SUMMARY
 */
function calculateHoldingSummary(holding) {
    const summary = {
        currentShares: 0,
        totalInvested: 0,
        totalProceeds: 0,
        netCostBasis: 0,
        avgCostPerShare: 0,
        hasCalculations: false
    };

    if (!holding.ledger_entries || holding.ledger_entries.length === 0) {
        return summary;
    }

    let buyShares = 0;
    let sellShares = 0;
    let investedAmount = 0;
    let proceedsAmount = 0;

    holding.ledger_entries.forEach(entry => {
        const shares = parseFloat(entry.shares) || 0;
        const price = parseFloat(entry.price_per_share) || 0;

        if (entry.entry_type === 'buy' && shares > 0) {
            buyShares += shares;
            if (price > 0) investedAmount += (shares * price);
        }

        if (entry.entry_type === 'sell' && shares > 0) {
            sellShares += shares;
            if (price > 0) proceedsAmount += (shares * price);
        }
    });

    summary.currentShares = buyShares - sellShares;
    summary.totalInvested = investedAmount;
    summary.totalProceeds = proceedsAmount;
    summary.netCostBasis = investedAmount - proceedsAmount;

    if (summary.currentShares > 0 && summary.netCostBasis > 0) {
        summary.avgCostPerShare = summary.netCostBasis / summary.currentShares;
    }

    summary.hasCalculations = (buyShares > 0 || sellShares > 0);
    return summary;
}

/**
 * EXPORT DATA
 */
function exportAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data || '[]';
}

/**
 * IMPORT DATA
 */
async function importAllData(jsonString) {
    try {
        const importedHoldings = JSON.parse(jsonString);

        if (!Array.isArray(importedHoldings)) {
            return {
                success: false,
                message: 'Invalid data format. Expected an array of holdings.'
            };
        }

        const existingHoldings = await loadHoldings();
        const mergedHoldings = [...existingHoldings, ...importedHoldings];
        await saveHoldings(mergedHoldings);

        return {
            success: true,
            message: `Successfully imported ${importedHoldings.length} holdings.`,
            count: importedHoldings.length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error parsing JSON data: ' + error.message
        };
    }
}
