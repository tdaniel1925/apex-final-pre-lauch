import React from 'react';

const 11DistributorDashboard = () => {
  return (
    <>
      

<div className="flex" style={{height: 'auto', minHeight: '100%'}}>

  <!-- DARK NAVY SIDEBAR -->
  <aside className="w-64 flex flex-col flex-shrink-0" style={{background: '#0f1729', minHeight: '100%'}}>
    <!-- Logo -->
    <div className="px-5 py-5 border-b" style={{borderColor: '#1e2d4a'}}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-small flex items-center justify-center" style={{background: 'linear-gradient(135deg, #2196f3, #1565c0)'}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 7v11h5v-6h4v6h5V7L10 2z" fill="white" opacity="0.9"></path>
            <circle cx="10" cy="5" r="2" fill="white"></circle>
          </svg>
        </div>
        <div>
          <div className="font-heading text-white font-bold text-sm tracking-wide">NexaMLM</div>
          <div className="text-xs" style={{color: '#64748b'}}>Distributor Portal</div>
        </div>
      </div>
    </div>

    <!-- User Profile Mini -->
    <div className="px-5 py-4 border-b" style={{borderColor: '#1e2d4a'}}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-small overflow-hidden flex-shrink-0">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="Profile" className="w-full h-full object-cover">
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">Marcus Johnson</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="rank-badge" style={{background: 'rgba(255,193,7,0.15)', color: '#ffc107'}}>⭐ Gold</span>
          </div>
        </div>
        <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-9-notifications-center" className="relative flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold" style={{fontSize: 9}}>3</span>
        </a>
      </div>
    </div>

    <!-- Navigation -->
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
      <div className="px-3 pb-2 pt-1">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{color: '#475569'}}>My Business</span>
      </div>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-1-distributor-dashboard" className="sidebar-nav-item active">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        Dashboard
      </a>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-2-my-customers" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        My Customers
      </a>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-3-my-commissions" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        My Commissions
      </a>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-4-my-team" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        My Team
      </a>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-5-rank-goals" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        Rank & Goals
      </a>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-6-share-grow" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        Share & Grow
      </a>

      <div className="px-3 pb-2 pt-4">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{color: '#475569'}}>Account</span>
      </div>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-7-profile-settings" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Profile & Settings
      </a>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-8-help-training" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Help & Training
      </a>

      <div className="px-3 pb-2 pt-4">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{color: '#475569'}}>Corporate</span>
      </div>
      <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/2-1-corporate-dashboard" className="sidebar-nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        Corporate Portal
      </a>
    </nav>

    <!-- Sidebar Footer -->
    <div className="px-5 py-4 border-t" style={{borderColor: '#1e2d4a'}}>
      <div className="flex items-center justify-between">
        <div className="text-xs" style={{color: '#475569'}}>ID: #MJ-48291</div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-xs" style={{color: '#64748b'}}>Active</span>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main className="flex-1 flex flex-col overflow-hidden" style={{background: '#f8fafc'}}>

    <!-- Top Header Bar -->
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="font-heading text-xl font-bold text-slate-900" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Good morning, Marcus 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's your business overview for <span className="font-semibold text-slate-700">June 2025</span></p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-small px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span className="text-sm text-slate-600 font-medium">June 2025</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-9-notifications-center" className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-small flex items-center justify-center hover:bg-slate-100 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold" style={{fontSize: 9}}>3</span>
        </a>
        <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-7-profile-settings" className="w-9 h-9 rounded-small overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-colors">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="Profile" className="w-full h-full object-cover">
        </a>
      </div>
    </header>

    <!-- Scrollable Content -->
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

      <!-- 4-STAT BAR -->
      <section className="grid grid-cols-4 gap-4" style={{maxHeight: 160}}>
        <!-- Commissions -->
        <div className="stat-card count-up-anim" style={{animationDelay: '0s'}}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-small flex items-center justify-center" style={{background: 'rgba(33,150,243,0.1)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+12.4%</span>
          </div>
          <div className="font-mono-val text-2xl font-bold text-slate-900 count-up" data-target="3847.50">$3,847.50</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Total Commissions</div>
          <div className="text-xs text-slate-400 mt-0.5">This month</div>
        </div>

        <!-- Customers -->
        <div className="stat-card count-up-anim" style={{animationDelay: '0.1s'}}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-small flex items-center justify-center" style={{background: 'rgba(76,175,80,0.1)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+3 new</span>
          </div>
          <div className="font-mono-val text-2xl font-bold text-slate-900 count-up" data-target="47">47</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Active Customers</div>
          <div className="text-xs text-slate-400 mt-0.5">Total enrolled</div>
        </div>

        <!-- Personal BV -->
        <div className="stat-card count-up-anim" style={{animationDelay: '0.2s'}}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-small flex items-center justify-center" style={{background: 'rgba(255,193,7,0.1)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">82% goal</span>
          </div>
          <div className="font-mono-val text-2xl font-bold text-slate-900 count-up" data-target="1640">1,640 BV</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Personal BV</div>
          <div className="text-xs text-slate-400 mt-0.5">Goal: 2,000 BV</div>
        </div>

        <!-- Team BV -->
        <div className="stat-card count-up-anim" style={{animationDelay: '0.3s'}}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-small flex items-center justify-center" style={{background: 'rgba(233,30,99,0.1)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e91e63" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">+8.1%</span>
          </div>
          <div className="font-mono-val text-2xl font-bold text-slate-900 count-up" data-target="18420">18,420 BV</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Team BV</div>
          <div className="text-xs text-slate-400 mt-0.5">All downlines</div>
        </div>
      </section>

      <!-- ROW 2: Rank Progress + Fast Start Tracker -->
      <section className="grid grid-cols-3 gap-4" style={{maxHeight: 280}}>

        <!-- Rank Progress Panel (2/3 width) -->
        <div className="col-span-2 bg-white rounded-large border border-slate-100 shadow-custom p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Rank Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">Advance to Platinum by end of month</p>
            </div>
            <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-5-rank-goals" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View Details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>

          <!-- Rank Track -->
          <div className="flex items-center gap-0 mb-5">
            <!-- Silver -->
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-300 bg-slate-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="12" r="10"></circle></svg>
              </div>
              <div className="text-xs text-slate-400 mt-1.5 font-medium">Silver</div>
            </div>
            <div className="flex-1 h-1.5 bg-amber-400 mx-1 rounded-full"></div>
            <!-- Gold (current) -->
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-amber-400 bg-amber-50 shadow-custom-hover">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffc107"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div className="text-xs text-amber-600 mt-1.5 font-bold">Gold ✓</div>
            </div>
            <div className="flex-1 h-1.5 mx-1 rounded-full overflow-hidden bg-slate-200">
              <div className="h-full bg-blue-500 progress-bar-fill" style={{width: '68%'}}></div>
            </div>
            <!-- Platinum (next) -->
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-blue-300 bg-blue-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#90caf9"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div className="text-xs text-blue-500 mt-1.5 font-medium">Platinum</div>
            </div>
            <div className="flex-1 h-1.5 bg-slate-200 mx-1 rounded-full"></div>
            <!-- Diamond -->
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-200 bg-slate-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#cbd5e1"><polygon points="12 2 22 9 18 21 6 21 2 9"></polygon></svg>
              </div>
              <div className="text-xs text-slate-400 mt-1.5 font-medium">Diamond</div>
            </div>
          </div>

          <!-- Requirements for Platinum -->
          <div className="bg-blue-50 rounded-small p-4 border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Platinum Requirements</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-600">Personal BV</span>
                  <span className="text-xs font-mono-val font-semibold text-slate-800">1,640/2,000</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full progress-bar-fill" style={{width: '82%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-600">Team BV</span>
                  <span className="text-xs font-mono-val font-semibold text-slate-800">18,420/25,000</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full progress-bar-fill" style={{width: '74%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-600">Active Legs</span>
                  <span className="text-xs font-mono-val font-semibold text-slate-800">3/4</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full progress-bar-fill" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fast Start Tracker (1/3 width) -->
        <div className="bg-white rounded-large border border-slate-100 shadow-custom p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-bold text-slate-900" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Fast Start</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="10"></circle>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#4caf50" stroke-width="10" stroke-dasharray="251.2" stroke-dashoffset="75.36" className="donut-ring" stroke-linecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-mono-val text-xl font-bold text-slate-900">70%</div>
                <div className="text-xs text-slate-500">done</div>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-xs text-slate-600">3 customers enrolled</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-xs text-slate-600">500 PBV achieved</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-xs text-slate-600">1st recruit active</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-xs text-slate-400">2nd recruit active</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-xs text-slate-400">1,000 PBV in 30 days</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Expires in</span>
              <span className="font-mono-val text-xs font-bold text-rose-600">14 days</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 3: Commission Donut + Recent Activity -->
      <section className="grid grid-cols-5 gap-4" style={{maxHeight: 380}}>

        <!-- Commission Donut Chart (2/5) -->
        <div className="col-span-2 bg-white rounded-large border border-slate-100 shadow-custom p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Commission Breakdown</h2>
              <p className="text-xs text-slate-500 mt-0.5">June 2025</p>
            </div>
            <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-3-my-commissions" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Full Report
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>

          <div className="flex items-center gap-6">
            <!-- Donut -->
            <div className="relative flex-shrink-0" style={{width: 140, height: 140}}>
              <svg viewBox="0 0 140 140" className="w-full h-full" style={{transform: 'rotate(-90deg)'}}>
                <!-- Retail: 45% = 197.9 of 439.8 -->
                <circle cx="70" cy="70" r="56" fill="none" stroke="#2196f3" stroke-width="22" stroke-dasharray="197.9 241.9" stroke-dashoffset="0"></circle>
                <!-- Team: 30% = 131.9 of 439.8 -->
                <circle cx="70" cy="70" r="56" fill="none" stroke="#4caf50" stroke-width="22" stroke-dasharray="131.9 307.9" stroke-dashoffset="-197.9"></circle>
                <!-- Leadership: 15% = 65.97 -->
                <circle cx="70" cy="70" r="56" fill="none" stroke="#ffc107" stroke-width="22" stroke-dasharray="65.97 373.83" stroke-dashoffset="-329.8"></circle>
                <!-- Bonus: 10% = 43.98 -->
                <circle cx="70" cy="70" r="56" fill="none" stroke="#e91e63" stroke-width="22" stroke-dasharray="43.98 395.82" stroke-dashoffset="-395.77"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-mono-val text-lg font-bold text-slate-900">$3,847</div>
                <div className="text-xs text-slate-500">total</div>
              </div>
            </div>

            <!-- Legend -->
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span className="text-xs text-slate-600">Retail</span>
                </div>
                <div className="text-right">
                  <div className="font-mono-val text-sm font-bold text-slate-800">$1,731</div>
                  <div className="text-xs text-slate-400">45%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <span className="text-xs text-slate-600">Team</span>
                </div>
                <div className="text-right">
                  <div className="font-mono-val text-sm font-bold text-slate-800">$1,154</div>
                  <div className="text-xs text-slate-400">30%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0"></div>
                  <span className="text-xs text-slate-600">Leadership</span>
                </div>
                <div className="text-right">
                  <div className="font-mono-val text-sm font-bold text-slate-800">$577</div>
                  <div className="text-xs text-slate-400">15%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0"></div>
                  <span className="text-xs text-slate-600">Bonus</span>
                </div>
                <div className="text-right">
                  <div className="font-mono-val text-sm font-bold text-slate-800">$385</div>
                  <div className="text-xs text-slate-400">10%</div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Next Payout</span>
                  <span className="font-mono-val text-sm font-bold text-emerald-600">Jun 30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Feed (3/5) -->
        <div className="col-span-3 bg-white rounded-large border border-slate-100 shadow-custom p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest updates across your business</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium px-3 py-1.5 rounded-small bg-blue-500 text-white">All</button>
              <button className="text-xs font-medium px-3 py-1.5 rounded-small text-slate-500 hover:bg-slate-50">Sales</button>
              <button className="text-xs font-medium px-3 py-1.5 rounded-small text-slate-500 hover:bg-slate-50">Team</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0 scrollbar-thin">
            <!-- Activity Items -->
            <div className="flex items-start gap-3 py-3 border-b border-slate-50">
              <div className="activity-dot bg-emerald-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">New customer enrolled</span>
                    <span className="text-sm text-slate-500"> — Sarah Mitchell</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">2h ago</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Premium Starter Pack · <span className="font-mono-val font-semibold text-emerald-600">+$127.50</span></div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3 border-b border-slate-50">
              <div className="activity-dot bg-blue-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Commission credited</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">5h ago</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Team override bonus · <span className="font-mono-val font-semibold text-blue-600">+$342.00</span></div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3 border-b border-slate-50">
              <div className="activity-dot bg-amber-400"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Team member ranked up</span>
                    <span className="text-sm text-slate-500"> — David Chen</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">1d ago</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Promoted to Silver rank 🎉</div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3 border-b border-slate-50">
              <div className="activity-dot bg-rose-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Autoship processed</span>
                    <span className="text-sm text-slate-500"> — 12 customers</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">1d ago</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Monthly autoship cycle · <span className="font-mono-val font-semibold text-rose-600">+$891.00</span></div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3 border-b border-slate-50">
              <div className="activity-dot bg-emerald-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">New recruit joined</span>
                    <span className="text-sm text-slate-500"> — Jennifer Park</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">2d ago</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Business Builder Kit · Fast Start eligible</div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3">
              <div className="activity-dot bg-blue-400"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Rank bonus unlocked</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">3d ago</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Gold rank maintenance bonus · <span className="font-mono-val font-semibold text-blue-600">+$250.00</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 4: Quick Actions -->
      <section style={{maxHeight: 160}}>
        <div className="mb-3">
          <h2 className="font-heading text-base font-bold text-slate-900" style={{letterSpacing: 'var(--letter-spacing-heading)'}}>Quick Actions</h2>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-2-my-customers" className="quick-action-btn">
            <div className="quick-action-icon" style={{background: 'rgba(33,150,243,0.1)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Add Customer</span>
          </a>

          <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-6-share-grow" className="quick-action-btn">
            <div className="quick-action-icon" style={{background: 'rgba(76,175,80,0.1)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Share Link</span>
          </a>

          <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-3-my-commissions" className="quick-action-btn">
            <div className="quick-action-icon" style={{background: 'rgba(255,193,7,0.1)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">View Report</span>
          </a>

          <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-4-my-team" className="quick-action-btn">
            <div className="quick-action-icon" style={{background: 'rgba(233,30,99,0.1)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e63" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">My Team</span>
          </a>

          <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/1-8-help-training" className="quick-action-btn">
            <div className="quick-action-icon" style={{background: 'rgba(103,58,183,0.1)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Training</span>
          </a>

          <a href="/api/copilot/prototype/4e5b1b70-c053-4c05-a3d5-22aa413ebebb/2-9-payouts-finance" className="quick-action-btn">
            <div className="quick-action-icon" style={{background: 'rgba(20,184,166,0.1)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">Payouts</span>
          </a>
        </div>
      </section>

    </div>
  </main>
</div>







    </>
  );
};

export default 11DistributorDashboard;