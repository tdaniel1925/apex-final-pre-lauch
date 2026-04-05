// =============================================
// CRM Activities - Redirect to CRM Dashboard (Activities Tab)
// This page now redirects to the main CRM page
// Activities are accessed via tabs on /dashboard/crm
// =============================================

import { redirect } from 'next/navigation';

export default async function ActivitiesPage() {
  // Redirect to main CRM page
  // Note: We can't set the tab via URL params in this implementation
  // Users will need to click the Activities tab
  redirect('/dashboard/crm');
}
