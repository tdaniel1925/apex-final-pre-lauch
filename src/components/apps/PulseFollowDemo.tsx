'use client';

// =============================================
// PulseFollow — AI Follow-Up Sequence Generator
// Powered by Claude Haiku
// =============================================

import { useState } from 'react';

interface SequenceItem {
  day: number;
  channel: 'email' | 'text';
  subject: string | null;
  message: string;
}

const PRODUCTS = ['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Annuity'];

const SITUATION_CHIPS = [
  'Sent a quote 3 days ago, no response',
  'Had a great call last week, went quiet',
  'Client said "I need to think about it"',
  'Left 2 voicemails, no call back',
  'Sent proposal, client seems hesitant',
  'Prospect said spouse needs to review',
];

const DAY_COLORS: Record<number, { bg: string; border: string; badge: string; dot: string }> = {
  1: { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  3: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  7: { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
};

export default function PulseFollowDemo() {
  const [prospectName, setProspectName] = useState('');
  const [product, setProduct]           = useState('Term Life');
  const [situation, setSituation]       = useState('');
  const [loading, setLoading]           = useState(false);
  const [sequence, setSequence]         = useState<SequenceItem[] | null>(null);
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!prospectName.trim() || !situation.trim()) {
      setError('Enter a prospect name and situation first.');
      return;
    }
    setLoading(true);
    setError('');
    setSequence(null);
    try {
      const res  = await fetch('/api/apps/pulsefollow', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prospectName, product, situation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setSequence(data.sequence);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async (item: SequenceItem, idx: number) => {
    const text = item.channel === 'email' && item.subject
      ? `Subject: ${item.subject}\n\n${item.message}`
      : item.message;
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#2B4C7E' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">PulseFollow</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">AI Demo</span>
          </div>
          <p className="text-xs text-gray-500">Generate a personalized follow-up sequence in seconds</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Form ───────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Prospect Details</h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Prospect Name</label>
              <input
                type="text"
                value={prospectName}
                onChange={e => setProspectName(e.target.value)}
                placeholder="e.g. Marcus Johnson"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Product */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Product Interest</label>
              <select
                value={product}
                onChange={e => setProduct(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {PRODUCTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Situation */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Situation</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SITUATION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setSituation(chip)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      situation === chip
                        ? 'border-[#2B4C7E] bg-blue-50 text-[#2B4C7E] font-semibold'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                rows={3}
                placeholder="Or describe the situation in your own words..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prospectName.trim() || !situation.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: '#2B4C7E' }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating with AI…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Sequence
                </>
              )}
            </button>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4 space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">How PulseFollow Works</h2>
            {[
              { day: 'Day 1', label: 'Check-in Email', desc: 'Warm, helpful — keep the door open', color: 'bg-blue-500' },
              { day: 'Day 3', label: 'Value Email',    desc: 'One insight relevant to their situation', color: 'bg-purple-500' },
              { day: 'Day 7', label: 'Quick Text',     desc: 'Brief friendly nudge via SMS', color: 'bg-green-500' },
            ].map(s => (
              <div key={s.day} className="flex items-start gap-3">
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${s.color}`}></span>
                <div>
                  <p className="text-xs font-bold text-gray-800">{s.day} — {s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sequence Results ────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {!sequence && !loading && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-400">Your AI-generated sequence will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Fill in the form and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-8 h-8 animate-spin text-[#2B4C7E] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-semibold text-gray-600">Claude is writing your sequence…</p>
              <p className="text-xs text-gray-400 mt-1">Personalized for {prospectName} · {product}</p>
            </div>
          )}

          {sequence && sequence.map((item, idx) => {
            const colors = DAY_COLORS[item.day] ?? DAY_COLORS[1];
            return (
              <div key={idx} className={`rounded-xl border p-5 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
                    <span className="text-sm font-bold text-gray-800">Day {item.day}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {item.channel === 'email' ? '✉ Email' : '💬 Text'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyMessage(item, idx)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200"
                  >
                    {copied === idx ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {item.subject && (
                  <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    Subject: <span className="normal-case font-semibold text-gray-800">{item.subject}</span>
                  </p>
                )}

                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
