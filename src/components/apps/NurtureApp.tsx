'use client';

// =============================================
// NurtureApp — AI Nurture Campaign Builder
// 4-step flow: intake → preview → schedule → launch
// =============================================

import { useState, useEffect } from 'react';

interface GeneratedEmail  { subject: string; body: string; }
interface NurtureEmail    { email_number: number; send_at: string; status: string; }
interface Campaign {
  id: string;
  prospect_name: string;
  prospect_email: string;
  product: string;
  plan: string;
  interval_days: number;
  total_emails: number;
  emails_sent: number;
  status: string;
  created_at: string;
  nurture_emails: NurtureEmail[];
}

interface Props { agentEmail: string; }

const PRODUCTS = ['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Annuity'];
const INTERVALS = [3, 5, 7, 10, 14];

const CONTEXT_CHIPS = [
  'Just met today, seems interested but concerned about cost',
  'Has a young family, currently has no life insurance',
  'Small business owner looking to protect income',
  'Recently changed jobs and lost employer coverage',
  'Approaching retirement, interested in annuity options',
  'Referred by a current client of mine',
];

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getSchedule(interval: number, count: number): Date[] {
  const base = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i * interval);
    return d;
  });
}

function nextSendDate(emails: NurtureEmail[]): string {
  const next = emails
    .filter(e => e.status === 'scheduled')
    .sort((a, b) => new Date(a.send_at).getTime() - new Date(b.send_at).getTime())[0];
  if (!next) return '—';
  return fmtDate(new Date(next.send_at));
}

