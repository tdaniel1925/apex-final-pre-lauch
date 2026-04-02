// =============================================
// AI Assistant - Redirect to Modal
// AI Assistant is now a modal accessible via floating button
// This page redirects users to main dashboard
// =============================================

import { redirect } from 'next/navigation';

export default async function AIAssistantPage() {
  // Redirect to dashboard - AI Assistant is now a modal
  redirect('/dashboard');
}
