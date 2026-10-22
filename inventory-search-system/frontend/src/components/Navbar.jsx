import React from 'react';

export default function Navbar({
  activePage,
  setActivePage,
  onLoadDataset,
  totalItems = 0,
  loadingDataset = false
}) {
  const currentDatasetValue = totalItems === 10 || totalItems === 200 || totalItems === 1500
    ? totalItems
    : (totalItems > 500 ? 1500 : (totalItems > 50 ? 200 : 10));

  return (
    <header className="app-header">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          {/* Flat Navigation Tabs */}
          <nav className="app-nav-tabs">
            <button
              type="button"
              className={`app-nav-tab ${activePage === 'inventory' ? 'active' : ''}`}
              onClick={() => setActivePage('inventory')}
            >
              Inventory
            </button>
            <button
              type="button"
              className={`app-nav-tab ${activePage === 'truck-loading' ? 'active' : ''}`}
              onClick={() => setActivePage('truck-loading')}
            >
              Truck Loading
            </button>
            <button
              type="button"
              className={`app-nav-tab ${activePage === 'visualization' ? 'active' : ''}`}
              onClick={() => setActivePage('visualization')}
            >
              Visualizations
            </button>
          </nav>

          {/* Top Right: Dataset Dropdown (Status indicator removed) */}
          <div className="d-flex align-items-center gap-1.5 py-1">
            <label htmlFor="dataset-dropdown" className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
              Dataset:
            </label>
            <select
              id="dataset-dropdown"
              className="form-select form-select-sm py-0 px-2"
              style={{ width: '110px', height: '28px', fontSize: '0.78rem' }}
              value={currentDatasetValue}
              onChange={(e) => onLoadDataset(Number(e.target.value))}
              disabled={loadingDataset}
            >
              <option value={10}>10 items</option>
              <option value={200}>200 items</option>
              <option value={1500}>1,500 items</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
