// Popup script - Main interface logic

document.addEventListener('DOMContentLoaded', async () => {
  const searchForm = document.getElementById('searchForm');
  const searchBtn = document.getElementById('searchBtn');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');
  const resultsContent = document.getElementById('resultsContent');
  const error = document.getElementById('error');
  const errorMessage = document.getElementById('errorMessage');
  const history = document.getElementById('history');
  const historyContent = document.getElementById('historyContent');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const optionsLink = document.getElementById('optionsLink');
  const exportLogsLink = document.getElementById('exportLogsLink');
  const exportLogsSeparator = document.getElementById('exportLogsSeparator');
  const testBtn = document.getElementById('testBtn');

  // Note: Content script check removed - not needed since we use direct API calls
  // Content script was for proxying requests but we use extension context directly

  // Check if history is enabled
  const historyEnabled = await Storage.isHistoryEnabled();
  if (historyEnabled) {
    await loadHistory();
  }

  // Check if debug mode is enabled
  const debugMode = await Storage.isDebugMode();

  // Handle form submission
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await performSearch();
  });

  // Handle clear history button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
      await Storage.clearHistory();
      await loadHistory();
    });
  }

  // Handle options link
  if (optionsLink) {
    optionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }

  // Handle export logs link (only show in debug mode)
  if (exportLogsLink) {
    if (debugMode) {
      exportLogsLink.style.display = 'inline';
      if (exportLogsSeparator) {
        exportLogsSeparator.style.display = 'inline';
      }
    } else {
      exportLogsLink.style.display = 'none';
      if (exportLogsSeparator) {
        exportLogsSeparator.style.display = 'none';
      }
    }

    exportLogsLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Logger !== 'undefined' && Logger.downloadLogs) {
        Logger.downloadLogs('text');
        console.log('Logs exported!');
      } else {
        alert('Logger not available. Use browser DevTools to export console logs.');
      }
    });
  }

  // Handle test button (only show in debug mode)
  if (testBtn) {
    if (debugMode) {
      testBtn.style.display = 'block';
    } else {
      testBtn.style.display = 'none';
    }

    testBtn.addEventListener('click', async () => {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      
      try {
        console.log('=== TESTING CONNECTION ===');
        
        // Check current tab (optional, wrapped in try-catch since tabs permission may not be available)
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('Current tab:', tab?.url);
        } catch (e) {
          console.log('Tab info not available (tabs permission not granted)');
        }
        
        // Test API using EXACT same method as search button
        // This ensures they behave identically
        console.log('Testing with hardcoded values: חיפה, כנרת, 7, א');
        const zipCodes = await API.searchZipCode('חיפה', 'כנרת', '7', 'א');
        console.log('Test results:', zipCodes);
        
        if (zipCodes && zipCodes.length > 0 && zipCodes[0].zipCode) {
          testBtn.textContent = '✅ Working!';
          testBtn.style.background = '#3c3';
          showError(`Test successful! Found: ${zipCodes[0].zipCode}`);
        } else {
          testBtn.textContent = '❌ No results';
          testBtn.style.background = '#c33';
          showError('Test completed but no zip code found. Check console.');
        }
        
      } catch (error) {
        console.error('Test failed:', error);
        testBtn.textContent = '❌ Error';
        testBtn.style.background = '#c33';
        showError(`Test failed: ${error.message}`);
      } finally {
        setTimeout(() => {
          testBtn.disabled = false;
          testBtn.textContent = '🧪 Test Connection';
          testBtn.style.background = '#999';
        }, 3000);
      }
    });
  }

  /**
   * Perform zip code search
   */
  async function performSearch() {
    const city = document.getElementById('city').value.trim();
    const street = document.getElementById('street').value.trim();
    const houseNumber = document.getElementById('houseNumber').value.trim();
    const entrance = document.getElementById('entrance')?.value.trim() || '';

    // Hide previous results and errors
    hideAllSections();

    // Validate input using the validation utility
    const validation = Validation.validateAddress(city, street, houseNumber, entrance);
    if (!validation.valid) {
      showError(validation.errors.join(', '));
      return;
    }

    // Show loading state
    showLoading();
    searchBtn.disabled = true;

    try {
      // Perform API call with all parameters
      console.log('=== POPUP: Starting Search ===');
      console.log('City:', city);
      console.log('Street:', street);
      console.log('House Number:', houseNumber);
      console.log('Entrance:', entrance || '(empty)');
      
      // Use API utility for consistent behavior
      const zipCodes = await API.searchZipCode(city, street, houseNumber, entrance);
      console.log('✓ API call completed, parsed results:', zipCodes);

      hideLoading();
      searchBtn.disabled = false;

      console.log('=== POPUP: Search Complete ===');
      console.log('Results:', zipCodes);
      console.log('Results type:', typeof zipCodes);
      console.log('Results is array?', Array.isArray(zipCodes));
      console.log('Results length:', zipCodes?.length);
      if (zipCodes && zipCodes.length > 0) {
        console.log('First result:', zipCodes[0]);
        console.log('First result type:', typeof zipCodes[0]);
        console.log('First result keys:', Object.keys(zipCodes[0] || {}));
        console.log('First result.zipCode:', zipCodes[0].zipCode);
        console.log('First result.zipCode type:', typeof zipCodes[0].zipCode);
        console.log('First result.zipCode value:', JSON.stringify(zipCodes[0].zipCode));
      } else {
        console.warn('⚠️ No results returned from API!');
      }

      if (zipCodes && zipCodes.length > 0) {
        displayResults(zipCodes, city, street, houseNumber, entrance);
        
        // Save to history if enabled (don't reload immediately to avoid race condition)
        if (historyEnabled) {
          await Storage.saveToHistory({
            city,
            street,
            houseNumber,
            entrance,
            zipCodes,
            timestamp: Date.now()
          });
          // Reload history after a short delay to avoid blocking UI
          setTimeout(() => loadHistory(), 100);
        }
      } else {
        // No results - API returned empty array (could be no match or parsing issue)
        showError('לא נמצא מיקוד עבור הכתובת המבוקשת');
      }
    } catch (err) {
      hideLoading();
      searchBtn.disabled = false;
      showError(`שגיאה בחיפוש: ${err.message}`);
      console.error('=== POPUP: Search Error ===');
      console.error('Error:', err);
    }
  }

  /**
   * Display search results
   */
  function displayResults(zipCodes, city, street, houseNumber, entrance = '') {
    resultsContent.innerHTML = '';
    
    console.log('=== DISPLAYING RESULTS ===');
    console.log('zipCodes array:', zipCodes);
    
    zipCodes.forEach((result, index) => {
      console.log(`Result ${index}:`, result);
      console.log(`Result ${index} type:`, typeof result);
      console.log(`Result ${index} keys:`, Object.keys(result || {}));
      
      const item = document.createElement('div');
      item.className = 'result-item';
      
      // Filter out empty values explicitly (not just falsy values)
      const addressParts = [city, street, houseNumber, entrance].filter(part => part && part.trim().length > 0);
      const address = addressParts.join(' ');
      
      // Extract zip code with better fallback
      let zipCode = 'לא נמצא';
      if (result) {
        console.log(`  Result ${index} details:`, {
          type: typeof result,
          value: result,
          hasZipCode: 'zipCode' in (result || {}),
          zipCodeValue: result?.zipCode,
          allKeys: Object.keys(result || {})
        });
        
        if (typeof result === 'string') {
          zipCode = result;
        } else if (typeof result === 'object' && result !== null) {
          // Try multiple possible property names
          zipCode = result.zipCode || result.mikud || result.zip || result.code;
          
          // If still not found, check if result itself is the zip code
          if (!zipCode && typeof result === 'object') {
            // Check if any property looks like a zip code
            for (const key in result) {
              if (key !== 'raw' && /^\d{5,7}$/.test(result[key])) {
                zipCode = result[key];
                break;
              }
            }
          }
          
          // Final fallback
          if (!zipCode) {
            zipCode = 'לא נמצא';
          }
        } else {
          zipCode = String(result);
        }
      }
      
      console.log(`  Final extracted zip code for result ${index}:`, zipCode, '(type:', typeof zipCode + ')');
      
      // Show raw result in console for debugging
      if (result && result.raw) {
        console.log(`Raw API response for result ${index}:`, result.raw);
      }
      
      // Use safe DOM methods instead of innerHTML to prevent XSS
      const zipCodeLabel = document.createElement('strong');
      zipCodeLabel.textContent = `מיקוד: ${zipCode}`;
      item.appendChild(zipCodeLabel);
      
      const addressDiv = document.createElement('div');
      addressDiv.textContent = address;
      item.appendChild(addressDiv);
      
      // Show raw response if available (only in debug mode)
      if (result && result.raw && debugMode) {
        const rawDiv = document.createElement('div');
        rawDiv.style.fontSize = '10px';
        rawDiv.style.color = '#999';
        rawDiv.style.marginTop = '5px';
        rawDiv.textContent = `Raw: ${result.raw}`;
        item.appendChild(rawDiv);
      }
      
      resultsContent.appendChild(item);
    });

    results.classList.remove('hidden');
  }

  /**
   * Load and display search history
   */
  async function loadHistory() {
    if (!historyEnabled) {
      history.classList.add('hidden');
      return;
    }

    const historyItems = await Storage.getHistory();
    
    if (historyItems && historyItems.length > 0) {
      historyContent.innerHTML = '';
      
      historyItems.forEach((item) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Filter out empty values explicitly
        const addressParts = [item.city, item.street, item.houseNumber, item.entrance]
          .filter(part => part && part.trim().length > 0);
        const address = addressParts.join(' ');
        
        const zipCodes = item.zipCodes || [];
        const zipCodeDisplay = zipCodes.length > 0 
          ? zipCodes.map(z => z.zipCode || z.mikud || z.zip || z).join(', ')
          : 'לא נמצא';
        
        // Use safe DOM methods instead of innerHTML to prevent XSS
        const addressDiv = document.createElement('div');
        addressDiv.className = 'address';
        addressDiv.textContent = address;
        historyItem.appendChild(addressDiv);
        
        const zipCodeDiv = document.createElement('div');
        zipCodeDiv.className = 'zipcode';
        zipCodeDiv.textContent = `מיקוד: ${zipCodeDisplay}`;
        historyItem.appendChild(zipCodeDiv);
        
        // Click to view cached result (no API call)
        historyItem.addEventListener('click', () => {
          // Hide other sections
          hideAllSections();
          
          // Display cached results from history (no API call)
          if (item.zipCodes && item.zipCodes.length > 0) {
            displayResults(item.zipCodes, item.city, item.street, item.houseNumber, item.entrance || '');
          } else {
            showError('לא נמצא מיקוד שמור עבור כתובת זו');
          }
        });
        
        historyContent.appendChild(historyItem);
      });

      history.classList.remove('hidden');
    } else {
      history.classList.add('hidden');
    }
  }

  /**
   * Show loading state
   */
  function showLoading() {
    loading.classList.remove('hidden');
  }

  /**
   * Hide loading state
   */
  function hideLoading() {
    loading.classList.add('hidden');
  }

  /**
   * Show error message
   */
  function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
  }

  /**
   * Hide all sections
   */
  function hideAllSections() {
    loading.classList.add('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
  }
});

