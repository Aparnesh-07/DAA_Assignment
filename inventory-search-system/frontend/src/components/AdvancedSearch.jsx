import React, { useState, useMemo } from 'react';

export default function AdvancedSearch({
  categories = [],
  onFilterChange,
  totalItems = 0,
  filteredCount = 0
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  // Detailed filters
  const [filters, setFilters] = useState({
    minId: '',
    maxId: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: '',
    minWeight: '',
    maxWeight: ''
  });

  const [validationError, setValidationError] = useState('');

  // Active filter count (excluding basic text search)
  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minId !== '' || filters.maxId !== '') count++;
    if (filters.category !== '') count++;
    if (filters.minPrice !== '' || filters.maxPrice !== '') count++;
    if (filters.minQuantity !== '' || filters.maxQuantity !== '') count++;
    if (filters.minWeight !== '' || filters.maxWeight !== '') count++;
    return count;
  }, [filters]);

  const handleQuickChange = (e) => {
    const val = e.target.value;
    setQuickQuery(val);
    emitChange(val, filters);
  };

  const handleFilterChange = (field, value) => {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    validateAndEmit(quickQuery, nextFilters);
  };

  const validateAndEmit = (query, currentFilters) => {
    if (currentFilters.minId !== '' && currentFilters.maxId !== '' && Number(currentFilters.minId) > Number(currentFilters.maxId)) {
      setValidationError('Min ID cannot exceed Max ID.');
      return;
    }
    if (currentFilters.minPrice !== '' && currentFilters.maxPrice !== '' && Number(currentFilters.minPrice) > Number(currentFilters.maxPrice)) {
      setValidationError('Min Price cannot exceed Max Price.');
      return;
    }
    if (currentFilters.minQuantity !== '' && currentFilters.maxQuantity !== '' && Number(currentFilters.minQuantity) > Number(currentFilters.maxQuantity)) {
      setValidationError('Min Quantity cannot exceed Max Quantity.');
      return;
    }
    if (currentFilters.minWeight !== '' && currentFilters.maxWeight !== '' && Number(currentFilters.minWeight) > Number(currentFilters.maxWeight)) {
      setValidationError('Min Weight cannot exceed Max Weight.');
      return;
    }

    setValidationError('');
    emitChange(query, currentFilters);
  };

  const emitChange = (query, currentFilters) => {
    onFilterChange({
      quickQuery: query.trim(),
      minId: currentFilters.minId !== '' ? Number(currentFilters.minId) : null,
      maxId: currentFilters.maxId !== '' ? Number(currentFilters.maxId) : null,
      category: currentFilters.category,
      minPrice: currentFilters.minPrice !== '' ? Number(currentFilters.minPrice) : null,
      maxPrice: currentFilters.maxPrice !== '' ? Number(currentFilters.maxPrice) : null,
      minQuantity: currentFilters.minQuantity !== '' ? Number(currentFilters.minQuantity) : null,
      maxQuantity: currentFilters.maxQuantity !== '' ? Number(currentFilters.maxQuantity) : null,
      minWeight: currentFilters.minWeight !== '' ? Number(currentFilters.minWeight) : null,
      maxWeight: currentFilters.maxWeight !== '' ? Number(currentFilters.maxWeight) : null
    });
  };

  const handleClearAll = () => {
    setQuickQuery('');
    const cleared = {
      minId: '',
      maxId: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minQuantity: '',
      maxQuantity: '',
      minWeight: '',
      maxWeight: ''
    };
    setFilters(cleared);
    setValidationError('');
    emitChange('', cleared);
  };

  return (
    <div className="app-panel bg-white mb-3">
      {/* Search & Filter Toolbar */}
      <div className="d-flex align-items-center justify-content-between p-2.5 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '520px' }}>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Search products by name or exact ID..."
              value={quickQuery}
              onChange={handleQuickChange}
            />
            {quickQuery && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setQuickQuery('');
                  emitChange('', filters);
                }}
                title="Clear search text"
              >
                &times;
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn btn-sm text-nowrap d-flex align-items-center gap-1.5 ${
              isPanelOpen || activeAdvancedFilterCount > 0 ? 'btn-dark' : 'btn-outline-secondary'
            }`}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            <span>Filters</span>
            {activeAdvancedFilterCount > 0 && (
              <span className="badge bg-light text-dark px-1 font-mono" style={{ fontSize: '0.68rem' }}>
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>

          {(quickQuery || activeAdvancedFilterCount > 0) && (
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary text-decoration-none px-1"
              onClick={handleClearAll}
              style={{ fontSize: '0.78rem' }}
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-secondary small">
          Showing <strong className="text-dark font-mono">{filteredCount.toLocaleString()}</strong> of{' '}
          <strong className="text-dark font-mono">{totalItems.toLocaleString()}</strong> products
        </div>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="alert alert-danger py-1.5 px-3 small mx-2.5 mb-2.5 d-flex justify-content-between align-items-center">
          <span>{validationError}</span>
          <button type="button" className="btn-close py-1" onClick={() => setValidationError('')}></button>
        </div>
      )}

      {/* Expandable Advanced Filter Panel */}
      {isPanelOpen && (
        <div className="p-3 border-top bg-light">
          <div className="row g-2">
            {/* ID Range (AVL Tree range query) */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label text-secondary small fw-medium mb-1">ID Range</label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min ID"
                  value={filters.minId}
                  onChange={(e) => handleFilterChange('minId', e.target.value)}
                />
                <span className="input-group-text bg-white text-secondary py-0">&ndash;</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max ID"
                  value={filters.maxId}
                  onChange={(e) => handleFilterChange('maxId', e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label text-secondary small fw-medium mb-1">Category</label>
              <select
                className="form-select form-select-sm"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label text-secondary small fw-medium mb-1">Price (₹)</label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span className="input-group-text bg-white text-secondary py-0">&ndash;</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Quantity Range */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label text-secondary small fw-medium mb-1">Quantity</label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  min="0"
                  value={filters.minQuantity}
                  onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
                />
                <span className="input-group-text bg-white text-secondary py-0">&ndash;</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  min="0"
                  value={filters.maxQuantity}
                  onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
                />
              </div>
            </div>

            {/* Weight Range */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label text-secondary small fw-medium mb-1">Weight (kg)</label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  min="0"
                  value={filters.minWeight}
                  onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                />
                <span className="input-group-text bg-white text-secondary py-0">&ndash;</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  min="0"
                  value={filters.maxWeight}
                  onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
