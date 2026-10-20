# Nexus Inventory & Optimization System

A production-grade full-stack web application developed for a **Design and Analysis of Algorithms (DAA)** curriculum. It implements, visualizes, and rigorously benchmarks custom in-memory data structures and algorithms—including an **AVL Tree (Self-Balancing Binary Search Tree)**, a **Hash Map (Direct Key Lookup)**, an **Array (Linear Search)**, and a **0/1 Knapsack Dynamic Programming Optimizer with Constraints**—without external database engines.

---

## Architecture & Technology Stack

- **Frontend:**
  - React.js 18
  - Vite 5
  - Bootstrap 5 + Clean Custom Slate Theme
  - Interactive SVG & HTML5 Canvas visualizers
- **Backend:**
  - Node.js
  - Express.js REST API
  - High-Resolution Timers (`process.hrtime.bigint`)
- **Offline / Resilient Fallback:**
  - In-browser mirror (`clientStorage.js` & `benchmark.js`) ensuring 100% functionality even when offline or disconnected.

---

## Core Algorithms & Data Structures

### 1. AVL Tree (`backend/avlTree.js` & `frontend/src/avlTree.js`)
Self-balancing Binary Search Tree keyed by numeric **Product ID**.
- Maintains Balance Factor: $BF = \text{Height}(\text{left}) - \text{Height}(\text{right}) \in \{-1, 0, +1\}$.
- Automatic rebalancing via 4 rotation types:
  - **Left-Left (LL):** Single Right Rotation
  - **Right-Right (RR):** Single Left Rotation
  - **Left-Right (LR):** Double Rotation (Left on child, Right on node)
  - **Right-Left (RL):** Double Rotation (Right on child, Left on node)
- Guaranteed worst-case **$O(\log n)$** search, insertion, and deletion.
- **$O(\log n + k)$ Range Query (`rangeSearch(minId, maxId)`):** Prunes subtrees outside $[minId, maxId]$ to report $k$ matching items efficiently.
- In-Order Traversal yields sorted inventory in **$O(n)$** time.

### 2. Hash Map (`backend/inventory.js` & native `Map`)
Direct key-value store mapping `Product ID → Inventory Item`.
- **$O(1)$ average** direct retrieval, insertion, and deletion.
- Kept in lockstep synchronization with the AVL Tree and Array for all CRUD operations.

### 3. Linear Array (`itemsArray`)
Contiguous memory array maintained in parallel for empirical comparison against $O(\log n)$ and $O(1)$.

### 4. 0/1 Knapsack Optimizer with Delivery Constraints (`backend/knapsack.js` & `frontend/src/knapsack.js`)
Logistics cargo planning algorithm supporting **Mandatory**, **Optional**, and **Excluded** cargo states:
- **Feasibility Verification:** Detects if $\sum \text{Weight}(\text{Mandatory}) > \text{Capacity}$, returning clear diagnostic explanations.
- **Constrained Subproblem:** Optimizes optional items over remaining capacity: $\text{Capacity}_{\text{rem}} = W - W_{\text{mandatory}}$.
- **2D Dynamic Programming:** Solves subproblem in $O(n_{\text{opt}} \cdot W_{\text{rem}})$ time and space with backtracking.

---

## Application Sections

### 1. Inventory (`/`)
- Production-style product catalog.
- Quick text search (Name, Category, exact ID).
- Expandable **Advanced Filters** panel:
  - Product ID range (uses AVL Tree $O(\log n + k)$ range queries)
  - Category selector
  - Price range (Min & Max ₹)
  - Quantity range (Min & Max stock)
  - Weight range (Min & Max kg)
- Sorting by any column with ascending/descending controls.
- Pagination with selectable row sizes (10, 25, 50, 100).
- Add and Edit product modals with comprehensive validation.
- Delete confirmation modal.

### 2. Truck Loading (`/truck-loading`)
- Real-world logistics cargo planning.
- Configurable truck payload capacity (kg).
- Candidate item controls with 3-state selector:
  - **Mandatory:** Guaranteed delivery.
  - **Optional:** Optimizer includes item if it maximizes total payload value.
  - **Excluded:** Omitted from cargo.
- Automatic feasibility check with excess weight reporting.
- Visual payload utilization progress bar.
- Final Cargo Manifest with decision explanations.
- Collapsible 2D Dynamic Programming matrix inspection.

### 3. Benchmarking Laboratory (`/benchmarking`)
- Dedicated empirical performance analysis workspace.
- Configurable experiments:
  - Dataset sizes: 100, 500, 1,000, 5,000, 10,000 items.
  - Search types: Successful (guaranteed found) vs Unsuccessful (guaranteed missing).
  - Target positions: Random, First (index 0), Middle (index N/2), Last (index N-1), Custom ID.
  - Repetitions: 50, 100, 500, 1,000, 2,000 trials.
- Isolated dataset generation (leaves live warehouse inventory untouched).
- Statistical metrics table: Median, Mean, Min, Max latencies, and algorithmic work metrics.
- Bar chart comparing median latencies across AVL Tree, Hash Map, and Linear Search.
- Factual performance summary and theoretical complexity matrix.
- Session experiment history table with CSV export.

### 4. Algorithm Details (`/visualization`)
- Dynamic SVG tree visualization with interactive card inspection.
- Live display of node Heights ($H$) and Balance Factors ($BF$).
- Full-dataset Canvas preview for large datasets (200, 1,500 nodes) with pan, zoom, and search path highlight.
- Hash Map key-value grid.
- Asymptotic complexity comparison table ($O(\log n)$ vs $O(1)$ vs $O(n)$).

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/inventory` | Returns all items sorted by Product ID (AVL in-order traversal) |
| `GET` | `/api/inventory/search/:id` | Searches AVL Tree and Hash Map, returns comparisons and path |
| `GET` | `/api/inventory/range` | Executes AVL Tree range search `?minId=X&maxId=Y` |
| `POST` | `/api/inventory` | Inserts new item into AVL Tree and Hash Map |
| `PUT` | `/api/inventory/:id` | Updates item in all data structures |
| `DELETE`| `/api/inventory/:id` | Deletes item and rebalances AVL Tree |
| `POST` | `/api/inventory/knapsack` | Solves 0/1 Knapsack with Mandatory/Optional/Excluded constraints |
| `POST` | `/api/inventory/benchmark` | Runs empirical search benchmark on isolated dataset |
| `GET` | `/api/inventory/visualization` | Returns tree hierarchy and hash map entries for visual rendering |
| `POST` | `/api/inventory/reset` | Resets to 10 sample items |
| `POST` | `/api/inventory/demo-large-data` | Generates 10, 200, or 1,500 items in memory |

---

## How to Run

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
```
Runs on: **`http://localhost:5001`** (or configured `PORT`).

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Runs on: **`http://localhost:5173`**.

### 4. Production Build
```bash
cd frontend
npm run build
```
Generates static assets in `frontend/dist/`.
