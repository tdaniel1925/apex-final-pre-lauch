'use client';

/**
 * Enhanced Profile Edit Form
 * Uses React Hook Form + Zod validation
 * Integrates with /api/profile/comprehensive endpoint
 * Supports name, address, phone, company changes
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  personalInfoSchema,
  addressSchema,
} from '@/lib/validation/profile-schemas';
import type { Distributor } from '@/lib/types';

// Schema for safe profile updates (excludes email)
const safeProfileUpdateSchema = z.object({
  // Personal info (excluding email)
  first_name: personalInfoSchema.shape.first_name.optional(),
  last_name: personalInfoSchema.shape.last_name.optional(),
  phone: personalInfoSchema.shape.phone.optional(),
  date_of_birth: personalInfoSchema.shape.date_of_birth.optional(),
  company_name: personalInfoSchema.shape.company_name.optional(),

  // Business fields (editable for business registrations)
  dba_name: personalInfoSchema.shape.dba_name.optional(),
  business_website: personalInfoSchema.shape.business_website.optional(),

  // Address
  address_line1: addressSchema.shape.address_line1.optional(),
  address_line2: addressSchema.shape.address_line2.optional(),
  city: addressSchema.shape.city.optional(),
  state: addressSchema.shape.state.optional(),
  zip: addressSchema.shape.zip.optional(),
});

type SafeProfileUpdate = z.infer<typeof safeProfileUpdateSchema>;

interface ProfileEditFormProps {
  distributor: Distributor;
  userEmail: string;
  onSuccess?: () => void;
}

interface UpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
  distributor?: Distributor;
  changes?: {
    updated: string[];
    count: number;
  };
  sync?: {
    queued: number;
    failed: number;
    platforms: string[];
  };
  details?: Record<string, string[]>;
}

export default function ProfileEditForm({
  distributor,
  userEmail,
  onSuccess,
}: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string[];
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SafeProfileUpdate>({
    resolver: zodResolver(safeProfileUpdateSchema),
    defaultValues: {
      first_name: distributor.first_name || undefined,
      last_name: distributor.last_name || undefined,
      phone: distributor.phone || undefined,
      date_of_birth: distributor.date_of_birth || undefined,
      company_name: distributor.company_name || undefined,
      dba_name: (distributor as any).dba_name || undefined,
      business_website: (distributor as any).business_website || undefined,
      address_line1: distributor.address_line1 || undefined,
      address_line2: distributor.address_line2 || undefined,
      city: distributor.city || undefined,
      state: (distributor.state as any) || undefined,
      zip: distributor.zip || undefined,
    },
  });

  const onSubmit = async (data: SafeProfileUpdate) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/comprehensive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: UpdateResponse = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (result.details) {
          const errorMessages = Object.entries(result.details)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .slice(0, 3); // Show first 3 field errors

          setMessage({
            type: 'error',
            text: result.error || 'Validation failed',
            details: errorMessages,
          });
        } else {
          setMessage({
            type: 'error',
            text: result.error || result.message || 'Failed to update profile',
          });
        }
        return;
      }

      // Success
      const successDetails: string[] = [];

      if (result.changes && result.changes.count > 0) {
        successDetails.push(`Updated ${result.changes.count} field(s)`);
      }

      if (result.sync) {
        if (result.sync.queued > 0) {
          successDetails.push(
            `Syncing to ${result.sync.queued} platform(s): ${result.sync.platforms.join(', ')}`
          );
        }
        if (result.sync.failed > 0) {
          successDetails.push(
            `⚠️ ${result.sync.failed} platform(s) failed to queue (will retry)`
          );
        }
      }

      setMessage({
        type: 'success',
        text: result.message || 'Profile updated successfully!',
        details: successDetails.length > 0 ? successDetails : undefined,
      });

      // Reset form with new values
      if (result.distributor) {
        reset({
          first_name: result.distributor.first_name || undefined,
          last_name: result.distributor.last_name || undefined,
          phone: result.distributor.phone || undefined,
          date_of_birth: result.distributor.date_of_birth || undefined,
          company_name: result.distributor.company_name || undefined,
          dba_name: (result.distributor as any).dba_name || undefined,
          business_website: (result.distributor as any).business_website || undefined,
          address_line1: result.distributor.address_line1 || undefined,
          address_line2: result.distributor.address_line2 || undefined,
          city: result.distributor.city || undefined,
          state: (result.distributor.state as any) || undefined,
          zip: result.distributor.zip || undefined,
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-md border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {message.type === 'success' ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <div className="flex-1">
              <p className="font-semibold">{message.text}</p>
              {message.details && (
                <ul className="mt-2 text-sm space-y-1">
                  {message.details.map((detail, index) => (
                    <li key={index}>• {detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              {...register('first_name')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.first_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.first_name.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              {...register('last_name')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.last_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.last_name.message}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email changes require verification. Contact support to change your
              email.
            </p>
          </div>

          {/* Phone */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="(555) 123-4567"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              {...register('date_of_birth')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_of_birth && (
              <p className="mt-1 text-sm text-red-600">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              {...register('company_name')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.company_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.company_name.message}
              </p>
            )}
          </div>

          {/* Registration Type (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Type
            </label>
            <input
              type="text"
              value={(distributor as any).registration_type === 'business' ? 'Business' : 'Personal'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 capitalize"
            />
            <p className="mt-1 text-xs text-gray-500">
              Registration type cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Business Type (Readonly, only for business registrations) */}
          {(distributor as any).registration_type === 'business' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type
              </label>
              <input
                type="text"
                value={
                  (distributor as any).business_type === 'llc' ? 'LLC' :
                  (distributor as any).business_type === 'corporation' ? 'Corporation' :
                  (distributor as any).business_type === 's_corporation' ? 'S Corporation' :
                  (distributor as any).business_type === 'partnership' ? 'Partnership' :
                  (distributor as any).business_type === 'sole_proprietor' ? 'Sole Proprietor' :
                  ''
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Business type cannot be changed. Contact support if needed.
              </p>
            </div>
          )}

          {/* DBA Name (Editable, only for business registrations) */}
          {(distributor as any).registration_type === 'business' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DBA Name (Optional)
              </label>
              <input
                type="text"
                {...register('dba_name')}
                placeholder="Doing Business As name"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.dba_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your DBA ("Doing Business As") name if your business operates under a different name
              </p>
              {errors.dba_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dba_name.message}
                </p>
              )}
            </div>
          )}

          {/* Business Website (Editable, only for business registrations) */}
          {(distributor as any).registration_type === 'business' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Website (Optional)
              </label>
              <input
                type="url"
                {...register('business_website')}
                placeholder="https://www.example.com"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.business_website ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.business_website && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.business_website.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>

        <div className="grid grid-cols-1 gap-4">
          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              {...register('address_line1')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.address_line1 ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address_line1 && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              {...register('address_line2')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.address_line2 ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address_line2 && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address_line2.message}
              </p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                {...register('state')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select state</option>
                {[
                  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
                ].map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                {...register('zip')}
                placeholder="12345 or 12345-6789"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.zip ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.zip && (
                <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg">
        <p className="text-sm text-gray-600">
          {isDirty
            ? 'You have unsaved changes'
            : 'All changes are saved'}
        </p>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="px-6 py-2 bg-[#2B4C7E] text-white rounded-md hover:bg-[#1a2c4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
