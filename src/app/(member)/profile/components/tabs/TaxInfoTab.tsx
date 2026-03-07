'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxInfoSchema, type TaxInfoFormData, maskSensitiveData } from '@/lib/profile/validation';
import { TAX_CLASSIFICATION_OPTIONS, TAXPAYER_ID_TYPE_OPTIONS, type UserTaxDocument } from '@/types/profile';
import { Loader2, Save, CheckCircle2, FileText, Upload, Download, AlertCircle } from 'lucide-react';

interface TaxInfoTabProps {
  userId: string;
}

export default function TaxInfoTab({ userId }: TaxInfoTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taxDocuments, setTaxDocuments] = useState<UserTaxDocument[]>([]);
  const [w9File, setW9File] = useState<File | null>(null);
  const [uploadingW9, setUploadingW9] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<TaxInfoFormData>({
    resolver: zodResolver(taxInfoSchema),
    defaultValues: {
      federal_tax_classification: 'individual',
    },
  });

  const taxpayerIdType = watch('taxpayer_id_type');

  // Load existing tax info and documents
  useEffect(() => {
    const loadTaxInfo = async () => {
      try {
        const [infoResponse, docsResponse] = await Promise.all([
          fetch('/api/profile/tax'),
          fetch('/api/profile/tax/documents'),
        ]);

        if (infoResponse.ok) {
          const data = await infoResponse.json();
          setExistingData(data);
          reset({
            taxpayer_id_type: data.taxpayer_id_type || 'ssn',
            tax_id: '', // Don't populate - user must re-enter
            legal_name: data.legal_name || '',
            business_name: data.business_name || '',
            federal_tax_classification: data.federal_tax_classification || 'individual',
          });
        }

        if (docsResponse.ok) {
          const docs = await docsResponse.json();
          setTaxDocuments(docs);
        }
      } catch (error) {
        console.error('Failed to load tax info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTaxInfo();
  }, [reset]);

  const onSubmit = async (data: TaxInfoFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/profile/tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update tax info');
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleW9Upload = async () => {
    if (!w9File) return;

    setUploadingW9(true);
    try {
      const formData = new FormData();
      formData.append('w9', w9File);

      const response = await fetch('/api/profile/tax/w9', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload W-9');
      }

      alert('W-9 uploaded successfully!');
      setW9File(null);
    } catch (error) {
      alert('Failed to upload W-9: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingW9(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apex-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tax information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tax Information Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Tax Information
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage your tax details and documentation (UI Preview Only)
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">UI Preview Only</p>
                <p className="text-xs text-amber-700 mt-1">
                  This form saves data to the database but does not generate real 1099 tax documents.
                  Real tax document generation will be added in a future update.
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">Tax information updated successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-800">{submitError}</span>
            </div>
          )}

          {/* Tax Identification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Tax Identification</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Taxpayer ID Type
              </label>
              <select
                {...register('taxpayer_id_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                {TAXPAYER_ID_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {taxpayerIdType === 'ssn' ? 'Social Security Number (SSN)' :
                 taxpayerIdType === 'ein' ? 'Employer Identification Number (EIN)' :
                 'Individual Taxpayer ID (ITIN)'}
              </label>
              <input
                type="text"
                {...register('tax_id')}
                placeholder={taxpayerIdType === 'ein' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                maxLength={taxpayerIdType === 'ein' ? 10 : 11}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent font-mono"
              />
              {errors.tax_id && (
                <p className="mt-1 text-xs text-red-600">{errors.tax_id.message}</p>
              )}
              {existingData?.tax_id_last4 && (
                <p className="mt-1 text-xs text-gray-500">
                  Current: {maskSensitiveData(existingData.tax_id_last4, 4)}
                </p>
              )}
            </div>
          </div>

          {/* Legal Information */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Legal Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Legal Name (As it appears on tax documents)
              </label>
              <input
                type="text"
                {...register('legal_name')}
                placeholder="John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.legal_name && (
                <p className="mt-1 text-xs text-red-600">{errors.legal_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Business Name (Optional)
              </label>
              <input
                type="text"
                {...register('business_name')}
                placeholder="Your business name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.business_name && (
                <p className="mt-1 text-xs text-red-600">{errors.business_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Federal Tax Classification
              </label>
              <select
                {...register('federal_tax_classification')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                {TAX_CLASSIFICATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Security Note:</strong> Only the last 4 digits of your tax ID are stored
              in our database for security purposes.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-apex-primary text-white rounded-lg font-medium hover:bg-apex-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Tax Info
                </>
              )}
            </button>
            {!isDirty && (
              <span className="ml-3 text-xs text-gray-500">
                No changes to save
              </span>
            )}
          </div>
        </form>
      </div>

      {/* W-9 Form Upload */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            W-9 Tax Form
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload your completed W-9 form
          </p>
        </div>

        <div className="p-6 space-y-4">
          {existingData?.w9_form_url ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-900">W-9 Form Uploaded</div>
                  <div className="text-xs text-green-700 mt-0.5">
                    Uploaded on {new Date(existingData.w9_uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <a
                href={existingData.w9_form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Upload W-9 Form
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  PDF, JPG, or PNG up to 10MB
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setW9File(e.target.files?.[0] || null)}
                  className="hidden"
                  id="w9-upload"
                />
                <label
                  htmlFor="w9-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-apex-primary text-white rounded-lg cursor-pointer hover:bg-apex-secondary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </label>
                {w9File && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2">Selected: {w9File.name}</p>
                    <button
                      onClick={handleW9Upload}
                      disabled={uploadingW9}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {uploadingW9 ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload W-9
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Documents (1099s) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Tax Documents (1099-NEC)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Download your annual tax documents (Placeholder Files)
          </p>
        </div>

        <div className="p-6">
          {taxDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No tax documents available yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Documents will be generated after your first full tax year
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {taxDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {doc.document_type} - {doc.tax_year}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total Earnings: ${doc.total_earnings.toLocaleString()} • Generated {new Date(doc.generated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <a
                    href={doc.document_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-apex-primary text-white rounded-lg hover:bg-apex-secondary transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
