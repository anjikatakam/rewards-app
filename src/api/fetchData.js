import {log} from "../utils/logger.js";

    export async function fetchTransactions() {
          try {
            const mockData = await fetch("./public/data/transactions.json");
            const res = mockData.json();
            log(`Fetched ${mockData.length} transactions successfully.`);
            return res;
          } catch (error) {
            log('Error fetching transactions: ' + error.message);
            reject(error);
          } 
    }
