'use client';

import { useState } from 'react';
import MatrixLevelView from './MatrixLevelView';
import DistributorDetailsModal from '../distributor/DistributorDetailsModal';
import type { MatrixNodeData } from './MatrixNodeCard';

interface MatrixWithModalProps {
  nodesByLevel: Record<number, MatrixNodeData[]>;
  maxRankDepth: number;
  totalTeamSize: number;
}

export default function MatrixWithModal({
  nodesByLevel,
  maxRankDepth,
  totalTeamSize,
}: MatrixWithModalProps) {
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNodeClick = (distributorId: string) => {
    setSelectedDistributorId(distributorId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDistributorId(null);
  };

  return (
    <>
      {totalTeamSize === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-600 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No team members yet</p>
          <p className="text-slate-500 text-sm">
            Start building your team by sharing your referral link
          </p>
        </div>
      ) : (
        <>
          {[1, 2, 3, 4, 5].map((level) => (
            <MatrixLevelView
              key={level}
              level={level}
              nodes={nodesByLevel[level] || []}
              maxRankDepth={maxRankDepth}
              onNodeClick={handleNodeClick}
            />
          ))}
        </>
      )}

      {/* Distributor Details Modal */}
      {selectedDistributorId && (
        <DistributorDetailsModal
          distributorId={selectedDistributorId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
