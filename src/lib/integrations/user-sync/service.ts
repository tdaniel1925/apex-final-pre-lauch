// =============================================
// User Sync Service
// Handles automatic creation of replicated sites
// on external platforms when distributors sign up
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import type {
  PlatformIntegration,
  DistributorReplicatedSiteNew,
  CreateReplicatedSiteResult,
  Distributor,
} from '@/lib/types';

/**
 * Creates replicated sites for a distributor on all enabled platforms
 * Called after distributor creation in signup flow
 *
 * @param distributorId - UUID of the newly created distributor
 * @returns Promise<void> - Errors are logged but don't throw
 *
 * @example
 * await createReplicatedSites('distributor-uuid');
 */
export async function createReplicatedSites(distributorId: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Fetch all active integrations where sync_users=true
    const { data: integrations, error: integrationsError } = await supabase
      .from('platform_integrations')
      .select('*')
      .eq('enabled', true)
      .eq('sync_users', true);

    if (integrationsError) {
      console.error('[UserSync] Failed to fetch integrations:', integrationsError);
      return;
    }

    if (!integrations || integrations.length === 0) {
      console.log('[UserSync] No active integrations configured for user sync');
      return;
    }

    console.log(`[UserSync] Found ${integrations.length} integrations to sync for distributor ${distributorId}`);

    // Create replicated sites for each integration
    // Run sequentially to avoid overwhelming external APIs
    for (const integration of integrations) {
      try {
        const result = await createReplicatedSite(integration.id, distributorId);

        if (result.success) {
          console.log(`[UserSync] ✅ Successfully created site on ${integration.platform_display_name}: ${result.site_url}`);
        } else {
          console.error(`[UserSync] ❌ Failed to create site on ${integration.platform_display_name}:`, result.error);
        }
      } catch (error) {
        console.error(`[UserSync] ❌ Exception while creating site on ${integration.platform_display_name}:`, error);
      }
    }
  } catch (error) {
    // Log error but don't throw - signup should not fail if external platforms are down
    console.error('[UserSync] Exception in createReplicatedSites:', error);
  }
}

/**
 * Creates a single replicated site for a distributor on a specific platform
 *
 * @param integrationId - UUID of the platform integration
 * @param distributorId - UUID of the distributor
 * @returns Promise<CreateReplicatedSiteResult>
 *
 * @example
 * const result = await createReplicatedSite('integration-uuid', 'distributor-uuid');
 * if (result.success) {
 *   console.log('Site created:', result.site_url);
 * }
 */
