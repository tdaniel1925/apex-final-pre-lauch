'use client';

// =============================================
// Admin Waitlist Client
// View signups + fire launch emails
// =============================================

import { useState } from 'react';

interface WaitlistEntry {
  id: string;
  email: string;
  source_slug: string | null;
  created_at: string;
  notified_at: string | null;
}

interface Props {
  entries: WaitlistEntry[];
  total: number;
  pending: number;
  notified: number;
}

const BASE_URL = 'https://reachtheapex.net';

export default function AdminWaitlistClient({ entries, total, pending, notified }: Props) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSendLaunchEmails = async () => {
    if (pending === 0) return;
    if (!confirm(`Send launch emails to ${pending} people? This cannot be undone.`)) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/waitlist/send', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult({ sent: data.sent, failed: data.failed });
        showToast(`✅ Sent ${data.sent} launch emails!`);
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      showToast('❌ Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Launch Waitlist</h1>
          <p className="text-sm text-gray-500 mt-1">Emails collected before signup opened</p>
        </div>
        <button
          onClick={handleSendLaunchEmails}
          disabled={sending || pending === 0}
          className="bg-[#2B4C7E] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1e3555] disabled:opacity-50 transition-colors"
        >
          {sending ? '⏳ Sending...' : `🚀 Send Launch Emails (${pending} pending)`}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Signups', value: total, color: 'text-[#2B4C7E]' },
          { label: 'Pending Launch Email', value: pending, color: 'text-yellow-600' },
          { label: 'Already Notified', value: notified, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Send result banner */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm text-green-800">
          Launch emails sent: <strong>{result.sent}</strong> succeeded
          {result.failed > 0 && `, ${result.failed} failed`}.
          Refresh the page to see updated statuses.
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">No waitlist signups yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Signup Link</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Signed Up</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const signupUrl = entry.source_slug
                  ? `${BASE_URL}/signup?ref=${entry.source_slug}`
                  : `${BASE_URL}/signup`;
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{entry.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {entry.source_slug ? (
                        <span className="text-[#2B4C7E] font-medium">/{entry.source_slug}</span>
                      ) : (
                        <span className="text-gray-400">Main Site</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate max-w-[200px] block"
                      >
                        {signupUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {entry.notified_at ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Notified
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
