'use client';

// =============================================
// Waterfall Editor Component
// Configure commission waterfall percentages
// Business Center uses FIXED DOLLARS
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WATERFALL_CONFIG, BUSINESS_CENTER_CONFIG } from '@/lib/compensation/config';

interface WaterfallConfig {
  botmakersFee: number;
  apexTake: number;
  bonusPool: number;
  leadershipPool: number;
  sellerCommission: number;
  overridePool: number;
}

interface BusinessCenterDollars {
  botmakersFee: number;
  apexTake: number;
  repCommission: number;
  sponsorBonus: number;
  corpExpenses: number;
}

export default function WaterfallEditor() {
  const [standardConfig, setStandardConfig] = useState<WaterfallConfig>({
    botmakersFee: WATERFALL_CONFIG.BOTMAKERS_FEE_PCT * 100,
    apexTake: WATERFALL_CONFIG.APEX_TAKE_PCT * 100,
    bonusPool: WATERFALL_CONFIG.BONUS_POOL_PCT * 100,
    leadershipPool: WATERFALL_CONFIG.LEADERSHIP_POOL_PCT * 100,
    sellerCommission: WATERFALL_CONFIG.SELLER_COMMISSION_PCT * 100,
    overridePool: WATERFALL_CONFIG.OVERRIDE_POOL_PCT * 100,
  });

  // Business Center uses FIXED DOLLARS, not percentages
  const [bcDollars, setBcDollars] = useState<BusinessCenterDollars>({
    botmakersFee: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS / 100,
    apexTake: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS / 100,
    repCommission: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS / 100,
    sponsorBonus: BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS / 100,
    corpExpenses: BUSINESS_CENTER_CONFIG.COSTS_CENTS / 100,
  });

  const bcPrice = BUSINESS_CENTER_CONFIG.PRICE_CENTS / 100; // $39

  const [isDirty, setIsDirty] = useState(false);

  const handleSliderChange = (field: keyof WaterfallConfig, value: number) => {
    setStandardConfig(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleBcDollarChange = (field: keyof BusinessCenterDollars, value: number) => {
    setBcDollars(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    alert('💾 Configuration would be saved here (connect to API)');
    setIsDirty(false);
  };

  const handleCancel = () => {
    // Reset to defaults
    setStandardConfig({
      botmakersFee: WATERFALL_CONFIG.BOTMAKERS_FEE_PCT * 100,
      apexTake: WATERFALL_CONFIG.APEX_TAKE_PCT * 100,
      bonusPool: WATERFALL_CONFIG.BONUS_POOL_PCT * 100,
      leadershipPool: WATERFALL_CONFIG.LEADERSHIP_POOL_PCT * 100,
      sellerCommission: WATERFALL_CONFIG.SELLER_COMMISSION_PCT * 100,
      overridePool: WATERFALL_CONFIG.OVERRIDE_POOL_PCT * 100,
    });
    setBcDollars({
      botmakersFee: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS / 100,
      apexTake: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS / 100,
      repCommission: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS / 100,
      sponsorBonus: BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS / 100,
      corpExpenses: BUSINESS_CENTER_CONFIG.COSTS_CENTS / 100,
    });
    setIsDirty(false);
  };

  // Calculate cascading percentages for display
  const botmakersPct = standardConfig.botmakersFee;
  const adjustedGross = 100 - botmakersPct;
  const apexEffective = (adjustedGross * standardConfig.apexTake) / 100;
  const remainder = adjustedGross - apexEffective;
  const bonusPoolEffective = (remainder * standardConfig.bonusPool) / 100;
  const leadershipPoolEffective = (remainder * standardConfig.leadershipPool) / 100;
  const commissionPool = remainder - bonusPoolEffective - leadershipPoolEffective;
  const sellerEffective = (commissionPool * standardConfig.sellerCommission) / 100;
  const overrideEffective = (commissionPool * standardConfig.overridePool) / 100;

  const renderSlider = (
    label: string,
    field: keyof WaterfallConfig,
    value: number,
    baseDescription: string
  ) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <p className="text-xs text-gray-500">{baseDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value.toFixed(1)}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value) || 0;
                handleSliderChange(field, Math.max(0, Math.min(100, newValue)));
              }}
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
          onChange={(e) => handleSliderChange(field, parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    );
  };

  const renderDollarInput = (
    label: string,
    field: keyof BusinessCenterDollars,
    value: number,
    description: string
  ) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">$</span>
            <input
              type="number"
              value={value.toFixed(2)}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value) || 0;
                handleBcDollarChange(field, Math.max(0, newValue));
              }}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              step="0.01"
            />
          </div>
        </div>
      </div>
    );
  };

  const bcTotal = bcDollars.botmakersFee + bcDollars.apexTake + bcDollars.repCommission + bcDollars.sponsorBonus + bcDollars.corpExpenses;
  const bcValid = Math.abs(bcTotal - bcPrice) < 0.01;

  return (
    <div className="space-y-6">
      {/* Explanation Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Understanding Cascading Percentages
        </h3>
        <div className="text-sm text-blue-900 space-y-2">
          <p>Each percentage is calculated on <strong>what remains</strong> after the previous deduction:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>BotMakers Fee</strong> is a % of retail price</li>
            <li><strong>Apex Take</strong> is a % of adjusted gross (after BotMakers)</li>
            <li><strong>Bonus & Leadership Pools</strong> are % of remainder (after BotMakers + Apex)</li>
            <li><strong>Seller & Override</strong> are % of commission pool (after all pools)</li>
          </ul>
          <p className="mt-2 pt-2 border-t border-blue-300">
            The "Effective %" column shows what each step represents as a percentage of the original retail price.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard Products - Percentages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Standard Products (Percentages)</h3>
            <p className="text-sm text-gray-600">Adjust the cascading waterfall percentages below</p>
          </div>

          {renderSlider('BotMakers Fee', 'botmakersFee', standardConfig.botmakersFee, 'Of retail price')}

          <div className="border-t border-gray-200 my-4 pt-4">
            <p className="text-xs text-gray-600 mb-3 font-medium">
              After BotMakers Fee: <span className="text-gray-900">{adjustedGross.toFixed(2)}%</span> (Adjusted Gross)
            </p>

            {renderSlider('Apex Take', 'apexTake', standardConfig.apexTake, 'Of adjusted gross')}

            <p className="text-xs text-gray-600 mb-3 font-medium">
              After Apex Take: <span className="text-gray-900">{remainder.toFixed(2)}%</span> (Remainder)
            </p>

            {renderSlider('Bonus Pool', 'bonusPool', standardConfig.bonusPool, 'Of remainder')}
            {renderSlider('Leadership Pool', 'leadershipPool', standardConfig.leadershipPool, 'Of remainder')}

            <p className="text-xs text-gray-600 mb-3 font-medium">
              After Pools: <span className="text-gray-900">{commissionPool.toFixed(2)}%</span> (Commission Pool)
            </p>

            {renderSlider('Seller Commission', 'sellerCommission', standardConfig.sellerCommission, 'Of commission pool')}
            {renderSlider('Override Pool', 'overridePool', standardConfig.overridePool, 'Of commission pool')}
          </div>

          {/* Effective Percentages Table */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Effective % of Retail Price</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">BotMakers Fee:</span>
                <span className="font-semibold">{botmakersPct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded">
                <span className="text-gray-600">Apex Take:</span>
                <span className="font-semibold">{apexEffective.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-600">Bonus Pool:</span>
                <span className="font-semibold">{bonusPoolEffective.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-indigo-50 rounded">
                <span className="text-gray-600">Leadership Pool:</span>
                <span className="font-semibold">{leadershipPoolEffective.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded">
                <span className="text-gray-600">Seller Commission:</span>
                <span className="font-semibold">{sellerEffective.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-orange-50 rounded">
                <span className="text-gray-600">Override Pool:</span>
                <span className="font-semibold">{overrideEffective.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between p-2 bg-green-100 rounded border-t-2 border-green-600">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-green-900">{(botmakersPct + apexEffective + bonusPoolEffective + leadershipPoolEffective + sellerEffective + overrideEffective).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Center - Fixed Dollars */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Business Center (Fixed Dollars)</h3>
            <p className="text-sm text-gray-600">Business Center uses fixed dollar amounts, not percentages</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">Fixed Price: ${bcPrice.toFixed(2)}</p>
                <p className="text-xs text-amber-800 mt-1">All amounts are in dollars, not percentages. Total must equal ${bcPrice.toFixed(2)}.</p>
              </div>
            </div>
          </div>

          {renderDollarInput('BotMakers Fee', 'botmakersFee', bcDollars.botmakersFee, 'Fixed amount')}
          {renderDollarInput('Apex Take', 'apexTake', bcDollars.apexTake, 'Fixed amount')}
          {renderDollarInput('Rep Commission', 'repCommission', bcDollars.repCommission, 'Selling rep commission')}
          {renderDollarInput('Sponsor Bonus', 'sponsorBonus', bcDollars.sponsorBonus, 'Direct sponsor bonus')}
          {renderDollarInput('Corporate Expenses', 'corpExpenses', bcDollars.corpExpenses, 'Operating costs')}

          {/* Business Center Total */}
          <div className={`p-4 rounded-lg mt-6 ${bcValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className={`text-xl font-bold ${bcValid ? 'text-green-700' : 'text-red-700'}`}>
                ${bcTotal.toFixed(2)}
              </span>
            </div>
            {!bcValid && (
              <p className="text-xs text-red-600">
                {bcTotal > bcPrice ? `Over by $${(bcTotal - bcPrice).toFixed(2)}` : `Under by $${(bcPrice - bcTotal).toFixed(2)}`}
              </p>
            )}
            {bcValid && (
              <p className="text-xs text-green-600">✓ Total matches Business Center price</p>
            )}
          </div>

          {/* Business Center Notes */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Business Center Rules:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• No Bonus Pool (0%)</li>
              <li>• No Leadership Pool (0%)</li>
              <li>• No Override Pool (sponsor gets flat bonus)</li>
              <li>• Fixed 39 production credits</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isDirty && (
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!bcValid}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
