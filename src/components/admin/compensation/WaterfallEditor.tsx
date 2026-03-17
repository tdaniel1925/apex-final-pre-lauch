'use client';

// =============================================
// Waterfall Editor Component
// Configure commission waterfall percentages
// Now with REAL API integration!
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface WaterfallConfig {
  botmakersFee: number;
  apexTake: number;
  bonusPool: number;
  leadershipPool: number;
  sellerCommission: number;
  overridePool: number;
}

interface WaterfallEditorProps {
  productType?: 'standard' | 'business-center';
}

export default function WaterfallEditor({ productType = 'standard' }: WaterfallEditorProps) {
  const [standardConfig, setStandardConfig] = useState<WaterfallConfig>({
    botmakersFee: 30.0,
    apexTake: 30.0,
    bonusPool: 3.5,
    leadershipPool: 1.5,
    sellerCommission: 60.0,
    overridePool: 40.0,
  });

  const [bcConfig, setBcConfig] = useState<WaterfallConfig>({
    botmakersFee: 28.21,
    apexTake: 20.51,
    bonusPool: 0.0,
    leadershipPool: 0.0,
    sellerCommission: 25.64,
    overridePool: 25.64,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch configuration from API on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/compensation/config');
        const data = await res.json();

        if (data.success && data.data) {
          // Find standard and business_center waterfall configs
          const waterfalls = data.data.waterfalls || [];
          const standard = waterfalls.find((w: any) => w.product_type === 'standard');
          const bc = waterfalls.find((w: any) => w.product_type === 'business_center');

          if (standard) {
            setStandardConfig({
              botmakersFee: standard.botmakers_pct * 100, // 0.30 → 30
              apexTake: standard.apex_pct * 100,
              bonusPool: standard.bonus_pool_pct * 100,
              leadershipPool: standard.leadership_pool_pct * 100,
              sellerCommission: standard.seller_commission_pct * 100,
              overridePool: standard.override_pool_pct * 100,
            });
          }

          if (bc) {
            setBcConfig({
              botmakersFee: bc.botmakers_pct * 100,
              apexTake: bc.apex_pct * 100,
              bonusPool: bc.bonus_pool_pct * 100,
              leadershipPool: bc.leadership_pool_pct * 100,
              sellerCommission: bc.seller_commission_pct * 100,
              overridePool: bc.override_pool_pct * 100,
            });
          }
        } else {
          setError(data.error || 'Failed to load configuration');
        }
      } catch (err) {
        console.error('Error fetching config:', err);
        setError('Network error while loading configuration');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const calculateTotal = (config: WaterfallConfig): number => {
    const afterFees = 100 - config.botmakersFee;
    const percentagesSum = config.apexTake + config.bonusPool + config.leadershipPool + config.sellerCommission + config.overridePool;
    return percentagesSum;
  };

  const getTotalPercentage = (config: WaterfallConfig): number => {
    return calculateTotal(config);
  };

  const isValid = (config: WaterfallConfig): boolean => {
    const total = getTotalPercentage(config);
    return Math.abs(total - 100) < 0.01; // Allow tiny rounding errors
  };

  const handleSliderChange = (field: keyof WaterfallConfig, value: number, isStandard: boolean) => {
    if (isStandard) {
      setStandardConfig(prev => ({ ...prev, [field]: value }));
    } else {
      setBcConfig(prev => ({ ...prev, [field]: value }));
    }
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save standard waterfall
      const standardRes = await fetch('/api/admin/compensation/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineType: 'saas',
          key: 'waterfall_standard',
          value: {
            botmakers_pct: standardConfig.botmakersFee / 100,
            apex_pct: standardConfig.apexTake / 100,
            bonus_pool_pct: standardConfig.bonusPool / 100,
            leadership_pool_pct: standardConfig.leadershipPool / 100,
            seller_commission_pct: standardConfig.sellerCommission / 100,
            override_pool_pct: standardConfig.overridePool / 100,
          }
        })
      });

      const standardData = await standardRes.json();
      if (!standardData.success) {
        throw new Error(standardData.error || 'Failed to save standard waterfall');
      }

      // Save business center waterfall
      const bcRes = await fetch('/api/admin/compensation/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineType: 'saas',
          key: 'waterfall_business_center',
          value: {
            botmakers_pct: bcConfig.botmakersFee / 100,
            apex_pct: bcConfig.apexTake / 100,
            bonus_pool_pct: bcConfig.bonusPool / 100,
            leadership_pool_pct: bcConfig.leadershipPool / 100,
            seller_commission_pct: bcConfig.sellerCommission / 100,
            override_pool_pct: bcConfig.overridePool / 100,
          }
        })
      });

      const bcData = await bcRes.json();
      if (!bcData.success) {
        throw new Error(bcData.error || 'Failed to save business center waterfall');
      }

      setIsDirty(false);
      alert('✅ Waterfall configuration saved successfully!');
    } catch (err: any) {
      console.error('Error saving config:', err);
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload from API
    window.location.reload();
  };

  const renderSlider = (
    label: string,
    field: keyof WaterfallConfig,
    config: WaterfallConfig,
    isStandard: boolean,
    disabled: boolean = false
  ) => {
    const value = config[field];
    const total = getTotalPercentage(config);
    const isOverTotal = total > 100;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value.toFixed(1)}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value) || 0;
                handleSliderChange(field, Math.max(0, Math.min(100, newValue)), isStandard);
              }}
              disabled={disabled}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
            <span className="text-sm font-semibold text-gray-900">%</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={value}
          onChange={(e) => handleSliderChange(field, parseFloat(e.target.value), isStandard)}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    );
  };

  const renderWaterfallSection = (title: string, config: WaterfallConfig, isStandard: boolean) => {
    const total = getTotalPercentage(config);
    const valid = isValid(config);
    const afterFees = 100 - config.botmakersFee;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>

        {/* BotMakers Fee */}
        {renderSlider('BotMakers Fee', 'botmakersFee', config, isStandard)}

        <div className="border-t border-gray-200 my-4 pt-4">
          <p className="text-xs text-gray-600 mb-3">
            After Platform Fee: <span className="font-semibold text-gray-900">{afterFees.toFixed(1)}%</span>
          </p>

          {/* Remaining percentages */}
          {renderSlider('Apex Take', 'apexTake', config, isStandard)}
          {renderSlider('Bonus Pool', 'bonusPool', config, isStandard)}
          {renderSlider('Leadership Pool', 'leadershipPool', config, isStandard)}
          {renderSlider('Seller Commission', 'sellerCommission', config, isStandard)}
          {renderSlider('Override Pool', 'overridePool', config, isStandard)}
        </div>

        {/* Total Validation */}
        <div className={`p-3 rounded-lg ${valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Percentage:</span>
            <span className={`text-lg font-bold ${valid ? 'text-green-700' : 'text-red-700'}`}>
              {total.toFixed(1)}%
            </span>
          </div>
          {!valid && (
            <p className="text-xs text-red-600 mt-1">
              {total > 100 ? 'Total exceeds 100%' : 'Total less than 100%'}
            </p>
          )}
        </div>

        {/* Visual Breakdown Chart */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Visual Breakdown</h4>
          <div className="w-full h-8 flex rounded-lg overflow-hidden">
            <div
              className="bg-gray-400 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${config.botmakersFee}%` }}
              title={`BotMakers: ${config.botmakersFee}%`}
            >
              {config.botmakersFee >= 5 && `${config.botmakersFee.toFixed(0)}%`}
            </div>
            <div
              className="bg-blue-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(config.apexTake / 100) * afterFees}%` }}
              title={`Apex: ${config.apexTake}%`}
            >
              {config.apexTake >= 5 && `${config.apexTake.toFixed(0)}%`}
            </div>
            <div
              className="bg-purple-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(config.bonusPool / 100) * afterFees}%` }}
              title={`Bonus: ${config.bonusPool}%`}
            >
              {config.bonusPool >= 5 && `${config.bonusPool.toFixed(0)}%`}
            </div>
            <div
              className="bg-indigo-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(config.leadershipPool / 100) * afterFees}%` }}
              title={`Leadership: ${config.leadershipPool}%`}
            >
              {config.leadershipPool >= 5 && `${config.leadershipPool.toFixed(0)}%`}
            </div>
            <div
              className="bg-green-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(config.sellerCommission / 100) * afterFees}%` }}
              title={`Seller: ${config.sellerCommission}%`}
            >
              {config.sellerCommission >= 5 && `${config.sellerCommission.toFixed(0)}%`}
            </div>
            <div
              className="bg-orange-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(config.overridePool / 100) * afterFees}%` }}
              title={`Override: ${config.overridePool}%`}
            >
              {config.overridePool >= 5 && `${config.overridePool.toFixed(0)}%`}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>BotMakers Fee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Apex Take</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span>Bonus Pool</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded"></div>
              <span>Leadership Pool</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Seller Commission</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded"></div>
              <span>Override Pool</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading waterfall configuration...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Configuration</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderWaterfallSection('Standard Products', standardConfig, true)}
        {renderWaterfallSection('Business Center Products', bcConfig, false)}
      </div>

      {/* Action Buttons */}
      {isDirty && (
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Button onClick={handleCancel} variant="outline" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid(standardConfig) || !isValid(bcConfig) || saving}
          >
            {saving ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
