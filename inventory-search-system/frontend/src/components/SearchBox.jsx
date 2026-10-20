import React, { useState } from 'react';

export default function SearchBox({ onSearch, searchResult, onClearSearch, loading, totalItems = 0 }) {
  const [searchId, setSearchId] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    onSearch(searchId.trim());
  };

  const handleReset = () => {
    setSearchId('');
    if (onClearSearch) onClearSearch();
  };

  const handleQuickSample = (id) => {
    setSearchId(String(id));
    onSearch(String(id));
  };

  const isLarge = totalItems > 50;
  const [timeUnit, setTimeUnit] = useState('µs');

  const formatBenchmarkTime = (entry, unit = timeUnit) => {
    if (!entry) return 'N/A';
    const us = entry.timeTakenUs !== undefined 
      ? Number(entry.timeTakenUs) 
      : (Number(entry.timeTakenMs || 0) * 1000);
    const ns = entry.timeTakenNs !== undefined 
      ? Number(entry.timeTakenNs) 
      : (us * 1000);
    const ms = entry.timeTakenMs !== undefined 
      ? Number(entry.timeTakenMs) 
      : (us / 1000);

    if (unit === 'ns') {
      return `${ns.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ns`;
    }
    if (unit === 'ms') {
      return `${ms.toFixed(5)} ms`;
    }
    // Default: 'µs' (Microseconds)
    return `${us.toFixed(3)} µs`;
  };

  return (
    <div className="card bg-white border mb-3">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
          <h2 className="card-title h6 fw-bold text-dark mb-0">Search by Product ID</h2>
          {isLarge && (
            <span className="badge bg-light text-secondary border fw-normal">
              Dataset: {totalItems.toLocaleString()} items
            </span>
          )}
        </div>

        {/* Search Input Group */}
        <form onSubmit={handleSearchSubmit} className="mb-2">
          <div className="input-group input-group-sm" style={{ maxWidth: '480px' }}>
            <input
              type="number"
              className="form-control"
              placeholder={isLarge ? "Enter Product ID (e.g. 1050, 1150)..." : "Enter Product ID (e.g. 101, 107)..."}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? 'Searching...' : 'Search AVL'}
            </button>
            {searchResult && (
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Quick Sample Buttons */}
        <div className="d-flex align-items-center gap-1 flex-wrap text-secondary small mb-1">
          <span style={{ fontSize: '0.8rem' }}>Quick test:</span>
          <div className="btn-group btn-group-sm">
            {isLarge ? (
              <>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(1050)}>ID 1050</button>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(1120)}>ID 1120</button>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(totalItems > 200 ? 1500 : 1195)}>ID {totalItems > 200 ? 1500 : 1195}</button>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(9999)} title="Test not found">ID 9999 (Miss)</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(101)}>ID 101</button>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(104)}>ID 104 (Root)</button>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(110)}>ID 110</button>
                <button type="button" className="btn btn-outline-secondary py-0 px-2" onClick={() => handleQuickSample(999)} title="Test not found">ID 999 (Miss)</button>
              </>
            )}
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="border rounded p-3 bg-white mt-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary text-white fw-semibold">
                  {searchResult.found ? 'Item Found' : 'Item Not Found'}
                </span>
                <span className="text-secondary small">
                  Target ID: <strong className="text-dark">{searchResult.id}</strong>
                </span>
              </div>
              {searchResult.totalItemsInSystem && (
                <span className="text-secondary small">
                  Total items: <strong className="text-dark">{searchResult.totalItemsInSystem.toLocaleString()}</strong>
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="d-flex gap-3 flex-wrap small text-secondary my-2">
              <div>
                AVL Comparisons:{' '}
                <strong className="text-dark font-monospace">{searchResult.avl?.comparisons ?? 0}</strong>{' '}
                <span className="text-secondary">(O(log n))</span>
              </div>
              {searchResult.linearSearch && (
                <div>
                  Linear Comparisons:{' '}
                  <strong className="text-dark font-monospace">{searchResult.linearSearch.comparisons.toLocaleString()}</strong>{' '}
                  <span className="text-secondary">(O(n))</span>
                </div>
              )}
              <div>
                Hash Map Lookup:{' '}
                <strong className="text-dark font-monospace">{searchResult.hashMap?.lookupOperations ?? 1} op</strong>{' '}
                <span className="text-secondary">(O(1))</span>
              </div>
            </div>

            {/* Timers */}
            <div className="d-flex align-items-center gap-2 flex-wrap pt-2 border-top small text-secondary">
              <span className="fw-semibold">Hardware Timers:</span>

              {/* Unit Switcher */}
              <div className="btn-group btn-group-sm me-1" role="group" aria-label="Timer unit">
                <button
                  type="button"
                  className={`btn py-0 px-2 btn-sm ${timeUnit === 'µs' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setTimeUnit('µs')}
                  title="Display all timers in Microseconds (µs)"
                >
                  µs
                </button>
                <button
                  type="button"
                  className={`btn py-0 px-2 btn-sm ${timeUnit === 'ns' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setTimeUnit('ns')}
                  title="Display all timers in Nanoseconds (ns)"
                >
                  ns
                </button>
                <button
                  type="button"
                  className={`btn py-0 px-2 btn-sm ${timeUnit === 'ms' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setTimeUnit('ms')}
                  title="Display all timers in Milliseconds (ms)"
                >
                  ms
                </button>
              </div>

              <span className="badge bg-light text-dark border font-monospace fw-normal" title="AVL Tree search latency">
                AVL: {formatBenchmarkTime(searchResult.avl, timeUnit)}
              </span>
              <span className="badge bg-light text-dark border font-monospace fw-normal" title="Hash Map direct lookup latency">
                Hash Map: {formatBenchmarkTime(searchResult.hashMap, timeUnit)}
              </span>
              {searchResult.linearSearch && (
                <span className="badge bg-light text-dark border font-monospace fw-normal" title="Linear array scan latency">
                  Linear: {formatBenchmarkTime(searchResult.linearSearch, timeUnit)}
                </span>
              )}
              <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '0.72rem' }}>
                All in {timeUnit === 'µs' ? 'Microseconds (µs)' : timeUnit === 'ns' ? 'Nanoseconds (ns)' : 'Milliseconds (ms)'}
              </span>
            </div>

            {/* Path */}
            <div className="small text-secondary mt-2">
              <span className="fw-semibold">AVL Path: </span>
              <code className="text-dark bg-light px-2 py-1 border rounded font-monospace" style={{ fontSize: '0.8rem' }}>
                {searchResult.avl?.path && searchResult.avl.path.length > 0
                  ? (searchResult.avl.path.length > 15 
                      ? searchResult.avl.path.slice(0, 6).join(' → ') + ' → ... → ' + searchResult.avl.path.slice(-4).join(' → ') + ` (${searchResult.avl.path.length} steps)`
                      : searchResult.avl.path.join(' → '))
                  : 'Root (empty tree)'}
              </code>
            </div>

            {/* Found Item Details */}
            {searchResult.found && searchResult.item && (
              <div className="pt-2 mt-2 border-top">
                <div className="row g-2 text-dark small">
                  <div className="col-6 col-sm-4 col-md-2">
                    <span className="text-secondary d-block" style={{ fontSize: '0.75rem' }}>Product</span>
                    <strong className="d-block">{searchResult.item.name}</strong>
                  </div>
                  <div className="col-6 col-sm-4 col-md-2">
                    <span className="text-secondary d-block" style={{ fontSize: '0.75rem' }}>Category</span>
                    <strong className="d-block">{searchResult.item.category}</strong>
                  </div>
                  <div className="col-6 col-sm-4 col-md-2">
                    <span className="text-secondary d-block" style={{ fontSize: '0.75rem' }}>Quantity</span>
                    <strong className="d-block">{searchResult.item.quantity} units</strong>
                  </div>
                  <div className="col-6 col-sm-4 col-md-2">
                    <span className="text-secondary d-block" style={{ fontSize: '0.75rem' }}>Price</span>
                    <strong className="d-block">₹{Number(searchResult.item.price).toLocaleString()}</strong>
                  </div>
                  {searchResult.avl?.nodeHeight !== undefined && searchResult.avl.nodeHeight !== null && (
                    <div className="col-6 col-sm-4 col-md-2">
                      <span className="text-secondary d-block" style={{ fontSize: '0.75rem' }}>Height / BF</span>
                      <strong className="d-block font-monospace">H: {searchResult.avl.nodeHeight} | BF: {searchResult.avl.balanceFactor}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!searchResult.found && (
              <p className="text-secondary small mt-2 mb-0">
                Product ID {searchResult.id} not found in the AVL tree after {searchResult.avl?.comparisons ?? 0} comparisons.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
