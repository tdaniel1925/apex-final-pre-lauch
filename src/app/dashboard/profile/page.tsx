// =============================================
// Profile Page - Complete Rebuild
// Professional tabbed layout with compensation stats
// =============================================

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone } from 'lucide-react';
import ProfileEditForm from '@/components/dashboard/ProfileEditForm';

export const metadata = {
  title: 'Profile - Apex Affinity Group',
  description: 'Manage your profile and view compensation statistics',
};

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Rank display names
const TECH_RANK_NAMES: Record<string, string> = {
  starter: 'Starter',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  ruby: 'Ruby',
  diamond: 'Diamond',
  crown: 'Crown',
  elite: 'Elite',
};

const INSURANCE_RANK_NAMES: Record<string, string> = {
  inactive: 'Not Licensed',
  associate: 'Associate',
  manager: 'Manager',
  director: 'Director',
  senior_director: 'Senior Director',
  executive_director: 'Executive Director',
  mga: 'MGA',
};

// Rank badge colors
function getTechRankColor(rank: string): string {
  const colors: Record<string, string> = {
    starter: 'bg-slate-100 text-slate-800',
    bronze: 'bg-amber-700 text-white',
    silver: 'bg-slate-400 text-white',
    gold: 'bg-yellow-500 text-slate-900',
    platinum: 'bg-slate-700 text-white',
    ruby: 'bg-red-600 text-white',
    diamond: 'bg-blue-500 text-white',
    crown: 'bg-purple-600 text-white',
    elite: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-900',
  };
  return colors[rank] || 'bg-slate-200 text-slate-800';
}

function getInsuranceRankColor(rank: string): string {
  const colors: Record<string, string> = {
    inactive: 'bg-slate-200 text-slate-600',
    associate: 'bg-blue-100 text-blue-800',
    manager: 'bg-blue-500 text-white',
    director: 'bg-indigo-600 text-white',
    senior_director: 'bg-purple-600 text-white',
    executive_director: 'bg-violet-700 text-white',
    mga: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
  };
  return colors[rank] || 'bg-slate-200 text-slate-800';
}

