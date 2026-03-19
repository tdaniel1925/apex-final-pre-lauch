'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, type PersonalInfoFormData } from '@/lib/profile/validation';
import { GENDER_OPTIONS, US_STATES, US_TIMEZONES } from '@/types/profile';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { formatPhoneInput } from '@/lib/utils/format-phone';

interface PersonalInfoTabProps {
  userId: string;
  initialData: Partial<PersonalInfoFormData>;
}

export default function PersonalInfoTab({ userId, initialData }: PersonalInfoTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      date_of_birth: initialData.date_of_birth || '',
      gender: initialData.gender || 'prefer_not_to_say',
      street_address: initialData.street_address || '',
      city: initialData.city || '',
      state: initialData.state || '',
      zip_code: initialData.zip_code || '',
      language: initialData.language || 'en-US',
      timezone: initialData.timezone || 'America/Chicago',
    },
  });

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/profile/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">
          Personal Information
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Update your name, contact details, and address
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Success Message */}
        {submitSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">Profile updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm text-red-800">{submitError}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('first_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="555-123-4567"
              onChange={(e) => {
                // Auto-format as user types
                const formatted = formatPhoneInput(e.target.value);
                e.target.value = formatted;
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Will be formatted as 1-xxx-xxx-xxxx for SMS</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                {...register('date_of_birth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Address</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              {...register('street_address')}
              placeholder="123 Main Street, Apt 4B"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
            />
            {errors.street_address && (
              <p className="mt-1 text-xs text-red-600">{errors.street_address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                State
              </label>
              <select
                {...register('state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ZIP Code
              </label>
              <input
                type="text"
                {...register('zip_code')}
                placeholder="12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              />
              {errors.zip_code && (
                <p className="mt-1 text-xs text-red-600">{errors.zip_code.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Preferences</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Language
              </label>
              <select
                {...register('language')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Timezone
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-apex-primary focus:border-transparent"
              >
                {US_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
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
                Save Changes
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
