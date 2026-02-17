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

      // Success - redirect to dashboard
      router.push('/dashboard');
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
        <div className="mb-8 p-4 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] text-white rounded-lg text-center">
          <p className="text-sm opacity-90">You've been invited by</p>
          <p className="text-xl font-semibold mt-1">{sponsorName}</p>
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
            theapexway.net/{watchSlug || 'your-username'}
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
