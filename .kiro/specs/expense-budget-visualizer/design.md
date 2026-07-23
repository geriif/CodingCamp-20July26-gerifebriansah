# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a single-page, client-side web application. There is no build step, no server, and no package manager. The entire app lives in three files:

```
expense-budget-visualizer/
├── index.html      — markup, Chart.js CDN link, script/style references
├── css/style.css   — all styling
└── js/app.js       — all application logic
```

All state is held in memory as a JavaScript array and mirrored to Local Storage on every mutation.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     index.html                      │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Input Form  │  │  Balance    │  │  Pie Chart │ │
│  └──────┬───────┘  │  Display   │  │  Canvas    │ │
│         │          └─────────────┘  └────────────┘ │
│         │                                           │
│         ▼                                           │
│  ┌─────────────────────────────────────────────────┐│
│  │              js/app.js (State Engine)           ││
│  │  transactions[] ←→ LocalStorage                 ││
│  │  addTransaction() / deleteTransaction()         ││
│  │  renderList() / updateBalance() / updateChart() ││
│  └─────────────────────────────────────────────────┘│
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │ Transaction  │                                   │
│  │    List      │                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

**Data flow** is unidirectional:
1. User interacts with the Input Form or Transaction List.
2. `app.js` mutates the `transactions` array and writes to Local Storage.
3. `app.js` calls the three render functions to sync the DOM.

---

## Data Model

### Transaction Object

```javascript
{
  id:       string,   // crypto.randomUUID() or Date.now().toString()
  name:     string,   // non-empty item description
  amount:   number,   // positive float, e.g. 15000
  category: string    // "Food" | "Transport" | "Fun"
}
```

### Local Storage Schema

- **Key**: `"ebv_transactions"`
- **Value**: JSON-serialized array of Transaction objects

```javascript
// Write
localStorage.setItem("ebv_transactions", JSON.stringify(transactions));

// Read
const raw = localStorage.getItem("ebv_transactions");
const transactions = raw ? JSON.parse(raw) : [];
```

---

## Component Design

### 1. `index.html`

Responsibilities:
- Semantic HTML structure with accessible form labels.
- One `<link>` to `css/style.css`.
- One `<script src="https://cdn.jsdelivr.net/npm/chart.js">` CDN tag (before `app.js`).
- One `<script src="js/app.js" defer>` tag.
- A `<canvas id="categoryChart">` element for Chart.js.

Key sections:
```html
<!-- Balance Banner -->
<section id="balance-section">
  <h2>Total Balance</h2>
  <p id="total-balance">Rp 0</p>
</section>

<!-- Input Form -->
<section id="form-section">
  <form id="transaction-form">
    <input id="item-name"   type="text"   placeholder="Item name"  required />
    <input id="item-amount" type="number" placeholder="Amount"     min="0.01" required />
    <select id="item-category" required>
      <option value="">Select category</option>
      <option value="Food">Food</option>
      <option value="Transport">Transport</option>
      <option value="Fun">Fun</option>
    </select>
    <button type="submit">Add</button>
    <p id="form-error" aria-live="polite"></p>
  </form>
</section>

<!-- Transaction List -->
<section id="list-section">
  <ul id="transaction-list"></ul>
  <p id="empty-state">No transactions yet.</p>
</section>

<!-- Chart -->
<section id="chart-section">
  <canvas id="categoryChart"></canvas>
</section>
```

---

### 2. `js/app.js`

#### State

```javascript
let transactions = [];          // in-memory array of Transaction objects
let chartInstance = null;       // Chart.js instance, kept for updates
```

#### Functions

| Function | Signature | Responsibility |
|---|---|---|
| `loadFromStorage` | `() → void` | Read and parse `ebv_transactions` from Local Storage; fallback to `[]` on error |
| `saveToStorage` | `() → void` | Serialize `transactions` to Local Storage |
| `addTransaction` | `(name, amount, category) → void` | Validate inputs, push new Transaction, save, render |
| `deleteTransaction` | `(id) → void` | Filter out transaction by id, save, render |
| `renderList` | `() → void` | Clear and rebuild `#transaction-list` from `transactions`; toggle `#empty-state` |
| `updateBalance` | `() → void` | Sum all amounts, update `#total-balance` text |
| `updateChart` | `() → void` | Aggregate amounts per category; update or create Chart.js instance |
| `validateForm` | `(name, amount, category) → string\|null` | Return error message string or null if valid |
| `init` | `() → void` | Entry point — load storage, render all, attach form listener |

