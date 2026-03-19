// =============================================
// Matrix Level View Component
// Displays a horizontal row of nodes for a specific level
// =============================================

'use client';

import MatrixNodeCard, { MatrixNodeData } from './MatrixNodeCard';

interface MatrixLevelViewProps {
  level: number;
  nodes: MatrixNodeData[];
  maxRankDepth: number; // Max level allowed based on user's rank
  onNodeClick?: (distributorId: string) => void;
}

export default function MatrixLevelView({ level, nodes, maxRankDepth, onNodeClick }: MatrixLevelViewProps) {
  // Don't render if this level exceeds the user's rank depth
  if (level > maxRankDepth) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Level Header */}
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-200">
          Level {level}
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({nodes.length} {nodes.length === 1 ? 'member' : 'members'})
          </span>
        </h2>
        <div className="h-px bg-slate-700 mt-2" />
      </div>

      {/* Node Cards - Horizontal Scroll */}
      {nodes.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-min">
            {nodes.map((node) => (
              <MatrixNodeCard
                key={node.member_id}
                node={node}
                level={level}
                onClick={() => onNodeClick?.(node.distributor_id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-dashed border-slate-600 rounded-lg p-8 text-center">
          <p className="text-slate-400 text-sm">No team members at this level yet</p>
        </div>
      )}
    </div>
  );
}
