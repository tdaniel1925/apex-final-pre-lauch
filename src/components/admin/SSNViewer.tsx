'use client';

// =============================================
// SSN Viewer Component (Admin Only)
// Displays last 4 digits by default
// Reveals full SSN with audit logging
// =============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ShieldAlert, Lock } from 'lucide-react';

interface SSNViewerProps {
  distributorId: string;
  distributorName: string;
  last4?: string; // If already loaded
}

export default function SSNViewer({ distributorId, distributorName, last4 }: SSNViewerProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [fullSSN, setFullSSN] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFour, setLastFour] = useState<string | null>(last4 || null);

  // Load last 4 if not provided
  useState(() => {
    if (!last4 && !lastFour) {
      loadLast4();
    }
  });

  const loadLast4 = async () => {
    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/ssn`);
      const result = await response.json();

      if (result.success && result.data?.last4) {
        setLastFour(result.data.last4);
      }
    } catch (err) {
      console.error('Error loading SSN last 4:', err);
    }
  };

  const handleReveal = async () => {
    if (isRevealed) {
      // Hide SSN
      setIsRevealed(false);
      setFullSSN(null);
      return;
    }

    // Confirm before revealing
    const confirmed = window.confirm(
      `⚠️ SECURITY WARNING\n\n` +
      `You are about to reveal the full Social Security Number for:\n\n` +
      `${distributorName}\n\n` +
      `This action will be:\n` +
      `• Logged in the audit trail\n` +
      `• Recorded with your admin account\n` +
      `• Timestamped with IP address\n\n` +
      `Only proceed if you have a legitimate business need.\n\n` +
      `Continue?`
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/ssn/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to reveal SSN');
        return;
      }

      setFullSSN(result.data.ssn);
      setIsRevealed(true);
    } catch (err) {
      console.error('Error revealing SSN:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!lastFour) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Lock className="h-4 w-4" />
        <span className="text-sm">No SSN on file</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* SSN Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-gray-700">SSN:</span>
        </div>

        <div className="flex-1">
          {isRevealed && fullSSN ? (
            <div className="font-mono text-lg font-semibold text-gray-900 bg-amber-50 px-4 py-2 rounded border-2 border-amber-300">
              {fullSSN}
            </div>
          ) : (
            <div className="font-mono text-lg text-gray-600 bg-gray-50 px-4 py-2 rounded border border-gray-300">
              •••-••-{lastFour}
            </div>
          )}
        </div>

        <Button
          onClick={handleReveal}
          variant={isRevealed ? 'outline' : 'default'}
          size="sm"
          disabled={isLoading}
          className={isRevealed ? 'border-amber-500 text-amber-700 hover:bg-amber-50' : ''}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : isRevealed ? (
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              <span>Hide</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Reveal Full SSN</span>
            </div>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning when revealed */}
      {isRevealed && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded text-sm text-amber-800">
          <ShieldAlert className="h-4 w-4" />
          <span>
            ⚠️ <strong>Audit logged:</strong> This reveal has been recorded in the security audit trail with your admin account, timestamp, and IP address.
          </span>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-3">
        <p className="font-semibold mb-1">Security Notice:</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>SSN is stored encrypted in a separate secure table</li>
          <li>All access is logged for compliance and security</li>
          <li>Only reveal if required for tax reporting or verification</li>
        </ul>
      </div>
    </div>
  );
}
