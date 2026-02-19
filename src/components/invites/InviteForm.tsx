'use client';

// ============================================================
// InviteForm — send up to 10 VIP first-look invites
// ============================================================

import { useState } from 'react';

interface Recipient { name: string; email: string; }

const empty = (): Recipient => ({ name: '', email: '' });

export default function InviteForm() {
  const [senderName,  setSenderName]  = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipients,  setRecipients]  = useState<Recipient[]>(
    Array.from({ length: 10 }, empty)
  );
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);

  const updateRecipient = (i: number, field: keyof Recipient, value: string) =>
    setRecipients(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const filledCount = recipients.filter(r => r.name.trim() && r.email.trim()).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filledCount === 0) { setMessage('Fill in at least one recipient.'); setStatus('error'); return; }
    setSubmitting(true);
    setStatus('idle');
    setMessage('');
    try {
      const res  = await fetch('/api/invites/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ senderName, senderEmail, recipients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to send');
      setSentCount(data.sent);
      setStatus('success');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <img src="/apex-logo-full.png" alt="Apex Affinity Group" className="h-16 w-auto mb-8" />
        <div className="max-w-md w-full text-center bg-green-50 border border-green-200 rounded-2xl p-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: '#2B4C7E' }}>
              <i className="fa-solid fa-paper-plane" style={{ fontSize: '28px', color: '#fff' }}></i>
            </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invites Sent!</h2>
          <p className="text-gray-600 text-sm mb-6">
            {sentCount} VIP invite{sentCount !== 1 ? 's' : ''} sent successfully. Your guests will receive a personalized email with all the details.
          </p>
          <button
            onClick={() => { setStatus('idle'); setSenderName(''); setSenderEmail(''); setRecipients(Array.from({ length: 10 }, empty)); }}
            className="text-sm font-semibold text-white px-6 py-2.5 rounded-xl"
            style={{ background: '#2B4C7E' }}
          >
            Send More Invites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-6 text-center">
        <img src="/apex-logo-full.png" alt="Apex Affinity Group" className="h-16 w-auto mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Send VIP First-Look Invites</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Personally invite up to 10 guests to our site launch and pre-launch webinar — more events to be announced soon.
        </p>
      </div>

      {/* What they're being invited to */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'fa-desktop',    title: 'Site Launch',       desc: 'First to sign up when we go live' },
            { icon: 'fa-microphone', title: 'Webinar — Feb 23',  desc: 'Mon Feb 23 · 9 PM ET · Teams' },
            { icon: 'fa-calendar',   title: 'More Events Soon',  desc: 'Online sessions TBA — stay tuned' },
          ].map((ev, i) => (
            <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full mx-auto mb-2" style={{ background: '#2B4C7E' }}>
                <i className={`fa-solid ${ev.icon}`} style={{ fontSize: '18px', color: '#fff' }}></i>
              </div>
              <p className="text-xs font-bold text-gray-800 mb-0.5">{ev.title}</p>
              <p className="text-xs text-gray-500">{ev.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Sender info */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Your Info — Who's Sending These Invites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your Full Name</label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your Email Address</label>
              <input
                type="email"
                value={senderEmail}
                onChange={e => setSenderEmail(e.target.value)}
                required
                placeholder="jane@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Your Guests
            </h2>
            {filledCount > 0 && (
              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: '#2B4C7E' }}>
                {filledCount} / 10 ready to send
              </span>
            )}
          </div>

          <div className="space-y-2">
            {recipients.map((r, i) => (
              <div key={i} className="grid grid-cols-[28px_1fr_1fr] gap-2 items-center">
                {/* Row number */}
                <span className="text-xs text-gray-400 font-bold text-right">{i + 1}.</span>
                {/* Name */}
                <input
                  type="text"
                  value={r.name}
                  onChange={e => updateRecipient(i, 'name', e.target.value)}
                  placeholder={`Guest ${i + 1} name`}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {/* Email */}
                <input
                  type="email"
                  value={r.email}
                  onChange={e => updateRecipient(i, 'email', e.target.value)}
                  placeholder="email@example.com"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Leave rows blank to skip them — only filled rows get an invite.</p>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || filledCount === 0}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-50"
          style={{ background: '#2B4C7E' }}
        >
          {submitting
            ? 'Sending Invites…'
            : filledCount === 0
              ? 'Fill in at least one guest to send'
              : `Send ${filledCount} VIP Invite${filledCount !== 1 ? 's' : ''} →`}
        </button>

      </form>

      {/* CAN-SPAM Footer */}
      <footer className="border-t border-gray-100 mt-4 px-4 py-8 text-center">
        <img src="/apex-logo-full.png" alt="Apex Affinity Group" className="h-8 w-auto mx-auto mb-3 opacity-40" />
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          Emails are sent as personal invitations from you to your guests. Recipients will not be added to any mailing list.
          Each invite is a one-time send — they will receive no further emails unless they choose to join the waitlist.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          <strong>Apex Affinity Group</strong> · 1600 Highway 6, Ste 400 · Sugar Land, TX 77478
        </p>
      </footer>

    </div>
  );
}
