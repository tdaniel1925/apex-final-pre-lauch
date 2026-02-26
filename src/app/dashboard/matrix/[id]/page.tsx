// =============================================
// Matrix Detail Page
// View any distributor's matrix structure
// =============================================

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';
import SponsorLineageUser from '@/components/dashboard/SponsorLineageUser';
import MatrixChildrenUser from '@/components/dashboard/MatrixChildrenUser';

export const metadata = {
  title: 'Matrix View - Apex Affinity Group',
  description: 'View matrix placement',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MatrixDetailPage({ params }: PageProps) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  // Get the distributor we're viewing
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('id', id)
    .single();

  if (!distributor) {
    redirect('/dashboard/matrix');
  }

  const dist = distributor as Distributor;

  // Get current user's distributor (for navigation context)
  const { data: currentUserDist } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

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
  let parentId: string | null = null;
  if (dist.matrix_parent_id) {
    const { data: parent } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name, slug')
      .eq('id', dist.matrix_parent_id)
      .single();

    if (parent) {
      parentName = `${parent.first_name} ${parent.last_name}`;
      parentId = parent.id;
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

  const isViewingSelf = currentUserDist?.id === dist.id;

  return (
    <div className="p-4">
      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/dashboard/matrix" className="text-blue-600 hover:text-blue-800 font-medium">
          Your Matrix
        </Link>
        {!isViewingSelf && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">
              {dist.first_name} {dist.last_name}'s Matrix
            </span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4">
        <h1 className="text-2xl font-bold">
          {isViewingSelf ? 'Your Matrix View' : `${dist.first_name} ${dist.last_name}'s Matrix`}
        </h1>
        <p className="text-sm text-purple-100 mt-1">
          {isViewingSelf
            ? 'Your position in the 5×7 forced matrix'
            : `Viewing ${dist.first_name}'s position and downline`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - Stats */}
        <div className="space-y-3">
          {/* Matrix Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg shadow p-3">
              <p className="text-xs text-gray-600 mb-0.5">Rep #</p>
              <p className="text-2xl font-bold text-[#2B4C7E]">#{dist.rep_number ?? 'N/A'}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <p className="text-xs text-gray-600 mb-0.5">Level</p>
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
            {parentId ? (
              <Link
                href={`/dashboard/matrix/${parentId}`}
                className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="w-10 h-10 bg-[#2B4C7E] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {parentName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-600">Matrix Parent</p>
                  <p className="text-sm font-semibold text-gray-900">{parentName}</p>
                  <p className="text-[10px] text-blue-600">Click to view their matrix →</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#2B4C7E] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <div>
                  <p className="text-xs text-gray-600">Matrix Parent</p>
                  <p className="text-sm font-semibold text-gray-900">{parentName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Back Navigation */}
          {!isViewingSelf && (
            <Link
              href="/dashboard/matrix"
              className="block bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors"
            >
              <p className="text-sm font-semibold text-blue-800">
                ← Back to Your Matrix
              </p>
            </Link>
          )}
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

          {/* Help Text */}
          {children.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-800">
                <strong>💡 Tip:</strong> Click on any team member above to view their matrix and see deeper levels of your organization.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
