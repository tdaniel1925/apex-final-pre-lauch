'use client';

// =============================================
// AI Modal Chat Component
// Wrapper that renders AIChatInterface in modal mode
// Only renders when isOpen is true
// =============================================

import AIChatInterface from './AIChatInterface';

interface AIModalChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: {
    firstName: string;
    currentRank: string;
    personalBV: number;
    teamCount: number;
    monthlyCommissions: number;
    recentJoins: number;
    nextRank: string | null;
    personalProgress: number;
  };
}

export default function AIModalChat({ isOpen, onClose, initialContext }: AIModalChatProps) {
  if (!isOpen) return null;

  return <AIChatInterface initialContext={initialContext} onClose={onClose} isModal={true} />;
}
