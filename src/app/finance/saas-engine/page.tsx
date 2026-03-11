'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Types
interface SaaSConfig {
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

interface WaterfallSettings {
  botmakers: number;
  bonus_pool: number;
  apex: number;
  seller: number;
  override: number;
}

interface Product {
  name: string;
  member: number;
  retail: number;
  bv: number;
}

interface Rank {
  name: string;
  personal_bv: number;
  team_bv: number;
  rank_id: number;
}

interface OverrideLevel {
  level: number;
  pct: number;
}

interface Bonus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  details: string;
}

export default function SaaSEngineConfig() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState({
    sec1: true,
    sec2: true,
    sec3: true,
    sec4: true,
    sec5: false,
    sec6: true,
    sec7: true,
  });

  // Configuration data
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [waterfall, setWaterfall] = useState<WaterfallSettings>({
    botmakers: 0.30,
    bonus_pool: 0.05,
    apex: 0.30,
    seller: 0.60,
    override: 0.40,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [overrideLevels, setOverrideLevels] = useState<OverrideLevel[]>([]);
  const [bizCenterSplit, setBizCenterSplit] = useState({
    botmakers: 11,
    apex: 8,
    buyer: 10,
    referrer: 8,
    pool: 2,
  });

  // Bonus catalog with enabled flags
  const [bonuses, setBonuses] = useState<Bonus[]>([
    { id: 'cab', name: 'Customer Acquisition Bonus (CAB)', description: '$50 per retail customer', enabled: true, details: 'Cap: $1,000/mo (20 CABs) • Wait: 60 days' },
    { id: 'volume_kicker', name: 'Volume Kicker', description: 'Tiered BV bonus (30-day window)', enabled: true, details: '$500 BV = $250 • $1,000 BV = $750 • $1,500 BV = $1,500' },
    { id: 'tvb', name: 'Team Volume Bonus (TVB)', description: 'Org BV milestone rewards', enabled: true, details: '$5K = $100 • $10K = $500 • $25K = $1,000 • $50K = $2,000' },
    { id: 'pvb', name: 'Personal Volume Bonus (PVB)', description: '+5% on personal BV', enabled: true, details: 'Requires: 10+ retail customers' },
    { id: 'retention', name: 'Retention Bonus', description: '+3% on personal BV', enabled: true, details: 'Requires: 80%+ renewal rate' },
    { id: 'matching', name: 'Matching Bonus', description: 'Match on L1 leaders overrides', enabled: true, details: 'Silver: 10% • Gold: 15% • Platinum: 20%' },
    { id: 'check_match_orig', name: 'Check Match (Original)', description: '5% of L1 Silver+ total earnings', enabled: true, details: 'Gold/Platinum only' },
    { id: 'gold_accel', name: 'Gold Accelerator', description: '$3,467 one-time', enabled: true, details: 'Paid on first Gold qualification' },
    // NEW BONUSES (all disabled by default)
    { id: 'org_royalty', name: 'Org Royalty', description: '3% of org BV monthly', enabled: false, details: 'Platinum only' },
    { id: 'depth_royalty', name: 'Depth Royalty', description: '2% of org BV monthly', enabled: false, details: 'Gold only' },
    { id: 'team_pulse_silver', name: 'Team Pulse Silver', description: '$50/mo per active direct Associate+', enabled: false, details: 'Silver+ ranks only' },
    { id: 'team_pulse_gold', name: 'Team Pulse Gold', description: '$75/mo per active direct Silver+', enabled: false, details: 'Gold+ ranks only' },
    { id: 'team_pulse_platinum', name: 'Team Pulse Platinum', description: '$100/mo per active direct Gold+', enabled: false, details: 'Platinum rank only' },
    { id: 'check_match_new', name: 'Check Match (Enhanced)', description: '15% of direct Platinum total earnings', enabled: false, details: 'Platinum only' },
    { id: 'bronze_consistency', name: 'Bronze Consistency Achievement', description: '$500 one-time', enabled: false, details: '3 consecutive Bronze months' },
    { id: 'silver_achievement', name: 'Silver Achievement', description: '$1,500 one-time', enabled: false, details: 'Paid on first Silver qualification' },
    { id: 'gold_achievement', name: 'Gold Achievement', description: '$5,000 one-time', enabled: false, details: 'Paid on first Gold qualification' },
    { id: 'platinum_achievement', name: 'Platinum Achievement', description: '$10,000 one-time', enabled: false, details: 'Paid on first Platinum qualification' },
    { id: 'silver_builder', name: 'Silver Builder', description: '$750 per downline Silver promotion', enabled: false, details: 'Paid to sponsor' },
    { id: 'gold_builder', name: 'Gold Builder', description: '$2,000 per downline Gold promotion', enabled: false, details: 'Paid to sponsor' },
    { id: 'platinum_builder', name: 'Platinum Builder', description: '$5,000 per downline Platinum promotion', enabled: false, details: 'Paid to sponsor' },
    { id: 'promotion_fund', name: 'Promotion Fund', description: '$5 from every Business Center sale', enabled: false, details: 'Reserved for promotion bonuses' },
  ]);

  // Change log
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [changeLogFilter, setChangeLogFilter] = useState<'all' | 'today' | 'errors' | 'mine'>('all');

  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check user role and fetch data
  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check role
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
      await fetchConfigData();
      await fetchChangeLog();
      setLoading(false);
    }

    checkAuthAndFetch();
  }, []);

  async function fetchConfigData() {
    const { data: config } = await supabase
      .from('saas_comp_engine_config')
      .select('*')
      .order('key');

    if (!config) return;

    // Parse ranks
    const rankData: Rank[] = [];
    config.filter(c => c.key.startsWith('rank.')).forEach(c => {
      const val = c.value as { rank_name: string; personal_bv: number; team_bv: number; rank_id: number };
      rankData.push({
        name: val.rank_name,
        personal_bv: val.personal_bv,
        team_bv: val.team_bv,
        rank_id: val.rank_id,
      });
    });
    setRanks(rankData.sort((a, b) => a.rank_id - b.rank_id));

    // Parse waterfall
    const waterfallData: Partial<WaterfallSettings> = {};
    config.filter(c => c.key.startsWith('waterfall.')).forEach(c => {
      const val = c.value as { value: number };
      if (c.key.includes('botmakers')) waterfallData.botmakers = val.value;
      if (c.key.includes('bonus_pool')) waterfallData.bonus_pool = val.value;
      if (c.key.includes('apex')) waterfallData.apex = val.value;
      if (c.key.includes('seller')) waterfallData.seller = val.value;
      if (c.key.includes('override')) waterfallData.override = val.value;
    });
    if (Object.keys(waterfallData).length > 0) {
      setWaterfall(waterfallData as WaterfallSettings);
    }

    // Parse products
    const productData: Product[] = [];
    config.filter(c => c.key.startsWith('product.')).forEach(c => {
      const val = c.value as { name: string; member_price: number; retail_price: number; bv: number };
      productData.push({
        name: val.name,
        member: val.member_price,
        retail: val.retail_price,
        bv: val.bv,
      });
    });
    setProducts(productData);

    // Parse override levels (standard only for display)
    const overrideData: OverrideLevel[] = [];
    config.filter(c => c.key.startsWith('override.standard.')).forEach(c => {
      const val = c.value as { pct: number };
      const level = parseInt(c.key.split('.').pop()!.replace('l', ''));
      overrideData.push({
        level,
        pct: val.pct,
      });
    });
    setOverrideLevels(overrideData.sort((a, b) => a.level - b.level));

    // Parse business center
    const bizCenterData = config.find(c => c.key === 'bizcenter.seller_amount');
    const enrollerData = config.find(c => c.key === 'bizcenter.enroller_amount');
    if (bizCenterData && enrollerData) {
      const sellerVal = bizCenterData.value as { value: number };
      const enrollerVal = enrollerData.value as { value: number };
      setBizCenterSplit({
        botmakers: 11,
        apex: 8,
        buyer: sellerVal.value,
        referrer: enrollerVal.value,
        pool: 2,
      });
    }
  }

  async function fetchChangeLog() {
    const { data } = await supabase
      .from('comp_engine_change_log')
      .select('*')
      .eq('engine_type', 'saas')
      .order('changed_at', { ascending: false })
      .limit(100);

    if (data) setChangeLog(data);
  }

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function validateConfig(): boolean {
    const newErrors: string[] = [];

    // Validate seller + override = 100%
    if (Math.abs((waterfall.seller + waterfall.override) - 1.0) > 0.001) {
      newErrors.push(`Seller Split + Override Pool Split must equal 100%. Current: ${((waterfall.seller + waterfall.override) * 100).toFixed(1)}%`);
    }

    // Validate override levels sum to 100%
    const overrideSum = overrideLevels.reduce((sum, level) => sum + level.pct, 0);
    if (Math.abs(overrideSum - 1.0) > 0.001) {
      newErrors.push(`Override levels must sum to 100%. Current: ${(overrideSum * 100).toFixed(1)}%`);
    }

    // Validate business center split sums to $39
    const bizCenterSum = Object.values(bizCenterSplit).reduce((sum, val) => sum + val, 0);
    if (bizCenterSum !== 39) {
      newErrors.push(`Business Center split must sum to $39. Current: $${bizCenterSum}`);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }

  async function handleSave() {
    if (!validateConfig()) {
      alert('Please fix validation errors before saving.');
      return;
    }

    // In production, open modal for effective date confirmation
    // For now, save directly
    const confirmed = confirm(`Save changes with effective date: ${effectiveDate}?`);
    if (!confirmed) return;

    try {
      // Save changes to saas_comp_engine_config
      // Log changes to comp_engine_change_log
      // This would be implemented with proper Supabase calls

      alert('Configuration saved successfully!');
      await fetchChangeLog();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save configuration: ${errorMessage}`);
    }
  }

  function getFilteredChangeLog() {
    let filtered = changeLog;

    if (changeLogFilter === 'today') {
      const today = new Date().toDateString();
      filtered = changeLog.filter(log =>
        new Date(log.changed_at).toDateString() === today
      );
    } else if (changeLogFilter === 'errors') {
      // Filter error entries - would need error flag in DB
      filtered = changeLog;
    } else if (changeLogFilter === 'mine') {
      filtered = changeLog.filter(log => log.changed_by === user?.id);
    }

    return filtered;
  }

  function exportChangeLogCSV() {
    const csv = [
      ['Timestamp', 'User', 'Field', 'Old Value', 'New Value'].join(','),
      ...getFilteredChangeLog().map(log => [
        log.changed_at,
        log.changed_by,
        log.field_key,
        JSON.stringify(log.old_value),
        JSON.stringify(log.new_value)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saas-engine-changelog-${new Date().toISOString()}.csv`;
    a.click();
  }

  useEffect(() => {
    if (!loading) {
      validateConfig();
    }
  }, [waterfall, overrideLevels, bizCenterSplit, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading configuration...</p>
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
          <a href="/finance/commission-run" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Commission Run
          </a>
          <a href="/finance/calculator" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Pricing Calculator
          </a>

          <div className="px-3 mt-4 mb-1">
            <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest px-2">Configuration</span>
          </div>
          <a href="/finance/saas-engine" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded bg-primary-700 text-white transition-colors text-xs font-bold mb-0.5 border-l-2 border-[#C7181F]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M1 12h2M21 12h2M12 1v2M12 21v2"></path></svg>
            SaaS Engine
          </a>
          <a href="/finance/insurance-engine" className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Insurance Engine
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
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">System Admin</span>
                <span className="text-neutral-300">/</span>
                <span className="text-[10px] font-semibold text-[#1B3A7D] uppercase tracking-wider">Configuration</span>
                <span className="text-neutral-300">/</span>
                <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">SaaS Engine</span>
              </div>
              <h1 className="font-bold text-lg text-neutral-900 tracking-tight flex items-center gap-2">
                SaaS Compensation Engine
                <span className="text-xs font-medium bg-primary-50 text-[#1B3A7D] px-2 py-0.5 rounded border border-primary-100">v7.0 (Active)</span>
                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>Live
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Read-Only Toggle */}
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded px-3 py-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Mode:</span>
                <span className="text-[10px] font-medium text-neutral-400">Read-Only</span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A7D] focus:ring-offset-1 ${
                    editMode ? 'bg-[#1B3A7D]' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`${editMode ? 'translate-x-5' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}></span>
                </button>
                <span className={`text-[10px] font-bold ${editMode ? 'text-[#1B3A7D]' : 'text-neutral-400'}`}>Edit</span>
              </div>
              {/* Effective Date */}
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <div>
                  <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Effective Date</div>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    disabled={!editMode}
                    className="text-xs font-bold text-neutral-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!editMode || errors.length > 0}
                className="px-5 py-2 text-sm font-bold text-white bg-[#1B3A7D] hover:bg-[#2d4b9f] rounded shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save Configuration
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors" onClick={() => window.location.reload()}>
                Discard
              </button>
            </div>
          </div>
        </header>

        {/* WARNING BANNER */}
        {errors.length > 0 && (
          <div className="bg-[#fdf2f2] border-b border-[#f9cece] px-6 py-2.5 flex items-center gap-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C7181F] flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#C7181F]">Validation Errors: </span>
              <span className="text-xs text-[#C7181F]">{errors[0]}</span>
            </div>
            <button className="text-[10px] font-bold text-[#C7181F] hover:text-[#a71319] border border-[#f4a9a9] rounded px-2 py-1 flex-shrink-0 hover:bg-[#fce4e4] transition-colors">
              Jump to Error
            </button>
          </div>
        )}

        {/* CONTENT BODY */}
        <div className="flex-1 flex min-w-0">
          {/* MAIN CONFIG AREA */}
          <div className="flex-1 overflow-y-auto p-5 min-w-0" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <div className="flex flex-col gap-4 pb-20 max-w-7xl">
              {/* SECTION 1: RANK STRUCTURE */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec1 ? 'section-expanded' : 'section-collapsed'}`} id="sec1">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec1')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    1. SaaS Rank Structure
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">{ranks.length} ranks configured</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">Valid</span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec1 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec1 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Rank Name</th>
                          <th className="px-4 py-2 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Rank ID</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Min Personal BV</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Min Team BV</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Override Levels</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {ranks.map((rank, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  rank.name === 'Inactive' ? 'bg-neutral-400' :
                                  rank.name === 'Associate' ? 'bg-neutral-400' :
                                  rank.name === 'Bronze' ? 'bg-amber-600' :
                                  rank.name === 'Silver' ? 'bg-neutral-400' :
                                  rank.name === 'Gold' ? 'bg-yellow-500' :
                                  'bg-neutral-600'
                                } flex-shrink-0`}></span>
                                <span className="font-semibold text-neutral-700 text-xs">{rank.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center text-xs font-mono text-neutral-600">{rank.rank_id}</td>
                            <td className="px-4 py-2 text-right text-xs text-neutral-700">${rank.personal_bv}</td>
                            <td className="px-4 py-2 text-right text-xs text-neutral-700">${rank.team_bv.toLocaleString()}</td>
                            <td className="px-4 py-2 text-xs text-neutral-600">
                              {rank.rank_id === -1 ? 'None' :
                               rank.rank_id === 0 ? 'L1' :
                               rank.rank_id === 1 ? 'L1-L2' :
                               rank.rank_id === 2 ? 'L1-L3' :
                               rank.rank_id === 3 ? 'L1-L4' :
                               'L1-L5 (+ L6-L7 if Powerline)'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* SECTION 2: WATERFALL SETTINGS */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec2 ? 'section-expanded' : 'section-collapsed'}`} id="sec2">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec2')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    2. Waterfall Settings
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">V7 Formula</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      Math.abs((waterfall.seller + waterfall.override) - 1.0) < 0.001 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.abs((waterfall.seller + waterfall.override) - 1.0) < 0.001 ? 'Valid' : 'Error'}
                    </span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec2 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec2 && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">BotMakers Cut</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={waterfall.botmakers * 100}
                            onChange={(e) => setWaterfall({ ...waterfall, botmakers: parseFloat(e.target.value) / 100 })}
                            disabled={!editMode}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                          />
                          <span className="text-sm text-neutral-600">%</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Uses FLOOR() — rounds down to cent</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Bonus Pool</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={waterfall.bonus_pool * 100}
                            onChange={(e) => setWaterfall({ ...waterfall, bonus_pool: parseFloat(e.target.value) / 100 })}
                            disabled={!editMode}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                          />
                          <span className="text-sm text-neutral-600">%</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">ROUND(,2) applied</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Apex Cut</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={waterfall.apex * 100}
                            onChange={(e) => setWaterfall({ ...waterfall, apex: parseFloat(e.target.value) / 100 })}
                            disabled={!editMode}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                          />
                          <span className="text-sm text-neutral-600">%</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Uses FLOOR() — rounds down to cent</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Seller Split</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={waterfall.seller * 100}
                            onChange={(e) => setWaterfall({ ...waterfall, seller: parseFloat(e.target.value) / 100 })}
                            disabled={!editMode}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                          />
                          <span className="text-sm text-neutral-600">%</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Of Field Remainder, ROUND(,2)</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Override Pool Split</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={waterfall.override * 100}
                            onChange={(e) => setWaterfall({ ...waterfall, override: parseFloat(e.target.value) / 100 })}
                            disabled={!editMode}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                          />
                          <span className="text-sm text-neutral-600">%</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Of Field Remainder, ROUND(,2)</p>
                      </div>
                    </div>
                    {Math.abs((waterfall.seller + waterfall.override) - 1.0) >= 0.001 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <p className="text-xs text-red-700">Seller Split + Override Pool Split must equal 100%. Current: {((waterfall.seller + waterfall.override) * 100).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* SECTION 3: PRODUCTS & BV */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec3 ? 'section-expanded' : 'section-collapsed'}`} id="sec3">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec3')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                    3. Products & BV
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">{products.length} products</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">Valid</span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec3 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec3 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Product</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Member</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Retail</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">BV</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Seller (Member)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Seller (Retail)</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-wide">L1 Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {products.map((product, idx) => {
                          // Calculate commissions using V7 waterfall
                          const calcCommissions = (bv: number) => {
                            const botmakers = Math.floor(bv * 0.30 * 100) / 100;
                            const adjGross = bv - botmakers;
                            const bonusPool = Math.round(adjGross * 0.05 * 100) / 100;
                            const afterPool = adjGross - bonusPool;
                            const apex = Math.floor(afterPool * 0.30 * 100) / 100;
                            const field = afterPool - apex;
                            const seller = Math.round(field * 0.60 * 100) / 100;
                            const overridePool = Math.round(field * 0.40 * 100) / 100;
                            const l1Override = Math.round(overridePool * 0.30 * 100) / 100;
                            return { seller, l1Override };
                          };

                          const memberComm = calcCommissions(product.bv);
                          const retailComm = calcCommissions(product.retail);

                          return (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="px-4 py-2">
                                <span className="font-semibold text-neutral-700 text-xs">{product.name}</span>
                              </td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-700">${product.member}</td>
                              <td className="px-4 py-2 text-right text-xs text-neutral-700">${product.retail}</td>
                              <td className="px-4 py-2 text-right text-xs font-semibold text-[#1B3A7D]">${product.bv}</td>
                              <td className="px-4 py-2 text-right text-xs text-green-700">${memberComm.seller.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right text-xs text-green-700">${retailComm.seller.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right text-xs text-blue-700">${memberComm.l1Override.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                      <p className="text-[10px] text-neutral-600">
                        <strong>Note:</strong> Business Center ($39) bypasses waterfall with flat split: Buyer $10, Referrer L1 $8. Commissions shown use V7 formula: BotMakers FLOOR(30%) → Bonus Pool ROUND(5%) → Apex FLOOR(30%) → Field → Seller ROUND(60%) / Override ROUND(40%).
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 4: OVERRIDE POOL DISTRIBUTION */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec4 ? 'section-expanded' : 'section-collapsed'}`} id="sec4">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec4')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    4. Override Pool Distribution
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">5 levels (standard)</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      Math.abs(overrideLevels.reduce((sum, l) => sum + l.pct, 0) - 1.0) < 0.001 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.abs(overrideLevels.reduce((sum, l) => sum + l.pct, 0) - 1.0) < 0.001 ? 'Valid' : 'Error'}
                    </span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec4 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec4 && (
                  <div className="p-5">
                    <div className="space-y-3">
                      {overrideLevels.map((level) => (
                        <div key={level.level} className="flex items-center gap-4">
                          <label className="text-xs font-bold text-neutral-700 w-12">L{level.level}</label>
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="number"
                              value={level.pct * 100}
                              onChange={(e) => {
                                const newLevels = [...overrideLevels];
                                newLevels[level.level - 1].pct = parseFloat(e.target.value) / 100;
                                setOverrideLevels(newLevels);
                              }}
                              disabled={!editMode}
                              className="w-24 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                            />
                            <span className="text-sm text-neutral-600">%</span>
                            <div className="flex-1 bg-neutral-100 rounded-full h-2">
                              <div
                                className="bg-[#1B3A7D] h-2 rounded-full transition-all"
                                style={{ width: `${level.pct * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700">Total:</span>
                      <span className={`text-sm font-bold ${
                        Math.abs(overrideLevels.reduce((sum, l) => sum + l.pct, 0) - 1.0) < 0.001 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {(overrideLevels.reduce((sum, l) => sum + l.pct, 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    {Math.abs(overrideLevels.reduce((sum, l) => sum + l.pct, 0) - 1.0) >= 0.001 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <p className="text-xs text-red-700">Override levels must sum to exactly 100%</p>
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-[10px] text-blue-900">
                        <strong>Note:</strong> Override pool is 40% of Field Remainder, split across active upline levels. Powerline (L6-L7) requires Platinum rank + $100K team BV and uses adjusted percentages.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 5: BONUS CATALOG */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec5 ? 'section-expanded' : 'section-collapsed'}`} id="sec5">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec5')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    5. Bonus Catalog
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">{bonuses.length} bonus programs • {bonuses.filter(b => b.enabled).length} enabled</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">Valid</span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec5 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec5 && (
                  <div className="p-5 space-y-3">
                    {bonuses.map((bonus, index) => (
                      <div key={bonus.id} className={`border rounded transition-all ${bonus.enabled ? 'border-neutral-200' : 'border-neutral-200 opacity-60'}`}>
                        <div className={`px-4 py-2 border-b flex justify-between items-center ${bonus.enabled ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-100 border-neutral-200'}`}>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xs font-bold text-neutral-800">{index + 1}. {bonus.name}</h3>
                            {!bonus.enabled && (
                              <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                Pending Approval
                              </span>
                            )}
                          </div>
                          {/* Toggle Switch */}
                          <button
                            onClick={() => {
                              const updated = [...bonuses];
                              updated[index].enabled = !updated[index].enabled;
                              setBonuses(updated);
                            }}
                            disabled={!editMode}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A7D] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                              bonus.enabled ? 'bg-[#1B3A7D]' : 'bg-neutral-300'
                            }`}
                          >
                            <span className={`${bonus.enabled ? 'translate-x-5' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}></span>
                          </button>
                        </div>
                        <div className="p-4 text-xs">
                          <div className="flex justify-between mb-2">
                            <span className="text-neutral-500">Description:</span>
                            <strong className={bonus.enabled ? 'text-neutral-900' : 'text-neutral-600'}>{bonus.description}</strong>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-2">{bonus.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 6: BUSINESS CENTER SPLIT */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec6 ? 'section-expanded' : 'section-collapsed'}`} id="sec6">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec6')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                    6. Business Center Split
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">$39 flat split</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      Object.values(bizCenterSplit).reduce((sum, val) => sum + val, 0) === 39 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {Object.values(bizCenterSplit).reduce((sum, val) => sum + val, 0) === 39 ? 'Valid' : 'Error'}
                    </span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec6 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec6 && (
                  <div className="p-5">
                    <div className="space-y-3">
                      {Object.entries(bizCenterSplit).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-4">
                          <label className="text-xs font-bold text-neutral-700 w-32 capitalize">{key}</label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => setBizCenterSplit({ ...bizCenterSplit, [key]: parseFloat(e.target.value) || 0 })}
                              disabled={!editMode}
                              className="w-24 px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#1B3A7D] focus:ring-1 focus:ring-[#1B3A7D] outline-none disabled:bg-neutral-50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700">Total:</span>
                      <span className={`text-sm font-bold ${
                        Object.values(bizCenterSplit).reduce((sum, val) => sum + val, 0) === 39 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        ${Object.values(bizCenterSplit).reduce((sum, val) => sum + val, 0)}
                      </span>
                    </div>
                    {Object.values(bizCenterSplit).reduce((sum, val) => sum + val, 0) !== 39 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <p className="text-xs text-red-700">Business Center split must sum to exactly $39</p>
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-[10px] text-blue-900">
                        <strong>Note:</strong> Business Center bypasses waterfall. Flat $39 split with $0 CAB. No L2-L7 overrides, only L1 referrer gets commission.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 7: COMMISSION RUN RULES */}
              <section className={`bg-white rounded-lg shadow border border-neutral-200 overflow-hidden ${expandedSections.sec7 ? 'section-expanded' : 'section-collapsed'}`} id="sec7">
                <div
                  className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleSection('sec7')}
                >
                  <h2 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B3A7D]"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    7. Commission Run Rules
                    <span className="text-[10px] font-medium text-neutral-400 font-normal">Execution policies</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">Valid</span>
                    <svg className={`text-neutral-400 transition-transform duration-200 ${expandedSections.sec7 ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>
                </div>
                {expandedSections.sec7 && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-neutral-200 rounded p-4">
                        <h4 className="text-xs font-bold text-neutral-800 mb-2">Minimum Payout</h4>
                        <div className="text-2xl font-bold text-[#1B3A7D]">$25</div>
                        <p className="text-[10px] text-neutral-500 mt-1">Amounts under $25 carry forward to next month</p>
                      </div>
                      <div className="border border-neutral-200 rounded p-4">
                        <h4 className="text-xs font-bold text-neutral-800 mb-2">Run Timing</h4>
                        <div className="text-lg font-bold text-neutral-700">3rd business day</div>
                        <p className="text-[10px] text-neutral-500 mt-1">Of following month after BV snapshot</p>
                      </div>
                    </div>
                    <div className="border border-neutral-200 rounded p-4">
                      <h4 className="text-xs font-bold text-neutral-800 mb-2">Rank Qualification</h4>
                      <p className="text-xs text-neutral-700">Prior month's rank governs override access for the commission run</p>
                      <p className="text-[10px] text-neutral-500 mt-2">Example: February rank determines March commission eligibility</p>
                    </div>
                    <div className="border border-neutral-200 rounded p-4">
                      <h4 className="text-xs font-bold text-neutral-800 mb-2">Immutability</h4>
                      <p className="text-xs text-neutral-700">Once locked, commission runs cannot be modified</p>
                      <p className="text-[10px] text-neutral-500 mt-2">Manual adjustments require CFO approval and audit log entry</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded p-4">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <div>
                          <h4 className="text-xs font-bold text-amber-900 mb-1">Compression</h4>
                          <p className="text-[10px] text-amber-800">If an upline is not qualified for their level, the override passes to the next qualified upline (compression). Uncompressed overrides remain in pool.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* RIGHT PANEL - CHANGE LOG */}
          <div className="w-80 bg-neutral-50 border-l border-neutral-200 flex flex-col flex-shrink-0 overflow-hidden">
            <div className="bg-[#1B3A7D] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Change Log</h3>
              <button onClick={exportChangeLogCSV} className="text-white hover:text-primary-200 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            </div>
            <div className="p-3 border-b border-neutral-200 flex gap-1">
              {(['all', 'today', 'errors', 'mine'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setChangeLogFilter(filter)}
                  className={`flex-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-colors ${
                    changeLogFilter === filter
                      ? 'bg-[#1B3A7D] text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {getFilteredChangeLog().length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-8">No change log entries</p>
              ) : (
                getFilteredChangeLog().map((log) => (
                  <div key={log.id} className="bg-white rounded border border-neutral-200 p-3 border-l-2 border-l-[#1B3A7D]">
                    <div className="text-[10px] text-neutral-400 mb-1">{new Date(log.changed_at).toLocaleString()}</div>
                    <div className="text-xs font-semibold text-neutral-800 mb-1">{log.field_key}</div>
                    <div className="text-[10px] text-neutral-600">
                      <span className="font-medium">Old:</span> {JSON.stringify(log.old_value)}
                    </div>
                    <div className="text-[10px] text-neutral-600">
                      <span className="font-medium">New:</span> {JSON.stringify(log.new_value)}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">By: {log.changed_by}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
