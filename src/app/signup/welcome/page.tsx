'use client'

/**
 * AI Welcome Page
 * Shown immediately after signup to introduce new distributor to their AI assistant
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Phone, Sparkles, Clock, ArrowRight, CheckCircle } from 'lucide-react'

interface AIProvisioningStatus {
  isProvisioned: boolean
  trialActive: boolean
  phoneNumber?: string
  minutesRemaining?: number
  trialExpiresAt?: string
}

export default function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const distributorId = searchParams.get('distributorId')

  const [status, setStatus] = useState<AIProvisioningStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!distributorId) {
      router.push('/dashboard')
      return
    }

    // Check provisioning status
    async function checkStatus() {
      try {
        const response = await fetch(`/api/signup/provision-ai?distributorId=${distributorId}`)
        const data = await response.json()
        setStatus(data)
        setLoading(false)

        // Show confetti animation
        if (data.isProvisioned) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setLoading(false)
      }
    }

    checkStatus()
  }, [distributorId, router])

  // Format phone number for display
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const areaCode = cleaned.substring(1, 4)
      const prefix = cleaned.substring(4, 7)
      const line = cleaned.substring(7, 11)
      return `(${areaCode}) ${prefix}-${line}`
    }
    return phone
  }

  // Format phone number for tel: link
  const formatPhoneLink = (phone?: string) => {
    if (!phone) return ''
    return phone.replace(/\D/g, '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your AI assistant...</p>
        </div>
      </div>
    )
  }

  if (!status?.isProvisioned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-yellow-500 mb-4">
            <Clock className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            AI Provisioning in Progress
          </h1>
          <p className="text-slate-600 mb-6">
            Your AI assistant is being set up. This usually takes 1-2 minutes.
            Please check back shortly or continue to your dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#2c5aa0', '#1a4075', '#60a5fa', '#fbbf24', '#34d399'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome to Apex!
          </h1>
          <p className="text-lg text-slate-600">
            Your AI Assistant is Ready
          </p>
        </div>

        {/* AI Phone Number Display */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-semibold">Your AI Phone Number</h2>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
            <a
              href={`tel:${formatPhoneLink(status.phoneNumber)}`}
              className="block text-center"
            >
              <Phone className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
              <div className="text-4xl md:text-5xl font-bold tracking-wide mb-2">
                {formatPhoneNumber(status.phoneNumber)}
              </div>
              <p className="text-blue-100 text-sm">Tap to call on mobile</p>
            </a>
          </div>

          {/* Trial info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">
                {status.minutesRemaining}
              </div>
              <div className="text-blue-100">Free Minutes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">24</div>
              <div className="text-blue-100">Hour Trial</div>
            </div>
          </div>
        </div>

        {/* What to do next */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Here&apos;s What to Do Next:
          </h3>

          <div className="flex gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Call Your Apex Voice Agent Now
              </h4>
              <p className="text-slate-600 text-sm mb-2">
                Your AI assistant will give you a personalized welcome and show you what it can do! This first call is special - it&apos;s designed to wow you with AI-powered conversation.
              </p>
              <p className="text-slate-600 text-sm">
                💡 After your first call, it will handle prospect calls 24/7 and send you SMS notifications.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Share Your Number
              </h4>
              <p className="text-slate-600 text-sm">
                Give this number to prospects! When they call, your AI will
                answer 24/7, build excitement, and collect their info for you.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Complete Your Enrollment
              </h4>
              <p className="text-slate-600 text-sm">
                Finalize your payment to unlock your full business center and
                keep your AI assistant active.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={`tel:${formatPhoneLink(status.phoneNumber)}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Phone className="w-5 h-5" />
            Call Your AI Now
          </a>
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Your 20 free minutes and 24-hour trial start now. Check your dashboard
          for call logs and analytics.
        </p>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
