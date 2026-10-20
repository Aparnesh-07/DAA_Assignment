import React, { useState, useEffect } from 'react';

export default function ItemModal({ isOpen, onClose, onSave, item = null }) {
  const isEditing = Boolean(item);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    quantity: '',
    price: '',
    weight: '1'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || '',
        name: item.name || '',
        category: item.category || '',
        quantity: item.quantity !== undefined ? item.quantity : '',
        price: item.price !== undefined ? item.price : '',
        weight: item.weight !== undefined ? item.weight : '1'
      });
      setErrors({});
    } else {
      setFormData({
        id: '',
        name: '',
        category: '',
        quantity: '',
        price: '',
        weight: '1'
      });
      setErrors({});
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.id || isNaN(formData.id) || Number(formData.id) <= 0) {
      nextErrors.id = 'Product ID must be a positive number';
    }

    if (!formData.name || !formData.name.trim()) {
      nextErrors.name = 'Product name cannot be empty';
    }

    if (formData.quantity === '' || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      nextErrors.quantity = 'Quantity cannot be negative';
    }

    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      nextErrors.price = 'Price cannot be negative';
    }

    if (formData.weight === '' || isNaN(formData.weight) || Number(formData.weight) <= 0) {
      nextErrors.weight = 'Weight must be at least 1 kg';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: Number(formData.id),
      name: formData.name.trim(),
      category: (formData.category || 'General').trim(),
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      weight: Number(formData.weight)
    });
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div className="modal-content border">
          <div className="modal-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fs-6 fw-bold text-dark mb-0">
              {isEditing ? `Edit Product #${item.id}` : 'Add New Product'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-3">
              <div className="row g-2">
                {/* Product ID */}
                <div className="col-12 col-sm-6">
                  <label className="form-label text-secondary small fw-semibold mb-1">
                    Product ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="id"
                    className={`form-control form-control-sm ${errors.id ? 'is-invalid' : ''}`}
                    placeholder="e.g. 101"
                    value={formData.id}
                    onChange={handleChange}
                    disabled={isEditing}
                    min="1"
                    required
                  />
                  {errors.id && <div className="invalid-feedback small">{errors.id}</div>}
                </div>

                {/* Category */}
                <div className="col-12 col-sm-6">
                  <label className="form-label text-secondary small fw-semibold mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    className="form-control form-control-sm"
                    placeholder="e.g. Camera, Audio"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>

                {/* Product Name */}
                <div className="col-12">
                  <label className="form-label text-secondary small fw-semibold mb-1">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control form-control-sm ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Sony Alpha A7 IV"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <div className="invalid-feedback small">{errors.name}</div>}
                </div>

                {/* Quantity */}
                <div className="col-12 col-sm-4">
                  <label className="form-label text-secondary small fw-semibold mb-1">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    className={`form-control form-control-sm ${errors.quantity ? 'is-invalid' : ''}`}
                    placeholder="e.g. 10"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  {errors.quantity && <div className="invalid-feedback small">{errors.quantity}</div>}
                </div>

                {/* Price */}
                <div className="col-12 col-sm-4">
                  <label className="form-label text-secondary small fw-semibold mb-1">
                    Price (₹) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    className={`form-control form-control-sm ${errors.price ? 'is-invalid' : ''}`}
                    placeholder="e.g. 8500"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="any"
                    required
                  />
                  {errors.price && <div className="invalid-feedback small">{errors.price}</div>}
                </div>

                {/* Weight */}
                <div className="col-12 col-sm-4">
                  <label className="form-label text-secondary small fw-semibold mb-1">
                    Weight (kg) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    className={`form-control form-control-sm ${errors.weight ? 'is-invalid' : ''}`}
                    placeholder="e.g. 2"
                    value={formData.weight}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                  {errors.weight && <div className="invalid-feedback small">{errors.weight}</div>}
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top py-2 px-3 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-dark">
                {isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
