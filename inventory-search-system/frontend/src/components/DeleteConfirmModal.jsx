import React from 'react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, item }) {
  if (!isOpen || !item) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content border">
          <div className="modal-header bg-white border-bottom py-2 px-3">
            <h5 className="modal-title fs-6 fw-bold text-danger mb-0">Confirm Delete</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-3">
            <p className="text-secondary small mb-2">
              Are you sure you want to delete this product? This will remove it from the AVL Tree and Hash Map index.
            </p>
            <div className="bg-light p-2 rounded border small">
              <div className="fw-semibold text-dark">{item.name}</div>
              <div className="text-secondary font-mono" style={{ fontSize: '0.75rem' }}>
                ID: {item.id} &bull; Category: {item.category} &bull; Qty: {item.quantity}
              </div>
            </div>
          </div>
          <div className="modal-footer bg-light border-top py-2 px-3 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => {
                onConfirm(item.id);
                onClose();
              }}
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
