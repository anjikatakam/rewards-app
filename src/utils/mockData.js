 /**
     * Generate mock transaction data for number of customers and max transactions per customer.
     * Each transaction has customerId, transactionId, amount, and date.
     * @param {number} customerCount 
     * @param {number} maxTxPerCustomer 
     * @returns {Array}
     */
    export function generateMockData(customerCount, maxTxPerCustomer) {
      const customers = [];
      for(let i = 1; i <= customerCount; i++) {
        customers.push(`CUST${String(i).padStart(4, '0')}`);
      }
      const data = [];
      const now = new Date();
      const startMonth = new Date(now.getFullYear()-3, now.getMonth() - 11, 1); // 6 months back for variety

      let transactionIndex = 1;
      for (const custId of customers) {
        const transactionCount = Math.floor(Math.random() * maxTxPerCustomer) + 5; // 5 to maxTxPerCustomer transactions

        for(let i=0; i < transactionCount; i++) {
          // Random date between startMonth and now
          const randomDate = new Date(startMonth.getTime() + Math.random() * (now.getTime() - startMonth.getTime()));

          // Random amount from 10 to 200 with decimals
          const amount = parseFloat((Math.random() * 190 + 10).toFixed(2));

          data.push({
            customerId: custId,
            transactionId: `TX${String(transactionIndex).padStart(6, '0')}`,
            amount: amount,
            date: randomDate.toISOString(),
          });

          transactionIndex++;
        }
      }

      console.log("data",data)
      return data;
    }
