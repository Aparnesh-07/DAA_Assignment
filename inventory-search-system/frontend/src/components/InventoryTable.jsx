import React, { useState, useMemo } from 'react';

export default function InventoryTable({
  items = [],
  onEditItem,
  onDeleteItem
}) {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sorted items
  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [items, sortField, sortDirection]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const pageItems = sortedItems.slice(startIndex, startIndex + pageSize);

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <span className="text-muted ms-1 opacity-25">↕</span>;
    }
    return <span className="text-dark ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="app-panel bg-white">
      {/* Top Bar: Title & Rows Per Page */}
      <div className="d-flex justify-content-between align-items-center p-2.5 border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold text-dark small">Products</span>
          <span className="text-secondary small">
            ({items.length.toLocaleString()})
          </span>
        </div>

        <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem' }}>
          <label htmlFor="rows-select" className="text-secondary mb-0">Rows:</label>
          <select
            id="rows-select"
            className="form-select form-select-sm py-0 px-2"
            style={{ width: '65px', height: '26px', fontSize: '0.78rem' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <div className="fw-medium text-dark small">No products match your search</div>
          <p className="text-secondary small mb-0 mt-1">
            Try adjusting your query or resetting filters.
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive" style={{ maxHeight: '560px', overflowY: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="sticky-top bg-light">
                <tr>
                  <th
                    style={{ width: '70px', cursor: 'pointer' }}
                    onClick={() => handleSort('id')}
                    title="Sort by ID"
                  >
                    ID {renderSortIndicator('id')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')} title="Sort by Product Name">
                    Product Name {renderSortIndicator('name')}
                  </th>
                  <th style={{ cursor: 'pointer', width: '130px' }} onClick={() => handleSort('category')} title="Sort by Category">
                    Category {renderSortIndicator('category')}
                  </th>
                  <th
                    style={{ cursor: 'pointer', width: '90px' }}
                    className="text-end"
                    onClick={() => handleSort('quantity')}
                    title="Sort by Quantity"
                  >
                    Stock {renderSortIndicator('quantity')}
                  </th>
                  <th
                    style={{ cursor: 'pointer', width: '120px' }}
                    className="text-end"
                    onClick={() => handleSort('price')}
                    title="Sort by Price"
                  >
                    Price (₹) {renderSortIndicator('price')}
                  </th>
                  <th
                    style={{ cursor: 'pointer', width: '90px' }}
                    className="text-end"
                    onClick={() => handleSort('weight')}
                    title="Sort by Weight"
                  >
                    Weight {renderSortIndicator('weight')}
                  </th>
                  <th className="text-end" style={{ width: '110px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="font-mono text-secondary small">#{item.id}</span>
                    </td>
                    <td>
                      <span className="fw-medium text-dark">{item.name}</span>
                    </td>
                    <td>
                      <span className="text-secondary small">{item.category || 'General'}</span>
                    </td>
                    <td className="text-end font-mono">
                      {item.quantity}
                    </td>
                    <td className="text-end font-mono">
                      ₹{item.price.toLocaleString()}
                    </td>
                    <td className="text-end font-mono">
                      {item.weight || 1} kg
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-secondary py-0.5 px-1.5"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => onEditItem(item)}
                          title="Edit product"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger py-0.5 px-1.5"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => onDeleteItem(item)}
                          title="Delete product"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clean Pagination Bar */}
          <div className="d-flex justify-content-between align-items-center p-2 border-top text-secondary small">
            <div>
              Showing {startIndex + 1}&ndash;{Math.min(startIndex + pageSize, sortedItems.length)} of {sortedItems.length}
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Prev
              </button>
              <span className="mx-1 font-mono" style={{ fontSize: '0.75rem' }}>
                {validPage} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
