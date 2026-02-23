'use client';

// ============================================================
// QR Code Generator Component
// Generate downloadable QR codes linking to distributor's page
// ============================================================

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  distributorSlug: string;
  distributorName: string;
}

export default function QRCodeGenerator({ distributorSlug, distributorName }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);
  const websiteUrl = `https://theapexway.net/${distributorSlug}`;

  useEffect(() => {
    if (canvasRef.current) {
      generateQR();
    }
  }, []);

  const generateQR = async () => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, websiteUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2B4C7E', // Apex blue
          light: '#FFFFFF',
        },
      });
      setGenerated(true);
    } catch (error) {
      console.error('QR generation error:', error);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${distributorSlug}-qr-code.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Personal QR Code</h2>

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />

          {generated && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Links to:</p>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {websiteUrl}
                </a>
              </div>

              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </button>
            </>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Use:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Add to your Instagram stories or posts</li>
            <li>Print on business cards or flyers</li>
            <li>Share in Facebook groups</li>
            <li>Use in email signatures</li>
            <li>Display at events or presentations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
