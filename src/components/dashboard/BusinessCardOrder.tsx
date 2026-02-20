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
            width: '350px',
            height: '200px',
            backgroundImage: 'url(/business-card-front.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Bottom section with PHONE and WEB */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: '16px 20px',
              gap: '20px',
            }}>
              {/* PHONE section */}
              <div>
                <div style={{
                  color: '#DC143C',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                }}>PHONE</div>
                <div style={{ color: '#2B4C7E', fontSize: '10px', fontWeight: 600, lineHeight: '1.4' }}>
                  {distributor.phone || '(XXX) XXX-XXXX'}
                </div>
              </div>

              {/* WEB section */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  color: '#DC143C',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                }}>WEB</div>
                <div style={{ color: '#2B4C7E', fontSize: '10px', fontWeight: 600, lineHeight: '1.4' }}>
                  {website}
                </div>
              </div>
            </div>

            {/* Center area for name and title */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '100%',
              padding: '0 20px',
            }}>
              <div style={{
                color: '#2B4C7E',
                fontWeight: 800,
                fontSize: '18px',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}>{fullName}</div>
              <div style={{
                color: '#DC143C',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}>Insurance Agent</div>
            </div>
          </div>

          {/* Back of card */}
          <div style={{
            width: '350px',
            height: '200px',
            backgroundImage: 'url(/business-card-back.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            {/* The back image already has the design, no overlay needed */}
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
