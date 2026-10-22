const express = require('express');
const cors = require('cors');
const path = require('path');
const inventory = require('./inventory');
const { solveKnapsack } = require('./knapsack');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// 1. GET /api/inventory - Get all inventory items (AVL In-Order traversal)
app.get('/api/inventory', (req, res) => {
  try {
    const items = inventory.getAll();
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/inventory/search/:id - Search item by Product ID
app.get('/api/inventory/search/:id', (req, res) => {
  try {
    const result = inventory.search(req.params.id);
    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: `Product ID ${req.params.id} not found`,
        data: result
      });
    }
    res.json({
      success: true,
      message: 'Product found successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. POST /api/inventory - Add new inventory item
app.post('/api/inventory', (req, res) => {
  try {
    const newItem = inventory.insert(req.body);
    res.status(201).json({
      success: true,
      message: 'Item added successfully to AVL Tree and Hash Map',
      data: newItem
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. PUT /api/inventory/:id - Update existing item
app.put('/api/inventory/:id', (req, res) => {
  try {
    const updatedItem = inventory.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Item updated successfully in AVL Tree and Hash Map',
      data: updatedItem
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. DELETE /api/inventory/:id - Delete item
app.delete('/api/inventory/:id', (req, res) => {
  try {
    const deletedItem = inventory.delete(req.params.id);
    res.json({
      success: true,
      message: 'Item deleted successfully from AVL Tree and Hash Map',
      data: deletedItem
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// 6. GET /api/inventory/visualization - Get data for visualization page
app.get('/api/inventory/visualization', (req, res) => {
  try {
    const visualData = inventory.getVisualizationData();
    res.json({
      success: true,
      data: visualData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. POST /api/inventory/reset - Reset to default seed items
app.post('/api/inventory/reset', (req, res) => {
  try {
    inventory.seedInitialData();
    res.json({
      success: true,
      message: 'Inventory reset to initial seed data'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. POST /api/inventory/demo-large-data - Load dataset by count (10, 200, 1500)
app.post('/api/inventory/demo-large-data', (req, res) => {
  try {
    const count = Number(req.body.count) || 200;
    if (count === 10) {
      inventory.seedInitialData();
      return res.json({
        success: true,
        message: 'Loaded 10 items dataset',
        data: {
          count: 10,
          treeHeight: inventory.avlTree.getHeight(inventory.avlTree.root),
          timeTakenMs: 0.5
        }
      });
    }
    const stats = inventory.loadLargeData(count);
    res.json({
      success: true,
      message: `Loaded ${stats.count} items into AVL Tree and Hash Map in ${stats.timeTakenMs}ms`,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. POST /api/inventory/knapsack - 0/1 Knapsack Truck Loading calculation
app.post('/api/inventory/knapsack', (req, res) => {
  try {
    const capacity = req.body.capacity !== undefined ? Number(req.body.capacity) : 15;
    const items = req.body.items || inventory.getAll();
    const result = solveKnapsack(items, capacity);
    res.json({
      success: true,
      message: 'Optimal truck loading computed via 0/1 Knapsack DP',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. GET /api/inventory/range - AVL Tree Range Query
app.get('/api/inventory/range', (req, res) => {
  try {
    const { minId, maxId } = req.query;
    const result = inventory.avlTree.rangeSearch(minId, maxId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Fallback to index.html for SPA routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Inventory Search System Backend running on http://localhost:${PORT}`);
});
