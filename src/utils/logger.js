 /**
     * Log messages to console and UI log output
     * @param {string} message
     */
    export function log(message) {
      console.log(message);
      const li = document.createElement('li');
      li.textContent = `[${new Date().toISOString()}] ${message}`;
      logList.prepend(li);
      // Keep max 30 logs
      if (logList.children.length > 30) {
        logList.removeChild(logList.lastChild);
      }
    }