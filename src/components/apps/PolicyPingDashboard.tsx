'use client';

// =============================================
// PolicyPing — Retention Tracking Dashboard
// Mock UI demo — no backend required
// =============================================

import { useState } from 'react';

type RiskLevel = 'high' | 'medium' | 'low';

interface Client {
  id: string;
  name: string;
  policy: string;
  premium: string;
  renewalDate: string;
  daysUntil: number;
  risk: RiskLevel;
  riskReason: string;
  action: string;
  phone: string;
  email: string;
  carrier: string;
  policyNo: string;
}

const CLIENTS: Client[] = [
  { id:  '1', name: 'Sandra Torres',   policy: 'IUL',          premium: '$195/mo',  renewalDate: 'Mar 1',  daysUntil:  8,  risk: 'high',   riskReason: 'Missed last payment — 8 days overdue', action: 'Call immediately. Policy lapses in 7 days if payment not received. Offer grace period options.',     phone: '(832) 555-0107', email: 's.torres@email.com',  carrier: 'National Life',  policyNo: 'NL-884421' },
  { id:  '2', name: 'Angela White',    policy: 'Final Expense', premium: '$65/mo',   renewalDate: 'Mar 4',  daysUntil: 11,  risk: 'high',   riskReason: 'Non-payment — 2nd notice sent', action: 'Urgent: Call before March 4. Client may have changed bank accounts. Offer auto-pay setup.',            phone: '(832) 555-0477', email: 'angelaw@email.com',   carrier: 'Mutual of Omaha', policyNo: 'MO-229183' },
  { id:  '3', name: 'Patricia Cook',   policy: 'Final Expense', premium: '$55/mo',   renewalDate: 'Mar 10', daysUntil: 17,  risk: 'high',   riskReason: 'Payment returned — insufficient funds', action: 'Call and offer to help set up a new payment method. Be sensitive — financial hardship likely.',        phone: '(713) 555-0312', email: 'pcook@email.com',     carrier: 'Foresters',      policyNo: 'FO-114477' },
  { id:  '4', name: 'Marcus Johnson',  policy: 'Term Life',     premium: '$85/mo',   renewalDate: 'Mar 8',  daysUntil: 15,  risk: 'medium', riskReason: 'Renewal in 15 days — no confirmation', action: 'Schedule a review call. Confirm renewal and check if coverage needs to be updated as family has grown.', phone: '(832) 555-0142', email: 'marcus.j@email.com',  carrier: 'Banner Life',    policyNo: 'BL-553812' },
  { id:  '5', name: 'Kevin Mills',     policy: 'Term Life',     premium: '$120/mo',  renewalDate: 'Mar 18', daysUntil: 25,  risk: 'medium', riskReason: 'Renewal approaching — cross-sell opportunity', action: 'Great time to discuss converting term to permanent. Client is 38 — IUL conversion could save taxes.', phone: '(281) 555-0943', email: 'kmills@email.com',   carrier: 'Protective Life', policyNo: 'PL-776234' },
  { id:  '6', name: 'James Carter',    policy: 'Final Expense', premium: '$75/mo',   renewalDate: 'Apr 10', daysUntil: 48,  risk: 'medium', riskReason: 'No review call in 14 months', action: 'Check-in call due. Ask for referrals — he mentioned two siblings without coverage.',                      phone: '(832) 555-0732', email: 'jcarter@email.com',   carrier: 'Mutual of Omaha', policyNo: 'MO-441092' },
  { id:  '7', name: 'Frank Williams',  policy: 'Term Life',     premium: '$110/mo',  renewalDate: 'Apr 20', daysUntil: 58,  risk: 'medium', riskReason: 'Coverage may be under-insured (income grew)', action: 'Review coverage levels. Frank got a promotion — may need to increase coverage to match income.',       phone: '(713) 555-0418', email: 'frankw@email.com',    carrier: 'Banner Life',    policyNo: 'BL-889012' },
  { id:  '8', name: 'Robert Chen',     policy: 'Fixed Annuity', premium: 'Lump sum', renewalDate: 'Mar 12', daysUntil: 19,  risk: 'low',    riskReason: 'Policy anniversary — relationship check-in', action: 'Send an anniversary card/note. Great opportunity to ask how the annuity is performing for him.',        phone: '(713) 555-0521', email: 'rchen@email.com',     carrier: 'Athene',         policyNo: 'AT-334521' },
  { id:  '9', name: 'Linda Park',      policy: 'IUL',           premium: '$320/mo',  renewalDate: 'Mar 22', daysUntil: 29,  risk: 'low',    riskReason: 'All payments current — high-value client', action: 'Premium client — check in and ask for referrals. Has several colleagues who could benefit from IUL.',  phone: '(713) 555-0261', email: 'lpark@email.com',     carrier: 'National Life',  policyNo: 'NL-221847' },
  { id: '10', name: 'David Reyes',     policy: 'Whole Life',    premium: '$175/mo',  renewalDate: 'Mar 28', daysUntil: 35,  risk: 'low',    riskReason: 'Consistent payments — great standing', action: 'Review cash value growth. Good time to discuss a policy loan option or additional rider.',                phone: '(281) 555-0399', email: 'd.reyes@email.com',   carrier: 'Foresters',      policyNo: 'FO-558841' },
  { id: '11', name: 'Tanya Brown',     policy: 'Term Life',     premium: '$95/mo',   renewalDate: 'Apr 3',  daysUntil: 41,  risk: 'low',    riskReason: 'Policy in good standing', action: 'Check in — she mentioned her mother last time. Could be a referral or a Final Expense opportunity.',          phone: '(281) 555-0614', email: 'tanya.b@email.com',   carrier: 'Protective Life', policyNo: 'PL-112384' },
  { id: '12', name: 'Diana Lee',       policy: 'Whole Life',    premium: '$225/mo',  renewalDate: 'Apr 28', daysUntil: 66,  risk: 'low',    riskReason: 'Excellent payment history', action: 'High loyalty client — send a thank-you. Ask if she has family members who might benefit from coverage.',        phone: '(832) 555-0519', email: 'dlee@email.com',      carrier: 'National Life',  policyNo: 'NL-774491' },
  { id: '13', name: 'Maria Santos',    policy: 'IUL',           premium: '$380/mo',  renewalDate: 'Apr 15', daysUntil: 53,  risk: 'low',    riskReason: 'Payments current — large premium client', action: 'Top client — schedule annual review. Check index performance and confirm she is still happy.',           phone: '(713) 555-0889', email: 'msantos@email.com',   carrier: 'Athene',         policyNo: 'AT-991234' },
  { id: '14', name: 'Carlos Rivera',   policy: 'Annuity',       premium: 'Lump sum', renewalDate: 'May 5',  daysUntil: 73,  risk: 'low',    riskReason: 'Annuity in accumulation phase', action: 'Annual review call. Show growth report and discuss distribution options as he approaches retirement.',    phone: '(281) 555-0761', email: 'crivera@email.com',   carrier: 'Athene',         policyNo: 'AT-445512' },
  { id: '15', name: 'Thomas Hunt',     policy: 'Term Life',     premium: '$145/mo',  renewalDate: 'May 20', daysUntil: 88,  risk: 'low',    riskReason: 'No issues — payment on auto-pay', action: 'Low priority — auto-pay set. Send a check-in email and ask if anything in his life has changed.',          phone: '(832) 555-0923', email: 'thunt@email.com',     carrier: 'Banner Life',    policyNo: 'BL-338871' },
];

