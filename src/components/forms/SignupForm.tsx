'use client';

// =============================================
// Signup Form Component
// Handles distributor registration with matrix placement
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData, US_STATES } from '@/lib/validations/signup';
import { generateSlug } from '@/lib/utils/slug-client';
import { formatSSNInput, maskSSN } from '@/lib/utils/ssn';
import { formatEINInput } from '@/lib/utils/ein';
import { getMaxDate, getMinDate } from '@/lib/utils/date-validation';
import { formatPhoneInput } from '@/lib/utils/format-phone';

interface SignupFormProps {
  sponsorSlug?: string;
  sponsorName?: string;
}

export default function SignupForm({ sponsorSlug, sponsorName }: SignupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [slugCheckStatus, setSlugCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showSSN, setShowSSN] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      sponsor_slug: sponsorSlug || undefined,
      registration_type: 'personal', // Default to personal registration
    },
  });

  const watchFirstName = watch('first_name');
  const watchLastName = watch('last_name');
  const watchSlug = watch('slug');
  const watchPassword = watch('password');
  const watchRegistrationType = watch('registration_type');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchFirstName && watchLastName && !watchSlug) {
      const generated = generateSlug(watchFirstName, watchLastName);
      setValue('slug', generated);
    }
  }, [watchFirstName, watchLastName, watchSlug, setValue]);

  // Real-time slug availability check
  useEffect(() => {
    if (!watchSlug || watchSlug.length < 3) {
      setSlugCheckStatus('idle');
      return;
    }

    const checkSlug = async () => {
      setSlugCheckStatus('checking');
      try {
        const response = await fetch(`/api/slugs/check?slug=${encodeURIComponent(watchSlug)}`);
        const result = await response.json();

        if (result.success && result.data.available) {
          setSlugCheckStatus('available');
          setSlugSuggestions([]);
        } else {
          setSlugCheckStatus('taken');
          setSlugSuggestions(result.data.suggestions || []);
        }
      } catch (error) {
        console.error('Slug check error:', error);
        setSlugCheckStatus('idle');
      }
    };

    const timeoutId = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [watchSlug]);

  // Retry countdown timer for soft-deleted users
  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;

    const intervalId = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setSubmitError(null); // Clear error when countdown reaches 0
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [retryCountdown]);

  // Password strength indicator
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchPassword || '');

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setSubmitError(result.message || 'Signup failed. Please try again.');

        // Handle retry countdown for soft-deleted users
        if (result.retryAfter) {
          setRetryCountdown(result.retryAfter);
        }

        return;
      }

      // Success - store credentials in sessionStorage and redirect to credentials confirmation
      sessionStorage.setItem(
        'signup_credentials',
        JSON.stringify({
          username: data.slug,
          password: data.password,
          email: data.email,
        })
      );
      router.push('/signup/credentials');
    } catch (error) {
      console.error('Signup error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Sponsor Banner */}
      {sponsorName && (
        <div className="mb-8 px-6 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] text-white rounded-lg text-center" style={{paddingTop: '20px', paddingBottom: '20px'}}>
          <p className="text-sm opacity-90" style={{margin: 0, marginBottom: '4px'}}>You've been invited by</p>
          <p className="text-5xl font-bold leading-tight" style={{margin: 0, lineHeight: '1.1'}}>{sponsorName}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Registration Type Selection */}
        <div className="border-2 border-[#2B4C7E] rounded-lg p-4 bg-blue-50">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Are you registering as an individual or business? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Personal Registration Option */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                errors.registration_type ? 'border-red-300' : 'border-gray-300'
              } hover:border-[#2B4C7E] hover:shadow-md has-[:checked]:border-[#2B4C7E] has-[:checked]:bg-white has-[:checked]:shadow-md`}
            >
              <input
                {...register('registration_type')}
                type="radio"
                value="personal"
                className="mt-1 w-4 h-4 text-[#2B4C7E] focus:ring-[#2B4C7E]"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-gray-900">Personal</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-7">
                  I'm registering as an individual distributor
                </p>
              </div>
            </label>

            {/* Business Registration Option */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                errors.registration_type ? 'border-red-300' : 'border-gray-300'
              } hover:border-[#2B4C7E] hover:shadow-md has-[:checked]:border-[#2B4C7E] has-[:checked]:bg-white has-[:checked]:shadow-md`}
            >
              <input
                {...register('registration_type')}
                type="radio"
                value="business"
                className="mt-1 w-4 h-4 text-[#2B4C7E] focus:ring-[#2B4C7E]"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-gray-900">Business</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-7">
                  I'm registering as an agency or company
                </p>
              </div>
            </label>
          </div>
          {errors.registration_type && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.registration_type.message}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register('first_name')}
              type="text"
              id="first_name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.first_name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              {...register('last_name')}
              type="text"
              id="last_name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.last_name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          {/* Password Strength Indicator */}
          {watchPassword && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      level <= passwordStrength ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {passwordStrength < 3 && 'Weak'}
                {passwordStrength === 3 && 'Good'}
                {passwordStrength === 4 && 'Strong'}
                {passwordStrength === 5 && 'Very Strong'}
              </p>
            </div>
          )}
        </div>

        {/* Username (Slug) */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <div className="relative">
            <input
              {...register('slug')}
              type="text"
              id="slug"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              onChange={(e) => {
                const lowercase = e.target.value.toLowerCase();
                setValue('slug', lowercase);
              }}
            />
            {slugCheckStatus === 'checking' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#2B4C7E] rounded-full animate-spin" />
              </div>
            )}
            {slugCheckStatus === 'available' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">✓</div>
            )}
            {slugCheckStatus === 'taken' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">✗</div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your referral link: reachtheapex.net/{watchSlug || 'your-username'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Use lowercase letters, numbers, and hyphens only (we'll auto-convert for you)
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
          {slugCheckStatus === 'taken' && slugSuggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Try these available usernames:</p>
              <div className="flex flex-wrap gap-2">
                {slugSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setValue('slug', suggestion)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Name (Required for Business, Optional for Personal) */}
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            {watchRegistrationType === 'business' ? 'Company Legal Name *' : 'Company Name (Optional)'}
          </label>
          <input
            {...register('company_name')}
            type="text"
            id="company_name"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={watchRegistrationType === 'business' ? 'Acme Insurance Agency LLC' : ''}
            disabled={isSubmitting}
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        {/* Business Type (Only for Business Registration) */}
        {watchRegistrationType === 'business' && (
          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type *
            </label>
            <select
              {...register('business_type')}
              id="business_type"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                (errors as any).business_type ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select business type...</option>
              <option value="llc">LLC (Limited Liability Company)</option>
              <option value="corporation">Corporation</option>
              <option value="s_corporation">S Corporation</option>
              <option value="partnership">Partnership</option>
              <option value="sole_proprietor">Sole Proprietor</option>
            </select>
            {(errors as any).business_type && (
              <p className="mt-1 text-sm text-red-600">{(errors as any).business_type.message}</p>
            )}
          </div>
        )}

        {/* DBA Name (Only for Business Registration, Optional) */}
        {watchRegistrationType === 'business' && (
          <div>
            <label htmlFor="dba_name" className="block text-sm font-medium text-gray-700 mb-1">
              DBA Name (Optional)
            </label>
            <input
              {...register('dba_name')}
              type="text"
              id="dba_name"
              placeholder="Doing Business As name, if different from legal name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your DBA ("Doing Business As") name if your business operates under a different name than the legal name
            </p>
            {(errors as any).dba_name && (
              <p className="mt-1 text-sm text-red-600">{(errors as any).dba_name.message}</p>
            )}
          </div>
        )}

        {/* Business Website (Only for Business Registration, Optional) */}
        {watchRegistrationType === 'business' && (
          <div>
            <label htmlFor="business_website" className="block text-sm font-medium text-gray-700 mb-1">
              Business Website (Optional)
            </label>
            <input
              {...register('business_website')}
              type="url"
              id="business_website"
              placeholder="https://www.example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
              disabled={isSubmitting}
            />
            {(errors as any).business_website && (
              <p className="mt-1 text-sm text-red-600">{(errors as any).business_website.message}</p>
            )}
          </div>
        )}

        {/* Phone (Required) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="555-123-4567"
            onChange={(e) => {
              // Auto-format as user types
              const formatted = formatPhoneInput(e.target.value);
              setValue('phone', formatted);
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Required for SMS notifications about meeting attendees
          </p>
        </div>

        {/* Address Fields (Required for both Personal and Business) */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Mailing Address *</h3>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              {...register('address_line1')}
              type="text"
              id="address_line1"
              placeholder="123 Main Street"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                errors.address_line1 ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.address_line1 && (
              <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
              Apartment, Suite, etc. (Optional)
            </label>
            <input
              {...register('address_line2')}
              type="text"
              id="address_line2"
              placeholder="Apt 4B"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.address_line2 && (
              <p className="mt-1 text-sm text-red-600">{errors.address_line2.message}</p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div className="md:col-span-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                {...register('city')}
                type="text"
                id="city"
                placeholder="Houston"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div className="md:col-span-1">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                {...register('state')}
                id="state"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select state...</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            {/* ZIP */}
            <div className="md:col-span-1">
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                {...register('zip')}
                type="text"
                id="zip"
                placeholder="77001"
                maxLength={10}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  errors.zip ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.zip && (
                <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 italic">
            📍 Your mailing address is required for tax reporting (1099), ACH payouts, and compliance with regulations.
          </p>
        </div>

        {/* Bio (Optional - for AI Voice Agent personalization) */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Tell us about yourself (Optional)
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={3}
            maxLength={500}
            placeholder="Example: I'm a former teacher passionate about helping families protect what matters most..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent resize-none ${
              errors.bio ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This helps personalize your AI Voice Agent. Share 1-2 sentences about your background or interests. (Max 500 characters)
          </p>
        </div>

        {/* Date of Birth (Only for Personal Registration) */}
        {watchRegistrationType === 'personal' && (
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Month Dropdown */}
              <select
                id="birth_month"
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  (errors as any).date_of_birth ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                onChange={(e) => {
                  const month = e.target.value;
                  const year = (document.getElementById('birth_year') as HTMLSelectElement)?.value;
                  const day = (document.getElementById('birth_day') as HTMLSelectElement)?.value;
                  if (year && month && day) {
                    setValue('date_of_birth', `${year}-${month}-${day}`);
                  }
                }}
              >
                <option value="">Month</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              {/* Day Dropdown */}
              <select
                id="birth_day"
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  (errors as any).date_of_birth ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                onChange={(e) => {
                  const day = e.target.value;
                  const year = (document.getElementById('birth_year') as HTMLSelectElement)?.value;
                  const month = (document.getElementById('birth_month') as HTMLSelectElement)?.value;
                  if (year && month && day) {
                    setValue('date_of_birth', `${year}-${month}-${day}`);
                  }
                }}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                id="birth_year"
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent ${
                  (errors as any).date_of_birth ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                onChange={(e) => {
                  const year = e.target.value;
                  const month = (document.getElementById('birth_month') as HTMLSelectElement)?.value;
                  const day = (document.getElementById('birth_day') as HTMLSelectElement)?.value;
                  if (year && month && day) {
                    setValue('date_of_birth', `${year}-${month}-${day}`);
                  }
                }}
              >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              You must be at least 18 years old to register
            </p>
            {(errors as any).date_of_birth && (
              <p className="mt-1 text-sm text-red-600">{(errors as any).date_of_birth.message}</p>
            )}
          </div>
        )}

        {/* Tax ID - SSN for Personal, EIN for Business */}
        <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
          {watchRegistrationType === 'personal' ? (
            // Social Security Number for Personal Registration
            <>
              <label htmlFor="ssn" className="block text-sm font-medium text-gray-900 mb-1">
                Social Security Number *
              </label>
              <div className="relative">
                <input
                  {...register('ssn')}
                  type={showSSN ? 'text' : 'password'}
                  id="ssn"
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className={`w-full px-4 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent font-mono ${
                    (errors as any).ssn ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const formatted = formatSSNInput(e.target.value);
                    setValue('ssn', formatted);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSSN(!showSSN)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {showSSN ? 'Hide' : 'Show'}
                </button>
              </div>
              {(errors as any).ssn && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).ssn.message}</p>
              )}

              {/* SSN Disclaimer */}
              <div className="mt-3 p-3 bg-white rounded-md border border-amber-300">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1">Why we collect your Social Security Number:</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Federal law requires us to collect your SSN for tax reporting purposes (IRS Form 1099) and to comply with anti-money laundering regulations under the Bank Secrecy Act and USA PATRIOT Act. Your SSN is encrypted and stored securely and will only be used for required tax reporting and identity verification.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // EIN for Business Registration
            <>
              <label htmlFor="ein" className="block text-sm font-medium text-gray-900 mb-1">
                Employer Identification Number (EIN) *
              </label>
              <input
                {...register('ein')}
                type="text"
                id="ein"
                placeholder="XX-XXXXXXX"
                maxLength={10}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent font-mono ${
                  (errors as any).ein ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                onChange={(e) => {
                  const formatted = formatEINInput(e.target.value);
                  setValue('ein', formatted);
                }}
              />
              {(errors as any).ein && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).ein.message}</p>
              )}

              {/* EIN Disclaimer */}
              <div className="mt-3 p-3 bg-white rounded-md border border-amber-300">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1">Why we collect your EIN:</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Federal law requires us to collect your business's Employer Identification Number (EIN) for tax reporting purposes (IRS Form W-9) and to comply with anti-money laundering regulations. Your EIN is encrypted and stored securely and will only be used for required tax reporting and business identity verification.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Licensing Status Selection */}
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Are you a licensed insurance agent? *
          </label>
          <div className="space-y-3">
            {/* Licensed Option */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                errors.licensing_status ? 'border-red-300' : 'border-gray-300'
              } hover:border-[#2B4C7E] hover:shadow-md has-[:checked]:border-[#2B4C7E] has-[:checked]:bg-blue-50 has-[:checked]:shadow-md`}
            >
              <input
                {...register('licensing_status')}
                type="radio"
                value="licensed"
                className="mt-1 w-4 h-4 text-[#2B4C7E] focus:ring-[#2B4C7E]"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-gray-900">Yes, I am licensed</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-7">
                  I hold an active insurance license and will provide documentation. I'll have access to all features including license management, advanced commissions, and client tools.
                </p>
              </div>
            </label>

            {/* Non-Licensed Option */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                errors.licensing_status ? 'border-red-300' : 'border-gray-300'
              } hover:border-[#2B4C7E] hover:shadow-md has-[:checked]:border-[#2B4C7E] has-[:checked]:bg-gray-100 has-[:checked]:shadow-md`}
            >
              <input
                {...register('licensing_status')}
                type="radio"
                value="non_licensed"
                className="mt-1 w-4 h-4 text-[#2B4C7E] focus:ring-[#2B4C7E]"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-gray-900">No, I am not licensed</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-7">
                  I will participate in referral and team-building activities. I'll have access to training materials, marketing tools, and team management features.
                </p>
              </div>
            </label>
          </div>

          {errors.licensing_status && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.licensing_status.message}</p>
          )}

          <p className="mt-3 text-xs text-gray-500 italic">
            💡 This selection determines which features and tools will be available in your dashboard. You can change this later from your profile settings.
          </p>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{submitError}</p>
            {retryCountdown !== null && retryCountdown > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-red-700 font-medium">
                  You can retry in {retryCountdown} second{retryCountdown !== 1 ? 's' : ''}...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || slugCheckStatus === 'taken'}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Your Account...
            </span>
          ) : (
            'Join Apex Today'
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-[#2B4C7E] hover:underline font-medium">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
