'use client'

/**
 * AI Phone Stats Component
 * Displays AI assistant phone number and usage stats on dashboard
 */

import { useEffect, useState } from 'react'
import { Phone, Clock, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface AIPhoneData {
  isProvisioned: boolean
  trialActive: boolean
  phoneNumber?: string
  minutesRemaining?: number
  trialExpiresAt?: string
  provisionedAt?: string
}

export default function AIPhoneStats({ distributorId }: { distributorId: string }) {
  const [data, setData] = useState<AIPhoneData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAIStatus() {
      try {
        const response = await fetch(`/api/signup/provision-ai?distributorId=${distributorId}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch AI phone status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAIStatus()
  }, [distributorId])

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

  // Calculate time remaining
  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data?.isProvisioned) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Get Your AI Assistant
            </h3>
            <p className="text-slate-700 text-sm mb-4">
              Upgrade to get your own AI phone number that answers calls 24/7,
              builds excitement about Apex, and collects leads for you!
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Activate AI Assistant
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const timeRemaining = getTimeRemaining(data.trialExpiresAt)
  const isTrialExpired = timeRemaining === 'Expired'
  const isLowMinutes = (data.minutesRemaining ?? 0) < 5

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">AI Assistant</h3>
          {data.trialActive && !isTrialExpired && (
            <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              Trial Active
            </span>
          )}
          {isTrialExpired && (
            <span className="ml-auto text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
              Trial Ended
            </span>
          )}
        </div>
      </div>

      {/* Phone Number */}
      <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-blue-100 text-xs uppercase tracking-wide mb-1">
          Your AI Phone Number
        </div>
        <a
          href={`tel:${data.phoneNumber?.replace(/\D/g, '')}`}
          className="text-2xl font-bold text-white hover:text-blue-100 transition"
        >
          {formatPhoneNumber(data.phoneNumber)}
        </a>
        <p className="text-blue-200 text-xs mt-1">Tap to call</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-200">
        {/* Minutes Remaining */}
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${isLowMinutes ? 'text-red-600' : 'text-slate-600'}`} />
            <div className="text-xs text-slate-600 font-medium">Minutes Left</div>
          </div>
          <div className={`text-2xl font-bold ${isLowMinutes ? 'text-red-600' : 'text-slate-900'}`}>
            {data.minutesRemaining ?? 0}
          </div>
          {isLowMinutes && (
            <p className="text-xs text-red-600 mt-1">Low balance!</p>
          )}
        </div>

        {/* Trial Time */}
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <div className="text-xs text-slate-600 font-medium">Trial Time</div>
          </div>
          <div className={`text-2xl font-bold ${isTrialExpired ? 'text-red-600' : 'text-slate-900'}`}>
            {timeRemaining}
          </div>
          {isTrialExpired && (
            <p className="text-xs text-red-600 mt-1">Upgrade to continue</p>
          )}
        </div>
      </div>

      {/* Call to Action */}
      {(isTrialExpired || isLowMinutes) && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <Link
            href="/dashboard/settings"
            className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Upgrade to Keep AI Active
          </Link>
        </div>
      )}

      {data.trialActive && !isTrialExpired && !isLowMinutes && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            Share this number with prospects to start getting calls!
          </p>
        </div>
      )}
    </div>
  )
}
