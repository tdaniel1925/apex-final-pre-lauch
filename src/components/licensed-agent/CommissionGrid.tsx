'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface CommissionProduct {
  company: string;
  product: string;
  rates: {
    [key: string]: number | string;
  };
}

interface CommissionGridProps {
  products: CommissionProduct[];
  levels: string[];
  type: 'annuity' | 'life';
}

export default function CommissionGrid({ products, levels, type }: CommissionGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('all');

  // Get unique carriers
  const carriers = useMemo(() => {
    const unique = [...new Set(products.map(p => p.company).filter(Boolean))];
    return ['all', ...unique];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Skip header row
      if (product.product === 'PRODUCT') return false;

      // Filter by search term
      const matchesSearch = searchTerm === '' ||
        product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.company.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by carrier
      const matchesCarrier = selectedCarrier === 'all' || product.company === selectedCarrier;

      return matchesSearch && matchesCarrier && product.product.trim();
    });
  }, [products, searchTerm, selectedCarrier]);

  // Group by carrier
  const groupedProducts = useMemo(() => {
    const groups: {[key: string]: CommissionProduct[]} = {};
    let currentCarrier = '';

    filteredProducts.forEach(product => {
      if (product.company) {
        currentCarrier = product.company;
      }
      if (!groups[currentCarrier]) {
        groups[currentCarrier] = [];
      }
      groups[currentCarrier].push(product);
    });

    return groups;
  }, [filteredProducts]);

  const themeColor = type === 'annuity' ? 'blue' : 'green';

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Carrier Filter */}
          <div className="md:w-64">
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Carriers</option>
              {carriers.slice(1).map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredProducts.length} products
        </div>
      </div>

      {/* Products by Carrier */}
      <div className="space-y-6">
        {Object.entries(groupedProducts).map(([carrier, carrierProducts]) => (
          <div key={carrier} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{carrier}</h3>
              <p className="text-sm text-gray-600 mt-1">{carrierProducts.length} products</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 sticky left-0 bg-gray-50">Product</th>
                    {levels.map(level => (
                      <th key={level} className={`text-center py-3 px-4 font-semibold text-${themeColor}-600 whitespace-nowrap`}>
                        {level}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {carrierProducts.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50">
                        {product.product}
                      </td>
                      {levels.map(level => {
                        const rate = product.rates[level.toLowerCase().replace(/[^a-z]/g, '')];
                        const isHighest = idx === 0 && levels.indexOf(level) === levels.length - 1;
                        return (
                          <td
                            key={level}
                            className={`text-center py-3 px-4 ${isHighest ? `font-bold text-${themeColor}-600` : ''}`}
                          >
                            {typeof rate === 'number' ? `${rate}%` : rate || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}
