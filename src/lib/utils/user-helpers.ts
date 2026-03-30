/**
 * User Type Helper Functions
 *
 * TERMINOLOGY CLARITY:
 * - Enrollee: Someone participating in comp plan (has back office, can recruit)
 * - Customer: Someone with product subscription only (no back office)
 * - Admin: System administrator
 */

/**
 * Check if user is an enrollee (participates in comp plan)
 * Enrollees have distributor_id set, giving them back office access
 */
export function isEnrollee(user: any): boolean {
  return user?.distributor_id !== null && user?.distributor_id !== undefined;
}

/**
 * Check if user is a customer only (product subscription, no comp plan)
 * Customers have no distributor_id and are not admins
 */
export function isCustomer(user: any): boolean {
  return (
    (user?.distributor_id === null || user?.distributor_id === undefined) &&
    user?.role !== 'admin'
  );
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}

/**
 * Get user type label for display
 */
export function getUserTypeLabel(user: any): string {
  if (isAdmin(user)) return 'Admin';
  if (isEnrollee(user)) return 'Enrollee';
  if (isCustomer(user)) return 'Customer';
  return 'Unknown';
}

/**
 * Get user type badge color
 */
export function getUserTypeBadgeColor(user: any): string {
  if (isAdmin(user)) return 'bg-purple-100 text-purple-800';
  if (isEnrollee(user)) return 'bg-blue-100 text-blue-800';
  if (isCustomer(user)) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
}
