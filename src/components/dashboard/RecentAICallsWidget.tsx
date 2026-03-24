'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, Volume2, TrendingUp, ArrowRight } from 'lucide-react'

interface CallLog {
  id: string
  caller_number: string
  call_type: 'prospect' | 'distributor'
  duration_seconds: number
  sentiment: 'positive' | 'neutral' | 'negative'
  summary: string
  sms_sent: boolean
  created_at: string
}

interface Stats {
  totalCalls: number
  prospectCalls: number
  smsSent: number
}

export default function RecentAICallsWidget() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentCalls()
  }, [])

  const fetchRecentCalls = async () => {
    try {
      const response = await fetch('/api/dashboard/ai-calls?limit=5')
      const data = await response.json()

      if (data.success) {
        setCallLogs(data.callLogs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching recent calls:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900">Recent AI Calls</h3>
        </div>
        <Link
          href="/dashboard/ai-calls"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalCalls}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Prospects</p>
            <p className="text-2xl font-bold text-green-700">{stats.prospectCalls}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium">SMS Sent</p>
            <p className="text-2xl font-bold text-purple-700">{stats.smsSent}</p>
          </div>
        </div>
      )}

      {/* Recent Calls List */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : callLogs.length === 0 ? (
        <div className="text-center py-8">
          <Phone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No calls yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Calls to your AI will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {callLogs.map((call) => (
            <div
              key={call.id}
              className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      call.call_type === 'prospect'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {call.call_type === 'prospect' ? '🎯 Prospect' : '📞 You'}
                  </span>
                  {call.call_type === 'prospect' && call.sms_sent && (
                    <span className="text-xs text-purple-600 font-medium">
                      ✉️ SMS sent
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{formatTimeAgo(call.created_at)}</span>
              </div>

              {call.summary && (
                <p className="text-sm text-slate-700 line-clamp-2 mb-2">{call.summary}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>{formatDuration(call.duration_seconds)}</span>
                  {call.sentiment && (
                    <span
                      className={`px-2 py-1 rounded font-medium ${
                        call.sentiment === 'positive'
                          ? 'bg-green-50 text-green-600'
                          : call.sentiment === 'negative'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {call.sentiment}
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard/ai-calls"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  Listen
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call-to-Action */}
      {!loading && callLogs.length > 0 && (
        <Link
          href="/dashboard/ai-calls"
          className="mt-4 w-full block text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition-colors text-sm"
        >
          View All Call Logs & Listen to Recordings
        </Link>
      )}
    </div>
  )
}
