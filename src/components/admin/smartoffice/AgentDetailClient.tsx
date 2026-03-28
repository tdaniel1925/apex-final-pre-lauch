'use client';

/**
 * SmartOffice Agent Detail Client
 * Detailed view of agent with policies, commissions, and raw data
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { AgentDetailData } from '@/lib/smartoffice/types';

interface AgentDetailClientProps {
  agentData: AgentDetailData;
}

export default function AgentDetailClient({ agentData }: AgentDetailClientProps) {
  const [showRawData, setShowRawData] = useState(false);
  const { agent, stats, policies, commissions } = agentData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/smartoffice/agents"
          className="p-2 hover:bg-slate-100 rounded-md"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {agent.first_name} {agent.last_name}
          </h1>
          <p className="text-slate-600">
            SmartOffice ID: {agent.smartoffice_id}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-600">Policies</p>
          <p className="text-2xl font-bold text-slate-900">{stats.policies_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-600">Total Premium</p>
          <p className="text-2xl font-bold text-slate-900">
            ${stats.total_premium.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-600">Commissions Earned</p>
          <p className="text-2xl font-bold text-slate-900">
            ${stats.total_commissions_earned.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-600">Commissions Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ${stats.commissions_paid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Agent Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-600">Name</p>
              <p className="text-sm font-medium text-slate-900">
                {agent.first_name} {agent.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="text-sm font-medium text-slate-900">{agent.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-600">Phone</p>
              <p className="text-sm font-medium text-slate-900">{agent.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-600">Apex Distributor</p>
              {agent.distributor ? (
                <Link
                  href={`/admin/distributors/${agent.apex_agent_id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {agent.distributor.first_name} {agent.distributor.last_name}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <p className="text-sm font-medium text-amber-600">Unmapped</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Policies ({policies.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Policy Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Carrier
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Annual Premium
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Issue Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No policies found
                  </td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr
                    key={policy.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => window.location.href = `/admin/smartoffice/policies/${policy.smartoffice_id}`}
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {policy.policy_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {policy.carrier_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {policy.product_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      ${(policy.annual_premium || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {policy.issue_date ? new Date(policy.issue_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Commissions ({commissions.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Policy
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Receivable
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Paid Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No commissions found
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {comm.policy_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {comm.agent_role || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      ${(comm.receivable || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      ${(comm.paid_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          comm.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {comm.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {comm.payable_due_date
                        ? new Date(comm.payable_due_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50"
        >
          <h2 className="text-lg font-semibold text-slate-900">Raw API Data</h2>
          {showRawData ? (
            <ChevronDown className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-600" />
          )}
        </button>
        {showRawData && (
          <div className="px-6 pb-6">
            <pre className="bg-slate-50 p-4 rounded-md overflow-x-auto text-xs text-slate-800">
              {JSON.stringify(agent.raw_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