// ── Step indicator ────────────────────────────────
function Steps({ current }: { current: number }) {
  const labels = ['Prospect', 'Emails', 'Schedule', 'Launch'];
  return (
    <div className="flex items-center gap-0 mb-6">
      {labels.map((label, i) => {
        const n = i + 1;
        const done    = n < current;
        const active  = n === current;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? 'bg-green-500 text-white' : active ? 'text-white' : 'bg-gray-200 text-gray-500'
              }`} style={active ? { background: '#2B4C7E' } : {}}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : n}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-0.5 w-12 mb-4 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Upgrade wall ──────────────────────────────────
function UpgradeWall({ onToast }: { onToast: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#2B4C7E' }}>
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You've used your free campaign</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Upgrade to keep sending personalized nurture campaigns. Your first campaign is already working — now put it on autopilot for every prospect.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-gray-200 rounded-xl p-5 text-left">
            <p className="text-lg font-bold text-gray-900 mb-1">Starter</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">$47<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="text-sm text-gray-600 space-y-1.5 mt-3">
              <li>✓ Unlimited campaigns</li>
              <li>✓ 4 emails per sequence</li>
              <li>✓ 3–14 day intervals</li>
              <li>✓ Birthday & date triggers</li>
            </ul>
          </div>
          <div className="border-2 rounded-xl p-5 text-left" style={{ borderColor: '#2B4C7E', background: '#f0f5ff' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-lg font-bold text-gray-900">Pro</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#2B4C7E' }}>Best Value</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$97<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="text-sm text-gray-600 space-y-1.5 mt-3">
              <li>✓ Everything in Starter</li>
              <li>✓ Unlimited contacts</li>
              <li>✓ Post-close sequences</li>
              <li>✓ Team seats (up to 5)</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onToast}
          className="w-full max-w-xs py-3.5 rounded-xl font-bold text-white text-sm"
          style={{ background: '#2B4C7E' }}
        >
          Upgrade to Starter — $47/mo →
        </button>
        <p className="text-xs text-gray-400 mt-3">Billing coming soon — check back shortly</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────
export default function NurtureApp({ agentEmail }: Props) {
  const [step, setStep]               = useState(1);
  const [prospectName, setProspectName]   = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [product, setProduct]         = useState('Term Life');
  const [context, setContext]         = useState('');
  const [emails, setEmails]           = useState<GeneratedEmail[]>([]);
  const [intervalDays, setIntervalDays]   = useState(3);
  const [campaigns, setCampaigns]     = useState<Campaign[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [launching, setLaunching]     = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [toast, setToast]             = useState('');

  const isOnStarter   = campaigns.some(c => c.plan === 'starter');
  const showWall      = campaignsLoaded && !isOnStarter && campaigns.length >= 1;
  const emailCount    = isOnStarter ? 4 : 2;
  const scheduleDates = getSchedule(intervalDays, emailCount);

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    try {
      const res  = await fetch('/api/apps/nurture/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch {}
    finally { setCampaignsLoaded(true); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ── Step 1: Generate ────────────────────────────
  const handleGenerate = async () => {
    if (!prospectName.trim() || !prospectEmail.trim() || !context.trim()) {
      setError('Fill in prospect name, email, and description.');
      return;
    }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/apps/nurture/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectName, prospectEmail, product, context, emailCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setEmails(data.emails);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  // ── Step 4: Launch ──────────────────────────────
  const handleLaunch = async () => {
    setLaunching(true); setError('');
    try {
      const res  = await fetch('/api/apps/nurture/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName, prospectEmail, product, context,
          emails, intervalDays, plan: isOnStarter ? 'starter' : 'free',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Launch failed');
      setSuccessMsg(`Campaign launched for ${prospectName}! Email 1 sends within the hour.`);
      setStep(1);
      setProspectName(''); setProspectEmail(''); setProduct('Term Life');
      setContext(''); setEmails([]); setIntervalDays(3);
      await loadCampaigns();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Launch failed.');
    } finally { setLaunching(false); }
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#2B4C7E' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Nurture Campaigns</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">AI</span>
            {!isOnStarter && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Free Demo</span>
            )}
          </div>
          <p className="text-xs text-gray-500">Describe a prospect → AI writes the emails → system sends automatically</p>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-green-700">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      {/* Upgrade wall */}
      {showWall ? (
        <UpgradeWall onToast={() => showToast('Billing is coming soon — we\'ll notify you when it\'s ready!')} />
      ) : (

        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Free plan notice */}
          {!isOnStarter && !campaignsLoaded && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800 font-medium">
              <strong>Free Demo:</strong> You can send one campaign with 2 emails. Upgrade to Starter for unlimited campaigns and 4-email sequences.
            </div>
          )}
          {!isOnStarter && campaignsLoaded && campaigns.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-sm text-blue-800">
              <strong>Free Demo:</strong> Send your first campaign free — 2 personalized emails, sent automatically. After that, upgrade to keep going.
            </div>
          )}

          {/* Step indicator */}
          <Steps current={step} />

          {/* ── STEP 1: Intake ─────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-800">Tell me about your prospect</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prospect Name *</label>
                  <input
                    type="text"
                    value={prospectName}
                    onChange={e => setProspectName(e.target.value)}
                    placeholder="Sarah Martinez"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prospect Email *</label>
                  <input
                    type="email"
                    value={prospectEmail}
                    onChange={e => setProspectEmail(e.target.value)}
                    placeholder="sarah@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Describe the situation *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CONTEXT_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setContext(chip)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        context === chip
                          ? 'border-[#2B4C7E] bg-blue-50 text-[#2B4C7E] font-semibold'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  rows={3}
                  placeholder="e.g. Met Sarah at a restaurant today. She's a waitress in her early 30s, two young kids, mentioned she has no life insurance and worries about her family's future..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">The more detail you give, the more personal the emails will feel.</p>
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>}

              <button
                onClick={handleGenerate}
                disabled={loading || !prospectName.trim() || !prospectEmail.trim() || !context.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: '#2B4C7E' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Claude is writing your campaign…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate {emailCount} Personalized Emails →
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 2: Email Preview ───────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{emails.length} emails generated for <strong>{prospectName}</strong></p>
                <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-gray-700 underline">← Edit prospect</button>
              </div>

              {emails.map((email, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: '#2B4C7E' }}>{i + 1}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email {i + 1}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Subject: <span className="normal-case font-semibold text-gray-800">{email.subject}</span>
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">{email.body}</p>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90"
                  style={{ background: '#2B4C7E' }}
                >
                  Set Schedule →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Schedule ────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-1">Choose your send schedule</h2>
                <p className="text-sm text-gray-500">How many days between each email?</p>
              </div>

              {isOnStarter ? (
                <div className="flex gap-2 flex-wrap">
                  {INTERVALS.map(days => (
                    <button
                      key={days}
                      onClick={() => setIntervalDays(days)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-bold border-2 transition-colors ${
                        intervalDays === days
                          ? 'text-white border-transparent'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      style={intervalDays === days ? { background: '#2B4C7E', borderColor: '#2B4C7E' } : {}}
                    >
                      Every {days} days
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700">Free plan: 3-day interval</p>
                  <p className="text-xs text-gray-400 mt-0.5">Upgrade to Starter to choose any interval from 3–14 days</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Send Timeline</p>
                <div className="space-y-2">
                  {scheduleDates.map((date, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0" style={{ background: '#2B4C7E' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className="text-sm font-semibold text-gray-800 w-36 text-right">
                        {i === 0 ? 'Today (within 1hr)' : fmtDate(date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90"
                  style={{ background: '#2B4C7E' }}
                >
                  Review & Launch →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Confirm ─────────────────────── */}
          {step === 4 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-800">Ready to launch</h2>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
                {[
                  { label: 'Prospect',  value: `${prospectName} · ${prospectEmail}` },
                  { label: 'Product',   value: product },
                  { label: 'Emails',    value: `${emails.length} personalized emails` },
                  { label: 'Schedule',  value: `Every ${intervalDays} days` },
                  { label: 'Sends from', value: `${agentEmail} (via Apex)` },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-4 px-4 py-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-24 shrink-0 pt-0.5">{row.label}</span>
                    <span className="text-sm text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Timeline preview */}
              <div className="space-y-1.5">
                {scheduleDates.map((date, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-right text-gray-400 text-xs font-semibold">Email {i + 1}</span>
                    <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0"></span>
                    <span className="text-gray-700">{i === 0 ? 'Sends within the hour' : fmtDate(date)}</span>
                    <span className="ml-auto text-xs text-gray-400 truncate max-w-48">{emails[i]?.subject}</span>
                  </div>
                ))}
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>}

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  ← Back
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={launching}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ background: '#2B4C7E' }}
                >
                  {launching ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Launching…
                    </>
                  ) : '🚀 Launch Campaign'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Campaigns List ──────────────────────────── */}
      {campaignsLoaded && campaigns.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 mt-2">Active Campaigns</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Prospect</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Progress</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Next Send</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{c.prospect_name}</p>
                      <p className="text-xs text-gray-400">{c.prospect_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.product}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(c.emails_sent / c.total_emails) * 100}%`,
                              background: '#2B4C7E',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{c.emails_sent}/{c.total_emails}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {c.status === 'completed' ? '—' : nextSendDate(c.nurture_emails ?? [])}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'active'    ? 'bg-green-100 text-green-700' :
                        c.status === 'completed' ? 'bg-gray-100 text-gray-500'  :
                                                   'bg-red-100 text-red-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