export default async function ProfilePage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get full profile with service client
  const serviceClient = createServiceClient();

  const { data: distributor, error: distError } = await serviceClient
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        tech_rank,
        highest_tech_rank,
        insurance_rank,
        highest_insurance_rank,
        personal_credits_monthly,
        team_credits_monthly,
        tech_personal_credits_monthly,
        tech_team_credits_monthly,
        insurance_personal_credits_monthly,
        insurance_team_credits_monthly,
        override_qualified,
        tech_rank_achieved_date,
        insurance_rank_achieved_date
      ),
      tax_info:distributor_tax_info!distributor_tax_info_distributor_id_fkey (
        ssn_last_4
      )
    `)
    .eq('auth_user_id', user.id)
    .single();

  if (distError || !distributor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-900 font-semibold">Profile Not Found</p>
          <p className="mt-2 text-slate-600">No distributor profile found for this user.</p>
        </div>
      </div>
    );
  }

  // Get member data
  const member = Array.isArray(distributor.member) ? distributor.member[0] : distributor.member;
  const taxInfo = Array.isArray(distributor.tax_info) ? distributor.tax_info[0] : distributor.tax_info;

  // Get lifetime earnings
  let lifetimeEarnings = 0;
  if (member?.member_id) {
    const { data: allEarnings } = await serviceClient
      .from('earnings_ledger')
      .select('amount_usd')
      .eq('member_id', member.member_id)
      .eq('status', 'approved');

    lifetimeEarnings = allEarnings?.reduce((sum, e) => sum + (e.amount_usd || 0), 0) || 0;
  }

  // Get user initials for avatar fallback
  const initials = `${distributor.first_name?.[0] || ''}${distributor.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            View your account information and compensation statistics
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Profile Header Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <Avatar size="lg" className="size-20 sm:size-24">
                {distributor.profile_photo_url ? (
                  <AvatarImage src={distributor.profile_photo_url} alt={`${distributor.first_name} ${distributor.last_name}`} />
                ) : null}
                <AvatarFallback className="text-lg sm:text-xl">{initials}</AvatarFallback>
              </Avatar>

              {/* Header Info */}
              <div className="flex-1 w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {distributor.first_name} {distributor.last_name}
                </h2>
                <p className="text-slate-600 mt-1">Rep #{distributor.rep_number || 'Pending'}</p>

                {/* Rank Badges */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                  {member && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Tech Rank</p>
                        <Badge className={getTechRankColor(member.tech_rank)}>
                          {TECH_RANK_NAMES[member.tech_rank] || member.tech_rank}
                        </Badge>
                      </div>
                      {distributor.is_licensed_agent && member.insurance_rank !== 'inactive' && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Insurance Rank</p>
                          <Badge className={getInsuranceRankColor(member.insurance_rank)}>
                            {INSURANCE_RANK_NAMES[member.insurance_rank] || member.insurance_rank}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 text-sm text-slate-600">
                  <p>Member Since: {formatDate(distributor.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apex Voice Agent Card */}
        {distributor.ai_phone_number && (
          <Card className="mb-4 sm:mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-slate-900">Apex Voice Agent</CardTitle>
              </div>
              <CardDescription>Your 24/7 AI-powered phone assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Phone Number Display */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Your AI Phone Number</label>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {distributor.ai_phone_number}
                  </p>
                </div>

                {/* Subscription Status */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Subscription</label>
                  <div className="mt-1">
                    {distributor.business_center_tier === 'free' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-200 text-slate-700">
                        FREE Tier (Apex Only)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-600 text-white">
                        PAID Tier (Customizable)
                      </span>
                    )}
                  </div>
                </div>

                {/* Customize Link (PAID tier only) */}
                {distributor.business_center_tier !== 'free' && (
                  <div>
                    <Link
                      href="/dashboard/ai-assistant?customize=voice"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                    >
                      Customize Voice Agent
                    </Link>
                  </div>
                )}

                {/* Info */}
                <div className="pt-4 border-t border-purple-200">
                  <p className="text-sm text-slate-600">
                    💡 <strong>Owner Mode:</strong> Call your own number to hear your personalized welcome. <br/>
                    📞 <strong>Prospect Mode:</strong> When others call, your agent handles inquiries 24/7 and sends you SMS notifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed Content */}
        <Tabs defaultValue="personal">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="compensation">Compensation Stats</TabsTrigger>
            <TabsTrigger value="banking">Banking Info</TabsTrigger>
            <TabsTrigger value="tax">Tax Info</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <ProfileEditForm distributor={distributor} userEmail={distributor.email} />
          </TabsContent>

          {/* Compensation Stats Tab */}
          <TabsContent value="compensation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tech Ladder Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Tech Ladder</CardTitle>
                  <CardDescription>Technology products performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Current Rank</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {member ? TECH_RANK_NAMES[member.tech_rank] : 'N/A'}
                      </p>
                      {member?.tech_rank_achieved_date && (
                        <p className="text-xs text-slate-500 mt-1">
                          Achieved {formatDate(member.tech_rank_achieved_date)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Highest Rank Achieved</p>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {member ? TECH_RANK_NAMES[member.highest_tech_rank] : 'N/A'}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-500">Credits This Month</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-slate-500">Personal</p>
                          <p className="text-lg font-bold text-slate-900">
                            {member?.tech_personal_credits_monthly || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Team</p>
                          <p className="text-lg font-bold text-slate-900">
                            {member?.tech_team_credits_monthly || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Ladder Stats */}
              {distributor.is_licensed_agent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Insurance Ladder</CardTitle>
                    <CardDescription>Insurance products performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Current Rank</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {member ? INSURANCE_RANK_NAMES[member.insurance_rank] : 'N/A'}
                        </p>
                        {member?.insurance_rank_achieved_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            Achieved {formatDate(member.insurance_rank_achieved_date)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Highest Rank Achieved</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {member ? INSURANCE_RANK_NAMES[member.highest_insurance_rank] : 'N/A'}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm font-medium text-slate-500">Credits This Month</p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-slate-500">Personal</p>
                            <p className="text-lg font-bold text-slate-900">
                              {member?.insurance_personal_credits_monthly || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Team</p>
                            <p className="text-lg font-bold text-slate-900">
                              {member?.insurance_team_credits_monthly || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Stats */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                  <CardDescription>Combined statistics across all product lines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Lifetime Earnings</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {formatCurrency(lifetimeEarnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Override Qualified</p>
                      <p className="text-2xl font-bold mt-1">
                        {member?.override_qualified ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {member?.override_qualified
                          ? '50+ personal credits/month'
                          : 'Need 50+ personal credits/month'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Credits This Month</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {member?.personal_credits_monthly || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banking Info Tab */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle>Banking Information</CardTitle>
                <CardDescription>ACH details for commission payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {distributor.bank_name ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Bank Name</p>
                        <p className="text-slate-900 mt-1">{distributor.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Routing Number</p>
                        <p className="text-slate-900 mt-1">
                          {distributor.bank_routing_number
                            ? `****${distributor.bank_routing_number.slice(-4)}`
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Account Number</p>
                        <p className="text-slate-900 mt-1">
                          {distributor.bank_account_number
                            ? `****${distributor.bank_account_number.slice(-4)}`
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Account Type</p>
                        <p className="text-slate-900 mt-1 capitalize">
                          {distributor.bank_account_type || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Verification Status</p>
                        <p className="mt-1">
                          {distributor.ach_verified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">Pending Verification</Badge>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No banking information on file</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Contact support to add your banking details
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Info Tab */}
          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>Tax ID for 1099 reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxInfo?.ssn_last_4 ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Tax ID Type</p>
                        <p className="text-slate-900 mt-1">Social Security Number</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">SSN (Last 4 Digits)</p>
                        <p className="text-slate-900 mt-1 font-mono">XXX-XX-{taxInfo.ssn_last_4}</p>
                      </div>
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600">
                          For security reasons, only the last 4 digits of your SSN are displayed.
                          Full SSN is encrypted and only accessible to authorized administrators
                          for tax reporting purposes.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No tax information on file</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Contact support to add your tax information
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
