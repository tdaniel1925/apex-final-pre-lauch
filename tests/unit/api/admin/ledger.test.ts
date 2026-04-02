/**
 * Admin Ledger API Tests
 * Tests compensation plan metrics ledger endpoint
 */

import { describe, it, expect } from 'vitest';

interface LedgerRow {
  transactionId: string;
  amount: number;
  bv: number;
  pv: number;
  gv: number;
  breakage: number;
  paidCommissions: number;
  productSlug: string | null;
  isPersonalPurchase: boolean | null;
  sellerName: string;
  sponsorName: string;
  techRank: string;
  customerName?: string;
  customerEmail?: string;
}

describe('/api/admin/ledger', () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050';

  it('should fetch ledger data successfully', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?dateRange=all`);

    expect(response.ok).toBe(true);

    const data = await response.json();

    expect(data).toHaveProperty('ledgerData');
    expect(data).toHaveProperty('totalCount');
    expect(data).toHaveProperty('summary');
    expect(Array.isArray(data.ledgerData)).toBe(true);
  });

  it('should include compensation metrics in ledger schema', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?dateRange=all`);
    const data = await response.json();

    // Even if no data exists, the schema should be correct
    if (data.ledgerData.length > 0) {
      const row = data.ledgerData[0];

      // Check for required compensation metrics
      expect(row).toHaveProperty('bv'); // Business Volume
      expect(row).toHaveProperty('pv'); // Personal Volume
      expect(row).toHaveProperty('gv'); // Group Volume
      expect(row).toHaveProperty('breakage'); // Pending commissions
      expect(row).toHaveProperty('paidCommissions'); // Paid commissions
      expect(row).toHaveProperty('sellerName'); // Seller info
      expect(row).toHaveProperty('sponsorName'); // Sponsor info
      expect(row).toHaveProperty('techRank'); // Tech rank
    } else {
      // If no data, just ensure the response structure is valid
      expect(data.totalCount).toBe(0);
    }
  });

  it('should filter by date range', async () => {
    const response7Days = await fetch(`${baseUrl}/api/admin/ledger?dateRange=7`);
    const response30Days = await fetch(`${baseUrl}/api/admin/ledger?dateRange=30`);

    expect(response7Days.ok).toBe(true);
    expect(response30Days.ok).toBe(true);

    const data7 = await response7Days.json();
    const data30 = await response30Days.json();

    // 30 days should include all transactions from 7 days (or equal)
    expect(data30.totalCount).toBeGreaterThanOrEqual(data7.totalCount);
  });

  it('should filter by product slug', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?productSlug=pulseflow&dateRange=all`);

    expect(response.ok).toBe(true);

    const data = await response.json();

    // All results should be for pulseflow product (if any exist)
    data.ledgerData.forEach((row: LedgerRow) => {
      if (row.productSlug) {
        expect(row.productSlug).toBe('pulseflow');
      }
    });
  });

  it('should include summary metrics', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?dateRange=all`);
    const data = await response.json();

    expect(data.summary).toHaveProperty('totalBV');
    expect(data.summary).toHaveProperty('totalBreakage');
    expect(data.summary).toHaveProperty('totalPaid');
    expect(data.summary).toHaveProperty('totalSales');
    expect(data.summary).toHaveProperty('transactionCount');

    expect(typeof data.summary.totalBV).toBe('number');
    expect(typeof data.summary.totalBreakage).toBe('number');
    expect(typeof data.summary.totalPaid).toBe('number');
    expect(typeof data.summary.totalSales).toBe('number');
  });

  it('should handle pagination correctly', async () => {
    const page1 = await fetch(`${baseUrl}/api/admin/ledger?page=1&limit=10&dateRange=all`);
    const page2 = await fetch(`${baseUrl}/api/admin/ledger?page=2&limit=10&dateRange=all`);

    expect(page1.ok).toBe(true);
    expect(page2.ok).toBe(true);

    const data1 = await page1.json();
    const data2 = await page2.json();

    expect(data1.page).toBe(1);
    expect(data2.page).toBe(2);

    // Ensure different pages return different data (if enough records exist)
    if (data1.totalCount > 10) {
      const ids1 = data1.ledgerData.map((r: LedgerRow) => r.transactionId);
      const ids2 = data2.ledgerData.map((r: LedgerRow) => r.transactionId);
      expect(ids1).not.toEqual(ids2);
    }
  });

  it('should return empty array when filtering by non-existent distributor', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?distributorId=00000000-0000-0000-0000-000000000000`);

    expect(response.ok).toBe(true);

    const data = await response.json();

    expect(data.ledgerData).toEqual([]);
    expect(data.totalCount).toBe(0);
  });

  it('should handle invalid parameters gracefully', async () => {
    // Test with invalid page number
    const response = await fetch(`${baseUrl}/api/admin/ledger?page=abc`);

    // Should still return a valid response (defaults to page 1)
    expect(response.status).toBeLessThan(500);
  });

  it('should include purchase type indicators', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?dateRange=all`);
    const data = await response.json();

    if (data.ledgerData.length > 0) {
      data.ledgerData.forEach((row: LedgerRow) => {
        // isPersonalPurchase should be boolean or null
        expect([true, false, null]).toContain(row.isPersonalPurchase);

        // Should have customer fields defined (even if null)
        expect(row).toHaveProperty('customerName');
        expect(row).toHaveProperty('customerEmail');
      });
    }
  });

  it('should calculate summary metrics correctly from ledger data', async () => {
    const response = await fetch(`${baseUrl}/api/admin/ledger?dateRange=all`);
    const data = await response.json();

    if (data.ledgerData.length > 0) {
      // Manually calculate totals from ledgerData
      const calculatedTotalBV = data.ledgerData.reduce((sum: number, row: LedgerRow) => sum + row.bv, 0);
      const calculatedTotalBreakage = data.ledgerData.reduce((sum: number, row: LedgerRow) => sum + row.breakage, 0);
      const calculatedTotalPaid = data.ledgerData.reduce((sum: number, row: LedgerRow) => sum + row.paidCommissions, 0);
      const calculatedTotalSales = data.ledgerData.reduce((sum: number, row: LedgerRow) => sum + row.amount, 0);

      // Allow for small rounding differences
      expect(Math.abs(data.summary.totalBV - calculatedTotalBV)).toBeLessThan(1);
      expect(Math.abs(data.summary.totalBreakage - calculatedTotalBreakage)).toBeLessThan(0.01);
      expect(Math.abs(data.summary.totalPaid - calculatedTotalPaid)).toBeLessThan(0.01);
      expect(Math.abs(data.summary.totalSales - calculatedTotalSales)).toBeLessThan(0.01);
    }
  });
});
