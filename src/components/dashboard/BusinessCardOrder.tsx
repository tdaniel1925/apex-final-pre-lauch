'use client';

// ============================================================
// BusinessCardOrder — Rep dashboard business card ordering
// Shows card preview, quantity selector, shipping form
// ============================================================

import { useState } from 'react';

interface Props {
  distributor: {
    first_name: string;
    last_name:  string;
    email:      string;
    phone:      string | null;
    slug:       string;
  };
}

const QUANTITIES = [250, 500, 1000];
const PRICES: Record<number, string> = {
  250:  '$29',
  500:  '$45',
  1000: '$69',
};

type Step = 'preview' | 'shipping' | 'success';

export default function BusinessCardOrder({ distributor }: Props) {
  const fullName = `${distributor.first_name} ${distributor.last_name}`;
  const website  = `theapexway.net/${distributor.slug}`;

  const [step, setStep]         = useState<Step>('preview');
  const [quantity, setQuantity] = useState(250);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [orderId, setOrderId]   = useState('');

  const [ship, setShip] = useState({
    ship_to_name:  fullName,
    ship_address1: '',
    ship_address2: '',
    ship_city:     '',
    ship_state:    '',
    ship_zip:      '',
  });

  const handleShipChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setShip(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/business-cards/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          name_on_card:    fullName,
          title_on_card:   'Insurance Agent',
          phone_on_card:   distributor.phone ?? '',
          email_on_card:   distributor.email,
          website_on_card: website,
          ...ship,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Order failed');
      setOrderId(data.orderId);
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── CARD PREVIEW ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Your Card Preview</h2>

        {/* Front of card */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div style={{
            width: '320px',
            height: '180px',
            background: 'linear-gradient(135deg, #1a2f50 0%, #2B4C7E 100%)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}>
            {/* Top row: logo area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/apex-star.png" alt="Apex" style={{ height: '32px', width: 'auto', opacity: 0.9 }} />
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '11px', letterSpacing: '1px' }}>APEX AFFINITY GROUP</div>
                <div style={{ color: '#93c5fd', fontSize: '9px', letterSpacing: '0.5px' }}>Insurance Services</div>
              </div>
            </div>
            {/* Bottom: contact info */}
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '2px' }}>{fullName}</div>
              <div style={{ color: '#93c5fd', fontSize: '10px', marginBottom: '8px' }}>Insurance Agent</div>
              <div style={{ color: '#c7d9f5', fontSize: '9px', lineHeight: '1.7' }}>
                {distributor.phone && <div>{distributor.phone}</div>}
                <div>{distributor.email}</div>
                <div>{website}</div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div style={{
            width: '320px',
            height: '180px',
            background: '#1a2f50',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <img src="/apex-star.png" alt="Apex" style={{ height: '48px', width: 'auto', opacity: 0.5, marginBottom: '8px' }} />
              <div style={{ color: '#4b7ab8', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>Apex Affinity Group</div>
              <div style={{ color: '#2B4C7E', fontSize: '9px' }}>theapexway.net</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          * Preview reflects your current profile info. Final print uses your uploaded Apex card design.
        </p>
      </div>

      {/* ── QUANTITY + ORDER / SHIPPING ── */}
      {step === 'preview' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Select Quantity</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {QUANTITIES.map(q => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  quantity === q
                    ? 'border-[#2B4C7E] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-gray-800 text-lg">{q}</div>
                <div className="text-xs text-gray-500">cards</div>
                <div className="text-sm font-bold text-[#2B4C7E] mt-1">{PRICES[q]}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('shipping')}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: '#2B4C7E' }}
          >
            Continue to Shipping →
          </button>
        </div>
      )}

      {step === 'shipping' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Shipping Address</h2>
            <span className="text-xs text-[#2B4C7E] font-bold">{quantity} cards — {PRICES[quantity]}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ship to Name</label>
              <input
                name="ship_to_name"
                value={ship.ship_to_name}
                onChange={handleShipChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
              <input
                name="ship_address1"
                value={ship.ship_address1}
                onChange={handleShipChange}
                required
                placeholder="123 Main St"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2 (optional)</label>
              <input
                name="ship_address2"
                value={ship.ship_address2}
                onChange={handleShipChange}
                placeholder="Apt, Suite, etc."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input
                  name="ship_city"
                  value={ship.ship_city}
                  onChange={handleShipChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <input
                  name="ship_state"
                  value={ship.ship_state}
                  onChange={handleShipChange}
                  required
                  maxLength={2}
                  placeholder="TX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ZIP</label>
                <input
                  name="ship_zip"
                  value={ship.ship_zip}
                  onChange={handleShipChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-60"
                style={{ background: '#2B4C7E' }}
              >
                {submitting ? 'Placing Order…' : `Place Order — ${PRICES[quantity]}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Your {quantity} business cards are on their way to production.
          </p>
          <p className="text-gray-400 text-xs mb-6">Order ID: {orderId}</p>
          <p className="text-gray-500 text-sm">
            You'll receive a shipping notification once your cards are on the way. Typically 5–7 business days.
          </p>
          <button
            onClick={() => { setStep('preview'); setOrderId(''); }}
            className="mt-6 text-sm text-[#2B4C7E] font-medium hover:underline"
          >
            Place another order
          </button>
        </div>
      )}
    </div>
  );
}
