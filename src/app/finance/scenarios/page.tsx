'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Types
interface Scenario {
  id: string;
  name: string;
  calculator_type: 'waterfall' | 'pricing' | 'bonusvolume' | 'bonuspool' | 'rankpromo' | 'weighting' | 'commrun';
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export default function SavedScenariosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  // Scenarios state
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);

  // Modal state
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioType, setNewScenarioType] = useState<Scenario['calculator_type']>('waterfall');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const calculatorTypes = ['all', 'waterfall', 'pricing', 'bonusvolume', 'bonuspool', 'rankpromo', 'weighting', 'commrun'];

  // Check auth and fetch scenarios
  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: distributor } = await supabase
        .from('distributors')
        .select('role')
        .eq('email', user.email)
        .single();

      if (!distributor || !['cfo', 'admin'].includes(distributor.role)) {
        router.push('/dashboard');
        return;
      }

      setUser({ id: user.id, email: user.email || '' });
      await fetchScenarios();
      setLoading(false);
    }

    checkAuthAndFetch();
  }, []);

  async function fetchScenarios() {
    const { data } = await supabase
      .from('saved_scenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setScenarios(data as Scenario[]);
    }
  }

  async function handleSaveNewScenario() {
    if (!newScenarioName.trim() || !user) return;

    const { error } = await supabase.from('saved_scenarios').insert({
      name: newScenarioName,
      calculator_type: newScenarioType,
      inputs: { placeholder: 'Add your inputs here' },
      outputs: { placeholder: 'Add your outputs here' },
      created_by: user.email,
    });

    if (!error) {
      await fetchScenarios();
      setShowNewScenarioModal(false);
      setNewScenarioName('');
    }
  }

  async function handleDeleteScenario(id: string) {
    if (!confirm('Delete this scenario?')) return;

    const { error } = await supabase
      .from('saved_scenarios')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchScenarios();
      setSelectedScenarios(selectedScenarios.filter(s => s.id !== id));
    }
  }

  function handleSelectScenario(scenario: Scenario) {
    if (selectedScenarios.find(s => s.id === scenario.id)) {
      setSelectedScenarios(selectedScenarios.filter(s => s.id !== scenario.id));
    } else {
      if (selectedScenarios.length < 3) {
        setSelectedScenarios([...selectedScenarios, scenario]);
      }
    }
  }

  function handleClearCompare() {
    setSelectedScenarios([]);
  }

  function handleExportComparison() {
    if (selectedScenarios.length === 0) return;

    // Generate CSV
    let csv = 'Field,';
    csv += selectedScenarios.map(s => s.name).join(',') + '\n';

    csv += 'Calculator Type,';
    csv += selectedScenarios.map(s => s.calculator_type).join(',') + '\n';

    csv += 'Created At,';
    csv += selectedScenarios.map(s => new Date(s.created_at).toLocaleDateString()).join(',') + '\n';

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-comparison-${new Date().toISOString()}.csv`;
    a.click();
  }

  const filteredScenarios = scenarios.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || s.calculator_type === filterType;
    return matchesSearch && matchesType;
  });

  function getTypeColor(type: string) {
    switch (type) {
      case 'waterfall': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pricing': return 'bg-green-100 text-green-700 border-green-200';
      case 'bonusvolume': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bonuspool': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'rankpromo': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'weighting': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'commrun': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'waterfall': return 'Waterfall';
      case 'pricing': return 'Pricing';
      case 'bonusvolume': return 'Bonus Volume';
      case 'bonuspool': return 'Bonus Pool';
      case 'rankpromo': return 'Rank Promo';
      case 'weighting': return 'Weighting';
      case 'commrun': return 'Comm Run';
      default: return type;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR NAV */}
      <aside className="w-56 bg-[#1B3A7D] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#1B3A7D] font-bold text-lg flex-shrink-0">
              A
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Apex Affinity</div>
              <div className="text-primary-300 text-[10px] font-medium">CFO Finance Tool</div>
            </div>
          </div>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-1">
            <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest px-2">Operations</span>
          </div>
          <a href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Dashboard
          </a>
          <a href="/finance" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Finance Home
          </a>

          <div className="px-3 mt-4 mb-1">
            <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest px-2">Configuration</span>
          </div>
          <a href="/finance/saas-engine" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M1 12h2M21 12h2M12 1v2M12 21v2"></path></svg>
            SaaS Engine
          </a>
          <a href="/finance/insurance-engine" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Insurance Engine
          </a>

          <div className="px-3 mt-4 mb-1">
            <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest px-2">Tools</span>
          </div>
          <a href="/finance/scenarios" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded bg-primary-700 text-white transition-colors text-xs font-bold mb-0.5 border-l-2 border-[#C7181F]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Saved Scenarios
          </a>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-primary-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary-600 bg-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">{user?.email?.split('@')[0]}</div>
              <div className="text-primary-300 text-[10px] truncate">CFO · Admin</div>
            </div>
            <button className="ml-auto text-primary-400 hover:text-white flex-shrink-0" onClick={() => supabase.auth.signOut()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-neutral-200 shadow-sm z-20 flex-shrink-0">
          <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">CFO Tools</span>
                <span className="text-neutral-300">/</span>
                <span className="text-[10px] font-semibold text-[#1B3A7D] uppercase tracking-wider">Scenarios</span>
              </div>
              <h1 className="font-bold text-lg text-neutral-900 tracking-tight flex items-center gap-2">
                Saved Scenarios & Compare View
                <span className="text-xs font-medium bg-neutral-50 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">{scenarios.length} scenarios</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowNewScenarioModal(true)}
                className="px-5 py-2 text-sm font-bold text-white bg-[#1B3A7D] hover:bg-[#2d4b9f] rounded shadow transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Scenario
              </button>
              <button
                onClick={handleClearCompare}
                disabled={selectedScenarios.length === 0}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Compare
              </button>
              <button
                onClick={handleExportComparison}
                disabled={selectedScenarios.length === 0}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export CSV
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="flex-1 flex min-w-0">
          {/* LEFT PANEL: Scenarios List */}
          <div className="w-72 flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col">
            {/* Search Bar */}
            <div className="p-3 border-b border-neutral-200 bg-neutral-50">
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
              />
            </div>

            {/* Filter Buttons */}
            <div className="p-3 border-b border-neutral-200 bg-neutral-50">
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">Filter by Type</div>
              <div className="flex flex-wrap gap-1">
                {calculatorTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                      filterType === type
                        ? 'bg-[#1B3A7D] text-white'
                        : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {type === 'all' ? 'All' : getTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenarios List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredScenarios.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-xs text-neutral-500">No scenarios found</p>
                </div>
              ) : (
                filteredScenarios.map(scenario => (
                  <div
                    key={scenario.id}
                    className={`bg-white border rounded p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedScenarios.find(s => s.id === scenario.id)
                        ? 'border-[#1B3A7D] bg-primary-50'
                        : 'border-neutral-200'
                    }`}
                    onClick={() => handleSelectScenario(scenario)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xs font-bold text-neutral-900 flex-1">{scenario.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScenario(scenario.id);
                        }}
                        className="text-neutral-400 hover:text-[#C7181F] flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${getTypeColor(scenario.calculator_type)}`}>
                        {getTypeLabel(scenario.calculator_type)}
                      </span>
                    </div>
                    <div className="text-[9px] text-neutral-400 flex items-center justify-between">
                      <span>{new Date(scenario.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{scenario.created_by.split('@')[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-neutral-200 bg-neutral-50">
              <p className="text-[10px] text-neutral-500">
                Select up to 3 scenarios to compare
                {selectedScenarios.length > 0 && ` (${selectedScenarios.length}/3 selected)`}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Compare View */}
          <div className="flex-1 overflow-y-auto bg-neutral-50 p-5">
            {selectedScenarios.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <svg className="w-20 h-20 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="text-lg font-bold text-neutral-800 mb-2">No Scenarios Selected</h2>
                  <p className="text-sm text-neutral-500">
                    Select scenarios from the left panel to compare them side by side. You can compare up to 3 scenarios at once.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                {selectedScenarios.map((scenario, index) => (
                  <div key={scenario.id} className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className={`px-4 py-3 border-b ${index === 0 ? 'bg-primary-800' : 'bg-neutral-50 border-neutral-200'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${index === 0 ? 'text-white' : 'text-neutral-900'}`}>
                          {scenario.name}
                          {index === 0 && <span className="text-[10px] font-normal ml-2 opacity-80">(Baseline)</span>}
                        </h3>
                        <button
                          onClick={() => setSelectedScenarios(selectedScenarios.filter(s => s.id !== scenario.id))}
                          className={`flex-shrink-0 ${index === 0 ? 'text-white opacity-80 hover:opacity-100' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border inline-block ${index === 0 ? 'bg-white/20 text-white border-white/30' : getTypeColor(scenario.calculator_type)}`}>
                        {getTypeLabel(scenario.calculator_type)}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                      <div className="text-[10px] text-neutral-500 space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold uppercase tracking-wide">Created:</span>
                          <span>{new Date(scenario.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold uppercase tracking-wide">By:</span>
                          <span>{scenario.created_by.split('@')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">Input Values</h4>
                      <div className="space-y-1">
                        {Object.entries(scenario.inputs).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-neutral-600 font-medium">{key}:</span>
                            <span className="text-neutral-900 font-semibold">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div className="px-4 py-3">
                      <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">Output Values</h4>
                      <div className="space-y-1">
                        {Object.entries(scenario.outputs).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-neutral-600 font-medium">{key}:</span>
                            <span className="text-neutral-900 font-bold">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Difference indicator (for non-baseline) */}
                    {index > 0 && (
                      <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                        <div className="text-[9px] text-neutral-500 italic">
                          Differences vs baseline highlighted above
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW SCENARIO MODAL */}
      {showNewScenarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">Save New Scenario</h2>
              <p className="text-xs text-neutral-500 mt-1">Give your scenario a name and select the calculator type</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="e.g., PulseFlow $149 vs $159"
                  className="w-full text-sm border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
                  Calculator Type
                </label>
                <select
                  value={newScenarioType}
                  onChange={(e) => setNewScenarioType(e.target.value as Scenario['calculator_type'])}
                  className="w-full text-sm border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                >
                  <option value="waterfall">Waterfall</option>
                  <option value="pricing">Pricing</option>
                  <option value="bonusvolume">Bonus Volume</option>
                  <option value="bonuspool">Bonus Pool</option>
                  <option value="rankpromo">Rank Promo</option>
                  <option value="weighting">Weighting</option>
                  <option value="commrun">Commission Run</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewScenarioModal(false);
                  setNewScenarioName('');
                }}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewScenario}
                disabled={!newScenarioName.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-[#1B3A7D] hover:bg-[#2d4b9f] rounded shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
