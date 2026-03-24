'use client';

// =============================================
// Matrix Visualization Component
// Interactive matrix tree visualization
// Shows user at top, downline below, levels indicated
// Click nodes to expand/collapse, zoomable
// =============================================

import React, { useState } from 'react';

interface MatrixNode {
  id: string;
  name: string;
  rank: string;
  personalBV: number;
  teamSize: number;
  children?: MatrixNode[];
  avatar?: string;
}

interface MatrixVisualizationProps {
  rootNode: MatrixNode;
  maxDepth?: number;
  onNodeClick?: (nodeId: string) => void;
}

export default function MatrixVisualization({
  rootNode,
  maxDepth = 3,
  onNodeClick,
}: MatrixVisualizationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([rootNode.id]));
  const [scale, setScale] = useState(1);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (nodeId: string) => {
    toggleNode(nodeId);
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  const renderNode = (node: MatrixNode, depth: number = 0): React.ReactElement => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isRoot = depth === 0;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`
            relative group cursor-pointer transition-all
            ${isRoot ? 'mb-8' : 'mb-6'}
          `}
          onClick={() => handleNodeClick(node.id)}
        >
          {/* Connector Line (if not root) */}
          {!isRoot && (
            <div className="absolute bottom-full left-1/2 w-0.5 h-6 bg-[#2c5aa0]/30 -translate-x-1/2" />
          )}

          {/* Card */}
          <div
            className={`
              bg-white rounded-xl border-2 p-3 shadow-md hover:shadow-lg transition-all
              ${isRoot ? 'border-[#2c5aa0] w-48' : 'border-gray-200 hover:border-[#2c5aa0]/50 w-40'}
            `}
          >
            {/* Avatar */}
            <div className="flex justify-center mb-2">
              {node.avatar ? (
                <img
                  src={node.avatar}
                  alt={node.name}
                  className={`rounded-full border-2 border-[#2c5aa0]/20 object-cover ${
                    isRoot ? 'w-16 h-16' : 'w-12 h-12'
                  }`}
                />
              ) : (
                <div
                  className={`rounded-full bg-gradient-to-br from-[#2c5aa0] to-[#1a4075] flex items-center justify-center text-white font-bold ${
                    isRoot ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-lg'
                  }`}
                >
                  {node.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name */}
            <h5 className={`font-bold text-gray-900 text-center truncate ${isRoot ? 'text-sm' : 'text-xs'}`}>
              {node.name}
            </h5>

            {/* Rank Badge */}
            <div className="flex justify-center mt-1">
              <span className="text-[10px] font-medium text-[#2c5aa0] bg-[#e3f2fd] px-2 py-0.5 rounded-full">
                {node.rank}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-1 mt-2 text-center">
              <div className="bg-gray-50 rounded p-1">
                <p className="text-[9px] text-gray-500">BV</p>
                <p className="text-[11px] font-bold text-gray-900">{node.personalBV}</p>
              </div>
              <div className="bg-gray-50 rounded p-1">
                <p className="text-[9px] text-gray-500">Team</p>
                <p className="text-[11px] font-bold text-gray-900">{node.teamSize}</p>
              </div>
            </div>

            {/* Expand/Collapse Indicator */}
            {hasChildren && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-[#2c5aa0] flex items-center justify-center shadow-sm">
                <svg
                  className={`w-3 h-3 text-[#2c5aa0] transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && depth < maxDepth && (
          <div className="flex gap-4 justify-center">
            {node.children!.map((child) => (
              <div key={child.id} className="relative">
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-bold text-gray-900">Your Matrix Tree</h4>
          <p className="text-sm text-gray-500">Click nodes to expand/collapse</p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs font-medium text-gray-600 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Matrix Tree (Scrollable) */}
      <div className="overflow-auto max-h-[600px]">
        <div
          className="inline-block min-w-full py-4 transition-transform"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          {renderNode(rootNode)}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#2c5aa0] to-[#1a4075]" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Team Members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-[#2c5aa0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Click to expand</span>
        </div>
      </div>
    </div>
  );
}
