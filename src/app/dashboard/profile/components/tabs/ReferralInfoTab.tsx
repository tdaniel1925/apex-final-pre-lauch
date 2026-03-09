'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Trophy, Calendar, Copy, Check } from 'lucide-react';
import type { ReferrerInfo } from '@/types/profile';

interface ReferralInfoTabProps {
  referredBy: string | null;
  referralCode: string | null;
}

export default function ReferralInfoTab({ referredBy, referralCode }: ReferralInfoTabProps) {
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!referredBy) {
      setLoading(false);
      return;
    }

    const fetchReferrerInfo = async () => {
      try {
        const response = await fetch(`/api/profile/referrer?id=${referredBy}`);

        if (!response.ok) {
          throw new Error('Failed to load referrer information');
        }

        const data = await response.json();
        setReferrerInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrerInfo();
  }, [referredBy]);

  const copyReferralLink = async () => {
    if (!referralCode) return;

    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Referral Code Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Your Referral Link
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Share this link to invite others and earn rewards
          </p>
        </div>

        <div className="p-6">
          {referralCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Referral Code
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-semibold text-gray-900">
                    {referralCode}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Referral Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 truncate">
                    {`${window.location.origin}/signup?ref=${referralCode}`}
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-3 bg-apex-primary text-white rounded-lg hover:bg-apex-secondary transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Share this link on social media, via email, or with friends.
                  Anyone who signs up using your link will be connected to your account.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <User className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">No referral code assigned yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Who Referred You Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Who Referred You
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Information about the person who invited you
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apex-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : !referredBy ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-3">
                <User className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No referrer</p>
              <p className="text-gray-500 text-sm">
                You signed up directly without a referral link
              </p>
            </div>
          ) : referrerInfo ? (
            <div className="space-y-6">
              {/* Referrer Profile Card */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-apex-light to-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  {referrerInfo.profile_photo_url ? (
                    <img
                      src={referrerInfo.profile_photo_url}
                      alt={`${referrerInfo.first_name} ${referrerInfo.last_name}`}
                      className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-apex-primary to-apex-secondary flex items-center justify-center border-2 border-white shadow-sm">
                      <span className="text-xl font-bold text-white">
                        {referrerInfo.first_name?.charAt(0)}{referrerInfo.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    {referrerInfo.first_name} {referrerInfo.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">{referrerInfo.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-apex-primary text-xs font-medium border border-apex-primary">
                      <Trophy className="h-3 w-3" />
                      {referrerInfo.tier} Rank
                    </span>
                    <span className="text-xs text-gray-600">
                      {referrerInfo.points} Points
                    </span>
                  </div>
                </div>
              </div>

              {/* Referrer Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Referral Code</div>
                    <div className="font-mono font-semibold text-gray-900">
                      #{referrerInfo.referral_code}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Email</div>
                    <div className="text-sm text-gray-900 truncate">
                      {referrerInfo.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This person invited you to join. They may receive
                  benefits when you achieve certain milestones. Contact support if you have
                  questions about your referral relationship.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