const NOTIFICATIONS = [
  { risk: 'high',   text: 'Sandra T. — missed payment, 8 days overdue',       time: '2 hours ago' },
  { risk: 'high',   text: 'Angela W. — 2nd non-payment notice sent',            time: '4 hours ago' },
  { risk: 'medium', text: 'Marcus J. — renewal in 15 days, no confirmation',   time: 'Today' },
  { risk: 'high',   text: 'Patricia C. — payment returned (NSF)',               time: 'Yesterday' },
  { risk: 'medium', text: 'Kevin M. — renewal in 25 days, cross-sell ready',   time: 'Yesterday' },
  { risk: 'low',    text: 'Robert C. — annuity anniversary, check-in due',     time: '2 days ago' },
  { risk: 'medium', text: 'James C. — no review call in 14 months',            time: '3 days ago' },
  { risk: 'low',    text: 'Linda P. — premium client, referral opportunity',   time: '1 week ago' },
];

const RISK_CONFIG: Record<RiskLevel, { label: string; badgeBg: string; badgeText: string; dot: string; row: string }> = {
  high:   { label: 'High Risk',  badgeBg: 'bg-red-100',    badgeText: 'text-red-700',    dot: 'bg-red-500',    row: 'bg-red-50/40' },
  medium: { label: 'Follow Up',  badgeBg: 'bg-amber-100',  badgeText: 'text-amber-700',  dot: 'bg-amber-500',  row: 'bg-amber-50/30' },
  low:    { label: 'Good',       badgeBg: 'bg-green-100',  badgeText: 'text-green-700',  dot: 'bg-green-500',  row: '' },
};