export async function createReplicatedSite(
  integrationId: string,
  distributorId: string
): Promise<CreateReplicatedSiteResult> {
  const supabase = createServiceClient();

  try {
    // Fetch integration config
    const { data: integration, error: integrationError } = await supabase
      .from('platform_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      return {
        success: false,
        error: `Integration not found: ${integrationError?.message || 'Unknown error'}`,
      };
    }

    // Fetch distributor data
    const { data: distributor, error: distributorError } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', distributorId)
      .single();

    if (distributorError || !distributor) {
      return {
        success: false,
        error: `Distributor not found: ${distributorError?.message || 'Unknown error'}`,
      };
    }

    // Generate site URL from pattern
    const siteUrl = integration.site_url_pattern.replace('{username}', distributor.slug);

    // Check if site already exists
    const { data: existingSite } = await supabase
      .from('distributor_replicated_sites')
      .select('*')
      .eq('distributor_id', distributorId)
      .eq('integration_id', integrationId)
      .single();

    if (existingSite) {
      console.log(`[UserSync] Site already exists for ${distributor.slug} on ${integration.platform_display_name}`);
      return {
        success: true,
        site_url: existingSite.site_url,
        external_user_id: existingSite.external_user_id || undefined,
      };
    }

    // Call external platform API to create user
    const externalResult = await callExternalPlatformAPI(integration, distributor);

    // Create record in database
    const siteRecord: Partial<DistributorReplicatedSiteNew> = {
      distributor_id: distributorId,
      integration_id: integrationId,
      site_url: siteUrl,
      external_user_id: externalResult.success ? externalResult.external_user_id : null,
      external_username: distributor.slug,
      status: externalResult.success ? 'active' : 'failed',
      sync_attempts: 1,
      last_sync_attempt_at: new Date().toISOString(),
      last_sync_error: externalResult.success ? null : externalResult.error,
      activated_at: externalResult.success ? new Date().toISOString() : null,
    };

    const { error: insertError } = await supabase
      .from('distributor_replicated_sites')
      .insert(siteRecord);

    if (insertError) {
      console.error('[UserSync] Failed to insert site record:', insertError);
      return {
        success: false,
        error: `Database error: ${insertError.message}`,
      };
    }

    if (externalResult.success) {
      return {
        success: true,
        site_url: siteUrl,
        external_user_id: externalResult.external_user_id,
      };
    } else {
      return {
        success: false,
        error: externalResult.error,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[UserSync] Exception in createReplicatedSite:', error);

    // Try to record the failed attempt
    try {
      await supabase
        .from('distributor_replicated_sites')
        .insert({
          distributor_id: distributorId,
          integration_id: integrationId,
          site_url: 'pending',
          status: 'failed',
          sync_attempts: 1,
          last_sync_attempt_at: new Date().toISOString(),
          last_sync_error: errorMessage,
        });
    } catch (recordError) {
      console.error('[UserSync] Failed to record failed attempt:', recordError);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Retries failed site creations for a distributor
 * Useful for manual retries after fixing external platform issues
 *
 * @param distributorId - UUID of the distributor
 * @param integrationId - Optional: specific integration to retry (if not provided, retries all failed)
 * @returns Promise with results for each retry
 *
 * @example
 * // Retry all failed sites for a distributor
 * const results = await retryFailedSites('distributor-uuid');
 *
 * // Retry specific integration
 * const results = await retryFailedSites('distributor-uuid', 'integration-uuid');
 */
export async function retryFailedSites(
  distributorId: string,
  integrationId?: string
): Promise<CreateReplicatedSiteResult[]> {
  const supabase = createServiceClient();
  const results: CreateReplicatedSiteResult[] = [];

  try {
    // Find failed sites for this distributor
    let query = supabase
      .from('distributor_replicated_sites')
      .select('*, integration:platform_integrations(*)')
      .eq('distributor_id', distributorId)
      .eq('status', 'failed');

    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    const { data: failedSites, error: fetchError } = await query;

    if (fetchError) {
      console.error('[UserSync] Failed to fetch failed sites:', fetchError);
      return results;
    }

    if (!failedSites || failedSites.length === 0) {
      console.log('[UserSync] No failed sites to retry');
      return results;
    }

    console.log(`[UserSync] Retrying ${failedSites.length} failed sites for distributor ${distributorId}`);

    // Retry each failed site
    for (const site of failedSites) {
      // Check if max retry attempts exceeded
      const integration = site.integration as PlatformIntegration;
      if (site.sync_attempts >= integration.max_retry_attempts) {
        console.log(`[UserSync] Max retry attempts (${integration.max_retry_attempts}) exceeded for site ${site.id}`);
        results.push({
          success: false,
          error: `Max retry attempts exceeded`,
        });
        continue;
      }

      // Fetch distributor data
      const { data: distributor, error: distributorError } = await supabase
        .from('distributors')
        .select('*')
        .eq('id', distributorId)
        .single();

      if (distributorError || !distributor) {
        results.push({
          success: false,
          error: `Distributor not found`,
        });
        continue;
      }

      // Attempt to create the site
      const externalResult = await callExternalPlatformAPI(integration, distributor);

      // Update the site record
      const updateData: Partial<DistributorReplicatedSiteNew> = {
        status: externalResult.success ? 'active' : 'failed',
        sync_attempts: site.sync_attempts + 1,
        last_sync_attempt_at: new Date().toISOString(),
        last_sync_error: externalResult.success ? null : externalResult.error,
        external_user_id: externalResult.success ? externalResult.external_user_id : site.external_user_id,
        activated_at: externalResult.success ? new Date().toISOString() : site.activated_at,
      };

      const { error: updateError } = await supabase
        .from('distributor_replicated_sites')
        .update(updateData)
        .eq('id', site.id);

      if (updateError) {
        console.error('[UserSync] Failed to update site record:', updateError);
      }

      results.push({
        success: externalResult.success,
        site_url: site.site_url,
        external_user_id: externalResult.external_user_id,
        error: externalResult.error,
      });
    }

    return results;
  } catch (error) {
    console.error('[UserSync] Exception in retryFailedSites:', error);
    return results;
  }
}

/**
 * Calls the external platform API to create a user
 * Handles different authentication types and API formats
 *
 * @param integration - Platform integration configuration
 * @param distributor - Distributor data
 * @returns Promise with success status and external user ID or error
 */
async function callExternalPlatformAPI(
  integration: PlatformIntegration,
  distributor: Distributor
): Promise<{ success: boolean; external_user_id?: string; error?: string }> {
  try {
    // Prepare request headers based on auth type
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (integration.auth_type === 'bearer' && integration.api_key_encrypted) {
      // In production, decrypt the API key
      // For now, use as-is (assuming it's stored in plain text in development)
      headers['Authorization'] = `Bearer ${integration.api_key_encrypted}`;
    } else if (integration.auth_type === 'api_key' && integration.api_key_encrypted) {
      headers['X-API-Key'] = integration.api_key_encrypted;
    } else if (integration.auth_type === 'basic' && integration.api_key_encrypted && integration.api_secret_encrypted) {
      const credentials = Buffer.from(
        `${integration.api_key_encrypted}:${integration.api_secret_encrypted}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    // Prepare request body
    const requestBody = {
      username: distributor.slug,
      email: distributor.email,
      first_name: distributor.first_name,
      last_name: distributor.last_name,
      company_name: distributor.company_name,
      phone: distributor.phone,
      // Add any additional fields from integration config
      ...integration.config,
    };

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(integration.api_endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[UserSync] External API error (${response.status}):`, errorText);

      return {
        success: false,
        error: `External API error (${response.status}): ${errorText.substring(0, 200)}`,
      };
    }

    const responseData = await response.json();

    // Extract external user ID from response
    // Try common field names
    const externalUserId =
      responseData.user_id ||
      responseData.userId ||
      responseData.id ||
      responseData.data?.id ||
      'unknown';

    return {
      success: true,
      external_user_id: String(externalUserId),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout (30s)',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

/**
 * Gets all replicated sites for a distributor
 *
 * @param distributorId - UUID of the distributor
 * @returns Promise with array of sites with integration details
 */
export async function getDistributorReplicatedSites(distributorId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('distributor_replicated_sites')
    .select(`
      *,
      integration:platform_integrations(*)
    `)
    .eq('distributor_id', distributorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[UserSync] Failed to fetch replicated sites:', error);
    return { data: null, error };
  }

  return { data, error: null };
}
