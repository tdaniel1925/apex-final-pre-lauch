// ============================================================
// Road500Banner — server component
// Fetches total agent count + user's personal recruits,
// passes to animated client component
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import Road500BannerClient from './Road500BannerClient';

export default async function Road500Banner() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const serviceClient = createServiceClient();

    // Total active agents in the business
    const { count: totalAgents } = await serviceClient
      .from('distributors')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'suspended');

    // Current user's distributor record
    const { data: me } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    // Personal recruits = people who have this rep as their matrix parent
    let personalRecruit = 0;
    if (me) {
      const { count } = await serviceClient
        .from('distributors')
        .select('id', { count: 'exact', head: true })
        .eq('matrix_parent_id', me.id);
      personalRecruit = count ?? 0;
    }

    return (
      <div className="px-4 md:px-8 pt-4 md:pt-6">
        <Road500BannerClient
          totalAgents={totalAgents ?? 0}
          personalRecruit={personalRecruit}
          goal={500}
        />
      </div>
    );
  } catch {
    // Never break the dashboard over the banner
    return null;
  }
}
