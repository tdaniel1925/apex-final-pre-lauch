'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertCircle } from 'lucide-react';

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
}

interface ProductMappingModalProps {
  integrations: Integration[];
  editingMapping?: ProductMapping | null;
  onClose: () => void;
}

interface FormData {
  integration_id: string;
  external_product_id: string;
  external_product_name: string;
  external_product_sku: string;
  tech_credits: string;
  insurance_credits: string;
  direct_commission_percentage: string;
  override_commission_percentage: string;
  fixed_commission_amount: string;
  commission_type: 'credits' | 'percentage' | 'fixed' | 'none';
  is_active: boolean;
  notes: string;
}

export function ProductMappingModal({ integrations, editingMapping, onClose }: ProductMappingModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    integration_id: editingMapping?.integration_id || integrations[0]?.id || '',
    external_product_id: editingMapping?.external_product_id || '',
    external_product_name: editingMapping?.external_product_name || '',
    external_product_sku: editingMapping?.external_product_sku || '',
    tech_credits: editingMapping?.tech_credits?.toString() || '0',
    insurance_credits: editingMapping?.insurance_credits?.toString() || '0',
    direct_commission_percentage: editingMapping?.direct_commission_percentage?.toString() || '0',
    override_commission_percentage: editingMapping?.override_commission_percentage?.toString() || '0',
    fixed_commission_amount: editingMapping?.fixed_commission_amount?.toString() || '',
    commission_type: editingMapping?.commission_type || 'credits',
    is_active: editingMapping?.is_active ?? true,
    notes: editingMapping?.notes || '',
  });

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.integration_id) {
      errors.integration_id = 'Integration is required';
    }

    if (!formData.external_product_id.trim()) {
      errors.external_product_id = 'External Product ID is required';
    }

    if (!formData.external_product_name.trim()) {
      errors.external_product_name = 'Product Name is required';
    }

    const techCredits = parseFloat(formData.tech_credits);
    const insuranceCredits = parseFloat(formData.insurance_credits);
    if (isNaN(techCredits) || techCredits < 0) {
      errors.tech_credits = 'Tech credits must be >= 0';
    }
    if (isNaN(insuranceCredits) || insuranceCredits < 0) {
      errors.insurance_credits = 'Insurance credits must be >= 0';
    }

    const directCommission = parseFloat(formData.direct_commission_percentage);
    const overrideCommission = parseFloat(formData.override_commission_percentage);

    if (formData.commission_type === 'percentage') {
      if (isNaN(directCommission) || directCommission < 0 || directCommission > 100) {
        errors.direct_commission_percentage = 'Direct commission must be between 0 and 100';
      }
      if (isNaN(overrideCommission) || overrideCommission < 0 || overrideCommission > 100) {
        errors.override_commission_percentage = 'Override commission must be between 0 and 100';
      }
    }

    if (formData.commission_type === 'fixed' && formData.fixed_commission_amount) {
      const fixedAmount = parseFloat(formData.fixed_commission_amount);
      if (isNaN(fixedAmount) || fixedAmount < 0) {
        errors.fixed_commission_amount = 'Fixed commission must be >= 0';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        integration_id: formData.integration_id,
        external_product_id: formData.external_product_id.trim(),
        external_product_name: formData.external_product_name.trim(),
        external_product_sku: formData.external_product_sku.trim() || null,
        tech_credits: parseFloat(formData.tech_credits),
        insurance_credits: parseFloat(formData.insurance_credits),
        direct_commission_percentage: parseFloat(formData.direct_commission_percentage),
        override_commission_percentage: parseFloat(formData.override_commission_percentage),
        fixed_commission_amount: formData.fixed_commission_amount ? parseFloat(formData.fixed_commission_amount) : null,
        commission_type: formData.commission_type,
        is_active: formData.is_active,
        notes: formData.notes.trim() || null,
      };

      const url = editingMapping
        ? `/api/admin/integrations/product-mappings/${editingMapping.id}`
        : '/api/admin/integrations/product-mappings';

      const method = editingMapping ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingMapping ? 'update' : 'create'} mapping`);
      }

      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {editingMapping ? 'Edit Product Mapping' : 'Add Product Mapping'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Global Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Integration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Integration Platform *
            </label>
            <select
              required
              value={formData.integration_id}
              onChange={(e) => setFormData({ ...formData, integration_id: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                validationErrors.integration_id ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={!!editingMapping}
            >
              <option value="">Select Integration</option>
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                  {integration.display_name}
                  {!integration.is_enabled && ' (Disabled)'}
                </option>
              ))}
            </select>
            {validationErrors.integration_id && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.integration_id}</p>
            )}
          </div>

          {/* Product Identification */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900">Product Identification</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Product ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.external_product_id}
                  onChange={(e) => setFormData({ ...formData, external_product_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                    validationErrors.external_product_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., prod_abc123"
                />
                {validationErrors.external_product_id && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.external_product_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.external_product_sku}
                  onChange={(e) => setFormData({ ...formData, external_product_sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="e.g., SKU-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.external_product_name}
                onChange={(e) => setFormData({ ...formData, external_product_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  validationErrors.external_product_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., AgentPulse WarmLine Pro"
              />
              {validationErrors.external_product_name && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.external_product_name}</p>
              )}
            </div>
          </div>

          {/* Credits Configuration */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900">Credits Per Sale</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Credits
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tech_credits}
                  onChange={(e) => setFormData({ ...formData, tech_credits: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                    validationErrors.tech_credits ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {validationErrors.tech_credits && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.tech_credits}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Credits
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.insurance_credits}
                  onChange={(e) => setFormData({ ...formData, insurance_credits: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                    validationErrors.insurance_credits ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {validationErrors.insurance_credits && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.insurance_credits}</p>
                )}
              </div>
            </div>
          </div>

          {/* Commission Configuration */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900">Commission Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Type
              </label>
              <select
                value={formData.commission_type}
                onChange={(e) => setFormData({ ...formData, commission_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="credits">Credits Only</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="none">None</option>
              </select>
            </div>

            {formData.commission_type === 'percentage' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direct Commission %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.direct_commission_percentage}
                      onChange={(e) => setFormData({ ...formData, direct_commission_percentage: e.target.value })}
                      className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                        validationErrors.direct_commission_percentage ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                  {validationErrors.direct_commission_percentage && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.direct_commission_percentage}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Override Commission %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.override_commission_percentage}
                      onChange={(e) => setFormData({ ...formData, override_commission_percentage: e.target.value })}
                      className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                        validationErrors.override_commission_percentage ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                  {validationErrors.override_commission_percentage && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.override_commission_percentage}</p>
                  )}
                </div>
              </div>
            )}

            {formData.commission_type === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fixed Commission Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fixed_commission_amount}
                    onChange={(e) => setFormData({ ...formData, fixed_commission_amount: e.target.value })}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                      validationErrors.fixed_commission_amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {validationErrors.fixed_commission_amount && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.fixed_commission_amount}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              rows={3}
              placeholder="Internal notes about this mapping"
            />
          </div>

          {/* Status Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (mapping is enabled)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? (editingMapping ? 'Updating...' : 'Creating...') : (editingMapping ? 'Update Mapping' : 'Create Mapping')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
