// =============================================
// Settings Page - Complete Rebuild
// Professional account settings and preferences
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const metadata = {
  title: 'Settings - Apex Affinity Group',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
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
    .select('slug, email, first_name, last_name')
    .eq('auth_user_id', user.id)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theapexway.net';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account preferences and security settings
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Tabbed Content */}
        <Tabs defaultValue="account">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your basic account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Name</p>
                      <p className="text-slate-900 mt-1">
                        {distributor?.first_name} {distributor?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email Address</p>
                      <p className="text-slate-900 mt-1">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Primary email for account notifications and login
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Account Created</p>
                      <p className="text-slate-900 mt-1">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Preferences</CardTitle>
                  <CardDescription>Control what emails you receive from us</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Commission Notifications</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Get notified when commissions are processed
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Team Activity Updates</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Receive updates about your team growth and milestones
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">New Referral Alerts</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Get notified when someone joins your organization
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Marketing Communications</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Receive news, tips, and promotional offers
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Email preference management will be available soon. Contact support to
                        update your preferences.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Receive notifications via email
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">SMS Notifications</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Receive important alerts via text message
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Advanced notification settings coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Preference */}
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>Choose your preferred language and regional settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">Language</p>
                      <select
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 opacity-50 cursor-not-allowed"
                      >
                        <option>English (US)</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">Time Zone</p>
                      <select
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 opacity-50 cursor-not-allowed"
                      >
                        <option>America/Chicago (Central Time)</option>
                      </select>
                    </div>
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Multi-language support coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              {/* Profile Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Visibility</CardTitle>
                  <CardDescription>Control who can see your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Show in Team Directory</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Allow other team members to see your profile in the directory
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Show Activity Status</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Let others see when you are active on the platform
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Privacy controls coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>Manage your personal data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-slate-900">Download Your Data</p>
                      <p className="text-sm text-slate-600 mt-1 mb-3">
                        Request a copy of all your personal data stored in our system
                      </p>
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
                      >
                        Request Data Export
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="font-medium text-slate-900">Delete Account Data</p>
                      <p className="text-sm text-slate-600 mt-1 mb-3">
                        Request deletion of your personal information (subject to legal requirements)
                      </p>
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
                      >
                        Request Data Deletion
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Data management features coming soon. Contact support for data requests.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Manage your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-4">
                        Keep your account secure by using a strong, unique password
                      </p>
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
                      >
                        Change Password
                      </button>
                    </div>
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Password change functionality coming soon. Use password reset if needed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Status</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Two-factor authentication is currently disabled
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Disabled
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
                      >
                        Enable Two-Factor Auth
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Two-factor authentication setup coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage devices and sessions where you are logged in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Current Session</p>
                        <p className="text-sm text-slate-600 mt-1">
                          This device - Active now
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
                      >
                        Sign Out All Other Sessions
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Session management coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Additional security measures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3 border-b border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Login Alerts</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Get notified of new login attempts from unrecognized devices
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-600">
                        Advanced security features coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
