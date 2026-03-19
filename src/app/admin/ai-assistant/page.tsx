// =============================================
// Admin AI Assistant Testing Page
// Full-page chat interface with conversation starters
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import AIAssistantTestInterface from '@/components/admin/AIAssistantTestInterface';

export const metadata = {
  title: 'AI Assistant - Admin Portal',
  description: 'Test and interact with the AI assistant',
};

export default async function AIAssistantPage() {
  await requireAdmin();

  return (
    <div className="h-screen flex flex-col">
      <AIAssistantTestInterface />
    </div>
  );
}
