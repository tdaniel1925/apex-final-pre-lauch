'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentInfoSchema, type PaymentInfoFormData, maskSensitiveData } from '@/lib/profile/validation';
import { ACCOUNT_TYPE_OPTIONS, PAYOUT_SCHEDULE_OPTIONS } from '@/types/profile';
import { Loader2, Save, CheckCircle2, CreditCard, Shield, AlertCircle } from 'lucide-react';

interface PaymentInfoTabProps {
  userId: string;
}

export default function PaymentInfoTab({ userId }: PaymentInfoTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<PaymentInfoFormData>({
    resolver: zodResolver(paymentInfoSchema),
    defaultValues: {
      payment_method: 'ach',
      minimum_payout_threshold: 50,
      payout_schedule: 'weekly',
    },
  });

  const paymentMethod = watch('payment_method');

  // Load existing payment info
  useEffect(() => {
    const loadPaymentInfo = async () => {
      try {
        const response = await fetch('/api/profile/payment');
        if (response.ok) {
          const data = await response.json();
          setExistingData(data);
          reset({
            payment_method: data.payment_method || 'ach',
            bank_name: data.bank_name || '',
            account_type: data.account_type || 'checking',
            routing_number: '', // Don't populate - user must re-enter
            account_number: '', // Don't populate - user must re-enter
            account_holder_name: data.account_holder_name || '',
            minimum_payout_threshold: data.minimum_payout_threshold || 50,
            payout_schedule: data.payout_schedule || 'weekly',
          });
        }
      } catch (error) {
        console.error('Failed to load payment info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentInfo();
  }, [reset]);

  const onSubmit = async (data: PaymentInfoFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/profile/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment info');
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apex-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">
          Payment Information
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Manage your bank account and payout preferences (UI Preview Only)
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">UI Preview Only</p>
              <p className="text-xs text-amber-700 mt-1">
                This form saves data to the database but does not process real payments. Real ACH
                integration will be added in a future update.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">Payment information updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm text-red-800">{submitError}</span>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>

          <div className="grid grid-cols-2 gap-4">
            <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'ach'
                ? 'border-apex-primary bg-apex-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                value="ach"
                {...register('payment_method')}
                className="sr-only"
              />
              <CreditCard className={`h-8 w-8 mb-2 ${
                paymentMethod === 'ach' ? 'text-apex-primary' : 'text-gray-400'
              }`} />
              <span className={`font-medium text-sm ${
                paymentMethod === 'ach' ? 'text-apex-primary' : 'text-gray-700'
              }`}>
                ACH Transfer
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Direct deposit to your bank
              </span>
            </label>

            <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'check'
                ? 'border-apex-primary bg-apex-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                value="check"
                {...register('payment_method')}
                className="sr-only"
              />
              <Shield className={`h-8 w-8 mb-2 ${
                paymentMethod === 'check' ? 'text-apex-primary' : 'text-gray-400'
              }`} />
              <span className={`font-medium text-sm ${
                paymentMethod === 'check' ? 'text-apex-primary' : 'text-gray-700'
              }`}>
                Paper Check
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Mailed to your address
              </span>
            </label>
          </div>
        </div>

        {/* Bank Account Details (only for ACH) */}
        {paymentMethod === 'ach' && (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Bank Account Details</h3>

            {existingData?.bank_verified && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">Bank account verified</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('bank_name')}
                placeholder="Wells Fargo, Chase, Bank of America, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.bank_name && (
                <p className="mt-1 text-xs text-red-600">{errors.bank_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('account_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                {ACCOUNT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.account_type && (
                <p className="mt-1 text-xs text-red-600">{errors.account_type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Routing Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('routing_number')}
                  placeholder="9 digits"
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent font-mono"
                />
                {errors.routing_number && (
                  <p className="mt-1 text-xs text-red-600">{errors.routing_number.message}</p>
                )}
                {existingData?.routing_number_last4 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Current: {maskSensitiveData(existingData.routing_number_last4, 4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('account_number')}
                  placeholder="4-17 digits"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent font-mono"
                />
                {errors.account_number && (
                  <p className="mt-1 text-xs text-red-600">{errors.account_number.message}</p>
                )}
                {existingData?.account_number_last4 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Current: {maskSensitiveData(existingData.account_number_last4, 4)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('account_holder_name')}
                placeholder="Name on account"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.account_holder_name && (
                <p className="mt-1 text-xs text-red-600">{errors.account_holder_name.message}</p>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Security Note:</strong> Only the last 4 digits of your routing and account
                numbers are stored in our database for security purposes.
              </p>
            </div>
          </div>
        )}

        {/* Payout Preferences */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Payout Preferences</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Minimum Payout Threshold
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">$</span>
              <input
                type="number"
                {...register('minimum_payout_threshold', { valueAsNumber: true })}
                min={25}
                max={500}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              <span className="text-sm text-gray-500">
                (Minimum: $25, Maximum: $500)
              </span>
            </div>
            {errors.minimum_payout_threshold && (
              <p className="mt-1 text-xs text-red-600">{errors.minimum_payout_threshold.message}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-500">
              Payouts will only be processed when your balance reaches this amount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payout Schedule
            </label>
            <div className="space-y-2">
              {PAYOUT_SCHEDULE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('payout_schedule')}
                      className="w-4 h-4 text-apex-primary focus:ring-apex-primary"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.subtitle}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
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
                Save Payment Info
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
  );
}
