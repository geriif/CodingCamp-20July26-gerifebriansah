// js/app.js — Expense & Budget Visualizer

// ─── State ────────────────────────────────────────────────────────────────────

let transactions = [];    // in-memory array of Transaction objects
let chartInstance = null; // Chart.js instance, kept for updates

// ─── Local Storage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = "ebv_transactions";

/**
 * Reads the persisted transaction array from Local Storage.
 * Populates the `transactions` variable with the parsed array.
 * Falls back to an empty array if the key is absent or the value is malformed.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    transactions = raw ? JSON.parse(raw) : [];
  } catch (e) {
    // JSON is malformed or localStorage is unavailable — start fresh
    transactions = [];
  }
}

/**
 * Serializes the current `transactions` array and writes it to Local Storage.
 */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// ─── Validation ───────────────────────────────────────────────────────────────

const VALID_CATEGORIES = ["Food", "Transport", "Fun"];

/**
 * Validates the transaction form inputs.
 * @param {string} name       - Item description entered by the user.
 * @param {number} amount     - Parsed numeric amount.
 * @param {string} category   - Selected category value.
 * @returns {string|null}     - A descriptive error message, or null if all fields are valid.
 */
function validateForm(name, amount, category) {
  if (!name || name.trim() === "") {
    return "Item name cannot be empty.";
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Amount must be a number greater than 0.";
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return "Category must be one of: Food, Transport, or Fun.";
  }

  return null;
}

/**
 * Creates a new Transaction object and adds it to the in-memory array.
 * Persists the updated array to Local Storage, then triggers a full UI refresh.
 *
 * @param {string} name     - Non-empty item description
 * @param {number} amount   - Positive numeric amount
 * @param {string} category - One of "Food" | "Transport" | "Fun"
 */
function addTransaction(name, amount, category) {
  const id = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString();

  transactions.push({ id, name, amount, category });

  saveToStorage();
  renderList();
  updateBalance();
  updateChart();
}

/**
 * Removes the transaction with the given id from the array,
 * persists the change, and refreshes the UI.
 *
 * @param {string} id - The id of the transaction to remove.
 */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  renderList();
  updateBalance();
  updateChart();
}

// ─── Render ───────────────────────────────────────────────────────────────────

/**
 * Clears and rebuilds the #transaction-list from the current transactions array.
 * Toggles #empty-state visibility based on whether the list is empty.
 */
function renderList() {
  const list = document.getElementById("transaction-list");
  const emptyState = document.getElementById("empty-state");

  list.innerHTML = "";

  if (transactions.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");

    transactions.forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="transaction-name">${t.name}</span>
        <span class="transaction-amount">Rp ${t.amount.toLocaleString("id-ID")}</span>
        <span class="badge badge-${t.category.toLowerCase()}">${t.category}</span>
        <button class="btn-delete" data-delete-id="${t.id}">Delete</button>
      `;
      list.appendChild(li);
    });
  }
}

// ─── Balance ──────────────────────────────────────────────────────────────────

/**
 * Sums all transaction amounts and updates the #total-balance element.
 */
function updateBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById("total-balance").textContent =
    "Rp " + total.toLocaleString("id-ID");
}

// ─── Chart ────────────────────────────────────────────────────────────────────

/**
 * Aggregates transaction amounts per category and updates (or creates)
 * the Chart.js pie chart instance.
 */
function updateChart() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded");
    return;
  }

  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(t => { totals[t.category] += t.amount; });

  const data = {
    labels: Object.keys(totals),
    datasets: [{
      data: Object.values(totals),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
    }]
  };

  if (chartInstance) {
    chartInstance.data = data;
    chartInstance.update();
  } else {
    const ctx = document.getElementById("categoryChart").getContext("2d");
    chartInstance = new Chart(ctx, { type: "pie", data });
  }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

// Form submit — validate then add transaction
document.getElementById("transaction-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const name     = document.getElementById("item-name").value.trim();
    const amount   = parseFloat(document.getElementById("item-amount").value);
    const category = document.getElementById("item-category").value;

    const error = validateForm(name, amount, category);
    if (error) {
      document.getElementById("form-error").textContent = error;
      return;
    }

    document.getElementById("form-error").textContent = "";
    addTransaction(name, amount, category);
    e.target.reset();
  });

// Delete button — event delegation on the transaction list
document.getElementById("transaction-list")
  .addEventListener("click", (e) => {
    if (e.target.matches("[data-delete-id]")) {
      deleteTransaction(e.target.dataset.deleteId);
    }
  });

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Entry point — load persisted data and render all UI components.
 * Event listeners are attached at module scope (above), not here,
 * because `defer` guarantees the DOM is ready when this script runs.
 */
function init() {
  loadFromStorage();
  renderList();
  updateBalance();
  updateChart();
}

init();
