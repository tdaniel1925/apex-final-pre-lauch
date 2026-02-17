// =============================================
// Matrix Page
// View matrix structure and downline
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';

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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Matrix View</h1>
        <p className="text-gray-600 mt-1">Your position in the 5×7 forced matrix</p>
      </div>

      {/* Matrix Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Your Position</p>
          <p className="text-3xl font-bold text-[#2B4C7E]">#{dist.matrix_position}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Your Level</p>
          <p className="text-3xl font-bold text-[#2B4C7E]">{dist.matrix_depth}</p>
          <p className="text-xs text-gray-500 mt-1">of 7 levels</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Direct Downline</p>
          <p className="text-3xl font-bold text-[#2B4C7E]">{totalDownline}</p>
          <p className="text-xs text-gray-500 mt-1">
            {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Capacity</p>
          <p className="text-3xl font-bold text-[#2B4C7E]">
            {totalDownline}/{capacity}
          </p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#2B4C7E] h-2 rounded-full transition-all"
              style={{ width: `${(totalDownline / capacity) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Matrix Parent */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Matrix Placement</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2B4C7E] rounded-full flex items-center justify-center text-white font-bold">
            {parentName.charAt(0)}
          </div>
          <div>
            <p className="text-sm text-gray-600">Your Matrix Parent</p>
            <p className="text-lg font-semibold text-gray-900">{parentName}</p>
          </div>
        </div>
      </div>

      {/* Matrix Children */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Direct Downline</h2>
          <p className="text-sm text-gray-600 mt-1">
            People placed directly under you in the matrix
          </p>
        </div>

        {children.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No downline yet</h3>
            <p className="text-gray-600">
              You have {availableSlots} available {availableSlots === 1 ? 'slot' : 'slots'} in your matrix
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div key={child.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2B4C7E] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#2B4C7E] rounded-full flex items-center justify-center text-white font-bold">
                      {child.first_name.charAt(0)}
                      {child.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {child.first_name} {child.last_name}
                      </p>
                      <p className="text-sm text-gray-600">@{child.slug}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-semibold text-[#2B4C7E]">#{child.matrix_position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-semibold">{child.matrix_depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined:</span>
                      <span className="text-gray-700">
                        {new Date(child.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
