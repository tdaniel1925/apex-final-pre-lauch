// =============================================
// Admin Edit Event Page
// Edit existing company events
// =============================================

import EventForm from '@/components/admin/EventForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Event - Admin - Apex Affinity Group',
  description: 'Edit company event',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the event
  const { data: event, error } = await supabase
    .from('company_events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
          <p className="text-slate-600 mt-1">{event.event_name}</p>
        </div>

        {/* Event Form */}
        <EventForm event={event} />
      </div>
    </div>
  );
}
