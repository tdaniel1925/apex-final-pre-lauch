// =============================================
// Reset Password Page
// =============================================

import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password - Apex Affinity Group',
  description: 'Create a new password',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/apex-logo.png"
            alt="Apex Affinity Group"
            className="h-24 w-auto"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ResetPasswordForm />
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="text-[#2B4C7E] hover:underline font-medium">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
