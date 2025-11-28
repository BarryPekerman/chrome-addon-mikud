// Options page script

document.addEventListener('DOMContentLoaded', async () => {
  const historyEnabledCheckbox = document.getElementById('historyEnabled');
  const maxHistoryItemsInput = document.getElementById('maxHistoryItems');
  const debugModeCheckbox = document.getElementById('debugMode');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  // Load current settings
  await loadSettings();

  // Handle save button
  saveBtn.addEventListener('click', async () => {
    await saveSettings();
  });

  /**
   * Load current settings from storage
   */
  async function loadSettings() {
    const historyEnabled = await Storage.isHistoryEnabled();
    const maxHistoryItems = await Storage.getMaxHistoryItems();
    const debugMode = await Storage.isDebugMode();

    historyEnabledCheckbox.checked = historyEnabled;
    maxHistoryItemsInput.value = maxHistoryItems;
    debugModeCheckbox.checked = debugMode;
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    try {
      const historyEnabled = historyEnabledCheckbox.checked;
      const maxHistoryItems = parseInt(maxHistoryItemsInput.value, 10);
      const debugMode = debugModeCheckbox.checked;

      // Validate max history items
      if (isNaN(maxHistoryItems) || maxHistoryItems < 10 || maxHistoryItems > 200) {
        showStatus('מספר פריטים חייב להיות בין 10 ל-200', 'error');
        return;
      }

      await Storage.setHistoryEnabled(historyEnabled);
      await Storage.setMaxHistoryItems(maxHistoryItems);
      await Storage.setDebugMode(debugMode);

      showStatus('ההגדרות נשמרו בהצלחה!', 'success');

      // Clear history if disabled
      if (!historyEnabled) {
        await Storage.clearHistory();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('שגיאה בשמירת ההגדרות', 'error');
    }
  }

  /**
   * Show status message
   */
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
      statusMessage.className = 'status-message';
    }, 3000);
  }
});


