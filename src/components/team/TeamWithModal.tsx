'use client';

import { useState } from 'react';
import TeamFilters from './TeamFilters';
import DistributorDetailsModal from '../distributor/DistributorDetailsModal';
import type { TeamMemberData } from './TeamMemberCard';

interface TeamWithModalProps {
  members: TeamMemberData[];
}

export default function TeamWithModal({ members }: TeamWithModalProps) {
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
      <TeamFilters members={members} onMemberClick={handleMemberClick} />

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
