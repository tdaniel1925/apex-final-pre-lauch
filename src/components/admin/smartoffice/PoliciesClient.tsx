'use client';

/**
 * SmartOffice Policies Client Component
 * Placeholder - Full implementation needed
 */

export default function PoliciesClient({
  initialPage,
  initialSearch,
  initialCarrier,
  initialSortBy,
  initialSortOrder,
}: {
  initialPage: number;
  initialSearch: string;
  initialCarrier: string;
  initialSortBy: string;
  initialSortOrder: 'asc' | 'desc';
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
      <p className="text-slate-600">
        Policies page - Full implementation coming soon.
        API routes are ready at /api/admin/smartoffice/policies
      </p>
    </div>
  );
}
