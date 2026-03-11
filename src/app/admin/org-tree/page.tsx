'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface RepNode {
  id: string;
  name: string;
  rep_id: string;
  rank: string;
  status: 'active' | 'inactive' | 'suspended';
  monthly_bv: number;
  org_size: number;
  level: number;
  photo: string;
  children: RepNode[];
  isExpanded: boolean;
}

export default function OrgTreePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [showCompression, setShowCompression] = useState(true);

  // Mock org tree data
  const [orgTree, setOrgTree] = useState<RepNode>({
    id: 'root',
    name: 'Sarah Mitchell',
    rep_id: '#10001',
    rank: 'Platinum',
    status: 'active',
    monthly_bv: 128492,
    org_size: 2847,
    level: 0,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=72',
    isExpanded: true,
    children: [
      {
        id: 'l1n1',
        name: 'Robert Chen',
        rep_id: '#10042',
        rank: 'Gold',
        status: 'active',
        monthly_bv: 48291,
        org_size: 847,
        level: 1,
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60',
        isExpanded: true,
        children: [
          {
            id: 'l2n1',
            name: 'Jessica Park',
            rep_id: '#10245',
            rank: 'Silver',
            status: 'active',
            monthly_bv: 21490,
            org_size: 284,
            level: 2,
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60',
            isExpanded: false,
            children: []
          },
          {
            id: 'l2n2',
            name: 'David Martinez',
            rep_id: '#10312',
            rank: 'Bronze',
            status: 'active',
            monthly_bv: 8420,
            org_size: 124,
            level: 2,
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60',
            isExpanded: false,
            children: []
          }
        ]
      },
      {
        id: 'l1n2',
        name: 'Amanda Torres',
        rep_id: '#10089',
        rank: 'Silver',
        status: 'active',
        monthly_bv: 31820,
        org_size: 492,
        level: 1,
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60',
        isExpanded: true,
        children: [
          {
            id: 'l2n3',
            name: 'Michael Wong',
            rep_id: '#10387',
            rank: 'Bronze',
            status: 'active',
            monthly_bv: 12340,
            org_size: 198,
            level: 2,
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60',
            isExpanded: false,
            children: []
          }
        ]
      },
      {
        id: 'l1n3',
        name: 'Marcus Johnson',
        rep_id: '#10156',
        rank: 'Bronze',
        status: 'inactive',
        monthly_bv: 0,
        org_size: 45,
        level: 1,
        photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=60',
        isExpanded: false,
        children: []
      }
    ]
  });

  const totalReps = 2847;
  const activeReps = 2104;
  const inactiveReps = 598;
  const suspendedReps = 145;
  const totalTeamBV = 1284920;
  const orgDepth = 8;
  const compressedNodes = 23;

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {router.push('/login'); return;}
      const { data: dist } = await supabase.from('distributors').select('role').eq('email', user.email).single();
      if (!dist || dist.role !== 'admin') {router.push('/dashboard'); return;}
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  function getRankColor(rank: string) {
    if (rank === 'Platinum') return '#7c3aed';
    if (rank === 'Gold') return '#f59e0b';
    if (rank === 'Silver') return '#94a3b8';
    if (rank === 'Bronze') return '#92400e';
    return '#6b7280';
  }

  function getStatusColor(status: string) {
    if (status === 'active') return '#10b981';
    if (status === 'inactive') return '#9ca3af';
    if (status === 'suspended') return '#C7181F';
    return '#6b7280';
  }

  function toggleNode(nodeId: string, node: RepNode): RepNode {
    if (node.id === nodeId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    return {
      ...node,
      children: node.children.map(child => toggleNode(nodeId, child))
    };
  }

  function renderTreeNode(node: RepNode, depth: number = 0) {
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="relative">
        {/* Node */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            node.status === 'inactive' ? 'bg-gray-50 border-gray-200' : 'bg-white border-neutral-200 hover:border-[#1B3A7D] hover:shadow-sm'
          }`}
          style={{ marginLeft: depth > 0 ? `${depth * 32}px` : 0 }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOrgTree(prev => toggleNode(node.id, prev));
              }}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-[#1B3A7D] hover:bg-slate-100 transition-colors"
            >
              <svg className={`w-3 h-3 transition-transform ${node.isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* Rep Photo */}
          <div className="relative flex-shrink-0">
            <img
              src={node.photo}
              alt={node.name}
              className={`w-10 h-10 rounded-full object-cover ${node.status === 'inactive' ? 'opacity-60 grayscale' : ''}`}
              style={{ border: `3px solid ${getRankColor(node.rank)}` }}
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{ backgroundColor: getStatusColor(node.status) }}
            />
          </div>

          {/* Rep Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-sm font-bold truncate ${node.status === 'inactive' ? 'text-gray-400' : 'text-[#0F2045]'}`}>
                {node.name}
              </p>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: getRankColor(node.rank), fontSize: '9px' }}
              >
                {node.rank.toUpperCase()}
              </span>
            </div>
            <p className={`text-xs ${node.status === 'inactive' ? 'text-gray-400' : 'text-gray-500'}`}>
              {node.rep_id} · Level {node.level}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className={`text-xs font-bold ${node.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                ${node.monthly_bv.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Monthly BV</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${node.status === 'inactive' ? 'text-gray-400' : 'text-[#0F2045]'}`}>
                {node.org_size.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Org Size</p>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && node.isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A7D]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{minHeight: '100vh'}}>
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Bar */}
        <div className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin" className="text-xs text-gray-400 hover:text-[#1B3A7D] transition-colors">Command Center</a>
              <svg className="w-2 h-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-[#1B3A7D]">Organization Tree</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Organization Structure</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'tree' ? 'bg-[#1B3A7D] text-white' : 'text-gray-600 hover:text-[#1B3A7D]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Tree View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-[#1B3A7D] text-white' : 'text-gray-600 hover:text-[#1B3A7D]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List View
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-2 flex items-center gap-6 border-b border-[#1B3A7D] border-opacity-15" style={{background: 'linear-gradient(135deg, rgba(27,58,125,0.08), rgba(27,58,125,0.04))'}}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Total Reps:</span>
            <span className="text-xs font-bold text-[#0F2045]">{totalReps.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Active:</span>
            <span className="text-xs font-bold text-emerald-600">{activeReps.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Inactive:</span>
            <span className="text-xs font-bold text-gray-400">{inactiveReps.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Suspended:</span>
            <span className="text-xs font-bold text-[#C7181F]">{suspendedReps.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Total Team BV:</span>
            <span className="text-xs font-bold text-[#0F2045]">${totalTeamBV.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Org Depth:</span>
            <span className="text-xs font-bold text-[#0F2045]">{orgDepth} Levels</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Compressed Nodes:</span>
            <span className="text-xs font-bold text-amber-600">{compressedNodes}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-b border-neutral-200 bg-white">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search rep name, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-xs rounded-lg outline-none text-[#0F2045] placeholder-gray-400 bg-slate-50 border border-slate-200 focus:border-[#1B3A7D]"
            />
          </div>

          {/* Filters */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="text-xs font-medium text-[#1B3A7D] rounded-lg px-3 py-2 outline-none bg-slate-50 border border-slate-200"
          >
            <option value="all">All Ranks</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
            <option value="associate">Associate</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium text-[#1B3A7D] rounded-lg px-3 py-2 outline-none bg-slate-50 border border-slate-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Compression Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompression}
              onChange={(e) => setShowCompression(e.target.checked)}
              className="rounded"
            />
            Show Compression
          </label>

          {/* Legend */}
          <div className="flex items-center gap-3 ml-auto pl-3 border-l border-gray-200">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-500">Inactive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C7181F]"></div>
              <span className="text-xs text-gray-500">Suspended</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <span className="text-xs text-gray-500">Compressed</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-neutral-50">
          {viewMode === 'tree' ? (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
              <div className="space-y-2">
                {renderTreeNode(orgTree)}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
              <p className="text-sm text-gray-500 text-center py-8">List view coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
