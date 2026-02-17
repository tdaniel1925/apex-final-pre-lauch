// =============================================
// Admin Matrix View Page
// Visual 5×7 matrix management
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { getMatrixStatistics, getMatrixLevel } from '@/lib/admin/matrix-manager';
import MatrixView from '@/components/admin/MatrixView';

export const metadata = {
  title: 'Matrix Management - Admin Portal',
};

interface PageProps {
  searchParams: Promise<{
    level?: string;
  }>;
}

export default async function MatrixPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const selectedLevel = parseInt(params.level || '1');

  const stats = await getMatrixStatistics();
  const levelData = await getMatrixLevel(selectedLevel);

  return (
    <div className="p-4">
      <MatrixView stats={stats} initialLevel={selectedLevel} initialLevelData={levelData} />
    </div>
  );
}
