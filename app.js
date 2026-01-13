/**
 * APP.JS
 * Main application logic - handles UI and user interactions
 */

// Wait for the page to fully load before running any code
document.addEventListener('DOMContentLoaded', function() {
    console.log('Silent Ledger initialized');

    // Get references to important DOM elements
    const holdingForm = document.getElementById('holdingForm');
    const holdingsGrid = document.getElementById('holdingsGrid');
    const emptyState = document.getElementById('emptyState');

    // Ledger modal elements
    const ledgerModal = document.getElementById('ledgerModal');
    const ledgerEntryForm = document.getElementById('ledgerEntryForm');
    const closeLedgerModalBtn = document.getElementById('closeLedgerModal');
    const cancelLedgerEntryBtn = document.getElementById('cancelLedgerEntry');
    const ledgerHoldingIdInput = document.getElementById('ledgerHoldingId');

    /**
     * INITIALIZE THE APP
     * Load and display existing holdings when page loads
     */
    function init() {
        displayHoldings();
    }

    /**
     * DISPLAY ALL HOLDINGS
     * Loads holdings from storage and creates cards for each
     */
    function displayHoldings() {
        // Load all holdings from localStorage
        const holdings = loadHoldings();

        // Clear the grid
        holdingsGrid.innerHTML = '';

        // If no holdings exist, show empty state
        if (holdings.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        // Hide empty state
        emptyState.classList.add('hidden');

        // Create a card for each holding
        holdings.forEach(holding => {
            const card = createHoldingCard(holding);
            holdingsGrid.appendChild(card);
        });
    }

    /**
     * CREATE A HOLDING CARD
     * Takes a holding object and returns a DOM element (card)
     */
    function createHoldingCard(holding) {
        // Create the main card container
        const card = document.createElement('div');
        card.className = 'holding-card';
        card.dataset.id = holding.id; // Store ID for reference

        // Calculate summary from ledger entries
        const summary = calculateHoldingSummary(holding);

        // Build the card HTML
        card.innerHTML = `
            <!-- Card header with symbol and company -->
            <div class="card-header">
                <div class="card-symbol">${holding.symbol}</div>
            </div>

            ${holding.company_name ? `
                <div class="card-company">${holding.company_name}</div>
            ` : ''}

            <!-- Card data rows -->
            <div class="card-data">
                ${holding.shares_count ? `
                    <div class="card-row">
                        <span class="card-label">shares:</span>
                        <span class="card-value">${formatNumber(holding.shares_count)}</span>
                    </div>
                ` : ''}

                ${holding.date_acquired ? `
                    <div class="card-row">
                        <span class="card-label">acquired:</span>
                        <span class="card-value">${formatDate(holding.date_acquired)}</span>
                    </div>
                ` : ''}

                ${holding.purchase_price ? `
                    <div class="card-row">
                        <span class="card-label">price/share:</span>
                        <span class="card-value">₹${formatNumber(holding.purchase_price)}</span>
                    </div>
                ` : ''}
            </div>

            <!-- Notes section (if notes exist) -->
            ${holding.notes ? `
                <div class="card-notes">
                    <div class="card-notes-label">notes:</div>
                    <div class="card-notes-text">${escapeHtml(holding.notes)}</div>
                </div>
            ` : ''}

            <!-- Calculated Summary (only show if ledger has buy/sell entries) -->
            ${summary.hasCalculations ? `
                <div class="card-summary">
                    <div class="card-summary-title">calculated from ledger</div>

                    <div class="summary-row summary-row-highlight">
                        <span class="summary-label">current shares:</span>
                        <span class="summary-value">${formatNumber(summary.currentShares)}</span>
                    </div>

                    ${summary.totalInvested > 0 ? `
                        <div class="summary-row">
                            <span class="summary-label">total invested:</span>
                            <span class="summary-value">₹${formatNumber(summary.totalInvested)}</span>
                        </div>
                    ` : ''}

                    ${summary.totalProceeds > 0 ? `
                        <div class="summary-row">
                            <span class="summary-label">total proceeds:</span>
                            <span class="summary-value">₹${formatNumber(summary.totalProceeds)}</span>
                        </div>
                    ` : ''}

                    ${summary.netCostBasis > 0 ? `
                        <div class="summary-row">
                            <span class="summary-label">net cost basis:</span>
                            <span class="summary-value">₹${formatNumber(summary.netCostBasis)}</span>
                        </div>
                    ` : ''}

                    ${summary.avgCostPerShare > 0 ? `
                        <div class="summary-row">
                            <span class="summary-label">avg cost/share:</span>
                            <span class="summary-value">₹${formatNumber(summary.avgCostPerShare)}</span>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Ledger section -->
            <div class="card-ledger">
                <div class="card-ledger-header">
                    <span class="card-ledger-title">holdings ledger</span>
                    <button class="btn-toggle-ledger" data-id="${holding.id}">
                        ${holding.ledger_entries && holding.ledger_entries.length > 0 ? 'show' : 'empty'}
                    </button>
                </div>

                <!-- Ledger entries container (hidden by default) -->
                <div class="ledger-entries hidden" data-holding-id="${holding.id}">
                    ${createLedgerEntriesHTML(holding)}
                </div>
            </div>

            <!-- Card actions -->
            <div class="card-actions">
                <button class="btn-small btn-add-entry" data-id="${holding.id}">add entry</button>
                <button class="btn-small btn-delete" data-id="${holding.id}">delete</button>
            </div>
        `;

        // Add event listeners to buttons
        const deleteBtn = card.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', handleDelete);

        const addEntryBtn = card.querySelector('.btn-add-entry');
        addEntryBtn.addEventListener('click', handleAddLedgerEntry);

        const toggleLedgerBtn = card.querySelector('.btn-toggle-ledger');
        toggleLedgerBtn.addEventListener('click', handleToggleLedger);

        return card;
    }

    /**
     * CREATE LEDGER ENTRIES HTML
     * Generates HTML for all ledger entries of a holding
     */
    function createLedgerEntriesHTML(holding) {
        // If no entries exist, show empty message
        if (!holding.ledger_entries || holding.ledger_entries.length === 0) {
            return '<div class="ledger-empty">no entries yet</div>';
        }

        // Build HTML for each entry
        let html = '';
        holding.ledger_entries.forEach(entry => {
            html += `
                <div class="ledger-entry" data-type="${entry.entry_type}">
                    <div class="ledger-entry-header">
                        <span class="ledger-entry-type">${entry.entry_type}</span>
                        <span class="ledger-entry-date">${formatDate(entry.date)}</span>
                    </div>

                    ${entry.shares || entry.price_per_share ? `
                        <div class="ledger-entry-details">
                            ${entry.shares ? `${formatNumber(entry.shares)} shares` : ''}
                            ${entry.shares && entry.price_per_share ? ' @ ' : ''}
                            ${entry.price_per_share ? `₹${formatNumber(entry.price_per_share)}` : ''}
                        </div>
                    ` : ''}

                    ${entry.description ? `
                        <div class="ledger-entry-description">${escapeHtml(entry.description)}</div>
                    ` : ''}

                    <button class="btn-small ledger-entry-delete"
                            data-holding-id="${holding.id}"
                            data-entry-id="${entry.id}">
                        delete
                    </button>
                </div>
            `;
        });

        return html;
    }

    /**
     * HANDLE FORM SUBMISSION
     * Called when user submits the "add holding" form
     */
    function handleFormSubmit(event) {
        // Prevent default form submission (which would reload page)
        event.preventDefault();

        // Get form data
        const formData = {
            symbol: document.getElementById('symbol').value.trim().toUpperCase(),
            companyName: document.getElementById('companyName').value.trim(),
            sharesCount: document.getElementById('sharesCount').value,
            dateAcquired: document.getElementById('dateAcquired').value,
            purchasePrice: document.getElementById('purchasePrice').value,
            notes: document.getElementById('notes').value.trim()
        };

        // Validate required field
        if (!formData.symbol) {
            alert('Symbol is required');
            return;
        }

        // Add the holding to storage
        const newHolding = addHolding(formData);

        if (newHolding) {
            console.log('Holding added:', newHolding);

            // Reset the form
            holdingForm.reset();

            // Refresh the display
            displayHoldings();

            // Optional: Show success message
            showMessage('Holding added successfully');
        } else {
            alert('Error adding holding. Please try again.');
        }
    }

    /**
     * HANDLE DELETE BUTTON CLICK
     * Removes a holding after confirmation
     */
    function handleDelete(event) {
        const holdingId = event.target.dataset.id;

        // Get the holding details for confirmation message
        const holding = getHoldingById(holdingId);

        if (!holding) {
            alert('Holding not found');
            return;
        }

        // Ask for confirmation
        const confirmed = confirm(
            `Delete ${holding.symbol}?\n\nThis action cannot be undone.`
        );

        if (confirmed) {
            // Delete from storage
            const success = deleteHolding(holdingId);

            if (success) {
                console.log('Holding deleted:', holdingId);

                // Refresh the display
                displayHoldings();

                // Optional: Show success message
                showMessage('Holding deleted');
            } else {
                alert('Error deleting holding. Please try again.');
            }
        }
    }

    /**
     * SHOW TEMPORARY MESSAGE
     * Displays a temporary success/info message to user
     */
    function showMessage(message) {
        // Simple console log for now
        // In future, could add a toast notification
        console.log('Message:', message);
    }

    /**
     * ========================================
     * LEDGER FUNCTIONALITY
     * ========================================
     */

    /**
     * HANDLE TOGGLE LEDGER
     * Show/hide ledger entries when user clicks toggle button
     */
    function handleToggleLedger(event) {
        const holdingId = event.target.dataset.id;
        const ledgerContainer = document.querySelector(`.ledger-entries[data-holding-id="${holdingId}"]`);

        if (ledgerContainer) {
            // Toggle visibility
            ledgerContainer.classList.toggle('hidden');

            // Update button text
            const isHidden = ledgerContainer.classList.contains('hidden');
            event.target.textContent = isHidden ? 'show' : 'hide';
        }
    }

    /**
     * HANDLE ADD LEDGER ENTRY BUTTON
     * Opens modal to add a new ledger entry
     */
    function handleAddLedgerEntry(event) {
        const holdingId = event.target.dataset.id;

        // Store the holding ID in hidden field
        ledgerHoldingIdInput.value = holdingId;

        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;

        // Show the modal
        ledgerModal.classList.remove('hidden');
    }

    /**
     * CLOSE LEDGER MODAL
     * Hides the modal and resets the form
     */
    function closeLedgerModal() {
        ledgerModal.classList.add('hidden');
        ledgerEntryForm.reset();
    }

    /**
     * HANDLE LEDGER ENTRY FORM SUBMISSION
     * Saves the new ledger entry and refreshes display
     */
    function handleLedgerEntrySubmit(event) {
        event.preventDefault();

        // Get form data
        const holdingId = ledgerHoldingIdInput.value;
        const entryData = {
            date: document.getElementById('entryDate').value,
            entryType: document.getElementById('entryType').value,
            shares: document.getElementById('entryShares').value,
            pricePerShare: document.getElementById('entryPrice').value,
            description: document.getElementById('entryDescription').value.trim()
        };

        // Validate
        if (!holdingId || !entryData.date || !entryData.entryType) {
            alert('Date and entry type are required');
            return;
        }

        // Add the entry to storage
        const updatedHolding = addLedgerEntry(holdingId, entryData);

        if (updatedHolding) {
            console.log('Ledger entry added:', entryData);

            // Close modal
            closeLedgerModal();

            // Refresh the display
            displayHoldings();

            showMessage('Ledger entry added');
        } else {
            alert('Error adding ledger entry. Please try again.');
        }
    }

    /**
     * HANDLE DELETE LEDGER ENTRY
     * Removes a ledger entry after confirmation
     */
    function handleDeleteLedgerEntry(event) {
        const holdingId = event.target.dataset.holdingId;
        const entryId = event.target.dataset.entryId;

        // Ask for confirmation
        const confirmed = confirm('Delete this ledger entry?\n\nThis action cannot be undone.');

        if (confirmed) {
            const success = deleteLedgerEntry(holdingId, entryId);

            if (success) {
                console.log('Ledger entry deleted:', entryId);

                // Refresh the display
                displayHoldings();

                showMessage('Ledger entry deleted');
            } else {
                alert('Error deleting ledger entry. Please try again.');
            }
        }
    }

    /**
     * UTILITY FUNCTIONS
     */

    // Format numbers with commas
    function formatNumber(num) {
        if (!num) return '0';
        return parseFloat(num).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    // Format date in readable format
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Escape HTML to prevent XSS (security measure)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * EVENT LISTENERS
     */

    // Listen for form submission
    holdingForm.addEventListener('submit', handleFormSubmit);

    // Ledger modal event listeners
    ledgerEntryForm.addEventListener('submit', handleLedgerEntrySubmit);
    closeLedgerModalBtn.addEventListener('click', closeLedgerModal);
    cancelLedgerEntryBtn.addEventListener('click', closeLedgerModal);

    // Close modal when clicking outside of modal content
    ledgerModal.addEventListener('click', function(event) {
        if (event.target === ledgerModal) {
            closeLedgerModal();
        }
    });

    // Use event delegation for dynamically created ledger entry delete buttons
    // This listens for clicks on the holdings grid and checks if it's a delete button
    holdingsGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('ledger-entry-delete')) {
            handleDeleteLedgerEntry(event);
        }
    });

    /**
     * ========================================
     * TAB NAVIGATION
     * ========================================
     */

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Remove active class from all tabs and buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });

    /**
     * ========================================
     * CSV IMPORT FUNCTIONALITY
     * ========================================
     */

    const csvFileInput = document.getElementById('csvFileInput');
    const uploadStep = document.getElementById('uploadStep');
    const mappingStep = document.getElementById('mappingStep');
    const progressStep = document.getElementById('progressStep');
    const resultsStep = document.getElementById('resultsStep');

    let parsedCSVData = null;
    let currentMapping = null;

    // Handle CSV file selection
    csvFileInput.addEventListener('change', handleCSVFileSelect);

    function handleCSVFileSelect(event) {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csvText = e.target.result;
                parsedCSVData = parseCSV(csvText);

                console.log('CSV parsed:', parsedCSVData);

                // Show mapping step
                showMappingStep();
            } catch (error) {
                alert('Error parsing CSV: ' + error.message);
                console.error(error);
            }
        };

        reader.readAsText(file);
    }

    function showMappingStep() {
        // Hide upload step
        uploadStep.classList.add('hidden');

        // Detect column mapping
        currentMapping = detectColumnMapping(parsedCSVData.headers);

        // Build mapping UI
        const columnMapping = document.getElementById('columnMapping');
        columnMapping.innerHTML = '';

        const fields = [
            { key: 'symbol', label: 'Symbol (required)', required: true },
            { key: 'companyName', label: 'Company Name' },
            { key: 'sharesCount', label: 'Shares' },
            { key: 'dateAcquired', label: 'Date Acquired' },
            { key: 'purchasePrice', label: 'Purchase Price' },
            { key: 'notes', label: 'Notes' }
        ];

        fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'mapping-row';

            row.innerHTML = `
                <div>
                    <div class="mapping-label">${field.label}</div>
                    <select class="mapping-select" data-field="${field.key}" ${field.required ? 'required' : ''}>
                        <option value="">-- not mapped --</option>
                        ${parsedCSVData.headers.map(header => `
                            <option value="${header}" ${currentMapping[field.key] === header ? 'selected' : ''}>
                                ${header}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <div class="mapping-label">sample value</div>
                    <div class="mapping-value" id="sample-${field.key}">
                        ${currentMapping[field.key] && parsedCSVData.data[0] ?
                          parsedCSVData.data[0][currentMapping[field.key]] || '(empty)'
                          : '(not mapped)'}
                    </div>
                </div>
            `;

            columnMapping.appendChild(row);
        });

        // Update sample values when mapping changes
        document.querySelectorAll('.mapping-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const field = e.target.dataset.field;
                const header = e.target.value;
                currentMapping[field] = header || null;

                const sampleDiv = document.getElementById(`sample-${field}`);
                if (header && parsedCSVData.data[0]) {
                    sampleDiv.textContent = parsedCSVData.data[0][header] || '(empty)';
                } else {
                    sampleDiv.textContent = '(not mapped)';
                }
            });
        });

        // Show mapping step
        mappingStep.classList.remove('hidden');
    }

    // Cancel mapping
    document.getElementById('cancelMapping').addEventListener('click', () => {
        mappingStep.classList.add('hidden');
        uploadStep.classList.remove('hidden');
        csvFileInput.value = '';
    });

    // Confirm mapping and import
    document.getElementById('confirmMapping').addEventListener('click', () => {
        // Validate
        const errors = validateCSVData(parsedCSVData.data, currentMapping);

        if (errors.length > 0) {
            alert('Validation errors:\n' + errors.join('\n'));
            return;
        }

        // Hide mapping, show progress
        mappingStep.classList.add('hidden');
        progressStep.classList.remove('hidden');

        // Import data
        setTimeout(() => {
            performImport();
        }, 500);
    });

    function performImport() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        const totalRows = parsedCSVData.data.length;
        let processed = 0;

        const results = importHoldingsFromCSV(parsedCSVData.data, currentMapping);

        // Animate progress
        const interval = setInterval(() => {
            processed += Math.ceil(totalRows / 10);
            if (processed > totalRows) processed = totalRows;

            const percent = (processed / totalRows) * 100;
            progressFill.style.width = percent + '%';
            progressText.textContent = `Importing ${processed} of ${totalRows}...`;

            if (processed >= totalRows) {
                clearInterval(interval);
                showResults(results);
            }
        }, 100);
    }

    async function showResults(results) {
        // Hide progress, show results
        progressStep.classList.add('hidden');
        resultsStep.classList.remove('hidden');

        const importResults = document.getElementById('importResults');
        importResults.innerHTML = `
            <div class="result-stat">
                <span class="result-label">total rows:</span>
                <span class="result-value">${results.total}</span>
            </div>
            <div class="result-stat">
                <span class="result-label">successfully imported:</span>
                <span class="result-value success">${results.success}</span>
            </div>
            ${results.errors > 0 ? `
                <div class="result-stat">
                    <span class="result-label">errors:</span>
                    <span class="result-value error">${results.errors}</span>
                </div>
            ` : ''}
        `;

        // Refresh holdings display
        await render();
    }

    // Back to upload
    document.getElementById('backToUpload').addEventListener('click', () => {
        resultsStep.classList.add('hidden');
        uploadStep.classList.remove('hidden');
        csvFileInput.value = '';
    });

    /**
     * ========================================
     * PDF VIEWER FUNCTIONALITY
     * ========================================
     */

    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfList = document.getElementById('pdfList');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');

    let uploadedPDFs = [];

    // Handle PDF file selection
    pdfFileInput.addEventListener('change', handlePDFFileSelect);

    function handlePDFFileSelect(event) {
        const files = Array.from(event.target.files);

        files.forEach(file => {
            if (file.type === 'application/pdf') {
                const pdfData = {
                    id: generateId(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    file: file,
                    url: URL.createObjectURL(file)
                };

                uploadedPDFs.push(pdfData);
            }
        });

        displayPDFList();
        pdfFileInput.value = '';
    }

    function displayPDFList() {
        if (uploadedPDFs.length === 0) {
            pdfList.innerHTML = '<p class="empty-message">no pdfs uploaded yet</p>';
            return;
        }

        pdfList.innerHTML = '';

        uploadedPDFs.forEach(pdf => {
            const item = document.createElement('div');
            item.className = 'pdf-item';
            item.dataset.id = pdf.id;

            item.innerHTML = `
                <div class="pdf-item-name">${pdf.name}</div>
                <div class="pdf-item-size">${pdf.size}</div>
                <button class="btn-small pdf-item-delete" data-id="${pdf.id}">delete</button>
            `;

            // View PDF on click
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('pdf-item-delete')) {
                    viewPDF(pdf.id);
                }
            });

            // Delete PDF
            const deleteBtn = item.querySelector('.pdf-item-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePDF(pdf.id);
            });

            pdfList.appendChild(item);
        });
    }

    function viewPDF(pdfId) {
        const pdf = uploadedPDFs.find(p => p.id === pdfId);

        if (!pdf) return;

        // Update active state
        document.querySelectorAll('.pdf-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-id="${pdfId}"]`).classList.add('active');

        // Display PDF
        pdfViewerContainer.innerHTML = `
            <embed src="${pdf.url}" type="application/pdf" />
        `;
    }

    function deletePDF(pdfId) {
        const confirmed = confirm('Delete this PDF?');

        if (!confirmed) return;

        const pdf = uploadedPDFs.find(p => p.id === pdfId);
        if (pdf) {
            URL.revokeObjectURL(pdf.url);
        }

        uploadedPDFs = uploadedPDFs.filter(p => p.id !== pdfId);

        displayPDFList();

        // Clear viewer if deleted PDF was being viewed
        if (pdfViewerContainer.querySelector('embed')?.src === pdf.url) {
            pdfViewerContainer.innerHTML = '<p class="empty-message">select a pdf to view</p>';
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * ========================================
     * EXPORT / IMPORT HANDLERS
     * ========================================
     */

    // Get export/import/sync buttons
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const syncToCloudBtn = document.getElementById('syncToCloudBtn');
    const loadFromCloudBtn = document.getElementById('loadFromCloudBtn');

    // Sync to cloud handler
    syncToCloudBtn.addEventListener('click', async function() {
        const holdings = loadHoldings();

        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holdings })
            });

            const result = await response.json();

            if (response.ok) {
                alert(`✓ Synced ${result.synced} holdings to cloud`);
            } else {
                alert('Sync failed: ' + result.error);
            }
        } catch (error) {
            alert('Sync failed: ' + error.message);
        }
    });

    // Load from cloud handler
    loadFromCloudBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/holdings');
            const cloudHoldings = await response.json();

            if (response.ok && cloudHoldings.length > 0) {
                const confirmed = confirm(`Load ${cloudHoldings.length} holdings from cloud? This will replace your local data.`);

                if (confirmed) {
                    saveHoldings(cloudHoldings);
                    render();
                    alert(`✓ Loaded ${cloudHoldings.length} holdings from cloud`);
                }
            } else {
                alert('No data found in cloud');
            }
        } catch (error) {
            alert('Load failed: ' + error.message);
        }
    });

    // Export data handler
    exportDataBtn.addEventListener('click', async function() {
        const holdings = await loadHoldings();
        const jsonData = JSON.stringify(holdings, null, 2);

        // Create a download file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `silent-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import data handler
    importDataBtn.addEventListener('click', function() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(event) {
                const jsonString = event.target.result;

                try {
                    const importedHoldings = JSON.parse(jsonString);

                    if (!Array.isArray(importedHoldings)) {
                        alert('Invalid data format. Expected an array of holdings.');
                        return;
                    }

                    const existingHoldings = await loadHoldings();
                    const mergedHoldings = [...existingHoldings, ...importedHoldings];
                    await saveHoldings(mergedHoldings);

                    alert(`Successfully imported ${importedHoldings.length} holdings.`);
                    await render();
                } catch (error) {
                    alert('Import failed: ' + error.message);
                }
            };
            reader.readAsText(file);
        });

        input.click();
    });

    /**
     * START THE APP
     */
    init();
});
