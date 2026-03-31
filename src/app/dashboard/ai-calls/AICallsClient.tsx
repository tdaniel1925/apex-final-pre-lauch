'use client'

import { useEffect, useState } from 'react'
import { Phone, MessageSquare, Clock, TrendingUp, Play, Pause, Volume2 } from 'lucide-react'

interface CallLog {
  id: string
  vapi_call_id: string
  caller_number: string
  call_type: 'prospect' | 'distributor'
  duration_seconds: number
  sentiment: 'positive' | 'neutral' | 'negative'
  summary: string
  sms_sent: boolean
  sms_template_used: string | null
  sms_body: string | null
  recording_url: string | null
  created_at: string
}

interface Stats {
  totalCalls: number
  prospectCalls: number
  distributorCalls: number
  smsSent: number
  avgDuration: number
}

export default function AICallsClient() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'prospect' | 'distributor'>('all')
  const [playingCallId, setPlayingCallId] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchCallLogs()
  }, [filter])

  const fetchCallLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard/ai-calls?callType=${filter}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setCallLogs(data.callLogs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching call logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const playRecording = (call: CallLog) => {
    if (!call.recording_url) return

    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }

    if (playingCallId === call.id) {
      // Stop playing
      setPlayingCallId(null)
      setAudioElement(null)
    } else {
      // Start playing
      const audio = new Audio(call.recording_url)
      audio.play()
      audio.onended = () => {
        setPlayingCallId(null)
        setAudioElement(null)
      }
      setPlayingCallId(call.id)
      setAudioElement(audio)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-slate-600 bg-slate-50'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Call Logs</h1>
          <p className="text-slate-600">
            View all calls to your AI assistant and listen to recordings
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Calls</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalCalls}</p>
                </div>
                <Phone className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Prospect Calls</p>
                  <p className="text-2xl font-bold text-green-600">{stats.prospectCalls}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Calls</p>
                  <p className="text-2xl font-bold text-slate-600">{stats.distributorCalls}</p>
                </div>
                <Phone className="w-8 h-8 text-slate-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">SMS Sent</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.smsSent}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Duration</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(stats.avgDuration)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Calls
            </button>
            <button
              onClick={() => setFilter('prospect')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'prospect'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Prospects Only
            </button>
            <button
              onClick={() => setFilter('distributor')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'distributor'
                  ? 'bg-slate-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              My Calls Only
            </button>
          </div>
        </div>

        {/* Call Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading call logs...</div>
          ) : callLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No calls yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Calls to your AI will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {callLogs.map((call) => (
                <div key={call.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Call Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            call.call_type === 'prospect'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {call.call_type === 'prospect' ? '🎯 Prospect' : '📞 You'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(call.sentiment)}`}>
                          {call.sentiment}
                        </span>
                        <span className="text-sm text-slate-600">
                          {formatPhoneNumber(call.caller_number)}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDuration(call.duration_seconds)}
                        </span>
                        <span className="text-sm text-slate-400">
                          {new Date(call.created_at).toLocaleString()}
                        </span>
                      </div>

                      {call.summary && (
                        <p className="text-sm text-slate-700 mb-2">{call.summary}</p>
                      )}

                      {call.sms_sent && call.sms_body && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">
                              SMS Sent ({call.sms_template_used})
                            </span>
                          </div>
                          <p className="text-sm text-purple-900 whitespace-pre-wrap">
                            {call.sms_body}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Play Button */}
                    {call.recording_url && (
                      <button
                        onClick={() => playRecording(call)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          playingCallId === call.id
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {playingCallId === call.id ? (
                          <>
                            <Pause className="w-5 h-5" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            Listen
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
