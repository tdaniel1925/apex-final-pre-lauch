'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { ProductMappingModal } from './ProductMappingModal';

interface Integration {
  id: string;
  platform_name: string;
  display_name: string;
  is_enabled: boolean;
}

interface ProductMapping {
  id: string;
  integration_id: string;
  external_product_id: string;
  external_product_name: string;
  external_product_sku?: string;
  tech_credits: number;
  insurance_credits: number;
  direct_commission_percentage: number;
  override_commission_percentage: number;
  fixed_commission_amount?: number;
  commission_type: 'credits' | 'percentage' | 'fixed' | 'none';
  is_active: boolean;
  notes?: string;
  integration?: Integration;
}

interface ProductMappingsClientProps {
  initialMappings: ProductMapping[];
  integrations: Integration[];
}

export function ProductMappingsClient({ initialMappings, integrations }: ProductMappingsClientProps) {
  const router = useRouter();
  const [mappings, setMappings] = useState(initialMappings);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ProductMapping | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter mappings by integration
  const filteredMappings = selectedIntegration === 'all'
    ? mappings
    : mappings.filter(m => m.integration_id === selectedIntegration);

  // Group mappings by integration
  const groupedMappings = filteredMappings.reduce((acc, mapping) => {
    const integrationId = mapping.integration_id;
    if (!acc[integrationId]) {
      acc[integrationId] = [];
    }
    acc[integrationId].push(mapping);
    return acc;
  }, {} as Record<string, ProductMapping[]>);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product mapping?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/integrations/product-mappings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mapping');
      }

      setMappings(mappings.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('Failed to delete mapping. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (mapping: ProductMapping) => {
    setEditingMapping(mapping);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMapping(null);
    router.refresh();
  };

  return (
    <>
      {/* Filter and Actions Bar */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={selectedIntegration}
              onChange={(e) => setSelectedIntegration(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Integrations</option>
              {integrations.map(integration => (
                <option key={integration.id} value={integration.id}>
                  {integration.display_name}
                  {!integration.is_enabled && ' (Disabled)'}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Mapping
          </button>
        </div>
      </div>

      {/* Grouped Table */}
      {Object.keys(groupedMappings).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-4">No product mappings yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-slate-900 hover:underline"
          >
            Create your first mapping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMappings).map(([integrationId, integrationMappings]) => {
            const integration = integrations.find(i => i.id === integrationId);
            if (!integration) return null;

            return (
              <div key={integrationId} className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                {/* Integration Header */}
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {integration.display_name}
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      ({integrationMappings.length} {integrationMappings.length === 1 ? 'mapping' : 'mappings'})
                    </span>
                  </h3>
                </div>

                {/* Mappings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          External ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {integrationMappings.map((mapping) => (
                        <tr key={mapping.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{mapping.external_product_name}</p>
                              {mapping.external_product_sku && (
                                <p className="text-xs text-slate-500">SKU: {mapping.external_product_sku}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                              {mapping.external_product_id}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {mapping.tech_credits > 0 && (
                                <p className="text-slate-700">
                                  Tech: <span className="font-semibold">{mapping.tech_credits}</span>
                                </p>
                              )}
                              {mapping.insurance_credits > 0 && (
                                <p className="text-slate-700">
                                  Insurance: <span className="font-semibold">{mapping.insurance_credits}</span>
                                </p>
                              )}
                              {mapping.tech_credits === 0 && mapping.insurance_credits === 0 && (
                                <p className="text-slate-400">None</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {mapping.commission_type === 'percentage' && (
                                <>
                                  {mapping.direct_commission_percentage > 0 && (
                                    <p className="text-slate-700">
                                      Direct: <span className="font-semibold">{mapping.direct_commission_percentage}%</span>
                                    </p>
                                  )}
                                  {mapping.override_commission_percentage > 0 && (
                                    <p className="text-slate-700">
                                      Override: <span className="font-semibold">{mapping.override_commission_percentage}%</span>
                                    </p>
                                  )}
                                </>
                              )}
                              {mapping.commission_type === 'fixed' && mapping.fixed_commission_amount && (
                                <p className="text-slate-700">
                                  Fixed: <span className="font-semibold">${mapping.fixed_commission_amount.toFixed(2)}</span>
                                </p>
                              )}
                              {mapping.commission_type === 'credits' && (
                                <p className="text-slate-500">Credits only</p>
                              )}
                              {mapping.commission_type === 'none' && (
                                <p className="text-slate-400">None</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {mapping.is_active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(mapping)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(mapping.id)}
                                disabled={deletingId === mapping.id}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductMappingModal
          integrations={integrations}
          editingMapping={editingMapping}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}

// Add missing Package import
function Package({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" x2="12" y1="22.08" y2="12" />
    </svg>
  );
}
