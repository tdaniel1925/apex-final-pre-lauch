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

  // Debug logging
  console.log('Matrix Stats:', JSON.stringify(stats, null, 2));
  console.log('Level Data:', JSON.stringify(levelData, null, 2));

  return (
    <div className="p-8">
      {/* Debug Info */}
      <div className="mb-4 bg-yellow-50 border border-yellow-200 p-4 rounded text-xs">
        <p><strong>Debug Info:</strong></p>
        <p>Stats: {JSON.stringify(stats)}</p>
        <p>Level {selectedLevel} filled: {levelData.filledPositions}/{levelData.totalPositions}</p>
      </div>

      <MatrixView stats={stats} initialLevel={selectedLevel} initialLevelData={levelData} />
    </div>
  );
}
