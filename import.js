/**
 * IMPORT.JS
 * Handles CSV file parsing and data import
 */

/**
 * PARSE CSV FILE
 * Takes a CSV file and returns array of objects
 * First row is assumed to be headers
 */
function parseCSV(csvText) {
    try {
        // Split into lines
        const lines = csvText.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Parse first line as headers
        const headers = parseCSVLine(lines[0]);

        // Parse remaining lines as data
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);

            // Create object with headers as keys
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            data.push(row);
        }

        return {
            headers: headers,
            data: data,
            rowCount: data.length
        };
    } catch (error) {
        console.error('Error parsing CSV:', error);
        throw error;
    }
}

/**
 * PARSE CSV LINE
 * Handles quoted fields and commas within quotes
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add last field
    result.push(current.trim());

    return result;
}

/**
 * DETECT COLUMN MAPPING
 * Attempts to auto-map CSV columns to holding fields
 * Returns suggested mapping
 */
function detectColumnMapping(headers) {
    const mapping = {
        symbol: null,
        companyName: null,
        sharesCount: null,
        dateAcquired: null,
        purchasePrice: null,
        notes: null
    };

    // Field name patterns to match
    const patterns = {
        symbol: ['symbol', 'ticker', 'stock', 'code', 'scrip'],
        companyName: ['company', 'name', 'companyname', 'company name'],
        sharesCount: ['shares', 'quantity', 'qty', 'units', 'share', 'no of shares'],
        dateAcquired: ['date', 'acquired', 'purchase date', 'buy date', 'date acquired'],
        purchasePrice: ['price', 'cost', 'purchase price', 'buy price', 'rate', 'price per share'],
        notes: ['notes', 'remarks', 'description', 'memo', 'comments']
    };

    // Try to match each header to a field
    headers.forEach(header => {
        const normalized = header.toLowerCase().trim();

        // Check each field pattern
        Object.keys(patterns).forEach(field => {
            if (mapping[field] === null) {
                // Check if header matches any pattern
                const matches = patterns[field].some(pattern =>
                    normalized.includes(pattern) || pattern.includes(normalized)
                );

                if (matches) {
                    mapping[field] = header;
                }
            }
        });
    });

    return mapping;
}

/**
 * VALIDATE CSV DATA
 * Checks if data has required fields
 */
function validateCSVData(data, mapping) {
    const errors = [];

    // Symbol is required
    if (!mapping.symbol) {
        errors.push('No column mapped to Symbol (required)');
    }

    // Check if any rows have symbol value
    if (mapping.symbol) {
        const hasSymbols = data.some(row => row[mapping.symbol] && row[mapping.symbol].trim());
        if (!hasSymbols) {
            errors.push('No valid symbols found in data');
        }
    }

    return errors;
}

/**
 * IMPORT HOLDINGS FROM CSV DATA
 * Takes parsed CSV data and mapping, imports to storage
 * Returns results object with success/error counts
 */
async function importHoldingsFromCSV(data, mapping) {
    const results = {
        total: data.length,
        success: 0,
        errors: 0,
        errorDetails: []
    };

    // Get existing holdings to check for duplicates
    const existingHoldings = await loadHoldings();
    const newHoldings = [];

    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        try {
            // Extract symbol (required)
            const symbol = row[mapping.symbol]?.trim().toUpperCase();

            if (!symbol) {
                throw new Error('Missing symbol');
            }

            // Build holding object
            const newHolding = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                symbol: symbol,
                company_name: mapping.companyName ? row[mapping.companyName]?.trim() : '',
                shares_count: mapping.sharesCount ? parseFloat(row[mapping.sharesCount]) || null : null,
                date_acquired: mapping.dateAcquired ? row[mapping.dateAcquired]?.trim() : null,
                purchase_price: mapping.purchasePrice ? parseFloat(row[mapping.purchasePrice]) || null : null,
                notes: mapping.notes ? row[mapping.notes]?.trim() : '',
                ledger_entries: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Add to new holdings array (not to existing holdings)
            newHoldings.push(newHolding);
            results.success++;
        } catch (error) {
            results.errors++;
            results.errorDetails.push({
                row: index + 1,
                error: error.message
            });
        }
    }

    // Combine existing holdings with new ones and save
    const allHoldings = [...existingHoldings, ...newHoldings];
    await saveHoldings(allHoldings);

    return results;
}
