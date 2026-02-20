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

    // Find top recruiter (distributor with most direct recruits)
    const { data: allDistributors } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name, matrix_parent_id')
      .neq('status', 'suspended');

    // Count recruits for each distributor
    const recruitCounts = new Map<string, number>();
    allDistributors?.forEach(d => {
      if (d.matrix_parent_id) {
        recruitCounts.set(d.matrix_parent_id, (recruitCounts.get(d.matrix_parent_id) || 0) + 1);
      }
    });

    // Find distributor with highest count
    let topRecruiterId: string | null = null;
    let maxRecruits = 0;
    recruitCounts.forEach((count, id) => {
      if (count > maxRecruits) {
        maxRecruits = count;
        topRecruiterId = id;
      }
    });

    // Get top recruiter's name
    let topRecruiterName = null;
    let topRecruiterCount = 0;
    if (topRecruiterId && maxRecruits > 0) {
      const topDist = allDistributors?.find(d => d.id === topRecruiterId);
      if (topDist) {
        topRecruiterName = `${topDist.first_name} ${topDist.last_name}`;
        topRecruiterCount = maxRecruits;
      }
    }

    return (
      <div className="px-4 md:px-8 pt-4 md:pt-6">
        <Road500BannerClient
          totalAgents={totalAgents ?? 0}
          personalRecruit={personalRecruit}
          goal={500}
          topRecruiterName={topRecruiterName}
          topRecruiterCount={topRecruiterCount}
        />
      </div>
    );
  } catch {
    // Never break the dashboard over the banner
    return null;
  }
}
