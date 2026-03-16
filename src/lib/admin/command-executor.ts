// =============================================
// Command Executor Service
// Executes validated AI commands by calling existing API endpoints
// =============================================

import { resolveDistributor, resolveSponsor, formatDistributor, canBeSponsor, type ResolvedDistributor } from './entity-resolver';
import { createServiceClient } from '@/lib/supabase/service';
import { executeDatabaseQuery, getCompleteDistributorData, type DatabaseQueryAction } from './ai-database-access';

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
  // Database query fields
  table?: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
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

      case 'query_database':
        return await executeDatabaseQuery(action as unknown as DatabaseQueryAction);

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
  const supabase = createServiceClient();

  switch (action.action) {
    case 'suspend': {
      const reason = action.reason || 'Suspended via AI Assistant';

      const { error } = await supabase
        .from('distributors')
        .update({
          status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspended_by: adminId,
          suspension_reason: reason,
        })
        .eq('id', dist.id);

      if (error) {
        return {
          success: false,
          error: error.message,
          message: 'Suspend failed',
        };
      }

      // Log activity
      await supabase.from('distributor_activity_log').insert({
        distributor_id: dist.id,
        action: 'suspended',
        details: { reason, suspended_by_admin: adminId },
      });

      return {
        success: true,
        message: `Successfully suspended ${formatDistributor(dist)}`,
        data: { distributor: dist, action: 'suspend', reason },
      };
    }

    case 'activate': {
      const { error } = await supabase
        .from('distributors')
        .update({
          status: 'active',
          suspended_at: null,
          suspended_by: null,
          suspension_reason: null,
        })
        .eq('id', dist.id);

      if (error) {
        return {
          success: false,
          error: error.message,
          message: 'Activate failed',
        };
      }

      // Log activity
      await supabase.from('distributor_activity_log').insert({
        distributor_id: dist.id,
        action: 'activated',
        details: { activated_by_admin: adminId },
      });

      return {
        success: true,
        message: `Successfully activated ${formatDistributor(dist)}`,
        data: { distributor: dist, action: 'activate' },
      };
    }

    case 'delete': {
      const { error } = await supabase
        .from('distributors')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_by: adminId,
        })
        .eq('id', dist.id);

      if (error) {
        return {
          success: false,
          error: error.message,
          message: 'Delete failed',
        };
      }

      // Log activity
      await supabase.from('distributor_activity_log').insert({
        distributor_id: dist.id,
        action: 'deleted',
        details: { deleted_by_admin: adminId },
      });

      return {
        success: true,
        message: `Successfully deleted ${formatDistributor(dist)}`,
        data: { distributor: dist, action: 'delete' },
      };
    }

    default:
      return {
        success: false,
        error: 'Invalid action',
        message: 'Unknown action',
      };
  }
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
  const newEmail = action.newEmail;
  const oldEmail = dist.email;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return {
      success: false,
      error: 'Invalid email format',
      message: 'Email change failed',
    };
  }

  const supabase = createServiceClient();

  // Check if email already in use
  const { data: existingDist } = await supabase
    .from('distributors')
    .select('id')
    .eq('email', newEmail)
    .neq('id', dist.id)
    .single();

  if (existingDist) {
    return {
      success: false,
      error: 'This email address is already in use',
      message: 'Email change failed',
    };
  }

  // Check if distributor has auth_user_id
  if (!dist.auth_user_id) {
    return {
      success: false,
      error: 'Distributor is not linked to an authentication account',
      message: 'Email change failed',
    };
  }

  // Update email in Supabase Auth
  const { error: authError } = await supabase.auth.admin.updateUserById(
    dist.auth_user_id,
    {
      email: newEmail,
      email_confirm: true,
    }
  );

  if (authError) {
    return {
      success: false,
      error: `Failed to update email in authentication system: ${authError.message}`,
      message: 'Email change failed',
    };
  }

  // Update email in distributors table
  const { error: dbError } = await supabase
    .from('distributors')
    .update({ email: newEmail })
    .eq('id', dist.id);

  if (dbError) {
    // Try to rollback auth change
    await supabase.auth.admin.updateUserById(dist.auth_user_id, {
      email: oldEmail,
    });
    return {
      success: false,
      error: 'Failed to update email in database',
      message: 'Email change failed',
    };
  }

  // Log the change
  await supabase.from('distributor_activity_log').insert({
    distributor_id: dist.id,
    action: 'email_changed',
    details: {
      old_email: oldEmail,
      new_email: newEmail,
      changed_by_admin: true,
      admin_id: adminId,
    },
  });

  return {
    success: true,
    message: `Successfully changed email from ${oldEmail} to ${newEmail}`,
    data: { distributor: dist, oldEmail, newEmail },
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

  // Check if multiple matches were found
  if (!distResult.success && distResult.matches && distResult.matches.length > 0) {
    const matchList = distResult.matches
      .map((d, i) => `${i + 1}. ${formatDistributor(d)}`)
      .join('\n');

    return {
      success: true,
      message: `Found ${distResult.matches.length} distributors matching "${action.distributorIdentifier}":\n\n${matchList}\n\nPlease specify which one by using their rep number or email.`,
      data: { matches: distResult.matches },
    };
  }

  if (!distResult.success || !distResult.distributor) {
    return {
      success: false,
      error: distResult.error,
      message: 'Could not find distributor',
    };
  }

  // Use the comprehensive database query function
  return await getCompleteDistributorData(distResult.distributor.id);
}