const NOTIF_DOT: Record<string, string> = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };

export default function PolicyPingDashboard() {
  const [selected, setSelected] = useState<Client | null>(null);
  const [filter, setFilter]     = useState<RiskLevel | 'all'>('all');

  const highCount   = CLIENTS.filter(c => c.risk === 'high').length;
  const mediumCount = CLIENTS.filter(c => c.risk === 'medium').length;
  const renewingThisWeek = CLIENTS.filter(c => c.daysUntil <= 14).length;

  const filtered = filter === 'all' ? CLIENTS : CLIENTS.filter(c => c.risk === filter);

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#2B4C7E' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">PolicyPing</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Demo</span>
          </div>
          <p className="text-xs text-gray-500">Retention tracking — renewals, lapse risks, and client alerts</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4">
        <div className="bg-white rounded-xl border border-red-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{highCount}</p>
            <p className="text-xs text-gray-500">Lapse Risks</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{renewingThisWeek}</p>
            <p className="text-xs text-gray-500">Renewing in 14 Days</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{CLIENTS.length - highCount}</p>
            <p className="text-xs text-gray-500">Policies in Good Standing</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 px-6 pb-6">

        {/* ── Client Table ────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Filter tabs */}
          <div className="flex gap-2 mb-3">
            {([['all', 'All Clients'], ['high', 'Lapse Risk'], ['medium', 'Follow Up'], ['low', 'Good Standing']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === val
                    ? 'bg-[#2B4C7E] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Client</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Policy</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Premium</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Renewal</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => {
                  const cfg = RISK_CONFIG[client.risk];
                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelected(client)}
                      className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${cfg.row} ${
                        selected?.id === client.id ? 'ring-2 ring-inset ring-[#2B4C7E]' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}></span>
                          <span className="font-semibold text-gray-900">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{client.policy}</td>
                      <td className="px-4 py-3 text-gray-600">{client.premium}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${client.daysUntil <= 14 ? 'text-red-600' : client.daysUntil <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                          {client.renewalDate} ({client.daysUntil}d)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right Column: Notifications + Detail ── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Notification Feed */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Recent Alerts</h3>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <div className="divide-y divide-gray-50">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${NOTIF_DOT[n.risk]}`}></span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Detail Panel */}
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: '#2B4C7E' }}>
                <h3 className="text-sm font-bold text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-blue-200 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-4">

                {/* Risk badge */}
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${RISK_CONFIG[selected.risk].badgeBg} ${RISK_CONFIG[selected.risk].badgeText}`}>
                  {RISK_CONFIG[selected.risk].label}
                </span>

                {/* Policy info */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Policy</span>
                    <span className="font-semibold text-gray-800">{selected.policy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Carrier</span>
                    <span className="font-semibold text-gray-800">{selected.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Policy #</span>
                    <span className="font-mono text-gray-700">{selected.policyNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Premium</span>
                    <span className="font-semibold text-gray-800">{selected.premium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Renewal</span>
                    <span className={`font-semibold ${selected.daysUntil <= 14 ? 'text-red-600' : 'text-gray-800'}`}>
                      {selected.renewalDate} ({selected.daysUntil} days)
                    </span>
                  </div>
                </div>

                {/* Flag reason */}
                <div className={`rounded-lg p-3 text-xs ${selected.risk === 'high' ? 'bg-red-50 border border-red-200' : selected.risk === 'medium' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`font-bold mb-1 ${selected.risk === 'high' ? 'text-red-700' : selected.risk === 'medium' ? 'text-amber-700' : 'text-green-700'}`}>
                    {selected.risk === 'high' ? '⚠ Alert' : selected.risk === 'medium' ? '📋 Follow Up' : '✓ Status'}
                  </p>
                  <p className="text-gray-700">{selected.riskReason}</p>
                </div>

                {/* Action recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-700 mb-1">Action Recommended</p>
                  <p className="text-xs text-blue-800 leading-relaxed">{selected.action}</p>
                </div>

                {/* Contact buttons */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex-1 py-2 rounded-lg text-xs font-bold text-white text-center transition-opacity hover:opacity-90"
                    style={{ background: '#2B4C7E' }}
                  >
                    📞 Call
                  </a>
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-700 text-center border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    ✉ Email
                  </a>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-xs text-gray-400 font-semibold">Click any client row to see details and recommended action</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
