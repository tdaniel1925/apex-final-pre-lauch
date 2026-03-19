'use client';

// =============================================
// Compensation Tree View Component
// Indented tree list with expand/collapse
// =============================================

import { useState, useMemo } from 'react';
import TreeNodeCard, { type MemberNode } from './TreeNodeCard';

interface CompensationTreeViewProps {
  tree: MemberNode[];
  maxInitialDepth?: number;
  onMemberClick?: (distributorId: string) => void;
}

export default function CompensationTreeView({
  tree,
  maxInitialDepth = 3,
  onMemberClick,
}: CompensationTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Auto-expand nodes up to maxInitialDepth
  useMemo(() => {
    const initialExpanded = new Set<string>();
    const expand = (nodes: MemberNode[], currentDepth: number) => {
      if (currentDepth >= maxInitialDepth) return;
      nodes.forEach((node) => {
        if (node.hasChildren) {
          initialExpanded.add(node.member_id);
          expand(node.children, currentDepth + 1);
        }
      });
    };
    expand(tree, 0);
    setExpandedNodes(initialExpanded);
  }, [tree, maxInitialDepth]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: MemberNode[]) => {
      nodes.forEach((node) => {
        if (node.hasChildren) {
          allIds.add(node.member_id);
          collect(node.children);
        }
      });
    };
    collect(tree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Filter tree
  const filterNode = (node: MemberNode): boolean => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        node.full_name.toLowerCase().includes(term) ||
        node.email.toLowerCase().includes(term) ||
        node.distributor.slug.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Rank filter
    if (filterRank !== 'all' && node.tech_rank !== filterRank) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all' && node.status !== filterStatus) {
      return false;
    }

    return true;
  };

  const filteredTree = useMemo(() => {
    if (!searchTerm && filterRank === 'all' && filterStatus === 'all') {
      return tree;
    }

    const filterRecursive = (nodes: MemberNode[]): MemberNode[] => {
      return nodes
        .filter((node) => {
          const nodeMatches = filterNode(node);
          const childrenMatch = node.children.length > 0 && filterRecursive(node.children).length > 0;
          return nodeMatches || childrenMatch;
        })
        .map((node) => ({
          ...node,
          children: filterRecursive(node.children),
        }));
    };

    return filterRecursive(tree);
  }, [tree, searchTerm, filterRank, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rank Filter */}
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ranks</option>
            <option value="starter">Starter</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
            <option value="ruby">Ruby</option>
            <option value="diamond">Diamond</option>
            <option value="crown">Crown</option>
            <option value="elite">Elite</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>

          {/* Expand/Collapse */}
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-white rounded-lg shadow p-4">
        {filteredTree.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-5xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No members found
            </h3>
            <p className="text-sm text-slate-600">
              {searchTerm || filterRank !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No downline members yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTree.map((node) => (
              <TreeNodeRecursive
                key={node.member_id}
                node={node}
                expandedNodes={expandedNodes}
                onToggle={toggleNode}
                onMemberClick={onMemberClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TreeNodeRecursiveProps {
  node: MemberNode;
  expandedNodes: Set<string>;
  onToggle: (nodeId: string) => void;
  onMemberClick?: (distributorId: string) => void;
}

function TreeNodeRecursive({
  node,
  expandedNodes,
  onToggle,
  onMemberClick,
}: TreeNodeRecursiveProps) {
  const isExpanded = expandedNodes.has(node.member_id);
  const indentLevel = node.depth;

  return (
    <div>
      <div style={{ paddingLeft: `${indentLevel * 1.5}rem` }}>
        <TreeNodeCard
          node={node}
          isExpanded={isExpanded}
          onToggle={() => onToggle(node.member_id)}
          onMemberClick={onMemberClick}
        />
      </div>

      {/* Render children if expanded */}
      {isExpanded && node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <TreeNodeRecursive
              key={child.member_id}
              node={child}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onMemberClick={onMemberClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
