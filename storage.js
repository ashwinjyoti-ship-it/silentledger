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
 * LOAD HOLDINGS FROM LOCALSTORAGE ONLY (FAST)
 * Used for operations that need quick access without cloud sync
 * Returns an array of holding objects from localStorage
 */
function loadHoldingsLocal() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return [];
}

/**
 * LOAD ALL HOLDINGS from localStorage first, then check cloud for updates
 * Returns an array of holding objects
 * If nothing stored yet, returns empty array
 */
async function loadHoldings() {
    // Update sync status
    updateSyncStatus('loading', 'Loading data...');

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
            
            // Always prefer cloud data if it exists
            if (cloudHoldings.length > 0) {
                // If cloud has data, use it and update localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudHoldings));
                console.log('✓ Synced from cloud:', cloudHoldings.length, 'holdings');
                updateSyncStatus('success', `✓ Loaded ${cloudHoldings.length} holdings from cloud`);
                return cloudHoldings;
            } else if (localHoldings.length > 0) {
                // Cloud is empty but local has data - sync local to cloud
                console.log('Cloud empty, syncing local data to cloud...');
                await saveHoldings(localHoldings);
                updateSyncStatus('success', `✓ Synced ${localHoldings.length} holdings to cloud`);
                return localHoldings;
            } else {
                updateSyncStatus('idle', 'No data - add your first holding');
                return [];
            }
        } else {
            // Cloud request failed, use local data
            console.warn('Cloud unavailable, using local data');
            updateSyncStatus('warning', `⚠ Offline mode - ${localHoldings.length} holdings from local storage`);
            return localHoldings;
        }
    } catch (error) {
        console.warn('Cloud sync failed:', error);
        updateSyncStatus('warning', `⚠ Offline mode - ${localHoldings.length} holdings from local storage`);
        return localHoldings;
    }
}

/**
 * UPDATE SYNC STATUS INDICATOR
 * Shows user the current sync status
 */
function updateSyncStatus(status, message) {
    const statusElement = document.getElementById('sync-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `sync-status sync-${status}`;
    }
}

/**
 * SAVE ALL HOLDINGS to localStorage and auto-sync to cloud
 * Takes an array of holdings and stores it
 */
async function saveHoldings(holdings) {
    try {
        // Update sync status
        updateSyncStatus('syncing', 'Saving...');

        // Convert the array to JSON string and save locally first
        localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));

        // Auto-sync to cloud
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holdings })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✓ Auto-synced to cloud:', result);
                updateSyncStatus('success', `✓ Saved ${holdings.length} holdings to cloud`);
            } else {
                throw new Error('Cloud sync failed');
            }
        } catch (syncError) {
            console.warn('Cloud sync failed (offline?):', syncError);
            updateSyncStatus('warning', '⚠ Saved locally only (cloud unavailable)');
        }

        return true;
    } catch (error) {
        console.error('Error saving holdings:', error);
        updateSyncStatus('error', '✗ Error saving data');
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
 * Removes the holding from storage and cloud database
 * Optimized for speed - uses localStorage and parallel API calls
 */
async function deleteHolding(id) {
    try {
        // Update sync status
        updateSyncStatus('syncing', 'Deleting...');

        // Load from localStorage (fast - no cloud call)
        let holdings = loadHoldingsLocal();

        // Filter out the holding with matching ID
        const originalLength = holdings.length;
        holdings = holdings.filter(holding => holding.id !== id);

        if (holdings.length === originalLength) {
            // Holding not found
            console.warn('Holding not found in local storage');
            updateSyncStatus('warning', '⚠ Holding not found');
            return false;
        }

        // Save to localStorage immediately (instant UI update)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));

        // Call both cloud APIs in parallel (faster)
        const deletePromises = [
            // Delete from database
            fetch('/api/holdings', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            }),
            // Sync full list to cloud
            fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holdings })
            })
        ];

        // Wait for both to complete
        try {
            const [deleteResponse, syncResponse] = await Promise.all(deletePromises);
            
            if (deleteResponse.ok && syncResponse.ok) {
                console.log('✓ Deleted from cloud database and synced');
                updateSyncStatus('success', '✓ Holding deleted');
            } else {
                console.warn('Cloud sync partially failed, but deleted locally');
                updateSyncStatus('warning', '⚠ Deleted locally (cloud sync issues)');
            }
        } catch (cloudError) {
            console.warn('Cloud API failed:', cloudError);
            updateSyncStatus('warning', '⚠ Deleted locally (cloud unavailable)');
        }

        return true;
    } catch (error) {
        console.error('Error deleting holding:', error);
        updateSyncStatus('error', '✗ Error deleting');
        return false;
    }
}

/**
 * GET A SINGLE HOLDING by ID
 * Returns the holding object or null if not found
 * Uses localStorage for speed
 */
function getHoldingById(id) {
    const holdings = loadHoldingsLocal();
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
