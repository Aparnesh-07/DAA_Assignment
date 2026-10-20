import React from 'react';

export default function ComplexitySection() {
  return (
    <div className="mt-3">
      {/* 1. Comparison Table */}
      <div className="card bg-white border mb-3">
        <div className="card-header bg-white border-bottom p-3">
          <h2 className="card-title h6 fw-bold text-dark mb-0">Data Structure Comparison</h2>
          <small className="text-secondary">
            Side-by-side asymptotic time and space complexity comparison
          </small>
        </div>

        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-secondary small fw-semibold px-3">Operation</th>
                <th className="text-secondary small fw-semibold">AVL Tree</th>
                <th className="text-secondary small fw-semibold">Hash Map</th>
                <th className="text-secondary small fw-semibold px-3">Key Observation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3"><strong>Search</strong></td>
                <td><code className="text-dark bg-light px-1 border rounded">O(log n)</code> guaranteed</td>
                <td><code className="text-dark bg-light px-1 border rounded">O(1)</code> average</td>
                <td className="text-secondary px-3">Hash Map provides faster point lookup; AVL guarantees worst-case bound</td>
              </tr>
              <tr>
                <td className="px-3"><strong>Insert</strong></td>
                <td><code className="text-dark bg-light px-1 border rounded">O(log n)</code> guaranteed</td>
                <td><code className="text-dark bg-light px-1 border rounded">O(1)</code> average</td>
                <td className="text-secondary px-3">AVL maintains balance via rotations (LL, RR, LR, RL)</td>
              </tr>
              <tr>
                <td className="px-3"><strong>Delete</strong></td>
                <td><code className="text-dark bg-light px-1 border rounded">O(log n)</code> guaranteed</td>
                <td><code className="text-dark bg-light px-1 border rounded">O(1)</code> average</td>
                <td className="text-secondary px-3">AVL may require O(log n) rebalancing rotations up to root</td>
              </tr>
              <tr>
                <td className="px-3"><strong>Ordered Traversal</strong></td>
                <td><code className="text-dark bg-light px-1 border rounded">O(n)</code> (In-Order)</td>
                <td className="text-secondary">Not naturally ordered</td>
                <td className="text-secondary px-3">AVL outputs sorted inventory items by Product ID</td>
              </tr>
              <tr>
                <td className="px-3"><strong>Space Complexity</strong></td>
                <td><code className="text-dark bg-light px-1 border rounded">O(n)</code></td>
                <td><code className="text-dark bg-light px-1 border rounded">O(n)</code></td>
                <td className="text-secondary px-3">AVL stores node pointers (left/right/height); Hash Map stores buckets</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top p-2 text-secondary small">
          * Note: Hash Map operations are O(1) on average. Under heavy hash collisions or rehashing, Hash Map operations can degrade to O(n). AVL Tree strictly guarantees O(log n) worst-case performance under all circumstances.
        </div>
      </div>

      {/* 2. Complexity Analysis & Architectural Roles */}
      <div className="card bg-white border mb-3">
        <div className="card-header bg-white border-bottom p-3">
          <h2 className="card-title h6 fw-bold text-dark mb-0">Complexity Analysis &amp; Architectural Roles</h2>
          <small className="text-secondary">
            Algorithmic bounds and why both structures are used
          </small>
        </div>

        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="border rounded p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark">AVL Tree (Self-Balancing BST)</strong>
                  <span className="badge bg-light text-secondary border fw-normal">Strictly Balanced</span>
                </div>
                <ul className="list-unstyled small text-secondary mb-2">
                  <li className="mb-1">&bull; Search: <strong className="text-dark font-monospace">O(log n)</strong></li>
                  <li className="mb-1">&bull; Insertion: <strong className="text-dark font-monospace">O(log n)</strong></li>
                  <li className="mb-1">&bull; Deletion: <strong className="text-dark font-monospace">O(log n)</strong></li>
                  <li className="mb-1">&bull; Space: <strong className="text-dark font-monospace">O(n)</strong></li>
                </ul>
                <p className="small text-secondary mb-0 border-top pt-2">
                  <strong>Role:</strong> Ordered storage, sorted range queries, guaranteed logarithmic search and update bounds.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="border rounded p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark">Hash Map (Direct Key Lookup)</strong>
                  <span className="badge bg-light text-secondary border fw-normal">Key Indexing</span>
                </div>
                <ul className="list-unstyled small text-secondary mb-2">
                  <li className="mb-1">&bull; Search: <strong className="text-dark font-monospace">O(1) average</strong></li>
                  <li className="mb-1">&bull; Insertion: <strong className="text-dark font-monospace">O(1) average</strong></li>
                  <li className="mb-1">&bull; Deletion: <strong className="text-dark font-monospace">O(1) average</strong></li>
                  <li className="mb-1">&bull; Space: <strong className="text-dark font-monospace">O(n)</strong></li>
                </ul>
                <p className="small text-secondary mb-0 border-top pt-2">
                  <strong>Role:</strong> Instantaneous point lookup by Product ID (~0.002 ms) without tree traversal overhead.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
