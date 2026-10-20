import React, { useState, useEffect } from 'react';

export default function InventoryForm({ onAddItem, onUpdateItem, editingItem, onCancelEdit }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    quantity: '',
    price: ''
  });

  // When editingItem changes, populate form
  useEffect(() => {
    if (editingItem) {
      setFormData({
        id: editingItem.id,
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity,
        price: editingItem.price
      });
    } else {
      setFormData({
        id: '',
        name: '',
        category: '',
        quantity: '',
        price: ''
      });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(formData.id, formData);
    } else {
      onAddItem(formData);
    }
  };

  const handleClear = () => {
    setFormData({
      id: '',
      name: '',
      category: '',
      quantity: '',
      price: ''
    });
    if (editingItem) {
      onCancelEdit();
    }
  };

  return (
    <div className="card bg-white border mb-3">
      <div className="card-body p-3">
        <h2 className="card-title h6 fw-bold text-dark mb-0">
          {editingItem ? `Update Item (ID: ${editingItem.id})` : 'Add Inventory Item'}
        </h2>
        <p className="text-secondary small mb-3">
          {editingItem
            ? 'Modify item and update in AVL Tree and Hash Map'
            : 'Inserts node into AVL Tree (auto-balancing) and adds entry into Hash Map'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label text-secondary small fw-semibold mb-1">Product ID</label>
              <input
                type="number"
                name="id"
                placeholder="e.g. 101"
                value={formData.id}
                onChange={handleChange}
                disabled={!!editingItem}
                className="form-control form-control-sm bg-white border"
                required
              />
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label text-secondary small fw-semibold mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Sony Camera"
                value={formData.name}
                onChange={handleChange}
                className="form-control form-control-sm bg-white border"
                required
              />
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label text-secondary small fw-semibold mb-1">Category</label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Electronics"
                value={formData.category}
                onChange={handleChange}
                className="form-control form-control-sm bg-white border"
                required
              />
            </div>

            <div className="col-6 col-sm-6 col-md-2">
              <label className="form-label text-secondary small fw-semibold mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                placeholder="e.g. 5"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className="form-control form-control-sm bg-white border"
                required
              />
            </div>

            <div className="col-6 col-sm-6 col-md-2">
              <label className="form-label text-secondary small fw-semibold mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 150000"
                min="0"
                step="any"
                value={formData.price}
                onChange={handleChange}
                className="form-control form-control-sm bg-white border"
                required
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            {editingItem ? (
              <>
                <button type="submit" className="btn btn-sm btn-secondary">
                  Update Item
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleClear}>
                  Cancel Edit
                </button>
              </>
            ) : (
              <>
                <button type="submit" className="btn btn-sm btn-secondary">
                  Add Item
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleClear}>
                  Clear Form
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
