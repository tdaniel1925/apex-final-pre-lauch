'use client';

import { useState } from 'react';
import { DollarSign, Users, TrendingUp, Award, Calculator } from 'lucide-react';

interface CompensationCalculatorProps {
  distributorName: string;
  currentRank: string;
}

// Product definitions
const PRODUCTS = {
  pulsemarket: {
    name: 'PulseMarket',
    memberPrice: 59,
    retailPrice: 79,
    commission: 16.48,
    credits: 59,
    overridePool: 10.99,
  },
  pulseflow: {
    name: 'PulseFlow',
    memberPrice: 129,
    retailPrice: 149,
    commission: 36.03,
    credits: 129,
    overridePool: 24.02,
  },
  pulsedrive: {
    name: 'PulseDrive',
    memberPrice: 349,
    retailPrice: 399,
    commission: 97.48,
    credits: 349,
    overridePool: 64.99,
  },
  pulsecommand: {
    name: 'PulseCommand',
    memberPrice: 399,
    retailPrice: 499,
    commission: 111.41,
    credits: 399,
    overridePool: 74.28,
  },
  businesscenter: {
    name: 'Business Center',
    memberPrice: 39,
    retailPrice: 39,
    commission: 0, // No seller commission
    credits: 39,
    overridePool: 18.00, // Fixed: $8 L1 + $10 for L2-L7
  },
};

// Rank definitions
const RANKS = {
  Starter: { levels: 1, name: 'Starter', bonus: 0 },
  Bronze: { levels: 2, name: 'Bronze', bonus: 250 },
  Silver: { levels: 3, name: 'Silver', bonus: 1000 },
  Gold: { levels: 4, name: 'Gold', bonus: 3000 },
  Platinum: { levels: 5, name: 'Platinum', bonus: 7500 },
  Ruby: { levels: 6, name: 'Ruby', bonus: 12000 },
  Diamond: { levels: 7, name: 'Diamond', bonus: 18000 },
  Crown: { levels: 7, name: 'Crown', bonus: 22000 },
  Elite: { levels: 7, name: 'Elite', bonus: 30000 },
};

// Override percentages by level (% of pool)
const OVERRIDE_PERCENTAGES = {
  L1: 0.30,
  L2: 0.25,
  L3: 0.20,
  L4: 0.15,
  L5: 0.10,
  L6: 0.08,
  L7: 0.05,
};

// Business Center special rules
const BC_OVERRIDES = {
  L1: 8.00,
  L2: 1.67,
  L3: 1.67,
  L4: 1.67,
  L5: 1.67,
  L6: 1.67,
  L7: 1.67,
};

