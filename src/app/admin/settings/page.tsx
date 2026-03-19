// =============================================
// Admin Settings Page
// Database-backed system configuration
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/admin/SettingsClient';

export const metadata = {
  title: 'Settings — Apex Admin',
};

export const revalidate = 0; // Always fetch fresh settings

export default async function AdminSettingsPage() {
  await requireAdmin();

  const supabase = await createClient();

  // Fetch all settings
  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true });

  if (error) {
    console.error('Error fetching settings:', error);
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Settings</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  // Define proper type for settings
  type Setting = {
    id: string;
    category: string;
    key: string;
    value: string | null;
    value_type: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';
    is_secret: boolean;
    description: string | null;
    created_at: string;
    updated_at: string;
  };

  // Group settings by category
  const settingsByCategory: Record<string, Setting[]> = {};
  settings?.forEach((setting) => {
    if (!settingsByCategory[setting.category]) {
      settingsByCategory[setting.category] = [];
    }
    settingsByCategory[setting.category].push(setting as Setting);
  });

  return <SettingsClient settingsByCategory={settingsByCategory} />;
}
