'use client';

// =============================================
// Overview Tab Component
// Shows compensation plan configuration summary
// =============================================

import { WATERFALL_CONFIG, BUSINESS_CENTER_CONFIG, TECH_RANKS } from '@/lib/compensation/config';

export default function OverviewTab() {
  // Calculate effective percentages for display
  const botmakersPct = WATERFALL_CONFIG.BOTMAKERS_FEE_PCT * 100; // 30%
  const adjustedGross = 100 - botmakersPct; // 70%
  const apexPctOfAG = WATERFALL_CONFIG.APEX_TAKE_PCT * 100; // 30% of AG
  const apexEffective = (adjustedGross * WATERFALL_CONFIG.APEX_TAKE_PCT); // 21% of retail
  const remainder = adjustedGross - apexEffective; // 49%
  const bonusPoolPct = WATERFALL_CONFIG.BONUS_POOL_PCT * 100; // 5% of remainder
  const bonusPoolEffective = (remainder * WATERFALL_CONFIG.BONUS_POOL_PCT); // 2.45% of retail
  const leadershipPoolPct = WATERFALL_CONFIG.LEADERSHIP_POOL_PCT * 100; // 1.5% of remainder
  const leadershipPoolEffective = (remainder * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT); // 0.735% of retail
  const commissionPool = remainder - bonusPoolEffective - leadershipPoolEffective; // 45.815%
  const sellerPct = WATERFALL_CONFIG.SELLER_COMMISSION_PCT * 100; // 60% of commission pool
  const sellerEffective = (commissionPool * WATERFALL_CONFIG.SELLER_COMMISSION_PCT); // ~27.49% of retail
  const overridePct = WATERFALL_CONFIG.OVERRIDE_POOL_PCT * 100; // 40% of commission pool
  const overrideEffective = (commissionPool * WATERFALL_CONFIG.OVERRIDE_POOL_PCT); // ~18.33% of retail

  return (
    <div className="space-y-6">
      {/* Cascading Waterfall Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How the Cascading Waterfall Works
        </h3>
        <div className="text-sm text-blue-900 space-y-2">
          <p className="font-medium">This is a <strong>cascading waterfall</strong> - each percentage is calculated on what remains after the previous deduction:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li><strong>BotMakers Fee:</strong> 30% of retail price → leaves 70%</li>
            <li><strong>Apex Take:</strong> 30% of the adjusted gross (70%) = 21% of retail → leaves 49%</li>
            <li><strong>Bonus Pool:</strong> 5% of the remainder (49%) = 2.45% of retail</li>
            <li><strong>Leadership Pool:</strong> 1.5% of the remainder (49%) = 0.735% of retail</li>
            <li><strong>Commission Pool:</strong> What's left = 45.815% of retail</li>
            <li><strong>Seller Commission:</strong> 60% of commission pool = 27.49% of retail</li>
            <li><strong>Override Pool:</strong> 40% of commission pool = 18.33% of retail</li>
          </ol>
          <p className="mt-3 pt-3 border-t border-blue-300 font-medium">
            ✓ Total = 100% (all percentages together equal the full retail price)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard Products Waterfall */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Standard Products Waterfall
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="text-gray-700 font-medium">BotMakers Fee</span>
                <p className="text-xs text-gray-500">30% of retail</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{botmakersPct.toFixed(1)}%</span>
                <p className="text-xs text-gray-500">of retail</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <div>
                <span className="text-gray-700 font-medium">Apex Take</span>
                <p className="text-xs text-blue-600">{apexPctOfAG.toFixed(1)}% of adjusted gross</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{apexEffective.toFixed(2)}%</span>
                <p className="text-xs text-gray-500">of retail</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <div>
                <span className="text-gray-700 font-medium">Bonus Pool</span>
                <p className="text-xs text-purple-600">{bonusPoolPct.toFixed(1)}% of remainder</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{bonusPoolEffective.toFixed(2)}%</span>
                <p className="text-xs text-gray-500">of retail</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
              <div>
                <span className="text-gray-700 font-medium">Leadership Pool</span>
                <p className="text-xs text-indigo-600">{leadershipPoolPct.toFixed(1)}% of remainder</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{leadershipPoolEffective.toFixed(2)}%</span>
                <p className="text-xs text-gray-500">of retail</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <div>
                <span className="text-gray-700 font-medium">Seller Commission</span>
                <p className="text-xs text-green-600">{sellerPct.toFixed(1)}% of commission pool</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{sellerEffective.toFixed(2)}%</span>
                <p className="text-xs text-gray-500">of retail</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
              <div>
                <span className="text-gray-700 font-medium">Override Pool</span>
                <p className="text-xs text-orange-600">{overridePct.toFixed(1)}% of commission pool</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{overrideEffective.toFixed(2)}%</span>
                <p className="text-xs text-gray-500">of retail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Center - Fixed Dollars */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Business Center - Fixed Dollars
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> Business Center uses <strong>fixed dollar amounts</strong>, not percentages. Price: <strong>${(BUSINESS_CENTER_CONFIG.PRICE_CENTS / 100).toFixed(2)}</strong>
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">BotMakers Fee</span>
              <span className="font-bold text-gray-900 text-lg">${(BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-gray-700 font-medium">Apex Take</span>
              <span className="font-bold text-gray-900 text-lg">${(BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-gray-700 font-medium">Rep Commission</span>
              <span className="font-bold text-gray-900 text-lg">${(BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-gray-700 font-medium">Override Pool</span>
              <span className="font-bold text-gray-900 text-lg">${(BUSINESS_CENTER_CONFIG.OVERRIDE_POOL_CENTS / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="text-gray-700 font-medium">Apex Take</span>
              <span className="font-bold text-gray-900 text-lg">${(BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS / 100).toFixed(2)}</span>
            </div>

            <div className="border-t-2 border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-center p-2 bg-green-100 rounded">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="font-bold text-green-900 text-xl">
                  ${((BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS +
                      BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS +
                      BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS +
                      BUSINESS_CENTER_CONFIG.OVERRIDE_POOL_CENTS +
                      BUSINESS_CENTER_CONFIG.COGS_CENTS) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>• No Bonus Pool for Business Center</p>
              <p>• No Leadership Pool for Business Center</p>
              <p>• No Override Pool (sponsor gets flat $8)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tech Ranks Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Tech Ladder Ranks
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">Total Ranks: <span className="font-medium text-gray-900">{TECH_RANKS.length}</span></p>
            <p className="text-gray-600">Highest Rank: <span className="font-medium text-gray-900">Elite</span></p>
            <p className="text-gray-600">Entry Requirement: <span className="font-medium text-gray-900">1 Personal Credit</span></p>
            <p className="text-gray-600">Override Levels: <span className="font-medium text-gray-900">5 (L1-L5)</span></p>
          </div>
        </div>

        {/* Override Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            Override Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">Max Override Levels: <span className="font-medium text-gray-900">5 (L1-L5)</span></p>
            <p className="text-gray-600">Enroller Override: <span className="font-medium text-gray-900">30% (Always L1)</span></p>
            <p className="text-gray-600">Compression: <span className="font-medium text-gray-900">Enabled</span></p>
            <p className="text-gray-600">Qualification: <span className="font-medium text-gray-900">50 credits/month minimum</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
