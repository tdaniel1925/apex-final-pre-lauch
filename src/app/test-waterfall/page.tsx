'use client';

import { useState } from 'react';
import { calculateWaterfall } from '@/lib/compensation/waterfall';
import { PRODUCT_PRICES } from '@/lib/compensation/config';
import Link from 'next/link';

export default function TestWaterfall() {
  const [selectedProduct, setSelectedProduct] = useState('PULSEMARKET');
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [powerline, setPowerline] = useState(false);

  const products = [
    { id: 'PULSEMARKET', name: 'PulseMarket', memberPrice: 59, retailPrice: 79 },
    { id: 'PULSEFLOW', name: 'PulseFlow', memberPrice: 129, retailPrice: 149 },
    { id: 'PULSEDRIVE', name: 'PulseDrive', memberPrice: 219, retailPrice: 299 },
    { id: 'PULSECOMMAND', name: 'PulseCommand', memberPrice: 349, retailPrice: 499 },
    { id: 'SMARTLOCK', name: 'SmartLock', memberPrice: 99, retailPrice: 100 },
    { id: 'BIZCENTER', name: 'BusinessCenter', memberPrice: 39, retailPrice: 40 },
  ];

  const currentProduct = products.find(p => p.id === selectedProduct)!;
  const price = customPrice || currentProduct.memberPrice;
  const result = calculateWaterfall(price, powerline);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Admin Link */}
        <Link
          href="/admin/commissions"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Admin
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧮 AgentPulse Waterfall Calculator
          </h1>
          <p className="text-gray-600">
            Interactive commission breakdown showing BotMakers fee, Apex margin, and field payouts
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setCustomPrice(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.memberPrice}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custom Price (optional)
              </label>
              <input
                type="number"
                value={customPrice || ''}
                onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder={`Default: $${currentProduct.memberPrice}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Powerline Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Override Structure
              </label>
              <label className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={powerline}
                  onChange={(e) => setPowerline(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium">
                  Powerline Active (L6-L7)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Waterfall Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Waterfall Steps */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Waterfall Breakdown</h2>

            <div className="space-y-4">
              {/* Step 1: Gross */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Gross Sale Price</div>
                    <div className="text-sm text-gray-500">Starting amount</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${result.grossPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Step 2: BotMakers */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-red-600">BotMakers Fee</div>
                    <div className="text-sm text-gray-500">30% (FLOOR)</div>
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    -${result.botmakersFee.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Step 3: Bonus Pool */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-orange-600">Bonus Pool</div>
                    <div className="text-sm text-gray-500">5% (ROUND)</div>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    -${result.bonusPoolContribution.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Step 4: Apex Margin */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-purple-600">Apex Margin</div>
                    <div className="text-sm text-gray-500">30% (FLOOR)</div>
                  </div>
                  <div className="text-xl font-bold text-purple-600">
                    -${result.apexMargin.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Step 5: Field Remainder */}
              <div className="pb-4 border-b-2 border-green-600">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-green-700">Field Remainder</div>
                    <div className="text-sm text-gray-500">Available to reps</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${result.fieldRemainder.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Step 6: Seller Commission */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-blue-600">Seller Commission</div>
                    <div className="text-sm text-gray-500">60% of field (ROUND)</div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ${result.sellerCommission.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Step 7: Override Pool */}
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-indigo-600">Override Pool</div>
                    <div className="text-sm text-gray-500">40% of field (ROUND)</div>
                  </div>
                  <div className="text-xl font-bold text-indigo-600">
                    ${result.overridePool.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Override Levels */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Override Distribution
              {powerline && <span className="text-sm font-normal text-purple-600 ml-2">(Powerline)</span>}
            </h2>

            <div className="space-y-3">
              {Object.entries(result.overrideLevels).map(([level, amount]) => {
                const levelNum = parseInt(level.replace('L', ''));
                const isPowerline = levelNum > 5;

                return (
                  <div
                    key={level}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      isPowerline ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isPowerline ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        {level}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Level {levelNum}</div>
                        <div className="text-sm text-gray-500">
                          {isPowerline ? 'Powerline' : 'Standard'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      isPowerline ? 'text-purple-600' : 'text-indigo-600'
                    }`}>
                      ${amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">Total Override Pool:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${result.overridePool.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Sum of all {powerline ? '7' : '5'} override levels
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-600">BotMakers</div>
            <div className="text-2xl font-bold text-red-700">${result.botmakersFee.toFixed(2)}</div>
            <div className="text-xs text-red-600">30% of gross</div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">Apex Margin</div>
            <div className="text-2xl font-bold text-purple-700">${result.apexMargin.toFixed(2)}</div>
            <div className="text-xs text-purple-600">30% after pool</div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Seller Gets</div>
            <div className="text-2xl font-bold text-blue-700">${result.sellerCommission.toFixed(2)}</div>
            <div className="text-xs text-blue-600">60% of field</div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Total to Field</div>
            <div className="text-2xl font-bold text-green-700">${result.fieldRemainder.toFixed(2)}</div>
            <div className="text-xs text-green-600">Seller + Overrides</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">🎯 Next Steps - Explore the System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
            >
              <div className="font-semibold mb-1">📦 View Products</div>
              <div className="text-sm opacity-90">See all 6 AgentPulse products</div>
            </a>

            <a
              href="/admin/commissions"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
            >
              <div className="font-semibold mb-1">💰 Compensation Dashboard</div>
              <div className="text-sm opacity-90">Full engine configuration</div>
            </a>

            <a
              href="/admin/distributors"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
            >
              <div className="font-semibold mb-1">👥 View Distributors</div>
              <div className="text-sm opacity-90">Manage reps and matrix</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
