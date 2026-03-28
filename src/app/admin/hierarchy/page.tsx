// =============================================
// Admin Hierarchy Canvas Page
// Interactive tree visualization of 5×7 matrix
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import HierarchyCanvasClient from './HierarchyCanvasClient';

export const metadata = {
  title: 'Hierarchy Canvas - Admin Portal',
  description: 'Interactive tree visualization of the 5×7 matrix structure',
};

interface PageProps {
  searchParams: Promise<{
    rootId?: string;
    maxDepth?: string;
  }>;
}

export default async function HierarchyPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const rootId = params.rootId || null;
  const maxDepth = parseInt(params.maxDepth || '3');

  return (
    <div className="h-screen w-full overflow-hidden">
      <HierarchyCanvasClient rootId={rootId} maxDepth={maxDepth} />
    </div>
  );
}
