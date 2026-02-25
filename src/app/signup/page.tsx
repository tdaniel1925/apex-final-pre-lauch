// =============================================
// Public Sign-Up Page
// Full distributor registration (defaults to Apex Vision sponsor)
// =============================================

import SignupForm from '@/components/forms/SignupForm';

export const metadata = {
  title: 'Sign Up - Apex Affinity Group',
  description: 'Join Apex Affinity Group - Create your distributor account',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
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
            Join Apex Affinity Group
          </h1>
          <p className="text-gray-600">
            Create your distributor account and start building your business
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SignupForm sponsorName="Apex Vision" />
        </div>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-[#2B4C7E] hover:underline font-medium">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
