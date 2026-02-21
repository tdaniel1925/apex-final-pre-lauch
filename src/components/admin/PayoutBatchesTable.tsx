'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PayoutBatch {
  id: string;
  batch_number: string;
  month_year: string;
  payout_type: string;
  distributor_count: number;
  total_amount_cents: number;
  status: string;
  payout_ratio?: number;
  safeguard_flags?: string[];
  created_at: string;
  approved_at?: string;
  approved_by_admin?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PayoutBatchesTableProps {
  batches: PayoutBatch[];
}

export function PayoutBatchesTable({ batches }: PayoutBatchesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      pending_review: 'bg-orange-100 text-orange-700',
      approved: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500',
    };

    const label = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {label}
      </span>
    );
  };

  const handleApproveBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to approve this payout batch? This will begin processing payments.')) {
      return;
    }

    setLoading(batchId);

    try {
      const response = await fetch(`/api/admin/payouts/${batchId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve batch');
      }

      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateACH = async (batchId: string) => {
    setLoading(batchId);

    try {
      const response = await fetch(`/api/admin/payouts/${batchId}/generate-ach`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate ACH file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payout_${batchId}.ach`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleViewDetails = (batchId: string) => {
    router.push(`/admin/payouts/${batchId}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Batch
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Distributors
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Safeguards
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{batch.batch_number}</p>
                    <p className="text-xs text-gray-500">{formatDate(batch.created_at)}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {batch.month_year}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600 capitalize">
                    {batch.payout_type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {batch.distributor_count.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(batch.total_amount_cents)}
                  </p>
                  {batch.payout_ratio && (
                    <p className="text-xs text-gray-500">
                      {(batch.payout_ratio * 100).toFixed(1)}% payout ratio
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(batch.status)}
                </td>
                <td className="px-4 py-3">
                  {batch.safeguard_flags && batch.safeguard_flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {batch.safeguard_flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-50 text-red-700"
                        >
                          ⚠️ {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-green-600">✓ All clear</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDetails(batch.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>

                    {batch.status === 'pending_review' && (
                      <button
                        onClick={() => handleApproveBatch(batch.id)}
                        disabled={loading === batch.id}
                        className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                      >
                        {loading === batch.id ? 'Approving...' : 'Approve'}
                      </button>
                    )}

                    {batch.status === 'approved' && (
                      <button
                        onClick={() => handleGenerateACH(batch.id)}
                        disabled={loading === batch.id}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                      >
                        {loading === batch.id ? 'Generating...' : 'ACH File'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {batches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No payout batches found</p>
            <p className="text-xs text-gray-400 mt-1">
              Run a commission calculation to create a new batch
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
