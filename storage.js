/**
 * STORAGE.JS
 * Handles all data storage using browser's localStorage
 * localStorage stores data as strings, so we convert to/from JSON
 */

// The key name we use to store data in localStorage
const STORAGE_KEY = 'silentLedger_holdings';

/**
 * Generate a unique ID for each holding
 * Uses timestamp + random number to create unique identifier
 */
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Get the current timestamp in ISO format
 * Used for created_at and updated_at fields
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * LOAD ALL HOLDINGS from localStorage first, then check cloud for updates
 * Returns an array of holding objects
 * If nothing stored yet, returns empty array
 */
async function loadHoldings() {
    // Load from localStorage first (instant)
    let localHoldings = [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            localHoldings = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }

    // Try to sync with cloud in background
    try {
        const response = await fetch('/api/holdings');
        if (response.ok) {
            const cloudHoldings = await response.json();
            // If cloud has more recent data, use it
            if (cloudHoldings.length > localHoldings.length) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudHoldings));
                console.log('Synced from cloud:', cloudHoldings.length, 'holdings');
                return cloudHoldings;
            }
        }
    } catch (error) {
        console.warn('Cloud sync failed:', error);
    }

    return localHoldings;
}

/**
 * SAVE ALL HOLDINGS to localStorage and auto-sync to cloud
 * Takes an array of holdings and stores it
 */
async function saveHoldings(holdings) {
    try {
        // Convert the array to JSON string and save
        localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));

        // Auto-sync to cloud
        try {
            await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holdings })
            });
            console.log('✓ Auto-synced to cloud');
        } catch (syncError) {
            console.warn('Cloud sync failed (offline?):', syncError);
        }

        return true;
    } catch (error) {
        console.error('Error saving holdings:', error);
        return false;
    }
}

/**
 * ADD A NEW HOLDING
 * Takes holding data, adds ID and timestamps, saves to storage
 */
async function addHolding(holdingData) {
    try {
        // Load existing holdings
        const holdings = await loadHoldings();

        // Create new holding object with metadata
        // ledger_entries: array to store chronological history of this holding
        const newHolding = {
            id: generateId(),
            symbol: holdingData.symbol,
            company_name: holdingData.companyName || '',
            shares_count: holdingData.sharesCount || null,
            date_acquired: holdingData.dateAcquired || null,
            purchase_price: holdingData.purchasePrice || null,
            notes: holdingData.notes || '',
            ledger_entries: [], // New: array to store ledger history
            created_at: getCurrentTimestamp(),
            updated_at: getCurrentTimestamp()
        };

        // Add to the beginning of array (newest first)
        holdings.unshift(newHolding);

        // Save back to localStorage
        await saveHoldings(holdings);

        return newHolding;
    } catch (error) {
        console.error('Error adding holding:', error);
        return null;
    }
}

/**
 * DELETE A HOLDING by ID
 * Removes the holding from storage
 */
async function deleteHolding(id) {
    try {
        // Load all holdings
        let holdings = await loadHoldings();

        // Filter out the holding with matching ID
        holdings = holdings.filter(holding => holding.id !== id);

        // Save the updated array
        await saveHoldings(holdings);

        return true;
    } catch (error) {
        console.error('Error deleting holding:', error);
        return false;
    }
}

/**
 * GET A SINGLE HOLDING by ID
 * Returns the holding object or null if not found
 */
async function getHoldingById(id) {
    const holdings = await loadHoldings();
    return holdings.find(holding => holding.id === id) || null;
}

/**
 * UPDATE AN EXISTING HOLDING
 * Takes ID and new data, updates the holding
 */
async function updateHolding(id, updatedData) {
    try {
        const holdings = await loadHoldings();

        // Find the index of the holding to update
        const index = holdings.findIndex(holding => holding.id === id);

        if (index === -1) {
            console.error('Holding not found');
            return null;
        }

        // Update the holding while preserving ID, created_at, and ledger_entries
        holdings[index] = {
            ...holdings[index],
            symbol: updatedData.symbol,
            company_name: updatedData.companyName || '',
            shares_count: updatedData.sharesCount || null,
            date_acquired: updatedData.dateAcquired || null,
            purchase_price: updatedData.purchasePrice || null,
            notes: updatedData.notes || '',
            updated_at: getCurrentTimestamp()
        };

        // Save back to localStorage
        await saveHoldings(holdings);

        return holdings[index];
    } catch (error) {
        console.error('Error updating holding:', error);
        return null;
    }
}

/**
 * ========================================
 * LEDGER ENTRY FUNCTIONS
 * ========================================
 * These functions manage the chronological history
 * of activities for each holding (buys, sells, notes, etc.)
 */

/**
 * ADD A LEDGER ENTRY to a specific holding
 * Takes holding ID and entry data
 * Returns the updated holding or null on error
 */
