'use client';

import { useState } from 'react';
import CompensationTreeView from './CompensationTreeView';
import DistributorDetailsModal from '../distributor/DistributorDetailsModal';
import type { MemberNode } from './TreeNodeCard';

interface GenealogyWithModalProps {
  tree: MemberNode[];
  maxInitialDepth?: number;
}

export default function GenealogyWithModal({
  tree,
  maxInitialDepth = 3,
}: GenealogyWithModalProps) {
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMemberClick = (distributorId: string) => {
    setSelectedDistributorId(distributorId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDistributorId(null);
  };

  return (
    <>
      <CompensationTreeView
        tree={tree}
        maxInitialDepth={maxInitialDepth}
        onMemberClick={handleMemberClick}
      />

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
