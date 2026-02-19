// =============================================
// Matrix Page
// View matrix structure and downline
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import SponsorLineageUser from '@/components/dashboard/SponsorLineageUser';
import MatrixChildrenUser from '@/components/dashboard/MatrixChildrenUser';

export const metadata = {
  title: 'Matrix - Apex Affinity Group',
  description: 'View your matrix placement',
};

export default async function MatrixPage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  const dist = distributor as Distributor;

  // Get sponsor path (traverse up to master)
  const sponsorPath: Distributor[] = [];
  let currentSponsorId = dist.sponsor_id;

  while (currentSponsorId) {
    const { data: sponsor } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', currentSponsorId)
      .single();

    if (!sponsor) break;

    sponsorPath.unshift(sponsor as Distributor);
    currentSponsorId = sponsor.sponsor_id;
  }

  // Get matrix parent
  let parentName = 'Master';
  if (dist.matrix_parent_id) {
    const { data: parent } = await serviceClient
      .from('distributors')
      .select('first_name, last_name, slug')
      .eq('id', dist.matrix_parent_id)
      .single();

    if (parent) {
      parentName = `${parent.first_name} ${parent.last_name}`;
    }
  }

  // Get matrix children (direct downline in matrix)
  const { data: matrixChildren } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', dist.id)
    .order('matrix_position', { ascending: true });

  const children = (matrixChildren || []) as Distributor[];

  // Calculate matrix stats
  const totalDownline = children.length;
  const capacity = 5;
  const availableSlots = capacity - totalDownline;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Matrix View</h1>
        <p className="text-sm text-gray-600 mt-1">Your position in the 5×7 forced matrix</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - Stats */}
        <div className="space-y-3">
          {/* Matrix Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg shadow p-3">
              <p className="text-xs text-gray-600 mb-0.5">Your Rep #</p>
              <p className="text-2xl font-bold text-[#2B4C7E]">#{dist.rep_number ?? 'N/A'}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <p className="text-xs text-gray-600 mb-0.5">Your Level</p>
              <p className="text-2xl font-bold text-[#2B4C7E]">{dist.matrix_depth}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">of 7 levels</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <p className="text-xs text-gray-600 mb-0.5">Direct Downline</p>
              <p className="text-2xl font-bold text-[#2B4C7E]">{totalDownline}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <p className="text-xs text-gray-600 mb-0.5">Capacity</p>
              <p className="text-2xl font-bold text-[#2B4C7E]">
                {totalDownline}/{capacity}
              </p>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#2B4C7E] h-2 rounded-full transition-all"
                  style={{ width: `${(totalDownline / capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matrix Parent */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Matrix Placement</h2>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2B4C7E] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {parentName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-600">Your Matrix Parent</p>
                <p className="text-sm font-semibold text-gray-900">{parentName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Lineage & Matrix */}
        <div className="lg:col-span-2 space-y-3">
          {/* Sponsor Lineage */}
          <SponsorLineageUser
            sponsorPath={sponsorPath}
            currentUser={{
              first_name: dist.first_name,
              last_name: dist.last_name,
              slug: dist.slug,
            }}
          />

          {/* Matrix Children */}
          <MatrixChildrenUser children={children} />
        </div>
      </div>
    </div>
  );
}
