'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

interface Integration {
  id: string;
  platform_name: string;
  display_name: string;
  is_enabled: boolean;
}

interface BulkImportClientProps {
  integrations: Integration[];
}

interface ImportResult {
  created: number;
  skipped: number;
  errors?: Array<{ index: number; error: string }>;
}

export function BulkImportClient({ integrations }: BulkImportClientProps) {
  const router = useRouter();
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        setCsvFile(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setCsvFile(null);
        return;
      }

      setCsvFile(file);
      setError(null);
      setResult(null);
    }
  };

  const parseCsvRow = (row: string): string[] => {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    values.push(currentValue.trim());
    return values;
  };

  const handleUpload = async () => {
    if (!csvFile || !selectedIntegration) {
      setError('Please select an integration and upload a CSV file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      // Read CSV file
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row');
      }

      // Parse header
      const headers = parseCsvRow(lines[0]).map(h => h.toLowerCase().trim());

      // Validate required columns
      const requiredColumns = ['external_product_id', 'external_product_name'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Parse data rows
      const mappings = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvRow(lines[i]);
        if (values.length === 0 || values.every(v => !v)) continue;

        const mapping: Record<string, string | number | boolean | null> = {};

        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (!value) return;

          switch (header) {
            case 'external_product_id':
              mapping.external_product_id = value;
              break;
            case 'external_product_name':
              mapping.external_product_name = value;
              break;
            case 'external_product_sku':
              mapping.external_product_sku = value;
              break;
            case 'tech_credits':
              mapping.tech_credits = parseFloat(value) || 0;
              break;
            case 'insurance_credits':
              mapping.insurance_credits = parseFloat(value) || 0;
              break;
            case 'direct_commission_percentage':
              mapping.direct_commission_percentage = parseFloat(value) || 0;
              break;
            case 'override_commission_percentage':
              mapping.override_commission_percentage = parseFloat(value) || 0;
              break;
            case 'fixed_commission_amount':
              mapping.fixed_commission_amount = parseFloat(value) || null;
              break;
            case 'commission_type':
              mapping.commission_type = value;
              break;
            case 'is_active':
              mapping.is_active = value.toLowerCase() === 'true' || value === '1';
              break;
            case 'notes':
              mapping.notes = value;
              break;
          }
        });

        if (mapping.external_product_id && mapping.external_product_name) {
          mappings.push(mapping);
        }
      }

      if (mappings.length === 0) {
        throw new Error('No valid mappings found in CSV file');
      }

      if (mappings.length > 100) {
        throw new Error('Cannot import more than 100 mappings at once');
      }

      // Send to API
      const response = await fetch('/api/admin/integrations/product-mappings/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration,
          mappings,
          skip_duplicates: skipDuplicates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validation_errors) {
          throw new Error(
            `Validation errors:\n${(data.validation_errors as Array<{ index: number; error: string }>)
              .map((e) => `Row ${e.index + 2}: ${e.error}`)
              .join('\n')}`
          );
        }
        throw new Error(data.error || 'Failed to import mappings');
      }

      setResult({
        created: data.created,
        skipped: data.skipped,
      });

      // Reset form
      setCsvFile(null);
      if (document.getElementById('csv-upload') as HTMLInputElement) {
        (document.getElementById('csv-upload') as HTMLInputElement).value = '';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `external_product_id,external_product_name,external_product_sku,tech_credits,insurance_credits,direct_commission_percentage,override_commission_percentage,fixed_commission_amount,commission_type,is_active,notes
prod_001,Business Starter Package,SKU-001,100,50,20,10,,percentage,true,Monthly subscription
prod_002,Pro Package,SKU-002,200,100,25,15,,percentage,true,Annual subscription
prod_003,Enterprise Plan,SKU-003,500,250,,,500,fixed,true,One-time setup fee`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-mappings-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/integrations/product-mappings"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Mappings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Bulk Import Product Mappings</h1>
        <p className="text-slate-600 mt-1">
          Upload a CSV file to create multiple product mappings at once
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CSV Format Instructions
        </h2>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Required columns:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code className="bg-blue-100 px-1 rounded">external_product_id</code> - Unique product ID from external platform</li>
            <li><code className="bg-blue-100 px-1 rounded">external_product_name</code> - Product name</li>
          </ul>
          <p className="mt-3"><strong>Optional columns:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code className="bg-blue-100 px-1 rounded">external_product_sku</code></li>
            <li><code className="bg-blue-100 px-1 rounded">tech_credits</code> (number)</li>
            <li><code className="bg-blue-100 px-1 rounded">insurance_credits</code> (number)</li>
            <li><code className="bg-blue-100 px-1 rounded">direct_commission_percentage</code> (0-100)</li>
            <li><code className="bg-blue-100 px-1 rounded">override_commission_percentage</code> (0-100)</li>
            <li><code className="bg-blue-100 px-1 rounded">fixed_commission_amount</code> (number)</li>
            <li><code className="bg-blue-100 px-1 rounded">commission_type</code> (credits/percentage/fixed/none)</li>
            <li><code className="bg-blue-100 px-1 rounded">is_active</code> (true/false)</li>
            <li><code className="bg-blue-100 px-1 rounded">notes</code></li>
          </ul>
        </div>
        <button
          onClick={downloadTemplate}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template CSV
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
        <div className="space-y-6">
          {/* Integration Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Integration Platform *
            </label>
            <select
              value={selectedIntegration}
              onChange={(e) => setSelectedIntegration(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              disabled={uploading}
            >
              <option value="">Select Integration</option>
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                  {integration.display_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              All mappings in the CSV will be associated with this integration
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              CSV File *
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-12 h-12 text-slate-400" />
                {csvFile ? (
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{csvFile.name}</p>
                    <p className="text-slate-500">
                      {(csvFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold">Click to upload CSV file</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Maximum file size: 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                disabled={uploading}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-sm font-medium text-slate-700">
                Skip duplicate products
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-6">
              If unchecked, import will fail if any product ID already exists
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600 whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Import successful!</p>
                  <ul className="space-y-1">
                    <li>{result.created} mapping(s) created</li>
                    {result.skipped > 0 && (
                      <li>{result.skipped} mapping(s) skipped (duplicates)</li>
                    )}
                  </ul>
                  <Link
                    href="/admin/integrations/product-mappings"
                    className="inline-block mt-3 text-green-700 hover:underline font-medium"
                  >
                    View all product mappings
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/admin/integrations/product-mappings"
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleUpload}
              disabled={!selectedIntegration || !csvFile || uploading}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload & Import'}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Need Help?</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Maximum 100 mappings per import</li>
          <li>• Ensure product IDs match exactly what the external platform uses</li>
          <li>• Commission percentages must be between 0 and 100</li>
          <li>• Credits must be non-negative numbers</li>
        </ul>
      </div>
    </>
  );
}
