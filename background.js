// Background service worker for Chrome Extension

// Install event - set default settings
chrome.runtime.onInstalled.addListener(async () => {
  // Set default preferences
  const defaults = {
    historyEnabled: true,
    maxHistoryItems: 50
  };

  const current = await chrome.storage.sync.get(['historyEnabled', 'maxHistoryItems']);
  
  if (current.historyEnabled === undefined) {
    await chrome.storage.sync.set({ historyEnabled: defaults.historyEnabled });
  }
  
  if (current.maxHistoryItems === undefined) {
    await chrome.storage.sync.set({ maxHistoryItems: defaults.maxHistoryItems });
  }

  console.log('Mikud extension installed');
});