async function addLedgerEntry(holdingId, entryData) {
    try {
        const holdings = await loadHoldings();

        // Find the holding
        const index = holdings.findIndex(h => h.id === holdingId);

        if (index === -1) {
            console.error('Holding not found');
            return null;
        }

        // Ensure ledger_entries array exists (for backwards compatibility)
        if (!holdings[index].ledger_entries) {
            holdings[index].ledger_entries = [];
        }

        // Create the new ledger entry
        const newEntry = {
            id: generateId(),
            date: entryData.date || getCurrentTimestamp().split('T')[0], // YYYY-MM-DD format
            entry_type: entryData.entryType || 'note', // buy, sell, transfer, note, other
            shares: entryData.shares || null, // Number of shares (for buy/sell)
            price_per_share: entryData.pricePerShare || null, // Price per share
            description: entryData.description || '', // Freeform text description
            created_at: getCurrentTimestamp()
        };

        // Add to the beginning of the array (newest first)
        holdings[index].ledger_entries.unshift(newEntry);

        // Update the holding's updated_at timestamp
        holdings[index].updated_at = getCurrentTimestamp();

        // Save back to localStorage
        await saveHoldings(holdings);

        return holdings[index];
    } catch (error) {
        console.error('Error adding ledger entry:', error);
        return null;
    }
}

/**
 * DELETE A LEDGER ENTRY
 * Removes a specific entry from a holding's ledger
 */
async function deleteLedgerEntry(holdingId, entryId) {
    try {
        const holdings = await loadHoldings();

        // Find the holding
        const index = holdings.findIndex(h => h.id === holdingId);

        if (index === -1) {
            console.error('Holding not found');
            return false;
        }

        // Ensure ledger_entries exists
        if (!holdings[index].ledger_entries) {
            return false;
        }

        // Filter out the entry with matching ID
        holdings[index].ledger_entries = holdings[index].ledger_entries.filter(
            entry => entry.id !== entryId
        );

        // Update the holding's updated_at timestamp
        holdings[index].updated_at = getCurrentTimestamp();

        // Save back to localStorage
        await saveHoldings(holdings);

        return true;
    } catch (error) {
        console.error('Error deleting ledger entry:', error);
        return false;
    }
}

/**
 * GET ALL LEDGER ENTRIES for a holding
 * Returns array of entries, sorted by date (newest first)
 */
async function getLedgerEntries(holdingId) {
    const holding = await getHoldingById(holdingId);

    if (!holding) {
        return [];
    }

    // Return ledger entries or empty array if none exist
    return holding.ledger_entries || [];
}

/**
 * ========================================
 * CALCULATION FUNCTIONS
 * ========================================
 * Calculate current holdings and cost basis from ledger entries
 */

/**
 * CALCULATE HOLDING SUMMARY from ledger entries
 * Returns object with calculated values:
 * - currentShares: Total shares currently held
 * - totalInvested: Total amount spent on buys (in ₹)
 * - totalProceeds: Total amount received from sells (in ₹)
 * - netCostBasis: Net cost (invested - proceeds) (in ₹)
 * - avgCostPerShare: Average cost per share (in ₹)
 * - hasCalculations: Whether any buy/sell entries exist
 */
function calculateHoldingSummary(holding) {
    // Default summary with no calculations
    const summary = {
        currentShares: 0,
        totalInvested: 0,
        totalProceeds: 0,
        netCostBasis: 0,
        avgCostPerShare: 0,
        hasCalculations: false
    };

    // If no ledger entries, return empty summary
    if (!holding.ledger_entries || holding.ledger_entries.length === 0) {
        return summary;
    }

    let buyShares = 0;
    let sellShares = 0;
    let investedAmount = 0;
    let proceedsAmount = 0;

    // Loop through all ledger entries
    holding.ledger_entries.forEach(entry => {
        const shares = parseFloat(entry.shares) || 0;
        const price = parseFloat(entry.price_per_share) || 0;

        // Process BUY entries
        if (entry.entry_type === 'buy' && shares > 0) {
            buyShares += shares;

            // Only add to invested amount if price is specified
            if (price > 0) {
                investedAmount += (shares * price);
            }
        }

        // Process SELL entries
        if (entry.entry_type === 'sell' && shares > 0) {
            sellShares += shares;

            // Only add to proceeds if price is specified
            if (price > 0) {
                proceedsAmount += (shares * price);
            }
        }
    });

    // Calculate current shares
    summary.currentShares = buyShares - sellShares;

    // Calculate totals
    summary.totalInvested = investedAmount;
    summary.totalProceeds = proceedsAmount;
    summary.netCostBasis = investedAmount - proceedsAmount;

    // Calculate average cost per share (avoid division by zero)
    if (summary.currentShares > 0 && summary.netCostBasis > 0) {
        summary.avgCostPerShare = summary.netCostBasis / summary.currentShares;
    }

    // Mark that we have calculations if any buy or sell entries exist
    summary.hasCalculations = (buyShares > 0 || sellShares > 0);

    return summary;
}

/**
 * ========================================
 * EXPORT / IMPORT FUNCTIONS
 * ========================================
 * Export and import all holdings data as JSON
 */

/**
 * EXPORT ALL DATA as JSON string
 * Returns JSON string of all holdings
 */
async function exportAllData() {
    const holdings = await loadHoldings();
    return JSON.stringify(holdings, null, 2);
}

/**
 * IMPORT DATA from JSON string
 * Merges imported data with existing data
 * Returns object with success status and message
 */
async function importAllData(jsonString) {
    try {
        const importedHoldings = JSON.parse(jsonString);

        // Validate that it's an array
        if (!Array.isArray(importedHoldings)) {
            return {
                success: false,
                message: 'Invalid data format. Expected an array of holdings.'
            };
        }

        // Get existing holdings
        const existingHoldings = await loadHoldings();

        // Merge: Add imported holdings to existing ones
        const mergedHoldings = [...existingHoldings, ...importedHoldings];

        // Save merged data
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
