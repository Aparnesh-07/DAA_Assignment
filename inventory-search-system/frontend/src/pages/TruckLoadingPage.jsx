import React, { useState, useMemo, useEffect } from 'react';
import { solveKnapsack } from '../knapsack';

export default function TruckLoadingPage({ items = [], isBackendConnected = false }) {
  const [capacity, setCapacity] = useState(15);
  const [capacityInput, setCapacityInput] = useState('15');
  const [candidateFilter, setCandidateFilter] = useState('');
  const [poolLimit, setPoolLimit] = useState(25);
  // Constraints map: { [itemId]: 'mandatory' | 'optional' | 'excluded' }
  const [constraints, setConstraints] = useState({});
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [showManifest, setShowManifest] = useState(false);
  const [showDpTable, setShowDpTable] = useState(false);

  // Normalize candidate pool based on poolLimit
  const candidatePool = useMemo(() => {
    let pool = items;
    if (poolLimit !== 'all') {
      const limit = Number(poolLimit) || 25;
      pool = items.slice(0, limit);
    }
    return pool.map(it => ({
      ...it,
      weight: Math.max(1, Math.floor(Number(it.weight) || (it.category === 'Display' ? 6 : (it.id % 4) + 1))),
      price: Math.max(0, Number(it.price) || 0)
    }));
  }, [items, poolLimit]);

  // Filter candidates by text or ID
  const visibleCandidates = useMemo(() => {
    if (!candidateFilter.trim()) return candidatePool;
    const q = candidateFilter.toLowerCase();
    return candidatePool.filter(it =>
      (it.name && it.name.toLowerCase().includes(q)) ||
      String(it.id).includes(q)
    );
  }, [candidatePool, candidateFilter]);

  // Optimization execution
  const runOptimization = (capVal = capacity) => {
    const validCap = Math.max(1, Number(capVal) || 1);
    const result = solveKnapsack(candidatePool, validCap, constraints);
    setOptimizationResult(result);
  };

  // Re-run optimization on constraint or pool change
  useEffect(() => {
    runOptimization(capacity);
  }, [candidatePool, capacity, constraints]);

  const handleCapacityChange = (e) => {
    const raw = e.target.value;
    setCapacityInput(raw);
    const num = Number(raw);
    if (!isNaN(num) && num > 0) {
      setCapacity(num);
    }
  };

  const handleCapacityBlur = () => {
    const num = Math.max(1, Math.min(1000, Number(capacityInput) || 15));
    setCapacity(num);
    setCapacityInput(String(num));
  };

  const handleConstraintChange = (id, state) => {
    setConstraints(prev => {
      if (state === 'optional') {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: state };
    });
  };

  const handleResetConstraints = () => {
    setConstraints({});
  };

  const getItemState = (id) => {
    return constraints[id] || 'optional';
  };

  const weightPercent = optimizationResult && optimizationResult.isFeasible && capacity > 0
    ? Math.min(100, Math.round((optimizationResult.totalWeight / capacity) * 100))
    : 0;

  return (
    <div className="pb-4">
      {/* A. Page Toolbar: Title, Capacity Input, Optimize Button, Reset Action */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2 pb-2 border-bottom">
        <h1 className="h6 fw-bold text-dark mb-0">Truck Loading</h1>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-1.5">
            <label htmlFor="capacity-input" className="text-secondary small mb-0 fw-medium">
              Capacity:
            </label>
            <div className="input-group input-group-sm" style={{ width: '105px' }}>
              <input
                id="capacity-input"
                type="number"
                className="form-control form-control-sm text-end font-mono"
                min="1"
                max="1000"
                value={capacityInput}
                onChange={handleCapacityChange}
                onBlur={handleCapacityBlur}
                aria-label="Truck weight capacity in kilograms"
              />
              <span className="input-group-text bg-light text-secondary small py-0 px-1.5">kg</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-dark"
            onClick={() => runOptimization(capacity)}
          >
            Optimize Load
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleResetConstraints}
            title="Reset all item requirements to Optional"
          >
            Reset Constraints
          </button>
        </div>
      </div>

      {/* Validation Message: Infeasible State */}
      {optimizationResult && !optimizationResult.isFeasible && (
        <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center justify-content-between" role="alert">
          <div>
            <strong>Infeasible cargo:</strong> Mandatory items require{' '}
            <strong>{optimizationResult.mandatoryWeight} kg</strong>, which exceeds the truck capacity of{' '}
            <strong>{capacity} kg</strong>.
          </div>
          <button
            type="button"
            className="btn btn-xs btn-outline-danger py-0 px-2"
            style={{ fontSize: '0.75rem' }}
            onClick={handleResetConstraints}
          >
            Clear Constraints
          </button>
        </div>
      )}

      {/* B. Result Summary: Single compact horizontal row */}
      {optimizationResult && optimizationResult.isFeasible && (
        <div className="bg-white border rounded p-2.5 mb-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 small">
            <div>
              <span className="text-secondary">Loaded items: </span>
              <strong className="text-dark font-mono">{optimizationResult.selectedItems.length}</strong>
              <span className="text-muted ms-1">
                ({optimizationResult.mandatoryItems.length} mandatory, {optimizationResult.selectedOptionalItems.length} optimal)
              </span>
            </div>

            <div>
              <span className="text-secondary">Cargo weight: </span>
              <strong className="text-dark font-mono">{optimizationResult.totalWeight}</strong>
              <span className="text-secondary"> / {capacity} kg</span>
            </div>

            <div>
              <span className="text-secondary">Commercial value: </span>
              <strong className="text-dark font-mono">₹{optimizationResult.maxValue.toLocaleString()}</strong>
            </div>

            <div>
              <span className="text-secondary">Remaining capacity: </span>
              <strong className="text-dark font-mono">{optimizationResult.remainingCapacity} kg</strong>
            </div>
          </div>

          {/* Secondary subtle utilization bar */}
          <div className="progress mt-2" style={{ height: '3px', backgroundColor: '#f1f5f9' }}>
            <div
              className={`progress-bar ${weightPercent >= 95 ? 'bg-success' : 'bg-primary'}`}
              role="progressbar"
              style={{ width: `${weightPercent}%` }}
              aria-valuenow={weightPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      )}

      {/* C. Candidate Inventory Table (Primary Workspace Focus) */}
      <div className="app-panel mb-3">
        {/* Table Filter Toolbar */}
        <div className="d-flex align-items-center justify-content-between p-2.5 border-bottom flex-wrap gap-2 bg-white">
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '220px' }}
              placeholder="Filter candidates..."
              value={candidateFilter}
              onChange={(e) => setCandidateFilter(e.target.value)}
            />
            {candidateFilter && (
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-0 px-2"
                onClick={() => setCandidateFilter('')}
                style={{ fontSize: '0.75rem' }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <label htmlFor="pool-limit-select" className="text-secondary small mb-0">
              Candidate pool:
            </label>
            <select
              id="pool-limit-select"
              className="form-select form-select-sm"
              style={{ width: '110px' }}
              value={poolLimit}
              onChange={(e) => setPoolLimit(e.target.value)}
            >
              <option value={12}>12 items</option>
              <option value={25}>25 items</option>
              <option value={50}>50 items</option>
              <option value={100}>100 items</option>
              <option value="all">All items</option>
            </select>
            <span className="text-secondary small">
              ({visibleCandidates.length} shown)
            </span>
          </div>
        </div>

        {/* Compact Table */}
        <div className="table-responsive" style={{ maxHeight: '540px', overflowY: 'auto' }}>
          <table className="table table-hover align-middle mb-0">
            <thead className="sticky-top bg-light">
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Product</th>
                <th style={{ width: '100px' }} className="text-end">Weight</th>
                <th style={{ width: '130px' }} className="text-end">Value (₹)</th>
                <th style={{ width: '140px' }} className="text-center">Requirement</th>
              </tr>
            </thead>
            <tbody>
              {visibleCandidates.map((item) => {
                const state = getItemState(item.id);
                const isSelected = optimizationResult?.selectedIds?.includes(item.id);

                return (
                  <tr key={item.id} className={isSelected ? 'table-selected-row' : ''}>
                    <td>
                      <span className="font-mono text-secondary small">#{item.id}</span>
                    </td>
                    <td>
                      <span className={`fw-medium ${isSelected ? 'text-dark' : 'text-secondary'}`}>
                        {item.name}
                      </span>
                      {isSelected && (
                        <span className="text-success ms-2" title="Selected on truck" style={{ fontSize: '0.75rem' }}>
                          Loaded
                        </span>
                      )}
                    </td>
                    <td className="text-end font-mono">
                      {item.weight} kg
                    </td>
                    <td className="text-end font-mono">
                      ₹{item.price.toLocaleString()}
                    </td>
                    <td className="text-center">
                      {/* D. Constraint Dropdown Control */}
                      <select
                        className={`form-select form-select-sm constraint-select state-${state}`}
                        value={state}
                        onChange={(e) => handleConstraintChange(item.id, e.target.value)}
                        aria-label={`Constraint state for item ${item.name}`}
                      >
                        <option value="optional">Optional</option>
                        <option value="mandatory">Mandatory</option>
                        <option value="excluded">Excluded</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* E. Cargo Manifest: Compact Result Line + Expandable Details */}
      {optimizationResult && optimizationResult.isFeasible && (
        <div className="app-panel p-2.5 mb-3 bg-white">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="text-secondary small">
              <span className="fw-semibold text-dark">Optimized cargo</span> &middot;{' '}
              <span className="font-mono">{optimizationResult.selectedItems.length} items</span> &middot;{' '}
              <span className="font-mono">{optimizationResult.totalWeight} kg</span> &middot;{' '}
              <span className="font-mono">₹{optimizationResult.maxValue.toLocaleString()}</span>
            </div>

            <button
              type="button"
              className="btn btn-xs btn-outline-secondary py-0.5 px-2"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setShowManifest(!showManifest)}
            >
              {showManifest ? 'Hide manifest' : 'View manifest'}
            </button>
          </div>

          {showManifest && (
            <div className="mt-2.5 pt-2 border-top">
              <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }}>ID</th>
                      <th>Loaded Product</th>
                      <th style={{ width: '90px' }} className="text-end">Weight</th>
                      <th style={{ width: '120px' }} className="text-end">Value (₹)</th>
                      <th style={{ width: '100px' }} className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizationResult.selectedItems.map((it) => {
                      const isMandatory = getItemState(it.id) === 'mandatory';
                      return (
                        <tr key={it.id}>
                          <td className="font-mono text-secondary">#{it.id}</td>
                          <td className="fw-medium text-dark">{it.name}</td>
                          <td className="text-end font-mono">{it.weight} kg</td>
                          <td className="text-end font-mono">₹{it.price.toLocaleString()}</td>
                          <td className="text-center">
                            {isMandatory ? (
                              <span className="text-success small fw-medium">Mandatory</span>
                            ) : (
                              <span className="text-primary small fw-medium">Optimal</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* F. Technical Optimization Details (DP Matrix - Collapsed by default) */}
      <div className="app-panel bg-white">
        <div
          className="d-flex align-items-center justify-content-between p-2.5 cursor-pointer"
          onClick={() => setShowDpTable(!showDpTable)}
          style={{ cursor: 'pointer' }}
        >
          <span className="text-secondary small fw-medium">
            Dynamic Programming Matrix
          </span>
          <button
            type="button"
            className="btn btn-xs btn-outline-secondary py-0.5 px-2"
            style={{ fontSize: '0.75rem' }}
          >
            {showDpTable ? 'Hide details' : 'View optimization details'}
          </button>
        </div>

        {showDpTable && optimizationResult?.isFeasible && (
          <div className="p-3 border-top">
            <div className="text-secondary small mb-2">
              Matrix optimization over <strong>{optimizationResult.optionalItems.length} optional candidates</strong> and{' '}
              <strong>{optimizationResult.remainingCapacity} kg remaining capacity</strong> (after allocating mandatory cargo).
            </div>

            {optimizationResult.remainingCapacity <= 0 || optimizationResult.optionalItems.length === 0 ? (
              <div className="text-secondary small p-3 bg-light rounded text-center">
                Remaining capacity is 0 kg or no optional items available.
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '360px' }}>
                <table className="table table-bordered table-sm text-center mb-0" style={{ fontSize: '0.72rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '120px' }}>Item</th>
                      <th style={{ width: '50px' }}>Wt</th>
                      <th style={{ width: '70px' }}>Val</th>
                      {Array.from({ length: Math.min(30, optimizationResult.remainingCapacity + 1) }).map((_, w) => (
                        <th key={w} style={{ width: '42px' }} className="font-mono">
                          {w}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-secondary font-mono text-start">Base (0)</td>
                      <td>-</td>
                      <td>-</td>
                      {Array.from({ length: Math.min(30, optimizationResult.remainingCapacity + 1) }).map((_, w) => (
                        <td key={w} className="text-muted font-mono">0</td>
                      ))}
                    </tr>
                    {optimizationResult.optionalItems.slice(0, 15).map((it, idx) => {
                      const rowIdx = idx + 1;
                      const isSelectedOpt = optimizationResult.selectedOptionalItems.some(o => o.id === it.id);

                      return (
                        <tr key={it.id} className={isSelectedOpt ? 'table-selected-row' : ''}>
                          <td className="text-start font-mono text-truncate" style={{ maxWidth: '120px' }}>
                            {it.name}
                          </td>
                          <td className="font-mono">{it.weight}</td>
                          <td className="font-mono">₹{it.price}</td>
                          {Array.from({ length: Math.min(30, optimizationResult.remainingCapacity + 1) }).map((_, w) => {
                            const val = optimizationResult.dpTable[rowIdx] ? optimizationResult.dpTable[rowIdx][w] : 0;
                            const isOptimalCell = w === optimizationResult.remainingCapacity && rowIdx === optimizationResult.optionalItems.length;
                            return (
                              <td
                                key={w}
                                className={`font-mono ${isOptimalCell ? 'fw-bold text-dark' : 'text-secondary'}`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
