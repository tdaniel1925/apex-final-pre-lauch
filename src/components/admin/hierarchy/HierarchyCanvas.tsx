'use client';

// =============================================
// Hierarchy Canvas Component
// Interactive tree visualization of 5×7 matrix
// Based on exported UXMagic design
// =============================================

import { useState, useEffect, useRef } from 'react';
import MatrixNode from './MatrixNode';
import NodeDetailPanel from './NodeDetailPanel';

// Simplified tree node type for hierarchy visualization
export interface TreeNode {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status: string;
  profile_image?: string | null;
  profile_photo_url?: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  sponsor_id: string | null;
  personal_bv_monthly?: number | null;
  group_bv_monthly?: number | null;
  created_at: string;
  children?: TreeNode[];
  childCount?: number;
}

interface HierarchyCanvasProps {
  rootDistributor: TreeNode;
  maxDepth?: number;
}

export default function HierarchyCanvas({ rootDistributor, maxDepth = 3 }: HierarchyCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Calculate node positions (simple tree layout)
  const calculateLayout = (node: TreeNode, depth: number, parentX: number, index: number, siblingCount: number) => {
    const nodeWidth = 220;
    const nodeHeight = 140;
    const horizontalSpacing = 40;
    const verticalSpacing = 100;

    // Calculate horizontal position
    const totalWidth = siblingCount * (nodeWidth + horizontalSpacing);
    const startX = parentX - totalWidth / 2 + nodeWidth / 2;
    const x = startX + index * (nodeWidth + horizontalSpacing);
    const y = depth * (nodeHeight + verticalSpacing) + 60;

    return { x, y };
  };

  // Render tree recursively
  const renderTree = (node: TreeNode, depth: number = 0, parentX: number = 400, index: number = 0, siblingCount: number = 1): React.ReactElement[] => {
    if (depth > maxDepth) return [];

    const { x, y } = calculateLayout(node, depth, parentX, index, siblingCount);

    const elements: React.ReactElement[] = [];

    // Render children first (so they appear behind)
    if (node.children && node.children.length > 0 && depth < maxDepth) {
      node.children.forEach((child, childIndex) => {
        // Draw connection line
        const childPos = calculateLayout(child, depth + 1, x, childIndex, node.children!.length);
        elements.push(
          <svg
            key={`line-${node.id}-${child.id}`}
            className="absolute pointer-events-none"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
            }}
          >
            <line
              x1={x + 100}
              y1={y + 110}
              x2={childPos.x + 100}
              y2={childPos.y + 10}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        );

        // Recursively render child nodes
        elements.push(...renderTree(child, depth + 1, x, childIndex, node.children!.length));
      });
    }

    // Render current node
    elements.push(
      <div
        key={`node-${node.id}`}
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '200px',
          zIndex: 10 + depth,
        }}
      >
        <MatrixNode
          distributor={node}
          tier={depth === 0 ? 'national' : depth === 1 ? 'regional' : depth === 2 ? 'district' : 'field'}
          isSelected={selectedNode?.id === node.id}
          onClick={() => handleNodeClick(node)}
          collapsedRepCount={node.childCount || 0}
        />
      </div>
    );

    return elements;
  };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      {/* Frosted Top Bar */}
      <header
        className="absolute top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/90 border-b border-slate-200"
        style={{ height: '48px' }}
      >
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e91e63, #ad1457)' }}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="7" height="7" rx="1" fill="white" opacity="0.9" />
                  <rect x="11" y="2" width="7" height="7" rx="1" fill="white" opacity="0.7" />
                  <rect x="2" y="11" width="7" height="7" rx="1" fill="white" opacity="0.7" />
                  <rect x="11" y="11" width="7" height="7" rx="1" fill="white" opacity="0.5" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">Apex</span>
                <span className="text-xs font-semibold ml-1.5 text-pink-600">HIERARCHY</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md min-w-[200px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-xs text-slate-500">Search reps...</span>
              <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-slate-200 text-slate-600 rounded border border-slate-300">
                ⌘K
              </kbd>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-md px-2 py-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                title="Zoom Out"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                title="Zoom In"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden cursor-move bg-slate-50"
        style={{ paddingTop: '48px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full bg-slate-50"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'top left',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            minWidth: '2000px',
            minHeight: '2000px',
          }}
        >
          {renderTree(rootDistributor)}
        </div>
      </div>

      {/* Detail Panel */}
      <NodeDetailPanel distributor={selectedNode} isOpen={isPanelOpen} onClose={handleClosePanel} />

      {/* Mini Map (Optional - can add later) */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 border border-slate-200 z-40">
        <p className="text-xs text-slate-600">Mini-map coming soon</p>
      </div>
    </div>
  );
}
