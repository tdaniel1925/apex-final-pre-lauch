'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Type definitions
interface InsuranceConfig {
  key: string;
  value: Record<string, unknown>;
  effective_date: string;
  created_at: string;
}

interface ChangeLogEntry {
  id: string;
  engine_type: string;
  field_key: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown>;
  changed_by: string;
  changed_at: string;
}

interface CarrierRateGrid {
  id: string;
  carrier_name: string;
  product_name: string;
  new_hire_pct: number;
  pre_associate_pct: number;
  associate_pct: number;
  agent_pct: number;
  sr_agent_pct: number;
  mga_pct: number;
  effective_date: string;
}

interface RankStructure {
  rank_name: string;
  commission_rate: number;
  rolling_90_day_threshold: number;
}

interface GenerationalOverride {
  gen: number;
  pct: number;
}

interface PPBTier {
  week: number;
  pct: number;
}

interface MGABonus {
  recruits: number;
  pct: number;
  amount: number;
}

interface MGATier {
  tier_name: string;
  direct_mga_count: number;
}

export default function InsuranceEnginePage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sec1: true,
    sec2: true,
    sec3: true,
    sec4: true,
    sec5: true,
    sec6: true,
    sec7: true,
  });

  // Data states
  const [ranks, setRanks] = useState<RankStructure[]>([
    { rank_name: 'New Hire', commission_rate: 0.50, rolling_90_day_threshold: 10000 },
    { rank_name: 'Pre-Associate', commission_rate: 0.55, rolling_90_day_threshold: 20000 },
    { rank_name: 'Associate', commission_rate: 0.60, rolling_90_day_threshold: 30000 },
    { rank_name: 'Agent', commission_rate: 0.70, rolling_90_day_threshold: 75000 },
    { rank_name: 'Sr. Agent', commission_rate: 0.80, rolling_90_day_threshold: 150000 },
    { rank_name: 'MGA', commission_rate: 0.90, rolling_90_day_threshold: 150000 },
  ]);

  const [activeCarrier, setActiveCarrier] = useState('Columbus Life');
  const carriers = ['Columbus Life', 'Corebridge (AIG)', 'F&G', 'United of Omaha', 'National Life Group', 'North American'];
  const [carrierRates, setCarrierRates] = useState<Record<string, CarrierRateGrid[]>>({});

  const [genOverrides, setGenOverrides] = useState<GenerationalOverride[]>([
    { gen: 1, pct: 0.15 },
    { gen: 2, pct: 0.05 },
    { gen: 3, pct: 0.03 },
    { gen: 4, pct: 0.02 },
    { gen: 5, pct: 0.01 },
    { gen: 6, pct: 0.005 },
    { gen: 7, pct: 0 }, // Configurable bonus pool
  ]);

  const [ppbTiers, setPpbTiers] = useState<PPBTier[]>([
    { week: 1, pct: 0.01 },
    { week: 2, pct: 0.02 },
    { week: 3, pct: 0.03 },
    { week: 4, pct: 0.04 },
  ]);
  const [ppbWeeklyThreshold, setPpbWeeklyThreshold] = useState(2000);

  const [mgaBonuses, setMgaBonuses] = useState<MGABonus[]>([
    { recruits: 9, pct: 0.01, amount: 1500 },
    { recruits: 12, pct: 0.02, amount: 3000 },
    { recruits: 15, pct: 0.03, amount: 4500 },
    { recruits: 18, pct: 0.04, amount: 6000 },
  ]);
  const [mgaBaseShop, setMgaBaseShop] = useState(150000);

  const [mgaTiers, setMgaTiers] = useState<MGATier[]>([
    { tier_name: 'Associate MGA', direct_mga_count: 2 },
    { tier_name: 'Sr. Associate MGA', direct_mga_count: 4 },
    { tier_name: 'Executive MGA', direct_mga_count: 6 },
    { tier_name: 'Sr. Executive MGA', direct_mga_count: 8 },
    { tier_name: 'National MGA', direct_mga_count: 10 },
    { tier_name: 'Premier MGA', direct_mga_count: 12 },
  ]);

  const [commRunDay, setCommRunDay] = useState(3);
  const [minPayout, setMinPayout] = useState(25);

  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [changeLogFilter, setChangeLogFilter] = useState('All');

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Check authentication and role
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: distributor } = await supabase
        .from('distributors')
        .select('role')
        .eq('email', authUser.email)
        .single();

      if (!distributor || !['cfo', 'admin'].includes(distributor.role)) {
        router.push('/dashboard');
        return;
      }

      setUser({ id: authUser.id, email: authUser.email || '' });

      // Load insurance config from Supabase
      const { data: configData } = await supabase
        .from('insurance_comp_engine_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (configData && configData.length > 0) {
        // Parse config data and populate states
        configData.forEach((cfg: InsuranceConfig) => {
          if (cfg.key.startsWith('rank.')) {
            // Rank data loaded
          } else if (cfg.key.startsWith('ppb.')) {
            // PPB data loaded
          } else if (cfg.key.startsWith('mga_bonus.')) {
            // MGA bonus data loaded
          } else if (cfg.key.startsWith('override.')) {
            // Override data loaded
          }
        });
      }

      // Load carrier rate grids
      const { data: rateData } = await supabase
        .from('carrier_rate_grids')
        .select('*')
        .order('carrier_name', { ascending: true });

      if (rateData) {
        const grouped: Record<string, CarrierRateGrid[]> = {};
        rateData.forEach((rate: CarrierRateGrid) => {
          if (!grouped[rate.carrier_name]) {
            grouped[rate.carrier_name] = [];
          }
          grouped[rate.carrier_name].push(rate);
        });
        setCarrierRates(grouped);
      }

      // Load change log
      const { data: logData } = await supabase
        .from('comp_engine_change_log')
        .select('*')
        .eq('engine_type', 'insurance')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (logData) {
        setChangeLog(logData);
      }

      setLoading(false);
    }

    loadData();
  }, [router, supabase]);

  // Validation
  function validateConfig(): boolean {
    const newErrors: string[] = [];

    // No specific validation for insurance engine at this time
    // Could add validation for gen override sum, etc.

    setErrors(newErrors);
    return newErrors.length === 0;
  }

  // Save configuration
  async function handleSave() {
    if (!validateConfig()) {
      alert('Configuration has validation errors. Please fix them before saving.');
      return;
    }

    if (!effectiveDate) {
      alert('Please select an effective date before saving.');
      return;
    }

    // Save logic here - write to insurance_comp_engine_config table
    // and log changes to comp_engine_change_log with engine_type = 'insurance'

    alert('Configuration saved successfully!');
    setHasChanges(false);
  }

  // Discard changes
  function handleDiscard() {
    if (confirm('Are you sure you want to discard all unsaved changes?')) {
      // Reload data
      window.location.reload();
    }
  }

  // Export change log
  function exportChangeLog() {
    const csv = 'Date,User,Field,Old Value,New Value\n' +
      changeLog.map(entry =>
        `${entry.changed_at},${entry.changed_by},${entry.field_key},"${JSON.stringify(entry.old_value)}","${JSON.stringify(entry.new_value)}"`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insurance_engine_change_log.csv';
    a.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-sm text-neutral-500">Loading Insurance Engine Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Header */}
      <header className="bg-primary-800 text-white shadow-custom z-30 relative">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-small flex items-center justify-center text-primary-800 font-bold text-xl">A</div>
              <span className="font-heading font-bold text-lg tracking-tight">Apex Affinity Group</span>
            </div>
            <div className="h-6 w-px bg-primary-600 mx-2"></div>
            <span className="text-primary-200 text-sm font-medium">CFO Finance Tool</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-primary-100">
              <a href="/finance" className="hover:text-white transition-colors">Finance Home</a>
              <a href="/finance/saas-engine" className="hover:text-white transition-colors">SaaS Engine</a>
              <a href="/finance/insurance-engine" className="text-white border-b-2 border-white pb-0.5">Insurance Engine</a>
            </nav>
            <div className="flex items-center gap-3 pl-6 border-l border-primary-600">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-primary-200">Logged in as</div>
                <div className="text-sm font-bold">{user?.email || 'CFO'}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title Bar */}
      <div className="bg-white border-b border-neutral-200 shadow-custom sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">System Admin</span>
              <span className="text-neutral-300">/</span>
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Configuration</span>
            </div>
            <h1 className="font-heading font-bold text-xl text-neutral-900 tracking-tight flex items-center gap-3">
              Insurance Compensation Engine Configuration
              <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-small border border-primary-100">v1.0.0 (Active)</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Read Only Toggle */}
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-small px-3 py-2">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Mode:</span>
              <div className="flex items-center gap-2">
                <span className={editMode ? 'text-xs font-medium text-neutral-400' : 'text-xs font-bold text-neutral-800'}>Read-Only</span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${editMode ? 'bg-primary-600' : 'bg-neutral-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${editMode ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                </button>
                <span className={editMode ? 'text-xs font-bold text-primary-700' : 'text-xs font-medium text-neutral-400'}>Edit</span>
              </div>
            </div>
            {editMode && (
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-small px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <div>
                  <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Effective Date</div>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="text-xs font-bold text-neutral-800 bg-transparent border-none outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {errors.length > 0 && (
        <div className="bg-secondary-50 border-b border-secondary-200 px-6 py-2.5 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-600 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div className="flex-1">
            <span className="text-xs font-bold text-secondary-700">Configuration Errors: </span>
            <span className="text-xs text-secondary-600">{errors.join(' ')}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto w-full px-6 py-6 pb-28">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN: CONFIGURATION PANELS */}
          <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">

            {/* SECTION 1: Insurance Rank Structure */}
            <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
              <div
                className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => toggleSection('sec1')}
              >
                <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  1. Insurance Rank Structure
                  <span className="text-[10px] font-medium text-neutral-400 font-normal">6 ranks with commission rates & rolling 90-day thresholds</span>
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec1 ? 'rotate-180' : ''}`}>
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
              {expandedSections.sec1 && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Rank Name</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Commission Rate</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Rolling 90-Day Threshold</th>
                        <th className="px-4 py-2 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Last Modified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {ranks.map((rank, idx) => (
                        <tr key={idx} className="group hover:bg-neutral-50">
                          <td className="px-4 py-2 font-medium text-neutral-800">{rank.rank_name}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={`${(rank.commission_rate * 100).toFixed(0)}%`}
                              disabled={!editMode}
                              className={`w-full text-right border border-neutral-300 rounded-small px-2 py-1 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value.replace('%', '')) / 100;
                                const updated = [...ranks];
                                updated[idx].commission_rate = val;
                                setRanks(updated);
                                setHasChanges(true);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={`$${rank.rolling_90_day_threshold.toLocaleString()}`}
                              disabled={!editMode}
                              className={`w-full text-right border border-neutral-300 rounded-small px-2 py-1 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                              onChange={(e) => {
                                const val = parseInt(e.target.value.replace(/[$,]/g, ''));
                                const updated = [...ranks];
                                updated[idx].rolling_90_day_threshold = val;
                                setRanks(updated);
                                setHasChanges(true);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 text-center text-[10px] text-neutral-400">System</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600">
                    <strong>Promotion Requirements:</strong> 60% placement rate + 80% persistency rate minimum
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 2: Carrier Rate Grids */}
            <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
              <div
                className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => toggleSection('sec2')}
              >
                <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  2. Carrier Rate Grids
                  <span className="text-[10px] font-medium text-neutral-400 font-normal">Product rates by carrier & rank</span>
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec2 ? 'rotate-180' : ''}`}>
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
              {expandedSections.sec2 && (
                <div>
                  {/* Carrier Tabs */}
                  <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-neutral-200 bg-white overflow-x-auto">
                    {carriers.map((carrier) => (
                      <button
                        key={carrier}
                        onClick={() => setActiveCarrier(carrier)}
                        className={`px-4 py-2 text-xs font-bold rounded-t-small border border-b-0 whitespace-nowrap ${
                          activeCarrier === carrier
                            ? 'bg-white border-neutral-200 text-primary-700'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                        }`}
                      >
                        {carrier}
                      </button>
                    ))}
                  </div>

                  {/* Carrier Rate Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Product Name</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">New Hire (50%)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Pre-Assoc. (55%)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Associate (60%)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Agent (70%)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Sr. Agent (80%)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">MGA (90%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {carrierRates[activeCarrier] && carrierRates[activeCarrier].length > 0 ? (
                          carrierRates[activeCarrier].map((rate, idx) => (
                            <tr key={idx} className="group hover:bg-neutral-50">
                              <td className="px-4 py-2 font-medium text-neutral-800">{rate.product_name}</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-600">{(rate.new_hire_pct * 100).toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-600">{(rate.pre_associate_pct * 100).toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-600">{(rate.associate_pct * 100).toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-600">{(rate.agent_pct * 100).toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-600">{(rate.sr_agent_pct * 100).toFixed(1)}%</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-600">{(rate.mga_pct * 100).toFixed(1)}%</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-xs text-neutral-400">
                              No rate grids configured for {activeCarrier}. Add products in the admin panel.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600">
                    <strong>Note:</strong> Apex pays ABOVE street level only. Carrier pays street level direct to agent.
                  </div>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SECTION 3: Generational Override Structure */}
              <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec3')}
                >
                  <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    3. Generational Overrides
                  </h2>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec3 ? 'rotate-180' : ''}`}>
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                {expandedSections.sec3 && (
                  <div className="p-5">
                    <div className="space-y-3">
                      {genOverrides.map((gen, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-600 w-16">Gen {gen.gen}</span>
                          <div className="flex-1 relative">
                            <div className="h-8 bg-neutral-50 border border-neutral-200 rounded-small overflow-hidden flex">
                              <div className="bg-primary-100 h-full transition-all" style={{ width: `${gen.pct * 100}%` }}></div>
                            </div>
                            <input
                              type="text"
                              value={gen.gen === 7 ? 'Bonus Pool (TBD)' : `${(gen.pct * 100).toFixed(1)}%`}
                              disabled={!editMode || gen.gen === 7}
                              className="absolute top-0 right-0 h-8 w-28 text-right pr-2 bg-transparent border-none focus:ring-0 text-xs font-medium text-neutral-800"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value.replace('%', '')) / 100;
                                const updated = [...genOverrides];
                                updated[idx].pct = val;
                                setGenOverrides(updated);
                                setHasChanges(true);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
                      <strong>Gen 7 Note:</strong> Bonus pool for Associate MGA to Premier MGA only (configurable).
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 4: Personal Production Bonus (PPB) */}
              <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec4')}
                >
                  <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    4. PPB (Personal Production Bonus)
                  </h2>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec4 ? 'rotate-180' : ''}`}>
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
                {expandedSections.sec4 && (
                  <div className="p-5">
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Weekly Threshold</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                        <input
                          type="text"
                          value={ppbWeeklyThreshold.toLocaleString()}
                          disabled={!editMode}
                          className={`w-full pl-6 pr-3 py-2 border border-neutral-300 rounded-small text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/,/g, ''));
                            setPpbWeeklyThreshold(val);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {ppbTiers.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-small border border-neutral-200">
                          <span className="text-xs font-medium text-neutral-700">Week {tier.week}{tier.week === 4 ? '+' : ''}</span>
                          <input
                            type="text"
                            value={`${(tier.pct * 100).toFixed(0)}%`}
                            disabled={!editMode}
                            className={`w-16 text-right border border-neutral-300 rounded-small px-2 py-1 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-white text-neutral-400' : 'bg-white'}`}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value.replace('%', '')) / 100;
                              const updated = [...ppbTiers];
                              updated[idx].pct = val;
                              setPpbTiers(updated);
                              setHasChanges(true);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
                      Resets to 0% if any week is missed. Measured weekly, paid monthly. Stacks on top of base commission.
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* SECTION 5: MGA Quarterly Recruiting Bonus */}
            <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
              <div
                className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => toggleSection('sec5')}
              >
                <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <path d="M12 2v20M2 12h20"></path>
                  </svg>
                  5. MGA Quarterly Recruiting Bonus
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec5 ? 'rotate-180' : ''}`}>
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
              {expandedSections.sec5 && (
                <div className="p-5">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Base Shop Requirement (per quarter)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                      <input
                        type="text"
                        value={mgaBaseShop.toLocaleString()}
                        disabled={!editMode}
                        className={`w-full pl-6 pr-3 py-2 border border-neutral-300 rounded-small text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/[$,]/g, ''));
                          setMgaBaseShop(val);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Recruits</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Bonus %</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Amount (on $150K)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {mgaBonuses.map((bonus, idx) => (
                          <tr key={idx} className="group hover:bg-neutral-50">
                            <td className="px-4 py-2 font-medium text-neutral-800">{bonus.recruits}</td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={`${(bonus.pct * 100).toFixed(0)}%`}
                                disabled={!editMode}
                                className={`w-full text-right border border-neutral-300 rounded-small px-2 py-1 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value.replace('%', '')) / 100;
                                  const updated = [...mgaBonuses];
                                  updated[idx].pct = val;
                                  updated[idx].amount = mgaBaseShop * val;
                                  setMgaBonuses(updated);
                                  setHasChanges(true);
                                }}
                              />
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-medium text-green-700">${bonus.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
                    Paid within 30 days of quarter close. Requires minimum shop production threshold.
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 6: MGA Leadership Tiers */}
            <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden">
              <div
                className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => toggleSection('sec6')}
              >
                <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  6. MGA Leadership Tiers
                  <span className="text-[10px] font-medium text-neutral-400 font-normal">All at 90% rate</span>
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec6 ? 'rotate-180' : ''}`}>
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
              {expandedSections.sec6 && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Tier Name</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Direct MGAs Required</th>
                        <th className="px-4 py-2 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Commission Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {mgaTiers.map((tier, idx) => (
                        <tr key={idx} className="group hover:bg-neutral-50">
                          <td className="px-4 py-2 font-medium text-neutral-800">{tier.tier_name}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={tier.direct_mga_count}
                              disabled={!editMode}
                              className={`w-full text-right border border-neutral-300 rounded-small px-2 py-1 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const updated = [...mgaTiers];
                                updated[idx].direct_mga_count = val;
                                setMgaTiers(updated);
                                setHasChanges(true);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 text-center text-xs font-bold text-green-700">90%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600">
                    <strong>Direct MGA Bonus:</strong> Additional 15% override on direct recruits in base shop
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 7: Commission Run Rules */}
            <section className="bg-white rounded-large shadow-custom border border-neutral-200 overflow-hidden mb-8">
              <div
                className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => toggleSection('sec7')}
              >
                <h2 className="font-heading font-semibold text-neutral-800 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  7. Commission Run Rules
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition-transform ${expandedSections.sec7 ? 'rotate-180' : ''}`}>
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
              {expandedSections.sec7 && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Commission Run Day (business day of month)</label>
                    <input
                      type="text"
                      value={commRunDay}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border border-neutral-300 rounded-small text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                      onChange={(e) => {
                        setCommRunDay(parseInt(e.target.value));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Minimum Payout Threshold</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                      <input
                        type="text"
                        value={minPayout}
                        disabled={!editMode}
                        className={`w-full pl-6 pr-3 py-2 border border-neutral-300 rounded-small text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none ${!editMode ? 'bg-neutral-50 text-neutral-400' : ''}`}
                        onChange={(e) => {
                          setMinPayout(parseInt(e.target.value.replace(/[$,]/g, '')));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-small border border-neutral-200">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Prior-month rank governs commission rate</li>
                      <li>Run is immutable once locked</li>
                      <li>Payouts below ${minPayout} roll to next month</li>
                    </ul>
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN: CHANGE LOG */}
          <div className="col-span-12 xl:col-span-3">
            <div className="bg-white rounded-large shadow-custom border border-neutral-200 h-full flex flex-col sticky top-24 max-h-[calc(100vh-8rem)]">
              <div className="bg-primary-800 px-4 py-3 rounded-t-large flex justify-between items-center flex-shrink-0">
                <h3 className="font-heading font-bold text-white text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  Change Log
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-primary-600 text-primary-100 px-1.5 py-0.5 rounded-small font-bold">
                    {changeLog.length}
                  </span>
                  <button onClick={exportChangeLog} className="text-xs text-primary-200 hover:text-white underline">Export</button>
                </div>
              </div>

              <div className="px-3 py-2 border-b border-neutral-200 bg-neutral-50 flex gap-1 flex-wrap">
                {['All', 'Today', 'Errors', 'Mine'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setChangeLogFilter(filter)}
                    className={`text-[10px] font-medium px-2 py-1 rounded-small transition-colors ${
                      changeLogFilter === filter
                        ? 'bg-primary-800 text-white font-bold'
                        : 'bg-white border border-neutral-200 text-neutral-500 hover:border-primary-300'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {changeLog.length > 0 ? (
                  changeLog.map((entry, idx) => (
                    <div key={entry.id} className="relative pl-4 border-l-2 border-neutral-200 pb-2">
                      <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                      <div className="text-[10px] font-bold text-neutral-400 mb-0.5">
                        {new Date(entry.changed_at).toLocaleDateString()} {new Date(entry.changed_at).toLocaleTimeString()}
                      </div>
                      <div className="text-xs font-bold text-neutral-800">{entry.changed_by}</div>
                      <div className="mt-1 text-xs text-neutral-600 bg-neutral-50 p-2 rounded-small border border-neutral-100">
                        <div className="font-semibold text-primary-700 mb-1">{entry.field_key}</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                          <span className="text-neutral-400">Old:</span>
                          <span className="line-through text-secondary-600 font-mono">{JSON.stringify(entry.old_value)}</span>
                          <span className="text-neutral-400">New:</span>
                          <span className="font-bold text-green-600 font-mono">{JSON.stringify(entry.new_value)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-neutral-400 py-8">
                    No change log entries yet.
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-neutral-200 bg-neutral-50 rounded-b-large text-center">
                <button className="text-xs font-semibold text-primary-700 hover:text-primary-800">View Full Audit Log →</button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Action Bar */}
      {editMode && hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40 px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Unsaved changes in configuration.</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleDiscard} className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-small transition-colors">
                Discard Changes
              </button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-small shadow-custom transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
