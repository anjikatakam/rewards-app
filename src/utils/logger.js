
    export function log(message) {
      console.log(message);
      const li = document.createElement('li');
      li.textContent = `[${new Date().toISOString()}] ${message}`;
      logList.prepend(li);
      if (logList.children.length > 30) {
        logList.removeChild(logList.lastChild);
      }
    }