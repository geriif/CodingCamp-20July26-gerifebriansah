# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses by entering transactions with a name, amount, and category. It displays a running balance, a scrollable transaction list with delete capability, and an auto-updating pie chart showing spending distribution by category. All data is persisted in the browser's Local Storage. The app is built with plain HTML, CSS, and vanilla JavaScript — no backend or framework required.

---

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single expense entry consisting of an item name, an amount (positive numeric value), and a category.
- **Category**: One of three fixed spending labels: Food, Transport, or Fun.
- **Transaction List**: The scrollable on-screen list that displays all stored transactions.
- **Total Balance**: The running sum of all transaction amounts displayed prominently at the top of the page.
- **Pie Chart**: A visual chart rendered via Chart.js showing the proportion of total spending per category.
- **Local Storage**: The browser's Web Storage API used to persist transaction data client-side.
- **Input Form**: The HTML form containing the Item Name, Amount, and Category fields used to add new transactions.

---

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, and category so that I can record a new expense.

#### Acceptance Criteria

1. THE App SHALL render an Input Form containing an Item Name text field, an Amount numeric field, and a Category selector with options Food, Transport, and Fun.
2. WHEN a user submits the Input Form with all fields filled in, THE App SHALL create a new Transaction and add it to the Transaction List.
3. WHEN a user submits the Input Form with one or more fields empty, THEN THE App SHALL display an inline validation message indicating which fields are required and SHALL NOT create a Transaction.
4. WHEN a user submits the Input Form with a non-positive or non-numeric value in the Amount field, THEN THE App SHALL display a validation message and SHALL NOT create a Transaction.
5. WHEN a Transaction is successfully added, THE App SHALL clear all Input Form fields so the form is ready for the next entry.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded expenses in a scrollable list so that I can review what I have entered.

#### Acceptance Criteria

1. THE App SHALL render a Transaction List that displays every stored Transaction, showing the item name, amount, and category for each entry.
2. WHILE the number of displayed Transactions exceeds the visible area of the list container, THE App SHALL make the Transaction List scrollable so all entries remain accessible.
3. WHEN a user clicks the delete control on a Transaction, THE App SHALL remove that Transaction from the Transaction List and from Local Storage.
4. WHEN the Transaction List is empty, THE App SHALL display an empty-state message informing the user that no transactions have been added yet.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending balance updated automatically so that I always know my current total.

#### Acceptance Criteria

1. THE App SHALL display a Total Balance value at the top of the page, calculated as the sum of all Transaction amounts.
2. WHEN a Transaction is added, THE App SHALL recalculate and update the Total Balance immediately without a page reload.
3. WHEN a Transaction is deleted, THE App SHALL recalculate and update the Total Balance immediately without a page reload.
4. WHEN no Transactions exist, THE App SHALL display a Total Balance of 0.

---

### Requirement 4: Pie Chart Visualization

**User Story:** As a user, I want to see a pie chart of my spending by category so that I can understand where my money goes.

#### Acceptance Criteria

1. THE App SHALL render a Pie Chart that shows the proportion of total spending attributed to each Category (Food, Transport, Fun) using Chart.js.
2. WHEN a Transaction is added, THE App SHALL update the Pie Chart immediately to reflect the new spending distribution.
3. WHEN a Transaction is deleted, THE App SHALL update the Pie Chart immediately to reflect the revised spending distribution.
4. WHEN only one Category has transactions, THE App SHALL render the Pie Chart showing a single segment for that Category.
5. WHEN no Transactions exist, THE App SHALL render the Pie Chart in an empty or zero-data state without throwing a runtime error.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved so that my data is still there when I refresh or reopen the browser.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE App SHALL write the updated Transaction collection to Local Storage immediately.
2. WHEN a Transaction is deleted, THE App SHALL write the updated Transaction collection to Local Storage immediately.
3. WHEN the App initializes, THE App SHALL read all Transactions from Local Storage and populate the Transaction List, Total Balance, and Pie Chart with the stored data.
4. IF Local Storage is unavailable or returns malformed data, THEN THE App SHALL initialize with an empty Transaction collection and SHALL NOT throw an uncaught error.

---

### Requirement 6: Project Structure and Technology Constraints

**User Story:** As a developer, I want the project to follow a specific file structure and use only plain web technologies so that the codebase stays simple and portable.

#### Acceptance Criteria

1. THE App SHALL be delivered as a single `index.html` file at the project root, one `css/style.css` file, and one `js/app.js` file, with no additional CSS or JavaScript files.
2. THE App SHALL use only HTML, CSS, and vanilla JavaScript with no JavaScript frameworks or build tools.
3. THE App SHALL load Chart.js from a CDN link in `index.html` and SHALL NOT require a local installation or package manager.
4. THE App SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari without requiring any browser plugins.
