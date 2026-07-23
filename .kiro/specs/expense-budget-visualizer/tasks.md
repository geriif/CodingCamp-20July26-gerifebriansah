# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a client-side expense tracker using plain HTML, CSS, and vanilla JavaScript. Implementation proceeds in four incremental steps: project scaffold → core state + persistence → UI rendering → chart integration. Each step is self-contained and leaves the app in a runnable state.

Language: **HTML / CSS / Vanilla JavaScript**

---

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `expense-budget-visualizer/index.html` with semantic sections: balance banner (`#balance-section`), input form (`#form-section`), transaction list (`#list-section`), and chart canvas (`#chart-section`)
  - Add a `<link>` to `css/style.css` and a `<script defer src="js/app.js">` in `index.html`
  - Add the Chart.js CDN `<script>` tag before `app.js`: `https://cdn.jsdelivr.net/npm/chart.js`
  - Create `css/style.css` and `js/app.js` as empty stubs so the page loads without errors
  - Add the `<canvas id="categoryChart">` element inside `#chart-section`
  - Add `<p id="form-error" aria-live="polite">` inside the form for validation messages
  - Add `<p id="empty-state">` inside `#list-section` for the empty-state message
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement state management and Local Storage persistence
  - [x] 2.1 Define the in-memory state and Local Storage helpers in `js/app.js`
    - Declare `let transactions = []` and `let chartInstance = null`
    - Implement `loadFromStorage()`: read `ebv_transactions` from `localStorage`, `JSON.parse` the value, fall back to `[]` if key is missing or JSON is malformed (wrap in try/catch)
    - Implement `saveToStorage()`: `JSON.stringify(transactions)` and write to `ebv_transactions`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.2 Write property test for Local Storage round-trip (Property 5)
    - **Property 5: Transaction persistence round-trip**
    - For any transaction added, `JSON.parse(localStorage.getItem("ebv_transactions"))` should contain an entry matching that transaction's id, name, amount, and category
    - **Validates: Requirements 5.1, 5.2**



- [x] 3. Implement core transaction logic and form validation
  - [x] 3.1 Implement `validateForm(name, amount, category)`
    - Return a descriptive error string if `name.trim()` is empty, if `amount` is not a finite number greater than 0, or if `category` is not one of `"Food"`, `"Transport"`, `"Fun"`
    - Return `null` when all fields are valid
    - _Requirements: 1.3, 1.4_



  - [x] 3.3 Implement `addTransaction(name, amount, category)`
    - Generate a unique `id` with `crypto.randomUUID()` (or `Date.now().toString()` as fallback)
    - Push `{ id, name, amount, category }` onto `transactions`
    - Call `saveToStorage()`, then `renderList()`, `updateBalance()`, `updateChart()`
    - _Requirements: 1.2, 5.1_



  - [x] 3.5 Implement `deleteTransaction(id)`
    - Filter `transactions` to remove the entry with the matching id
    - Call `saveToStorage()`, then `renderList()`, `updateBalance()`, `updateChart()`
    - _Requirements: 2.3, 5.2_



- [x] 4. Checkpoint — core logic
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement DOM rendering functions
  - [x] 5.1 Implement `renderList()`
    - Clear `#transaction-list` innerHTML
    - For each transaction in `transactions`, append an `<li>` showing name, formatted amount, category badge, and a delete `<button data-delete-id="...">` 
    - Toggle `#empty-state` visibility: show when `transactions.length === 0`, hide otherwise
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 5.2 Implement `updateBalance()`
    - Compute `transactions.reduce((sum, t) => sum + t.amount, 0)`
    - Update `#total-balance` text content with the formatted total (e.g., `Rp 15,000`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_



  - [x] 5.4 Attach form submit event listener
    - On submit: `e.preventDefault()`, read and trim form field values, call `validateForm`, display error in `#form-error` if invalid, otherwise clear error, call `addTransaction`, and call `e.target.reset()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.5 Attach delete event listener via delegation on `#transaction-list`
    - Listen for `click` on the list; if `e.target.matches("[data-delete-id]")`, call `deleteTransaction(e.target.dataset.deleteId)`
    - _Requirements: 2.3_

- [x] 6. Implement Chart.js Pie Chart
  - [x] 6.1 Implement `updateChart()`
    - Aggregate amounts by category into `{ Food: 0, Transport: 0, Fun: 0 }`
    - If `chartInstance` already exists, update its data and call `chartInstance.update()`
    - Otherwise create a new `Chart` on `#categoryChart` canvas with `type: "pie"`
    - Guard with `if (typeof Chart === "undefined")` to gracefully skip if CDN fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_



- [x] 7. Implement `init()` and wire everything together
  - Implement `init()`: call `loadFromStorage()`, then `renderList()`, `updateBalance()`, `updateChart()`
  - Call `init()` at the bottom of `app.js` (runs once on page load)
  - Verify the full flow: page load restores stored data; form add/delete updates list, balance, chart, and storage in sync
  - _Requirements: 5.3, 5.4_

- [x] 8. Style with `css/style.css`
  - Define CSS custom properties for the color palette (background, accent, category colors matching chart)
  - Layout: flexbox column for mobile; two-column CSS grid for viewports ≥ 640 px (form+list left, chart right)
  - Set `overflow-y: auto` and a fixed `max-height` (e.g., `300px`) on `#transaction-list` to enable scrolling
  - Style the form inputs, select, button with consistent padding and border-radius
  - Style category badges on list items with distinct background colors matching the chart palette
  - Ensure readable font sizes and sufficient color contrast
  - _Requirements: NFR-1, NFR-2, NFR-3_

- [x] 9. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The app has no build step — open `index.html` directly in a browser to run it
- Chart.js is loaded via CDN; no `npm install` needed
- Property tests can be implemented using any lightweight test runner (e.g., `qunit`, `jest` with jsdom, or a manual test harness in a separate `test.html`)
- All `*` test sub-tasks reference specific properties from `design.md` for traceability
