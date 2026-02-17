// =============================================
// 404 Page for Invalid Distributor Slugs
// =============================================

export default function DistributorNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <img src="/apex-logo.png" alt="Apex Affinity Group" className="h-20 w-auto mx-auto" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          We couldn't find a distributor with that username. The link you followed may be incorrect or this distributor page may no longer be available.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2B4C7E] text-white font-semibold rounded-lg hover:bg-[#1a2c4e] transition-colors"
          >
            Join Apex Affinity Group
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            Go to Homepage
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Already a member?{' '}
          <a href="/login" className="text-[#2B4C7E] hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
