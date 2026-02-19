// =============================================
// Admin Waitlist Page
// View entries and fire launch emails
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import AdminWaitlistClient from '@/components/admin/AdminWaitlistClient';

export const metadata = {
  title: 'Waitlist — Apex Admin',
};

export default async function WaitlistPage() {
  await requireAdmin();

  const supabase = createServiceClient();

  const { data: entries, count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  const pending = (entries || []).filter((e) => !e.notified_at).length;
  const notified = (entries || []).filter((e) => e.notified_at).length;

  return (
    <AdminWaitlistClient
      entries={entries || []}
      total={count || 0}
      pending={pending}
      notified={notified}
    />
  );
}
