// Logger utility to export console logs for analysis

const Logger = {
  logs: [],
  maxLogs: 1000,

  /**
   * Initialize logger - capture console logs
   */
  init() {
    // Store original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override console methods to capture logs
    console.log = (...args) => {
      this.addLog('log', ...args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog('error', ...args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addLog('warn', ...args);
      originalWarn.apply(console, args);
    };

    console.info = (...args) => {
      this.addLog('info', ...args);
      originalInfo.apply(console, args);
    };
  },

  /**
   * Add log entry
   */
  addLog(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    this.logs.push({
      timestamp,
      level,
      message
    });

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  },

  /**
   * Export logs as text
   */
  exportAsText() {
    return this.logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
  },

  /**
   * Export logs as JSON
   */
  exportAsJSON() {
    return JSON.stringify(this.logs, null, 2);
  },

  /**
   * Download logs as file
   */
  downloadLogs(format = 'text') {
    let content, filename, mimeType;

    if (format === 'json') {
      content = this.exportAsJSON();
      filename = `mikud-logs-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      content = this.exportAsText();
      filename = `mikud-logs-${Date.now()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
  },

  /**
   * Get logs count
   */
  getCount() {
    return this.logs.length;
  }
};

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  Logger.init();
  console.log('Logger initialized - logs will be captured');
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.Logger = Logger;
  console.log('Logger available as window.Logger');
  console.log('Use Logger.downloadLogs() to export logs');
  console.log('Use Logger.downloadLogs("json") to export as JSON');
}



