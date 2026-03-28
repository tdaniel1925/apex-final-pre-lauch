'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Rep {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ai_center_tier: string;
  ai_center_premium_free_access: boolean;
  ai_center_subscription_status: string | null;
}

export default function AIBusinessCenterManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const searchReps = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, ai_center_tier, ai_center_premium_free_access, ai_center_subscription_status')
      .or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(10);

    setLoading(false);

    if (error) {
      setMessage('Error searching reps: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      setSelectedRep(data[0] as Rep);
    } else {
      setMessage('No reps found matching that search.');
    }
  };

  const grantFreeAccess = async () => {
    if (!selectedRep || !reason.trim()) {
      setMessage('Please select a rep and provide a reason.');
      return;
    }

    setLoading(true);
    setMessage('');

    // Update distributor
    const { error: updateError } = await supabase
      .from('distributors')
      .update({
        ai_center_tier: 'premium_free',
        ai_center_premium_free_access: true,
      })
      .eq('id', selectedRep.id);

    if (updateError) {
      setMessage('Error granting access: ' + updateError.message);
      setLoading(false);
      return;
    }

    // Log admin action
    const { data: adminData } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (adminData) {
      await supabase.from('admin_actions').insert({
        admin_id: adminData.id,
        action: 'grant_free_premium',
        target_distributor_id: selectedRep.id,
        reason,
      });
    }

    setLoading(false);
    setMessage(`✅ Free Premium access granted to ${selectedRep.first_name} ${selectedRep.last_name}!`);
    setReason('');

    // Refresh selected rep
    const { data: refreshed } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', selectedRep.id)
      .single();

    if (refreshed) {
      setSelectedRep(refreshed as Rep);
    }
  };

  const revokeFreeAccess = async () => {
    if (!selectedRep) return;

    setLoading(true);
    setMessage('');

    const { error: updateError } = await supabase
      .from('distributors')
      .update({
        ai_center_tier: 'basic',
        ai_center_premium_free_access: false,
      })
      .eq('id', selectedRep.id);

    if (updateError) {
      setMessage('Error revoking access: ' + updateError.message);
      setLoading(false);
      return;
    }

    // Log admin action
    const { data: adminData } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (adminData) {
      await supabase.from('admin_actions').insert({
        admin_id: adminData.id,
        action: 'revoke_free_premium',
        target_distributor_id: selectedRep.id,
        reason: 'Admin revoked free access',
      });
    }

    setLoading(false);
    setMessage(`✅ Free access revoked from ${selectedRep.first_name} ${selectedRep.last_name}`);

    // Refresh selected rep
    const { data: refreshed } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', selectedRep.id)
      .single();

    if (refreshed) {
      setSelectedRep(refreshed as Rep);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        AI Business Center - Admin Management
      </h2>

      {/* Search Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Search for Rep (name or email)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchReps()}
            placeholder="Enter name or email..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={searchReps}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {/* Selected Rep Info */}
      {selectedRep && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Selected Rep
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Name</p>
              <p className="font-medium text-slate-900">
                {selectedRep.first_name} {selectedRep.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="font-medium text-slate-900">{selectedRep.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Current Tier</p>
              <p className="font-medium text-slate-900">
                {selectedRep.ai_center_tier === 'premium_free' ? (
                  <span className="text-green-600">Premium (Free Access)</span>
                ) : selectedRep.ai_center_tier === 'premium' ? (
                  <span className="text-blue-600">Premium (Paid)</span>
                ) : (
                  <span className="text-slate-600">Basic (Free)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Subscription Status</p>
              <p className="font-medium text-slate-900">
                {selectedRep.ai_center_subscription_status || 'None'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grant/Revoke Access */}
      {selectedRep && (
        <div className="mb-6">
          {!selectedRep.ai_center_premium_free_access ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Grant Free Premium Access
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                This will give {selectedRep.first_name} full Premium features ($39/month value) for free.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for granting access
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  <option value="Top Performer Q1 2026">Top Performer Q1 2026</option>
                  <option value="Beta Tester">Beta Tester</option>
                  <option value="Special Recognition">Special Recognition</option>
                  <option value="Training Team">Training Team</option>
                  <option value="Leadership Team">Leadership Team</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button
                onClick={grantFreeAccess}
                disabled={loading || !reason}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                Grant Free Premium Access
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Revoke Free Access
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                This will downgrade {selectedRep.first_name} to Basic (free) tier.
              </p>
              <button
                onClick={revokeFreeAccess}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                Revoke Free Access
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
