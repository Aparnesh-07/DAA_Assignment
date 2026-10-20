import React, { useState, useEffect, useRef } from 'react';

export default function AVLVisualizer({
  treeData,
  flatTree,
  onInsert,
  onDelete,
  onSearch,
  highlightedIds = [],
  searchPath = [],
  operationMessage = '',
  operationTiming = null,
  isLargeDataset = false,
  totalItems = 0,
  treeHeight = 0
}) {
  const [actionId, setActionId] = useState('');
  const [actionName, setActionName] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Default to whole dataset canvas view when large dataset is loaded
  const [viewMode, setViewMode] = useState(isLargeDataset ? 'canvas' : 'structural');
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  useEffect(() => {
    if (isLargeDataset) {
      setViewMode('canvas');
    }
  }, [isLargeDataset]);

  // Helper to layout nodes for structural SVG view
  const calculateNodePositions = (root) => {
    if (!root) return { nodes: [], links: [], width: 600, height: 350 };

    let orderIndex = 0;
    const nodes = [];
    const links = [];
    let maxDepth = 0;

    const traverse = (node, depth) => {
      if (!node) return null;
      if (depth > maxDepth) maxDepth = depth;

      traverse(node.left, depth + 1);

      const currentXIndex = orderIndex++;
      const currentPos = {
        node,
        id: node.id,
        name: node.name,
        category: node.category,
        quantity: node.quantity,
        price: node.price,
        height: node.height,
        balanceFactor: node.balanceFactor,
        hasSubtrees: node.hasSubtrees,
        depth,
        xIndex: currentXIndex
      };
      nodes.push(currentPos);

      traverse(node.right, depth + 1);
      return currentPos;
    };

    traverse(root, 0);

    const horizontalSpacing = isLargeDataset ? 65 : 80;
    const verticalSpacing = 75;
    const startX = 50;
    const startY = 50;

    const totalWidth = Math.max(680, (orderIndex + 1) * horizontalSpacing + 60);
    const totalHeight = Math.max(340, (maxDepth + 1) * verticalSpacing + 80);

    const posMap = new Map();
    nodes.forEach(n => {
      n.x = startX + n.xIndex * horizontalSpacing;
      n.y = startY + n.depth * verticalSpacing;
      posMap.set(n.id, n);
    });

    const linkTraverse = (node) => {
      if (!node) return;
      const parentPos = posMap.get(node.id);

      if (node.left) {
        const leftPos = posMap.get(node.left.id);
        if (parentPos && leftPos) {
          links.push({ from: parentPos, to: leftPos, label: 'L' });
        }
        linkTraverse(node.left);
      }

      if (node.right) {
        const rightPos = posMap.get(node.right.id);
        if (parentPos && rightPos) {
          links.push({ from: parentPos, to: rightPos, label: 'R' });
        }
        linkTraverse(node.right);
      }
    };

    linkTraverse(root);
    return { nodes, links, width: totalWidth, height: totalHeight };
  };

  const { nodes, links, width, height } = calculateNodePositions(treeData);

  // Canvas Rendering (All White & Grey Accent)
  useEffect(() => {
    if (viewMode !== 'canvas' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Background: Pure White
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const flatNodes = flatTree?.nodes || [];
    const flatLinks = flatTree?.links || [];

    if (flatNodes.length === 0) {
      ctx.fillStyle = '#6c757d';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No tree nodes to preview.', width / 2, height / 2);
      ctx.restore();
      return;
    }

    const totalNodesCount = flatNodes.length;
    const maxTreeDepth = Math.max(1, flatTree?.maxDepth || treeHeight || 14);

    const padX = 40;
    const padY = 50;

    // Apply zoom transformation centered
    ctx.translate(width / 2, padY);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -padY);

    // Coordinate mapping
    const nodeCoordMap = new Map();
    flatNodes.forEach(n => {
      const x = padX + (n.xIndex / (totalNodesCount - 1 || 1)) * (width - 2 * padX);
      const y = padY + (n.depth / maxTreeDepth) * (height - 2 * padY);
      nodeCoordMap.set(n.id, { x, y, node: n });
    });

    // A. Draw all edges (Grey lines)
    flatLinks.forEach(link => {
      const fromPos = nodeCoordMap.get(link.fromId);
      const toPos = nodeCoordMap.get(link.toId);

      if (fromPos && toPos) {
        const inPath = searchPath.includes(link.fromId) && searchPath.includes(link.toId);

        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);

        if (inPath) {
          ctx.strokeStyle = '#212529'; // Charcoal
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = '#ced4da'; // Light grey
          ctx.lineWidth = totalNodesCount > 500 ? 0.7 : 1.2;
        }
        ctx.stroke();
      }
    });

    // B. Draw all nodes (White & Grey)
    const nodeRadius = totalNodesCount > 1000 ? 2.5 : totalNodesCount > 100 ? 4 : 7;

    flatNodes.forEach(n => {
      const pos = nodeCoordMap.get(n.id);
      if (!pos) return;

      const isHighlighted = highlightedIds.includes(n.id);
      const inSearchPath = searchPath.includes(n.id);

      ctx.beginPath();
      const r = (isHighlighted || inSearchPath) ? Math.max(6, nodeRadius * 2) : nodeRadius;
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);

      if (isHighlighted) {
        ctx.fillStyle = '#212529'; // Charcoal
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
      } else if (inSearchPath) {
        ctx.fillStyle = '#495057'; // Dark grey
        ctx.strokeStyle = '#212529';
        ctx.lineWidth = 1.5;
      } else {
        // Neutral clean grey tones
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 1.2;
      }

      ctx.fill();
      ctx.stroke();

      // Show node labels if dataset is small or when zoomed in
      if (totalNodesCount <= 40 || zoom >= 2.2 || isHighlighted || inSearchPath) {
        ctx.fillStyle = (isHighlighted || inSearchPath) ? '#212529' : '#495057';
        ctx.font = totalNodesCount > 200 ? '9px monospace' : '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(n.id), pos.x, pos.y - (r + 4));
      }
    });

    ctx.restore();
  }, [viewMode, flatTree, zoom, searchPath, highlightedIds, treeHeight]);

  // Handle canvas mouse move for node tooltip
  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || !flatTree?.nodes) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const totalNodesCount = flatTree.nodes.length;
    const maxTreeDepth = Math.max(1, flatTree.maxDepth || treeHeight || 14);
    const padX = 40;
    const padY = 50;

    let found = null;
    const threshold = Math.max(8, 12 / zoom);

    for (const n of flatTree.nodes) {
      const origX = padX + (n.xIndex / (totalNodesCount - 1 || 1)) * (canvas.width - 2 * padX);
      const origY = padY + (n.depth / maxTreeDepth) * (canvas.height - 2 * padY);

      const screenX = canvas.width / 2 + (origX - canvas.width / 2) * zoom;
      const screenY = padY + (origY - padY) * zoom;

      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
      if (dist < threshold) {
        found = n;
        break;
      }
    }

    if (found) {
      setHoveredNode(found);
      setTooltipPos({ x: mouseX + 15, y: mouseY - 25 });
    } else {
      setHoveredNode(null);
    }
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
    }
  };

  const handleQuickInsert = (e) => {
    e.preventDefault();
    if (!actionId) return;
    onInsert({
      id: Number(actionId),
      name: actionName.trim() || `Item ${actionId}`,
      category: 'General',
      quantity: 10,
      price: 5000
    });
    setActionId('');
    setActionName('');
  };

  const handleQuickDelete = (e) => {
    e.preventDefault();
    if (!actionId) return;
    onDelete(Number(actionId));
    setActionId('');
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!actionId) return;
    onSearch(Number(actionId));
  };

  const totalFlatCount = flatTree?.nodes?.length || totalItems;

  return (
    <div className="app-panel bg-white mb-3">
      {/* Header & Controls */}
      <div className="d-flex justify-content-between align-items-center p-2.5 border-bottom flex-wrap gap-2">
        <div>
          <span className="fw-semibold text-dark small">AVL Tree</span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn py-0 px-2 ${viewMode === 'canvas' ? 'btn-dark' : 'btn-outline-secondary'}`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setViewMode('canvas')}
              title="Preview canvas map"
            >
              Canvas Map ({totalFlatCount.toLocaleString()})
            </button>
            <button
              type="button"
              className={`btn py-0 px-2 ${viewMode === 'structural' ? 'btn-dark' : 'btn-outline-secondary'}`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setViewMode('structural')}
              title="Node structure view"
            >
              Node View
            </button>
          </div>

          <span className="text-secondary small">
            Nodes: <strong className="text-dark font-mono">{totalFlatCount.toLocaleString()}</strong>
          </span>
          <span className="text-secondary small">
            Height: <strong className="text-dark font-mono">{treeHeight || flatTree?.maxDepth || (treeData ? treeData.height : 0)}</strong>
          </span>
        </div>
      </div>

      <div className="p-3">
        {/* Quick Controls & Timer Bar */}
        <div className="p-2 border rounded bg-light mb-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="small fw-semibold text-secondary">Operations:</span>
            
            <input
              type="number"
              placeholder="Product ID"
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              className="form-control form-control-sm bg-white border"
              style={{ width: '120px' }}
            />

            <input
              type="text"
              placeholder="Name (optional)"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              className="form-control form-control-sm bg-white border"
              style={{ width: '150px' }}
            />

            <button
              type="button"
              className="btn btn-sm btn-dark"
              onClick={handleQuickInsert}
              disabled={!actionId}
            >
              Insert
            </button>
            
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleQuickSearch}
              disabled={!actionId}
            >
              Search
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleQuickDelete}
              disabled={!actionId}
            >
              Delete
            </button>
          </div>

          {(operationMessage || operationTiming) && (
            <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top flex-wrap gap-2 small text-secondary">
              {operationMessage && (
                <div className="text-dark">{operationMessage}</div>
              )}
              {operationTiming && (
                <div className="d-flex gap-2 ms-auto">
                  <span className="badge bg-white text-secondary border font-monospace fw-normal">
                    AVL: {operationTiming.avlTimeMs} ms
                  </span>
                  <span className="badge bg-white text-secondary border font-monospace fw-normal">
                    Map: {operationTiming.mapTimeMs} ms
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VIEW MODE 1: CANVAS */}
        {viewMode === 'canvas' && (
          <div className="canvas-container">
            <div className="canvas-toolbar">
              <div className="small text-secondary">
                Displaying all <strong>{totalFlatCount.toLocaleString()}</strong> nodes across <strong>{treeHeight || flatTree?.maxDepth || 14}</strong> balanced levels.
                {searchPath.length > 0 && (
                  <span className="text-dark fw-semibold ms-2">
                    &bull; Active Search Path: {searchPath.length} nodes highlighted
                  </span>
                )}
              </div>

              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-secondary py-0 px-2"
                  onClick={() => setZoom(prev => Math.min(4, Number((prev * 1.3).toFixed(2))))}
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary py-0 px-2"
                  onClick={() => setZoom(prev => Math.max(0.5, Number((prev / 1.3).toFixed(2))))}
                >
                  &minus;
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary py-0 px-2"
                  onClick={() => setZoom(1)}
                >
                  Reset ({Math.round(zoom * 100)}%)
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={1000}
                height={460}
                style={{ width: '100%', height: '460px', display: 'block', cursor: hoveredNode ? 'pointer' : 'default' }}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={handleCanvasClick}
              />

              {hoveredNode && (
                <div
                  className="canvas-tooltip"
                  style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
                >
                  <strong>ID: {hoveredNode.id}</strong> ({hoveredNode.name})<br />
                  Height: {hoveredNode.height} &bull; BF: {hoveredNode.balanceFactor} &bull; Depth: {hoveredNode.depth}<br />
                  Qty: {hoveredNode.quantity} &bull; ₹{hoveredNode.price?.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: STRUCTURAL SVG */}
        {viewMode === 'structural' && (
          <div className="tree-viewport">
            {nodes.length === 0 ? (
              <div className="p-4 text-secondary small">
                Tree is currently empty. Insert items to view structure.
              </div>
            ) : (
              <svg width={width} height={height} style={{ overflow: 'visible' }}>
                {links.map((link, idx) => {
                  const isInPath = searchPath.includes(link.from.id) && searchPath.includes(link.to.id);
                  return (
                    <g key={`link-${idx}`}>
                      <line
                        x1={link.from.x}
                        y1={link.from.y + 15}
                        x2={link.to.x}
                        y2={link.to.y - 15}
                        stroke={isInPath ? '#212529' : '#ced4da'}
                        strokeWidth={isInPath ? 2.5 : 1.2}
                      />
                      <text
                        x={(link.from.x + link.to.x) / 2 + (link.label === 'L' ? -8 : 8)}
                        y={(link.from.y + link.to.y) / 2}
                        fontSize="9"
                        fill="#6c757d"
                        fontFamily="monospace"
                      >
                        {link.label}
                      </text>
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const isTargetHighlighted = highlightedIds.includes(node.id);
                  const isInSearchPath = searchPath.includes(node.id);

                  let fillColor = '#ffffff';
                  let strokeColor = '#6c757d';
                  let strokeWidth = 1.2;

                  if (isTargetHighlighted) {
                    fillColor = '#e9ecef';
                    strokeColor = '#000000';
                    strokeWidth = 2.5;
                  } else if (isInSearchPath) {
                    fillColor = '#f8f9fa';
                    strokeColor = '#212529';
                    strokeWidth = 2;
                  }

                  return (
                    <g
                      key={`node-${node.id}`}
                      transform={`translate(${node.x}, ${node.y})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <rect
                        x="-30"
                        y="-18"
                        width="60"
                        height="36"
                        rx="4"
                        ry="4"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                      />

                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fontWeight="700"
                        fontSize="11"
                        fill="#212529"
                        fontFamily="monospace"
                      >
                        {node.id}
                      </text>

                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fontSize="8.5"
                        fill="#6c757d"
                        fontFamily="monospace"
                      >
                        H:{node.height} BF:{node.balanceFactor}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        )}

        {/* Legend & Selected Node Details */}
        <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2 text-secondary small">
          <div className="d-flex gap-3 align-items-center">
            <span className="fw-semibold">Legend:</span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="d-inline-block border" style={{ width: '8px', height: '8px', backgroundColor: '#ffffff', borderColor: '#6c757d', borderRadius: '50%' }}></span> Balanced Node
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#495057', borderRadius: '50%' }}></span> Search Path
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#212529', borderRadius: '50%' }}></span> Target Node
            </span>
          </div>

          {selectedNode && (
            <div className="bg-light border px-2 py-1 rounded text-dark small">
              <strong>ID: {selectedNode.id}</strong> ({selectedNode.name}) &bull; H: {selectedNode.height} &bull; BF: {selectedNode.balanceFactor} &bull; Qty: {selectedNode.quantity} &bull; ₹{selectedNode.price?.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
