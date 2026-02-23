'use client';

// =============================================
// Signup Form Component
// Handles distributor registration with matrix placement
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/validations/signup';
import { generateSlug } from '@/lib/utils/slug-client';

interface SignupFormProps {
  sponsorSlug?: string;
  sponsorName?: string;
}

export default function SignupForm({ sponsorSlug, sponsorName }: SignupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugCheckStatus, setSlugCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

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
    },
  });

  const watchFirstName = watch('first_name');
  const watchLastName = watch('last_name');
  const watchSlug = watch('slug');
  const watchPassword = watch('password');

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
            reachtheapex.net/{watchSlug || 'your-username'}
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

        {/* Company Name (Optional) */}
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name (Optional)
          </label>
          <input
            {...register('company_name')}
            type="text"
            id="company_name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone (Optional)
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