#### Event Handling

```javascript
// Form submit
document.getElementById("transaction-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const name     = document.getElementById("item-name").value.trim();
    const amount   = parseFloat(document.getElementById("item-amount").value);
    const category = document.getElementById("item-category").value;
    const error    = validateForm(name, amount, category);
    if (error) {
      document.getElementById("form-error").textContent = error;
      return;
    }
    document.getElementById("form-error").textContent = "";
    addTransaction(name, amount, category);
    e.target.reset();
  });

// Delete button (event delegation on the list)
document.getElementById("transaction-list")
  .addEventListener("click", (e) => {
    if (e.target.matches("[data-delete-id]")) {
      deleteTransaction(e.target.dataset.deleteId);
    }
  });
```

#### Validation Rules

| Field | Valid condition |
|---|---|
| `name` | Non-empty string after trimming |
| `amount` | A finite number greater than 0 |
| `category` | One of `"Food"`, `"Transport"`, `"Fun"` |

#### Chart.js Integration

```javascript
function updateChart() {
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
```

---

### 3. `css/style.css`

Key layout decisions:
- Flexbox column layout for the main container; two-column grid on wider viewports (form + list left, chart right).
- `overflow-y: auto` with a fixed `max-height` on `#transaction-list` to enable scrolling.
- CSS custom properties (variables) for the color palette to keep theming consistent.
- Clean sans-serif typography; sufficient contrast ratios for readability.
- Responsive breakpoints: single-column below 640 px, two-column above.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Form submitted with empty fields | Show inline error in `#form-error`; do not add transaction |
| Amount is zero, negative, or non-numeric | Show inline error; do not add transaction |
| Local Storage unavailable or corrupt | `loadFromStorage` catches JSON parse errors; starts with empty array |
| Chart.js CDN fails to load | `updateChart` guards with `if (typeof Chart === "undefined")` check; logs warning, skips chart render |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid submission adds exactly one transaction

For any valid combination of item name, positive amount, and category, submitting the Input Form shall increase the length of the Transaction List by exactly 1 and the new entry shall contain the submitted name, amount, and category.

**Validates: Requirements 1.2, 2.1**

---

### Property 2: Invalid submissions are rejected

For any form submission where at least one field is empty, or the amount is non-positive or non-numeric, the Transaction List length shall remain unchanged after the submission attempt.

**Validates: Requirements 1.3, 1.4**

---

### Property 3: Total Balance is always the sum of all transaction amounts

For any collection of transactions (including the empty collection), the value displayed as Total Balance shall equal the arithmetic sum of all transaction amounts (and shall be 0 when the collection is empty).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

### Property 4: Chart data always reflects current transaction state

For any collection of transactions, the data passed to the Pie Chart shall equal the per-category sum computed from the current transaction array — meaning adding or deleting any transaction shall produce a chart dataset that matches a fresh aggregation of the post-mutation array.

**Validates: Requirements 4.2, 4.3**

---

### Property 5: Transaction persistence round-trip

For any transaction added to the app, reading the `ebv_transactions` key from Local Storage and parsing it shall yield an array that contains an entry matching that transaction's id, name, amount, and category.

**Validates: Requirements 5.1, 5.2**

---

### Property 6: App initialization restores full state

For any collection of transactions written to Local Storage before the app initializes, after initialization the Transaction List, Total Balance, and Pie Chart shall reflect every transaction in that stored collection.

**Validates: Requirements 5.3**

---

### Property 7: Deletion removes transaction and is reflected everywhere

For any transaction currently in the list, deleting it shall result in: (a) the transaction no longer appearing in the Transaction List, (b) the Total Balance decreasing by that transaction's amount, (c) the Pie Chart data no longer including that transaction's amount, and (d) Local Storage no longer containing an entry with that transaction's id.

**Validates: Requirements 2.3, 3.3, 4.3, 5.2**
