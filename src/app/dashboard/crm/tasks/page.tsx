// =============================================
// CRM Tasks - Redirect to CRM Dashboard (Tasks Tab)
// This page now redirects to the main CRM page
// Tasks are accessed via tabs on /dashboard/crm
// =============================================

import { redirect } from 'next/navigation';

export default async function TasksPage() {
  // Redirect to main CRM page
  // Note: We can't set the tab via URL params in this implementation
  // Users will need to click the Tasks tab
  redirect('/dashboard/crm');
}
