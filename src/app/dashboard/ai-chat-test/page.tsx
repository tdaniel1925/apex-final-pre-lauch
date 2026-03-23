// =============================================
// AI Chat Test Page
// HIDDEN PAGE - Not linked in sidebar
// Direct URL: /dashboard/ai-chat-test
// =============================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AIChatInterface from '@/components/dashboard/AIChatInterface';

export const metadata = {
  title: 'AI Chat Test - Dashboard',
};

export default async function AIChatTestPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-6">
      {/* Test Banner */}
      <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          <div>
            <h2 className="font-bold text-yellow-900">Test Page - Not Production</h2>
            <p className="text-sm text-yellow-800">
              This is a prototype of the AI-powered dashboard interface. Try asking for help with tasks like creating registration pages, viewing team stats, or checking commissions.
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      <AIChatInterface />

      {/* Instructions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-2">💡 Try This</h3>
          <p className="text-sm text-gray-600 mb-2">"I need to create a registration page for my Tuesday meeting"</p>
          <p className="text-xs text-gray-500">The AI will ask follow-up questions and create the page for you</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-2">📊 Or This</h3>
          <p className="text-sm text-gray-600 mb-2">"Show me my team stats"</p>
          <p className="text-xs text-gray-500">Instantly see your team size and active members</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-2">💰 Or This</h3>
          <p className="text-sm text-gray-600 mb-2">"What's my commission balance?"</p>
          <p className="text-xs text-gray-500">Check your current earnings balance</p>
        </div>
      </div>
    </div>
  );
}
