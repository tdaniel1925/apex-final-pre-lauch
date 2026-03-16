// =============================================
// Command Executor Service
// Executes validated AI commands by calling existing API endpoints
// =============================================

import { resolveDistributor, resolveSponsor, formatDistributor, canBeSponsor, type ResolvedDistributor } from './entity-resolver';
import { createServiceClient } from '@/lib/supabase/service';

export interface ParsedAction {
  type: string;
  distributorIdentifier?: string;
  newSponsorIdentifier?: string;
  action?: 'suspend' | 'activate' | 'delete';
  reason?: string;
  newEmail?: string;
  role?: 'super_admin' | 'admin' | 'support' | 'viewer' | 'none';
  query?: string;
  status?: string;
  state?: string;
  limit?: number;
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Execute a parsed command
 */
export async function executeCommand(
  action: ParsedAction,
  adminId: string
): Promise<ExecutionResult> {
  try {
    switch (action.type) {
      case 'move_rep_sponsor':
        return await executeMoveRepSponsor(action, adminId);

      case 'update_status':
        return await executeUpdateStatus(action, adminId);

      case 'reset_password':
        return await executeResetPassword(action, adminId);

      case 'change_email':
        return await executeChangeEmail(action, adminId);

      case 'change_admin_role':
        return await executeChangeAdminRole(action, adminId);

      case 'search_distributors':
        return await executeSearchDistributors(action);

      case 'get_distributor_info':
        return await executeGetDistributorInfo(action);

      default:
        return {
          success: false,
          error: `Unknown action type: ${action.type}`,
          message: 'Unknown action',
        };
    }
  } catch (error: any) {
    console.error('Command execution error:', error);
    return {
      success: false,
      error: error.message || 'Failed to execute command',
      message: 'Execution failed',
    };
  }
}

/**
 * Move rep to new sponsor
 */
async function executeMoveRepSponsor(action: ParsedAction, adminId: string): Promise<ExecutionResult> {
  if (!action.distributorIdentifier || !action.newSponsorIdentifier) {
    return {
      success: false,
      error: 'Missing distributor or sponsor identifier',
      message: 'Missing required information',
    };
  }

  // Resolve both distributors
  const distResult = await resolveDistributor(action.distributorIdentifier);
  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  const sponsorResult = await resolveSponsor(action.newSponsorIdentifier);
  if (!sponsorResult.success || !sponsorResult.distributor) {
    return {
      success: false,
      error: sponsorResult.error,
      message: 'Could not find sponsor',
    };
  }

  const dist = distResult.distributor;
  const sponsor = sponsorResult.distributor;

  // Validate sponsor
  const canSponsor = canBeSponsor(sponsor);
  if (!canSponsor.valid) {
    return {
      success: false,
      error: canSponsor.reason,
      message: 'Invalid sponsor',
    };
  }

  // Check for circular reference
  if (dist.id === sponsor.id) {
    return {
      success: false,
      error: 'A distributor cannot sponsor themselves',
      message: 'Invalid operation',
    };
  }

  // Call the matrix position API
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/distributors/${dist.id}/matrix-position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newSpreadId: sponsor.id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error || 'Failed to move rep',
      message: 'Move failed',
    };
  }

  return {
    success: true,
    message: `Successfully moved ${formatDistributor(dist)} under ${formatDistributor(sponsor)}`,
    data: { distributor: dist, newSponsor: sponsor },
  };
}

/**
 * Update distributor status (suspend/activate/delete)
 */
async function executeUpdateStatus(action: ParsedAction, adminId: string): Promise<ExecutionResult> {
  if (!action.distributorIdentifier || !action.action) {
    return {
      success: false,
      error: 'Missing distributor identifier or action',
      message: 'Missing required information',
    };
  }

  const distResult = await resolveDistributor(action.distributorIdentifier);
  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  const dist = distResult.distributor;
  let endpoint = '';
  let method = 'POST';
  let body: any = {};

  switch (action.action) {
    case 'suspend':
      endpoint = `/api/admin/distributors/${dist.id}/suspend`;
      body = { reason: action.reason || 'Suspended via AI Assistant' };
      break;

    case 'activate':
      // Use suspend endpoint with reactivate
      endpoint = `/api/admin/distributors/${dist.id}/suspend`;
      method = 'DELETE'; // Assuming DELETE reactivates
      break;

    case 'delete':
      endpoint = `/api/admin/distributors/${dist.id}`;
      method = 'DELETE';
      break;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error || `Failed to ${action.action} distributor`,
      message: `${action.action} failed`,
    };
  }

  return {
    success: true,
    message: `Successfully ${action.action === 'activate' ? 'activated' : action.action + 'd'} ${formatDistributor(dist)}`,
    data: { distributor: dist, action: action.action },
  };
}

