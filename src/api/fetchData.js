
import {generateMockData} from "../utils/mockData.js";
import {log} from "../utils/logger.js";
/**
     * Simulate async fetch of JSON data with loading and error handling.
     * Returns Promise resolving to array of transactions.
     * 
     * @returns {Promise<Array>} 
     */
    export function fetchTransactions() {
      showLoader(true);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const mockData = generateMockData(15, 30); // 15 customers, up to 30 txns each
            log(`Fetched ${mockData.length} transactions successfully.`);
            resolve(mockData);
          } catch (error) {
            log('Error fetching transactions: ' + error.message);
            reject(error);
          } finally {
            showLoader(false);
          }
        }, 1500); 
      });
    }

       /**
     * Show or hide loader spinner
     * @param {boolean} show 
     */
    function showLoader(show) {
      loader.hidden = !show;
      loader.setAttribute('aria-hidden', (!show).toString());
    }
