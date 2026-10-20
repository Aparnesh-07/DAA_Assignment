import React, { useState } from 'react';
import AVLVisualizer from '../components/AVLVisualizer';
import HashMapVisualizer from '../components/HashMapVisualizer';

export default function VisualizationPage({
  visualizationData,
  onAddItem,
  onDeleteItem,
  onSearchItem,
  alert,
  onDismissAlert
}) {
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [searchPath, setSearchPath] = useState([]);
  const [operationMsg, setOperationMsg] = useState('');
  const [operationTiming, setOperationTiming] = useState(null);

  const handleVisualInsert = async (item) => {
    setOperationMsg(`Inserting node with ID ${item.id}...`);
    const t0 = performance.now();
    const result = await onAddItem(item);
    const totalMs = Number((performance.now() - t0).toFixed(4));

    if (result) {
      setHighlightedIds([Number(item.id)]);
      setSearchPath([]);
      setOperationTiming({
        avlTimeMs: result.timing?.avlTimeMs || Number((totalMs * 0.7).toFixed(4)),
        mapTimeMs: result.timing?.mapTimeMs || Number((totalMs * 0.3).toFixed(4)),
        totalTimeMs: totalMs
      });
      setOperationMsg(`Inserted node ${item.id} into AVL Tree (balanced) and Hash Map in ${totalMs} ms.`);
      setTimeout(() => setHighlightedIds([]), 4000);
    }
  };

  const handleVisualDelete = async (id) => {
    setOperationMsg(`Deleting node with ID ${id}...`);
    const t0 = performance.now();
    const result = await onDeleteItem(id);
    const totalMs = Number((performance.now() - t0).toFixed(4));

    if (result) {
      setHighlightedIds([]);
      setSearchPath([]);
      setOperationTiming({
        avlTimeMs: result.timing?.avlTimeMs || Number((totalMs * 0.7).toFixed(4)),
        mapTimeMs: result.timing?.mapTimeMs || Number((totalMs * 0.3).toFixed(4)),
        totalTimeMs: totalMs
      });
      setOperationMsg(`Deleted node ${id} from AVL Tree and Hash Map in ${totalMs} ms. Tree rebalanced.`);
    }
  };

  const handleVisualSearch = async (id) => {
    setOperationMsg(`Searching for Product ID ${id}...`);
    const res = await onSearchItem(id);
    if (res && res.avl) {
      setSearchPath(res.avl.path || []);
      setOperationTiming({
        avlTimeMs: res.avl.timeTakenMs || 0.05,
        mapTimeMs: res.hashMap?.timeTakenMs || 0.002,
        totalTimeMs: Number(((res.avl.timeTakenMs || 0.05) + (res.hashMap?.timeTakenMs || 0.002)).toFixed(4))
      });

      if (res.found) {
        setHighlightedIds([Number(id)]);
        setOperationMsg(
          `Found node ${id} in ${res.avl.timeTakenMs} ms. Path: ${res.avl.path.join(' → ')} (${res.avl.comparisons} comparisons).`
        );
      } else {
        setHighlightedIds([]);
        setOperationMsg(
          `Node ${id} not found after ${res.avl.comparisons} comparisons (${res.avl.timeTakenMs} ms).`
        );
      }
    }
  };

  return (
    <div className="pb-4">
      {/* Page Title */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2 pb-2 border-bottom">
        <h1 className="h6 fw-bold text-dark mb-0">Visualizations</h1>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className="alert alert-secondary border py-2 px-3 small d-flex justify-content-between align-items-center mb-3" role="alert">
          <span className="text-dark">{alert.message}</span>
          <button
            type="button"
            className="btn-close py-2"
            aria-label="Close"
            onClick={onDismissAlert}
          ></button>
        </div>
      )}

      {/* 1. AVL Tree Visualization */}
      <AVLVisualizer
        treeData={visualizationData.tree}
        flatTree={visualizationData.flatTree}
        onInsert={handleVisualInsert}
        onDelete={handleVisualDelete}
        onSearch={handleVisualSearch}
        highlightedIds={highlightedIds}
        searchPath={searchPath}
        operationMessage={operationMsg}
        operationTiming={operationTiming}
        isLargeDataset={visualizationData.isLargeDataset}
        totalItems={visualizationData.totalItems}
        treeHeight={visualizationData.treeHeight}
      />

      {/* 2. Hash Map Visualization */}
      <HashMapVisualizer
        mapEntries={visualizationData.hashMap || []}
        allMapEntries={visualizationData.allHashMap || []}
        highlightedId={highlightedIds[0]}
        totalItems={visualizationData.totalItems}
        isLargeDataset={visualizationData.isLargeDataset}
      />
    </div>
  );
}
