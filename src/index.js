import { fetchTransactions } from "./api/fetchData.js";
import { calculateMonthlyRewards } from "./utils/rewardCalculator.js";
import { renderCustomers } from "./components/customerTable.js";
import { renderTransactions } from "./components/transactionsTable.js";
import { renderFilters } from "./components/filters.js";

const customerContainer = document.getElementById("customers");
const transactionContainer = document.getElementById("transactions");
const monthContainer = document.getElementById("monthFilterContainer");
const yearContainer = document.getElementById("yearFilterContainer");

let transactions = [];
let selectedCustomer = null;
let selectedMonth = "ALL";
let selectedYear = new Date().getFullYear();

async function init() {
  try {
    transactions = await fetchTransactions();

    const customers = [...new Set(transactions.map(tx => tx.customerId))];
    renderCustomers(customers, customerContainer, handleCustomerSelect);

    renderFilters(monthContainer, yearContainer, handleFilterChange);
  } catch (error) {
    transactionContainer.textContent = "Error loading data.";
  }
}

function handleCustomerSelect(customerId) {
  selectedCustomer = customerId;
  renderCustomerRewards();
}

function handleFilterChange(month, year) {
  selectedMonth = month;
  selectedYear = parseInt(year);
  renderCustomerRewards();
}

function renderCustomerRewards() {
  if (!selectedCustomer) return;

  const customerTransactions = transactions.filter(tx => tx.customerId === selectedCustomer);

  let filteredTransactions = customerTransactions;

  if (selectedMonth !== "ALL") {
    filteredTransactions = customerTransactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === selectedYear;
    });
  } else {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    filteredTransactions = customerTransactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= threeMonthsAgo && d <= now;
    });
  }

  if (!filteredTransactions.length) {
    transactionContainer.innerHTML = `
      <h3>Customer ${selectedCustomer}</h3>
      <p>No transactions</p>
    `;
    return;
  }

  const monthlyRewardsFiltered = calculateMonthlyRewards(filteredTransactions);
  //console.log(monthlyRewardsFiltered)

  let totalPoints = 0;
  Object.keys(monthlyRewardsFiltered).forEach(k => {
    totalPoints += monthlyRewardsFiltered[k].points;
  });

  transactionContainer.innerHTML = `
    <h3>Rewards for Customer ${selectedCustomer}</h3>
    <p>Total Points: ${totalPoints}</p>
  `;
  console.log(filteredTransactions)
  console.log(transactionContainer)

  renderTransactions(filteredTransactions, transactionContainer);
}

init();
