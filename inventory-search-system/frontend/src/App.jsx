import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import InventoryPage from './pages/InventoryPage';
import VisualizationPage from './pages/VisualizationPage';
import TruckLoadingPage from './pages/TruckLoadingPage';
import { clientInventory } from './clientStorage';

const API_BASE = '/api/inventory';

export default function App() {
  const [activePage, setActivePage] = useState('inventory');
  const [items, setItems] = useState([]);
  const [visualizationData, setVisualizationData] = useState({
    tree: null,
    hashMap: [],
    totalItems: 0,
    treeHeight: 0
  });
  const [alert, setAlert] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // Synchronize data from backend if available, or fall back to client in-memory engine
  const loadData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const [invRes, visRes] = await Promise.all([
        fetch(API_BASE, { signal: controller.signal }),
        fetch(`${API_BASE}/visualization`, { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);

      if (invRes.ok && visRes.ok) {
        const invJson = await invRes.json();
        const visJson = await visRes.json();

        if (invJson.success && visJson.success) {
          setIsBackendConnected(true);
          setItems(invJson.data);
          setVisualizationData(visJson.data);
          return;
        }
      }
      throw new Error('Backend response not successful');
    } catch {
      // Backend not running; fall back to client in-memory engine seamlessly
      setIsBackendConnected(false);
      setItems(clientInventory.getAll());
      setVisualizationData(clientInventory.getVisualizationData());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Item
  const handleAddItem = async (itemData) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showAlert(`Product #${itemData.id} (${itemData.name}) added successfully.`);
          await loadData();
          return data.data;
        } else {
          showAlert(data.message || 'Failed to add product.', 'error');
          return false;
        }
      } catch (err) {
        console.warn('Backend call failed, falling back to client engine', err);
        setIsBackendConnected(false);
      }
    }

    // Client In-Memory fallback
    try {
      const newItem = clientInventory.insert(itemData);
      showAlert(`Product #${itemData.id} (${itemData.name}) added to local inventory.`);
      setItems(clientInventory.getAll());
      setVisualizationData(clientInventory.getVisualizationData());
      return newItem;
    } catch (err) {
      showAlert(err.message, 'error');
      return false;
    }
  };

  // Update Item
  const handleUpdateItem = async (id, updatedData) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showAlert(`Product #${id} updated successfully.`);
          await loadData();
          return data.data;
        } else {
          showAlert(data.message || 'Failed to update product.', 'error');
          return false;
        }
      } catch (err) {
        console.warn('Backend call failed, falling back to client engine', err);
        setIsBackendConnected(false);
      }
    }

    // Client In-Memory fallback
    try {
      const updatedItem = clientInventory.update(id, updatedData);
      showAlert(`Product #${id} updated in local inventory.`);
      setItems(clientInventory.getAll());
      setVisualizationData(clientInventory.getVisualizationData());
      return updatedItem;
    } catch (err) {
      showAlert(err.message, 'error');
      return false;
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          showAlert(`Product #${id} removed from inventory.`);
          await loadData();
          return data.data;
        } else {
          showAlert(data.message || 'Failed to delete product.', 'error');
          return false;
        }
      } catch (err) {
        console.warn('Backend call failed, falling back to client engine', err);
        setIsBackendConnected(false);
      }
    }

    // Client In-Memory fallback
    try {
      const deletedItem = clientInventory.delete(id);
      showAlert(`Product #${id} removed from local inventory.`);
      setItems(clientInventory.getAll());
      setVisualizationData(clientInventory.getVisualizationData());
      return deletedItem;
    } catch (err) {
      showAlert(err.message, 'error');
      return false;
    }
  };

  // Search single item (used by visualization page)
  const handleSearchItem = async (id) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/search/${id}`);
        const data = await res.json();
        if (data.data) {
          return data.data;
        }
      } catch (err) {
        console.warn('Backend call failed, using client engine search', err);
        setIsBackendConnected(false);
      }
    }

    // Client In-Memory search
    try {
      return clientInventory.search(id);
    } catch (err) {
      showAlert('Error occurred during search: ' + err.message, 'error');
      return null;
    }
  };

  // Range Search (used by AdvancedSearch)
  const handleRangeSearch = useCallback((minId, maxId) => {
    return clientInventory.rangeSearch(minId, maxId);
  }, []);

  // Run Empirical Benchmark
  const handleRunBenchmark = async (benchmarkConfig) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/benchmark`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(benchmarkConfig)
        });
        const json = await res.json();
        if (res.ok && json.success) {
          return json.data;
        }
      } catch (err) {
        console.warn('Backend benchmark failed, falling back to client engine', err);
        setIsBackendConnected(false);
      }
    }

    // Client fallback benchmark
    return clientInventory.runBenchmark(benchmarkConfig);
  };

  // Load dataset (10 items, 200 items, or 1500 items)
  const handleLoadDataset = async (count = 10) => {
    setLoadingDataset(true);

    if (count === 10) {
      if (isBackendConnected) {
        try {
          const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showAlert('Loaded 10 default sample items.');
            await loadData();
            setLoadingDataset(false);
            return;
          }
        } catch (err) {
          console.warn('Backend call failed, resetting client engine', err);
          setIsBackendConnected(false);
        }
      }

      clientInventory.seedInitialData();
      showAlert('Loaded 10 default sample items.');
      setItems(clientInventory.getAll());
      setVisualizationData(clientInventory.getVisualizationData());
      setLoadingDataset(false);
      return;
    }

    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/demo-large-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: Number(count) })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showAlert(`Loaded ${data.data.count.toLocaleString()} items into AVL Tree and Hash Map in ${data.data.timeTakenMs}ms.`);
          await loadData();
          setLoadingDataset(false);
          return;
        }
      } catch (err) {
        console.warn('Backend call failed, using client dataset generator', err);
        setIsBackendConnected(false);
      }
    }

    // Client in-memory dataset generation
    try {
      const stats = clientInventory.loadLargeData(count);
      showAlert(`Loaded ${stats.count.toLocaleString()} items in ${stats.timeTakenMs}ms! Tree height: ${stats.treeHeight}.`);
      setItems(clientInventory.getAll());
      setVisualizationData(clientInventory.getVisualizationData());
    } catch (err) {
      showAlert('Error generating dataset: ' + err.message, 'error');
    } finally {
      setLoadingDataset(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Application Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onLoadDataset={handleLoadDataset}
        totalItems={items.length}
        loadingDataset={loadingDataset}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main className="container-fluid px-3 px-lg-4 py-3 flex-grow-1" style={{ maxWidth: '1440px' }}>
        {activePage === 'inventory' ? (
          <InventoryPage
            items={items}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onRangeSearch={handleRangeSearch}
            alert={alert}
            onDismissAlert={() => setAlert(null)}
          />
        ) : activePage === 'truck-loading' ? (
          <TruckLoadingPage
            items={items}
            isBackendConnected={isBackendConnected}
          />
        ) : (
          <VisualizationPage
            visualizationData={visualizationData}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onSearchItem={handleSearchItem}
            alert={alert}
            onDismissAlert={() => setAlert(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-top py-2 px-3 text-secondary small bg-white mt-auto" style={{ fontSize: '0.75rem' }}>
        <div className="container-fluid px-3 px-lg-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Inventory Search &amp; Optimization System</span>
          {isBackendConnected && (
            <span className="text-secondary">
              Backend Connected
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
