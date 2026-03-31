'use client';

// =============================================
// Leads Table Component
// Displays leads in a table format
// =============================================

import Link from 'next/link';
import { Mail, Phone, Tag } from 'lucide-react';

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  interest_level: string | null;
  tags: string[] | null;
  created_at: string;
};

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'unqualified':
        return 'bg-slate-100 text-slate-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getInterestColor = (level: string): string => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Contact</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Company</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Interest</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Source</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4">
                <Link href={`/dashboard/crm/leads/${lead.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                  {lead.first_name} {lead.last_name}
                </Link>
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{lead.tags[0]}</span>
                    {lead.tags.length > 1 && (
                      <span className="text-xs text-slate-400">+{lead.tags.length - 1}</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{lead.company || '—'}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {lead.interest_level ? (
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getInterestColor(lead.interest_level)}`}>
                    {lead.interest_level}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                {lead.source?.replace('_', ' ') || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
