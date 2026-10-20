import React, { useState } from 'react';

export default function BenchmarkLab({ onRunBenchmark, isBackendConnected = false }) {
  const [config, setConfig] = useState({
    datasetSize: 1000,
    repetitions: 500,
    searchType: 'successful',
    targetPosition: 'random',
    customId: ''
  });

  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [unit, setUnit] = useState('us'); // 'us' (Microseconds) or 'ns' (Nanoseconds)

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      const benchmarkData = await onRunBenchmark({
        datasetSize: Number(config.datasetSize),
        repetitions: Number(config.repetitions),
        searchType: config.searchType,
        targetPosition: config.targetPosition,
        customId: config.customId !== '' ? Number(config.customId) : null
      });

      if (benchmarkData && benchmarkData.results) {
        setCurrentResult(benchmarkData);
        setHistory(prev => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            datasetSize: benchmarkData.config.datasetSize,
            searchType: benchmarkData.config.searchType,
            targetPosition: benchmarkData.config.targetPosition,
            targetId: benchmarkData.config.targetId,
            repetitions: benchmarkData.config.repetitions,
            avlMedianUs: benchmarkData.results.avl.medianUs,
            mapMedianUs: benchmarkData.results.hashMap.medianUs,
            linearMedianUs: benchmarkData.results.linearSearch.medianUs,
            fastest: benchmarkData.summary.lowestLatencyStructure,
            environment: benchmarkData.environment
          },
          ...prev
        ].slice(0, 15)); // Keep last 15 runs
      }
    } catch (err) {
      console.error('Benchmark execution failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [
      'Timestamp',
      'Environment',
      'Dataset Size',
      'Search Type',
      'Target Position',
      'Target ID',
      'Repetitions',
      'AVL Median (us)',
      'Map Median (us)',
      'Linear Median (us)',
      'Fastest Structure'
    ];

    const rows = history.map(h => [
      `"${h.time}"`,
      `"${h.environment}"`,
      h.datasetSize,
      h.searchType,
      h.targetPosition,
      h.targetId,
      h.repetitions,
      h.avlMedianUs,
      h.mapMedianUs,
      h.linearMedianUs,
      `"${h.fastest}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `benchmark_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (timeUs, timeNs) => {
    if (timeUs === undefined || timeUs === null) return 'N/A';
    if (unit === 'ns') {
      return `${Number(timeNs || timeUs * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ns`;
    }
    return `${Number(timeUs).toFixed(3)} µs`;
  };

  const maxMedian = currentResult
    ? Math.max(
        currentResult.results.avl.medianUs,
        currentResult.results.hashMap.medianUs,
        currentResult.results.linearSearch.medianUs,
        0.001
      )
    : 1;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2 pb-2 border-bottom">
        <h1 className="h6 fw-bold text-dark mb-0">Benchmarking</h1>

        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">
            Timer: {isBackendConnected ? 'hrtime.bigint' : 'performance.now'}
          </span>
        </div>
      </div>

      {/* 1. Experiment Configuration Panel */}
      <div className="app-panel bg-white p-3 mb-3">
        <div className="row g-2 align-items-end">
          {/* Dataset Size */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label text-secondary small fw-medium mb-1">Dataset Size (N)</label>
            <select
              className="form-select form-select-sm"
              value={config.datasetSize}
              onChange={(e) => handleConfigChange('datasetSize', Number(e.target.value))}
              disabled={loading}
            >
              <option value={100}>100 items</option>
              <option value={500}>500 items</option>
              <option value={1000}>1,000 items</option>
              <option value={5000}>5,000 items</option>
              <option value={10000}>10,000 items</option>
            </select>
          </div>

          {/* Search Type */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label text-secondary small fw-medium mb-1">Search Type</label>
            <select
              className="form-select form-select-sm"
              value={config.searchType}
              onChange={(e) => handleConfigChange('searchType', e.target.value)}
              disabled={loading}
            >
              <option value="successful">Successful (Target Exists)</option>
              <option value="unsuccessful">Unsuccessful (Target Missing)</option>
            </select>
          </div>

          {/* Target Position */}
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label text-secondary small fw-medium mb-1">Target Position</label>
            <select
              className="form-select form-select-sm"
              value={config.targetPosition}
              onChange={(e) => handleConfigChange('targetPosition', e.target.value)}
              disabled={loading || config.searchType === 'unsuccessful'}
            >
              <option value="random">Random Item</option>
              <option value="first">First Item</option>
              <option value="middle">Middle Item</option>
              <option value="last">Last Item</option>
              <option value="custom">Custom ID</option>
            </select>
          </div>

          {/* Repetitions */}
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label text-secondary small fw-medium mb-1">Repetitions</label>
            <select
              className="form-select form-select-sm"
              value={config.repetitions}
              onChange={(e) => handleConfigChange('repetitions', Number(e.target.value))}
              disabled={loading}
            >
              <option value={50}>50 reps</option>
              <option value={100}>100 reps</option>
              <option value={500}>500 reps</option>
              <option value={1000}>1,000 reps</option>
            </select>
          </div>

          {/* Run Action */}
          <div className="col-12 col-sm-12 col-md-2 d-flex justify-content-md-end">
            <button
              type="button"
              className="btn btn-sm btn-dark w-100"
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run Benchmark'}
            </button>
          </div>

          {/* Custom ID input if selected */}
          {config.targetPosition === 'custom' && config.searchType === 'successful' && (
            <div className="col-12 col-sm-6 col-md-3 mt-2">
              <label className="form-label text-secondary small fw-medium mb-1">Custom Product ID</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="e.g. 1045"
                value={config.customId}
                onChange={(e) => handleConfigChange('customId', e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Benchmark Results View */}
      {currentResult && (
        <div className="app-panel bg-white p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom flex-wrap gap-2">
            <div className="text-secondary small">
              Results for <strong className="text-dark font-mono">{currentResult.config.datasetSize.toLocaleString()} items</strong> &middot;{' '}
              <span className="font-mono">{currentResult.config.repetitions} reps</span> &middot; Target ID:{' '}
              <strong className="font-mono text-dark">{currentResult.config.targetId}</strong>
            </div>

            {/* Unit Switcher */}
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 ${unit === 'us' ? 'btn-dark' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.72rem' }}
                onClick={() => setUnit('us')}
              >
                µs
              </button>
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 ${unit === 'ns' ? 'btn-dark' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.72rem' }}
                onClick={() => setUnit('ns')}
              >
                ns
              </button>
            </div>
          </div>

          {/* Single Statistical Results Table */}
          <div className="table-responsive mb-3">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Data Structure</th>
                  <th className="text-end">Median</th>
                  <th className="text-end">Mean</th>
                  <th className="text-end">Min</th>
                  <th className="text-end">Max</th>
                  <th className="text-end">Algorithmic Work</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-medium text-dark">Hash Map</td>
                  <td className="text-end font-mono fw-semibold text-dark">
                    {formatTime(currentResult.results.hashMap.medianUs, currentResult.results.hashMap.medianNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.hashMap.meanUs, currentResult.results.hashMap.meanNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.hashMap.minUs, currentResult.results.hashMap.minNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.hashMap.maxUs, currentResult.results.hashMap.maxNs)}
                  </td>
                  <td className="text-end font-mono">1 lookup</td>
                </tr>

                <tr>
                  <td className="fw-medium text-dark">AVL Tree</td>
                  <td className="text-end font-mono fw-semibold text-dark">
                    {formatTime(currentResult.results.avl.medianUs, currentResult.results.avl.medianNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.avl.meanUs, currentResult.results.avl.meanNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.avl.minUs, currentResult.results.avl.minNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.avl.maxUs, currentResult.results.avl.maxNs)}
                  </td>
                  <td className="text-end font-mono">{currentResult.results.avl.workValue} comparisons</td>
                </tr>

                <tr>
                  <td className="fw-medium text-dark">Linear Search</td>
                  <td className="text-end font-mono fw-semibold text-dark">
                    {formatTime(currentResult.results.linearSearch.medianUs, currentResult.results.linearSearch.medianNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.linearSearch.meanUs, currentResult.results.linearSearch.meanNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.linearSearch.minUs, currentResult.results.linearSearch.minNs)}
                  </td>
                  <td className="text-end font-mono text-secondary">
                    {formatTime(currentResult.results.linearSearch.maxUs, currentResult.results.linearSearch.maxNs)}
                  </td>
                  <td className="text-end font-mono">{currentResult.results.linearSearch.workValue.toLocaleString()} comparisons</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Meaningful Comparison Chart: Restrained Latency Bars */}
          <div className="p-2.5 bg-light rounded border mb-2">
            <div className="text-secondary small fw-medium mb-2">Median Latency Comparison</div>

            {/* Hash Map Bar */}
            <div className="mb-2">
              <div className="d-flex justify-content-between small text-secondary mb-0.5">
                <span>Hash Map</span>
                <span className="font-mono text-dark">
                  {formatTime(currentResult.results.hashMap.medianUs, currentResult.results.hashMap.medianNs)}
                </span>
              </div>
              <div className="benchmark-bar-track">
                <div
                  className="benchmark-bar-fill bg-success"
                  style={{
                    width: `${Math.max(4, (currentResult.results.hashMap.medianUs / maxMedian) * 100)}%`
                  }}
                >
                  {currentResult.results.hashMap.medianUs} µs
                </div>
              </div>
            </div>

            {/* AVL Tree Bar */}
            <div className="mb-2">
              <div className="d-flex justify-content-between small text-secondary mb-0.5">
                <span>AVL Tree</span>
                <span className="font-mono text-dark">
                  {formatTime(currentResult.results.avl.medianUs, currentResult.results.avl.medianNs)}
                </span>
              </div>
              <div className="benchmark-bar-track">
                <div
                  className="benchmark-bar-fill bg-primary"
                  style={{
                    width: `${Math.max(4, (currentResult.results.avl.medianUs / maxMedian) * 100)}%`
                  }}
                >
                  {currentResult.results.avl.medianUs} µs
                </div>
              </div>
            </div>

            {/* Linear Search Bar */}
            <div>
              <div className="d-flex justify-content-between small text-secondary mb-0.5">
                <span>Linear Search</span>
                <span className="font-mono text-dark">
                  {formatTime(currentResult.results.linearSearch.medianUs, currentResult.results.linearSearch.medianNs)}
                </span>
              </div>
              <div className="benchmark-bar-track">
                <div
                  className="benchmark-bar-fill bg-secondary"
                  style={{
                    width: `${Math.max(4, (currentResult.results.linearSearch.medianUs / maxMedian) * 100)}%`
                  }}
                >
                  {currentResult.results.linearSearch.medianUs} µs
                </div>
              </div>
            </div>
          </div>

          {/* Compact Expandable Theoretical Complexity Section */}
          <details className="mt-2.5 pt-2 border-top text-secondary small">
            <summary className="cursor-pointer fw-medium text-dark" style={{ cursor: 'pointer' }}>
              Theoretical Complexity Reference
            </summary>
            <div className="table-responsive mt-2">
              <table className="table table-sm table-bordered mb-0" style={{ fontSize: '0.72rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Structure</th>
                    <th>Average Search</th>
                    <th>Worst Search</th>
                    <th>Space</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-medium">AVL Tree</td>
                    <td className="font-mono">O(log n)</td>
                    <td className="font-mono">O(log n)</td>
                    <td className="font-mono">O(n)</td>
                  </tr>
                  <tr>
                    <td className="fw-medium">Hash Map</td>
                    <td className="font-mono">O(1)</td>
                    <td className="font-mono">O(n)</td>
                    <td className="font-mono">O(n)</td>
                  </tr>
                  <tr>
                    <td className="fw-medium">Linear Search</td>
                    <td className="font-mono">O(n)</td>
                    <td className="font-mono">O(n)</td>
                    <td className="font-mono">O(n)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      {/* 3. Small Experiment History */}
      <div className="app-panel bg-white p-3">
        <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark small">Experiment History</span>
            <span className="text-secondary small">
              ({history.length})
            </span>
          </div>

          {history.length > 0 && (
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-0.5 px-2"
                style={{ fontSize: '0.72rem' }}
                onClick={handleExportCSV}
              >
                Export CSV
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-0.5 px-2"
                style={{ fontSize: '0.72rem' }}
                onClick={handleClearHistory}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-4 text-secondary small">
            No experiments recorded in this session.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.75rem' }}>
              <thead className="table-light">
                <tr>
                  <th>Time</th>
                  <th>Dataset</th>
                  <th>Type</th>
                  <th>Target ID</th>
                  <th>Reps</th>
                  <th>AVL Median</th>
                  <th>Map Median</th>
                  <th>Linear Median</th>
                  <th>Fastest</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="text-secondary">{h.time}</td>
                    <td className="font-mono">{h.datasetSize.toLocaleString()}</td>
                    <td>{h.searchType}</td>
                    <td className="font-mono">{h.targetId}</td>
                    <td>{h.repetitions}</td>
                    <td className="font-mono">{h.avlMedianUs} µs</td>
                    <td className="font-mono">{h.mapMedianUs} µs</td>
                    <td className="font-mono">{h.linearMedianUs} µs</td>
                    <td>
                      <span className="fw-semibold text-success">{h.fastest}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
