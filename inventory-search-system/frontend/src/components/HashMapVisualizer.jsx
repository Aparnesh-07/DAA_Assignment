import React, { useState } from 'react';

export default function HashMapVisualizer({
  mapEntries = [],
  allMapEntries = [],
  highlightedId,
  totalItems = 0,
  isLargeDataset = false
}) {
  const [filterTerm, setFilterTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const entriesToDisplay = showAll ? (allMapEntries.length > 0 ? allMapEntries : mapEntries) : mapEntries;
  const filteredEntries = filterTerm.trim()
    ? entriesToDisplay.filter(e => 
        String(e.key).includes(filterTerm.trim()) || 
        String(e.value).toLowerCase().includes(filterTerm.toLowerCase())
      )
    : entriesToDisplay;

  const actualTotal = totalItems || (allMapEntries.length || mapEntries.length);

  return (
    <div className="app-panel bg-white mb-3">
      <div className="d-flex justify-content-between align-items-center p-2.5 border-bottom flex-wrap gap-2">
        <div>
          <span className="fw-semibold text-dark small">Hash Map</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">
            Buckets: <strong className="text-dark font-mono">{actualTotal.toLocaleString()}</strong>
          </span>

          {actualTotal > 50 && (
            <button
              type="button"
              className={`btn btn-xs ${showAll ? 'btn-dark' : 'btn-outline-secondary'} py-0.5 px-2`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setShowAll(prev => !prev)}
              title="Toggle preview of all Hash Map entries"
            >
              {showAll ? `Showing (${filteredEntries.length})` : `Preview All (${actualTotal.toLocaleString()})`}
            </button>
          )}
        </div>
      </div>

      <div className="p-3">

        {/* Filter Toolbar */}
        {showAll && (
          <div className="p-2 border rounded bg-light mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <span className="input-group-text bg-white border text-secondary small">Filter:</span>
              <input
                type="text"
                placeholder="Key or name..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="form-control bg-white border"
              />
              {filterTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFilterTerm('')}
                >
                  Clear
                </button>
              )}
            </div>

            <span className="badge bg-white text-secondary border font-monospace fw-normal">
              Direct Access: ~0.002 ms
            </span>
          </div>
        )}

        {/* Entries Container */}
        <div className="border rounded p-2 bg-light" style={{ maxHeight: showAll ? '420px' : 'none', overflowY: showAll ? 'auto' : 'visible' }}>
          <div className="d-flex justify-content-between align-items-center mb-2 px-1 text-secondary small">
            <span className="fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              HASH MAP ENTRIES (KEY &rarr; VALUE)
            </span>
            <span style={{ fontSize: '0.75rem' }}>
              Displaying {filteredEntries.length} of {actualTotal.toLocaleString()} entries
            </span>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-secondary small text-center my-3">No hash map entries matched the filter.</p>
          ) : (
            <div className="hash-map-grid">
              {filteredEntries.map((entry) => {
                const isHighlighted = highlightedId && Number(highlightedId) === Number(entry.key);
                return (
                  <div
                    key={entry.key}
                    className="hash-map-entry"
                    style={{
                      borderColor: isHighlighted ? '#212529' : '#dee2e6',
                      backgroundColor: isHighlighted ? '#f8f9fa' : '#ffffff',
                      boxShadow: isHighlighted ? '0 0 0 1px #212529' : 'none'
                    }}
                  >
                    <span className="hash-key">{entry.key}</span>
                    <span className="hash-arrow">&rarr;</span>
                    <span className="hash-value text-secondary" title={entry.value}>
                      {entry.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