export default function CompensationCalculator({ distributorName, currentRank }: CompensationCalculatorProps) {
  // Normalize rank to match RANKS keys (handle lowercase, "affiliate", etc.)
  const normalizeRank = (rank: string): keyof typeof RANKS => {
    // Capitalize first letter
    const normalized = rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
    // Map "Affiliate" to "Starter" (default rank)
    if (normalized === 'Affiliate') return 'Starter';
    // Check if it's a valid rank
    if (normalized in RANKS) return normalized as keyof typeof RANKS;
    // Default to Starter
    return 'Starter';
  };

  // Personal Sales
  const [personalSales, setPersonalSales] = useState({
    pulsemarket: 0,
    pulseflow: 0,
    pulsedrive: 0,
    pulsecommand: 0,
    businesscenter: 0,
  });

  // Team Sales by Level
  const [teamSales, setTeamSales] = useState({
    L1: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
    L2: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
    L3: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
    L4: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
    L5: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
    L6: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
    L7: { pulsemarket: 0, pulseflow: 0, pulsedrive: 0, pulsecommand: 0, businesscenter: 0 },
  });

  const [selectedRank, setSelectedRank] = useState(normalizeRank(currentRank));

  // Calculate personal commission
  const calculatePersonalCommission = () => {
    let total = 0;
    Object.entries(personalSales).forEach(([product, quantity]) => {
      total += PRODUCTS[product as keyof typeof PRODUCTS].commission * quantity;
    });
    return total;
  };

  // Calculate personal credits
  const calculatePersonalCredits = () => {
    let total = 0;
    Object.entries(personalSales).forEach(([product, quantity]) => {
      total += PRODUCTS[product as keyof typeof PRODUCTS].credits * quantity;
    });
    return total;
  };

  // Calculate team overrides
  const calculateTeamOverrides = () => {
    const rankKey = selectedRank as keyof typeof RANKS;
    const maxLevels = RANKS[rankKey]?.levels || 1; // Default to 1 if rank not found
    let total = 0;

    // For each level we're qualified for
    for (let level = 1; level <= maxLevels; level++) {
      const levelKey = `L${level}` as keyof typeof teamSales;
      const levelSales = teamSales[levelKey];

      // For each product sold at this level
      Object.entries(levelSales).forEach(([product, quantity]) => {
        if (quantity > 0) {
          const productData = PRODUCTS[product as keyof typeof PRODUCTS];

          if (product === 'businesscenter') {
            // Business Center has fixed dollar amounts
            total += BC_OVERRIDES[levelKey] * quantity;
          } else {
            // Regular products use percentage of override pool
            const overridePercentage = OVERRIDE_PERCENTAGES[levelKey];
            total += productData.overridePool * overridePercentage * quantity;
          }
        }
      });
    }

    return total;
  };

  // Calculate group credits
  const calculateGroupCredits = () => {
    let total = calculatePersonalCredits(); // Start with personal

    // Add all team credits
    Object.values(teamSales).forEach((level) => {
      Object.entries(level).forEach(([product, quantity]) => {
        total += PRODUCTS[product as keyof typeof PRODUCTS].credits * quantity;
      });
    });

    return total;
  };

  const personalCommission = calculatePersonalCommission();
  const teamOverrides = calculateTeamOverrides();
  const personalCredits = calculatePersonalCredits();
  const groupCredits = calculateGroupCredits();
  const totalMonthly = personalCommission + teamOverrides;
  const qualified = personalCredits >= 50;

  return (
    <div className="space-y-6">
      {/* Qualification Status */}
      <div className={`p-4 rounded-lg border-2 ${qualified ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Override Qualification Status</p>
            <p className="text-xs text-gray-600 mt-1">
              {qualified
                ? `✅ QUALIFIED - You have ${personalCredits} credits (need 50+)`
                : `❌ NOT QUALIFIED - You have ${personalCredits} credits (need 50+)`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{personalCredits}</p>
            <p className="text-xs text-gray-500">Personal Credits</p>
          </div>
        </div>
      </div>

      {/* Rank Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Your Rank</label>
        <select
          value={selectedRank}
          onChange={(e) => setSelectedRank(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
        >
          {Object.entries(RANKS).map(([key, rank]) => (
            <option key={key} value={key}>
              {rank.name} (Levels 1-{rank.levels}) - ${rank.bonus.toLocaleString()} Rank Bonus
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Unlocked Levels: L1-L{RANKS[selectedRank as keyof typeof RANKS]?.levels || 1}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Sales Input */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Your Personal Sales</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(PRODUCTS).map(([key, product]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {product.name} (${product.retailPrice}/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  value={personalSales[key as keyof typeof personalSales]}
                  onChange={(e) =>
                    setPersonalSales({ ...personalSales, [key]: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="# of sales"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Commission: ${product.commission.toFixed(2)} | Credits: {product.credits}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Sales Input */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Team Sales by Level</h2>
          </div>

          <div className="space-y-6">
            {(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] as const).map((level) => {
              const levelNum = parseInt(level.substring(1));
              const maxLevels = RANKS[selectedRank as keyof typeof RANKS]?.levels || 1;
              const unlocked = levelNum <= maxLevels;

              return (
                <div
                  key={level}
                  className={`border rounded-lg p-4 ${unlocked ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-50'}`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {level} - {unlocked ? '✅ Unlocked' : '🔒 Locked'}
                  </h3>

                  {unlocked && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(PRODUCTS).map(([key, product]) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-600 mb-1">{product.name}</label>
                          <input
                            type="number"
                            min="0"
                            value={teamSales[level][key as keyof typeof PRODUCTS]}
                            onChange={(e) =>
                              setTeamSales({
                                ...teamSales,
                                [level]: {
                                  ...teamSales[level],
                                  [key]: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {!unlocked && (
                    <p className="text-xs text-gray-500">
                      Unlock by reaching {Object.keys(RANKS).find((k) => RANKS[k as keyof typeof RANKS].levels >= levelNum)} rank
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">Your Monthly Earnings Projection</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <p className="text-sm font-medium">Personal Commission</p>
            </div>
            <p className="text-3xl font-bold">${personalCommission.toFixed(2)}</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <p className="text-sm font-medium">Team Overrides</p>
            </div>
            <p className="text-3xl font-bold">
              {qualified ? `$${teamOverrides.toFixed(2)}` : '$0.00'}
            </p>
            {!qualified && <p className="text-xs mt-1 text-yellow-300">Need 50 credits to qualify</p>}
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium">Group Credits</p>
            </div>
            <p className="text-3xl font-bold">{groupCredits.toLocaleString()}</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5" />
              <p className="text-sm font-medium">Rank Bonus</p>
            </div>
            <p className="text-3xl font-bold">
              ${(RANKS[selectedRank as keyof typeof RANKS]?.bonus || 0).toLocaleString()}
            </p>
            <p className="text-xs mt-1">One-time payment</p>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Total Monthly Income</p>
              <p className="text-5xl font-bold mt-1">
                ${qualified ? totalMonthly.toFixed(2) : personalCommission.toFixed(2)}
              </p>
              <p className="text-sm text-white/80 mt-2">
                Annual Projection: ${qualified ? (totalMonthly * 12).toFixed(2) : (personalCommission * 12).toFixed(2)}
              </p>
            </div>
            {!qualified && (
              <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">⚠️ Override bonuses disabled</p>
                <p className="text-xs">Sell {50 - personalCredits} more credits to qualify</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Business Center pays NO commission to sellers ($0) - you only earn from team overrides ($8 L1, $1.67 L2-L7). Focus on building DEPTH!
        </p>
      </div>
    </div>
  );
}
