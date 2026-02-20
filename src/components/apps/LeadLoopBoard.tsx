'use client';

// =============================================
// LeadLoop — Interactive Kanban Pipeline Demo
// Drag leads across stages, click for detail
// =============================================

import { useState } from 'react';

type Stage = 'new' | 'contacted' | 'quoted' | 'proposal' | 'closed';

interface Lead {
  id: string;
  name: string;
  product: string;
  phone: string;
  email: string;
  stage: Stage;
  addedAt: string;
  notes: string;
  value: string;
}

const STAGES: {
  id: Stage;
  label: string;
  color: string;
  bg: string;
  dot: string;
}[] = [
  { id: 'new',       label: 'New',           color: 'text-gray-700',   bg: 'bg-gray-100',   dot: 'bg-gray-400'   },
  { id: 'contacted', label: 'Contacted',      color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500'   },
  { id: 'quoted',    label: 'Quoted',         color: 'text-amber-700',  bg: 'bg-amber-100',  dot: 'bg-amber-500'  },
  { id: 'proposal',  label: 'Proposal Sent',  color: 'text-purple-700', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  { id: 'closed',    label: 'Closed ✓',       color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500'  },
];

const PRODUCTS = ['Term Life', 'Whole Life', 'IUL', 'Final Expense', 'Annuity'];

const PRODUCT_COLOR: Record<string, string> = {
  'Term Life':     'bg-blue-100 text-blue-700',
  'IUL':           'bg-indigo-100 text-indigo-700',
  'Final Expense': 'bg-orange-100 text-orange-700',
  'Whole Life':    'bg-teal-100 text-teal-700',
  'Annuity':       'bg-green-100 text-green-700',
};

const INITIAL_LEADS: Lead[] = [
  { id: '1',  name: 'Marcus Johnson', product: 'Term Life',     phone: '(832) 555-0142', email: 'marcus.j@email.com',  stage: 'new',       addedAt: '2 days ago',  notes: 'Referred by Sarah K. Has 2 kids, wants $500K coverage.',          value: '$85/mo'  },
  { id: '2',  name: 'Linda Park',     product: 'IUL',           phone: '(713) 555-0261', email: 'lpark@email.com',     stage: 'new',       addedAt: 'Today',       notes: 'Business owner, high income. Interested in tax-free retirement.', value: '$320/mo' },
  { id: '3',  name: 'David Reyes',    product: 'Final Expense', phone: '(281) 555-0399', email: 'd.reyes@email.com',   stage: 'contacted', addedAt: '5 days ago',  notes: 'Very interested. Left voicemail. Call back Friday AM.',           value: '$65/mo'  },
  { id: '4',  name: 'Angela White',   product: 'Term Life',     phone: '(832) 555-0477', email: 'angelaw@email.com',   stage: 'contacted', addedAt: '1 week ago',  notes: 'Has employer coverage. Wants supplemental for family.',           value: '$120/mo' },
  { id: '5',  name: 'Robert Chen',    product: 'Annuity',       phone: '(713) 555-0521', email: 'rchen@email.com',     stage: 'quoted',    addedAt: '3 days ago',  notes: 'Retiring in 2 years. $200K to roll over. Very motivated.',        value: '$450/mo' },
  { id: '6',  name: 'Tanya Brown',    product: 'Whole Life',    phone: '(281) 555-0614', email: 'tanya.b@email.com',   stage: 'quoted',    addedAt: '1 week ago',  notes: 'Likes whole life concept. Needs spouse on next call.',           value: '$195/mo' },
  { id: '7',  name: 'James Carter',   product: 'IUL',           phone: '(832) 555-0732', email: 'jcarter@email.com',   stage: 'proposal',  addedAt: 'Yesterday',   notes: 'Ready to sign. DocuSign going out Monday.',                      value: '$380/mo' },
  { id: '8',  name: 'Maria Santos',   product: 'Term Life',     phone: '(713) 555-0889', email: 'msantos@email.com',   stage: 'proposal',  addedAt: '5 days ago',  notes: 'Waiting on medical records. Follow up Thursday.',                value: '$95/mo'  },
  { id: '9',  name: 'Kevin Mills',    product: 'Final Expense', phone: '(281) 555-0943', email: 'kmills@email.com',    stage: 'closed',    addedAt: '2 weeks ago', notes: 'Closed $75/mo FE policy. Referral ask due Day 14.',              value: '$75/mo'  },
  { id: '10', name: 'Sandra Torres',  product: 'Annuity',       phone: '(832) 555-0107', email: 's.torres@email.com',  stage: 'closed',    addedAt: '3 weeks ago', notes: 'Closed $180K rollover. Excellent referral source.',              value: 'Lump sum'},
];

const EMPTY_FORM = { name: '', phone: '', email: '', product: 'Term Life', stage: 'new' as Stage, notes: '', value: '' };

export default function LeadLoopBoard() {
  const [leads, setLeads]           = useState<Lead[]>(INITIAL_LEADS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [selected, setSelected]     = useState<Lead | null>(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);

  // ── Drag & Drop ────────────────────────────────
  const onDragStart = (id: string) => setDraggingId(id);

  const onDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const onDragLeave = () => setDragOverStage(null);

  const onDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (draggingId) {
      setLeads(prev => prev.map(l => l.id === draggingId ? { ...l, stage } : l));
      setSelected(prev => prev?.id === draggingId ? { ...prev, stage } : prev);
    }
    setDraggingId(null);
    setDragOverStage(null);
  };

  // ── Actions ────────────────────────────────────
  const moveLead = (id: string, stage: Stage) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    setSelected(prev => prev?.id === id ? { ...prev, stage } : prev);
  };

  const saveNotes = (id: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
    setSelected(prev => prev?.id === id ? { ...prev, notes } : prev);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelected(null);
  };

  const addLead = () => {
    if (!form.name.trim()) return;
    const lead: Lead = { id: Date.now().toString(), ...form, name: form.name.trim(), addedAt: 'Just now' };
    setLeads(prev => [...prev, lead]);
    setAddOpen(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ── Page Header ──────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#2B4C7E' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">LeadLoop Pipeline</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Demo</span>
            </div>
            <p className="text-xs text-gray-500">{leads.length} leads · drag cards to move stages</p>
          </div>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#2B4C7E' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {/* ── Kanban Board ─────────────────────────── */}
      <div className="overflow-x-auto p-4">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.id);
            const isOver     = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex flex-col w-60 rounded-xl border-2 transition-colors ${
                  isOver ? 'border-blue-400 bg-blue-50/60' : 'border-transparent'
                }`}
                onDragOver={e => onDragOver(e, stage.id)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, stage.id)}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${stage.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.dot}`}></span>
                    <span className={`text-sm font-bold ${stage.color}`}>{stage.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 min-h-[120px]">
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => onDragStart(lead.id)}
                      onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
                      onClick={() => setSelected(lead)}
                      className={`bg-white rounded-lg border p-3 cursor-pointer select-none transition-all hover:shadow-md ${
                        draggingId === lead.id ? 'opacity-40 shadow-lg' : ''
                      } ${selected?.id === lead.id ? 'ring-2 ring-[#2B4C7E] border-transparent' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{lead.name}</p>
                        {/* Drag handle dots */}
                        <div className="flex flex-col gap-0.5 shrink-0 mt-0.5 opacity-30">
                          <div className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                          </div>
                          <div className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                          </div>
                          <div className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${PRODUCT_COLOR[lead.product] ?? 'bg-gray-100 text-gray-700'}`}>
                        {lead.product}
                      </span>
                      {lead.value && (
                        <p className="text-xs font-bold text-gray-700">{lead.value}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{lead.addedAt}</p>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}>
                      <p className="text-xs text-gray-400">Drop leads here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col overflow-y-auto">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold text-gray-900 truncate">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 px-5 py-4 space-y-5">

              {/* Product */}
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${PRODUCT_COLOR[selected.product] ?? 'bg-gray-100 text-gray-700'}`}>
                {selected.product}
              </span>

              {/* Stage selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stage</label>
                <select
                  value={selected.stage}
                  onChange={e => moveLead(selected.id, e.target.value as Stage)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</label>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${selected.phone}`} className="hover:text-[#2B4C7E]">{selected.phone}</a>
                  </div>
                )}
                {selected.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${selected.email}`} className="hover:text-[#2B4C7E] truncate">{selected.email}</a>
                  </div>
                )}
              </div>

              {/* Est. Premium */}
              {selected.value && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Est. Premium</label>
                  <p className="text-sm font-bold text-gray-900">{selected.value}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                <textarea
                  value={selected.notes}
                  onChange={e => saveNotes(selected.id, e.target.value)}
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  placeholder="Add notes..."
                />
              </div>

              <p className="text-xs text-gray-400">Added {selected.addedAt}</p>
            </div>

            {/* Delete */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => deleteLead(selected.id)}
                className="w-full py-2 rounded-lg border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Remove Lead
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Add Lead Modal ───────────────────────── */}
      {addOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setAddOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-40 p-6 mx-4">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add New Lead</h2>
              <button onClick={() => setAddOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(555) 000-0000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jane@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Product</label>
                  <select
                    value={form.product}
                    onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Initial Stage</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm(f => ({ ...f, stage: e.target.value as Stage }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Quick notes about this lead..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAddOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addLead}
                disabled={!form.name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40"
                style={{ background: '#2B4C7E' }}
              >
                Add Lead
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
