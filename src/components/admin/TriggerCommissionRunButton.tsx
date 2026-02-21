'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TriggerCommissionRunButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleTriggerRun = async () => {
    if (!confirm(`Are you sure you want to run commissions for ${monthYear}? This will calculate all commissions and create a payout batch.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/commissions/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month_year: monthYear }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to run commissions');
      }

      const result = await response.json();
      alert(`Commission run completed!\n\n${JSON.stringify(result.stats, null, 2)}`);

      router.refresh();
      setIsOpen(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
      >
        🔄 Run Monthly Commissions
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Run Monthly Commissions</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Month
              </label>
              <input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                This will:
              </p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                <li>Snapshot all BV totals for {monthYear}</li>
                <li>Evaluate and update distributor ranks</li>
                <li>Calculate all 16 commission types</li>
                <li>Create a payout batch for review</li>
                <li>Lock BV snapshots (cannot be changed)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. Make sure all orders for {monthYear} are finalized before running.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerRun}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Running...' : 'Run Commissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
