'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface TreeNode {
  id: string;
  name: string;
  rank: string;
  bv: number;
  status: 'active' | 'inactive';
  photo_url?: string;
  children: TreeNode[];
  expanded: boolean;
}

export default function OrgTreePage() {
  const router = useRouter();
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    levelsDeep: 0,
    teamGV: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadOrgTree();
  }, []);

  async function loadOrgTree() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Get current distributor
    const { data: currentDist } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!currentDist) {
      setLoading(false);
      return;
    }

    // Get all distributors in downline
    const { data: allDistributors } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, rank, personal_bv_current_month, sponsor_id, status, photo_url')
      .neq('id', currentDist.id);

    if (!allDistributors) {
      setLoading(false);
      return;
    }

    // Build tree starting from current user
    const tree = buildTree(currentDist, allDistributors);
    const stats = calculateStats(tree);

    setTreeData(tree);
    setStats(stats);
    setLoading(false);
  }

  function buildTree(root: any, allDistributors: any[]): TreeNode {
    const children = allDistributors.filter(d => d.sponsor_id === root.id);

    return {
      id: root.id,
      name: `${root.first_name} ${root.last_name}`,
      rank: root.rank || 'Associate',
      bv: root.personal_bv_current_month || 0,
      status: root.status === 'active' ? 'active' : 'inactive',
      photo_url: root.photo_url,
      expanded: true,
      children: children.map(child => buildTree(child, allDistributors))
    };
  }

  function calculateStats(tree: TreeNode): { totalMembers: number; activeMembers: number; levelsDeep: number; teamGV: number } {
    let totalMembers = 0;
    let activeMembers = 0;
    let maxDepth = 0;
    let teamGV = 0;

    function traverse(node: TreeNode, depth: number) {
      totalMembers++;
      if (node.status === 'active') activeMembers++;
      teamGV += node.bv;
      maxDepth = Math.max(maxDepth, depth);
      node.children.forEach(child => traverse(child, depth + 1));
    }

    traverse(tree, 0);

    return {
      totalMembers,
      activeMembers,
      levelsDeep: maxDepth,
      teamGV
    };
  }

  function toggleNode(nodeId: string) {
    if (!treeData) return;

    function updateNode(node: TreeNode): TreeNode {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      return {
        ...node,
        children: node.children.map(updateNode)
      };
    }

    setTreeData(updateNode(treeData));
  }

  function getRankColor(rank: string): string {
    const normalized = rank.toLowerCase();
    if (normalized.includes('platinum')) return '#1B3A7D';
    if (normalized.includes('gold')) return '#d97706';
    if (normalized.includes('silver')) return '#6b7280';
    if (normalized.includes('bronze')) return '#cd7f32';
    return '#1B3A7D';
  }

  function getRankBadge(rank: string): string {
    const normalized = rank.toLowerCase();
    if (normalized.includes('platinum')) return 'P';
    if (normalized.includes('gold')) return 'G';
    if (normalized.includes('silver')) return 'S';
    if (normalized.includes('bronze')) return 'B';
    return 'A';
  }

  function renderTreeNode(node: TreeNode, level: number = 0, isRoot: boolean = false) {
    const hasChildren = node.children.length > 0;
    const marginLeft = level * 40;

    return (
      <div key={node.id} style={{ marginLeft: `${marginLeft}px` }} className="mt-4">
        {/* Node Card */}
        <div
          className="bg-white rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
          style={{ borderColor: node.status === 'active' ? getRankColor(node.rank) : '#9ca3af' }}
        >
          <div className="flex items-center gap-4">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
              >
                <svg className={`w-4 h-4 transition-transform ${node.expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Profile Image */}
            <div className="relative shrink-0">
              {node.photo_url ? (
                <img
                  src={node.photo_url}
                  alt={node.name}
                  className="w-14 h-14 rounded-full border-3"
                  style={{ borderColor: getRankColor(node.rank) }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: getRankColor(node.rank) }}
                >
                  {node.name.charAt(0)}
                </div>
              )}
              {/* Rank Badge */}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                style={{ background: getRankColor(node.rank) }}
              >
                {getRankBadge(node.rank)}
              </div>
              {isRoot && (
                <div className="absolute -top-2 -right-2 bg-[#1B3A7D] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                  YOU
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#0F2045] truncate">{node.name}</h3>
              <p className="text-sm text-gray-500">{node.rank}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-600">
                  <span className="font-semibold">{node.bv}</span> BV
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  node.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {node.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                {hasChildren && (
                  <span className="text-xs text-gray-500">
                    {node.children.length} {node.children.length === 1 ? 'Direct' : 'Directs'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && node.expanded && (
          <div className="mt-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organization tree...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No data available</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2045]">Organization Tree</h1>
              <p className="text-gray-500 text-sm mt-1">Visualize and manage your full downline network.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-[#1B3A7D] hover:bg-gray-50 transition-colors border border-gray-200">
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-lg" style={{ background: '#1B3A7D' }}>
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Enroll Rep
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, ID, or rank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D] transition-all"
                />
              </div>

              {/* Rank Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank:</span>
                {['all', 'platinum', 'gold', 'silver', 'bronze'].map(rank => (
                  <button
                    key={rank}
                    onClick={() => setRankFilter(rank)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rankFilter === rank
                        ? 'bg-[#1B3A7D] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {rank.charAt(0).toUpperCase() + rank.slice(1)}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A7D] transition-all"
                >
                  <option value="all">All Members</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#1B3A7D] shrink-0" style={{ background: '#E8EAF2' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Members</p>
                <p className="text-lg font-bold text-[#0F2045]">{stats.totalMembers}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-bold text-[#0F2045]">{stats.activeMembers}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#C7181F] shrink-0" style={{ background: '#FBE8E9' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Levels Deep</p>
                <p className="text-lg font-bold text-[#0F2045]">{stats.levelsDeep}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#1B3A7D] shrink-0" style={{ background: '#E8EAF2' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Team GV</p>
                <p className="text-lg font-bold text-[#0F2045]">{stats.teamGV.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tree View */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0F2045]">Downline Tree</h3>
              <div className="flex items-center gap-2">
                <button className="text-xs text-[#1B3A7D] font-medium bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand All
                </button>
                <button className="text-xs text-[#1B3A7D] font-medium bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {renderTreeNode(treeData, 0, true)}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
