'use client';

import { useEffect, useState } from 'react';
import { X, User, MapPin, Users, Award, TrendingUp, Calendar, Mail, ExternalLink, Crown } from 'lucide-react';

interface DistributorDetails {
  distributor: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    slug: string;
    rep_number: number;
    status: string;
    created_at: string;
  };
  matrix: {
    depth: number;
    position: number;
    parent: {
      id: string;
      name: string;
      slug: string;
      rep_number: number;
      matrix_depth: number;
    } | null;
    children_count: number;
  };
  sponsor: {
    id: string;
    name: string;
    slug: string;
    rep_number: number;
  } | null;
  member: {
    tech_rank: string;
    personal_credits_monthly: number;
    team_credits_monthly: number;
    override_qualified: boolean;
  } | null;
  team: {
    l1_count: number;
    total_downline: number;
  };
}

interface DistributorDetailsModalProps {
  distributorId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DistributorDetailsModal({
  distributorId,
  isOpen,
  onClose,
}: DistributorDetailsModalProps) {
  const [details, setDetails] = useState<DistributorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && distributorId) {
      fetchDistributorDetails();
    }
  }, [isOpen, distributorId]);

  const fetchDistributorDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/distributor/${distributorId}/details`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch distributor details');
      }

      setDetails(data);
    } catch (err) {
      console.error('Error fetching distributor details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6" />
              Distributor Details
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {details && !loading && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-slate-900 rounded-lg p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600 flex-shrink-0">
                      <span className="text-white font-bold text-3xl">
                        {details.distributor.first_name.charAt(0)}
                        {details.distributor.last_name.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-3xl font-bold text-white">
                          {details.distributor.full_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          details.distributor.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {details.distributor.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-lg mb-4">
                        Rep #{details.distributor.rep_number} • @{details.distributor.slug}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <a
                          href={`mailto:${details.distributor.email}`}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {details.distributor.email}
                        </a>
                        <a
                          href={`/${details.distributor.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Profile
                        </a>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(details.distributor.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Tech Rank */}
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Crown className="w-4 h-4" />
                      Tech Rank
                    </div>
                    <p className="text-2xl font-bold text-white capitalize">
                      {details.member?.tech_rank || 'Starter'}
                    </p>
                  </div>

                  {/* Personal Credits */}
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Personal Credits
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {details.member?.personal_credits_monthly || 0}
                    </p>
                  </div>

                  {/* Team Credits */}
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Users className="w-4 h-4" />
                      Team Credits
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {details.member?.team_credits_monthly || 0}
                    </p>
                  </div>

                  {/* Override Status */}
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Award className="w-4 h-4" />
                      Override Status
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        details.member?.override_qualified ? 'bg-green-500' : 'bg-slate-600'
                      }`} />
                      <p className={`text-lg font-semibold ${
                        details.member?.override_qualified ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {details.member?.override_qualified ? 'Qualified' : 'Not Qualified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Matrix & Sponsor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matrix Position */}
                  <div className="bg-slate-900 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Matrix Position
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400">Level & Position</p>
                        <p className="text-xl font-semibold text-white">
                          Level {details.matrix.depth}, Position {details.matrix.position}
                        </p>
                      </div>
                      {details.matrix.parent && (
                        <div>
                          <p className="text-sm text-slate-400">Matrix Parent</p>
                          <p className="text-lg font-semibold text-blue-400">
                            {details.matrix.parent.name} (Rep #{details.matrix.parent.rep_number})
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-400">Matrix Children</p>
                        <p className="text-lg font-semibold text-white">
                          {details.matrix.children_count} / 5
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sponsor & Team Info */}
                  <div className="bg-slate-900 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team & Sponsor
                    </h4>
                    <div className="space-y-3">
                      {details.sponsor && (
                        <div>
                          <p className="text-sm text-slate-400">Sponsor</p>
                          <p className="text-lg font-semibold text-blue-400">
                            {details.sponsor.name} (Rep #{details.sponsor.rep_number})
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-400">L1 Direct Enrollees</p>
                        <p className="text-lg font-semibold text-white">
                          {details.team.l1_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Downline</p>
                        <p className="text-lg font-semibold text-white">
                          {details.team.total_downline}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <a
                    href={`/${details.distributor.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Full Profile
                  </a>
                  <a
                    href={`mailto:${details.distributor.email}`}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send Email
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
