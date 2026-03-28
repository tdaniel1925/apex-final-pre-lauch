// =============================================
// Claim the States! - National Vision Page
// Interactive US map showing state ownership based on GVP
// =============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import USMap from '@/components/claim-states/USMap';
import StateDetailModal from '@/components/claim-states/StateDetailModal';
import { Trophy, Users, TrendingUp, Map, Crown } from 'lucide-react';
import type { StateOwnershipData } from '@/app/api/claim-states/route';

export default function ClaimTheStatesPage() {
  const [states, setStates] = useState<StateOwnershipData[]>([]);
  const [selectedState, setSelectedState] = useState<StateOwnershipData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalStates: 50,
    claimedStates: 0,
    unclaimedStates: 50,
    eliteStates: 0,
    legacyStates: 0,
    totalGVP: 0,
  });
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Fetch states data
  useEffect(() => {
    async function fetchStates() {
      try {
        const response = await fetch('/api/claim-states');
        const data = await response.json();

        if (data.success) {
          setStates(data.data.states);
          setSummary(data.data.summary);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStates();
  }, []);

  // Handle state click
  const handleStateClick = async (stateCode: string) => {
    try {
      // Fetch detailed state data
      const response = await fetch(`/api/claim-states?state_code=${stateCode}`);
      const data = await response.json();

      if (data.success) {
        setSelectedState(data.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching state details:', error);
    }
  };

  // Get hovered state data for preview
  const hoveredStateData = hoveredState
    ? states.find(s => s.code === hoveredState)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2B4C7E] to-[#4a6fa5] rounded-full mb-4">
            <Map className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Claim the States!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The National Vision of Apex Affinity Group
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Be the first to generate 500 Group Volume Points from a state and claim it for the year!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-[#2B4C7E]">{summary.claimedStates}</div>
            <div className="text-sm text-slate-600 mt-1">States Claimed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-slate-400">{summary.unclaimedStates}</div>
            <div className="text-sm text-slate-600 mt-1">Unclaimed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{summary.eliteStates}</div>
            <div className="text-sm text-slate-600 mt-1">Elite Status</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{summary.legacyStates}</div>
            <div className="text-sm text-slate-600 mt-1">Legacy Status</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.totalGVP.toLocaleString()}</div>
            <div className="text-sm text-slate-600 mt-1">Total GVP</div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B4C7E]"></div>
            </div>
          ) : (
            <>
              <USMap
                states={states.map(s => ({
                  code: s.code,
                  name: s.name,
                  owner: s.currentOwner ? {
                    name: s.currentOwner.name,
                    photo_url: s.currentOwner.photo_url,
                  } : undefined,
                  gvp: s.currentGVP,
                  status: s.status,
                  isFirstEver: !!s.firstOwner,
                  dateClaimed: s.currentOwner?.dateClaimed,
                }))}
                onStateClick={handleStateClick}
                onStateHover={setHoveredState}
              />

              {/* Hover Preview */}
              {hoveredStateData && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{hoveredStateData.name}</h3>
                      {hoveredStateData.currentOwner ? (
                        <p className="text-sm text-slate-600">
                          <Crown className="w-3 h-3 inline mr-1" />
                          Owned by {hoveredStateData.currentOwner.name}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-600">Available to claim</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2B4C7E]">
                        {hoveredStateData.currentGVP.toLocaleString()} GVP
                      </p>
                      {hoveredStateData.status === 'unclaimed' && (
                        <p className="text-xs text-slate-500">
                          {Math.round((hoveredStateData.currentGVP / 500) * 100)}% to claim
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#2B4C7E]" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-[#2B4C7E]">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Generate GVP</h3>
              <p className="text-sm text-slate-600">
                Your Group Volume Points are calculated based on your team's activity in your state (determined by zip code).
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-[#2B4C7E]">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Reach 500 GVP</h3>
              <p className="text-sm text-slate-600">
                First person to generate 500 GVP from a state claims it for the year! Your name will be displayed on the map.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-[#2B4C7E]">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Hall of Fame</h3>
              <p className="text-sm text-slate-600">
                Annual ownership resets each year, but the FIRST EVER claimant is in the Hall of Fame forever!
              </p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Milestones & Status Levels</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#2B4C7E] rounded"></div>
                <span className="font-semibold text-slate-900">Claimed</span>
              </div>
              <p className="text-sm text-slate-600">500+ GVP - State ownership for the year</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                <span className="font-semibold text-slate-900">Elite</span>
              </div>
              <p className="text-sm text-slate-600">1,000+ GVP - Elite status recognition</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded"></div>
                <span className="font-semibold text-slate-900">Legacy</span>
              </div>
              <p className="text-sm text-slate-600">5,000+ GVP - Legendary achievement</p>
            </div>
          </div>
        </div>
      </div>

      {/* State Detail Modal */}
      <StateDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        state={selectedState}
      />
    </div>
  );
}
