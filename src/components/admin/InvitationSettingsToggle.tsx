'use client';

// =============================================
// Admin Invitation Settings Toggle
// Control global invitation restrictions
// =============================================

import { useState, useEffect } from 'react';
import { Shield, ShieldOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitationSettingsToggle() {
  const [restrictionsDisabled, setRestrictionsDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const res = await fetch('/api/admin/settings/invitation-restrictions');
      if (!res.ok) throw new Error('Failed to fetch setting');

      const data = await res.json();
      setRestrictionsDisabled(data.disabled === true);
    } catch (error) {
      console.error('Error fetching setting:', error);
      toast.error('Failed to load setting');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async () => {
    setUpdating(true);
    try {
      const newValue = !restrictionsDisabled;

      const res = await fetch('/api/admin/settings/invitation-restrictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: newValue }),
      });

      if (!res.ok) throw new Error('Failed to update setting');

      setRestrictionsDisabled(newValue);
      toast.success(
        newValue
          ? 'Invitation restrictions disabled - unlimited sends for all users'
          : 'Invitation restrictions enabled - normal limits apply'
      );
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
      {/* Header with Status Indicator */}
      <div className={`p-4 border-b ${restrictionsDisabled ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restrictionsDisabled ? (
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShieldOff className="w-6 h-6 text-orange-600" />
              </div>
            ) : (
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Invitation Restrictions
              </h3>
              <p className={`text-sm font-medium ${restrictionsDisabled ? 'text-orange-600' : 'text-green-600'}`}>
                {restrictionsDisabled ? 'DISABLED (Unlimited)' : 'ENABLED (Normal Limits)'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleSetting}
            disabled={updating}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              restrictionsDisabled
                ? 'bg-orange-600 focus:ring-orange-500'
                : 'bg-slate-300 focus:ring-slate-500'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                restrictionsDisabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">What this controls:</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span><strong>When ENABLED (Normal):</strong> Users are limited by their Lead Autopilot subscription plan (e.g., 50 invitations/month for Starter, unlimited for Pro)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span><strong>When DISABLED (Override):</strong> All users can send unlimited invitations regardless of their subscription level</span>
              </li>
            </ul>
          </div>

          {restrictionsDisabled && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-orange-900 mb-1">Warning: Restrictions Currently Disabled</p>
                <p className="text-orange-700">
                  All distributors can currently send unlimited meeting invitations. This bypasses subscription limits and may impact email deliverability if users send too many invitations.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">Use cases:</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Company-wide promotions or events where everyone needs to send invites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Temporary override during product launches or special campaigns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Testing invitation functionality without hitting limits</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
