'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Rep {
  id: string;
  name: string;
  rep_id: string;
  location: string;
  rank: string;
  monthly_bv: number;
  org_size: number;
  status: 'active' | 'suspended' | 'terminated';
  join_date: string;
  photo: string;
}

export default function RepManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'terminated'>('all');
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [terminateModal, setTerminateModal] = useState<string | null>(null);
  const [suspendModal, setSuspendModal] = useState<string | null>(null);

  async function handleSuspendRep(repId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('distributors').update({ status: 'suspended' }).eq('id', repId);

    alert('Rep suspended successfully');
    setSuspendModal(null);
  }

  async function handleTerminateRep(repId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Call handle_termination function
    const { data, error } = await supabase.rpc('handle_termination', { p_rep_id: repId });

    if (error) {
      alert(`Termination failed: ${error.message}`);
      return;
    }

    alert(`Rep terminated successfully. ${data?.length || 0} downline reps re-sponsored.`);
    setTerminateModal(null);
    router.refresh();
  }

  // Mock data
  const reps: Rep[] = [
    { id: '1', name: 'Marcus Thompson', rep_id: 'ASD-10291', location: 'Austin, TX', rank: 'Diamond Director', monthly_bv: 48291, org_size: 1847, status: 'active', join_date: 'Jan 15, 2019', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64' },
    { id: '2', name: 'Jennifer Caldwell', rep_id: 'ASD-20847', location: 'Dallas, TX', rank: 'Platinum Director', monthly_bv: 41820, org_size: 1392, status: 'active', join_date: 'Mar 22, 2019', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64' },
    { id: '3', name: 'Robert Nguyen', rep_id: 'ASD-31029', location: 'Houston, TX', rank: 'Gold Director', monthly_bv: 38447, org_size: 1104, status: 'active', join_date: 'Jun 08, 2019', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64' },
    { id: '4', name: 'Sarah Jenkins', rep_id: 'ASD-48291', location: 'Austin, TX', rank: 'Diamond Director', monthly_bv: 31920, org_size: 847, status: 'active', join_date: 'Sep 14, 2019', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64' },
    { id: '5', name: 'David Park', rep_id: 'ASD-55102', location: 'Phoenix, AZ', rank: 'Silver Director', monthly_bv: 28740, org_size: 623, status: 'active', join_date: 'Feb 03, 2020', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64' },
    { id: '6', name: 'Lisa Monroe', rep_id: 'ASD-61847', location: 'Denver, CO', rank: 'Gold Director', monthly_bv: 0, org_size: 481, status: 'suspended', join_date: 'May 17, 2020', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64' },
    { id: '7', name: 'Kevin Walsh', rep_id: 'ASD-72910', location: 'Chicago, IL', rank: 'Silver Director', monthly_bv: 21390, org_size: 374, status: 'active', join_date: 'Aug 29, 2020', photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=64' },
    { id: '8', name: 'Alicia Torres', rep_id: 'ASD-83021', location: 'Miami, FL', rank: 'Bronze Director', monthly_bv: 14820, org_size: 218, status: 'active', join_date: 'Jan 11, 2021', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64' },
    { id: '9', name: 'Brian Holloway', rep_id: 'ASD-94182', location: 'Seattle, WA', rank: 'Rep', monthly_bv: 0, org_size: 0, status: 'terminated', join_date: 'Apr 05, 2022', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64' },
    { id: '10', name: 'Rachel Kim', rep_id: 'ASD-10482', location: 'Atlanta, GA', rank: 'Rep', monthly_bv: 3240, org_size: 12, status: 'active', join_date: 'Nov 02, 2024', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64' },
  ];

  const totalReps = 12847;
  const activeReps = 11204;
  const suspendedReps = 891;
  const terminatedReps = 752;
  const newThisMonth = 487;

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

  function getRankClass(rank: string) {
    if (rank.includes('Diamond')) return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    if (rank.includes('Platinum')) return 'bg-slate-50 text-slate-700 border border-slate-200';
    if (rank.includes('Gold')) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    if (rank.includes('Silver')) return 'bg-gray-50 text-gray-700 border border-gray-200';
    if (rank.includes('Bronze')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-neutral-50 text-neutral-700 border border-neutral-200';
  }

  function getStatusClass(status: string) {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700';
    if (status === 'suspended') return 'bg-amber-100 text-amber-700';
    if (status === 'terminated') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  const filteredReps = reps.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.rep_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleRepSelection = (repId: string) => {
    setSelectedReps(prev =>
      prev.includes(repId) ? prev.filter(id => id !== repId) : [...prev, repId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReps.length === filteredReps.length) {
      setSelectedReps([]);
    } else {
      setSelectedReps(filteredReps.map(r => r.id));
    }
  };

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
              <span className="text-xs font-semibold text-[#1B3A7D]">Rep Management</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Rep Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add New Rep
            </button>
            <div className="relative">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C7181F] text-white flex items-center justify-center font-bold text-xs">7</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-neutral-50">

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0F2045]">{totalReps.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Reps</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0F2045]">{activeReps.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0F2045]">{suspendedReps.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Suspended</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #C7181F 0%, #D9272F 100%)'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0F2045]">{terminatedReps.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Terminated</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0F2045]">+{newThisMonth}</p>
                <p className="text-xs text-gray-500">New This Month</p>
              </div>
            </div>
          </div>

          {/* Search, Filters, Table */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="px-5 py-4 flex items-center gap-3 flex-wrap border-b border-neutral-200">
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, ID, email, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs rounded-xl outline-none text-[#0F2045] placeholder-gray-400 bg-slate-50 border border-slate-200 focus:border-[#1B3A7D]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-500 hover:text-[#1B3A7D]'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'active' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-500 hover:text-[#1B3A7D]'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('suspended')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'suspended' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-500 hover:text-[#1B3A7D]'}`}
                >
                  Suspended
                </button>
                <button
                  onClick={() => setStatusFilter('terminated')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'terminated' ? 'bg-white text-[#1B3A7D] shadow-sm' : 'text-gray-500 hover:text-[#1B3A7D]'}`}
                >
                  Terminated
                </button>
              </div>

              <select className="text-xs font-medium text-[#1B3A7D] rounded-xl px-3 py-2 outline-none bg-slate-50 border border-slate-200">
                <option>All Ranks</option>
                <option>Diamond Director</option>
                <option>Platinum Director</option>
                <option>Gold Director</option>
                <option>Silver Director</option>
                <option>Bronze Director</option>
                <option>Rep</option>
              </select>

              <select className="text-xs font-medium text-[#1B3A7D] rounded-xl px-3 py-2 outline-none bg-slate-50 border border-slate-200">
                <option>All Regions</option>
                <option>Texas</option>
                <option>California</option>
                <option>Florida</option>
                <option>New York</option>
                <option>Illinois</option>
              </select>

              <select className="text-xs font-medium text-[#1B3A7D] rounded-xl px-3 py-2 outline-none bg-slate-50 border border-slate-200">
                <option>Any Join Date</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
                <option>Last Year</option>
              </select>

              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#1B3A7D] transition-colors bg-slate-50 border border-slate-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                More Filters
              </button>
            </div>

            {/* Bulk Action Bar */}
            {selectedReps.length > 0 && (
              <div className="px-5 py-2.5 flex items-center gap-3 border-b border-[#1B3A7D] border-opacity-15" style={{background: 'linear-gradient(135deg, rgba(27,58,125,0.08), rgba(27,58,125,0.04))'}}>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-xs" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>{selectedReps.length}</span>
                  <span className="text-xs font-semibold text-[#0F2045]">reps selected</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Suspend Selected
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Terminate Selected
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] bg-[#1B3A7D] bg-opacity-7 hover:bg-opacity-12 border border-[#1B3A7D] border-opacity-15 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Message Selected
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3A7D] bg-[#1B3A7D] bg-opacity-7 hover:bg-opacity-12 border border-[#1B3A7D] border-opacity-15 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Selected
                </button>
                <button onClick={() => setSelectedReps([])} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-5 py-2.5 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedReps.length === filteredReps.length && filteredReps.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rep Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly BV</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Org Size</th>
                    <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Join Date</th>
                    <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredReps.map((rep) => (
                    <tr key={rep.id} className={`hover:bg-slate-50 ${selectedReps.includes(rep.id) ? 'bg-blue-50 bg-opacity-30' : ''} ${rep.status === 'suspended' ? 'bg-amber-50 bg-opacity-20' : ''} ${rep.status === 'terminated' ? 'bg-red-50 bg-opacity-15' : ''}`}>
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selectedReps.includes(rep.id)}
                          onChange={() => toggleRepSelection(rep.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rep.photo}
                            alt={rep.name}
                            className={`w-8 h-8 rounded-full flex-shrink-0 ${rep.status === 'terminated' ? 'opacity-50 grayscale' : ''}`}
                            style={{border: rep.status === 'terminated' ? '2px solid #fca5a5' : rep.status === 'suspended' ? '2px solid #fcd34d' : rep.rank.includes('Diamond') ? '2px solid #D9272F' : '2px solid #9EAACC'}}
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${rep.status === 'terminated' ? 'text-gray-400 line-through' : 'text-[#0F2045]'}`}>{rep.name}</p>
                            <p className={`truncate text-[9px] ${rep.status === 'terminated' ? 'text-gray-300' : 'text-gray-400'}`}>{rep.rep_id} · {rep.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRankClass(rep.rank)}`} style={{fontSize: '9px', whiteSpace: 'nowrap'}}>
                          {rep.rank.replace('Director', 'Dir.')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className={`text-xs font-bold ${rep.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          ${rep.monthly_bv.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className={`text-xs font-semibold ${rep.status === 'terminated' ? 'text-gray-300' : 'text-[#0F2045]'}`}>
                          {rep.org_size.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusClass(rep.status)}`} style={{fontSize: '9px'}}>
                            {rep.status.charAt(0).toUpperCase() + rep.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-xs text-center ${rep.status === 'terminated' ? 'text-gray-400' : 'text-gray-500'}`}>{rep.join_date}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setPanelOpen(true)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] transition-colors"
                            style={{background: 'rgba(27,58,125,0.08)'}}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors bg-slate-50">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 flex items-center justify-between border-t border-neutral-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-[#0F2045]">1–10</span> of <span className="font-semibold text-[#0F2045]">12,847</span> reps
                </p>
                <select className="text-xs font-medium text-[#1B3A7D] rounded-lg px-2 py-1 outline-none bg-slate-50 border border-slate-200">
                  <option>10 per page</option>
                  <option>25 per page</option>
                  <option>50 per page</option>
                  <option>100 per page</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1B3A7D] transition-colors bg-slate-50 border border-slate-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>1</button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] font-semibold text-xs transition-colors bg-slate-50 border border-slate-200">2</button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] font-semibold text-xs transition-colors bg-slate-50 border border-slate-200">3</button>
                <span className="text-xs text-gray-400 px-1">...</span>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1B3A7D] hover:text-[#0F2045] font-semibold text-xs transition-colors bg-slate-50 border border-slate-200">1285</button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1B3A7D] transition-colors bg-slate-50 border border-slate-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
