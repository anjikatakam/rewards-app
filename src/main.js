
import {log} from "./utils/logger.js";
import {fetchTransactions} from "./api/fetchData.js";
import {calculateRewardPoints} from "./utils/rewardCalculator.js"
  
    const POINTS_PER_DOLLAR_OVER_100 = 2;
    const POINTS_PER_DOLLAR_BETWEEN_50_100 = 1;
    const ITEMS_PER_PAGE = 5;
    
    // State
    let transactions = []; // Loaded transactions from the API
    let customers = new Set();
    let filteredTransactions = [];
    let currentCustomerId = null;
    let currentYear = null; // Format: YYYY
    let currentMonth = null; // Format: YYYY-MM
    let currentPage = 1;

    // DOM elements
    const customerSelect = document.getElementById('customerSelect');
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const rewardPointsSummary = document.getElementById('rewardPointsSummary');
    const transactionsTableBody = document.getElementById('transactionsTableBody');
    const paginationSection = document.getElementById('paginationSection').querySelector('nav');
    const logList = document.getElementById('logList');
    const loader = document.getElementById('loader');

    /**
     * Populate customer dropdown with options sorted by customerId
     * 
     */
    function populateCustomerDropdown(customersSet) {
      const arr = Array.from(customersSet).sort();
      customerSelect.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Select Customer --';
      customerSelect.appendChild(defaultOption);

      arr.forEach(cid => {
        const option = document.createElement('option');
        option.value = cid;
        option.textContent = cid;
        customerSelect.appendChild(option);
      });
    }

    /**
     * Populate month dropdown with 4-5 years (2021-2025) months available in data for the selected customer
     * Defaults to 2025 if present
     * @param {string} customerId
     */

    function populateYearDropdown(customerId) {
       yearSelect.innerHTML='';
      if (!customerId) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Select Year --';
        yearSelect.appendChild(option);
        yearSelect.disabled = true;
        return;
      }

      const custTxns = transactions.filter(txn => txn.customerId === customerId);
      const years = new Set();
      custTxns.forEach(txn => {
        years.add(txn.date.slice(0,4)); 
      });
 
     const yearsArr = Array.from(years).sort((a,b) => b.localeCompare(a));
        yearsArr.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
     
    }
    function populateMonthDropdown(customerId) {
      monthSelect.disabled = false;
      monthSelect.innerHTML = '';
      if (!customerId) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Select Month --';
        monthSelect.appendChild(option);
        monthSelect.disabled = true;
        return;
      }
      monthSelect.disabled = false;

      // Get unique months for this customer sorted descending
      const custTxns = transactions.filter(txn => txn.customerId === customerId && txn.date.slice(0,4) === yearSelect.value);

      const months = new Set();
      custTxns.forEach(txn => {
        months.add(txn.date.slice(0,7)); // YYYY-MM
      });


      const monthsArr = Array.from(months).sort((a,b) => b.localeCompare(a));
      console.log(monthsArr)
  

      // If 2025 exists, default select 2025's first month, else latest month
      let defaultMonth = monthsArr.find(m => m.startsWith('2025'));
      if (!defaultMonth) {
        defaultMonth = monthsArr.length > 0 ? monthsArr[0] : '3';
      }

      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Select Month --';
      monthSelect.appendChild(defaultOption);

      monthsArr.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = formatMonthYear(m);
        if (m === defaultMonth) {
          opt.selected = true;
          currentMonth = m;
        }
        monthSelect.appendChild(opt);
      });
 
    }



    /**
     * Format YYYY-MM string to human readable month-year
     * e.g. "2023-03" => "Mar 2023"
     * @param {string} ym 
     * @returns {string}
     */
    function formatMonthYear(ym) {
      if (!ym) return '';
      const [year, month] = ym.split('-');
      const date = new Date(parseInt(year,10), parseInt(month,10) - 1);
      return date.toLocaleString('default', { year: 'numeric', month: 'short' });
    }

    /**
     * Filter transactions by selected customer and optionally month
     * @param {string} customerId 
     * @param {string} [month] - Format YYYY-MM optional
     * @returns {Array}
     */
    function filterTransactions(customerId, month) {
      if (!customerId) return [];
      let filtered = transactions.filter((txn) => txn.customerId === customerId);
      if (month) {
        filtered = filtered.filter(txn => txn.date.startsWith(month));
      }
      return filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    }
    function filterYears(customerId, month){
      if (!customerId) return [];
      let filtered = transactions.filter((txn) => txn.customerId === customerId);
      if (month) {
        filtered = filtered.filter(txn => txn.date.startsWith(month));
      }
       return filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Calculate and update reward points summary UI
     * Shows total points for the month and per month total points for all months
     * @param {string} customerId 
     * @param {string} month 
     */
    function updateRewardPointsSummary(customerId, month) {
      if (!customerId) {
        rewardPointsSummary.textContent = 'Please select a customer.';
        return;
      }
      // Calculate total per month (all months)
      const custTxns = transactions.filter(txn => txn.customerId === customerId);

      if (custTxns.length === 0) {
        rewardPointsSummary.textContent = 'No transactions found for this customer.';
        return;
      }

      // Group by month
      const pointsByMonth = custTxns.reduce((acc, txn) => {
        const monthKey = txn.date.slice(0,7);
        const points = calculateRewardPoints(txn.amount);
        acc[monthKey] = (acc[monthKey] || 0) + points;
        return acc;
      }, {});

      // Calculate total points all months
      const totalPoints = Object.values(pointsByMonth).reduce((a,b) => a + b, 0);

      if (!month) {
        rewardPointsSummary.innerHTML = `
          <p class="font-semibold">Total Reward Points (All Time): <span class="text-blue-600">${totalPoints}</span></p>
          <p>Select a month to see detailed points for that month.</p>
        `;
        return;
      }

      const monthPoints = Math.floor(pointsByMonth[month] || 0);
      rewardPointsSummary.innerHTML = `
        <p class="font-semibold">Reward Points for <span class="text-blue-600">${formatMonthYear(month)}</span>: <span class="text-blue-700">${monthPoints}</span></p>
        <p class="font-semibold mt-2">Total Reward Points (All Time): <span class="text-blue-600">${totalPoints}</span></p>
      `;
    }

    /**
     * Render transactions table based on filtered transactions and current page
     * @param {Array} txns 
     * @param {number} page 
     */
    function renderTransactionsTable(txns, page = 1) {
      if (!txns || txns.length === 0) {
        transactionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No transactions found.</td></tr>';
        return;
      }
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const pageItems = txns.slice(startIndex, startIndex + ITEMS_PER_PAGE);


      transactionsTableBody.innerHTML = pageItems.map(txn => {
        const dateObj = new Date(txn.date);
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        return `
          <tr tabindex="0" role="row" class="hover:bg-gray-100 focus:bg-gray-200 focus:outline-none">
            <td class="px-6 py-3 text-sm font-medium text-gray-900">${txn.transactionId}</td>
            <td class="px-6 py-3 text-sm">${formattedDate}</td>
            <td class="px-6 py-3 text-sm font-semibold">\${${txn.amount.toFixed(2)}}</td>
            <td class="px-6 py-3 text-sm font-semibold text-blue-600">${calculateRewardPoints(txn.amount)}</td>
          </tr>
        `;
      }).join('');
    }

    /**
     * Render pagination buttons based on filtered transaction count
     * @param {number} totalItems 
     * @param {number} currentPage 
     */
    function renderPagination(totalItems, currentPage) {
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      paginationSection.innerHTML = '';

      if (totalPages <= 1) return;

      const createButton = (text, page, disabled = false, ariaCurrent = false) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.disabled = disabled;
        btn.className = `
          relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-sm font-medium 
          ${disabled ? 'cursor-not-allowed text-gray-400' : 'hover:bg-blue-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}
          ${ariaCurrent ? 'bg-blue-600 text-white border-blue-600' : ''}
        `;
        if (ariaCurrent) btn.setAttribute('aria-current', 'page');
        btn.addEventListener('click', () => {
          currentPage = page;
          updateTableAndPagination();
        });
        return btn;
      };

      // Prev button
      paginationSection.appendChild(createButton('Prev', currentPage-1, currentPage === 1));

      // Show up to 5 page buttons with current in middle if possible
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        paginationSection.appendChild(createButton(i, i, false, i === currentPage));
      }

      // Next button
      paginationSection.appendChild(createButton('Next', currentPage+1, currentPage === totalPages));
    }

    /**
     * Update table and pagination render based on current filteredTransactions and state
     */
    function updateTableAndPagination() {
      renderTransactionsTable(filteredTransactions, currentPage);
      renderPagination(filteredTransactions.length, currentPage);
      updateRewardPointsSummary(currentCustomerId, currentMonth);
    }

    /**
     * Event handler when customer selection changes
     */
    function onCustomerChange() {
      currentCustomerId = customerSelect.value || null;
      currentPage = 1;
      populateYearDropdown(currentCustomerId)
      populateMonthDropdown(currentCustomerId)
      currentMonth = monthSelect.value || null;
      currentYear = yearSelect.value || null;
      filteredTransactions = filterTransactions(currentCustomerId, currentMonth);
      let filteredYears = filterYears(currentCustomerId, currentYear);
      updateTableAndPagination();
      log(`Customer selected: ${currentCustomerId}`);
    }

    function onYearChange() {
      currentYear = yearSelect.value || null;
      currentPage = 1;
      filteredTransactions = filterTransactions(currentCustomerId, currentYear);
      updateTableAndPagination();
      log(`Year selected: ${currentYear}`);
      populateMonthDropdown(currentCustomerId)
    }

    /**
     * Event handler when month selection changes
     */
    function onMonthChange() {
      currentMonth = monthSelect.value || null;
      currentPage = 1;
      filteredTransactions = filterTransactions(currentCustomerId, currentMonth);
      updateTableAndPagination();
      log(`Month selected: ${currentMonth}`);
    }

    async function init() {
      try {
        log('Initializing application...');
        transactions = await fetchTransactions();
        customers = new Set(transactions.map(txn => txn.customerId));
        populateCustomerDropdown(customers);
        customerSelect.disabled = false;
        monthSelect.disabled = true;
        currentCustomerId = null;
        currentMonth = null;
        filteredTransactions = [];
        rewardPointsSummary.textContent = 'Please select a customer.';
      } catch(e) {
        rewardPointsSummary.textContent = 'Failed to load transactions data.';
        log('Initialization failed: ' + e.message);
      }
    }

    // Event listeners
    customerSelect.addEventListener('change', onCustomerChange);
    monthSelect.addEventListener('change', onMonthChange);
    yearSelect.addEventListener('change', onYearChange);

    // Run app
    init();
  
