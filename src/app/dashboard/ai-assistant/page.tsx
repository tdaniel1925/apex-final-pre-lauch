// =============================================
// AI Assistant Dashboard Page - Simplified
// =============================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import AIAssistantClient from './AIAssistantClient';

export default async function AIAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor and check Business Center access
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/dashboard');
  }

  // Check Business Center subscription status
  const businessCenterStatus = await checkBusinessCenterSubscription(distributor.id);

  // Determine if user has access (subscription OR in grace/soft period)
  const hasAccess = businessCenterStatus.hasSubscription ||
                    businessCenterStatus.nagLevel === 'none' ||
                    businessCenterStatus.nagLevel === 'soft';

  return (
    <FeatureGate
      featurePath="/dashboard/ai-assistant"
      hasAccess={hasAccess}
      daysWithout={businessCenterStatus.daysWithout}
    >
      <AIAssistantClient />
    </FeatureGate>
  );
}
