// Storage management utility

const Storage = {
  /**
   * Check if history is enabled
   * @returns {Promise<boolean>}
   */
  async isHistoryEnabled() {
    const result = await chrome.storage.sync.get('historyEnabled');
    return result.historyEnabled !== false; // Default to true
  },

  /**
   * Set history enabled/disabled
   * @param {boolean} enabled
   */
  async setHistoryEnabled(enabled) {
    await chrome.storage.sync.set({ historyEnabled: enabled });
  },

  /**
   * Get maximum history items
   * @returns {Promise<number>}
   */
  async getMaxHistoryItems() {
    const result = await chrome.storage.sync.get('maxHistoryItems');
    return result.maxHistoryItems || 50;
  },

  /**
   * Set maximum history items
   * @param {number} maxItems
   */
  async setMaxHistoryItems(maxItems) {
    await chrome.storage.sync.set({ maxHistoryItems: maxItems });
  },

  /**
   * Get search history
   * @returns {Promise<Array>}
   */
  async getHistory() {
    const result = await chrome.storage.local.get('searchHistory');
    return result.searchHistory || [];
  },

  /**
   * Save search to history
   * @param {Object} searchItem - Search result item
   */
  async saveToHistory(searchItem) {
    if (!(await this.isHistoryEnabled())) {
      return;
    }

    const history = await this.getHistory();
    const maxItems = await this.getMaxHistoryItems();

    // Remove duplicates (same city, street, houseNumber)
    const filtered = history.filter(item => 
      item.city !== searchItem.city ||
      item.street !== searchItem.street ||
      item.houseNumber !== searchItem.houseNumber
    );

    // Add new item at the beginning
    filtered.unshift(searchItem);

    // Limit history size
    if (filtered.length > maxItems) {
      filtered.splice(maxItems);
    }

    await chrome.storage.local.set({ searchHistory: filtered });
  },

  /**
   * Clear all search history
   */
  async clearHistory() {
    await chrome.storage.local.set({ searchHistory: [] });
  },

  /**
   * Remove specific item from history
   * @param {number} index - Index of item to remove
   */
  async removeFromHistory(index) {
    const history = await this.getHistory();
    history.splice(index, 1);
    await chrome.storage.local.set({ searchHistory: history });
  },

  /**
   * Check if debug mode is enabled
   * @returns {Promise<boolean>}
   */
  async isDebugMode() {
    const result = await chrome.storage.sync.get('debugMode');
    return result.debugMode === true; // Default to false
  },

  /**
   * Set debug mode enabled/disabled
   * @param {boolean} enabled
   */
  async setDebugMode(enabled) {
    await chrome.storage.sync.set({ debugMode: enabled });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}


