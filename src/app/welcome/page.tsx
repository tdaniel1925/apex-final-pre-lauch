'use client';

// =============================================
// Welcome Loading Page
// Shows after successful signup before redirecting to dashboard
// =============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 7 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 7000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img
            src="/apex-logo-white.png"
            alt="Apex Affinity Group"
            className="h-24 w-auto mx-auto"
          />
        </div>

        {/* Welcome Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-up">
          Welcome to Apex Affinity Group
        </h1>

        {/* Loading Message */}
        <p className="text-xl md:text-2xl text-blue-100 mb-8 animate-slide-up-delay">
          Building Your Customized Portal....
        </p>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Please Wait */}
        <p className="text-lg text-blue-200 animate-pulse">
          Please Wait....
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mt-8">
          <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-progress"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out 0.3s both;
        }

        .animate-slide-up-delay {
          animation: slideUp 0.8s ease-out 0.6s both;
        }

        .animate-progress {
          animation: progress 7s linear;
        }
      `}</style>
    </div>
  );
}
