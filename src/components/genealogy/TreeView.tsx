'use client';

// =============================================
// Genealogy Tree View Component
// Interactive expandable sponsor tree visualization
// =============================================

import { useState } from 'react';
import type { TreeNode } from '@/lib/genealogy/tree-service';

interface TreeViewProps {
  rootNode: TreeNode;
  enableNavigation?: boolean;
  baseUrl?: string;
  maxInitialDepth?: number;
}

export default function TreeView({
  rootNode,
  enableNavigation = false,
  baseUrl = '',
  maxInitialDepth = 3,
}: TreeViewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <TreeNodeComponent
        node={rootNode}
        enableNavigation={enableNavigation}
        baseUrl={baseUrl}
        maxInitialDepth={maxInitialDepth}
      />
    </div>
  );
}

interface TreeNodeComponentProps {
  node: TreeNode;
  enableNavigation: boolean;
  baseUrl: string;
  maxInitialDepth: number;
  isLast?: boolean;
}

function TreeNodeComponent({
  node,
  enableNavigation,
  baseUrl,
  maxInitialDepth,
  isLast = false,
}: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(node.depth < maxInitialDepth);
  const hasChildren = node.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="font-semibold text-gray-900 truncate">
            {node.distributor.first_name} {node.distributor.last_name}
          </h3>

          {/* Email */}
          <p className="text-xs text-gray-600 truncate">
            {node.distributor.email}
          </p>

          {/* Username */}
          <p className="text-xs text-blue-600 mt-0.5">
            @{node.distributor.slug}
          </p>
        </div>

        {/* Stats */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-600">Level {node.depth}</div>
          <div className="text-sm font-bold text-gray-900">
            {node.directReferrals} direct
          </div>
          <div className="text-xs text-gray-500">
            {node.totalDownline} total
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        <span>Rep #{node.distributor.rep_number ?? 'N/A'}</span>
        <span>Joined: {new Date(node.distributor.created_at).toLocaleDateString()}</span>
      </div>
    </>
  );

  const cardClassName = `flex-1 border-2 rounded-lg p-3 transition-all ${
    enableNavigation ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : ''
  } ${
    node.depth === 0
      ? 'border-purple-500 bg-purple-50'
      : 'border-gray-300 bg-white'
  }`;

  return (
    <div className="relative">
      {/* Node */}
      <div className="flex items-start gap-2 mb-2">
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors mt-1"
          >
            <span className="text-gray-600 text-xs font-bold">
              {isExpanded ? '−' : '+'}
            </span>
          </button>
        )}

        {/* Empty space if no children */}
        {!hasChildren && <div className="w-6" />}

        {/* Distributor Card */}
        {enableNavigation ? (
          <a
            href={`${baseUrl}?start=${node.distributor.id}`}
            className={cardClassName}
          >
            {cardContent}
          </a>
        ) : (
          <div className={cardClassName}>
            {cardContent}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-8 border-l-2 border-gray-300 pl-4 space-y-2">
          {node.children.map((child, index) => (
            <TreeNodeComponent
              key={child.distributor.id}
              node={child}
              enableNavigation={enableNavigation}
              baseUrl={baseUrl}
              maxInitialDepth={maxInitialDepth}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}

      {/* Show "Load More" if at depth limit and has children */}
      {hasChildren && !isExpanded && node.depth >= maxInitialDepth && (
        <div className="ml-8 text-xs text-blue-600 italic">
          Click + to load {node.children.length} members
        </div>
      )}
    </div>
  );
}

// Compact stats summary component
export function TreeStats({ stats }: { stats: { totalDistributors: number; maxDepth: number; totalLevels: number } }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-white rounded-lg shadow p-3">
        <p className="text-xs text-gray-600">Total Members</p>
        <p className="text-xl font-bold text-gray-900">{stats.totalDistributors}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-3">
        <p className="text-xs text-gray-600">Max Depth</p>
        <p className="text-xl font-bold text-purple-600">{stats.maxDepth}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-3">
        <p className="text-xs text-gray-600">Total Levels</p>
        <p className="text-xl font-bold text-blue-600">{stats.totalLevels}</p>
      </div>
    </div>
  );
}
