// =============================================
// Admin New Event Page
// Create new company events
// =============================================

import EventForm from '@/components/admin/EventForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'New Event - Admin - Apex Affinity Group',
  description: 'Create new company event',
};

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
          <p className="text-slate-600 mt-1">
            Set up a company-wide event that distributors can invite prospects to
          </p>
        </div>

        {/* Event Form */}
        <EventForm />
      </div>
    </div>
  );
}
