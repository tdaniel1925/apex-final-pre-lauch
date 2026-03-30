/**
 * Links-related tool implementations
 * - get_my_links
 */

import { ToolContext, ToolResult } from '../utils/types';
import { logger } from '../utils/logger';

/**
 * Get distributor's replicated site and enrollment links
 */
export async function getMyLinks(context: ToolContext): Promise<ToolResult> {
  try {
    const { distributor } = context;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theapexway.net';

    const links = {
      replicatedSite: distributor.slug ? `${baseUrl}/${distributor.slug}` : `${baseUrl}/signup`,
      enrollmentLink: distributor.slug ? `${baseUrl}/signup?sponsor=${distributor.slug}` : `${baseUrl}/signup`,
      meetingRegistrationBase: `${baseUrl}/meetings`,
    };

    logger.info('Retrieved distributor links', {
      distributorId: distributor.id,
      hasSlug: !!distributor.slug,
    });

    return {
      success: true,
      data: links,
    };
  } catch (error) {
    logger.error('Error in getMyLinks', error as Error, {
      distributorId: context.distributor.id,
    });
    return {
      success: false,
      error: 'Failed to generate links',
    };
  }
}
