import React, { useState, useMemo, useCallback } from 'react';
import AdvancedSearch from '../components/AdvancedSearch';
import InventoryTable from '../components/InventoryTable';
import ItemModal from '../components/ItemModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function InventoryPage({
  items = [],
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onRangeSearch,
  alert,
  onDismissAlert
}) {
  const [activeFilters, setActiveFilters] = useState({});
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach(it => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Handle filter changes from AdvancedSearch
  const handleFilterChange = useCallback((filterCriteria) => {
    setActiveFilters(filterCriteria);
  }, []);

  // Filtered dataset combining AVL range query & field checks
  const filteredItems = useMemo(() => {
    let dataset = items;

    // 1. If ID range is specified and onRangeSearch is available, use AVL Tree range query
    if (activeFilters.minId !== null || activeFilters.maxId !== null) {
      if (typeof onRangeSearch === 'function') {
        const rangeResult = onRangeSearch(activeFilters.minId, activeFilters.maxId);
        if (rangeResult && Array.isArray(rangeResult.items)) {
          dataset = rangeResult.items;
        } else {
          dataset = dataset.filter(it => {
            if (activeFilters.minId !== null && it.id < activeFilters.minId) return false;
            if (activeFilters.maxId !== null && it.id > activeFilters.maxId) return false;
            return true;
          });
        }
      } else {
        dataset = dataset.filter(it => {
          if (activeFilters.minId !== null && it.id < activeFilters.minId) return false;
          if (activeFilters.maxId !== null && it.id > activeFilters.maxId) return false;
          return true;
        });
      }
    }

    // 2. Quick text query (name or exact ID match)
    if (activeFilters.quickQuery) {
      const q = activeFilters.quickQuery.toLowerCase();
      dataset = dataset.filter(it => {
        const nameMatch = it.name && it.name.toLowerCase().includes(q);
        const idMatch = String(it.id) === q;
        const catMatch = it.category && it.category.toLowerCase().includes(q);
        return nameMatch || idMatch || catMatch;
      });
    }

    // 3. Category filter
    if (activeFilters.category) {
      dataset = dataset.filter(it => it.category === activeFilters.category);
    }

    // 4. Price range filter
    if (activeFilters.minPrice !== null) {
      dataset = dataset.filter(it => Number(it.price) >= activeFilters.minPrice);
    }
    if (activeFilters.maxPrice !== null) {
      dataset = dataset.filter(it => Number(it.price) <= activeFilters.maxPrice);
    }

    // 5. Quantity range filter
    if (activeFilters.minQuantity !== null) {
      dataset = dataset.filter(it => Number(it.quantity) >= activeFilters.minQuantity);
    }
    if (activeFilters.maxQuantity !== null) {
      dataset = dataset.filter(it => Number(it.quantity) <= activeFilters.maxQuantity);
    }

    // 6. Weight range filter
    if (activeFilters.minWeight !== null) {
      dataset = dataset.filter(it => Number(it.weight || 1) >= activeFilters.minWeight);
    }
    if (activeFilters.maxWeight !== null) {
      dataset = dataset.filter(it => Number(it.weight || 1) <= activeFilters.maxWeight);
    }

    return dataset;
  }, [items, activeFilters, onRangeSearch]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (itemData) => {
    if (editingItem) {
      const success = await onUpdateItem(editingItem.id, itemData);
      if (success) setIsItemModalOpen(false);
    } else {
      const success = await onAddItem(itemData);
      if (success) setIsItemModalOpen(false);
    }
  };

  return (
    <div className="pb-4">
      {/* Page Title & Primary Action Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2 pb-2 border-bottom">
        <h1 className="h6 fw-bold text-dark mb-0">Inventory</h1>

        <button
          type="button"
          className="btn btn-sm btn-dark"
          onClick={handleOpenAddModal}
        >
          Add Product
        </button>
      </div>

      {/* Alert Notifications */}
      {alert && (
        <div
          className={`alert py-2 px-3 small d-flex justify-content-between align-items-center mb-3 ${
            alert.type === 'error' ? 'alert-danger' : 'alert-success border-success-subtle'
          }`}
          role="alert"
        >
          <span>{alert.message}</span>
          <button type="button" className="btn-close py-2" aria-label="Close" onClick={onDismissAlert}></button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <AdvancedSearch
        categories={categories}
        onFilterChange={handleFilterChange}
        totalItems={items.length}
        filteredCount={filteredItems.length}
      />

      {/* Main Inventory Data Table */}
      <InventoryTable
        items={filteredItems}
        onEditItem={handleOpenEditModal}
        onDeleteItem={(item) => setItemToDelete(item)}
      />

      {/* Add / Edit Product Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={(id) => onDeleteItem(id)}
        item={itemToDelete}
      />
    </div>
  );
}
