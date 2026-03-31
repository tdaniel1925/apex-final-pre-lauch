'use client';

// =============================================
// Export Button Component
// Client component for exporting data to CSV
// =============================================

import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: 'sales' | 'commissions';
}

export default function ExportButton({ data, filename, type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Convert data to CSV
  const convertToCSV = (data: any[], type: 'sales' | 'commissions') => {
    if (data.length === 0) return '';

    let headers: string[];
    let rows: string[][];

    if (type === 'sales') {
      headers = ['Order Number', 'Date', 'Product', 'Amount', 'Customer Email', 'BV Amount', 'Status'];
      rows = data.map((sale) => [
        sale.order_number || '',
        new Date(sale.date).toLocaleDateString('en-US'),
        sale.product || '',
        `$${sale.amount.toFixed(2)}`,
        sale.customer_email || '',
        sale.bv_amount?.toString() || '0',
        sale.status || '',
      ]);
    } else {
      headers = ['Date', 'Type', 'Amount', 'From', 'Status', 'Month'];
      rows = data.map((comm) => [
        new Date(comm.date).toLocaleDateString('en-US'),
        comm.type || '',
        `$${comm.amount.toFixed(2)}`,
        comm.from || '-',
        comm.status || '',
        comm.month_year || '-',
      ]);
    }

    // Escape fields that contain commas or quotes
    const escapeField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    // Build CSV string
    const csvRows = [
      headers.map(escapeField).join(','),
      ...rows.map((row) => row.map(escapeField).join(',')),
    ];

    return csvRows.join('\n');
  };

  // Download CSV file
  const downloadCSV = () => {
    setIsExporting(true);

    try {
      const csv = convertToCSV(data, type);

      if (!csv) {
        alert('No data to export');
        setIsExporting(false);
        return;
      }

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}-${date}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fullFilename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={downloadCSV}
      disabled={isExporting || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      <Download className="w-4 h-4" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
