// =============================================
// Apex Compensation Plan Calculator
// Interactive calculator for earnings projections
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import CompensationCalculator from '@/components/compensation/CompensationCalculator';

export const metadata = {
  title: 'Compensation Calculator - Apex Affinity Group',
  description: 'Calculate your potential earnings with the Apex compensation plan',
};

export default async function CompensationCalculatorPage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor info
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, current_rank')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compensation Calculator</h1>
          <p className="text-gray-600">
            Calculate your potential monthly earnings based on personal sales and team activity
          </p>
        </div>

        {/* Calculator Component */}
        <CompensationCalculator
          distributorName={`${distributor.first_name} ${distributor.last_name}`}
          currentRank={distributor.current_rank || 'Starter'}
        />
      </div>
    </div>
  );
}