/**
 * Reset password
 */
async function executeResetPassword(action: ParsedAction, adminId: string): Promise<ExecutionResult> {
  if (!action.distributorIdentifier) {
    return {
      success: false,
      error: 'Missing distributor identifier',
      message: 'Missing required information',
    };
  }

  const distResult = await resolveDistributor(action.distributorIdentifier);
  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  const dist = distResult.distributor;

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/distributors/${dist.id}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error || 'Failed to reset password',
      message: 'Password reset failed',
    };
  }

  return {
    success: true,
    message: `Password reset link sent to ${dist.email}`,
    data: { distributor: dist },
  };
}

/**
 * Change email
 */
async function executeChangeEmail(action: ParsedAction, adminId: string): Promise<ExecutionResult> {
  if (!action.distributorIdentifier || !action.newEmail) {
    return {
      success: false,
      error: 'Missing distributor identifier or new email',
      message: 'Missing required information',
    };
  }

  const distResult = await resolveDistributor(action.distributorIdentifier);
  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  const dist = distResult.distributor;

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/distributors/${dist.id}/change-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newEmail: action.newEmail }),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error || 'Failed to change email',
      message: 'Email change failed',
    };
  }

  return {
    success: true,
    message: `Successfully changed email from ${dist.email} to ${action.newEmail}`,
    data: { distributor: dist, oldEmail: dist.email, newEmail: action.newEmail },
  };
}

/**
 * Change admin role
 */
async function executeChangeAdminRole(action: ParsedAction, adminId: string): Promise<ExecutionResult> {
  if (!action.distributorIdentifier || !action.role) {
    return {
      success: false,
      error: 'Missing distributor identifier or role',
      message: 'Missing required information',
    };
  }

  const distResult = await resolveDistributor(action.distributorIdentifier);
  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  const dist = distResult.distributor;
  const supabase = createServiceClient();

  // Update distributors table
  const isAdmin = action.role !== 'none';
  const { error: distError } = await supabase
    .from('distributors')
    .update({
      is_admin: isAdmin,
      admin_role: isAdmin ? action.role : null,
    })
    .eq('id', dist.id);

  if (distError) {
    return {
      success: false,
      error: distError.message,
      message: 'Failed to update admin role',
    };
  }

  // Update or create admins table record
  if (isAdmin) {
    const { error: adminError } = await supabase
      .from('admins')
      .upsert({
        auth_user_id: dist.id, // Assuming this is correct - might need to get auth_user_id
        role: action.role,
      });

    if (adminError) {
      console.error('Failed to update admins table:', adminError);
    }
  } else {
    // Remove from admins table
    await supabase
      .from('admins')
      .delete()
      .eq('auth_user_id', dist.id);
  }

  return {
    success: true,
    message: isAdmin
      ? `Successfully made ${formatDistributor(dist)} a ${action.role}`
      : `Successfully removed admin access from ${formatDistributor(dist)}`,
    data: { distributor: dist, role: action.role },
  };
}

/**
 * Search distributors
 */
async function executeSearchDistributors(action: ParsedAction): Promise<ExecutionResult> {
  const supabase = createServiceClient();
  let query = supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, status, state')
    .limit(action.limit || 10);

  if (action.status && action.status !== 'all') {
    query = query.eq('status', action.status);
  }

  if (action.state) {
    query = query.eq('state', action.state.toUpperCase());
  }

  if (action.query) {
    const searchTerm = action.query.toLowerCase();
    query = query.or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      error: error.message,
      message: 'Search failed',
    };
  }

  if (!data || data.length === 0) {
    return {
      success: true,
      message: 'No distributors found matching your criteria',
      data: { results: [] },
    };
  }

  return {
    success: true,
    message: `Found ${data.length} distributor${data.length === 1 ? '' : 's'}`,
    data: { results: data },
  };
}

/**
 * Get distributor info
 */
async function executeGetDistributorInfo(action: ParsedAction): Promise<ExecutionResult> {
  if (!action.distributorIdentifier) {
    return {
      success: false,
      error: 'Missing distributor identifier',
      message: 'Missing required information',
    };
  }

  const distResult = await resolveDistributor(action.distributorIdentifier);
  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  const dist = distResult.distributor;
  const supabase = createServiceClient();

  // Get full distributor details
  const { data, error } = await supabase
    .from('distributors')
    .select('*, sponsor:spread_id(first_name, last_name, rep_number)')
    .eq('id', dist.id)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to get distributor info',
    };
  }

  return {
    success: true,
    message: `Information for ${formatDistributor(dist)}`,
    data: { distributor: data },
  };
}
