'use client';

// ============================================================
// Referral Link Generator Component
// Generate UTM links and QR codes for referral tracking
// ============================================================

import { useState } from 'react';
import QRCode from 'qrcode';

interface ReferralLinkGeneratorProps {
  baseLink: string;
  distributorSlug: string;
  distributorName: string;
}

export default function ReferralLinkGenerator({
  baseLink,
  distributorSlug,
  distributorName,
}: ReferralLinkGeneratorProps) {
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [generatedLink, setGeneratedLink] = useState(baseLink);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const generateLink = () => {
    let link = baseLink;
    const params: string[] = [];

    if (utmSource) params.push(`utm_source=${encodeURIComponent(utmSource)}`);
    if (utmMedium) params.push(`utm_medium=${encodeURIComponent(utmMedium)}`);
    if (utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);

    if (params.length > 0) {
      link = `${baseLink}?${params.join('&')}`;
    }

    setGeneratedLink(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail - clipboard API may not be available
    }
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(generatedLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b', // slate-900
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (err) {
      // Silently fail - QR generation may fail in some environments
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${distributorSlug}-referral-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Base Link Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Your Base Referral Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={baseLink}
            readOnly
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(baseLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* UTM Builder */}
      <div className="mb-6 pb-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Add UTM Parameters (Optional)
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Track where your traffic comes from by adding UTM parameters
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Source (e.g., facebook, instagram)
            </label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="facebook"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Medium (e.g., social, email, post)
            </label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="social"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Campaign (e.g., spring2024)
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="spring2024"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>

        <button
          onClick={generateLink}
          className="mt-4 px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Generate Custom Link
        </button>
      </div>

      {/* Generated Link */}
      {generatedLink !== baseLink && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Your Custom Tracking Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-slate-700 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">QR Code</h3>
        <p className="text-sm text-slate-600 mb-4">
          Generate a QR code for your referral link to use in print materials or presentations
        </p>

        <div className="flex gap-3">
          <button
            onClick={generateQRCode}
            className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            {showQR ? 'Regenerate QR Code' : 'Generate QR Code'}
          </button>

          {qrCodeUrl && (
            <button
              onClick={downloadQRCode}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download QR Code
            </button>
          )}
        </div>

        {showQR && qrCodeUrl && (
          <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              Scan this QR code to visit: {distributorName}&apos;s referral page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
