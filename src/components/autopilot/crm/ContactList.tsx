'use client';

// =============================================
// CRM Contact List Component
// Displays contacts with search, filters, sorting
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  lead_status: string;
  lead_score: number;
  tags: string[];
  created_at: string;
  last_contact_date: string | null;
}

interface ContactListProps {
  initialContacts: Contact[];
  total: number;
}

export default function ContactList({ initialContacts, total }: ContactListProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (leadStatus) params.set('lead_status', leadStatus);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);

      const response = await fetch(`/api/autopilot/crm/contacts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, leadStatus, sortBy, sortOrder]);

  // Get lead score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Get lead score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-green-100 text-green-800',
      unqualified: 'bg-gray-100 text-gray-800',
      nurturing: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={leadStatus}
            onChange={(e) => setLeadStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="nurturing">Nurturing</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Date Added</option>
            <option value="lead_score">Lead Score</option>
            <option value="last_contact_date">Last Contact</option>
            <option value="first_name">Name</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {total} contact{total !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-gray-500">Loading contacts...</div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="p-8 text-center text-gray-500">No contacts found</div>
        )}

        {!loading && contacts.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </div>
                      {contact.email && (
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      )}
                      {contact.phone && (
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.company || '-'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        contact.lead_status
                      )}`}
                    >
                      {contact.lead_status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{contact.lead_score}</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getScoreColor(
                          contact.lead_score
                        )}`}
                      >
                        {getScoreLabel(contact.lead_score)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {contact.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{contact.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => router.push(`/autopilot/crm/contacts/${contact.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
