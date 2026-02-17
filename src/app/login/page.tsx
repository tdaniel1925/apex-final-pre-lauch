// =============================================
// Login Page
// =============================================

import LoginForm from '@/components/forms/LoginForm';

export const metadata = {
  title: 'Sign In - Apex Affinity Group',
  description: 'Sign in to your distributor account',
};

export default function LoginPage() {
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
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your distributor account
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-[#2B4C7E] hover:underline font-medium">
              Join Apex Today
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
