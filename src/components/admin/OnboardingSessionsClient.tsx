'use client';

import { useState } from 'react';
import { STAGE_LABELS } from '@/lib/types/fulfillment';
import OrderDetailsModal from './OrderDetailsModal';
import OnboardingKanban from './OnboardingKanban';

interface ProductPurchased {
  product_name: string;
  price?: number;
}

interface Session {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  products_purchased: ProductPurchased[];
  status: string;
  fulfillment_stage: string;
  calendar_event_id?: string;
  rep?: {
    first_name: string;
    last_name: string;
  };
}

interface OnboardingSessionsClientProps {
  upcomingSessions: Session[];
  completedSessions: Session[];
  currentUserId: string;
}

type ViewMode = 'table' | 'kanban';

export default function OnboardingSessionsClient({
  upcomingSessions,
  completedSessions,
  currentUserId,
}: OnboardingSessionsClientProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<ViewMode>('table');

  const handleStageUpdate = async (sessionId: string, newStage: string) => {
    const response = await fetch('/api/admin/onboarding-sessions/update-stage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, fulfillment_stage: newStage }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update stage');
    }

    // Refresh the page to show updated data
    window.location.reload();
  };

  // All sessions for Kanban view
  const allSessions = [...upcomingSessions, ...completedSessions];

  return (
    <>
      {/* View Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-700 font-medium">View:</span>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setView('table')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                view === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Table
            </div>
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                view === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </div>
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <OnboardingKanban sessions={allSessions} currentUserId={currentUserId} />
      )}

      {/* Table View */}
      {view === 'table' && (
        <>
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No upcoming sessions scheduled</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Products
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingSessions.map((session) => {
                  const dateObj = new Date(session.scheduled_date + 'T' + session.scheduled_time);
                  const products = session.products_purchased || [];

                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {dateObj.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dateObj.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: 'America/Chicago',
                          })}{' '}
                          CT
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {session.customer_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{session.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {session.rep && (
                          <div className="text-sm text-gray-900">
                            {session.rep.first_name} {session.rep.last_name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(products) && products.length > 0
                            ? products.map((p) => p.product_name).join(', ')
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {STAGE_LABELS[session.fulfillment_stage as keyof typeof STAGE_LABELS] ||
                            session.fulfillment_stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Completed Sessions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedSessions.slice(0, 10).map((session) => {
                  const dateObj = new Date(session.scheduled_date + 'T' + session.scheduled_time);

                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {dateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{session.customer_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {session.rep && `${session.rep.first_name} ${session.rep.last_name}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {STAGE_LABELS[session.fulfillment_stage as keyof typeof STAGE_LABELS] ||
                            session.fulfillment_stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedSession && (
        <OrderDetailsModal
          session={{
            id: selectedSession.id,
            distributor_id: '', // Will be populated from order data
            distributor_name: selectedSession.customer_name,
            distributor_email: selectedSession.customer_email,
            product_name:
              selectedSession.products_purchased?.map((p) => p.product_name).join(', ') || 'N/A',
            amount_paid:
              selectedSession.products_purchased?.reduce((sum, p) => sum + (p.price || 0), 0) ||
              0,
            payment_date: selectedSession.scheduled_date,
            fulfillment_stage: selectedSession.fulfillment_stage,
            onboarding_date: selectedSession.scheduled_date,
            onboarding_time: selectedSession.scheduled_time,
            calendar_event_id: selectedSession.calendar_event_id,
          }}
          currentUserId={currentUserId}
          onClose={() => setSelectedSession(null)}
          onStageUpdate={handleStageUpdate}
        />
      )}
    </>
  );
}
