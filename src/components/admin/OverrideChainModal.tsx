'use client';

// =============================================
// Override Chain Modal
// Visualizes commission override chain for transparency
// =============================================

import { useState, useEffect } from 'react';
import { X, User, ArrowRight, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Commission {
  id: string;
  distributor_id: string;
  seller_id: string;
  transaction_id: string;
  commission_type: string;
  override_level: number | null;
  amount: number;
  bv_amount: number | null;
  paid: boolean;
  paid_at: string | null;
  payment_method: string | null;
  commission_run_id: string | null;
  commission_month: string | null;
  notes: string | null;
  created_at: string;
  seller?: {
    first_name: string;
    last_name: string;
    email: string;
    slug: string;
  };
  transaction?: {
    id: string;
    product_slug: string;
    amount: number;
  };
}

interface OverrideChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  commission: Commission;
}

interface ChainEntry {
  id: string;
  distributor_id: string;
  distributor_name: string;
  distributor_slug: string;
  commission_type: string;
  override_level: number | null;
  amount: number;
  is_current: boolean;
}

interface TransactionDetails {
  id: string;
  amount: number;
  bv_amount: number;
  product_slug: string;
  seller: {
    first_name: string;
    last_name: string;
    slug: string;
  };
}

const commissionTypeNames: Record<string, string> = {
  seller_commission: 'Seller Commission',
  L1_enrollment: 'Level 1 Enrollment Override',
  L2_matrix: 'Level 2 Matrix Override',
  L3_matrix: 'Level 3 Matrix Override',
  L4_matrix: 'Level 4 Matrix Override',
  L5_matrix: 'Level 5 Matrix Override',
  L6_matrix: 'Level 6 Matrix Override',
  L7_matrix: 'Level 7 Matrix Override',
  rank_bonus: 'Rank Advancement Bonus',
  bonus_pool: 'Bonus Pool Share',
  leadership_pool: 'Leadership Pool Share',
};

export default function OverrideChainModal({
  isOpen,
  onClose,
  commission,
}: OverrideChainModalProps) {
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [breakage, setBreakage] = useState(0);
  const [overridePool, setOverridePool] = useState(0);

  useEffect(() => {
    if (isOpen && commission.transaction_id) {
      fetchOverrideChain();
    }
  }, [isOpen, commission]);

  const fetchOverrideChain = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/commissions/override-chain?transaction_id=${commission.transaction_id}`
      );
      const data = await res.json();

      if (data.success) {
        setChain(data.chain);
        setTransaction(data.transaction);
        setOverridePool(data.overridePool);
        setBreakage(data.breakage);
      }
    } catch (error) {
      console.error('Error fetching override chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Override Chain</h2>
            <p className="text-sm text-gray-600 mt-1">
              Commission distribution for transaction #{commission.transaction_id.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading override chain...
            </div>
          ) : (
            <>
              {/* Transaction Details */}
              {transaction && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Original Sale
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Business Volume: {formatCurrency(transaction.bv_amount)}
                      </p>
                      {transaction.product_slug && (
                        <p className="text-xs text-blue-600 mt-1">
                          Product: {transaction.product_slug}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-700 mb-1">Seller</p>
                      <Link
                        href={`/admin/distributors/${transaction.seller.slug}`}
                        className="text-sm font-semibold text-blue-900 hover:text-blue-700"
                      >
                        {transaction.seller.first_name} {transaction.seller.last_name}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Override Chain Visualization */}
              <div className="space-y-4">
                {/* Seller Commission */}
                {chain.find((c) => c.commission_type === 'seller_commission') && (
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      chain.find((c) => c.commission_type === 'seller_commission')
                        ?.is_current
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <User className="w-6 h-6 text-green-700" />
                      </div>
                      <div>
                        <Link
                          href={`/admin/distributors/${
                            chain.find((c) => c.commission_type === 'seller_commission')
                              ?.distributor_slug
                          }`}
                          className="font-semibold text-green-900 hover:text-green-700"
                        >
                          {
                            chain.find((c) => c.commission_type === 'seller_commission')
                              ?.distributor_name
                          }
                        </Link>
                        <p className="text-xs text-green-700">Seller Commission (60% of BV)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-900">
                        {formatCurrency(
                          chain.find((c) => c.commission_type === 'seller_commission')
                            ?.amount || 0
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Override Pool Header */}
                <div className="flex items-center gap-3 ml-6">
                  <div className="w-0.5 h-8 bg-blue-300"></div>
                </div>

                <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-blue-900">Override Pool (40% of BV)</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(overridePool)}
                    </p>
                  </div>
                </div>

                {/* Override Chain */}
                <div className="ml-6 space-y-3">
                  {chain
                    .filter((c) => c.commission_type !== 'seller_commission')
                    .sort((a, b) => (a.override_level || 0) - (b.override_level || 0))
                    .map((entry, idx) => (
                      <div key={entry.id} className="relative">
                        {/* Connection Line */}
                        {idx > 0 && (
                          <div className="absolute left-0 top-0 w-0.5 h-4 bg-gray-300 -translate-y-4"></div>
                        )}

                        <div
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            entry.is_current
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-900">
                                  L{entry.override_level}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Link
                                href={`/admin/distributors/${entry.distributor_slug}`}
                                className={`text-sm font-medium ${
                                  entry.is_current
                                    ? 'text-blue-900 hover:text-blue-700'
                                    : 'text-gray-900 hover:text-gray-700'
                                }`}
                              >
                                {entry.distributor_name}
                              </Link>
                              <p
                                className={`text-xs ${
                                  entry.is_current ? 'text-blue-700' : 'text-gray-600'
                                }`}
                              >
                                {commissionTypeNames[entry.commission_type]}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-semibold ${
                                entry.is_current ? 'text-blue-900' : 'text-gray-900'
                              }`}
                            >
                              {formatCurrency(entry.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Breakage */}
                  {breakage > 0 && (
                    <div className="relative">
                      <div className="absolute left-0 top-0 w-0.5 h-4 bg-gray-300 -translate-y-4"></div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <DollarSign className="w-6 h-6 text-red-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-900">Breakage</p>
                            <p className="text-xs text-red-700">
                              Unpaid overrides (goes to Apex)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-red-900">
                            {formatCurrency(breakage)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Paid to Distributors</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(chain.reduce((sum, c) => sum + c.amount, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Override Pool</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(overridePool)}
                    </p>
                  </div>
                </div>
                {breakage > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      Breakage Percentage:{' '}
                      <span className="font-semibold">
                        {((breakage / overridePool) * 100).toFixed(1)}%
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">How it works:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Seller receives 60% of Business Volume (BV)</li>
                  <li>• Remaining 40% goes to override pool</li>
                  <li>• L1 override paid to direct sponsor (enrollment tree)</li>
                  <li>• L2-L7 overrides paid up matrix tree (placement tree)</li>
                  <li>• Unpaid overrides (breakage) go to Apex</li>
                  <li>• Blue highlight = current distributor viewing</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
