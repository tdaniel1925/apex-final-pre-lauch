'use client';

// =============================================
// Pre-Launch Waitlist Screen
// 2-panel desktop / single-col mobile, fits viewport
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  sponsorSlug?: string;
  sponsorName?: string;
}

const LAUNCH_DATE = new Date('2026-02-24T02:00:00Z');
const WEBINAR_LINK = ''; // Admin: drop the webinar URL here when ready

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function WaitlistScreen({ sponsorSlug, sponsorName }: Props) {
  const router = useRouter();
  const backUrl = sponsorSlug ? `/${sponsorSlug}` : '/';

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), sourceSlug: sponsorSlug || null }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.message === 'already_registered' ? 'duplicate' : 'success');
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a2f50 0%, #2B4C7E 50%, #1a3a6b 100%)' }}
    >
      {/* Animated background rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-white/5 animate-ping" style={{ animationDuration: '6s' }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push(backUrl)}
        className="absolute top-3 right-3 z-20 text-white/60 hover:text-white transition-colors text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
      >
        ← Back
      </button>

      {/* ===== LEFT PANEL — desktop only ===== */}
      <div className="relative z-10 hidden md:flex flex-col items-center justify-center w-2/5 px-10 border-r border-white/10 shrink-0">
        <img src="/apex-logo-white.png" alt="Apex Affinity Group" className="w-40 h-auto mb-6 object-contain" />
        <h1 className="text-3xl font-bold text-white text-center leading-tight mb-3">
          We're Almost<br />Ready to Roll!
        </h1>
        <p className="text-blue-200 text-sm text-center leading-relaxed">
          {sponsorName ? `${sponsorName} invited you to join their team.` : 'And trust us — so are we.'}{' '}
          Signups officially open after our exclusive Pre-Launch Webinar on{' '}
          <strong className="text-white">Monday, February 23rd at 9:00 PM ET.</strong>
        </p>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 text-center">

        {/* Logo + headline — mobile only */}
        <div className="md:hidden flex flex-col items-center mb-4">
          <img src="/apex-logo-white.png" alt="Apex Affinity Group" className="w-24 h-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-white leading-tight mb-1">We're Almost Ready to Roll!</h1>
          <p className="text-blue-200 text-xs leading-relaxed max-w-xs">
            {sponsorName ? `${sponsorName} invited you.` : 'Signups open after our webinar —'}{' '}
            <strong className="text-white">Feb 23 at 9PM ET.</strong>
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-end gap-2 sm:gap-4 mb-5">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hrs' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Sec' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-end gap-2 sm:gap-4">
              {i > 0 && <span className="text-xl sm:text-3xl font-bold text-blue-300 mb-2">:</span>}
              <div className="flex flex-col items-center">
                <div className="bg-white/10 border border-white/20 rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 min-w-[46px] sm:min-w-[60px]">
                  <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
                    {pad(value)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-blue-300 mt-1 uppercase tracking-widest">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Webinar button */}
        {WEBINAR_LINK ? (
          <a
            href={WEBINAR_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-sm bg-white text-[#2B4C7E] font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-blue-50 transition-colors mb-4"
          >
            Join the Pre-Launch Webinar →
          </a>
        ) : (
          <div className="w-full max-w-sm bg-white/10 border border-white/20 text-white/50 font-medium py-2.5 px-6 rounded-xl text-xs mb-4 cursor-default">
            Webinar link coming soon
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-2 w-full max-w-sm mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-blue-300 text-[10px] uppercase tracking-widest whitespace-nowrap">Get notified at launch</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Email capture */}
        {status === 'success' ? (
          <div className="w-full max-w-sm bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
            <div className="text-xl mb-1">🎉</div>
            <p className="text-white font-semibold text-sm">You're on the list!</p>
            <p className="text-blue-200 text-xs mt-1">We'll email you the moment signups open.</p>
          </div>
        ) : status === 'duplicate' ? (
          <div className="w-full max-w-sm bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
            <p className="text-white font-semibold text-sm">You're already on the list!</p>
            <p className="text-blue-200 text-xs mt-1">We'll email you as soon as signups go live.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-blue-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-white text-[#2B4C7E] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors disabled:opacity-60 shrink-0"
            >
              {submitting ? 'Saving...' : 'Notify Me'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-300 text-xs mt-2">{errorMsg}</p>
        )}

        <p className="text-blue-300/60 text-xs mt-4">
          No spam. One email when we launch, that's it.
        </p>
      </div>
    </div>
  );
}
