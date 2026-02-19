// =============================================
// Admin Training Audio Manager
// Create and manage podcast-style training episodes
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import AdminTrainingClient from '@/components/training/AdminTrainingClient';

export const metadata = {
  title: 'Training Audio Manager - Admin',
};

export default async function AdminTrainingAudioPage() {
  await requireAdmin();

  return <AdminTrainingClient />;
}
