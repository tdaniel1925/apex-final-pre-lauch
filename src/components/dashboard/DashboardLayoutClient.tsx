'use client';

// =============================================
// Dashboard Layout Client Wrapper
// Manages AI Chat Modal state
// =============================================

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AIChatModal from './AIChatModal';
import ErrorBoundary from '@/components/ErrorBoundary';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  isLicensedAgent: boolean;
}

export default function DashboardLayoutClient({
  children,
  isLicensedAgent,
}: DashboardLayoutClientProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Listen for custom event to open AI chat
  useEffect(() => {
    const handleOpenAIChat = () => {
      setIsAIChatOpen(true);
    };

    window.addEventListener('openAIChat', handleOpenAIChat);

    return () => {
      window.removeEventListener('openAIChat', handleOpenAIChat);
    };
  }, []);

  return (
    <>
      <Sidebar
        isLicensedAgent={isLicensedAgent}
        onOpenAIChat={() => setIsAIChatOpen(true)}
      />
      <main className="flex-1 pt-14 md:pt-0 min-w-0">
        {children}
      </main>

      {/* AI Chat Modal */}
      <ErrorBoundary
        fallbackTitle="AI Copilot Error"
        fallbackMessage="Something went wrong with the AI Copilot. Please refresh the page or try again later."
        showHomeButton={false}
      >
        <AIChatModal
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
        />
      </ErrorBoundary>
    </>
  );
}
